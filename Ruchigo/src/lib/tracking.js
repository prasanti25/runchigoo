export function coordinates(latitude, longitude) {
  if (
    latitude == null ||
    longitude == null ||
    latitude === "" ||
    longitude === ""
  )
    return null;
  const lat = Number(latitude),
    lng = Number(longitude);
  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
    ? [lat, lng]
    : null;
}

export function locationFreshness(value, now = Date.now()) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp) || timestamp > now + 5000)
    return { fresh: false, label: "Location time unavailable" };
  const age = Math.max(0, now - timestamp);
  return {
    fresh: age <= 60000,
    label:
      age < 10000
        ? "Updated just now"
        : age < 60000
          ? `Updated ${Math.floor(age / 1000)}s ago`
          : `Last updated ${Math.floor(age / 60000)} min ago`,
  };
}

export function deliveryStageMessage(status) {
  return (
    {
      pending: [
        "Waiting for the kitchen",
        "Your order is awaiting restaurant confirmation. Rider tracking begins after a delivery partner is assigned.",
      ],
      confirmed: [
        "Your order is accepted",
        "The kitchen has confirmed your meal. Cooking updates will appear here automatically.",
      ],
      preparing: [
        "Good food takes a little care",
        "The restaurant is preparing your meal. We’ll update you when it’s ready for pickup.",
      ],
      ready: [
        "Packed and ready for pickup",
        "Your meal is ready. Waiting for a delivery partner to collect it.",
      ],
      assigned: [
        "Your partner is heading to the kitchen",
        "A delivery partner is assigned. Their position will appear when they share a GPS update.",
      ],
      out_for_delivery: [
        "Your meal is on the way",
        "Your partner has collected your meal. Their position will appear when they share a GPS update.",
      ],
      delivered: [
        "Delivered. Enjoy every bite.",
        "Your delivery journey is complete.",
      ],
    }[status] || [
      "Your delivery journey",
      "Order updates will appear here as your delivery progresses.",
    ]
  );
}

// Interpolate along verified road geometry, not the straight chord between
// samples. Callers must supply a route; this never invents a route from GPS.
export function positionOnRoute(points, progress) {
  if (!points.length) return null;
  if (points.length === 1) return { point: points[0], travelled: points };
  const lengths = points.slice(1).map((point, index) => {
    const previous = points[index];
    const meanLatitude = (((point[0] + previous[0]) / 2) * Math.PI) / 180;
    return Math.hypot(
      point[0] - previous[0],
      (point[1] - previous[1]) * Math.cos(meanLatitude),
    );
  });
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let remaining = Math.max(0, Math.min(1, progress)) * total;
  for (let index = 0; index < lengths.length; index += 1) {
    if (remaining <= lengths[index] || index === lengths.length - 1) {
      const fraction = lengths[index] ? remaining / lengths[index] : 0;
      const point = points[index].map(
        (value, axis) => value + (points[index + 1][axis] - value) * fraction,
      );
      return {
        point,
        travelled: [...points.slice(0, index + 1), point],
        bearing: travelBearing(points[index], points[index + 1]),
      };
    }
    remaining -= lengths[index];
  }
}

export function travelBearing(from, to) {
  const meanLatitude = (((from[0] + to[0]) / 2) * Math.PI) / 180;
  return (
    (Math.atan2((to[1] - from[1]) * Math.cos(meanLatitude), to[0] - from[0]) *
      180) /
    Math.PI
  );
}
