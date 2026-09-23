import { locationPoint } from "./addressLocation.js";

// Browsing radius, not a promise that a kitchen delivers to this doorstep.
export const DEFAULT_BROWSE_RADIUS_KM = 5;

export function discoveryLocation(
  location = {},
  { cityOnly = false, radius = DEFAULT_BROWSE_RADIUS_KM } = {},
) {
  const point = locationPoint(location);
  const city = location.city || "";
  if (!point || cityOnly) return { city };
  return {
    city,
    latitude: Number(point.latitude.toFixed(6)),
    longitude: Number(point.longitude.toFixed(6)),
    radius_km: radius,
    sort: "distance",
    ...(city ? { delivery_only: true } : {}),
  };
}
