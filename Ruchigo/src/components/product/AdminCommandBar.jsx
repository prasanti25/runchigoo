import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  CornerDownLeft,
  HelpCircle,
  Search,
  Settings,
  Store,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { canOpenAdminRoute } from "../../lib/adminAccess.js";
import {
  workspaceMenus,
  adminNavigationSections,
} from "../../lib/workspaceNavigation.js";
import NotificationBell from "../common/NotificationBell.jsx";
import UserAvatar from "../common/UserAvatar.jsx";
import { Modal } from "./UI.jsx";

export default function AdminCommandBar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const field = useRef(null);
  const results = useRef(null);
  const destinations = [
    ...workspaceMenus.admin
      .filter(([path]) => canOpenAdminRoute(user, `/admin-${path}`))
      .map(([path, label, Icon]) => ({
        to: `/admin-${path}`,
        label,
        Icon,
        section:
          adminNavigationSections.find(([, keys]) =>
            keys.includes(path),
          )?.[0] || "Workspace",
        keywords:
          path === "users"
            ? "customers users accounts"
            : path === "restaurants"
              ? "merchants kitchens"
              : path === "reports"
                ? "reports sales revenue"
                : "",
      })),
    ...(canOpenAdminRoute(user, "/support")
      ? [
          {
            to: "/support?view=team",
            label: "Support inbox",
            Icon: HelpCircle,
            section: "Platform",
          },
        ]
      : []),
    {
      to: "/notifications",
      label: "Notifications",
      Icon: Bell,
      section: "Your account",
    },
    {
      to: "/settings",
      label: "Account settings",
      Icon: Settings,
      section: "Your account",
    },
  ];
  const matches = destinations.filter((item) =>
    `${item.label} ${item.section} ${item.to} ${item.keywords || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  useEffect(() => {
    const shortcut = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k")
        return;
      if (document.querySelector('[role="dialog"]') && !open) return;
      event.preventDefault();
      setQuery("");
      setOpen((value) => !value);
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => field.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);
  return (
    <>
      <div className="admin-command-bar">
        <div className="admin-console-label">
          <span>RuchiGo</span>
          <ChevronRight size={13} />
          <strong>Operations console</strong>
        </div>
        <button
          className="admin-command-trigger"
          onClick={() => {
            setQuery("");
            setOpen(true);
          }}
          aria-label="Find an admin workspace"
          aria-haspopup="dialog"
        >
          <Search size={16} />
          <span>Find a workspace…</span>
          <kbd>⌘ / Ctrl K</kbd>
        </button>
        <div className="admin-command-actions">
          <Link to="/" className="admin-storefront-link">
            <Store size={16} />
            <span>Storefront</span>
            <ArrowUpRight size={14} />
          </Link>
          <NotificationBell className="workspace-notification-bell" />
          <Link
            to="/admin-profile"
            className="admin-command-account"
            aria-label="Your admin profile"
          >
            <UserAvatar user={user} className="nav-avatar" />
          </Link>
        </div>
      </div>
      {open &&
        createPortal(
          <Modal
            title="Find a workspace"
            className="admin-command-dialog"
            onClose={() => setOpen(false)}
          >
            <label className="admin-command-input">
              <Search size={18} />
              <input
                ref={field}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search admin workspaces"
                placeholder="Search orders, people, payments…"
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    results.current?.querySelector("a")?.focus();
                  }
                  if (event.key === "Enter") {
                    event.preventDefault();
                    results.current?.querySelector("a")?.click();
                  }
                }}
              />
            </label>
            <p className="admin-command-result-count">
              {matches.length} accessible workspace
              {matches.length === 1 ? "" : "s"}
            </p>
            <nav
              ref={results}
              className="admin-command-results"
              aria-label="Workspace search results"
              onKeyDown={(event) => {
                if (
                  !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
                )
                  return;
                const links = [...event.currentTarget.querySelectorAll("a")];
                const index = links.indexOf(document.activeElement);
                if (index < 0) return;
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? links.length - 1
                      : (index +
                          (event.key === "ArrowDown" ? 1 : -1) +
                          links.length) %
                        links.length;
                links[next]?.focus();
              }}
            >
              {matches.map(({ to, label, section, Icon }) => (
                <Link to={to} key={to} onClick={() => setOpen(false)}>
                  <span className="admin-command-result-icon">
                    <Icon size={18} />
                  </span>
                  <span>
                    <strong>{label}</strong>
                    <small>{section}</small>
                  </span>
                  <CornerDownLeft size={15} />
                </Link>
              ))}
            </nav>
            {!matches.length && (
              <p className="admin-command-empty">
                No matching workspace. Try orders, restaurants or account
                settings.
              </p>
            )}
            <p className="admin-command-hint">
              Search pages available to your account. Use arrow keys to browse,
              Enter to open and Esc to close.
            </p>
          </Modal>,
          document.body,
        )}
    </>
  );
}
