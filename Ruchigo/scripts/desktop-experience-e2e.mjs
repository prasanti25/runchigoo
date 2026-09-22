import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { coordinates, locationFreshness } from "../src/lib/tracking.js";

// Read-only catalog/chat checks against the LOCAL preview. No production data,
// placed orders, fake ratings or artificial timestamps are written.
const base = "http://127.0.0.1:5173";
assert.deepEqual(coordinates(0, 0), [0, 0]);
assert.equal(coordinates(null, 77), null);
assert.equal(coordinates(91, 77), null);
assert.equal(coordinates("n/a", 77), null);
const now = Date.now();
assert.equal(
  locationFreshness(new Date(now - 61000).toISOString(), now).fresh,
  false,
);
assert.equal(
  locationFreshness(new Date(now - 5000).toISOString(), now).fresh,
  true,
);
assert.equal(locationFreshness(null, now).fresh, false);
assert.equal(
  locationFreshness(new Date(now + 60000).toISOString(), now).fresh,
  false,
);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  passed = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (error) => errors.push(error.message));
async function fits() {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    `Overflow at ${page.url()}`,
  );
}
try {
  await page.goto(base, { waitUntil: "networkidle" });
  const hero = page.getByRole("region", { name: "Featured meals" });
  await expect(hero).toBeVisible();
  await expect(page.locator(".editorial-strip")).toHaveCount(0);
  const active = () =>
    hero
      .locator('.meal-carousel-dots button[aria-pressed="true"]')
      .getAttribute("aria-label");
  const first = await active();
  await page.mouse.move(0, 0);
  await expect.poll(active, { timeout: 9000 }).not.toBe(first);
  await expect(
    hero.getByRole("button", { name: /slideshow|Previous meal|Next meal/ }),
  ).toHaveCount(0);
  await hero.locator('.meal-carousel-dots button[aria-pressed="true"]').focus();
  const paused = await active();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(6500); // Keyboard interaction stops distracting auto-movement.
  assert.equal(await active(), paused);
  await hero
    .locator('.meal-carousel-dots button[aria-pressed="false"]')
    .first()
    .click();
  assert.notEqual(await active(), paused);
  const mealLink = hero
    .locator('.meal-slide[aria-hidden="false"]')
    .getByRole("link", { name: "View meal" });
  assert.match(
    await mealLink.getAttribute("href"),
    /^\/restaurant\/\d+\?dish=\d+$/,
  );
  await page.waitForTimeout(450); // Capture the settled card, not a mid-slide frame.
  await page.screenshot({
    path: "/private/tmp/ruchigo-home-desktop-new.png",
    fullPage: false,
  });
  await fits();
  passed.push(
    "Desktop homepage: auto-slide, keyboard pause, small-dot navigation and real menu links; no play/pause controls",
  );

  await page.goto(base + "/for-you", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Your feed.", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".meal-carousel.feed")).toBeVisible();
  const left = await page.locator(".feed-primary").boundingBox();
  const right = await page.locator(".feed-sidebar").boundingBox();
  assert.ok(
    right.x >= left.x + left.width,
    "Desktop chat belongs BESIDE the feed, not in a phone-width column",
  );
  assert.ok(
    left.width > 500 && right.width > 320,
    "Real desktop column widths",
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-feed-desktop.png",
    fullPage: false,
  });
  await fits();
  await page.getByLabel("Message RuchiGo").fill("Coffee under 150");
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/intelligence/assistant/") &&
      r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  const result = await response;
  assert.equal(result.status(), 200);
  const data = await result.json();
  assert.ok(
    data.items.length &&
      data.items.every(
        (item) =>
          /coffee/i.test(item.name) &&
          Number(item.minimum_price ?? item.price) <= 150,
      ),
  );
  await expect(page.locator(".assistant-thinking")).toHaveCount(0);
  await expect(
    page.locator(".assistant-results .food-card").first(),
  ).toBeVisible();
  await expect(page.locator("main")).not.toContainText(
    /gemini-|Ranked by|AI PICKS|Explanations use menu facts/,
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-feed-chat-desktop.png",
    fullPage: false,
  });
  passed.push(
    `Photo-led desktop feed and working menu-grounded chat (${data.source})`,
  );

  await page.goto(base + "/login", { waitUntil: "networkidle" });
  await page.mouse.move(0, 0);
  await page.getByPlaceholder("Enter your email").fill("draft@example.test");
  const authPhoto = () =>
    page.locator(".auth-photo-sequence img.active").getAttribute("src");
  const initialPhoto = await authPhoto();
  await expect.poll(authPhoto, { timeout: 6000 }).not.toBe(initialPhoto);
  await expect(page.getByPlaceholder("Enter your email")).toHaveValue(
    "draft@example.test",
  );
  await expect(page.getByRole("button", { name: /play|pause/i })).toHaveCount(
    0,
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-login-animated-desktop.png",
    fullPage: false,
  });
  await page.goto(base + "/register", { waitUntil: "networkidle" });
  await expect(page.locator(".auth-photo-sequence img.active")).toBeVisible();
  await fits();
  passed.push(
    "Login/register food imagery auto-crossfades at 3.5s without resetting form fields or showing playback buttons",
  );
  await page.goto(base + "/for-you", { waitUntil: "networkidle" });

  for (const width of [1280, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await fits();
  }
  await page.screenshot({
    path: "/private/tmp/ruchigo-feed-responsive.png",
    fullPage: false,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("button", { name: /meal slideshow/ }),
  ).toHaveCount(0);
  const reducedFirst = await active();
  await page.waitForTimeout(6500);
  assert.equal(
    await active(),
    reducedFirst,
    "Reduced-motion users must not receive autoplay",
  );
  await fits();
  passed.push(
    "1280/768/390px responsive fit; reduced-motion disables auto-slide; coordinate/freshness boundaries",
  );
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed, browserErrors: errors }, null, 2));
} finally {
  await browser.close();
}
