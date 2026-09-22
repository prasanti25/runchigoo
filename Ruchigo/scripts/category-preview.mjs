import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  const rail = page.locator(".category-rail");
  const photos = rail.locator("img");
  assert.equal(await photos.count(), 7, "Preview catalog should show seven categories");
  await photos.evaluateAll(async (images) => {
    for (const image of images) image.loading = "eager";
    await Promise.all(images.map((image) => image.decode()));
  });
  const sources = await photos.evaluateAll((images) => images.map((image) => ({ src: image.currentSrc, width: image.naturalWidth })));
  assert.equal(new Set(sources.map((image) => image.src)).size, 7, "Every preview category uses a distinct photograph");
  assert.ok(sources.every((image) => image.src.includes("/categories/") && image.width === 320));
  await rail.screenshot({ path: "/private/tmp/ruchigo-real-food-categories.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await rail.screenshot({ path: "/private/tmp/ruchigo-real-food-categories-mobile.png" });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.locator(".category-card").filter({ hasText: "Biryani" }).click();
  await page.waitForURL(/category=Biryani/);
  await expect(page.getByLabel("Cuisine filter")).toHaveValue("Biryani");
  assert.deepEqual(errors, []);
  console.log("Seven distinct optimized category photos loaded; mobile layout and category navigation passed.");
} finally {
  await browser.close();
}
