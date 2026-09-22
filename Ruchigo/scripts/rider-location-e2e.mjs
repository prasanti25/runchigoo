import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";
import { locationFreshness, nearbyRiderPlace } from "../src/lib/tracking.js";

// Explicit local fixture only. Real browser GPS-write API, owned GPS-read API
// and LocationIQ; device fixes are controlled at a public landmark.
const base = "http://127.0.0.1:5173";
const marker = `rider-live-${randomUUID()}`;
const password = `Local-rider-${randomUUID()}`;
const env = {
  ...process.env,
  DATABASE_URL: "",
  POSTGRES_URL: "",
  DJANGO_SQLITE_PATH: "/private/tmp/ruchigo-product-preview.sqlite3",
  DJANGO_DEBUG: "True",
  DJANGO_DB_ENGINE: "sqlite",
};
function db(code, values) {
  const output = execFileSync(
    ".venv/bin/python",
    [
      "backend/manage.py",
      "shell",
      "-c",
      `import json,sys; payload=json.loads(sys.stdin.read()); ${code}`,
    ],
    { env, input: JSON.stringify(values), encoding: "utf8" },
  );
  return JSON.parse(output.trim().split("\n").at(-1));
}
const fixture = db(
  `from django.db import transaction; from api.models import User,Restaurant,Address,Order,DeliveryAssignment
with transaction.atomic():
 customer=User.objects.create_user(payload['marker']+'-customer@example.test',password=payload['password'],role='customer')
 owner=User.objects.create_user(payload['marker']+'-owner@example.test',role='restaurant')
 rider=User.objects.create_user(payload['marker']+'-rider@example.test',password=payload['password'],role='delivery',is_available=True)
 restaurant=Restaurant.objects.create(owner=owner,name='Temporary rider-location test',city='Delhi',is_approved=True,latitude='28.632000',longitude='77.217000')
 address=Address.objects.create(user=customer,line1='Local fixture only',city='Delhi',state='Delhi',postal_code='110001',latitude='28.634000',longitude='77.218000')
 order=Order.objects.create(customer=customer,restaurant=restaurant,delivery_address=address,status='assigned',subtotal=100,total=100)
 delivery=DeliveryAssignment.objects.create(order=order,partner=rider)
 print(json.dumps({'order':order.pk,'delivery':delivery.pk,'customer':customer.pk,'rider':rider.pk,'owner':owner.pk,'restaurant':restaurant.pk}))`,
  { marker, password },
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
async function session(role) {
  const response = await fetch(`${base}/api/v1/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `${marker}-${role}@example.test`,
      password,
      role: role === "rider" ? "delivery" : role,
    }),
  });
  assert.equal(response.status, 200);
  const auth = await response.json();
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
          expiresAt: Date.now() + 600000,
        }),
      ),
    auth,
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  return { page, context, token: auth.tokens.access };
}
try {
  assert.equal(
    locationFreshness(new Date(Date.now() - 16000).toISOString()).fresh,
    false,
  );
  assert.equal(
    nearbyRiderPlace(
      {
        label: "Old place",
        latitude: 28,
        longitude: 77,
        looked_up_at: new Date().toISOString(),
      },
      [29, 78],
    ),
    null,
  );
  const rider = await session("rider"),
    customer = await session("customer");
  await rider.context.addInitScript(() => {
    navigator.geolocation.watchPosition = (receive) => {
      window.emitRiderGPS = (latitude, longitude) =>
        receive({
          coords: { latitude, longitude, accuracy: 15 },
          timestamp: Date.now(),
        });
      window.emitRiderGPS(28.6315, 77.2167);
      return 1;
    };
    navigator.geolocation.clearWatch = () => {
      window.emitRiderGPS = null;
    };
  });
  await rider.page.goto(`${base}/delivery-navigation?order=${fixture.order}`);
  const sent = rider.page.waitForResponse(
    (response) =>
      response.url().endsWith(`/deliveries/${fixture.delivery}/`) &&
      response.request().method() === "PATCH",
  );
  await rider.page
    .getByRole("button", { name: "Share live location", exact: true })
    .click();
  assert.equal((await sent).status(), 200);
  const gpsReads = [];
  customer.page.on("response", (response) => {
    if (
      response.url().endsWith(`/orders/${fixture.order}/live-location/`) &&
      response.ok()
    )
      gpsReads.push(Date.now());
  });
  await customer.page.goto(`${base}/tracking/${fixture.order}`);
  await customer.page
    .getByRole("button", { name: "Show live map", exact: true })
    .click();
  const markerNode = customer.page.locator(".ruchigo-rider-marker");
  await expect(markerNode).toHaveAttribute("data-latitude", "28.6315");
  await expect(customer.page.locator(".rider-place-status")).toContainText(
    "Connaught Place",
    { timeout: 20000 },
  );
  await expect.poll(() => gpsReads.length).toBeGreaterThan(2);
  const started = Date.now();
  const changed = rider.page.waitForResponse(
    (response) =>
      response.url().endsWith(`/deliveries/${fixture.delivery}/`) &&
      response.request().method() === "PATCH",
  );
  await rider.page.evaluate(() => window.emitRiderGPS(28.63165, 77.21685));
  assert.equal((await changed).status(), 200);
  await expect(markerNode).toHaveAttribute("data-latitude", "28.63165", {
    timeout: 5000,
  });
  const observedDelayMs = Date.now() - started;
  assert.ok(
    observedDelayMs < 5000,
    "New real GPS fix should reach the map without the old ten-second polling delay",
  );
  for (const width of [1440, 390, 320]) {
    await customer.page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await customer.page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      "Tracking page must fit viewport",
    );
  }
  await customer.page.screenshot({
    path: "/private/tmp/ruchigo-rider-live-mobile.png",
    fullPage: true,
  });
  // A geocoder outage must not slow or replace actual GPS.
  await customer.context.route(
    `**/orders/${fixture.order}/rider-place/`,
    (route) =>
      route.fulfill({
        status: 503,
        json: { detail: "Controlled provider outage" },
      }),
  );
  await customer.page.reload();
  await customer.page
    .getByRole("button", { name: "Show live map", exact: true })
    .click();
  await expect(markerNode).toHaveAttribute("data-latitude", "28.63165");
  await expect(customer.page.locator(".rider-place-status")).toContainText(
    "Live GPS connected",
  );
  await rider.page
    .getByRole("button", { name: "Stop sharing location", exact: true })
    .click();
  await expect(customer.page.locator(".delivery-map-heading")).toContainText(
    "Last shared location",
    { timeout: 20000 },
  );
  await expect(customer.page.locator(".rider-place-status")).toContainText(
    "Waiting for your partner’s GPS",
  );
  // Mark only this controlled fixture complete; no real order is modified.
  db(
    `from api.models import Order; count=Order.objects.filter(pk=payload['order'],customer_id=payload['customer'],restaurant_id=payload['restaurant']).update(status='delivered'); print(json.dumps({'updated':count}))`,
    fixture,
  );
  await expect(markerNode).toHaveCount(0, { timeout: 5000 });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      passed: [
        "Real opt-in rider browser writes",
        "Owned lightweight GPS channel",
        "Real LocationIQ road label",
        "Movement reaches map in under five seconds",
        "Provider failure does not stop GPS",
        "Stale sharing state",
        "Completion clears rider",
        "1440/390/320",
      ],
      observedDelayMs,
      browserErrors: errors,
      productionBusinessWrites: 0,
      fixtureOrder: fixture.order,
    }),
  );
  await rider.context.close();
  await customer.context.close();
} finally {
  await browser.close();
  const cleaned = db(
    `from django.db import transaction; from api.models import User,Order,Restaurant
with transaction.atomic():
 order=Order.objects.filter(pk=payload['order'],customer_id=payload['customer'],restaurant_id=payload['restaurant']).first()
 if order: order.delete()
 restaurant=Restaurant.objects.filter(pk=payload['restaurant'],owner_id=payload['owner']).first()
 if restaurant: restaurant.delete()
 deleted=User.objects.filter(pk__in=[payload['customer'],payload['rider'],payload['owner']],email__startswith=payload['marker']).delete()[0]
 print(json.dumps({'fixtureUsersDeleted':deleted}))`,
    { ...fixture, marker },
  );
  assert.ok(
    cleaned.fixtureUsersDeleted >= 3,
    "Delete only exact test-owned records",
  );
}
