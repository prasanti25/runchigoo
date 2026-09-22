import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { positionOnRoute, projectOnRoute } from "../src/lib/tracking.js";

const base = (
  process.env.RUCHIGO_DELIVERY_BASE_URL || "http://127.0.0.1:5173"
).replace(/\/$/, "");
assert.ok(
  [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "https://runchigoo.vercel.app",
  ].includes(base),
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  writes = [],
  orders = [];
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (message) => {
  const code = message
    .text()
    .match(/Google Maps JavaScript API error:\s*(\w+)/)?.[1];
  if (code) errors.push(code);
});
page.on("request", (request) => {
  const url = new URL(request.url());
  if (
    url.pathname.startsWith("/api/v1/") &&
    !["GET", "HEAD", "OPTIONS"].includes(request.method())
  )
    writes.push(url.pathname);
  if (url.pathname.startsWith("/api/v1/orders/")) orders.push(url.pathname);
});
try {
  await page.goto(`${base}/demo/delivery`);
  await expect(
    page.getByRole("button", { name: "Watch delivery", exact: true }),
  ).toBeVisible();
  assert.equal(await page.locator(".gm-style").count(), 0);
  const result = page.waitForResponse((r) =>
    r.url().endsWith("/location/demo-route/"),
  );
  await page
    .getByRole("button", { name: "Watch delivery", exact: true })
    .click();
  const response = await result;
  assert.equal(response.status(), 200);
  assert.equal(response.headers()["cache-control"], "private, no-store");
  const journey = await response.json();
  assert.equal(journey.simulated, true);
  for (const leg of [journey.pickup, journey.delivery]) {
    assert.equal(leg.provider, "google");
    assert.ok(leg.points.length > 10);
    assert.ok(leg.duration_seconds > 0);
    assert.equal(leg.traffic, false);
  }
  assert.ok(!/AIza[\w-]{30,}/.test(JSON.stringify(journey)));
  const map = page.locator(".google-delivery-map-wrap"),
    layout = page.locator(".demo-layout"),
    rider = page.locator(".google-rider-marker");
  await expect(map).toHaveAttribute("data-map-state", "ready", {
    timeout: 25000,
  });
  await expect(page.locator(".gm-style")).toBeVisible();
  assert.equal(await page.locator(".leaflet-container").count(), 0);
  await expect(layout).toHaveAttribute("data-demo-status", "assigned", {
    timeout: 10000,
  });
  await expect(rider).toBeVisible();
  await expect(rider).toHaveClass(/is-moving/, { timeout: 5000 });
  await expect(page.locator(".rider-place-status")).toContainText(
    "Demo route playback",
  );
  const alignment = async (points) => {
    const p = await rider.evaluate((el) => [
      Number(el.dataset.latitude),
      Number(el.dataset.longitude),
    ]);
    const match = projectOnRoute(points, p, 1);
    assert.ok(
      match,
      "Rendered scooter centre must be on Google road geometry within 1 metre",
    );
    assert.ok(match.distance < 1);
  };
  await alignment(journey.pickup.points);
  const before = await rider.getAttribute("data-latitude");
  await expect.poll(() => rider.getAttribute("data-latitude")).not.toBe(before);
  await alignment(journey.pickup.points);
  assert.ok(
    Math.abs(
      Number(await rider.getAttribute("data-latitude")) -
        journey.delivery.points[0][0],
    ) > 0.001,
    "Rider begins away from kitchen",
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-google-delivery-desktop.png",
  });
  const canvas = page.locator(".delivery-google-map");
  const zoom = await canvas.getAttribute("data-zoom");
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect.poll(() => canvas.getAttribute("data-zoom")).not.toBe(zoom);
  await page
    .getByRole("button", { name: "Expand delivery map", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Expanded delivery map" }),
  ).toBeVisible();
  await expect(map.locator(".delivery-map-arrival")).toContainText("Arriving");
  await page.keyboard.press("Escape");
  await expect(map).not.toHaveClass(/is-expanded/);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page
    .getByRole("button", { name: "Recenter delivery map", exact: true })
    .click();
  await expect
    .poll(async () => {
      const a = await rider.boundingBox(),
        b = await canvas.boundingBox();
      return Boolean(a && b && a.x >= b.x && a.x + a.width <= b.x + b.width);
    })
    .toBe(true);
  await page.locator(".live-delivery-card").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "/private/tmp/ruchigo-google-delivery-mobile.png",
  });
  await page
    .getByRole("button", { name: "Expand delivery map", exact: true })
    .click();
  await expect(map).toHaveClass(/is-expanded/);
  await page
    .getByRole("button", { name: "Recenter delivery map", exact: true })
    .click();
  await page.screenshot({
    path: "/private/tmp/ruchigo-google-delivery-expanded.png",
  });
  await page
    .getByRole("button", { name: "Collapse delivery map", exact: true })
    .click();
  await expect(layout).toHaveAttribute("data-demo-status", "out_for_delivery", {
    timeout: 35000,
  });
  await expect(rider).toHaveClass(/is-moving/, { timeout: 5000 });
  await alignment(journey.delivery.points);
  await expect(page.locator(".delivery-status-arrival")).toContainText(
    /Arriving/,
  );
  await expect(layout).toHaveAttribute("data-demo-status", "delivered", {
    timeout: 25000,
  });
  await expect(rider).toHaveCount(0);
  const reduced = await browser.newContext({
    reducedMotion: "reduce",
    isMobile: true,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(`${base}/demo/delivery`);
  // Reuse real response in memory only; this case tests rendering/accessibility.
  await reduced.route("**/location/demo-route/", (route) =>
    route.fulfill({ json: journey }),
  );
  await reducedPage
    .getByRole("button", { name: "Watch delivery", exact: true })
    .click();
  await expect(
    reducedPage.locator(".google-delivery-map-wrap"),
  ).toHaveAttribute("data-map-state", "ready", { timeout: 25000 });
  await expect(reducedPage.locator(".google-rider-marker")).toBeVisible({
    timeout: 12000,
  });
  await expect(reducedPage.locator(".google-rider-marker")).not.toHaveClass(
    /is-moving/,
  );
  await reducedPage
    .getByRole("button", { name: "Expand delivery map", exact: true })
    .click();
  const reducedCanvas = reducedPage.locator(".delivery-google-map");
  const beforePinch = Number(await reducedCanvas.getAttribute("data-zoom"));
  const cdp = await reduced.newCDPSession(reducedPage);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: 150, y: 400, id: 0 },
      { x: 230, y: 400, id: 1 },
    ],
  });
  for (let spread = 50; spread <= 125; spread += 15) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: 190 - spread, y: 400, id: 0 },
        { x: 190 + spread, y: 400, id: 1 },
      ],
    });
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(async () => Number(await reducedCanvas.getAttribute("data-zoom")))
    .toBeGreaterThan(beforePinch);
  await reducedPage
    .getByRole("button", { name: "Collapse delivery map", exact: true })
    .click();
  await reducedPage.evaluate(() =>
    window.dispatchEvent(new Event("ruchigo-map-auth-failure")),
  );
  await expect(reducedPage.getByRole("alert")).toContainText(
    "map couldn’t load",
  );
  await reduced.close();
  const failed = await browser.newPage();
  await failed.route("**/location/demo-route/", (route) =>
    route.fulfill({ status: 503, json: { detail: "Controlled outage" } }),
  );
  await failed.goto(`${base}/demo/delivery`);
  await failed
    .getByRole("button", { name: "Watch delivery", exact: true })
    .click();
  await expect(failed.getByRole("alert")).toContainText(
    "preview route couldn’t load",
  );
  await expect(failed.locator(".google-rider-marker")).toHaveCount(0);
  await failed.close();
  assert.deepEqual(writes, []);
  assert.deepEqual(orders, []);
  assert.deepEqual(errors, []);
  assert.equal(projectOnRoute(journey.pickup.points, [0, 0]), null);
  assert.ok(
    projectOnRoute(
      journey.pickup.points,
      positionOnRoute(journey.pickup.points, 0.5).point,
    ),
  );
  console.log(
    JSON.stringify({
      target: base,
      passed: [
        "real Google maps and both road legs",
        "scooter aligned within 1m of displayed route",
        "separate acceptance/pickup/delivery",
        "desktop/mobile/fullscreen/zoom",
        "moving wheels, reduced motion",
        "route/map failures",
        "no real-order calls or business writes",
      ],
      browserErrors: errors,
    }),
  );
} finally {
  await browser.close();
}
