import { Bell } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useInbox } from "../../context/InboxContext.jsx";

export default function NotificationBell({ className = "" }) {
  const { isAuthenticated } = useAuth();
  const { unreadCount, error, refreshUnread } = useInbox();
  if (!isAuthenticated) return null;
  const label = error
    ? "Notifications, unread count unavailable"
    : unreadCount == null
      ? "Notifications"
      : `Notifications, ${unreadCount} unread`;
  return (
    <NavLink
      to="/notifications"
      className={`notification-bell ${className}`}
      aria-label={label}
      title={label}
      onClick={refreshUnread}
    >
      <Bell size={21} strokeWidth={1.8} aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="notification-badge" aria-hidden="true">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
      {error && (
        <span className="notification-count-error" aria-hidden="true" />
      )}
    </NavLink>
  );
}
