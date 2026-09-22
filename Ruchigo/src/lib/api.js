// Prefer an explicit VITE_API_BASE_URL, otherwise use a relative path so Vite's
// dev server proxy (configured in vite.config.js) can forward requests to Django
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(
  /\/$/,
  "",
);

function errorMessage(data) {
  if (typeof data === "string" && data.trim()) return data;
  if (!data || typeof data !== "object") return "Request failed.";
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error?.message === "string") {
    if (
      data.error.code === "404" ||
      data.error.message.toLowerCase().includes("page could not be found")
    ) {
      return "RuchiGo service is temporarily unavailable. Please try again shortly.";
    }
    return data.error.message;
  }

  const messages = Object.entries(data).flatMap(([field, value]) => {
    const values = Array.isArray(value) ? value : [value];
    return values.map(
      (item) =>
        `${field.replaceAll("_", " ")}: ${typeof item === "string" ? item : JSON.stringify(item)}`,
    );
  });
  return messages.join(" ") || "Request failed.";
}

export async function apiRequest(
  path,
  { token, method = "GET", body, signal, keepalive = false } = {},
  attempt = 0,
) {
  const multipart = body instanceof FormData;
  let response;
  try {
    response = await fetch(
      `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
      {
        method,
        headers: {
          Accept: "application/json",
          ...(body !== undefined && !multipart
            ? { "Content-Type": "application/json" }
            : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body !== undefined
          ? { body: multipart ? body : JSON.stringify(body) }
          : {}),
        ...(signal ? { signal } : {}),
        ...(keepalive ? { keepalive: true } : {}),
      },
    );
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new Error(
      "Unable to connect to RuchiGo. Check your internet connection and try again.",
      { cause: error },
    );
  }

  // A brief catalog throttle should recover without a dead-end error screen.
  // Never replay writes; only retry short, explicit server cooldowns twice.
  const retryAfter = response.headers.get("Retry-After");
  const retrySeconds = retryAfter === null ? NaN : Number(retryAfter);
  if (
    response.status === 429 &&
    method.toUpperCase() === "GET" &&
    attempt < 2 &&
    Number.isFinite(retrySeconds) &&
    retrySeconds >= 0 &&
    retrySeconds <= 5
  ) {
    await response.body?.cancel();
    await new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Request aborted", "AbortError"));
        return;
      }
      const onAbort = () => {
        clearTimeout(timer);
        reject(new DOMException("Request aborted", "AbortError"));
      };
      const timer = setTimeout(
        () => {
          signal?.removeEventListener("abort", onAbort);
          resolve();
        },
        retrySeconds * 1000 + 100,
      );
      signal?.addEventListener("abort", onAbort, { once: true });
    });
    return apiRequest(
      path,
      { token, method, body, signal, keepalive },
      attempt + 1,
    );
  }

  // Refresh the shared activity inbox after relevant successful writes. Cart
  // quantities and high-frequency GPS writes intentionally do not trigger it.
  if (
    response.ok &&
    token &&
    !["GET", "HEAD"].includes(method.toUpperCase()) &&
    /^\/(orders\/|cart\/checkout\/|support\/|auth\/(me|change_password|verify_email)|reviews\/|users\/|restaurants\/|online-payments\/)/.test(
      path,
    )
  ) {
    window.dispatchEvent(new Event("ruchigo:activity"));
  }
  if (
    response.ok &&
    token &&
    !["GET", "HEAD"].includes(method.toUpperCase()) &&
    path.startsWith("/addresses/")
  ) {
    window.dispatchEvent(new Event("ruchigo:addresses"));
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const requestError = new Error(errorMessage(data));
    requestError.status = response.status;
    requestError.data = data;
    throw requestError;
  }
  return data;
}

export function refreshAccessToken(refresh) {
  return apiRequest("/auth/token/refresh/", {
    method: "POST",
    body: { refresh },
  });
}
