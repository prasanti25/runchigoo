/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiRequest, refreshAccessToken } from "../lib/api.js";
import { useNotifications } from "./NotificationContext.jsx";

const AuthContext = createContext(null);

const STORAGE_KEY = "ruchigo-auth";
const CART_KEY = "ruchigo-cart";
const WISHLIST_KEY = "ruchigo-wishlist";
const CACHE_KEY = "ruchigo-cache";
const SESSION_FALLBACK_MS = 7 * 24 * 60 * 60 * 1000;

const defaultAuthState = {
  token: null,
  refreshToken: null,
  user: null,
  role: "guest",
  expiresAt: null,
};

function getTokenExpiry(token) {
  if (!token) return null;

  try {
    const encodedPayload = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!encodedPayload) return null;
    const paddedPayload = encodedPayload.padEnd(encodedPayload.length + ((4 - (encodedPayload.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(paddedPayload));

    return payload?.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function buildRedirectPath(role) {
  if (role === "restaurant") return "/restaurant-dashboard";
  if (role === "delivery") return "/delivery-dashboard";
  if (role === "admin") return "/admin-dashboard";
  return "/";
}

function readStoredAuth() {
  if (typeof window === "undefined") return defaultAuthState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAuthState;

    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.user) {
      window.localStorage.removeItem(STORAGE_KEY);
      return defaultAuthState;
    }

    const expiresAt = parsed.expiresAt || getTokenExpiry(parsed.token) || Date.now() + SESSION_FALLBACK_MS;
    if (Date.now() > expiresAt && !parsed.refreshToken) {
      window.localStorage.removeItem(STORAGE_KEY);
      return defaultAuthState;
    }

    return {
      ...parsed,
      expiresAt,
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return defaultAuthState;
  }
}

function persistAuth(nextAuth) {
  if (typeof window === "undefined") return;

  const payload = {
    ...nextAuth,
    expiresAt: nextAuth.expiresAt || getTokenExpiry(nextAuth.token) || Date.now() + SESSION_FALLBACK_MS,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function clearAuthStorage() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(CART_KEY);
  window.localStorage.removeItem(WISHLIST_KEY);
  window.localStorage.removeItem(CACHE_KEY);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();
  const [auth, setAuth] = useState(() => readStoredAuth());
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(
    () => Boolean(auth.refreshToken && auth.expiresAt && auth.expiresAt - Date.now() <= 60 * 1000)
  );

  const refreshSession = useCallback(async () => {
    if (!auth.refreshToken) return false;
    setSessionLoading(true);
    try {
      const tokens = await refreshAccessToken(auth.refreshToken);
      setAuth((current) => ({
        ...current,
        token: tokens.access,
        refreshToken: tokens.refresh || current.refreshToken,
        expiresAt: getTokenExpiry(tokens.access) || Date.now() + SESSION_FALLBACK_MS,
      }));
      return true;
    } catch {
      setAuth(defaultAuthState);
      clearAuthStorage();
      return false;
    } finally {
      setSessionLoading(false);
    }
  }, [auth.refreshToken]);

  useEffect(() => {
    if (!auth.token || !auth.user) {
      clearAuthStorage();
      return;
    }

    persistAuth(auth);
  }, [auth]);

  const logout = useCallback((message = "Logged out successfully.") => {
    const refreshToken = auth.refreshToken;
    setAuth(defaultAuthState);
    clearAuthStorage();
    setLoading(false);
    if (refreshToken) {
      apiRequest("/auth/logout/", { method: "POST", token: auth.token, body: { refresh: refreshToken } }).catch(() => undefined);
    }
    navigate("/login", { replace: true });
    toast.success(message);
  }, [auth.refreshToken, auth.token, navigate]);

  useEffect(() => {
    if (!auth.token || !auth.user || !auth.expiresAt) return undefined;

    const refreshLeadTimeMs = 60 * 1000;
    const timeUntilRefresh = auth.expiresAt - Date.now() - refreshLeadTimeMs;

    if (timeUntilRefresh <= 0) {
      const immediateId = window.setTimeout(async () => {
        const refreshed = await refreshSession();
        if (!refreshed) logout("Session expired. Please log in again.");
      }, 0);

      return () => window.clearTimeout(immediateId);
    }

    const timeoutId = window.setTimeout(async () => {
      const refreshed = await refreshSession();
      if (!refreshed) logout("Session expired. Please log in again.");
    }, timeUntilRefresh);

    return () => window.clearTimeout(timeoutId);
  }, [auth.expiresAt, auth.token, auth.user, logout, refreshSession]);

  const login = useCallback(async ({ email, password, role = "customer" }) => {
    setLoading(true);

    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPassword = password || "";
    const safeRole = role || "customer";

    if (!normalizedEmail || !normalizedPassword || normalizedPassword.length < 6) {
      setLoading(false);
      toast.error("Please enter a valid email and password.");
      return false;
    }

    try {
      const data = await apiRequest("/auth/login/", { method: "POST", body: { email: normalizedEmail, password: normalizedPassword, role: safeRole } });
      const user = { ...data.user, name: `${data.user.first_name || ""} ${data.user.last_name || ""}`.trim() || data.user.email };
      const nextAuth = {
        token: data.tokens.access,
        refreshToken: data.tokens.refresh,
        user,
        role: user.role,
        expiresAt: getTokenExpiry(data.tokens.access) || Date.now() + SESSION_FALLBACK_MS,
      };

      setAuth(nextAuth);
      toast.success("Login successful.");
      if (data.unread_notifications && data.unread_notifications.length > 0) {
        data.unread_notifications.forEach((notification) => {
          addNotification({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            read: false,
          });
        });
        addNotification({
          title: "New notifications available",
          message: `You have ${data.unread_notifications_count} new notification${data.unread_notifications_count > 1 ? "s" : ""}.`,
          read: false,
        });
      }

      const fromPath = location.state?.from?.pathname;
      const target = fromPath || buildRedirectPath(user.role);
      // Navigate after state update in next tick to avoid ProtectedRoute race checks
      setTimeout(() => {
        toast.success(`Redirecting to ${target}`);
        navigate(target, { replace: true });
      }, 0);
      return true;
    } catch (error) {
      // If backend rejected due to role mismatch, retry without role to allow login and inform user
      if (error?.message && error.message.includes("Account role does not match")) {
        try {
          const data = await apiRequest("/auth/login/", { method: "POST", body: { email: normalizedEmail, password: normalizedPassword } });
          const user = { ...data.user, name: `${data.user.first_name || ""} ${data.user.last_name || ""}`.trim() || data.user.email };
          const nextAuth = {
            token: data.tokens.access,
            refreshToken: data.tokens.refresh,
            user,
            role: user.role,
            expiresAt: getTokenExpiry(data.tokens.access) || Date.now() + SESSION_FALLBACK_MS,
          };
          setAuth(nextAuth);
          toast.success("Login successful (role selection ignored). Redirecting to your account.");
          const fromPath = location.state?.from?.pathname;
          const target = fromPath || buildRedirectPath(user.role);
          setTimeout(() => {
            toast.success(`Redirecting to ${target}`);
            navigate(target, { replace: true });
          }, 0);
          return true;
        } catch (retryError) {
          toast.error(retryError.message);
          return false;
        } finally { setLoading(false); }
      }

      if (error?.message && error.message.includes("pending admin approval")) {
        toast.error(error.message);
        navigate("/pending-approval", { replace: true });
        return false;
      }

      toast.error(error.message);
      return false;
    } finally { setLoading(false); }
  }, [addNotification, location.state, navigate]);

  const register = useCallback(async ({ fullName, email, phone, password, role = "customer" }) => {
    setLoading(true);

    const normalizedName = (fullName || "").trim();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPhone = (phone || "").trim();
    const normalizedPassword = password || "";

    if (!normalizedName || !normalizedEmail || !normalizedPhone || normalizedPassword.length < 8) {
      setLoading(false);
      toast.error("Please complete all registration details.");
      return false;
    }

    try {
      const [first_name, ...rest] = normalizedName.split(/\s+/);
      const data = await apiRequest("/auth/register/", {
        method: "POST",
        body: {
          email: normalizedEmail,
          password: normalizedPassword,
          phone: normalizedPhone,
          first_name,
          last_name: rest.join(" "),
          role: role || "customer",
        },
      });
      if (data.tokens) {
        const user = { ...data.user, name: normalizedName };
        setAuth({
          token: data.tokens.access,
          refreshToken: data.tokens.refresh,
          user,
          role: user.role,
          expiresAt: getTokenExpiry(data.tokens.access) || Date.now() + SESSION_FALLBACK_MS,
        });
        toast.success("Account created successfully.");
        navigate(buildRedirectPath(user.role), { replace: true });
        return true;
      }
      toast.success(data.detail || "Registration submitted. Awaiting approval.");
      navigate("/pending-approval", { replace: true });
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const updateProfile = useCallback(async (profile) => {
    const updated = await apiRequest("/auth/me/", { token: auth.token, method: "PATCH", body: profile });
    const user = { ...updated, name: `${updated.first_name || ""} ${updated.last_name || ""}`.trim() || updated.email };
    setAuth((current) => ({ ...current, user, role: user.role }));
    return user;
  }, [auth.token]);

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    await apiRequest("/auth/change_password/", {
      token: auth.token,
      method: "POST",
      body: { current_password: currentPassword, new_password: newPassword },
    });
    logout("Password changed. Please sign in again.");
  }, [auth.token, logout]);

  const value = useMemo(
    () => ({
      ...auth,
      isAuthenticated: Boolean(auth.token && auth.user),
      loading: loading || sessionLoading,
      login,
      register,
      updateProfile,
      changePassword,
      logout,
      refreshSession,
    }),
    [auth, loading, login, logout, refreshSession, register, updateProfile, changePassword, sessionLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
