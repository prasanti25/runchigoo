import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect as baseExpect } from "@playwright/test";

// Existing local accounts and records only. No business writes or seeded metrics.
const base = "http://127.0.0.1:5173";
const output = mkdtempSync(join(tmpdir(), "ruchigo-admin-workspace-"));
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
async function originalOrder() {
  const res = await fetch(base + "/api/v1/orders/16/", {
    headers: { Authorization: "Bearer " + auth.tokens.access },
  });
  assert.equal(res.status, 200);
  return res.json();
}
const before = await originalOrder();
const routes = [
  "admin-dashboard",
  "admin-orders",
  "admin-payments",
  "admin-restaurants",
  "admin-delivery-partners",
  "admin-users",
  "admin-partner-accounts",
  "admin-catalog",
  "admin-offers",
  "admin-reports",
  "admin-reviews",
  "admin-delivery-zones",
  "admin-order-policy",
  "admin-activity",
  "admin-access",
  "admin-profile",
  "settings",
  "support?view=team",
  "notifications",
];
const errors = [],
  writes = [],
  failures = [];
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
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
  page.on("request", (req) => {
    if (
      req.url().includes("/api/v1/") &&
      !["GET", "HEAD", "OPTIONS"].includes(req.method()) &&
      !req.url().includes("/auth/")
    )
      writes.push(req.method() + " " + new URL(req.url()).pathname);
  });
  page.on("response", (res) => {
    if (res.url().includes("/api/v1/") && res.status() >= 400)
      failures.push(res.status() + " " + new URL(res.url()).pathname);
  });
  for (const route of routes) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base + "/" + route);
    await expect(
      page.locator(".workspace-admin .workspace-heading h1"),
    ).toBeVisible();
    await expect(
      page.locator(".ruchigo-loader:visible, .skeleton:visible"),
    ).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    for (const width of [1440, 1280, 1024, 768, 390, 320]) {
      await page.setViewportSize({
        width,
        height: width < 700 ? 844 : width < 1440 ? 800 : 1000,
      });
      await expect
        .poll(
          () =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          { message: route + " overflow at " + width },
        )
        .toBe(true);
      const clipped = await page.locator(".workspace-main").evaluate((main) =>
        [...main.querySelectorAll("input, select, button")]
          .filter((el) => {
            const b = el.getBoundingClientRect();
            if (!b.width || !b.height || el.closest("[hidden]")) return false;
            for (
              let p = el.parentElement;
              p && p !== main;
              p = p.parentElement
            ) {
              if (["auto", "scroll"].includes(getComputedStyle(p).overflowX))
                return false;
            }
            return b.right > innerWidth + 2 || b.left < -2;
          })
          .map(
            (el) =>
              el.getAttribute("aria-label") ||
              el.textContent.trim().slice(0, 60),
          ),
      );
      assert.deepEqual(clipped, [], route + " clipped controls at " + width);
      if ([1440, 1280, 1024, 390].includes(width))
        await page.screenshot({
          path: join(
            output,
            route.replace(/[^a-z-]/g, "-") + "-" + width + ".png",
          ),
          fullPage: true,
        });
      if ([1440, 390].includes(width))
        await page.screenshot({
          path: join(
            output,
            route.replace(/[^a-z-]/g, "-") + "-viewport-" + width + ".png",
          ),
        });
    }
    console.log(route + ": desktop, tablet, mobile layouts verified");
  }
  // Filter matching and explicit dismissals, never confirm business changes.
  await page.goto(base + "/admin-restaurants");
  await expect(page.locator(".admin-restaurant-card").first()).toBeVisible();
  const total = await page.locator(".admin-restaurant-card").count();
  await page
    .getByLabel("Search restaurants", { exact: true })
    .fill("no-matching-restaurant-unique");
  await expect(page.locator(".admin-restaurant-card")).toHaveCount(0);
  await page.getByLabel("Search restaurants", { exact: true }).fill("");
  await expect(page.locator(".admin-restaurant-card")).toHaveCount(total);
  await page
    .locator(".admin-restaurant-card")
    .first()
    .getByRole("button", { name: /^Mark / })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Change restaurant availability?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep unchanged" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto(base + "/admin-delivery-partners");
  await expect(
    page.locator(".admin-rider-cards article").first(),
  ).toBeVisible();
  await page
    .locator(".admin-rider-cards article")
    .first()
    .getByRole("button")
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Keep unchanged" }).click();
  for (const [route, label] of [
    ["admin-order-policy", "Order policy sections"],
    ["admin-delivery-zones", "Delivery settings sections"],
  ]) {
    await page.goto(base + "/" + route);
    const tabs = page.getByRole("tablist", { name: label }).getByRole("tab");
    await expect(tabs).toHaveCount(3);
    for (let i = 0; i < (await tabs.count()); i++) {
      await tabs.nth(i).click();
      await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tabpanel")).toHaveCount(1);
      await expect(page.getByRole("tabpanel")).toBeVisible();
    }
    await tabs.last().press("Home");
    await expect(tabs.first()).toBeFocused();
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
    if (route === "admin-order-policy") {
      const radios = page.getByRole("radio");
      await expect(radios).toHaveCount(2);
      const original = (await radios.first().isChecked()) ? 0 : 1;
      await radios.nth(1 - original).check();
      await tabs.nth(1).click();
      await tabs.first().click();
      await expect(radios.nth(1 - original)).toBeChecked();
      await radios.nth(original).check();
    }
  }
  await page.getByRole("button", { name: "Add zone", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Add delivery zone" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.goto(base + "/admin-users");
  await page.getByRole("button", { name: "Add account", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Add account" })).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  assert.deepEqual(await originalOrder(), before, "Original order unchanged");
  assert.deepEqual(errors, [], "No browser exceptions");
  assert.deepEqual(failures, [], "No failed API reads");
  assert.deepEqual(writes, [], "No business writes");
  console.log(
    JSON.stringify({
      result: "PASS",
      routes: routes.length,
      widths: [1440, 1280, 1024, 768, 390, 320],
      browserErrors: errors.length,
      businessWrites: writes.length,
      screenshots: output,
    }),
  );
} finally {
  await browser.close();
  console.log("Screenshots: " + output);
}
