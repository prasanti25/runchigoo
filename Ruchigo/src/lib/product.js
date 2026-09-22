import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { apiRequest } from "./api.js";

export const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
export const orderNumber = (order) =>
  String(order.number || order.id)
    .slice(0, 8)
    .toUpperCase();
export const statusLabel = (status) =>
  ({
    awaiting_payment: "Awaiting payment",
    pending: "Awaiting confirmation",
    confirmed: "Order accepted",
    preparing: "In the kitchen",
    ready: "Ready for pickup",
    assigned: "Delivery partner assigned",
    out_for_delivery: "On the way",
    delivered: "Delivered",
    cancelled: "Cancelled",
  })[status] || status;
export const dateTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

export function useRemote(path, token, poll = 0) {
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const [result, setResult] = useState({ key: "", data: null, error: "" });
  const key = `${path}|${token || ""}|${version}`;
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    let inFlight = false;
    const load = async () => {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      try {
        const data = await apiRequest(path, {
          token,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setResult({ key, data, error: "" });
      } catch (error) {
        if (!controller.signal.aborted)
          setResult((previous) => ({
            key,
            data: previous.key === key ? previous.data : null,
            error: error.message,
          }));
      } finally {
        inFlight = false;
      }
    };
    load();
    const timer = poll
      ? window.setInterval(() => {
          if (!document.hidden) load();
        }, poll)
      : null;
    return () => {
      controller.abort();
      if (timer) window.clearInterval(timer);
    };
  }, [key, path, poll, token]);
  return {
    data: result.key === key ? result.data : null,
    loading: Boolean(path) && result.key !== key,
    error: result.key === key ? result.error : "",
    reload,
  };
}

const locationKey = "ruchigo-delivery-location";
function subscribeLocation(listener) {
  window.addEventListener("storage", listener);
  window.addEventListener("ruchigo-location", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("ruchigo-location", listener);
  };
}
function getLocation() {
  try {
    return localStorage.getItem(locationKey) || "";
  } catch {
    return "";
  }
}
export function useDeliveryLocation() {
  const raw = useSyncExternalStore(subscribeLocation, getLocation, () => "");
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}
export function saveDeliveryLocation(location) {
  try {
    localStorage.setItem(locationKey, JSON.stringify(location));
  } catch {
    /* Browsing still works without persistence. */
  }
  window.dispatchEvent(new Event("ruchigo-location"));
}

export function discoveryPath(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== "" &&
      value !== undefined &&
      value !== null &&
      value !== false
    )
      params.set(key, String(value));
  });
  return `/discovery/?${params}`;
}
