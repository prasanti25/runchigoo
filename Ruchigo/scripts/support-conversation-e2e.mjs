import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";
const base = "http://127.0.0.1:5173";
const marker = `[Local conversation QA ${randomUUID()}]`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  passed = [];
let customer, admin, order, cartId;
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
    `Expected JSON ${path}: ${response.status}`,
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
  page.on("pageerror", (err) => errors.push(err.message));
  return { page, token: auth.tokens.access };
}
async function screenshot(page, label) {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `Overflow ${page.url()}`,
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `/private/tmp/ruchigo-${label}-${width}.png`,
      fullPage: true,
    });
  }
}
try {
  customer = await session("preview.customer@ruchigo.test", "customer");
  admin = await session("preview.admin@ruchigo.test", "admin");
  const kitchen = await session("owner.spice@ruchigo.online", "restaurant");
  const original = await api("/orders/16/", { token: admin.token });
  const cart = await api("/cart/", { token: customer.token });
  assert.equal(cart.items.length, 0, "Refusing to alter an existing cart");
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
  assert.ok(address);
  const added = await api("/cart/items/", {
    token: customer.token,
    method: "POST",
    body: { menu_item: item.id, quantity: 1 },
  });
  cartId = added.items[0].id;
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
      notes: marker,
    },
  });
  cartId = null;
  const ticket = await api("/support/", {
    token: customer.token,
    method: "POST",
    body: {
      order: order.id,
      category: "food_quality",
      subject: marker,
      message: "hi",
    },
  });
  const { page } = customer;
  await page.goto(`${base}/support?ticket=${ticket.id}`, {
    waitUntil: "networkidle",
  });
  const thread = page.getByRole("region", {
    name: "Support conversation",
    exact: true,
  });
  const log = thread.getByRole("log", { name: "Conversation messages" });
  await expect(log).toContainText("Hi! I’m here to help", { timeout: 15000 });
  await expect(page.locator(".food-assistant")).toHaveCount(0);
  await page.route("**/api/v1/support/*/quick-help/", async (route) => {
    const response = await route.fetch();
    await new Promise((resolve) => setTimeout(resolve, 600));
    await route.fulfill({ response });
  });
  await thread
    .getByRole("button", { name: "Where is my order?", exact: true })
    .click();
  await expect(thread.locator(".support-typing")).toBeVisible();
  await expect(log).toContainText("hasn’t accepted", { timeout: 15000 });
  await expect(thread.locator(".support-typing")).toHaveCount(0);
  await page.unroute("**/api/v1/support/*/quick-help/");
  await thread
    .getByLabel("Your reply", { exact: true })
    .fill("The food is spoiled");
  await thread.getByRole("button", { name: "Send reply", exact: true }).click();
  await expect(log).toContainText("Has the food actually reached you?", {
    timeout: 15000,
  });
  for (const status of ["confirmed", "preparing"])
    await api(`/orders/${order.id}/status/`, {
      token: kitchen.token,
      method: "POST",
      body: { status },
    });
  await expect(
    thread.getByRole("button", {
      name: "Can I cancel this order?",
      exact: true,
    }),
  ).toHaveCount(0, { timeout: 10000 });
  await thread
    .getByLabel("Your reply", { exact: true })
    .fill("Can I cancel my order?");
  await thread.getByRole("button", { name: "Send reply", exact: true }).click();
  await expect(log).toContainText("already being prepared", { timeout: 15000 });
  assert.equal(
    (await api(`/orders/${order.id}/`, { token: customer.token })).status,
    "preparing",
  );
  await screenshot(page, "working-support");
  await page.reload({ waitUntil: "networkidle" });
  await expect(log).toContainText("already being prepared");
  passed.push(
    "One persisted support thread: greeting, real-request typing, actual order status, pre-delivery complaint clarification and cooking cancellation refusal",
  );

  await thread
    .getByRole("button", { name: "Talk to the team", exact: true })
    .click();
  await expect(log).toContainText("conversation is in the support queue");
  await thread
    .getByRole("button", { name: "Check payment or refund", exact: true })
    .click();
  await expect(log).toContainText("no confirmed payment");
  assert.ok(
    (await api(`/support/${ticket.id}/`, { token: customer.token }))
      .staff_requested_at,
  );
  await admin.page.goto(`${base}/support?ticket=${ticket.id}`, {
    waitUntil: "networkidle",
  });
  const adminThread = admin.page.getByRole("region", {
    name: "Support conversation",
    exact: true,
  });
  await expect(adminThread).toContainText("You’re replying as support");
  await expect(
    adminThread.getByRole("group", { name: "Quick order help" }),
  ).toHaveCount(0);
  await adminThread
    .getByLabel("Your reply", { exact: true })
    .fill(`${marker} Team reply persistence check.`);
  await adminThread
    .getByRole("button", { name: "Send reply", exact: true })
    .click();
  await expect(adminThread.getByRole("log")).toContainText(
    "Team reply persistence check",
  );
  await expect(log).toContainText("Team reply persistence check", {
    timeout: 10000,
  });
  await adminThread
    .getByRole("button", { name: "Mark resolved", exact: true })
    .click();
  await page.reload({ waitUntil: "networkidle" });
  const feedback = thread.getByRole("form", {
    name: "Rate support conversation",
  });
  await feedback.getByRole("button", { name: "Happy", exact: true }).click();
  await feedback
    .getByRole("button", { name: "Send feedback", exact: true })
    .click();
  await expect(feedback).toContainText("Thanks for telling us how we did");
  await screenshot(page, "working-support-feedback");
  passed.push(
    "Explicit team handoff pauses automatic replies but permits factual button checks; staff reply appears without refresh, resolution and persisted face feedback work",
  );

  await kitchen.page.goto(`${base}/restaurant-orders`, {
    waitUntil: "networkidle",
  });
  await kitchen.page
    .getByRole("button", { name: "In the kitchen", exact: true })
    .click();
  const card = kitchen.page
    .locator(".order-card")
    .filter({ hasText: order.number.slice(0, 8).toUpperCase() });
  await card.getByRole("button", { name: "Report a fulfilment issue" }).click();
  const issueDialog = kitchen.page.getByRole("dialog", {
    name: "Problem fulfilling this order?",
  });
  await issueDialog
    .getByLabel("Decision note (visible to customer)")
    .fill(`${marker} Kitchen equipment unavailable.`);
  await issueDialog
    .getByRole("button", { name: "Report issue and pause" })
    .click();
  await expect(card).toContainText("This order is on hold");
  let held = await api(`/orders/${order.id}/`, { token: customer.token });
  assert.ok(held.fulfillment_paused_at);
  await api(`/orders/${order.id}/status/`, {
    token: kitchen.token,
    method: "POST",
    body: { status: "ready" },
    status: 400,
  });
  await page.goto(`${base}/tracking/${order.id}`, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Your order needs attention." }),
  ).toBeVisible();
  await expect(page.locator(".fulfillment-hold")).toContainText(
    "Preparation, assignment, pickup and delivery are paused",
  );
  await admin.page.goto(`${base}/support?ticket=${held.fulfillment_issue}`, {
    waitUntil: "networkidle",
  });
  await adminThread
    .getByRole("button", { name: "Support actions", exact: true })
    .click();
  let decision = admin.page.getByRole("dialog", {
    name: "Review an order issue",
  });
  await decision.getByLabel("Support decision").selectOption("resume");
  await decision
    .getByLabel("Decision note (visible to customer)")
    .fill(`${marker} Test resume after kitchen confirmation.`);
  await decision.getByRole("button", { name: "Resume this order" }).click();
  await expect(decision).toHaveCount(0);
  held = await api(`/orders/${order.id}/`, { token: customer.token });
  assert.equal(held.status, "preparing");
  assert.equal(held.fulfillment_paused_at, null);
  await adminThread
    .getByRole("button", { name: "Support actions", exact: true })
    .click();
  decision = admin.page.getByRole("dialog", { name: "Review an order issue" });
  await decision.getByLabel("Support decision").selectOption("cancel");
  await decision
    .getByLabel("Decision note (visible to customer)")
    .fill(`${marker} Close this local COD fixture; no cash collected.`);
  await decision.getByRole("checkbox").check();
  await decision
    .getByRole("button", { name: "Confirm support cancellation" })
    .click();
  await expect(decision).toHaveCount(0);
  const final = await api(`/orders/${order.id}/`, { token: customer.token });
  assert.equal(final.status, "cancelled");
  assert.equal(final.refunds.length, 0);
  passed.push(
    "Kitchen reports hold, progress blocked, customer sees hold, admin resumes without rewinding then explicitly cancels the test COD order",
  );
  const own = await api("/support/", {
    token: admin.token,
    method: "POST",
    body: {
      category: "other",
      subject: `${marker} Admin shopping help`,
      message: "hi",
    },
  });
  await admin.page.goto(`${base}/support?ticket=${own.id}`, {
    waitUntil: "networkidle",
  });
  await expect(adminThread.getByRole("log")).toContainText(
    "Hi! I’m here to help",
  );
  await expect(adminThread.locator(".thread-context-note")).toHaveCount(0);
  await expect(
    adminThread.getByRole("group", { name: "Quick order help" }),
  ).toBeVisible();
  await adminThread
    .getByLabel("Your reply", { exact: true })
    .fill("Help with my account password");
  await adminThread
    .getByRole("button", { name: "Send reply", exact: true })
    .click();
  await expect(adminThread.getByRole("log")).toContainText(
    "Don’t share passwords",
  );
  const ownResult = await api(`/support/${own.id}/`, { token: admin.token });
  assert.equal(ownResult.viewer_is_requester, true);
  assert.equal(ownResult.staff_requested_at, null);
  assert.equal(ownResult.messages.filter((m) => !m.from_support).length, 2);
  const choiceRequests = [];
  await admin.page.route("**/api/v1/support/*/quick-help/", async (route) => {
    choiceRequests.push(route.request().postDataJSON());
    const response = await route.fetch();
    if (choiceRequests.length === 1)
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          detail: "Connection interrupted. Please try again.",
        }),
      });
    else await route.fulfill({ response });
  });
  const quickAccount = adminThread.getByRole("button", {
    name: "Help with my account",
    exact: true,
  });
  await quickAccount.click();
  await expect(adminThread.getByRole("alert")).toContainText(
    "Connection interrupted",
  );
  await quickAccount.click();
  await expect(adminThread.getByRole("alert")).toHaveCount(0);
  await expect.poll(() => choiceRequests.length).toBe(2);
  await expect(quickAccount).toBeEnabled();
  assert.equal(choiceRequests.length, 2);
  assert.equal(choiceRequests[0].client_id, choiceRequests[1].client_id);
  const recovered = await api(`/support/${own.id}/`, { token: admin.token });
  assert.equal(
    recovered.messages.length,
    ownResult.messages.length + 2,
    "Lost response retry must not duplicate the question or answer",
  );
  await admin.page.unroute("**/api/v1/support/*/quick-help/");
  // Hold only the response in transit. Polling should show the real persisted
  // answer and unlock the composer without waiting for that delayed POST.
  let releaseResponse;
  const responseGate = new Promise((resolve) => {
    releaseResponse = resolve;
  });
  await admin.page.route("**/api/v1/support/*/respond/", async (route) => {
    const response = await route.fetch();
    await responseGate;
    await route.fulfill({ response }).catch(() => {});
  });
  await adminThread
    .getByLabel("Your reply", { exact: true })
    .fill("Food allergy help");
  await adminThread
    .getByRole("button", { name: "Send reply", exact: true })
    .click();
  try {
    await expect(adminThread.getByRole("log")).toContainText(
      "I can’t verify allergens",
      { timeout: 10000 },
    );
    await expect(adminThread.locator(".support-typing")).toHaveCount(0);
    await expect(quickAccount).toBeEnabled();
  } finally {
    releaseResponse();
  }
  await admin.page.unroute("**/api/v1/support/*/respond/");
  passed.push(
    "Lost-response retry is idempotent; persisted answers arriving through polling do not leave typing or buttons stuck",
  );
  await screenshot(admin.page, "admin-own-support");
  await adminThread
    .getByRole("button", { name: "That helped, close chat" })
    .click();
  await expect(
    adminThread.getByRole("form", { name: "Rate support conversation" }),
  ).toBeVisible();
  await admin.page.goto(`${base}/admin-orders`, { waitUntil: "networkidle" });
  await expect(
    admin.page.getByRole("button", {
      name: /^(Accept order|Start preparation|Mark ready for pickup)$/,
    }),
  ).toHaveCount(0);
  passed.push(
    "Admin shopping conversations reply as requester with feedback; operational admin queue has no kitchen controls",
  );
  await admin.page.goto(`${base}/support?ticket=2147483647`, {
    waitUntil: "networkidle",
  });
  await expect(admin.page.getByRole("alert")).toBeVisible();
  await expect(adminThread).toHaveCount(0);
  passed.push(
    "An inaccessible ticket never falls back to an unrelated conversation",
  );
  const preserved = await api("/orders/16/", { token: admin.token });
  assert.equal(preserved.status, original.status);
  assert.equal(preserved.updated_at, original.updated_at);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        passed,
        browserErrors: errors,
        fixtureOrder: order.id,
        fixtureTicket: ticket.id,
        realRefunds: 0,
        userOrder16Unchanged: true,
      },
      null,
      2,
    ),
  );
} finally {
  try {
    if (order) {
      const current = await api(`/orders/${order.id}/`, { token: admin.token });
      assert.equal(current.notes, marker);
      if (!["cancelled", "delivered"].includes(current.status))
        await api(`/order-operations/${order.id}/cancel/`, {
          token: admin.token,
          method: "POST",
          body: {
            note: `${marker} Close local fixture after test.`,
            expected_status: current.status,
            confirm_cancel: true,
          },
        });
    }
    if (cartId)
      await api(`/cart/items/${cartId}/`, {
        token: customer.token,
        method: "DELETE",
      });
  } finally {
    await browser.close();
  }
}
