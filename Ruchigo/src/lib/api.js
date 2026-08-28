// Prefer an explicit VITE_API_BASE_URL, otherwise use a relative path so Vite's
// dev server proxy (configured in vite.config.js) can forward requests to Django
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function apiRequest(path, { token, method = "GET", body, signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...(signal ? { signal } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || Object.values(data).flat().join(" ") || "Request failed.");
  return data;
}

export function refreshAccessToken(refresh) {
  return apiRequest("/auth/token/refresh/", { method: "POST", body: { refresh } });
}
