import { apiRequest } from "./api.js";

function nextApiPath(nextUrl) {
  if (!nextUrl) return null;
  const parsed = new URL(nextUrl, window.location.origin);
  const marker = "/api/v1";
  const markerIndex = parsed.pathname.indexOf(marker);
  const pathname = markerIndex >= 0
    ? parsed.pathname.slice(markerIndex + marker.length)
    : parsed.pathname;
  return `${pathname || "/"}${parsed.search}`;
}

export async function fetchAllPages(path, options = {}) {
  const records = [];
  let next = path;

  while (next) {
    const data = await apiRequest(next, options);
    if (Array.isArray(data)) return [...records, ...data];
    records.push(...(data.results || []));
    next = nextApiPath(data.next);
  }

  return records;
}
