import { Link, Navigate, useLocation } from "react-router-dom";
import { canOpenAdminRoute } from "../../lib/adminAccess.js";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingScreen from "../common/LoadingScreen.jsx";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { isAuthenticated, loading, role, user } = useAuth();

  if (loading) {
    return <LoadingScreen message="Preparing your secure session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const personalShopping =
    role === "admin" && allowedRoles.includes("customer");
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role) &&
    !personalShopping
  ) {
    const roleHome =
      role === "admin"
        ? "/admin-dashboard"
        : role === "restaurant"
          ? "/restaurant-dashboard"
          : role === "delivery"
            ? "/delivery-dashboard"
            : "/";
    return <Navigate to={roleHome} replace />;
  }

  const personalSupport =
    location.pathname === "/support" &&
    new URLSearchParams(location.search).get("view") !== "team";
  if (
    role === "admin" &&
    !personalSupport &&
    !canOpenAdminRoute(user, location.pathname)
  ) {
    return (
      <main className="container customer-main">
        <h1>Workspace access required</h1>
        <p>
          Your administrator account does not have access to this workspace. Ask
          a superuser to review your team permissions.
        </p>
        <Link className="btn secondary mt-5" to="/admin-dashboard">
          Back to your workspace
        </Link>
      </main>
    );
  }
  return children;
}
