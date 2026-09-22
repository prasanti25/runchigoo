import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";

const base = "http://127.0.0.1:5173";
const marker = `dashboard-qa-${randomUUID()}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  passed = [];
let admin, customer, courier, kitchen, createdUser, order, original, cartItemId;
async function api(path, { token, method = "GET", body, expected } = {}) {
  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.ok(
    response.status === 204 ||
      response.headers.get("content-type")?.includes("json"),
    `${path} non-JSON ${response.status}`,
  );
  const data = response.status === 204 ? null : await response.json();
  assert.equal(
    response.status,
    expected ||
      (method === "POST" && ["/cart/checkout/", "/cart/items/", "/users/"].includes(path)
        ? 201
        : 200),
    `${path}: ${JSON.stringify(data)}`,
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
    acceptDownloads: true,
  });
  context.setDefaultTimeout(20000);
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
async function responsive(page, name) {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `Overflow ${name} at ${width}`,
    );
    await page.screenshot({
      path: `/private/tmp/ruchigo-${name}-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
}
try {
  admin = await session("preview.admin@ruchigo.test", "admin");
  customer = await session("preview.customer@ruchigo.test", "customer");
  courier = await session("preview.delivery@ruchigo.test", "delivery");
  kitchen = await session("owner.spice@ruchigo.online", "restaurant");
  original = await api("/orders/16/", { token: admin.token });
  const page = admin.page;
  await page.goto(`${base}/admin-users`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add account", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "Add account", exact: true });
  await modal.getByLabel("First name", { exact: true }).fill("Dashboard QA");
  await modal
    .getByLabel("Email", { exact: true })
    .fill(`${marker}@example.test`);
  await modal
    .getByLabel("Initial password", { exact: true })
    .fill("OnlyTest-74195-password");
  await modal
    .getByLabel("Reason for this change", { exact: true })
    .fill("Explicit temporary local dashboard verification");
  const createdResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/users/") &&
      response.request().method() === "POST",
  );
  await modal
    .getByRole("button", { name: "Save account", exact: true })
    .click();
  createdUser = await (await createdResponse).json();
  assert.ok(createdUser.id);
  await expect(modal).toHaveCount(0);
  await page.getByLabel("Search accounts", { exact: true }).fill(marker);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".people-table tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "Edit details", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("First name", { exact: true })
    .fill("Dashboard QA edited");
  await page
    .getByRole("dialog")
    .getByLabel("Reason for this change")
    .fill("Verify persisted edit");
  await page.getByRole("button", { name: "Save account", exact: true }).click();
  await expect(page.locator(".people-table")).toContainText(
    "Dashboard QA edited",
  );
  await page.getByRole("button", { name: "Block access", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Reason", { exact: true })
    .fill("Verify block on fixture account only");
  await page
    .getByRole("button", { name: "Confirm block", exact: true })
    .click();
  await expect(page.locator(".people-table")).toContainText("Inactive");
  await page
    .getByRole("button", { name: "Restore access", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Reason", { exact: true })
    .fill("Verification completed");
  await page
    .getByRole("button", { name: "Confirm restore", exact: true })
    .click();
  await expect(page.locator(".people-table")).toContainText("Active");
  await responsive(page, "people-dashboard");
  passed.push(
    "People search, account creation/edit, block/restore and responsive workspace",
  );
  const audit = await api(`/audit-logs/?search=${createdUser.id}`, {
    token: admin.token,
  });
  assert.ok(
    audit.results.some(
      (row) =>
        row.action === "account.blocked" &&
        row.target === String(createdUser.id),
    ),
  );

  for (const [actor, route] of [
    [admin, "/admin-reports"],
    [kitchen, "/restaurant-analytics"],
  ]) {
    await actor.page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    await actor.page
      .getByRole("button", { name: "Today", exact: true })
      .click();
    await expect(actor.page.locator(".report-trend")).toBeVisible();
    await actor.page
      .getByRole("button", { name: "7 days", exact: true })
      .click();
    await expect(actor.page.locator(".report-bars > div")).toHaveCount(7);
    const downloaded = actor.page.waitForEvent("download");
    await actor.page
      .getByRole("button", { name: "Export daily CSV", exact: true })
      .click();
    const file = await downloaded;
    const csv = await readFile(await file.path(), "utf8");
    assert.equal(csv.split("\r\n").length, 8);
    assert.ok(csv.startsWith("Date,Placed orders"));
    await responsive(
      actor.page,
      actor === admin ? "admin-analytics" : "restaurant-analytics",
    );
  }
  passed.push(
    "Admin and restaurant date-range reports, chart, CSV export and 320/390/1440 layouts",
  );

  const cart = await api("/cart/", { token: customer.token });
  assert.equal(cart.items.length, 0, "Do not replace a user cart");
  const menu = await api("/menu-items/?search=Royal%20Veg%20Thali");
  const item = menu.results.find(
    (row) =>
      row.orderable !== false &&
      !row.option_groups?.some((group) => group.min_select > 0),
  );
  assert.ok(item);
  const addresses = await api("/addresses/", { token: customer.token });
  const address = addresses.results.find(
    (row) => row.city.toLowerCase() === "delhi",
  );
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
  order = await api("/cart/checkout/", {
    token: customer.token,
    method: "POST",
    body: {
      address_id: address.id,
      payment_method: "cod",
      checkout_key: randomUUID(),
      quote_token: quote.quote_token,
      notes: `[Local dashboard/chat QA ${marker}]`,
    },
  });
  cartItemId = null;
  for (const status of ["confirmed", "preparing", "ready"])
    await api(`/orders/${order.id}/status/`, {
      token: kitchen.token,
      method: "POST",
      body: { status },
    });
  await api(`/orders/${order.id}/accept/`, {
    token: courier.token,
    method: "POST",
  });
  await customer.page.goto(`${base}/tracking/${order.id}?chat=1`, {
    waitUntil: "networkidle",
  });
  const customerLog = customer.page.getByRole("log", {
    name: "Delivery messages",
  });
  await customer.page
    .getByLabel("Delivery message", { exact: true })
    .fill("Please meet at the marked main gate. Local QA.");
  await customer.page
    .getByRole("button", { name: "Send delivery message" })
    .click();
  await expect(customerLog).toContainText("marked main gate");
  await courier.page.goto(
    `${base}/delivery-navigation?order=${order.id}&chat=1`,
    { waitUntil: "networkidle" },
  );
  const courierLog = courier.page.getByRole("log", {
    name: "Delivery messages",
  });
  await expect(courierLog).toContainText("marked main gate");
  await courier.page
    .getByLabel("Delivery message", { exact: true })
    .fill("Confirmed. I will meet you at the gate. Local QA.");
  await courier.page
    .getByRole("button", { name: "Send delivery message" })
    .click();
  await expect(customerLog).toContainText("Confirmed. I will meet you", {
    timeout: 15000,
  });
  await expect(customerLog).toContainText("Read", { timeout: 15000 });
  await responsive(customer.page, "customer-rider-chat");
  await responsive(courier.page, "rider-customer-chat");
  await customer.page.reload({ waitUntil: "networkidle" });
  await expect(customerLog).toContainText("marked main gate");
  await api(`/orders/${order.id}/pickup/`, {
    token: courier.token,
    method: "POST",
  });
  const owned = await api(`/orders/${order.id}/`, { token: customer.token });
  await api(`/orders/${order.id}/status/`, {
    token: courier.token,
    method: "POST",
    body: { status: "delivered", delivery_code: owned.delivery_code },
  });
  await expect(customer.page.locator(".delivery-chat-closed")).toContainText(
    "read-only",
    { timeout: 15000 },
  );
  await expect(customerLog).toContainText("marked main gate");
  passed.push(
    `Real persisted customer/courier exchange, notifications/read receipts, reload and terminal read-only history (fixture ${order.id})`,
  );
  const unchanged = await api("/orders/16/", { token: admin.token });
  assert.equal(unchanged.status, original.status);
  assert.deepEqual(unchanged.events, original.events);
  assert.deepEqual(unchanged.delivery, original.delivery);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        passed,
        browserErrors: errors,
        fixtureOrder: order.id,
        userOrder16Unchanged: true,
      },
      null,
      2,
    ),
  );
} finally {
  if (cartItemId && customer?.token) {
    const cart = await api("/cart/", { token: customer.token });
    if (cart.items.length === 1 && cart.items[0].id === cartItemId && cart.items[0].quantity === 1) {
      await api(`/cart/items/${cartItemId}/`, { token: customer.token, method: "DELETE" });
    }
  }
  if (createdUser?.id && createdUser.email === `${marker}@example.test`) {
    const target = await api(`/users/${createdUser.id}/`, {
      token: admin.token,
    });
    assert.equal(target.email, `${marker}@example.test`);
    await api(`/users/${createdUser.id}/`, {
      token: admin.token,
      method: "DELETE",
      expected: 204,
    });
    console.log(
      "Removed only the temporary QA account; account audit entries retained.",
    );
  }
  await browser.close();
}
