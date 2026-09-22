import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

// Local-only Google interface/lookup fixtures. This does NOT certify the real
// Maps JavaScript key, Google's imagery or geocoding coverage.
const base = "http://127.0.0.1:5173";
const point = { latitude: 28.6315, longitude: 77.2167, accuracy: 15 };
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  lookups = [],
  writes = [];
function mapFixture() {
  class FixtureMap {
    constructor(element, options) {
      this.center = options.center;
      this.listeners = {};
      window.fixtureGoogleMap = this;
      const surface = document.createElement("div");
      surface.textContent = "Google Maps interface fixture (not live imagery)";
      surface.style.cssText =
        "height:100%;background:#e6eee4;padding:20px;font-size:12px";
      element.appendChild(surface);
      queueMicrotask(() => this.fire("tilesloaded"));
    }
    getCenter() {
      const { lat, lng } = this.center;
      return { lat: () => lat, lng: () => lng };
    }
    setCenter(center) {
      const next =
        typeof center.lat === "function"
          ? { lat: center.lat(), lng: center.lng() }
          : center;
      if (next.lat === this.center.lat && next.lng === this.center.lng) return;
      this.center = next;
      queueMicrotask(() => this.fire("idle"));
    }
    panTo(center) {
      this.setCenter(center);
    }
    addListener(name, listener) {
      (this.listeners[name] ||= []).push(listener);
      return { remove: () => {} };
    }
    fire(name) {
      for (const listener of this.listeners[name] || []) listener();
    }
  }
  window.google = {
    maps: {
      Map: FixtureMap,
      event: {
        trigger: () => {},
        clearInstanceListeners: (map) => {
          map.listeners = {};
        },
      },
    },
  };
  window.__ruchigoAddressMapsReady();
}
try {
  for (const mode of ["ready", "script-error", "auth-error", "silent"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      geolocation: point,
      permissions: ["geolocation"],
    });
    await context.route("**/api/v1/location/map-config/**", (route) =>
      route.fulfill({
        json: {
          engine: "google",
          browser_key: "public-fixture-key",
          provider: "Google Maps",
        },
      }),
    );
    await context.route("**/api/v1/location/reverse/", (route) => {
      lookups.push(route.request().postDataJSON());
      return route.fulfill({
        json: {
          status: "ready",
          address: {
            provider: "google",
            house_number: "42",
            street: "Example Lane",
            line1: "Example Lane",
            line2: "Test Area",
            locality: "Test Area",
            city: "Delhi",
            state: "Delhi",
            postal_code: "110001",
            label: "42 Example Lane",
            formatted_address: "42 Example Lane, Test Area, Delhi, 110001",
            partial: false,
          },
        },
      });
    });
    await context.route(
      "https://maps.googleapis.com/maps/api/js?**",
      (route) => {
        assert.equal(
          new URL(route.request().url()).searchParams.get("key"),
          "public-fixture-key",
        );
        if (mode === "script-error") return route.abort();
        return route.fulfill({
          contentType: "application/javascript",
          body:
            mode === "silent"
              ? ""
              : mode === "auth-error"
                ? "window.gm_authFailure();"
                : `(${mapFixture.toString()})();`,
        });
      },
    );
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (
        request.url().includes("/api/v1/addresses/") &&
        request.method() !== "GET"
      )
        writes.push(request.method());
    });
    if (mode === "silent") await page.clock.install();
    await page.goto(base);
    await page.locator(".location-trigger").click();
    await page
      .getByRole("button", { name: "Use my current location", exact: true })
      .click();
    const picker = page.getByRole("dialog", {
      name: "Set your delivery location",
    });
    await expect(
      picker.getByRole("heading", { name: "42 Example Lane" }),
    ).toBeVisible();
    await expect(picker.locator(".google-address-map")).toBeVisible();
    await expect(picker.locator(".leaflet-container")).toHaveCount(0);
    if (mode === "silent") {
      await expect
        .poll(() =>
          page
            .locator('script[src*="maps.googleapis.com/maps/api/js"]')
            .count(),
        )
        .toBe(1);
      await page.clock.fastForward(13000);
    }
    if (mode !== "ready") {
      await expect(picker.getByRole("alert")).toContainText(
        "map couldn’t load",
      );
    } else {
      await expect
        .poll(() => page.evaluate(() => Boolean(window.fixtureGoogleMap)))
        .toBe(true);
      const count = lookups.length;
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({
          width,
          height: width === 1440 ? 1000 : 844,
        });
        await picker
          .getByRole("button", { name: "Expand address map" })
          .click();
        await expect(picker.locator(".address-map-stage")).toHaveClass(
          /is-expanded/,
        );
        await picker
          .getByRole("button", { name: "Collapse address map" })
          .click();
        assert.ok(
          await picker.evaluate(
            (element) => element.scrollWidth <= element.clientWidth + 1,
          ),
        );
        await expect(picker.locator(".address-pin-artwork")).toBeVisible();
      }
      assert.equal(
        lookups.length,
        count,
        "Resize/expand must not trigger reverse requests",
      );
      await page.evaluate(() => {
        window.fixtureGoogleMap.fire("dragstart");
      });
      await expect(picker.locator(".address-map-center-pin")).toHaveClass(
        /is-moving/,
      );
      await page.evaluate(() =>
        window.fixtureGoogleMap.setCenter({ lat: 28.6316, lng: 77.2168 }),
      );
      await expect(
        picker.getByRole("heading", { name: "Your selected pin" }),
      ).toBeVisible();
      await picker
        .getByRole("button", { name: "Find address for this pin" })
        .click();
      await expect(
        picker.getByRole("heading", { name: "42 Example Lane" }),
      ).toBeVisible();
      assert.equal(lookups.at(-1).latitude, "28.631600");
      assert.equal(lookups.at(-1).longitude, "77.216800");
    }
    await picker
      .getByRole("button", { name: "Enter address manually" })
      .click();
    const form = page.getByRole("dialog", {
      name: "Where should we bring your food?",
    });
    await expect(form.getByLabel("House / flat / building")).toHaveValue("42");
    await expect(form.getByLabel("Street / area")).toHaveValue("Example Lane");
    await expect(form.getByLabel("Floor (optional)")).toHaveValue("");
    await expect(form.getByLabel("Postal code")).toHaveValue("110001");
    await expect(form.getByText("Google Maps", { exact: true })).toBeVisible();
    if (mode === "ready") {
      await form.getByLabel("House / flat / building").fill("Flat 5, House 42");
      await form.getByRole("button", { name: "Update location pin" }).click();
      await picker
        .getByRole("button", { name: "Use current location", exact: true })
        .click();
      await expect(
        picker.getByRole("heading", { name: "42 Example Lane" }),
      ).toBeVisible();
      await picker
        .getByRole("button", { name: "Add delivery details", exact: true })
        .click();
      await expect(form.getByLabel("House / flat / building")).toHaveValue(
        "Flat 5, House 42",
      );
      await form.getByRole("button", { name: "Use this address" }).click();
      await expect(form).not.toBeVisible();
      const saved = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("ruchigo-delivery-location")),
      );
      assert.equal(saved.line1, "Flat 5, House 42, Example Lane");
      assert.equal(Number(saved.latitude), point.latitude);
      await page.reload();
      await expect(page.locator(".location-trigger")).toContainText(
        "Flat 5, House 42",
      );
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(writes, []);
  console.log(
    JSON.stringify({
      passed: [
        "Google renderer selection",
        "Desktop/mobile expand without lookup loops",
        "Pin updates",
        "House and street autofill without duplication",
        "Typed edits kept",
        "Guest save/reload",
        "Script/auth/timeout recovery",
      ],
      google:
        "Interface and lookup fixtures, not a real browser-key acceptance test",
      businessWrites: 0,
    }),
  );
} finally {
  await browser.close();
}
