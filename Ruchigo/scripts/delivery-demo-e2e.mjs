import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import {
  deliveryDemoFrame,
  demoRoute,
  demoStages,
  demoPickupRoute,
  demoPlan,
} from "../src/lib/deliveryDemo.js";
import {
  deliveryStageMessage,
  positionOnRoute,
  travelBearing,
} from "../src/lib/tracking.js";

assert.deepEqual(positionOnRoute(demoRoute, 0).point, demoRoute[0]);
const end = positionOnRoute(demoRoute, 1).point;
assert.ok(Math.abs(end[0] - demoRoute.at(-1)[0]) < 1e-8);
assert.ok(Math.abs(end[1] - demoRoute.at(-1)[1]) < 1e-8);
assert.equal(travelBearing([0, 0], [1, 0]), 0);
assert.equal(travelBearing([0, 0], [0, 1]), 90);
for (const stage of demoStages)
  assert.equal(
    deliveryDemoFrame(stage.at, Date.now()).order.status,
    stage.orderStatus || stage.status,
  );
assert.equal(deliveryDemoFrame(6, Date.now()).order.delivery, null);
const acceptance = deliveryDemoFrame(demoPlan.assignmentAt, Date.now());
assert.deepEqual([acceptance.order.delivery.current_latitude, acceptance.order.delivery.current_longitude], demoPickupRoute[0]);
assert.notDeepEqual(demoPickupRoute[0], demoRoute[0]);
assert.deepEqual(demoPickupRoute.at(-1), demoRoute[0]);
assert.equal(deliveryDemoFrame(demoPlan.pickedUpAt, Date.now()).progress, 0);
assert.equal(deliveryDemoFrame(demoPlan.deliveredAt, Date.now()).etaMinutes, 0);
let previousEta = Infinity;
for (let elapsed = 0; elapsed <= demoPlan.deliveredAt; elapsed++) {
  const value = deliveryDemoFrame(elapsed, Date.now());
  assert.ok(value.remainingSeconds <= previousEta, "ETA counts down from route/prep/pickup durations");
  previousEta = value.remainingSeconds;
}
assert.match(deliveryStageMessage("pending")[0], /kitchen/);
assert.match(deliveryStageMessage("assigned")[1], /GPS/);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  writes = [],
  passed = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
