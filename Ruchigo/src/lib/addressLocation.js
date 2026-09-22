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

export function currentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation)
      return reject(
        new Error(
          "This browser can’t access your location. You can enter your address manually.",
        ),
      );
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          source: "gps",
        }),
      async (error) => {
        let permission = "unknown";
        try {
          permission =
            (await navigator.permissions?.query({ name: "geolocation" }))
              ?.state || "unknown";
        } catch {
          /* Browser support varies. */
        }
        const message =
          error.code === 1
            ? permission === "granted"
              ? "Location permission is off on your device. This browser is allowed, but the device denied access. Check Location Services, then try again."
              : "Location permission is off. Check both this site’s permission and your device’s Location Services, then try again."
            : error.code === 3
              ? "Finding your location took too long. Try again near a window or enter your address manually."
              : "Your device couldn’t find a location. Check Location Services and your connection, or enter your address manually.";
        const failure = new Error(message);
        failure.geolocationCode = error.code;
        reject(failure);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}
