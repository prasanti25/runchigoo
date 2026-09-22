import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";

// Local-only, isolated customer/cart and exact temporary coupon records.
// No checkout, order, payment, inventory or delivery-policy mutations.
const base = "http://127.0.0.1:5173";
const marker = randomUUID().slice(0, 8).toUpperCase();
const email = `coupon-ui-${marker.toLowerCase()}@example.test`;
const password = `Local-coupon-${marker}-only`;
const code80 = `QA${marker}80`,
  code150 = `QA${marker}150`,
  expired = `QA${marker}OLD`;
const codes = [];
let customerId;
let adminToken;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
async function api(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.ok(response.ok, `${path}: HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}
async function authContext(auth, reducedMotion = "no-preference") {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    reducedMotion,
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
  return context;
}
try {
  const admin = await api("/auth/login/", {
    method: "POST",
    body: {
      email: "preview.admin@ruchigo.test",
      role: "admin",
      password: "RuchiGo-preview-2026",
    },
  });
  adminToken = admin.tokens.access;
  const original = await api("/orders/16/", { token: adminToken });
  const customer = await api("/users/", {
    token: adminToken,
    method: "POST",
    body: {
      first_name: "Coupon QA",
      email,
      password,
      role: "customer",
      reason: "Isolated local coupon-interface regression fixture",
    },
  });
  customerId = customer.id;
  const auth = await api("/auth/login/", {
    method: "POST",
    body: { email, password, role: "customer" },
  });
  const token = auth.tokens.access;
  const catalog = await api("/menu-items/");
  const item = catalog.results.find(
    (row) =>
      Number(row.price) >= 100 &&
      Number(row.price) < 250 &&
      !row.add_ons?.length &&
      (!row.stock_quantity || row.stock_quantity >= 4),
  );
  assert.ok(
    item,
    "A currently available plain dish is required for this fixture",
  );
  const price = Number(item.price);
  const address = await api("/addresses/", {
    token,
    method: "POST",
    body: {
      label: "QA home",
      line1: "Local coupon test only",
      city: item.restaurant_detail.city,
      state: item.restaurant_detail.city,
      postal_code: "110001",
      is_default: true,
    },
  });
  await api("/cart/items/", {
    token,
    method: "POST",
    body: { menu_item: item.id, quantity: 1 },
  });
  for (const [code, amount, minimum, isExpired] of [
    [code80, 80, price, false],
    [code150, 150, price * 2, false],
    [expired, 80, price, true],
  ]) {
    const created = await api("/coupons/", {
      token: adminToken,
      method: "POST",
      body: {
        code,
        restaurant: item.restaurant,
        description: "Temporary local coupon UI test",
        discount_amount: amount,
        min_order_amount: minimum,
        starts_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        ends_at: new Date(
          Date.now() + (isExpired ? -60000 : 86400000),
        ).toISOString(),
        is_active: true,
      },
    });
    codes.push({ code, id: created.id });
  }
  const context = await authContext(auth);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/cart`);
  const panel = page.getByRole("region", { name: "Offers and savings" });
  await expect(
    panel.getByRole("progressbar", { name: "Progress towards free delivery" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Find a coupon for your meal/ })
    .click();
  let drawer = page.getByRole("dialog", { name: "Coupons for your meal" });
  const search = page.getByRole("textbox", {
    name: "Search coupons or enter code",
  });
  await search.fill(`qa${marker.toLowerCase()}`);
  await expect(drawer.locator(".coupon-ticket")).toHaveCount(3);
  await expect(
    drawer.getByRole("button", { name: `Apply ${code150}`, exact: true }),
  ).toBeDisabled();
  await expect(drawer.locator(`[data-coupon="${code150}"]`)).toContainText(
    `Add ₹${price}`,
  );
  await expect(drawer.locator(`[data-coupon="${expired}"]`)).toContainText(
    "expired",
  );
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    assert.ok(
      await drawer.evaluate(
        (element) => element.scrollWidth <= element.clientWidth + 1,
      ),
    );
    await page.screenshot({
      path: `/private/tmp/ruchigo-coupons-${width}.png`,
    });
  }
  await search.fill(expired);
  await drawer.getByRole("button", { name: "Apply code", exact: true }).click();
  await expect(
    drawer.getByText("This coupon has expired.", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator(".coupon-celebration")).toHaveCount(0);
  await search.fill(code80);
  await drawer
    .getByRole("button", { name: `Apply ${code80}`, exact: true })
    .click();
  let win = page.getByRole("dialog", { name: "A little win for your meal" });
  await expect(
    win.getByRole("heading", { name: "You saved ₹80!" }),
  ).toBeVisible();
  assert.equal(
    await win
      .locator(".coupon-burst > i")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
    "coupon-confetti",
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-coupon-success-320.png",
  });
  await win.getByRole("button", { name: "Nice, continue" }).click();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page
    .getByRole("button", { name: `Add one ${item.name}`, exact: true })
    .click();
  await expect(panel).toContainText(`${code80} applied`);
  await expect(panel).toContainText("You’re saving ₹80");
  await page.getByRole("button", { name: "View other coupons" }).click();
  drawer = page.getByRole("dialog", { name: "Coupons for your meal" });
  await search.fill(code150);
  await expect(
    drawer.getByRole("button", { name: `Apply ${code150}`, exact: true }),
  ).toBeEnabled();
  await drawer
    .getByRole("button", { name: `Apply ${code150}`, exact: true })
    .click();
  win = page.getByRole("dialog", { name: "A little win for your meal" });
  await expect(
    win.getByRole("heading", { name: "You saved ₹150!" }),
  ).toBeVisible();
  // Inspect the real one-shot animation partway through, not its first frame.
  await page.waitForTimeout(180);
  await page.screenshot({
    path: "/private/tmp/ruchigo-coupon-success-1440.png",
  });
  await win.getByRole("button", { name: "Nice, continue" }).click();
  const quote = await api("/cart/quote/", {
    token,
    method: "POST",
    body: { address_id: address.id, coupon_code: code150 },
  });
  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await expect(page.locator(".bill-total")).toContainText(
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    })
      .format(Number(quote.total))
      .replace(/\.00$/, ""),
  );
  await expect(panel).toContainText(`${code150} applied`);
  await page.screenshot({
    path: "/private/tmp/ruchigo-coupon-checkout-1440.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "YOUR BAG", exact: true }).click();
  await page
    .getByRole("button", { name: `Remove one ${item.name}`, exact: true })
    .click();
  await expect(panel).not.toContainText(`${code150} applied`);
  await expect(
    panel.getByRole("button", { name: /Find a coupon for your meal/ }),
  ).toBeVisible();
  const reduced = await authContext(auth, "reduce");
  const reducedPage = await reduced.newPage();
  reducedPage.on("pageerror", (error) => errors.push(error.message));
  await reducedPage.goto(`${base}/cart`);
  await reducedPage
    .getByRole("button", { name: /Find a coupon for your meal/ })
    .click();
  await reducedPage
    .getByRole("textbox", { name: "Search coupons or enter code" })
    .fill(code80);
  await reducedPage
    .getByRole("button", { name: "Apply code", exact: true })
    .click();
  const reducedWin = reducedPage.getByRole("dialog", {
    name: "A little win for your meal",
  });
  await expect(reducedWin).toBeVisible();
  assert.equal(
    await reducedWin
      .locator(".coupon-burst > i")
      .first()
      .evaluate((el) => getComputedStyle(el).display),
    "none",
  );
  await reducedWin.getByRole("button", { name: "Nice, continue" }).click();
  await reducedPage
    .getByRole("button", { name: `Remove coupon ${code80}` })
    .click();
  await expect(
    reducedPage.getByRole("region", { name: "Offers and savings" }),
  ).not.toContainText(`${code80} applied`);
  await reduced.close();
  for (const { code } of codes)
    assert.equal(
      (await api(`/coupons/${code}/`, { token: adminToken })).usage_count,
      0,
    );
  assert.equal((await api("/orders/", { token })).count, 0);
  const unchanged = await api("/orders/16/", { token: adminToken });
  assert.equal(unchanged.status, original.status);
  assert.deepEqual(unchanged.events, original.events);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      passed: [
        "Real available/unavailable coupon search",
        "Exact spend-to-unlock",
        "Expired code rejection without celebration",
        "Success celebration after server confirmation",
        "Coupon retained/revalidated on bag changes",
        "Replacement coupon does not stack",
        "Checkout bill matches server quote",
        "Minimum-spend removal",
        "Manual removal",
        "1440/390/320 and reduced motion",
      ],
      browserErrors: errors,
      createdOrders: 0,
      couponRedemptions: 0,
      userOrder16Unchanged: true,
    }),
  );
} finally {
  for (const { code, id } of codes) {
    const existing = await api(`/coupons/${code}/`, { token: adminToken });
    if (existing.id === id && existing.code === code)
      await api(`/coupons/${code}/`, { token: adminToken, method: "DELETE" });
  }
  if (customerId) {
    const customer = await api(`/users/${customerId}/`, { token: adminToken });
    if (customer.email === email)
      await api(`/users/${customerId}/`, {
        token: adminToken,
        method: "DELETE",
      });
  }
  await browser.close();
}
