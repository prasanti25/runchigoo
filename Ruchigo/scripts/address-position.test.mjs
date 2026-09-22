import assert from "node:assert/strict";
import { test } from "node:test";
import {
  currentPosition,
  deliveryAddressPayload,
} from "../src/lib/addressLocation.js";

const coords = { latitude: 28.6315, longitude: 77.2167, accuracy: 18 };
function device(t, custom) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const requests = [],
    cleared = [];
  const geolocation = {
    watchPosition: (ok, fail, options) => {
      requests.push({ ok, fail, options });
      custom?.(ok, fail);
      return 0;
    },
    clearWatch: (id) => cleared.push(id),
    getCurrentPosition: () =>
      assert.fail("Must not use broken one-shot wrapper"),
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { geolocation },
  });
  t.after(() => Object.defineProperty(globalThis, "navigator", descriptor));
  t.mock.timers.enable({ apis: ["setTimeout"] });
  return { requests, cleared, geolocation };
}

test("first device fix resolves and clears the watch, including watch ID zero", async (t) => {
  const d = device(t);
  const result = currentPosition();
  assert.deepEqual(d.requests[0].options, {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0,
  });
  d.requests[0].ok({ coords });
  assert.deepEqual(await result, { ...coords, source: "gps" });
  assert.deepEqual(d.cleared, [0]);
  d.requests[0].ok({ coords: { ...coords, latitude: 1 } });
  d.requests[0].fail({ code: 1 });
  assert.deepEqual(d.cleared, [0]);
});

test("permission denial is respected without retries or alternate sources", async (t) => {
  const d = device(t);
  const rejected = assert.rejects(currentPosition(), { geolocationCode: 1 });
  d.requests[0].fail({ code: 1 });
  await rejected;
  assert.equal(d.requests.length, 1);
  assert.deepEqual(d.cleared, [0]);
});

test("silent browser/extension callbacks cannot leave an infinite loader", async (t) => {
  const d = device(t);
  const rejected = assert.rejects(currentPosition(), { geolocationCode: 3 });
  t.mock.timers.tick(14999);
  assert.deepEqual(d.cleared, []);
  t.mock.timers.tick(1);
  await rejected;
  assert.deepEqual(d.cleared, [0]);
  d.requests[0].ok({ coords });
  assert.deepEqual(d.cleared, [0]);
});

test("closing or replacing a request cancels its watch and deadline", async (t) => {
  const d = device(t);
  const controller = new AbortController();
  const rejected = assert.rejects(
    currentPosition({ signal: controller.signal }),
    { name: "AbortError" },
  );
  controller.abort();
  await rejected;
  t.mock.timers.tick(20000);
  d.requests[0].ok({ coords });
  assert.deepEqual(d.cleared, [0]);
});

test("already aborted calls never request location", async (t) => {
  const d = device(t);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(currentPosition({ signal: controller.signal }), {
    name: "AbortError",
  });
  assert.equal(d.requests.length, 0);
});

test("synchronous extension success still cleans up its returned watch ID", async (t) => {
  const d = device(t, (ok) => ok({ coords }));
  assert.deepEqual(await currentPosition(), { ...coords, source: "gps" });
  assert.deepEqual(d.cleared, [0]);
});

test("synchronous extension failure still cleans up its returned watch ID", async (t) => {
  const d = device(t, (_ok, fail) => fail({ code: 1 }));
  await assert.rejects(currentPosition(), { geolocationCode: 1 });
  assert.deepEqual(d.cleared, [0]);
});

test("native timeout is handled before the outer deadline", async (t) => {
  const d = device(t);
  const rejected = assert.rejects(currentPosition(), { geolocationCode: 3 });
  d.requests[0].fail({ code: 3 });
  await rejected;
  assert.deepEqual(d.cleared, [0]);
});

test("invalid device coordinates never become a delivery pin", async (t) => {
  const d = device(t);
  const rejected = assert.rejects(currentPosition(), { geolocationCode: 2 });
  d.requests[0].ok({ coords: { latitude: 900, longitude: null } });
  await rejected;
  assert.deepEqual(d.cleared, [0]);
});

test("a throwing browser wrapper gives a recoverable error", async (t) => {
  device(t, () => {
    throw new Error("Extension unavailable");
  });
  await assert.rejects(currentPosition(), { geolocationCode: 2 });
  t.mock.timers.tick(20000);
});

test("missing geolocation offers manual address entry", async (t) => {
  const d = device(t);
  delete d.geolocation.watchPosition;
  await assert.rejects(currentPosition(), /enter your address manually/);
  assert.equal(d.requests.length, 0);
});

test("a broken cleanup wrapper does not leave the promise pending", async (t) => {
  const d = device(t);
  d.geolocation.clearWatch = () => {
    throw new Error("Extension cleanup failed");
  };
  const result = currentPosition();
  d.requests[0].ok({ coords });
  assert.deepEqual(await result, { ...coords, source: "gps" });
});

const draft = {
  line1: "Public test area",
  line2: "Near main gate",
  city: "Delhi",
  state: "Delhi",
  postal_code: "110001",
  latitude: "28.631500",
  longitude: "77.216700",
};
test("geocoded area alone cannot complete a new delivery address", () => {
  assert.throws(
    () => deliveryAddressPayload(draft, { house: "", floor: "2" }),
    /house, flat number or building/,
  );
  assert.throws(
    () => deliveryAddressPayload(draft, { house: "   " }),
    /house, flat number or building/,
  );
});
test("house, street, floor and landmark are stored in rider-visible address lines", () => {
  const address = deliveryAddressPayload(draft, {
    house: " Flat 204 ",
    floor: " 2nd ",
  });
  assert.equal(address.line1, "Flat 204, Public test area");
  assert.equal(address.line2, "Floor: 2nd, Near main gate");
  assert.equal(address.latitude, draft.latitude);
  assert.equal(address.longitude, draft.longitude);
  assert.equal(draft.line1, "Public test area");
});
test("optional floor is not invented and a named building is accepted", () => {
  const address = deliveryAddressPayload(
    { ...draft, line2: "" },
    { house: "Public library" },
  );
  assert.equal(address.line1, "Public library, Public test area");
  assert.equal(address.line2, "");
});
test("blank street or required address fields are rejected", () => {
  assert.throws(
    () => deliveryAddressPayload({ ...draft, line1: " " }, { house: "12" }),
    /street or area/,
  );
  assert.throws(
    () =>
      deliveryAddressPayload({ ...draft, postal_code: " " }, { house: "12" }),
    /postal code/,
  );
});
test("composed lines respect database limits without truncating delivery details", () => {
  assert.throws(
    () =>
      deliveryAddressPayload(
        { ...draft, line1: "a".repeat(255) },
        { house: "12" },
      ),
    /255 characters/,
  );
  assert.throws(
    () =>
      deliveryAddressPayload(
        { ...draft, line2: "a".repeat(250) },
        { house: "12", floor: "Ground" },
      ),
    /255 characters/,
  );
});
test("legacy address editing preserves free-form house and floor text", () => {
  const saved = {
    ...draft,
    line1: "Flat 12, Test street",
    line2: "Floor: 2nd, Near gate",
  };
  assert.deepEqual(deliveryAddressPayload(saved), saved);
});
