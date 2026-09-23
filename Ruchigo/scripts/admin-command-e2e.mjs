import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect as baseExpect } from "@playwright/test";

// Navigation-only checks against existing preview records. Reject business writes.
const base = "http://127.0.0.1:5173";
const expect = baseExpect.configure({ timeout: 20000 });
const output = mkdtempSync(join(tmpdir(), "ruchigo-admin-command-"));
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
const errors = [],
  failures = [],
  writes = [];
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
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
  await context.route("**/api/v1/**", (route) => {
    const request = route.request();
    if (
      !["GET", "HEAD", "OPTIONS"].includes(request.method()) &&
      !request.url().includes("/auth/")
    ) {
      writes.push(request.method() + " " + new URL(request.url()).pathname);
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (res) => {
    if (res.url().includes("/api/v1/") && res.status() >= 400)
      failures.push(res.status() + " " + new URL(res.url()).pathname);
  });
  await page.goto(base + "/admin-dashboard");
  const trigger = page.getByRole("button", { name: "Find an admin workspace" });
  const dialog = page.getByRole("dialog", { name: "Find a workspace" });
  const input = page.getByRole("textbox", { name: "Search admin workspaces" });
  await trigger.click();
  await expect(input).toBeFocused();
  await input.fill("payments");
  await expect(dialog.getByRole("link")).toHaveCount(1);
  await page.screenshot({ path: join(output, "workspace-search-desktop.png") });
  await input.press("ArrowDown");
  await expect(dialog.getByRole("link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(base + "/admin-payments");
  await expect(page.locator(".workspace-heading h1")).toHaveText(
    "Payments & restaurant finance",
  );
  await expect(dialog).toHaveCount(0);
  await page.keyboard.press("Control+k");
  await expect(input).toBeFocused();
  await input.fill("no-workspace-matches-this");
  await expect(dialog.getByText(/No matching workspace/)).toBeVisible();
  await expect(dialog.getByRole("link")).toHaveCount(0);
  await input.press("Enter");
  await expect(dialog).toBeVisible();
  await input.fill("");
  const links = dialog.getByRole("link");
  await input.press("ArrowDown");
  await expect(links.first()).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(links.last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(links.first()).toBeFocused();
  await page.keyboard.press("End");
  await expect(links.last()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Close dialog" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  assert.notEqual(
    await page.evaluate(() => document.body.style.overflow),
    "hidden",
  );
  await page.keyboard.press("Meta+k");
  await expect(input).toBeFocused();
  await input.fill("users");
  await input.press("Enter");
  await expect(page).toHaveURL(base + "/admin-users");
  await page.getByRole("button", { name: "Add account", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Add account" })).toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await page.getByRole("button", { name: "Close dialog" }).click();
  for (const width of [1440, 1280, 1024]) {
    await page.setViewportSize({ width, height: 800 });
    await expect(trigger).toBeVisible();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    const navigation = page.getByRole("navigation", {
      name: "admin workspace",
      exact: true,
    });
    await navigation
      .getByRole("link", { name: "Notifications", exact: true })
      .scrollIntoViewIfNeeded();
    const box = await navigation
      .getByRole("link", { name: "Notifications", exact: true })
      .boundingBox();
    assert.ok(
      box.y > 0 && box.y + box.height <= 800,
      "Last sidebar link reachable at " + width,
    );
    await page
      .locator(".workspace-bottom")
      .getByRole("link", { name: "Account settings" })
      .click();
    await expect(page).toHaveURL(base + "/settings");
    await expect(page.locator(".workspace-heading h1")).toHaveText(
      "Account settings",
    );
    await trigger.click();
    await expect(input).toBeFocused();
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(trigger).toBeHidden();
  await page.keyboard.press("Control+k");
  await expect(input).toBeFocused();
  await input.fill("orders");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.screenshot({ path: join(output, "workspace-search-mobile.png") });
  await page.keyboard.press("Escape");
  assert.notEqual(
    await page.evaluate(() => document.body.style.overflow),
    "hidden",
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  assert.deepEqual(writes, []);
  console.log(
    JSON.stringify({
      result: "PASS",
      keyboardSearch: true,
      modalGuard: true,
      sidebarWidths: [1440, 1280, 1024],
      browserErrors: 0,
      businessWrites: 0,
      screenshots: output,
    }),
  );
} finally {
  await browser.close();
}
