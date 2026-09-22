import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium } from "@playwright/test";

const base = "http://127.0.0.1:5173";
const password = "RuchiGo-preview-2026";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.on("pageerror", (error) => errors.push(error.message));
const report = [];
const reviewComment = `[Automated local test ${randomUUID()}] Temporary review; not a customer testimonial.`;
let auth;
let orderId;
let reviewCleanupNeeded = false;

async function api(path, { token, method = "GET", body } = {}, attempt = 0) {
  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = response.status === 204 ? null : await response.json();
  if (response.status === 429 && attempt < 4) {
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        Math.min(
          60000,
          Math.max(
            1000,
            Number(response.headers.get("Retry-After") || 1) * 1000 + 100,
          ),
        ),
      ),
    );
    return api(path, { token, method, body }, attempt + 1);
  }
  assert.ok(response.ok, `${method} ${path}: ${JSON.stringify(data)}`);
  return data;
}
async function cleanupTestReview() {
  if (!reviewCleanupNeeded) return;
  assert.equal(auth?.user?.email, "preview.customer@ruchigo.test");
  assert.ok(Number.isInteger(orderId));
  const order = await api(`/orders/${orderId}/`, { token: auth.token });
  if (order.review) {
    // Never enumerate/delete other reviews, even if their text is identical.
    assert.equal(
      order.review.comment,
      reviewComment,
      "Refusing to remove an unrelated review",
    );
    await api(`/reviews/${order.review.id}/`, {
      token: auth.token,
      method: "DELETE",
    });
    const cleaned = await api(`/orders/${orderId}/`, { token: auth.token });
    assert.equal(
      cleaned.review,
      null,
      "Temporary test review must not remain public",
    );
  }
  reviewCleanupNeeded = false;
}
async function authenticatedPage(email, role) {
  const session = await api("/auth/login/", {
    method: "POST",
    body: { email, password, role },
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
          token: tokens.access,
          refreshToken: tokens.refresh,
          role: user.role,
          expiresAt: Date.now() + 600000,
        }),
      ),
    session,
  );
  const rolePage = await context.newPage();
  rolePage.on("pageerror", (error) => errors.push(error.message));
  return { page: rolePage, token: session.tokens.access, context };
}
try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page
    .getByLabel("What sounds good?")
    .fill("A comforting vegetarian meal");
  await page.getByLabel("Vegetarian only", { exact: true }).check();
  await page.getByLabel("Meal budget").selectOption("250");
  await page.getByRole("button", { name: "Find my food" }).click();
  await page
    .getByText(/^(PICKS FROM THE CURRENT MENU|AI PICKS FOR YOUR CRAVING)$/)
    .waitFor();
  report.push("Catalog-grounded recommendations");

  await page.goto(`${base}/login`);
  await page
    .getByPlaceholder("Enter your email")
    .fill("preview.customer@ruchigo.test");
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(base + "/");
  auth = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("ruchigo-auth")),
  );
  const cart = await api("/cart/", { token: auth.token });
  for (const item of cart.items)
    await api(`/cart/items/${item.id}/`, {
      token: auth.token,
      method: "DELETE",
    });
  const menu = await api("/menu-items/?search=Royal%20Veg%20Thali");
  const item = menu.results[0];
  await page.goto(`${base}/search?view=dishes&q=Royal%20Veg%20Thali`, {
    waitUntil: "networkidle",
  });
  await page
    .locator(".food-card")
    .filter({ hasText: "Royal Veg Thali" })
    .getByRole("link", { name: /View menu/ })
    .click();
  await page.waitForURL(/\/restaurant\/\d+\?dish=/);
  await page
    .locator(`#dish-${item.id}`)
    .getByRole("button", { name: "ADD", exact: true })
    .click();
  const selectedAddon = item.add_ons?.find((row) => row.is_available);
  if (item.add_ons?.length) {
    if (selectedAddon)
      await page
        .getByRole("checkbox", { name: new RegExp(selectedAddon.name) })
        .check();
    await page.getByRole("button", { name: /^Add \d+ items? ·/ }).click();
  }
  await page.getByRole("link", { name: /View cart/ }).click();
  await page.getByRole("textbox", { name: "Coupon code" }).fill("RUCHI20");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await page.getByText("RUCHI20 applied").waitFor();
  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await page.getByRole("button", { name: "Place order", exact: true }).click();
  await page.waitForURL(/\/tracking\/\d+/);
  orderId = Number(page.url().split("/").pop());
  let order = await api(`/orders/${orderId}/`, { token: auth.token });
  assert.equal(order.status, "pending");
  assert.equal(
    order.total,
    (
      (Number(item.price) + Number(selectedAddon?.price || 0)) * 0.8 +
      40
    ).toFixed(2),
  );
  if (selectedAddon)
    assert.equal(order.items[0].add_ons[0].id, selectedAddon.id);
  assert.equal(order.delivery_code.length, 6);
  await page.screenshot({
    path: "/private/tmp/ruchigo-product-tracking.png",
    fullPage: true,
  });
  report.push(
    "Customer login, restaurant-first menu, selected add-ons, coupon, COD checkout and tracking",
  );

  const kitchen = await authenticatedPage(
    "owner.spice@ruchigo.online",
    "restaurant",
  );
  await kitchen.page.goto(`${base}/restaurant-orders`, {
    waitUntil: "networkidle",
  });
  const shortNumber = order.number.slice(0, 8).toUpperCase();
  let card = kitchen.page
    .locator(".order-card")
    .filter({ hasText: shortNumber });
  if (selectedAddon)
    assert.ok(
      (await card.textContent()).includes(selectedAddon.name),
      "Kitchen must receive selected extras",
    );
  await card.getByRole("button", { name: "Accept order" }).click();
  await kitchen.page
    .getByRole("button", { name: "Order accepted", exact: true })
    .click();
  await card.getByRole("button", { name: "Start preparing" }).click();
  await kitchen.page
    .getByRole("button", { name: "In the kitchen", exact: true })
    .click();
  await card
    .getByRole("button", { name: "Ready for pickup", exact: true })
    .click();
  await kitchen.page
    .locator(".filter-bar")
    .getByRole("button", { name: "Ready for pickup", exact: true })
    .click();
  await kitchen.page.screenshot({
    path: "/private/tmp/ruchigo-product-kitchen.png",
    fullPage: true,
  });
  report.push("Kitchen accepts, prepares and marks order ready");

  const courier = await authenticatedPage(
    "preview.delivery@ruchigo.test",
    "delivery",
  );
  await api(`/orders/${orderId}/accept/`, {
    token: courier.token,
    method: "POST",
  });
  await courier.page.goto(`${base}/delivery-navigation?order=${orderId}`, {
    waitUntil: "networkidle",
  });
  await courier.page
    .getByRole("button", { name: "Confirm pickup", exact: true })
    .click();
  await courier.page
    .getByRole("button", { name: "Confirm delivery", exact: true })
    .click();
  await courier.page
    .getByLabel("Delivery code", { exact: true })
    .fill(order.delivery_code);
  await courier.page
    .getByRole("button", { name: "Complete delivery", exact: true })
    .click();
  await courier.page
    .getByRole("button", { name: "Delivery complete", exact: true })
    .waitFor();
  order = await api(`/orders/${orderId}/`, { token: auth.token });
  assert.equal(order.status, "delivered");
  assert.equal(order.payment.status, "paid");
  assert.equal(order.events.length, 7);
  report.push("Delivery code confirmation and COD payment reconciliation");

  await page.goto(`${base}/orders`, { waitUntil: "networkidle" });
  const customerCard = page
    .locator(".order-card")
    .filter({ hasText: shortNumber });
  await customerCard.getByRole("button", { name: "Rate meal" }).click();
  await page.getByLabel("Anything you’d like to share?").fill(reviewComment);
  reviewCleanupNeeded = true;
  const reviewResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/reviews/") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Share your review" }).click();
  assert.equal((await reviewResponse).status(), 201);
  await customerCard.getByText("Rated 5/5").waitFor();
  await cleanupTestReview();
  report.push("Verified-order review with immediate, exact-record cleanup");

  await page.goto(`${base}/support?order=${orderId}`, {
    waitUntil: "networkidle",
  });
  await page
    .getByLabel("Subject", { exact: true })
    .fill(`Delivery feedback ${shortNumber}`);
  await page
    .getByLabel("What happened?", { exact: true })
    .fill("This is a local preview support-flow test.");
  await page.getByRole("button", { name: "Create support ticket" }).click();
  await page
    .getByRole("heading", {
      name: `Delivery feedback ${shortNumber}`,
      exact: true,
    })
    .last()
    .waitFor();
  await page
    .getByLabel("Your reply", { exact: true })
    .fill("Adding a follow-up for the support team.");
  await page.getByRole("button", { name: "Send reply", exact: true }).click();
  await page
    .getByText("Adding a follow-up for the support team.", { exact: true })
    .waitFor();
  report.push("Support ticket creation and replies");

  await page.goto(`${base}/food-details/${item.id}`, {
    waitUntil: "networkidle",
  });
  if (
    await page.getByRole("button", { name: "Save dish", exact: true }).count()
  ) {
    await page.getByRole("button", { name: "Save dish", exact: true }).click();
    await page
      .getByRole("button", { name: "Unsave dish", exact: true })
      .waitFor();
  }
  await page.goto(`${base}/wishlist`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: item.name, exact: true }).waitFor();
  await page.goto(`${base}/addresses`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Edit", exact: true }).first().click();
  await page
    .getByLabel("Landmark or additional details")
    .fill("Near the central park");
  await page
    .getByRole("button", { name: "Save delivery address", exact: true })
    .click();
  await page.getByText(/Near the central park/).waitFor();
  await page.goto(`${base}/notifications`, { waitUntil: "networkidle" });
  const unread = page.getByRole("button", { name: "Mark read", exact: true });
  if (await unread.count()) await unread.first().click();
  report.push("Saved dishes, address editing and persisted notification reads");

  await page.goto(`${base}/search?q=pizza`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Dishes", exact: true }).click();
  await page
    .getByLabel("Search restaurants, dishes or cuisines")
    .fill("burger");
  await page.waitForURL(/q=burger/);
  await page.goBack({ waitUntil: "networkidle" });
  assert.equal(
    await page
      .getByLabel("Search restaurants, dishes or cuisines")
      .inputValue(),
    "pizza",
  );
  report.push("Search state follows browser Back navigation");

  const admin = await authenticatedPage("preview.admin@ruchigo.test", "admin");
  await admin.page.goto(`${base}/support`, { waitUntil: "networkidle" });
  await admin.page
    .locator(".ticket-list")
    .getByRole("button", {
      name: new RegExp(`Delivery feedback ${shortNumber}`),
    })
    .click();
  await admin.page
    .getByLabel("Your reply", { exact: true })
    .fill(`Support acknowledged ${shortNumber}`);
  await admin.page
    .getByRole("button", { name: "Send reply", exact: true })
    .click();
  await admin.page
    .getByText(`Support acknowledged ${shortNumber}`, { exact: true })
    .waitFor();
  await admin.page.getByRole("button", { name: "Mark resolved" }).click();
  await admin.page.getByText("resolved", { exact: true }).waitFor();
  report.push("Admin support reply and ticket resolution");

  for (const [rolePage, routes] of [
    [
      admin.page,
      [
        "/admin-dashboard",
        "/admin-restaurants",
        "/admin-payments",
        "/admin-offers",
      ],
    ],
    [
      kitchen.page,
      ["/restaurant-dashboard", "/restaurant-menu", "/restaurant-profile"],
    ],
    [
      courier.page,
      ["/delivery-dashboard", "/delivery-orders", "/delivery-profile"],
    ],
  ]) {
    await rolePage.setViewportSize({ width: 390, height: 844 });
    for (const route of routes) {
      await rolePage.goto(base + route, { waitUntil: "networkidle" });
      const fits = await rolePage.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      );
      assert.ok(fits, `Mobile workspace overflow: ${route}`);
    }
  }
  await admin.page.setViewportSize({ width: 1440, height: 1000 });
  await admin.page.goto(`${base}/admin-dashboard`, {
    waitUntil: "networkidle",
  });
  await admin.page.screenshot({
    path: "/private/tmp/ruchigo-product-admin.png",
    fullPage: true,
  });
  report.push("Admin, kitchen and courier responsive workspace checks");

  for (const width of [390, 360]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of [
      "/",
      "/search",
      `/restaurant/${item.restaurant}`,
      "/orders",
      "/support",
      "/checkout",
      "/profile",
      "/addresses",
      "/wishlist",
      "/notifications",
      "/offers",
    ]) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      const dimensions = await page.evaluate(() => ({
        viewport: innerWidth,
        content: document.documentElement.scrollWidth,
      }));
      assert.ok(
        dimensions.content <= dimensions.viewport + 1,
        `Overflow on ${route} at ${width}: ${JSON.stringify(dimensions)}`,
      );
    }
  }
  report.push("360px and 390px responsive routes without horizontal overflow");
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({ passed: report, browserErrors: errors, orderId }, null, 2),
  );
} finally {
  try {
    // Stop pending UI mutations before the fallback cleanup on assertion failure.
    await browser.close();
  } finally {
    await cleanupTestReview();
  }
}
