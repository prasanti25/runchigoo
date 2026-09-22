import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
const base = "http://127.0.0.1:5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
async function session(email, role) {
  const response = await fetch(`${base}/api/v1/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role, password: "RuchiGo-preview-2026" }),
  });
  assert.equal(response.status, 200);
  const auth = await response.json();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
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
async function get(path, token) {
  const response = await fetch(`${base}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(response.status, 200, path);
  return response.json();
}
async function screenshot(page, name) {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `${name} overflow at ${width}`,
    );
    await page.screenshot({
      path: `/private/tmp/ruchigo-${name}-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
}
try {
  const admin = await session("preview.admin@ruchigo.test", "admin");
  const kitchen = await session("owner.spice@ruchigo.online", "restaurant");
  const original = await get("/orders/16/", admin.token);
  const { page } = admin;
  await page.goto(`${base}/admin-orders`, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Orders", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".operations-order").first()).toBeVisible();
  const list = await get("/orders/", admin.token);
  assert.equal(
    await page.locator(".operations-order").count(),
    list.results.length,
  );
  if (list.next) {
    await page
      .getByRole("button", { name: "Next orders", exact: true })
      .click();
    await expect(page.locator(".people-pagination")).toContainText("Page 2");
    await expect(page.locator(".operations-order").first()).toBeVisible();
  }
  await page.getByLabel("Order status filter").selectOption("delivered");
  await expect(page.locator(".people-pagination")).toContainText("Page 1");
  const delivered = await get("/orders/?status=delivered", admin.token);
  await expect(page.locator(".operations-order")).toHaveCount(
    delivered.results.length,
  );
  await page
    .getByLabel("Search orders", { exact: true })
    .fill(delivered.results[0].number.slice(0, 8));
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".operations-order")).toHaveCount(1);
  await page.locator(".operations-order summary").click();
  await expect(page.locator(".operations-order-details")).toContainText(
    "Delivered",
  );
  await screenshot(page, "admin-order-queue");
  for (const [actor, path] of [
    [admin, "/admin-payments"],
    [kitchen, "/restaurant-earnings"],
  ]) {
    await actor.page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await expect(
      actor.page.getByRole("heading", { name: "Payments", exact: true }),
    ).toBeVisible();
    await actor.page.getByLabel("Payment status filter").selectOption("paid");
    await actor.page.getByLabel("Payment method filter").selectOption("cod");
    const ledger = await get("/payments/?status=paid&method=cod", actor.token);
    await expect(actor.page.locator(".people-table tbody tr")).toHaveCount(
      ledger.results.length,
    );
    await expect(actor.page.locator(".people-table caption")).toContainText(
      `${ledger.count} matching payments`,
    );
    if (actor === admin) {
      await actor.page
        .getByLabel("Refund status filter")
        .selectOption("requested");
      const requests = await get(
        "/refund-requests/?status=requested",
        actor.token,
      );
      await expect(actor.page.locator(".refund-queue-item")).toHaveCount(
        requests.results.length,
      );
      if (requests.results.length) {
        await actor.page.locator(".refund-queue-item summary").first().click();
        await expect(
          actor.page.locator(".refund-admin-controls").first(),
        ).toBeVisible();
      }
    } else
      await expect(actor.page.locator(".refund-admin-controls")).toHaveCount(0);
    await screenshot(
      actor.page,
      actor === admin ? "admin-payment-queue" : "restaurant-payment-ledger",
    );
  }
  await page.goto(`${base}/admin-catalog`, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Food categories", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create category", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.goto(`${base}/admin-partner-accounts`, {
    waitUntil: "networkidle",
  });
  await expect(
    page.getByRole("heading", { name: "Partner account access", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add account", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Filter account role").locator("option"),
  ).toHaveCount(3);
  const partners = await get("/users/?partner_only=true", admin.token);
  await expect(page.locator(".people-table tbody tr")).toHaveCount(
    partners.results.length,
  );
  await screenshot(page, "partner-account-access");
  const unchanged = await get("/orders/16/", admin.token);
  assert.deepEqual(unchanged.events, original.events);
  assert.equal(unchanged.status, original.status);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        passed: [
          "Server-paginated order queue, search/status filters and activity details",
          "Role-scoped payment ledger filters and exact matching counts",
          "Admin-only refund queue and review controls without submitting funds",
          "320/390/1440 responsive layouts",
          "Dedicated category editor and partner-only account access routes",
        ],
        browserErrors: errors,
        userOrder16Unchanged: true,
        businessWrites: 0,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
