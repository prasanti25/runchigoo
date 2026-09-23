import { useLayoutEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bell, LifeBuoy, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Navbar from "../Navbar.jsx";
import BrandLogo from "../common/BrandLogo.jsx";
import UserAvatar from "../common/UserAvatar.jsx";
import { canOpenAdminRoute } from "../../lib/adminAccess.js";
import {
  workspaceMenus as menus,
  workspaceSections,
  workspaceNames,
} from "../../lib/workspaceNavigation.js";
import "./AdminWorkspace.css";
import "./AdminMobile.css";
import AdminCommandBar from "./AdminCommandBar.jsx";
import "./AdminDesktop.css";
import "./PartnerWorkspace.css";

export function WorkspaceNav({ type }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigation = useRef(null);
  useLayoutEffect(() => {
    const revealActive = () => {
      const nav = navigation.current;
      const active = nav?.querySelector('a[aria-current="page"]');
      if (!active || !nav.clientHeight) return;
      const bounds = nav.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      if (item.bottom > bounds.bottom - 8)
        nav.scrollTop += item.bottom - bounds.bottom + 8;
      else if (item.top < bounds.top + 8)
        nav.scrollTop += item.top - bounds.top - 8;
    };
    revealActive();
    window.addEventListener("resize", revealActive);
    return () => window.removeEventListener("resize", revealActive);
  }, [pathname, type]);
  const links = menus[type].filter(
    ([path]) => type !== "admin" || canOpenAdminRoute(user, `/admin-${path}`),
  );
  const renderLink = ([path, label, Icon]) => (
    <NavLink key={path} to={`/${type}-${path}`}>
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
  return (
    <>
      <div className="lg:hidden">
        <Navbar />
      </div>
      <aside className="workspace-sidebar">
        {
          <div className="admin-sidebar-brand">
            <Link className="brand" to="/" aria-label="RuchiGo home">
              <BrandLogo />
            </Link>
            <div>
              <strong>RuchiGo</strong>
              <span>{workspaceNames[type].toUpperCase()}</span>
            </div>
          </div>
        }
        {type !== "admin" && (
          <Link
            to={`/${type}-profile`}
            className="workspace-person"
            aria-label="Your partner profile"
          >
            <UserAvatar user={user} className="workspace-avatar" />
            <div>
              <strong>
                {user?.first_name ||
                  `${type[0].toUpperCase()}${type.slice(1)} account`}
              </strong>
              <small>{user?.email}</small>
            </div>
          </Link>
        )}
        <nav ref={navigation} aria-label={`${type} workspace`}>
          {workspaceSections[type].map(([label, keys]) => {
            const visible = links.filter(([key]) => keys.includes(key));
            return visible.length ? (
              <div className="admin-nav-section" key={label}>
                <p>{label}</p>
                {visible.map(renderLink)}
              </div>
            ) : null;
          })}
          <NavLink to="/notifications">
            <Bell size={18} />
            Notifications
          </NavLink>
        </nav>
        <div className="workspace-bottom">
          {(type !== "admin" || canOpenAdminRoute(user, "/support")) && (
            <NavLink to={type === "admin" ? "/support?view=team" : "/support"}>
              <LifeBuoy size={17} />
              Help & support
            </NavLink>
          )}
          <NavLink to="/settings">
            <Settings size={17} />
            Account settings
          </NavLink>
          <button onClick={() => logout()}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
export function WorkspaceFrame({
  type,
  title,
  description,
  action,
  children,
  className = "",
}) {
  return (
    <div
      className={`workspace workspace-${type} ${type !== "admin" ? "workspace-partner" : ""} ${className}`}
    >
      <WorkspaceNav type={type} />
      <main className="workspace-main">
        <AdminCommandBar type={type} />
        <header className="workspace-heading">
          <div>
            <p className="eyebrow">{workspaceNames[type].toUpperCase()}</p>
            <h1>{title}</h1>
            <p className="muted">{description}</p>
          </div>
          <div className="workspace-heading-actions">{action}</div>
        </header>
        {children}
      </main>
    </div>
  );
}
export function Metrics({ entries }) {
  return (
    <div className="workspace-metrics">
      {entries.map(([label, value]) => (
        <div key={label}>
          <p>{label}</p>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
