import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";

// Real LocationIQ via the application backend, never a mocked HTTP response.
// Device GPS is controlled at a PUBLIC landmark, not a person's location.
// Production mode is public-only and cannot create users, addresses or orders.
const base = (
  process.env.RUCHIGO_LOCATION_BASE_URL || "http://127.0.0.1:5173"
).replace(/\/$/, "");
assert.ok(
  ["http://127.0.0.1:5173", "https://runchigoo.vercel.app"].includes(base),
  "Unrecognized test target",
);
const local = base.startsWith("http://127.0.0.1:");
const point = { latitude: 28.6315, longitude: 77.2167, accuracy: 15 };
const marker = randomUUID().slice(0, 8);
const email = `address-live-${marker}@example.test`,
  password = `Location-fixture-${marker}-only`;
let adminToken, customerId, auth;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  browserProviderCalls = [];
async function api(path, { token, method = "GET", body } = {}) {
  assert.ok(local, "Authenticated fixture API is local-only");
  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20000),
  });
  assert.ok(response.ok, `${path}: HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}
try {
  if (local) {
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
        first_name: "Address Live QA",
        email,
        password,
        role: "customer",
        reason: "Local live-geocoding browser fixture at a public landmark",
      },
    });
    customerId = customer.id;
    auth = await api("/auth/login/", {
      method: "POST",
      body: { email, password, role: "customer" },
    });
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    geolocation: point,
    permissions: ["geolocation"],
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
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname.endsWith("locationiq.com"))
      browserProviderCalls.push(url.hostname);
  });
  await page.goto(local ? `${base}/addresses` : base);
  await page.locator(".location-trigger").click();
  const lookupResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/location/reverse/") &&
      response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Use my current location", exact: true })
    .click();
  const response = await lookupResponse;
  assert.equal(
    response.status(),
    200,
    "Real backend/provider lookup must succeed",
  );
  assert.equal(response.headers()["cache-control"], "private, no-store");
  const payload = await response.json();
  const address = payload.address;
  assert.equal(payload.status, "ready");
  assert.equal(address.locality, "Connaught Place");
  assert.equal(address.city, "Delhi");
  assert.equal(address.state, "Delhi");
  assert.equal(address.postal_code, "110001");
  assert.ok(address.line1, "Provider must return a street");
  assert.equal(address.partial, false);
  assert.ok(
    !/pk\.[a-zA-Z0-9]{20,}/.test(JSON.stringify(payload)),
    "Provider credentials must not enter browser responses",
  );
  assert.deepEqual(response.request().postDataJSON(), {
    latitude: "28.631500",
    longitude: "77.216700",
    consent: true,
  });
  const picker = page.getByRole("dialog", {
    name: "Set your delivery location",
  });
  await expect(
    picker.getByRole("heading", { name: address.label, exact: true }),
  ).toBeVisible();
  await expect(picker.locator(".address-detected")).toContainText(
    address.line1,
  );
  await expect(picker.locator(".leaflet-tile-loaded").first()).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    assert.ok(
      await picker.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      "Address picker must not overflow",
    );
    await page.screenshot({
      path: `/private/tmp/ruchigo-address-${local ? "local-live" : "production-live"}-${width}.png`,
    });
  }
  await picker
    .getByRole("button", { name: "Confirm location", exact: true })
    .click();
  if (local) {
    const form = page.getByRole("dialog", {
      name: "Where should we bring your food?",
    });
    await expect(form.getByLabel("House / flat number and street")).toHaveValue(
      address.line1,
    );
    await expect(form.getByLabel("City", { exact: true })).toHaveValue(
      address.city,
    );
    await expect(form.getByLabel("State", { exact: true })).toHaveValue(
      address.state,
    );
    await expect(form.getByLabel("Postal code")).toHaveValue(
      address.postal_code,
    );
    await form
      .getByLabel("House / flat number and street")
      .fill(`QA flat, ${address.line1}`);
    await form.getByRole("button", { name: "Save delivery address" }).click();
    await expect(form).not.toBeVisible();
    await expect(page.locator(".location-trigger")).toContainText(
      `Home · QA flat, ${address.line1}`,
    );
    const saved = await api("/addresses/", { token: auth.tokens.access });
    assert.equal(saved.count, 1);
    assert.equal(saved.results[0].latitude, "28.631500");
    assert.equal(saved.results[0].longitude, "77.216700");
    assert.equal(saved.results[0].line1, `QA flat, ${address.line1}`);
    await page.reload();
    await expect(page.locator(".location-trigger")).toContainText(
      `Home · QA flat, ${address.line1}`,
    );
    assert.equal(
      (await api("/orders/", { token: auth.tokens.access })).count,
      0,
    );
  } else {
    await expect(picker).not.toBeVisible();
    await expect(page.locator(".location-trigger")).toContainText(
      address.locality,
    );
    await expect(page.locator(".location-trigger")).toContainText(
      address.line1,
    );
    await page.reload();
    await expect(page.locator(".location-trigger")).toContainText(
      address.line1,
    );
  }
  assert.deepEqual(
    browserProviderCalls,
    [],
    "Provider requests must remain server-side",
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      target: local ? "local" : "production-public-only",
      geocoding: "Real LocationIQ",
      gps: "Controlled public-landmark coordinates",
      address: {
        street: address.line1,
        locality: address.locality,
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
      },
      passed: [
        "Actual provider-backed address lookup",
        "Desktop/mobile map and confirmation",
        "Header persistence",
        ...(local
          ? [
              "Flat edit and actual local account save",
              "Stored coordinates match GPS, not provider centroid",
            ]
          : []),
        "No provider credential in browser",
        "No browser errors",
      ],
      createdOrders: 0,
      productionBusinessWrites: 0,
    }),
  );
  await context.close();
} finally {
  if (local && customerId && adminToken) {
    const customer = await api(`/users/${customerId}/`, { token: adminToken });
    if (customer.email === email)
      await api(`/users/${customerId}/`, {
        token: adminToken,
        method: "DELETE",
      });
  }
  await browser.close();
}
