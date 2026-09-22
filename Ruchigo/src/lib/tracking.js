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
    fresh: age <= 15000,
    label:
      age < 10000
        ? "Updated just now"
        : age < 60000
          ? `Updated ${Math.floor(age / 1000)}s ago`
          : `Last updated ${Math.floor(age / 60000)} min ago`,
  };
}

export function nearbyRiderPlace(place, rider, now = Date.now()) {
  if (!place || !rider || !place.label) return null;
  const point = coordinates(place.latitude, place.longitude);
  const age = now - Date.parse(place.looked_up_at);
  if (!point || !Number.isFinite(age) || age < -5000 || age > 45000)
    return null;
  const latitude = ((point[0] + rider[0]) * Math.PI) / 360;
  const metres = Math.hypot(
    (point[0] - rider[0]) * 111320,
    (point[1] - rider[1]) * 111320 * Math.cos(latitude),
  );
  return metres <= 200 ? place.label : null;
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

// Match only a nearby received GPS point to the displayed road. Off-route
// samples remain real GPS; never pull a rider across buildings onto a route.
export function projectOnRoute(points, point, maxMetres = 25) {
  if (!points?.length || !point) return null;
  const scale = Math.cos((point[0] * Math.PI) / 180);
  const lengths = points
    .slice(1)
    .map((p, i) =>
      Math.hypot(p[0] - points[i][0], (p[1] - points[i][1]) * scale),
    );
  const total = lengths.reduce((sum, value) => sum + value, 0);
  let walked = 0,
    best = null;
  for (let i = 0; i < lengths.length; i++) {
    const a = points[i],
      b = points[i + 1];
    const x = (b[1] - a[1]) * scale,
      y = b[0] - a[0];
    const fraction = Math.max(
      0,
      Math.min(
        1,
        ((point[1] - a[1]) * scale * x + (point[0] - a[0]) * y) /
          (x * x + y * y) || 0,
      ),
    );
    const match = [a[0] + y * fraction, a[1] + (b[1] - a[1]) * fraction];
    const distance =
      Math.hypot(point[0] - match[0], (point[1] - match[1]) * scale) * 111195;
    if (!best || distance < best.distance)
      best = {
        point: match,
        distance,
        progress: total ? (walked + lengths[i] * fraction) / total : 0,
      };
    walked += lengths[i];
  }
  return best && best.distance <= maxMetres ? best : null;
}
