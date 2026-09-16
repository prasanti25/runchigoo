// Prefer an explicit VITE_API_BASE_URL, otherwise use a relative path so Vite's
// dev server proxy (configured in vite.config.js) can forward requests to Django
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

function errorMessage(data) {
  if (typeof data === "string" && data.trim()) return data;
  if (!data || typeof data !== "object") return "Request failed.";
  if (typeof data.detail === "string") return data.detail;

  const messages = Object.entries(data).flatMap(([field, value]) => {
    const values = Array.isArray(value) ? value : [value];
    return values.map((item) => `${field.replaceAll("_", " ")}: ${typeof item === "string" ? item : JSON.stringify(item)}`);
  });
  return messages.join(" ") || "Request failed.";
}

export async function apiRequest(path, { token, method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new Error("Unable to connect to RuchiGo. Check your internet connection and try again.", { cause: error });
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errorMessage(data));
  return data;
}

export function refreshAccessToken(refresh) {
  return apiRequest("/auth/token/refresh/", { method: "POST", body: { refresh } });
}
