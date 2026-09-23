import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect as baseExpect } from "@playwright/test";

// Read-only navigation checks against existing local preview accounts.
// Never use this suite against production or seed/reset shared records.
const base = "http://127.0.0.1:5173";
const expect = baseExpect.configure({ timeout: 15000 });
const output = mkdtempSync(join(tmpdir(), "ruchigo-mobile-navigation-"));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const writes = [];
const actors = [
  { role: "guest", path: "/", target: "/offers", label: "Offers" },
  {
    role: "customer",
    path: "/",
    target: "/addresses",
    label: "Delivery addresses",
  },
  {
    role: "admin",
    path: "/admin-dashboard",
    target: "/admin-users",
    label: "People",
    workspace: true,
  },
  {
    role: "restaurant",
    email: "owner.spice@ruchigo.online",
    path: "/restaurant-dashboard",
    target: "/restaurant-menu",
    label: "Your menu",
    workspace: true,
  },
  {
    role: "delivery",
    path: "/delivery-dashboard",
    target: "/delivery-profile",
    label: "My profile",
    workspace: true,
  },
  {
    role: "admin",
    path: "/",
    target: "/admin-dashboard",
    label: "Your dashboard",
  },
];
async function authFor(actor) {
  if (actor.role === "guest") return null;
  const response = await fetch(`${base}/api/v1/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: actor.email || `preview.${actor.role}@ruchigo.test`,
      role: actor.role,
      password: process.env.RUCHIGO_SEED_PASSWORD || "RuchiGo-preview-2026",
    }),
  });
  assert.equal(response.status, 200, `${actor.role} local fixture login`);
  return response.json();
}
async function noOverflow(page, label) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    label,
  );
  const dialog = page.getByRole("dialog");
  if (await dialog.count()) {
    assert.ok(
      await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      `${label}: menu overflow`,
    );
  }
}
try {
  for (const actor of actors) {
    const auth = await authFor(actor);
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    context.setDefaultTimeout(15000);
    if (auth)
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
      if (
        request.url().includes("/api/v1/") &&
        !["GET", "HEAD", "OPTIONS"].includes(request.method()) &&
        !request.url().includes("/auth/")
      ) {
        writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
      }
    });
    const name = `${actor.role}-${actor.workspace ? "workspace" : "shopping"}`;
    await page.goto(base + actor.path);
    const trigger = page.getByRole("button", {
      name: actor.workspace ? "Open workspace menu" : "Open navigation menu",
      exact: true,
    });
    for (const width of [320, 390, 768, 820, 1023]) {
      await page.setViewportSize({ width, height: width === 320 ? 568 : 844 });
      await expect(trigger).toBeVisible();
      const box = await trigger.boundingBox();
      assert.ok(box.width >= 44 && box.height >= 44, "44px touch target");
      await noOverflow(page, `${name} ${width} closed`);
      await trigger.tap();
      const dialog = page.getByRole("dialog", {
        name: actor.workspace ? "Your workspace" : "Your RuchiGo",
        exact: true,
      });
      await expect(dialog).toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      assert.equal(
        await page.evaluate(() => document.body.style.overflow),
        "hidden",
      );
      assert.ok(
        await dialog.evaluate(
          (node) => node.parentElement.parentElement === document.body,
        ),
        "Menu is portaled outside header/workspace",
      );
      await noOverflow(page, `${name} ${width} open`);
      if (auth) {
        await dialog
          .getByRole("button", { name: "Sign out", exact: true })
          .scrollIntoViewIfNeeded();
        await expect(
          dialog.getByRole("button", { name: "Sign out", exact: true }),
        ).toBeInViewport();
      }
      await dialog.evaluate((node) => {
        node.scrollTop = 0;
      });
      if ([320, 390].includes(width))
        await page.screenshot({ path: join(output, `${name}-${width}.png`) });
      // Keyboard focus wraps inside the sheet, even with many admin links.
      await dialog.getByRole("button", { name: "Close dialog" }).focus();
      await page.keyboard.press("Shift+Tab");
      assert.ok(
        await dialog.evaluate((node) => node.contains(document.activeElement)),
      );
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      assert.notEqual(
        await page.evaluate(() => document.body.style.overflow),
        "hidden",
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await trigger.tap();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Close dialog" })
      .tap();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // Both the lower shortcut and the header trigger open the same sheet.
    await page
      .getByRole("button", {
        name: actor.workspace ? "More" : "Account",
        exact: true,
      })
      .tap();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: actor.label, exact: true })
      .tap();
    await expect(page).toHaveURL(base + actor.target);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    assert.notEqual(
      await page.evaluate(() => document.body.style.overflow),
      "hidden",
    );
    await page.goBack();
    await expect(trigger).toBeVisible();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await trigger.tap();
    assert.equal(
      await page
        .getByRole("dialog")
        .evaluate((node) => getComputedStyle(node).animationName),
      "none",
      "Reduced motion removes drawer animation",
    );
    await expect(trigger.locator(".animated-menu-icon")).toHaveClass(/is-open/);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger.locator(".animated-menu-icon")).not.toHaveClass(
      /is-open/,
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    // Tapping the backdrop dismisses without triggering underlying navigation.
    await trigger.tap();
    await page.locator(".modal-backdrop").tap({ position: { x: 3, y: 3 } });
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await trigger.tap();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeHidden();
    assert.notEqual(
      await page.evaluate(() => document.body.style.overflow),
      "hidden",
    );
    await noOverflow(page, `${name} desktop`);
    if (!actor.workspace) {
      await page
        .getByRole("button", { name: "Open account menu", exact: true })
        .click();
      await expect(page.locator(".account-menu")).toBeVisible();
      await page
        .getByRole("button", { name: "Close account menu" })
        .click({ position: { x: 5, y: 500 } });
    }
    console.log(
      `${name}: header, lower shortcut, links, dismissal, focus, scrolling and desktop resize pass`,
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(writes, []);
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
