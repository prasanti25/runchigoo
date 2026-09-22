import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";

// Local preview only: create two clearly marked COD fixtures; never transition
// pre-existing orders, submit online payments/refunds or change platform policy.
const base = "http://127.0.0.1:5173";
const marker = `[Local cancellation QA ${randomUUID()}]`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  passed = [],
  createdOrders = [];
let customer, kitchen, cartItemId;
async function api(path, { token, method = "GET", body, status } = {}) {
  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.ok(
    response.headers.get("content-type")?.includes("json") ||
      response.status === 204,
    `${path}: Expected API JSON (${response.status})`,
  );
  const data = response.status === 204 ? null : await response.json();
  if (status)
    assert.equal(response.status, status, `${path}: ${JSON.stringify(data)}`);
  else
    assert.ok(
      response.ok,
      `${path}: ${response.status} ${JSON.stringify(data)}`,
    );
  return data;
}
async function session(email, role) {
  const auth = await api("/auth/login/", {
    method: "POST",
    body: { email, role, password: "RuchiGo-preview-2026" },
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await context.addInitScript(
    ({ user, tokens }) =>
      localStorage.setItem(
        "ruchigo-auth",
        JSON.stringify({
          user,
          role: user.role,
          token: tokens.access,
          refreshToken: tokens.refresh,
          expiresAt: Date.now() + 600000,
        }),
      ),
    auth,
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  return { page, token: auth.tokens.access };
}
async function noOverflow(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    `Overflow: ${page.url()}`,
  );
}
async function createFixture() {
  const cart = await api("/cart/", { token: customer.token });
  assert.equal(
    cart.items.length,
    0,
    "Refusing to change an existing cart; run local suites sequentially",
  );
  const menu = await api("/menu-items/?search=Royal%20Veg%20Thali");
  const item = menu.results.find(
    (row) =>
      row.orderable !== false &&
      !row.option_groups?.some((group) => group.min_select > 0),
  );
  assert.ok(
    item,
    "Expected an orderable fixture dish without required options",
  );
  const addresses = await api("/addresses/", { token: customer.token });
  const address = addresses.results.find(
    (row) => row.city.toLowerCase() === "delhi",
  );
  assert.ok(address, "Use the existing local Delhi fixture address");
  const added = await api("/cart/items/", {
    token: customer.token,
    method: "POST",
    body: { menu_item: item.id, quantity: 1 },
  });
  cartItemId = added.items[0].id;
  const quote = await api("/cart/quote/", {
    token: customer.token,
    method: "POST",
    body: { address_id: address.id },
  });
  const order = await api("/cart/checkout/", {
    token: customer.token,
    method: "POST",
    body: {
      address_id: address.id,
      payment_method: "cod",
      checkout_key: randomUUID(),
      quote_token: quote.quote_token,
      notes: marker,
    },
  });
  createdOrders.push(order.id);
  cartItemId = null;
  assert.notEqual(order.id, 16);
  assert.equal(order.status, "pending");
  return order;
}
try {
  customer = await session("preview.customer@ruchigo.test", "customer");
  kitchen = await session("owner.spice@ruchigo.online", "restaurant");
  const admin = await session("preview.admin@ruchigo.test", "admin");
  const originalPolicy = await api("/cancellation-policy/", {
    token: admin.token,
  });
  const originalOrder = await api("/orders/16/", { token: admin.token });
  const first = await createFixture();
  const { page } = customer;
  await page.goto(`${base}/orders`, { waitUntil: "networkidle" });
  const card = page
    .locator(".order-card")
    .filter({ hasText: first.number.slice(0, 8).toUpperCase() });
  await card.getByRole("button", { name: "Cancel order", exact: true }).click();
  let dialog = page.getByRole("dialog", { name: "Cancel this order?" });
  await expect(
    dialog.getByRole("button", { name: "Confirm cancellation" }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Keep my order" }).click();
  assert.equal(
    (await api(`/orders/${first.id}/`, { token: customer.token })).status,
    "pending",
  );
  passed.push(
    "Order-history cancellation opens confirmation; Keep my order makes no write",
  );

  await page.goto(`${base}/tracking/${first.id}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Cancel order", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "Cancel this order?" });
  await dialog
    .getByRole("radio", { name: "I selected the wrong address" })
    .check();
  await dialog
    .getByRole("textbox")
    .fill(`${marker} Confirmation and reason test`);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    await page.screenshot({
      path: `/private/tmp/ruchigo-cancel-confirm-${width}.png`,
    });
  }
  const cancelledResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/orders/${first.id}/cancel/`) &&
      response.request().method() === "POST",
  );
  await dialog.getByRole("button", { name: "Confirm cancellation" }).click();
  assert.equal((await cancelledResponse).status(), 200);
  await expect(dialog).toHaveCount(0);
  const cancelled = await api(`/orders/${first.id}/`, {
    token: customer.token,
  });
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.payment.status, "failed");
  await api(`/orders/${first.id}/cancel/`, {
    token: customer.token,
    method: "POST",
    status: 400,
  });
  assert.equal(
    (
      await api(`/orders/${first.id}/`, { token: customer.token })
    ).events.filter((row) => row.status === "cancelled").length,
    1,
  );
  for (const actor of [customer, kitchen]) {
    const inbox = await api("/notifications/", { token: actor.token });
    assert.ok(
      inbox.results.some(
        (row) =>
          row.metadata?.order_id === first.id &&
          row.metadata?.status === "cancelled",
      ),
    );
  }
  passed.push(
    "Tracking cancellation persists once with customer/kitchen notifications; repeat rejected",
  );

  const second = await createFixture();
  await page.goto(`${base}/tracking/${second.id}`, {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Cancel order", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "Cancel this order?" });
  await dialog.getByRole("radio", { name: "I changed my mind" }).check();
  await expect(
    dialog.getByRole("button", { name: "Confirm cancellation" }),
  ).toBeEnabled();
  for (const status of ["confirmed", "preparing"])
    await api(`/orders/${second.id}/status/`, {
      token: kitchen.token,
      method: "POST",
      body: { status },
    });
  await expect(
    dialog.getByRole("button", { name: "Confirm cancellation" }),
  ).toBeDisabled({ timeout: 15000 });
  await expect(dialog).toContainText("already being prepared");
  await api(`/orders/${second.id}/cancel/`, {
    token: customer.token,
    method: "POST",
    status: 400,
  });
  await dialog.getByRole("button", { name: "Keep my order" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Cancellation unavailable",
      exact: true,
    }),
  ).toBeVisible({ timeout: 15000 });
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    await page.locator(".order-cancellation-card").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `/private/tmp/ruchigo-cancel-blocked-${width}.png`,
    });
  }
  await page
    .locator(".order-cancellation-card")
    .getByRole("link", { name: "Get help" })
    .click();
  await expect(page).toHaveURL(new RegExp(`/support\\?order=${second.id}$`));
  passed.push(
    "Kitchen transition disables an already-open cancellation modal; stale API blocked; order-linked help",
  );

  await admin.page.goto(`${base}/admin-orders`, { waitUntil: "networkidle" });
  const preparingCard = admin.page.getByRole("article", {
    name: `Order ${second.number.slice(0, 8).toUpperCase()}`,
    exact: true,
  });
  await expect(
    preparingCard.getByRole("button", {
      name: "Mark ready for pickup",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    preparingCard.getByRole("button", { name: "Accept order", exact: true }),
  ).toHaveCount(0);
  await expect(
    preparingCard.getByRole("button", {
      name: "Start preparation",
      exact: true,
    }),
  ).toHaveCount(0);
  const cancelledCard = admin.page.getByRole("article", {
    name: `Order ${first.number.slice(0, 8).toUpperCase()}`,
    exact: true,
  });
  await expect(cancelledCard.getByRole("button")).toHaveCount(0);
  await api(`/orders/${second.id}/status/`, {
    token: admin.token,
    method: "POST",
    body: { status: "pending" },
    status: 400,
  });
  passed.push(
    "Admin cannot select backwards progress or reopen a cancelled order",
  );

  await admin.page.goto(`${base}/admin-order-policy`, {
    waitUntil: "networkidle",
  });
  await expect(
    admin.page.getByRole("heading", { name: "When can a customer cancel?" }),
  ).toBeVisible();
  for (const width of [320, 1440]) {
    await admin.page.setViewportSize({ width, height: 1000 });
    await noOverflow(admin.page);
  }
  assert.deepEqual(
    await api("/cancellation-policy/", { token: admin.token }),
    originalPolicy,
  );
  const preserved = await api("/orders/16/", { token: admin.token });
  assert.equal(preserved.status, originalOrder.status);
  assert.deepEqual(preserved.delivery, originalOrder.delivery);
  assert.equal(preserved.updated_at, originalOrder.updated_at);
  assert.deepEqual(errors, []);
  passed.push(
    "Responsive policy view, no setting changes, user order 16 unchanged; zero browser errors",
  );
  console.log(
    JSON.stringify({ passed, fixtureOrders: createdOrders }, null, 2),
  );
} finally {
  try {
    for (const id of createdOrders) {
      const order = await api(`/orders/${id}/`, { token: customer.token });
      assert.equal(
        order.notes,
        marker,
        "Refusing to change an unrelated order",
      );
      if (["pending", "confirmed", "preparing"].includes(order.status))
        await api(`/orders/${id}/status/`, {
          token: kitchen.token,
          method: "POST",
          body: { status: "cancelled" },
        });
    }
    if (cartItemId)
      await api(`/cart/items/${cartItemId}/`, {
        token: customer.token,
        method: "DELETE",
      });
  } finally {
    await browser.close();
  }
}