function monitor(page) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method()))
      writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
  });
}
monitor(page);
const base = "http://127.0.0.1:5173";
async function fits(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "No horizontal overflow",
  );
}
try {
  await page.goto(base + "/demo/delivery", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("button", { name: "Watch delivery" }),
  ).toBeVisible();
  await expect(page.locator(".leaflet-tile")).toHaveCount(0);
  await fits(page);
  await page.getByRole("button", { name: "Watch delivery" }).click();
  const layout = page.locator(".demo-layout");
  await expect(layout).toHaveAttribute("data-demo-status", "pending");
  const map = page.locator(".delivery-leaflet-map");
  await expect(map).toBeVisible();
  await expect(page.locator(".leaflet-overlay-pane path")).toHaveCount(3);
  await expect
    .poll(() => page.locator(".leaflet-tile-loaded").count(), {
      timeout: 15000,
    })
    .toBeGreaterThan(0);
  const mapId = await map.evaluate((element) => element._leaflet_id);
  for (const status of ["confirmed", "preparing", "assigned"]) {
    await expect(layout).toHaveAttribute("data-demo-status", status, {
      timeout: 10000,
    });
    console.log(`Automatic stage: ${status}`);
  }
  const rider = page.locator(".ruchigo-rider-marker");
  assert.ok(Math.abs(Number(await rider.getAttribute("data-latitude")) - demoRoute[0][0]) > .003, "Rider accepts away from the kitchen, not at it");
  await expect.poll(() => rider.getAttribute("class")).toMatch(/is-moving/);
  await page.screenshot({ path: "/private/tmp/ruchigo-rider-to-kitchen.png", fullPage: false });
  for (const status of ["ready", "at_restaurant", "picked_up", "out_for_delivery"]) {
    await expect(layout).toHaveAttribute("data-demo-status", status, { timeout: 15000 });
    console.log(`Automatic stage: ${status}`);
  }
  await expect(rider).toBeVisible();
  await expect
    .poll(() => rider.getAttribute("class"), { timeout: 5000 })
    .toMatch(/is-moving/);
  const beforePosition = await rider.evaluate(
    (element) => element.style.transform,
  );
  const beforeHeading = await rider
    .locator(".rider-heading")
    .getAttribute("style");
  await expect
    .poll(() => rider.evaluate((element) => element.style.transform))
    .not.toBe(beforePosition);
  await expect
    .poll(() => rider.locator(".rider-heading").getAttribute("style"), {
      timeout: 7000,
    })
    .not.toBe(beforeHeading);
  assert.equal(
    await rider
      .locator(".rider-tyre-tread")
      .first()
      .evaluate((element) => getComputedStyle(element).animationName),
    "rider-tyre-roll",
  );
  await expect(page.locator(".delivery-map-arrival strong")).toContainText(
    "Arriving in",
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-delivery-demo-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Expand delivery map", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Expanded delivery map" });
  await expect(dialog).toBeVisible();
  await expect(page.locator(".delivery-map-pin.home")).toBeInViewport();
  await expect(rider).toBeInViewport();
  await expect(
    dialog.getByText("Local demo · simulated delivery"),
  ).toBeVisible();
  const box = await map.boundingBox();
  assert.ok(box.width >= 1439 && box.height >= 1049, "Map fills viewport");
  const initialZoom = Number(await map.getAttribute("data-zoom"));
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(map).toHaveAttribute("data-zoom", String(initialZoom + 1));
  assert.equal(
    await map.evaluate((element) => element._leaflet_id),
    mapId,
    "Expand retains map instance",
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-delivery-demo-expanded.png",
    fullPage: false,
  });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Expand delivery map", exact: true }),
  ).toBeFocused();
  assert.equal(await map.evaluate((element) => element._leaflet_id), mapId);
  assert.equal(
    await map.getAttribute("data-zoom"),
    String(initialZoom + 1),
    "Collapse retains zoom",
  );
  await fits(page);
  await expect(layout).toHaveAttribute("data-demo-status", "delivered", {
    timeout: 35000,
  });
  await expect(page.locator(".delivery-map-arrival strong")).toHaveText(
    "Delivered",
  );
  await expect(rider).toHaveCount(0);
  await page.getByRole("button", { name: "Restart demo" }).click();
  await expect(layout).toHaveAttribute("data-demo-status", "pending");
  await expect(page.locator(".demo-timeline li.done")).toHaveCount(1);
  await page.goto(base + "/demo/delivery");
  await expect(
    page.getByRole("button", { name: "Watch delivery" }),
  ).toBeVisible();
  passed.push(
    "50-second lifecycle; road-following movement, changing heading, tyre animation, arrival estimate, clean completion/restart, no persisted demo",
  );

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  monitor(mobile);
  await mobile.goto(base + "/demo/delivery", { waitUntil: "networkidle" });
  await mobile.clock.install();
  await mobile.getByRole("button", { name: "Watch delivery" }).click();
  await expect(mobile.locator(".delivery-leaflet-map")).toBeVisible();
  await mobile.clock.runFor(35000);
  await expect(mobile.locator(".demo-layout")).toHaveAttribute(
    "data-demo-status",
    "out_for_delivery",
  );
  await expect(mobile.locator(".ruchigo-rider-marker")).not.toHaveClass(
    /is-moving/,
  );
  await fits(mobile);
  await mobile
    .getByRole("button", { name: "Expand delivery map", exact: true })
    .click();
  const mobileMap = mobile.locator(".delivery-leaflet-map");
  await mobile.clock.runFor(500);
  const mobileBox = await mobileMap.boundingBox();
  assert.ok(mobileBox.width >= 389 && mobileBox.height >= 843);
  const mobileZoom = Number(await mobileMap.getAttribute("data-zoom"));
  // Dispatch actual two-touch events through Chromium, not mouse wheel events.
  const cdp = await mobile.context().newCDPSession(mobile);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: 155, y: 420, id: 0 },
      { x: 235, y: 420, id: 1 },
    ],
  });
  for (let spread = 50; spread <= 125; spread += 15) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: 195 - spread, y: 420, id: 0 },
        { x: 195 + spread, y: 420, id: 1 },
      ],
    });
    await mobile.clock.runFor(30);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await mobile.clock.runFor(1000);
  assert.ok(
    Number(await mobileMap.getAttribute("data-zoom")) > mobileZoom,
    "Two-finger pinch increases zoom",
  );
  await mobile.screenshot({
    path: "/private/tmp/ruchigo-delivery-demo-mobile.png",
    fullPage: false,
  });
  await mobile
    .getByRole("button", { name: "Collapse delivery map", exact: true })
    .click();
  await expect(mobile.getByRole("dialog")).toHaveCount(0);
  assert.equal(await mobile.evaluate(() => document.body.style.overflow), "");
  await fits(mobile);
  passed.push(
    "Mobile 390px, fullscreen, real two-finger touch zoom, reduced-motion support, restored scroll/focus",
  );
  // Render the production map with an unpinned pending-order fixture. No
  // authenticated requests or changes to the user's real pending order.
  await page.evaluate(async () => {
    const { default: React } = await import("/node_modules/.vite/deps/react.js");
    const { default: ReactDOM } = await import("/node_modules/.vite/deps/react-dom_client.js");
    const { default: LiveDeliveryMap } = await import("/src/components/product/LiveDeliveryMap.jsx");
    const container = document.createElement("div");
    container.id = "pending-map-fixture";
    document.body.prepend(container);
    ReactDOM.createRoot(container).render(React.createElement(LiveDeliveryMap, { order: { id: "fixture-no-write", status: "pending", restaurant_detail: {}, delivery_address_detail: {} } }));
  });
  await expect(page.locator("#pending-map-fixture .delivery-stage-empty")).toContainText("Waiting for the kitchen");
  await expect(page.locator("#pending-map-fixture .delivery-leaflet-map")).toHaveCount(0);
  await expect(page.locator("#pending-map-fixture")).not.toContainText("Waiting for a location");
  passed.push("Real tracking component: pending unpinned order gets kitchen status, not a blank map or fabricated GPS");
  assert.deepEqual(writes, [], "The demo makes no server writes");
  assert.deepEqual(errors, [], "No browser errors");
  console.log(
    JSON.stringify(
      { passed, serverWrites: writes.length, browserErrors: errors.length },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
