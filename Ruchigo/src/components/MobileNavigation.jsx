import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Bell,
  Compass,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  Search,
  Settings,
  ShoppingBag,
  Tag,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { canOpenAdminRoute } from "../lib/adminAccess.js";
import AssistantIcon from "./common/AssistantIcon.jsx";
import UserAvatar from "./common/UserAvatar.jsx";
import { Modal } from "./product/UI.jsx";
import AnimatedMenuIcon from "./common/AnimatedMenuIcon.jsx";

export default function MobileNavigation({
  workspaceMode,
  workspaceLinks,
  dashboard,
  onClose,
}) {
  const { user, role, isAuthenticated, logout } = useAuth();
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);
  const dismiss = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    if (closeTimer.current !== null) return;
    setClosing(true);
    closeTimer.current = window.setTimeout(onClose, 200);
  };
  const shopper = !isAuthenticated || ["customer", "admin"].includes(role);
  const navigation = workspaceMode
    ? workspaceLinks.map(([path, label, Icon]) => [
        `/${role}-${path}`,
        label,
        Icon,
      ])
    : [
        ["/", "Home", Compass],
        ["/search", "Explore", Search],
        ["/for-you", "For you", AssistantIcon],
        ["/offers", "Offers", Tag],
      ];
  const account = isAuthenticated
    ? [
        ...(!workspaceMode
          ? [
              [
                dashboard,
                role === "customer" ? "Your profile" : "Your dashboard",
                role === "customer" ? User : LayoutDashboard,
              ],
            ]
          : []),
        ...(shopper
          ? [
              [
                "/orders",
                role === "admin" ? "Your personal orders" : "Your orders",
                ShoppingBag,
              ],
              ["/rewards", "Your rewards", Tag],
              ["/wishlist", "Saved dishes", Heart],
              ["/addresses", "Delivery addresses", MapPin],
            ]
          : []),
        ["/notifications", "Notifications", Bell],
        ["/settings", "Account settings", Settings],
      ]
    : [
        ["/login", "Sign in", User],
        ["/register", "Create an account", User],
      ];
  const support =
    workspaceMode && role === "admin" ? "/support?view=team" : "/support";
  const showSupport =
    !workspaceMode || role !== "admin" || canOpenAdminRoute(user, "/support");
  const link = ([to, label, Icon]) => (
    <NavLink key={to} to={to} end={to === "/"} onClick={onClose}>
      <Icon size={20} aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );

  // Keep navigation above the page/header stacking contexts on every workspace.
  return createPortal(
    <Modal
      title={workspaceMode ? "Your workspace" : "Your RuchiGo"}
      className="navigation-sheet"
      backdropClassName={`navigation-backdrop${closing ? " is-closing" : ""}`}
      closeIcon={<AnimatedMenuIcon open={!closing} />}
      onClose={dismiss}
    >
      <div id="mobile-navigation">
        {isAuthenticated && (
          <div className="mobile-menu-person">
            <UserAvatar user={user} className="nav-avatar" />
            <div>
              <strong>{user?.first_name || "Your account"}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        )}
        <nav
          className="workspace-mobile-menu"
          aria-label={workspaceMode ? "All workspaces" : "Browse RuchiGo"}
        >
          {navigation.map(link)}
        </nav>
        <p className="mobile-menu-section-label">Your account</p>
        <nav className="mobile-account-links" aria-label="Account and help">
          {account.map(link)}
          {showSupport &&
            link([
              support,
              workspaceMode ? "Support inbox" : "Help & support",
              HelpCircle,
            ])}
          {workspaceMode && shopper && link(["/", "Order food", Compass])}
        </nav>
        {isAuthenticated && (
          <button
            type="button"
            className="mobile-menu-signout"
            onClick={() => {
              onClose();
              logout();
            }}
          >
            <LogOut size={19} aria-hidden="true" />
            Sign out
          </button>
        )}
      </div>
    </Modal>,
    document.body,
  );
}
