/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext.jsx";
import { useRemote } from "../lib/product.js";
import { notificationTarget } from "../lib/notifications.js";

// Server-backed inbox state. Separate from legacy login-toast notifications.
// Mounted once per app, so hidden/mobile/desktop bells share a single poller.
const InboxContext = createContext(null);

export function InboxProvider({ children }) {
  const { token, isAuthenticated, user, role } = useAuth();
  const seen = useRef({ user: null, id: null });
  const { data, error, reload } = useRemote(
    isAuthenticated ? "/notifications/summary/" : null,
    token,
    15000,
  );
  useEffect(() => {
    if (!isAuthenticated) return;
    let refreshTimer;
    const activity = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(reload, 350);
    };
    const resume = () => {
      if (!document.hidden) reload();
    };
    window.addEventListener("focus", resume);
    window.addEventListener("ruchigo:activity", activity);
    document.addEventListener("visibilitychange", resume);
    return () => {
      window.removeEventListener("focus", resume);
      window.removeEventListener("ruchigo:activity", activity);
      window.clearTimeout(refreshTimer);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [isAuthenticated, reload]);
  useEffect(() => {
    if (seen.current.user !== user?.id) {
      seen.current = { user: user?.id, id: null };
      toast.dismiss("inbox-live");
    }
    if (!isAuthenticated || !data || error) return;
    const newest = data.latest_id || 0;
    // First snapshot is a baseline, not a burst of historical alerts. A read
    // toggle, refetch, token refresh or polling retry cannot replay old events.
    const updates =
      seen.current.id === null
        ? []
        : (data.latest || []).filter((entry) => entry.id > seen.current.id);
    seen.current.id = Math.max(seen.current.id || 0, newest);
    if (!updates.length) return;
    const entry = updates[0];
    const destination =
      updates.length === 1
        ? notificationTarget(entry, role) || "/notifications"
        : "/notifications";
    toast(
      <div>
        <strong>
          {updates.length === 1 ? entry.title : "New activity updates"}
        </strong>
        <p>
          {updates.length === 1
            ? entry.message
            : `${entry.title} and more. Check your inbox for the latest updates.`}
        </p>
        <Link to={destination} onClick={() => toast.dismiss("inbox-live")}>
          View update{updates.length > 1 ? "s" : ""}
        </Link>
      </div>,
      { id: "inbox-live", duration: 8000 },
    );
  }, [data, error, isAuthenticated, role, user?.id]);
  const value = useMemo(
    () => ({
      unreadCount:
        isAuthenticated && !error ? (data?.unread_count ?? null) : null,
      error,
      refreshUnread: reload,
    }),
    [data, error, isAuthenticated, reload],
  );
  return (
    <InboxContext.Provider value={value}>{children}</InboxContext.Provider>
  );
}

export function useInbox() {
  const context = useContext(InboxContext);
  if (!context) throw new Error("useInbox requires InboxProvider");
  return context;
}
