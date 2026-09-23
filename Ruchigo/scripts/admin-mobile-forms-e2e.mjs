import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect as baseExpect } from "@playwright/test";

const base = "http://127.0.0.1:5173";
const output = mkdtempSync(join(tmpdir(), "ruchigo-admin-mobile-forms-"));
const expect = baseExpect.configure({ timeout: 20000 });
const response = await fetch(base + "/api/v1/auth/login/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "preview.admin@ruchigo.test",
    role: "admin",
    password: process.env.RUCHIGO_SEED_PASSWORD || "RuchiGo-preview-2026",
  }),
});
assert.equal(response.status, 200);
const auth = await response.json();
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  writes = [],
  failures = [],
  passed = [];
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
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
  // This suite never authorizes account, payment, policy or support mutations.
  await context.route("**/api/v1/**", (route) => {
    const req = route.request();
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method()) &&
      !req.url().includes("/auth/")
    ) {
      writes.push(req.method() + " " + new URL(req.url()).pathname);
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (res) => {
    if (res.url().includes("/api/v1/") && res.status() >= 400)
      failures.push(res.status() + " " + new URL(res.url()).pathname);
  });
  async function open(path) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + path);
    await expect(page.locator(".workspace-heading h1")).toBeVisible();
    await expect(
      page.locator(".ruchigo-loader:visible, .skeleton:visible"),
    ).toHaveCount(0);
    await page.waitForLoadState("networkidle");
  }
  async function inspectDialog(name) {
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const close = dialog.getByRole("button", {
      name: "Close dialog",
      exact: true,
    });
    for (const [width, height] of [
      [390, 844],
      [320, 568],
      [390, 430],
    ]) {
      await page.setViewportSize({ width, height });
      await expect
        .poll(
          () => dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
          { message: name + " dialog fits " + width },
        )
        .toBe(true);
      const sizes = await dialog
        .locator(
          'input:not([type="checkbox"]):not([type="radio"]), select, textarea',
        )
        .evaluateAll((inputs) =>
          inputs
            .filter((el) => el.getBoundingClientRect().width > 0)
            .map((el) => ({
              label: el.name || el.id || el.type,
              size: parseFloat(getComputedStyle(el).fontSize),
            })),
        );
      assert.ok(
        sizes.every((input) => input.size >= 16),
        name +
          " legible controls, no small-input zoom: " +
          JSON.stringify(sizes),
      );
      const controls = dialog
        .locator(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])',
        )
        .filter({ visible: true });
      await controls.last().scrollIntoViewIfNeeded();
      await expect(controls.last()).toBeInViewport();
      await expect(close).toBeInViewport();
      const box = await close.boundingBox();
      assert.ok(
        box.width >= 44 && box.height >= 44,
        name + " reachable 44px close",
      );
      if (width === 320)
        await page.screenshot({
          path: join(output, name + "-320-scrolled.png"),
        });
      await dialog.evaluate((el) => {
        el.scrollTop = 0;
      });
      if (width === 390 && height === 844)
        await page.screenshot({ path: join(output, name + "-390.png") });
    }
    await close.tap();
    await expect(dialog).toHaveCount(0);
    assert.notEqual(
      await page.evaluate(() => document.body.style.overflow),
      "hidden",
      name + " releases scroll lock",
    );
    passed.push(name);
    console.log(
      name +
        ": 390/320px and short viewport, scrolling, close target and input sizes pass",
    );
  }
  await open("/admin-orders");
  await expect(
    page.getByRole("link", { name: "Admin workspace overview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Delivery location:/ }),
  ).toHaveCount(0);
  const extra = page.locator(".admin-responsive-filters");
  await expect(extra).not.toHaveAttribute("open", "");
  await extra.locator("summary").tap();
  await expect(page.getByLabel("Order start date")).toBeVisible();
  await page
    .getByLabel("Order sort", { exact: true })
    .selectOption("created_at");
  await expect(extra.locator("small")).toHaveText("Applied");
  await extra.locator("summary").tap();
  await expect(page.getByLabel("Order start date")).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByLabel("Order start date")).toBeVisible();
  await expect(page.getByLabel("Order sort", { exact: true })).toHaveValue(
    "created_at",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel("Order start date")).toBeHidden();
  passed.push("responsive-order-filters");
  await open("/admin-reports");
  await expect(page.getByLabel("Report start date")).toBeHidden();
  await page.locator(".admin-responsive-filters > summary").tap();
  await expect(page.getByLabel("Report start date")).toBeVisible();
  await page.getByLabel("Report start date").fill("2026-09-01");
  await page.locator(".admin-responsive-filters > summary").tap();
  await page.locator(".admin-responsive-filters > summary").tap();
  await expect(page.getByLabel("Report start date")).toHaveValue("2026-09-01");
  passed.push("report-date-draft-preserved");

  await open("/admin-users");
  await page.getByRole("button", { name: "Add account", exact: true }).tap();
  await inspectDialog("add-account");
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Edit details", exact: true, disabled: false })
    .first()
    .tap();
  await inspectDialog("edit-account");
  await open("/admin-partner-accounts");
  await page
    .getByRole("button", { name: /^More actions for/, disabled: false })
    .first()
    .tap();
  await page.getByRole("button", { name: "Block access", exact: true }).tap();
  await inspectDialog("partner-access-review");
  await open("/admin-catalog");
  await page
    .getByRole("button", { name: "Create category", exact: true })
    .tap();
  await inspectDialog("create-category");
  await open("/admin-offers");
  await page.getByRole("button", { name: "Create offer", exact: true }).tap();
  await inspectDialog("create-offer");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Coupons", exact: true }).tap();
  await page.getByRole("button", { name: "Create coupon", exact: true }).tap();
  await inspectDialog("create-coupon");
  await open("/admin-delivery-zones");
  await page.getByRole("button", { name: "Add zone", exact: true }).tap();
  await inspectDialog("add-zone");
  await page.getByRole("tab", { name: "Service cities", exact: true }).tap();
  await page.getByRole("button", { name: "Manage a city", exact: true }).tap();
  await inspectDialog("manage-city");
  await page.getByRole("tab", { name: "Pricing rules", exact: true }).tap();
  await page
    .getByRole("button", { name: "Add pricing rule", exact: true })
    .tap();
  await inspectDialog("delivery-pricing");
  await open("/admin-order-policy");
  await page
    .getByRole("button", { name: "Review policy change", exact: true })
    .tap();
  await inspectDialog("cancellation-policy");
  await page.getByRole("tab", { name: "Cash & tips", exact: true }).tap();
  await page
    .getByRole("button", { name: "Review cash-tip policy", exact: true })
    .tap();
  await inspectDialog("cash-tip-policy");
  await page
    .getByRole("tab", { name: "Rewards & referrals", exact: true })
    .tap();
  await page
    .getByRole("button", { name: "Review rewards policy", exact: true })
    .tap();
  await inspectDialog("rewards-policy");
  await open("/admin-access");
  await page
    .getByRole("button", { name: "Review permissions", exact: true })
    .filter({ hasNot: page.locator("[disabled]") })
    .last()
    .tap();
  await inspectDialog("team-permissions");
  await open("/admin-payments");
  await page
    .getByRole("tab", { name: "Restaurant earnings", exact: true })
    .tap();
  await page.getByRole("button", { name: "Review policy", exact: true }).tap();
  await inspectDialog("commission-policy");
  await open("/support?view=team");
  const reply = page.getByRole("textbox", { name: "Your reply", exact: true });
  await reply.fill("Unsaved layout check — not sent");
  await page.setViewportSize({ width: 390, height: 430 });
  await reply.scrollIntoViewIfNeeded();
  await expect(reply).toBeInViewport();
  await expect(reply).toHaveValue("Unsaved layout check — not sent");
  assert.ok(
    await reply.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize) >= 16,
    ),
  );
  await reply.fill("");
  passed.push("support-reply-short-viewport");
  assert.deepEqual(errors, [], "No runtime errors");
  assert.deepEqual(failures, [], "No failed API reads");
  assert.deepEqual(writes, [], "No attempted business writes");
  console.log(JSON.stringify({ result: "PASS", passed, screenshots: output }));
} finally {
  await browser.close();
  console.log("Screenshots: " + output);
}
