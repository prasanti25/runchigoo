export function locationPoint(value) {
  const lat = value?.latitude,
    lng = value?.longitude;
  if (
    [lat, lng].some(
      (item) =>
        !["number", "string"].includes(typeof item) ||
        (typeof item === "string" && !item.trim()),
    )
  )
    return null;
  const latitude = Number(lat),
    longitude = Number(lng);
  return Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
    ? { latitude, longitude }
    : null;
}

export function pointKey(point) {
  return point
    ? `${Number(point.latitude).toFixed(6)},${Number(point.longitude).toFixed(6)}`
    : "";
}

export function addressDraft(location = {}) {
  const point = location.confirmed ? locationPoint(location) : null;
  return {
    label: "Home",
    line1: location.confirmed ? location.line1 || "" : "",
    line2: location.confirmed ? location.line2 || "" : "",
    city: location.city || "",
    state: location.confirmed ? location.state || "" : "",
    postal_code: location.confirmed ? location.postal_code || "" : "",
    ...(point
      ? {
          latitude: point.latitude.toFixed(6),
          longitude: point.longitude.toFixed(6),
        }
      : {}),
  };
}

export function deliveryLocationFromAddress(address) {
  return {
    ...addressDraft({ ...address, confirmed: true }),
    address_id: address.id,
    label: `${address.label || "Home"} · ${address.line1}`,
    formatted_address: [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postal_code,
    ]
      .filter(Boolean)
      .join(", "),
    confirmed: true,
    source: "saved",
  };
}

// Keep the API's existing address lines compatible with saved addresses and
// immutable order snapshots. New addresses require a user-entered destination;
// geocoded locality/street alone must not become a complete delivery address.
export function deliveryAddressPayload(form, details) {
  const address = { ...form };
  for (const key of ["line1", "line2", "city", "state", "postal_code"])
    address[key] = String(form[key] || "").trim();
  if (details) {
    const house = String(details.house || "").trim();
    const floor = String(details.floor || "").trim();
    if (!house)
      throw new Error("Add your house, flat number or building name.");
    if (!address.line1) throw new Error("Add your street or area.");
    address.line1 = `${house}, ${address.line1}`;
    address.line2 = [floor ? `Floor: ${floor}` : "", address.line2]
      .filter(Boolean)
      .join(", ");
  }
  if (["line1", "city", "state", "postal_code"].some((key) => !address[key]))
    throw new Error("Complete your address, city, state and postal code.");
  if (address.line1.length > 255 || address.line2.length > 255)
    throw new Error(
      "Keep each address line within 255 characters, including your house and floor details.",
    );
  return address;
}

export function currentPosition({ signal } = {}) {
  return new Promise((resolve, reject) => {
    const geolocation = navigator.geolocation;
    if (!geolocation?.watchPosition)
      return reject(
        new Error(
          "This browser can’t access your location. You can enter your address manually.",
        ),
      );
    let watchId,
      timer,
      settled = false;
    const cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      if (watchId != null) {
        const id = watchId;
        watchId = null;
        try {
          geolocation.clearWatch(id);
        } catch {
          /* A browser extension may throw. */
        }
      }
    };
    const finish = (error, position) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) reject(error);
      else resolve(position);
    };
    const abort = () =>
      finish(new DOMException("Location request cancelled", "AbortError"));
    const fail = ({ code = 2 } = {}) => {
      const message =
        code === 1
          ? "We couldn’t access your location. Try again or enter your address manually."
          : code === 3
            ? "Finding your location took too long. Try again or enter your address manually."
            : "Your location is unavailable right now. Try again or enter your address manually.";
      const error = new Error(message);
      error.geolocationCode = code;
      finish(error);
    };
    if (signal?.aborted) return abort();
    signal?.addEventListener("abort", abort, { once: true });
    // A first-fix watch respects browser permission and avoids broken one-shot
    // wrappers. It is cleared on every terminal path: never background tracking.
    // Own deadline also bounds extension callbacks / permission waits, which
    // aren't necessarily included in the browser's native timeout.
    timer = setTimeout(() => fail({ code: 3 }), 15000);
    try {
      watchId = geolocation.watchPosition(
        ({ coords }) => {
          const point = locationPoint(coords);
          if (!point) return fail({ code: 2 });
          finish(null, { ...point, accuracy: coords.accuracy, source: "gps" });
        },
        fail,
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
      );
      // Some wrappers call back synchronously before returning their watch ID.
      if (settled) cleanup();
    } catch {
      fail({ code: 2 });
    }
  });
}
