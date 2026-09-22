import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";
import {
  addressDraft,
  deliveryLocationFromAddress,
  locationPoint,
} from "../src/lib/addressLocation.js";

// Local-only. GPS and reverse-geocoding responses are controlled fixtures.
// Address persistence, auth, cart and checkout selection use the real local API.
// No orders are placed, no production records are read or changed.
const base = "http://127.0.0.1:5173";
const marker = randomUUID().slice(0, 8);
const email = `address-ui-${marker}@example.test`;
const password = `Address-fixture-${marker}-only`;
const point = { latitude: 28.6315, longitude: 77.2167, accuracy: 20 };
const fixture = {
  status: "ready",
  address: {
    label: "Connaught Place",
    line1: "Parliament Street",
    line2: "Connaught Place",
    locality: "Connaught Place",
    city: "Delhi",
    state: "Delhi",
    postal_code: "110001",
    country_code: "IN",
    formatted_address: "Parliament Street, Connaught Place, Delhi, 110001",
    partial: false,
    attribution: "Search by LocationIQ",
  },
};
const requests = [],
  errors = [];
let customerId,
  adminToken,
  responseMode = "ready",
  releaseStale;
const browser = await chromium.launch({ channel: "chrome", headless: true });
async function api(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.ok(response.ok, `${path}: HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}
async function contextFor(auth, extra = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    geolocation: point,
    permissions: ["geolocation"],
    ...extra,
  });
  // Reproduce the extension's broken one-shot API without altering watchPosition.
  await context.addInitScript(() => {
    navigator.geolocation.getCurrentPosition = (_ok, fail) =>
      fail({ code: 1, message: "User denied Geolocation" });
  });
  if (auth)
    await context.addInitScript(({ user, tokens }) => {
      localStorage.setItem(
        "ruchigo-auth",
        JSON.stringify({
          user,
          role: user.role,
          token: tokens.access,
          refreshToken: tokens.refresh,
          expiresAt: Date.now() + 600000,
        }),
      );
    }, auth);
  // This suite controls LocationIQ-shaped responses; keep its renderer paired
  // with those fixtures even when the local app is configured for Google.
  await context.route(
    "**/api/v1/location/map-config/?purpose=address",
    (route) =>
      route.fulfill({
        json: {
          provider: "OpenStreetMap",
          tile_url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution: "© OpenStreetMap contributors",
          attribution_url: "https://www.openstreetmap.org/copyright",
        },
      }),
  );
  await context.route("**/api/v1/location/reverse/", async (route) => {
    const body = route.request().postDataJSON();
    requests.push(body);
    assert.equal(body.consent, true);
    assert.deepEqual(Object.keys(body).sort(), [
      "consent",
      "latitude",
      "longitude",
    ]);
    const mode = responseMode;
    if (mode === "stale") {
      await new Promise((resolve) => {
        releaseStale = resolve;
      });
      await route
        .fulfill({
          json: {
            ...fixture,
            address: {
              ...fixture.address,
              label: "Stale address must not appear",
            },
          },
        })
        .catch(() => {});
    } else if (mode === "failed")
      await route.fulfill({
        status: 503,
        json: {
          detail:
            "Address lookup is temporarily unavailable. You can keep this pin and fill in the address.",
        },
      });
    else
      await route.fulfill({
        json:
          mode === "locality-only"
            ? {
                ...fixture,
                address: {
                  ...fixture.address,
                  line1: "Connaught Place",
                  line2: "",
                  partial: true,
                },
              }
            : mode === "partial"
              ? {
                  ...fixture,
                  address: {
                    ...fixture.address,
                    partial: true,
                    postal_code: "",
                  },
                }
              : fixture,
      });
  });
  return context;
}
async function openPicker(page) {
  await page.locator(".location-trigger").click();
  await expect(
    page.getByRole("button", { name: "Use approximate network location" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Use my current location", exact: true })
    .click();
  return page.getByRole("dialog", { name: "Set your delivery location" });
}
async function noOverflow(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Page must not overflow horizontally",
  );
  assert.ok(
    await page
      .getByRole("dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    "Dialog must not overflow horizontally",
  );
}
try {
  for (const value of [null, "", " ", true, [], {}, "NaN", Infinity, 91])
    assert.equal(locationPoint({ latitude: value, longitude: 0 }), null);
  assert.deepEqual(locationPoint({ latitude: 0, longitude: 0 }), {
    latitude: 0,
    longitude: 0,
  });
  assert.equal(
    addressDraft({ city: "Delhi", latitude: 28, longitude: 77 }).latitude,
    undefined,
  );
  assert.equal(
    deliveryLocationFromAddress({
      id: 7,
      label: "Work",
      line1: "Test street",
      city: "Delhi",
    }).address_id,
    7,
  );
  const admin = await api("/auth/login/", {
    method: "POST",
    body: {
      email: "preview.admin@ruchigo.test",
      role: "admin",
      password: "RuchiGo-preview-2026",
    },
  });
  adminToken = admin.tokens.access;
  const customer = await api("/users/", {
    token: adminToken,
    method: "POST",
    body: {
      first_name: "Address QA",
      email,
      password,
      role: "customer",
      reason: "Isolated local delivery-address flow test",
    },
  });
  customerId = customer.id;
  const auth = await api("/auth/login/", {
    method: "POST",
    body: { email, password, role: "customer" },
  });
  const token = auth.tokens.access;
  await api("/addresses/", {
    token,
    method: "POST",
    body: {
      label: "Home",
      line1: "Other fixture address",
      city: "Delhi",
      state: "Delhi",
      postal_code: "110001",
      is_default: true,
    },
  });
  const context = await contextFor(auth);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/addresses`);
  const picker = await openPicker(page);
  await expect(
    picker.getByRole("heading", { name: "Connaught Place" }),
  ).toBeVisible();
  await expect(picker.locator(".leaflet-tile-loaded").first()).toBeVisible();
  await expect(picker).not.toContainText("LocationIQ");
  await expect(
    picker.getByRole("link", { name: "Location privacy" }),
  ).toHaveAttribute("href", "/privacy#location");
  await expect(
    picker
      .locator(".leaflet-control-attribution")
      .filter({ hasText: "OpenStreetMap" }),
  ).toBeVisible();
  assert.equal(requests[0].latitude, "28.631500");
  assert.equal(
    (await api("/addresses/", { token })).count,
    1,
    "Looking up a pin must not save an address",
  );
  const initialLookups = requests.length;
  await picker.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(
    picker.getByRole("heading", { name: "Connaught Place" }),
  ).toBeVisible();
  await picker.getByRole("button", { name: "Expand address map" }).click();
  await expect(picker.locator(".address-map-stage")).toHaveClass(/is-expanded/);
  await picker.getByRole("button", { name: "Collapse address map" }).click();
  await expect(
    picker.getByRole("heading", { name: "Connaught Place" }),
  ).toBeVisible();
  assert.equal(
    requests.length,
    initialLookups,
    "Zoom and expand must not trigger paid lookups",
  );
  const map = picker.getByRole("region", {
    name: "Choose your delivery pin on the map",
  });
  const pin = picker.locator(".address-map-center-pin");
  const mapBox = await map.boundingBox();
  await page.mouse.move(mapBox.x + 130, mapBox.y + 210);
  await page.mouse.down();
  await page.mouse.move(mapBox.x + 170, mapBox.y + 185, { steps: 8 });
  await expect(pin).toHaveClass(/is-moving/);
  await page.mouse.up();
  await expect(pin).not.toHaveClass(/is-moving/);
  assert.equal(
    requests.length,
    initialLookups,
    "Dragging the pin must not trigger paid lookups",
  );
  await map.click({ position: { x: 190, y: 110 } });
  await expect(
    picker.getByRole("heading", { name: "Your selected pin" }),
  ).toBeVisible();
  await picker
    .getByRole("button", { name: "Find address for this pin" })
    .click();
  await expect(
    picker.getByRole("heading", { name: "Connaught Place" }),
  ).toBeVisible();
  const selectedPoint = requests.at(-1);
  assert.notEqual(selectedPoint.latitude, requests[0].latitude);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width >= 768 ? 1000 : 844 });
    await noOverflow(page);
    const alignment = await map.evaluate((element) => {
      const canvas = element.getBoundingClientRect();
      const marker = element.parentElement
        .querySelector(".address-map-center-pin")
        .getBoundingClientRect();
      return {
        x: Math.abs(marker.x - canvas.x - canvas.width / 2),
        y: Math.abs(marker.y - canvas.y - canvas.height / 2),
      };
    });
    assert.ok(
      alignment.x < 1 && alignment.y < 1,
      "Pin target must stay centred on the selected coordinates",
    );
    await expect(
      picker.getByRole("heading", { name: "Connaught Place" }),
    ).toBeVisible();
    if ([1440, 390].includes(width))
      await page.screenshot({
        path: `/private/tmp/ruchigo-address-${width}.png`,
        fullPage: true,
      });
  }
  await picker
    .getByRole("button", { name: "Add delivery details", exact: true })
    .click();
  let form = page.getByRole("dialog", {
    name: "Where should we bring your food?",
  });
  await expect(form.getByLabel("Street / area")).toHaveValue(
    "Parliament Street",
  );
  await expect(form.getByLabel("City", { exact: true })).toHaveValue("Delhi");
  await expect(form.getByLabel("House / flat / building")).toHaveValue("");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await noOverflow(page);
    if (width !== 320)
      await page.screenshot({
        path: `/private/tmp/ruchigo-delivery-details-${width}.png`,
      });
  }
  await form.getByRole("button", { name: "Save delivery address" }).click();
  await expect(form).toBeVisible();
  assert.equal((await api("/addresses/", { token })).count, 1);
  await form.getByLabel("House / flat / building").fill("Flat 4");
  await form.getByLabel("Floor (optional)").fill("2nd");
  await form.getByLabel("Save as").selectOption("Work");
  await form.getByRole("button", { name: "Save delivery address" }).click();
  await expect(form).not.toBeVisible();
  await expect(page.locator(".location-trigger")).toContainText(
    "Work · Flat 4",
  );
  await expect(
    page.locator(".address-card").filter({
      has: page.getByRole("heading", { name: "Work", exact: true }),
    }),
  ).toBeVisible();
  let addresses = await api("/addresses/", { token });
  const saved = addresses.results.find((row) => row.label === "Work");
  assert.equal(saved.latitude, selectedPoint.latitude);
  assert.equal(saved.longitude, selectedPoint.longitude);
  assert.equal(saved.line1, "Flat 4, Parliament Street");
  assert.ok(saved.line2.includes("Floor: 2nd"));
  await page.reload();
  await expect(page.locator(".location-trigger")).toContainText(
    "Work · Flat 4",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .locator(".address-card")
    .filter({ has: page.getByRole("heading", { name: "Work", exact: true }) })
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await page.getByRole("button", { name: "Update location pin" }).click();
  await page
    .getByRole("button", { name: "Use current location", exact: true })
    .click();
  await expect(
    picker.getByRole("heading", { name: "Connaught Place" }),
  ).toBeVisible();
  await picker
    .getByRole("button", { name: "Enter address manually", exact: true })
    .click();
  form = page.getByRole("dialog", { name: "Where should we bring your food?" });
  await expect(form.getByLabel("House / flat number and street")).toHaveValue(
    "Flat 4, Parliament Street",
  );
  await expect(form.getByLabel("Landmark or additional details")).toHaveValue(
    /Floor: 2nd/,
  );
  await form.getByRole("button", { name: "Save delivery address" }).click();
  await expect(form).not.toBeVisible();
  const menu = await api("/menu-items/");
  const item = menu.results.find(
    (row) => !row.add_ons?.length && row.restaurant_detail.city === "Delhi",
  );
  assert.ok(item);
  await api("/cart/items/", {
    token,
    method: "POST",
    body: { menu_item: item.id, quantity: 1 },
  });
  await page.goto(`${base}/checkout`);
  await expect(
    page
      .locator(".address-option")
      .filter({ hasText: "Flat 4, Parliament Street" })
      .getByRole("radio"),
  ).toBeChecked();
  await page.locator(".location-trigger").click();
  await page
    .locator(".location-saved-address")
    .filter({ hasText: "Other fixture address" })
    .click();
  await expect(
    page
      .locator(".address-option")
      .filter({ hasText: "Other fixture address" })
      .getByRole("radio"),
  ).toBeChecked();
  await page
    .locator(".address-option")
    .filter({ hasText: "Flat 4, Parliament Street" })
    .getByRole("radio")
    .check();
  await expect(page.locator(".location-trigger")).toContainText(
    "Work · Flat 4",
  );
  await page.locator(".location-trigger").click();
  await page
    .locator(".location-saved-address")
    .filter({ hasText: "Other fixture address" })
    .click();
  await expect(
    page
      .locator(".address-option")
      .filter({ hasText: "Other fixture address" })
      .getByRole("radio"),
  ).toBeChecked();
  // A slow answer for an old pin must not replace a later selected location.
  responseMode = "stale";
  await openPicker(page);
  await expect.poll(() => typeof releaseStale).toBe("function");
  await picker.getByRole("region").click({ position: { x: 190, y: 110 } });
  responseMode = "ready";
  await picker
    .getByRole("button", { name: "Find address for this pin" })
    .click();
  await expect(
    picker.getByRole("heading", { name: "Connaught Place" }),
  ).toBeVisible();
  releaseStale();
  await expect(picker).not.toContainText("Stale address must not appear");
  // Moving the pin invalidates its old address, including the manual shortcut.
  await picker.getByRole("region").click({ position: { x: 155, y: 165 } });
  await picker.getByRole("button", { name: "Enter address manually" }).click();
  await expect(form.getByLabel("Street / area")).toHaveValue("");
  await expect(form.getByLabel("City", { exact: true })).toHaveValue("");
  await form.getByRole("button", { name: "Close dialog" }).click();
  responseMode = "failed";
  await openPicker(page);
  await expect(picker.getByRole("alert")).toContainText(
    "temporarily unavailable",
  );
  await picker
    .getByRole("button", { name: "Add delivery details", exact: true })
    .click();
  await expect(form.getByLabel("Street / area")).toHaveValue("");
  await expect(form.getByLabel("City", { exact: true })).toHaveValue("");
  await form.getByRole("button", { name: "Close dialog" }).click();
  responseMode = "partial";
  await openPicker(page);
  await expect(picker).toContainText(
    "Add your postal code with your delivery details",
  );
  await picker.getByRole("button", { name: "Enter address manually" }).click();
  await expect(form.getByLabel("Street / area")).toHaveValue(
    "Parliament Street",
  );
  await expect(form.getByLabel("City", { exact: true })).toHaveValue("Delhi");
  await expect(form.getByLabel("State", { exact: true })).toHaveValue("Delhi");
  await expect(form.getByLabel("Postal code")).toHaveValue("");
  await expect(form.getByLabel("House / flat / building")).toHaveValue("");
  await form.getByRole("button", { name: "Close dialog" }).click();
  addresses = await api("/addresses/", { token });
  assert.equal(addresses.count, 2);
  assert.equal((await api("/orders/", { token })).count, 0);
  await page.getByRole("button", { name: "Open account menu" }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("ruchigo-delivery-location")),
    )
    .toBe(null);
  await context.close();
  responseMode = "ready";
  // Denied, unavailable and timed-out GPS; no authenticated writes.
  for (const code of [1, 2, 3]) {
    const denied = await contextFor(null, {
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    await denied.addInitScript((code) => {
      navigator.geolocation.watchPosition = (_ok, fail) => {
        fail({ code });
        return 0;
      };
      navigator.geolocation.clearWatch = () => {};
    }, code);
    const testPage = await denied.newPage();
    testPage.on("pageerror", (error) => errors.push(error.message));
    await testPage.goto(base);
    const deniedPicker = await openPicker(testPage);
    await expect(deniedPicker.getByRole("alert")).toContainText(
      code === 1
        ? "We couldn’t access your location"
        : code === 2
          ? "unavailable right now"
          : "too long",
    );
    await expect(
      deniedPicker.getByRole("button", {
        name: "Add delivery details",
        exact: true,
      }),
    ).toBeDisabled();
    await noOverflow(testPage);
    await expect(deniedPicker.locator("details")).toHaveCount(0);
    await expect(deniedPicker).not.toContainText(
      /System Settings|Location Services|Google Chrome|localhost|permission is off/,
    );
    const retry = deniedPicker.getByRole("button", {
      name: "Try again",
      exact: true,
    });
    await retry.click();
    await expect(retry).toBeEnabled();
    await testPage.screenshot({
      path: `/private/tmp/ruchigo-location-recovery-${code}.png`,
    });
    await testPage.evaluate((point) => {
      navigator.geolocation.watchPosition = (receive) => {
        receive({ coords: point });
        return 0;
      };
    }, point);
    await retry.click();
    await expect(
      deniedPicker.getByRole("heading", { name: "Connaught Place" }),
    ).toBeVisible();
    await expect(deniedPicker.getByRole("alert")).toHaveCount(0);
    await expect(
      deniedPicker.getByRole("button", {
        name: "Add delivery details",
        exact: true,
      }),
    ).toBeEnabled();
    await deniedPicker
      .getByRole("button", { name: "Enter address manually" })
      .click();
    const manual = testPage.getByRole("dialog", {
      name: "Where should we bring your food?",
    });
    await expect(manual).toBeVisible();
    await expect(manual.getByLabel("Street / area")).toHaveValue(
      "Parliament Street",
    );
    await expect(
      manual.getByLabel("Landmark or additional details"),
    ).toHaveValue("Connaught Place");
    await expect(manual.getByLabel("City", { exact: true })).toHaveValue(
      "Delhi",
    );
    await expect(manual.getByLabel("State", { exact: true })).toHaveValue(
      "Delhi",
    );
    await expect(manual.getByLabel("Postal code")).toHaveValue("110001");
    await expect(manual.getByLabel("House / flat / building")).toHaveValue("");
    await manual.getByLabel("House / flat / building").fill("Manual fixture");
    await manual.getByLabel("Street / area").fill("Outer Circle");
    await manual.getByRole("button", { name: "Use this address" }).click();
    await expect(testPage.locator(".location-trigger")).toContainText(
      "Manual fixture, Outer Circle",
    );
    await testPage.reload();
    await expect(testPage.locator(".location-trigger")).toContainText(
      "Manual fixture, Outer Circle",
    );
    const manualSaved = await testPage.evaluate(() =>
      JSON.parse(localStorage.getItem("ruchigo-delivery-location")),
    );
    assert.equal(Number(manualSaved.latitude), point.latitude);
    assert.equal(Number(manualSaved.longitude), point.longitude);
    await denied.close();
  }
  // Locality-only lookup is usable, but every guest still gets delivery details.
  responseMode = "locality-only";
  const guest = await contextFor(null);
  const guestPage = await guest.newPage();
  guestPage.on("pageerror", (error) => errors.push(error.message));
  await guestPage.goto(base);
  const guestPicker = await openPicker(guestPage);
  await expect(
    guestPicker.getByRole("heading", { name: "Connaught Place" }),
  ).toBeVisible();
  await expect(guestPicker.locator(".address-accuracy-warning")).toHaveCount(0);
  await expect(guestPicker.locator(".eyebrow")).toHaveText("AREA LOCATED");
  await expect(guestPicker.locator(".address-picker-note")).toContainText(
    "Add your street and house number next",
  );
  await expect(guestPicker).not.toContainText("LocationIQ");
  await expect(guestPicker).not.toContainText(
    "Some address details are missing",
  );
  await guestPicker
    .getByRole("button", { name: "Enter address manually", exact: true })
    .click();
  const guestForm = guestPage.getByRole("dialog", {
    name: "Where should we bring your food?",
  });
  await expect(guestForm.getByLabel("Street / area")).toHaveValue(
    "Connaught Place",
  );
  await expect(guestForm.getByLabel("City", { exact: true })).toHaveValue(
    "Delhi",
  );
  await expect(guestForm.getByLabel("State", { exact: true })).toHaveValue(
    "Delhi",
  );
  await expect(guestForm.getByLabel("Postal code")).toHaveValue("110001");
  await guestForm
    .getByRole("button", { name: "Use this address", exact: true })
    .click();
  await expect(guestForm).toBeVisible();
  assert.equal(
    await guestPage.evaluate(() =>
      localStorage.getItem("ruchigo-delivery-location"),
    ),
    null,
  );
  await guestForm.getByLabel("House / flat / building").fill("QA unit 4");
  await guestForm
    .getByLabel("Street / area")
    .fill("Test Street 8, Connaught Place");
  await guestForm.getByLabel("Floor (optional)").fill("Ground");
  await guestForm
    .getByLabel("Landmark or additional details")
    .fill("Public test landmark");
  // Returning from an unchanged pin without another lookup must keep autofill
  // and typed details. A fresh lookup must not overwrite user edits either.
  const beforeReopen = requests.length;
  await guestForm.getByRole("button", { name: "Update location pin" }).click();
  await guestPicker
    .getByRole("button", { name: "Enter address manually" })
    .click();
  assert.equal(requests.length, beforeReopen);
  await expect(guestForm.getByLabel("City", { exact: true })).toHaveValue(
    "Delhi",
  );
  await expect(guestForm.getByLabel("Postal code")).toHaveValue("110001");
  await guestForm.getByRole("button", { name: "Update location pin" }).click();
  await guestPicker
    .getByRole("button", { name: "Use current location", exact: true })
    .click();
  await expect(
    guestPicker.getByRole("heading", { name: "Connaught Place" }),
  ).toBeVisible();
  await guestPicker
    .getByRole("button", { name: "Enter address manually" })
    .click();
  await expect(guestForm.getByLabel("House / flat / building")).toHaveValue(
    "QA unit 4",
  );
  await expect(guestForm.getByLabel("Street / area")).toHaveValue(
    "Test Street 8, Connaught Place",
  );
  await expect(guestForm.getByLabel("Floor (optional)")).toHaveValue("Ground");
  await expect(
    guestForm.getByLabel("Landmark or additional details"),
  ).toHaveValue("Public test landmark");
  await guestForm
    .getByRole("button", { name: "Use this address", exact: true })
    .click();
  await expect(guestPage.locator(".location-trigger")).toContainText(
    "QA unit 4",
  );
  await guestPage.reload();
  await expect(guestPage.locator(".location-trigger")).toContainText(
    "QA unit 4",
  );
  const savedGuest = await guestPage.evaluate(() =>
    JSON.parse(localStorage.getItem("ruchigo-delivery-location")),
  );
  assert.equal(Number(savedGuest.latitude), point.latitude);
  assert.equal(Number(savedGuest.longitude), point.longitude);
  assert.equal(savedGuest.line1, "QA unit 4, Test Street 8, Connaught Place");
  assert.equal(savedGuest.line2, "Floor: Ground, Public test landmark");
  await guestPage.goto(`${base}/privacy#location`);
  await expect(
    guestPage
      .locator("#location")
      .getByRole("link", { name: "Search by LocationIQ" }),
  ).toHaveAttribute("href", "https://locationiq.com/");
  await guest.close();
  responseMode = "ready";
  // Nearby discovery must use the same bounded location acquisition.
  const nearby = await contextFor(null);
  const nearbyPage = await nearby.newPage();
  nearbyPage.on("pageerror", (error) => errors.push(error.message));
  await nearbyPage.goto(`${base}/search`);
  await nearbyPage
    .getByRole("button", { name: "Near me", exact: true })
    .click();
  await expect(nearbyPage).toHaveURL(/radius_km=5/);
  await expect(
    nearbyPage.getByRole("button", { name: "Near me", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await nearby.close();
  // A wrapper that never invokes either callback must not leave a stuck spinner.
  const silent = await contextFor(null);
  await silent.addInitScript(() => {
    window.locationWatchClears = 0;
    navigator.geolocation.watchPosition = () => 0;
    navigator.geolocation.clearWatch = () => {
      window.locationWatchClears++;
    };
  });
  const silentPage = await silent.newPage();
  silentPage.on("pageerror", (error) => errors.push(error.message));
  await silentPage.clock.install();
  await silentPage.goto(base);
  const silentPicker = await openPicker(silentPage);
  await expect(
    silentPicker.getByRole("button", { name: "Locating…", exact: true }),
  ).toBeDisabled();
  await silentPage.clock.fastForward(16000);
  await expect(silentPicker.getByRole("alert")).toContainText("too long");
  await expect(
    silentPicker.getByRole("button", { name: "Try again", exact: true }),
  ).toBeEnabled();
  assert.equal(await silentPage.evaluate(() => window.locationWatchClears), 1);
  await silentPicker
    .getByRole("button", { name: "Try again", exact: true })
    .click();
  await silentPicker
    .getByRole("button", { name: "Enter address manually" })
    .click();
  const emptyManual = silentPage.getByRole("dialog", {
    name: "Where should we bring your food?",
  });
  await expect(emptyManual.getByLabel("Street / area")).toHaveValue("");
  await expect(emptyManual.getByLabel("City", { exact: true })).toHaveValue("");
  await expect(
    emptyManual.getByRole("button", { name: "Use my current location" }),
  ).toBeVisible();
  assert.equal(await silentPage.evaluate(() => window.locationWatchClears), 2);
  await silent.close();
  responseMode = "ready";
  const touch = await contextFor(null, {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
    geolocation: { ...point, accuracy: 450 },
  });
  const touchPage = await touch.newPage();
  touchPage.on("pageerror", (error) => errors.push(error.message));
  await touchPage.goto(base);
  const touchPicker = await openPicker(touchPage);
  await expect(touchPicker.locator(".address-pin-artwork")).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await expect(touchPicker).toContainText("radius of about 450 m");
  await touchPicker.getByRole("button", { name: "Expand address map" }).click();
  const touchMap = touchPicker.getByRole("region");
  const box = await touchMap.boundingBox();
  const cx = box.x + box.width / 2,
    cy = box.y + box.height / 2;
  const session = await touch.newCDPSession(touchPage);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: cx - 35, y: cy },
      { x: cx + 35, y: cy },
    ],
  });
  for (const offset of [45, 60, 80])
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: cx - offset, y: cy },
        { x: cx + offset, y: cy },
      ],
    });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(() => touchMap.locator('img.leaflet-tile[src*="/18/"]').count())
    .toBeGreaterThan(0);
  await touchPicker
    .getByRole("button", { name: "Collapse address map" })
    .click();
  await touchPicker.getByRole("button", { name: "Close dialog" }).click();
  await touch.close();
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      passed: [
        "GPS coordinates and consent",
        "No save before confirmation",
        "Pan/zoom/expand without paid request loops",
        "1440/768/390/320 layouts",
        "Street autofill and flat edit",
        "Real API address persistence and reload",
        "Saved address matches checkout both ways",
        "Preserves typed flat on pin update",
        "Stale lookup ignored",
        "Unavailable/partial lookup fallback",
        "Permission denied/timeout/full manual guest address",
        "Same-dialog GPS retry recovery without OS troubleshooting copy",
        "Broken one-shot wrapper and silent callback deadline",
        "Guest pin confirmation opens editable delivery details",
        "Required house/flat, optional floor and actual persisted address lines",
        "Modern pin drag state, coordinate alignment and reduced motion",
        "Locality-only result and nearby discovery",
        "Approximate network location removed",
        "Touch pinch zoom and low accuracy warning",
        "Logout clears precise address",
      ],
      geocoding: "Mock provider fixtures, not a live provider test",
      browserErrors: errors,
      createdOrders: 0,
    }),
  );
} finally {
  releaseStale?.();
  if (customerId && adminToken) {
    const customer = await api(`/users/${customerId}/`, { token: adminToken });
    if (customer.email === email)
      await api(`/users/${customerId}/`, {
        token: adminToken,
        method: "DELETE",
      });
  }
  await browser.close();
}
