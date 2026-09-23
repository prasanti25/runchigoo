import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect as baseExpect } from "@playwright/test";

// Real local API, no new orders/merchants or business-setting writes.
const base = "http://127.0.0.1:5173";
const output = mkdtempSync(join(tmpdir(), "ruchigo-overview-"));
const expect = baseExpect.configure({ timeout: 20000 });
const login = await fetch(base + "/api/v1/auth/login/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "preview.admin@ruchigo.test",
    role: "admin",
    password: process.env.RUCHIGO_SEED_PASSWORD || "RuchiGo-preview-2026",
  }),
});
assert.equal(login.status, 200);
const auth = await login.json();
async function get(path) {
  const response = await fetch(base + path, {
    headers: { Authorization: "Bearer " + auth.tokens.access },
  });
  assert.equal(response.status, 200, path);
  return response.json();
}
const original = await get("/api/v1/orders/16/");
const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  writes = [],
  reportPaths = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    hasTouch: true,
  });
  context.setDefaultTimeout(20000);
  await context.addInitScript(
    (auth) =>
      localStorage.setItem(
        "ruchigo-auth",
        JSON.stringify({
          user: auth.user,
          role: auth.user.role,
          token: auth.tokens.access,
          refreshToken: auth.tokens.refresh,
          expiresAt: Date.now() + 600000,
        }),
      ),
    auth,
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === "/api/v1/insights/")
      reportPaths.push(url.pathname + url.search);
    if (
      url.pathname.startsWith("/api/v1/") &&
      !["GET", "HEAD", "OPTIONS"].includes(request.method()) &&
      !url.pathname.includes("/auth/")
    )
      writes.push(request.method() + " " + url.pathname);
  });
  await page.goto(base + "/admin-dashboard");
  await expect(
    page.getByRole("heading", { name: "Platform overview", exact: true }),
  ).toBeVisible();
  for (const days of [7, 30, 90]) {
    if (days !== 7)
      await page
        .getByRole("button", { name: days + " days", exact: true })
        .click();
    await expect(page.locator(".overview-metrics")).toHaveAttribute(
      "aria-busy",
      "false",
    );
    await expect(page.locator(".overview-trend-content")).toBeVisible();
    const report = await get(reportPaths.at(-1));
    assert.equal(report.daily.length, days);
    const expected = [
      report.summary.orders.toLocaleString("en-IN"),
      money(report.summary.gross_order_value),
      money(report.summary.average_order_value),
      report.summary.cancellation_rate + "%",
    ];
    assert.deepEqual(
      await page.locator(".overview-metric > strong").allTextContents(),
      expected,
    );
    await page.getByText("View daily figures", { exact: true }).click();
    await expect(page.locator(".overview-chart-data tbody tr")).toHaveCount(
      days,
    );
    assert.equal(
      report.daily.reduce((sum, day) => sum + day.placed_orders, 0),
      report.summary.orders,
    );
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export overview CSV" }).click();
    const download = await downloadPromise;
    const csv = readFileSync(await download.path(), "utf8");
    assert.equal(csv.split("\r\n").length, days + 1);
    assert.ok(csv.includes(report.daily.at(-1).date));
    assert.equal(
      download.suggestedFilename(),
      "ruchigo-overview-" +
        report.period.start +
        "-" +
        report.period.end +
        ".csv",
    );
    await page.getByText("View daily figures", { exact: true }).click();
    if (report.summary.orders) {
      const lastPoint = page.locator(".overview-chart [role=button]").last();
      await lastPoint.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator(".overview-chart-inspection")).toContainText(
        report.daily.at(-1).placed_orders.toLocaleString("en-IN") + " placed",
      );
      await lastPoint.press("Home");
      await expect(
        page.locator(".overview-chart [role=button]").first(),
      ).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(
        page.locator(".overview-chart [role=button]").nth(1),
      ).toBeFocused();
      await page
        .getByRole("button", { name: "Delivered", exact: true })
        .click();
      await expect(page.locator(".performance-delivered-bar")).toHaveCount(0);
      await page
        .getByRole("button", { name: "Delivered", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Order value", exact: true })
        .click();
      await expect(page.locator(".performance-headline strong")).toHaveText(
        money(report.summary.gross_order_value),
      );
      await page.getByLabel("Chart grouping").selectOption("weekly");
      await expect(page.locator(".overview-chart [role=button]")).toHaveCount(
        Math.ceil(days / 7),
      );
      await page
        .getByRole("button", { name: "Trend chart", exact: true })
        .click();
      await expect(page.locator(".overview-chart polyline")).toHaveCount(1);
      await expect(page.locator(".performance-primary-bar")).toHaveCount(0);
      await page
        .getByRole("button", { name: "Bar chart", exact: true })
        .click();
      await page.getByLabel("Chart grouping").selectOption("daily");
      await page.getByRole("button", { name: "Orders", exact: true }).click();
      await expect(page.locator(".performance-primary-bar")).toHaveCount(days);
    }
    console.log(
      days + " days: API totals, daily figures, chart inspection and CSV match",
    );
  }
  await page.getByRole("button", { name: "7 days", exact: true }).click();
  await expect(page.locator(".overview-metrics")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  const overview = await get("/api/v1/analytics/");
  const active = overview.orders
    .filter(
      (row) =>
        !["delivered", "cancelled", "awaiting_payment"].includes(row.status),
    )
    .reduce((sum, row) => sum + row.count, 0);
  await expect(page.locator(".overview-flow-total")).toHaveText(
    active.toLocaleString("en-IN"),
  );
  await expect(page.locator(".overview-order")).toHaveCount(
    overview.recent_orders.length,
  );
  for (const width of [1440, 1280, 1024, 820, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      "No overflow at " + width,
    );
    await page.screenshot({
      path: join(output, "overview-" + width + ".png"),
      fullPage: true,
    });
    if ([1440, 390].includes(width))
      await page.screenshot({
        path: join(output, "overview-viewport-" + width + ".png"),
      });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const status of [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "assigned",
    "out_for_delivery",
  ]) {
    await page
      .locator(
        '.overview-flow-list a[href="/admin-orders?status=' + status + '"]',
      )
      .click();
    await expect(page.getByLabel("Order status filter")).toHaveValue(status);
    await page.goBack();
    await expect(page.locator(".overview-flow-list")).toBeVisible();
  }
  if (overview.recent_orders.length) {
    await page.locator(".overview-order-customer > a").first().click();
    await expect(page.getByLabel("Search orders", { exact: true })).toHaveValue(
      overview.recent_orders[0].number,
    );
    await expect(page.locator(".operations-order")).toHaveCount(1);
    await page.goBack();
  }
  await expect(page.locator(".overview-metrics")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  // Explicit failure simulation only; normal data checks above use real API.
  await context.route("**/api/v1/insights/**", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Report temporarily unavailable" }),
    }),
  );
  await page.getByRole("button", { name: "Refresh overview" }).click();
  await expect(
    page.getByText("Trend unavailable", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Export overview CSV" }),
  ).toBeDisabled();
  assert.deepEqual(
    await page.locator(".overview-metric > strong").allTextContents(),
    ["—", "—", "—", "—"],
  );
  await context.unrouteAll({ behavior: "wait" });
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".overview-trend-content")).toBeVisible();
  assert.deepEqual(errors, []);
  assert.deepEqual(writes, []);
  const unchanged = await get("/api/v1/orders/16/");
  assert.deepEqual(unchanged.events, original.events);
  assert.equal(unchanged.status, original.status);
  console.log(
    JSON.stringify({
      result: "PASS",
      browserErrors: errors.length,
      businessWrites: writes.length,
      screenshots: output,
    }),
  );
} finally {
  await browser.close();
}
