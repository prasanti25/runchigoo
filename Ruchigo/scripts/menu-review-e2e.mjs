import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

// Local preview only. Review fixtures below are browser-intercepted, never saved.
const base = "http://127.0.0.1:5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const reviewRoute = "**/api/v1/restaurant-reviews/**";
const customize = () =>
  page.getByRole("button", {
    name: "Customise Royal Veg Thali: 2 add-ons",
    exact: true,
  });
const dialog = () => page.getByRole("dialog", { name: "Customise your meal" });
async function noOverflow() {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `Overflow: ${page.url()}`,
  );
}
async function settleCatalog() {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.waitForLoadState("networkidle");
    const notices = page
      .getByRole("alert")
      .filter({ hasText: "Request was throttled." });
    const messages = await notices.allTextContents();
    if (!messages.length) return;
    const seconds = Math.max(
      ...messages.map((message) =>
        Number(message.match(/available in (\d+) second/)?.[1] || 1),
      ),
    );
    console.log(`Respecting local API cooldown: ${seconds}s`);
    await page.waitForTimeout(Math.min(60000, seconds * 1000 + 100));
    for (const notice of await notices.all())
      await notice.getByRole("button", { name: "Retry" }).click();
  }
}
try {
  await page.goto(`${base}/restaurant/1?dish=2`, { waitUntil: "networkidle" });
  await settleCatalog();
  await expect(
    page.getByRole("heading", { name: "No reviews yet" }),
  ).toBeVisible();
  await expect(page.locator(".restaurant-review-card")).toHaveCount(0);
  await customize().click();
  await expect(dialog()).toBeVisible();
  await dialog()
    .getByRole("checkbox", { name: /Extra roti/ })
    .check();
  await expect(
    dialog().getByRole("button", { name: /Sign in to add · ₹269/ }),
  ).toBeVisible();
  await dialog().getByRole("button", { name: "Increase quantity" }).click();
  await dialog()
    .getByRole("button", { name: /Sign in to add · ₹538/ })
    .click();
  await page.waitForURL(`${base}/login`);
  await page
    .getByPlaceholder("Enter your email")
    .fill("preview.customer@ruchigo.test");
  await page
    .getByPlaceholder("Enter your password")
    .fill("RuchiGo-preview-2026");
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(/\/restaurant\/1\?.*customise=2/);
  await settleCatalog();
  await expect(dialog()).toBeVisible();
  await expect(
    dialog().getByRole("checkbox", { name: /Extra roti/ }),
  ).toBeChecked();
  await expect(dialog().getByLabel("Quantity", { exact: true })).toHaveText(
    "2",
  );
  await expect(
    dialog().getByRole("button", { name: /Add 2 items · ₹538/ }),
  ).toBeVisible();
  await dialog().getByRole("button", { name: "Close dialog" }).click();
  await expect(page).not.toHaveURL(/customise=/);
  const dismissToast = page.getByRole("button", {
    name: "Dismiss notification",
  });
  await expect(dismissToast).toHaveCount(0, { timeout: 10000 });
  for (const width of [390, 360]) {
    await page.setViewportSize({ width, height: 844 });
    await customize().scrollIntoViewIfNeeded();
    await noOverflow();
    if (width === 390)
      await page.screenshot({
        path: "/private/tmp/ruchigo-menu-addons-visible.png",
      });
    await customize().click();
    await expect(dialog()).toBeVisible();
    await noOverflow();
    if (width === 390)
      await page.screenshot({
        path: "/private/tmp/ruchigo-addons-picker-fixed.png",
      });
    await page.keyboard.press("Escape");
    await expect(dialog()).toHaveCount(0);
  }
  await page.route(reviewRoute, (route) =>
    route.fulfill({
      json: {
        results: [1, 2, 3].map((id) => ({
          id,
          name: `UI-only test fixture ${id}`,
          rating: 4,
          comment:
            id === 2
              ? "Long review layout fixture. ".repeat(12)
              : "Review layout fixture.",
          created_at: "2026-09-22T00:00:00Z",
        })),
      },
    }),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload({ waitUntil: "networkidle" });
  await settleCatalog();
  await expect(page.locator(".restaurant-review-card")).toHaveCount(3);
  const boxes = await page
    .locator(".restaurant-review-card")
    .evaluateAll((cards) =>
      cards.map((card) => ({
        top: card.getBoundingClientRect().top,
        height: card.getBoundingClientRect().height,
      })),
    );
  assert.ok(
    boxes.every(
      (box) =>
        Math.abs(box.top - boxes[0].top) < 1 &&
        Math.abs(box.height - boxes[0].height) < 1,
    ),
    "Review cards must align, including varied text lengths",
  );
  await page.setViewportSize({ width: 360, height: 844 });
  await noOverflow();
  await page.unroute(reviewRoute);
  await page.route(reviewRoute, (route) =>
    route.fulfill({
      status: 503,
      json: { detail: "Reviews temporarily unavailable" },
    }),
  );
  await page.reload({ waitUntil: "networkidle" });
  await settleCatalog();
  const reviews = page.getByRole("region", { name: "Customer reviews" });
  await expect(reviews.getByRole("alert")).toContainText(
    "Reviews temporarily unavailable",
  );
  await expect(reviews.getByText("No reviews yet")).toHaveCount(0);
  await page.unroute(reviewRoute);
  await reviews.getByRole("button", { name: "Retry" }).click();
  await expect(
    reviews.getByRole("heading", { name: "No reviews yet" }),
  ).toBeVisible();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: visible add-ons, guest price preview, sign-in selection restoration, mobile picker, aligned review cards, real empty state and retry.",
  );
} finally {
  await browser.close();
}
