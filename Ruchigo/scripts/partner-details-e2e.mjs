import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect as baseExpect } from "@playwright/test";

// Reads existing local accounts. All operational writes are blocked. The last
// delivery-state checks use browser-only responses, never persisted fixtures.
const base = "http://127.0.0.1:5173";
const output = mkdtempSync(join(tmpdir(), "ruchigo-partner-details-"));
const expect = baseExpect.configure({ timeout: 20000 });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  writes = [];
let cases = 0;
async function session(role, email) {
  const login = await fetch(base + "/api/v1/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      role,
      password: process.env.RUCHIGO_SEED_PASSWORD || "RuchiGo-preview-2026",
    }),
  });
  assert.equal(login.status, 200);
  const auth = await login.json();
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
          expiresAt: Date.now() + 3600000,
        }),
      ),
    auth,
  );
  await context.route("**/api/v1/**", (route) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(route.request().method()) &&
      !route.request().url().includes("/auth/")
    ) {
      writes.push(
        route.request().method() +
          " " +
          new URL(route.request().url()).pathname,
      );
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  return { page, context, auth };
}
async function screen(page, name, dialog = false) {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      name + " document overflow " + width,
    );
    if (dialog) {
      const sheet = page.getByRole("dialog");
      await expect(sheet).toBeVisible();
      assert.ok(
        await sheet.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
        name + " dialog overflow " + width,
      );
      const fields = sheet.locator(
        "input:not([type=checkbox]):not([type=radio]),select,textarea",
      );
      if (width < 768)
        assert.ok(
          await fields.evaluateAll((els) =>
            els.every((el) => parseFloat(getComputedStyle(el).fontSize) >= 16),
          ),
          name + " readable inputs",
        );
      await sheet.locator("button").last().scrollIntoViewIfNeeded();
      if (width < 768)
        await expect(
          sheet.getByRole("button", { name: "Close dialog" }),
        ).toBeInViewport();
    }
    if ([1440, 390].includes(width))
      await page.screenshot({
        path: join(output, name + "-" + width + ".png"),
        fullPage: !dialog,
      });
  }
  cases++;
  console.log("PASS", name);
}
async function close(page) {
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close dialog" })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  assert.notEqual(
    await page.evaluate(() => document.body.style.overflow),
    "hidden",
  );
}
async function open(page, path) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + path);
  await expect(page.locator(".workspace-heading h1")).toBeVisible();
  await expect(
    page.locator(".skeleton:visible,.ruchigo-loader:visible"),
  ).toHaveCount(0);
}
try {
  const kitchen = await session("restaurant", "owner.spice@ruchigo.online");
  const { page } = kitchen;
  await open(page, "/restaurant-menu");
  await page.getByRole("button", { name: "Add dish", exact: true }).click();
  await page
    .getByRole("button", { name: "Add choice group", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add optional extra", exact: true })
    .click();
  await page
    .getByLabel("Extra name", { exact: true })
    .fill("Unsaved test extra");
  await page
    .getByRole("combobox", { name: "Choice group", exact: true })
    .selectOption({ label: "Choose a size" });
  await screen(page, "menu-choice-groups-addons", true);
  await close(page);
  await page
    .locator(".food-card")
    .first()
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await screen(page, "edit-existing-dish", true);
  await close(page);
  await open(page, "/restaurant-profile");
  await page.getByLabel("Use a weekly schedule", { exact: true }).check();
  await screen(page, "weekly-opening-hours");
  await open(page, "/restaurant-offers");
  await page.getByRole("button", { name: "Create offer", exact: true }).click();
  await screen(page, "create-offer", true);
  await close(page);
  await page.getByRole("button", { name: "Coupons", exact: true }).click();
  await page
    .getByRole("button", { name: "Create coupon", exact: true })
    .click();
  await screen(page, "meal-coupon", true);
  await page.getByLabel("Benefit", { exact: true }).selectOption("bogo");
  await expect(
    page.getByLabel("BOGO dish", { exact: true }).locator("option"),
  ).not.toHaveCount(1);
  await screen(page, "bogo-coupon", true);
  await close(page);
  await open(page, "/restaurant-earnings?tab=payments");
  await page.getByText("Filter payments", { exact: true }).click();
  await page.getByLabel("Payment status filter").selectOption("paid");
  await page.getByLabel("Payment method filter").selectOption("cod");
  await screen(page, "payment-filters");
  await open(page, "/restaurant-analytics");
  await page.getByLabel("Report start date").fill("2026-09-01");
  await page.getByLabel("Report end date").fill("2026-09-22");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByText("Custom date range", { exact: true }).click();
  await expect(page.getByLabel("Report start date")).toHaveValue("2026-09-01");
  await page.getByRole("button", { name: "Apply dates", exact: true }).click();
  await expect(page.locator(".performance-panel")).toBeVisible();
  await screen(page, "restaurant-custom-report");
  await open(page, "/support");
  await page.getByRole("button", { name: "New ticket", exact: true }).click();
  await expect(
    page.getByLabel("Topic").locator('option[value="food_quality"]'),
  ).toHaveCount(0);
  await screen(page, "restaurant-support-ticket", true);
  await close(page);
  await open(page, "/settings");
  await page.getByLabel("First name", { exact: true }).fill("Unsaved name");
  await screen(page, "restaurant-account-settings");
  // A failed report must show retry and unknown values, not invented zero revenue.
  let failReport = true;
  await page.route("**/api/v1/insights/**", (route) =>
    failReport
      ? route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Report temporarily unavailable" }),
        })
      : route.continue(),
  );
  await open(page, "/restaurant-dashboard");
  await expect(
    page.getByText("Report temporarily unavailable", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".partner-metric.featured > strong")).toHaveText(
    "—",
  );
  failReport = false;
  await page.getByRole("button", { name: /retry/i }).click();
  await expect(page.locator(".performance-panel")).toBeVisible();
  cases++;
  console.log("PASS report-error-recovery");
  await kitchen.context.close();

  const courier = await session("delivery", "preview.delivery@ruchigo.test");
  const rider = courier.page;
  await open(rider, "/support");
  await rider.getByRole("button", { name: "New ticket", exact: true }).click();
  await screen(rider, "delivery-support-ticket", true);
  await close(rider);
  await open(rider, "/delivery-earnings");
  await rider.locator(".partner-order-row").first().click();
  await expect(rider.locator(".workspace-heading h1")).toHaveText(
    "Delivery details",
  );
  await expect(
    rider.getByRole("button", { name: "Delivery complete", exact: true }),
  ).toBeDisabled();
  await screen(rider, "completed-delivery-details");
  const source = await fetch(base + "/api/v1/orders/?status=delivered", {
    headers: { Authorization: "Bearer " + courier.auth.tokens.access },
  });
  assert.equal(source.status, 200);
  const order = (await source.json()).results[0];
  // Controlled UI states derived from an existing local record. No database row
  // is advanced/reopened and no pickup/OTP/GPS request is sent.
  let stage = "assigned";
  await rider.route(`**/api/v1/orders/${order.id}/`, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ...order,
        status: stage,
        fulfillment_paused_at: null,
        delivery: {
          ...order.delivery,
          pickup_at: stage === "assigned" ? null : order.delivery.pickup_at,
          delivered_at: null,
        },
      }),
    }),
  );
  await open(rider, `/delivery-navigation?order=${order.id}`);
  await expect(
    rider.getByRole("button", { name: "Confirm pickup", exact: true }),
  ).toBeEnabled();
  await expect(
    rider.getByRole("button", {
      name: "Collect food before delivery",
      exact: true,
    }),
  ).toBeDisabled();
  await screen(rider, "pickup-state-browser-fixture");
  stage = "out_for_delivery";
  await open(rider, `/delivery-navigation?order=${order.id}`);
  await rider
    .getByRole("button", { name: "Confirm delivery", exact: true })
    .click();
  await rider.getByLabel("Delivery code", { exact: true }).fill("12abc");
  await expect(rider.getByLabel("Delivery code", { exact: true })).toHaveValue(
    "12",
  );
  assert.equal(
    await rider
      .getByLabel("Delivery code", { exact: true })
      .evaluate((input) => input.checkValidity()),
    false,
  );
  await screen(rider, "delivery-otp-browser-fixture", true);
  await close(rider);
  await courier.context.close();
  assert.deepEqual(errors, [], "Browser errors");
  assert.deepEqual(writes, [], "No operational writes attempted");
  console.log(
    JSON.stringify(
      {
        passed: true,
        cases,
        output,
        simulatedStates: ["pickup controls", "OTP dialog"],
      },
      null,
      2,
    ),
  );
} catch (error) {
  for (const [index, context] of browser.contexts().entries()) {
    const page = context.pages().at(-1);
    if (page && !page.isClosed())
      await page
        .screenshot({
          path: join(output, `failure-${index}.png`),
          fullPage: true,
        })
        .catch(() => {});
  }
  console.log("Artifacts", output);
  throw error;
} finally {
  await browser.close();
}
