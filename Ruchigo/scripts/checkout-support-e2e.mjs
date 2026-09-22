import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";

// Local fixture accounts only. No provider calls, payments, order transitions,
// live zone policy changes or user order #16 modifications.
const base = "http://127.0.0.1:5173";
const marker = `[Local support QA ${randomUUID()}]`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  passed = [];
let createdReview = null,
  reviewToken = null,
  addedCartId = null,
  customerToken = null;
async function api(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = response.status === 204 ? null : await response.json();
  assert.ok(response.ok, `${path}: ${response.status} ${JSON.stringify(data)}`);
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
  return { page, context, token: auth.tokens.access };
}
async function noOverflow(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    `No overflow: ${page.url()}`,
  );
}
try {
  const customer = await session("preview.customer@ruchigo.test", "customer");
  const admin = await session("preview.admin@ruchigo.test", "admin");
  const originalOrder = await api("/orders/16/", { token: admin.token });
  customerToken = customer.token;
  const order = await api("/orders/17/", { token: customer.token });
  assert.equal(
    order.status,
    "delivered",
    "Use the completed fixture, not the user's active order",
  );
  const { page } = customer;
  await page.goto(`${base}/restaurant/${order.restaurant}/`, {
    waitUntil: "networkidle",
  });
  const categories = await api(`/categories/?restaurant=${order.restaurant}`);
  const visible = page.getByRole("complementary", { name: "Menu categories" });
  await expect(visible.getByRole("button")).toHaveCount(
    categories.results.length + 1,
  );
  for (const category of categories.results) {
    await visible
      .getByRole("button", { name: category.name, exact: true })
      .click();
    await expect(page.locator(".menu-item").first()).toBeVisible();
  }
  await page
    .getByRole("group", { name: "Rate your meal", exact: true })
    .getByRole("button", { name: "Rate meal 2 stars" })
    .click();
  const dialog = page.getByRole("dialog", { name: "How was your meal?" });
  await expect(
    dialog.getByRole("button", { name: "2 stars", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    dialog.getByRole("link", { name: /Food spoiled or unsafe/ }),
  ).toBeVisible();
  // Restaurant reviews offer the latest eligible meal, which need not be #17
  // after another local suite. Check that UI, then write only on our exact fixture.
  await page.keyboard.press("Escape");
  await page.goto(`${base}/tracking/${order.id}`, { waitUntil: "networkidle" });
  await page
    .getByRole("group", { name: "Rate your meal", exact: true })
    .getByRole("button", { name: "Rate meal 2 stars" })
    .click();
  if (!order.review) {
    await dialog
      .getByRole("textbox")
      .fill(`${marker} temporary star-rating check`);
    const reviewResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/reviews/") &&
        response.request().method() === "POST",
    );
    await dialog
      .getByRole("button", { name: "Share your review", exact: true })
      .click();
    const saved = await reviewResponse;
    assert.equal(saved.status(), 201);
    const review = await saved.json();
    createdReview = review.id;
    reviewToken = customer.token;
    assert.equal(review.order, order.id);
    await expect(dialog).toHaveCount(0);
    const updated = await api(`/orders/${order.id}/`, {
      token: customer.token,
    });
    assert.equal(updated.review.rating, 2);
    assert.equal(
      updated.review.comment,
      `${marker} temporary star-rating check`,
    );
  } else await page.keyboard.press("Escape");
  passed.push(
    "Only restaurant menu categories; directly selectable persisted meal stars",
  );

  await page.goto(`${base}/tracking/${order.id}`, { waitUntil: "networkidle" });
  await page
    .getByRole("link", { name: /Food spoiled or poor quality/ })
    .click();
  const conversation = page.getByRole("region", {
    name: "Order support conversation",
  });
  await expect(conversation).toBeVisible();
  await conversation.getByRole("checkbox").first().check();
  await conversation
    .getByRole("textbox", { name: "What was wrong with the food?" })
    .fill(
      `${marker} The food smelled sour. Automated fixture check, no real incident.`,
    );
  await conversation
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await conversation
    .getByRole("button", { name: /Request a refund review/ })
    .click();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    await conversation.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `/private/tmp/ruchigo-support-choice-${width}.png`,
    });
  }
  const created = page.waitForResponse(
    (response) =>
      response.url().endsWith("/support/") &&
      response.request().method() === "POST",
  );
  await conversation
    .getByRole("button", { name: "Yes, request a review" })
    .click();
  const response = await created;
  assert.equal(response.status(), 201);
  const ticket = await response.json();
  assert.equal(ticket.order, order.id);
  assert.ok(ticket.affected_items.length);
  assert.equal(ticket.refund_request.status, "requested");
  await expect(
    page.getByRole("region", { name: "Refund status" }),
  ).toContainText("Refund review requested");

  await admin.page.goto(`${base}/support?ticket=${ticket.id}`, {
    waitUntil: "networkidle",
  });
  const refund = admin.page.getByRole("region", { name: "Refund status" });
  await refund
    .getByRole("textbox", { name: "Decision note (visible to customer)" })
    .fill(`${marker} Reviewing this local test conversation.`);
  await refund
    .getByRole("button", { name: "Start review", exact: true })
    .click();
  await expect(
    refund.getByRole("heading", { name: "Under review" }),
  ).toBeVisible();
  await refund
    .getByRole("textbox", { name: "Decision note (visible to customer)" })
    .fill(
      `${marker} Test closed; this is not a real food issue or payment claim.`,
    );
  await refund
    .getByRole("button", { name: "Reject request", exact: true })
    .click();
  await expect(refund).toContainText("Request not approved");
  await admin.page
    .getByRole("button", { name: "Mark resolved", exact: true })
    .click();
  await page.reload({ waitUntil: "networkidle" });
  const feedback = page.getByRole("form", {
    name: "Rate support conversation",
  });
  await expect(feedback).toBeVisible();
  await feedback
    .getByRole("button", { name: "Delighted", exact: true })
    .click();
  await feedback
    .getByRole("textbox")
    .fill(`${marker} Support feedback persistence check.`);
  await feedback
    .getByRole("button", { name: "Send feedback", exact: true })
    .click();
  await expect(feedback).toContainText("Thanks for telling us how we did");
  const persisted = await api(`/support/${ticket.id}/`, {
    token: customer.token,
  });
  assert.equal(persisted.feedback_score, 5);
  assert.equal(persisted.refund_request.status, "rejected");
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await noOverflow(page);
    await feedback.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `/private/tmp/ruchigo-support-feedback-${width}.png`,
    });
  }
  passed.push(
    "Order-linked quality conversation, item selection, explicit refund choice, admin review, persisted face feedback at 320/390/1440px",
  );

  const cart = await api("/cart/", { token: customer.token });
  if (!cart.items.length) {
    const menu = await api(`/menu-items/?restaurant=${order.restaurant}`);
    const item = menu.results.find(
      (row) =>
        !row.option_groups?.some((group) => group.min_select > 0) &&
        row.orderable !== false,
    );
    assert.ok(item);
    const added = await api("/cart/items/", {
      token: customer.token,
      method: "POST",
      body: { menu_item: item.id, quantity: 1 },
    });
    addedCartId = added.items[0].id;
    await page.goto(`${base}/checkout`, { waitUntil: "networkidle" });
    await expect(page.locator(".checkout-serviceability")).toContainText(
      "Delivery available",
    );
    await expect(
      page.getByRole("button", { name: "Place order", exact: true }),
    ).toBeEnabled();
    await noOverflow(page);
    await page.setViewportSize({ width: 390, height: 900 });
    await noOverflow(page);
    await page.screenshot({
      path: "/private/tmp/ruchigo-verified-checkout-390.png",
      fullPage: true,
    });
    passed.push(
      "Checkout obtains server quote before enabling Place order; no order placed",
    );
  }
  await admin.page.goto(`${base}/admin-delivery-zones`, {
    waitUntil: "networkidle",
  });
  await expect(
    admin.page.getByRole("heading", { name: "Delivery areas & pricing" }),
  ).toBeVisible();
  await admin.page
    .getByRole("button", { name: "Add zone", exact: true })
    .click();
  await expect(
    admin.page.getByRole("dialog", { name: "Add delivery zone" }),
  ).toBeVisible();
  for (const width of [1440, 390, 320]) {
    await admin.page.setViewportSize({ width, height: 900 });
    await noOverflow(admin.page);
  }
  passed.push(
    "Admin zone configuration form renders without changing prices or policy",
  );
  const preserved = await api("/orders/16/", { token: admin.token });
  assert.equal(preserved.status, originalOrder.status);
  assert.deepEqual(preserved.delivery, originalOrder.delivery);
  assert.equal(preserved.updated_at, originalOrder.updated_at);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        passed,
        browserErrors: errors.length,
        localSupportTicket: ticket.id,
        realRefundsSent: 0,
        userOrder16Unchanged: true,
      },
      null,
      2,
    ),
  );
} finally {
  if (createdReview) {
    const review = await api(`/reviews/${createdReview}/`, {
      token: reviewToken,
    });
    assert.ok(review.comment.startsWith(marker));
    await api(`/reviews/${createdReview}/`, {
      token: reviewToken,
      method: "DELETE",
    });
  }
  if (addedCartId)
    await api(`/cart/items/${addedCartId}/`, {
      token: customerToken,
      method: "DELETE",
    });
  await browser.close();
}
