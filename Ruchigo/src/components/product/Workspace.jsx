import { Link, NavLink } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Bike,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  MessageSquare,
  LogOut,
  MapPin,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Users,
  Utensils,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Navbar from "../Navbar.jsx";
import BrandLogo from "../common/BrandLogo.jsx";
import NotificationBell from "../common/NotificationBell.jsx";
import UserAvatar from "../common/UserAvatar.jsx";

const menus = {
  restaurant: [
    ["dashboard", "Overview", LayoutDashboard],
    ["orders", "Live orders", ShoppingBag],
    ["menu", "Your menu", Utensils],
    ["profile", "Restaurant profile", Store],
    ["offers", "Offers", Tag],
    ["earnings", "Payments", CreditCard],
    ["analytics", "Analytics", BarChart3],
  ],
  delivery: [
    ["dashboard", "Overview", LayoutDashboard],
    ["orders", "Delivery requests", ShoppingBag],
    ["navigation", "Active delivery", MapPin],
    ["earnings", "Delivery history", CreditCard],
    ["profile", "My profile", Bike],
  ],
  admin: [
    ["dashboard", "Overview", LayoutDashboard],
    ["orders", "Orders", ShoppingBag],
    ["restaurants", "Restaurants", Store],
    ["delivery-partners", "Delivery partners", Bike],
    ["users", "People", Users],
    ["payments", "Payments", CreditCard],
    ["offers", "Offers & coupons", Tag],
    ["reports", "Analytics", BarChart3],
    ["reviews", "Review moderation", MessageSquare],
    ["activity", "Activity log", ListChecks],
    ["profile", "My profile", Settings],
  ],
};
export function WorkspaceNav({ type }) {
  const { user, logout } = useAuth();
  return (
    <>
      <div className="lg:hidden">
        <Navbar />
      </div>
      <aside className="workspace-sidebar">
        <Link className="brand" to="/">
          <BrandLogo />
        </Link>
        <p className="workspace-label">
          {type === "admin"
            ? "PLATFORM OPERATIONS"
            : type === "restaurant"
              ? "PARTNER KITCHEN"
              : "DELIVERY PARTNER"}
        </p>
        <div className="workspace-person">
          <UserAvatar user={user} className="workspace-avatar" />
          <div>
            <strong>
              {user?.first_name ||
                `${type[0].toUpperCase()}${type.slice(1)} account`}
            </strong>
            <small>{user?.email}</small>
          </div>
        </div>
        <nav aria-label={`${type} workspace`}>
          {menus[type].map(([path, label, Icon]) => (
            <NavLink key={path} to={`/${type}-${path}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <NavLink to="/notifications">
            <Bell size={18} />
            Notifications
          </NavLink>
        </nav>
        <div className="workspace-bottom">
          <NavLink to="/support">
            <LifeBuoy size={17} />
            Help & support
          </NavLink>
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
export function WorkspaceFrame({ type, title, description, action, children }) {
  return (
    <div className="workspace">
      <WorkspaceNav type={type} />
      <main className="workspace-main">
        <header className="workspace-heading">
          <div>
            <p className="eyebrow">YOUR {type.toUpperCase()} WORKSPACE</p>
            <h1>{title}</h1>
            <p className="muted">{description}</p>
          </div>
          <div className="workspace-heading-actions">
            {action}
            <NotificationBell className="workspace-notification-bell" />
          </div>
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
