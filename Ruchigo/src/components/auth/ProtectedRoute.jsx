import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const location = useLocation();
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf7]">
        <div className="rounded-2xl border border-orange-100 bg-white px-6 py-4 text-sm font-semibold text-orange-500 shadow-sm">
          Preparing your secure session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const roleHome = role === "admin"
      ? "/admin-dashboard"
      : role === "restaurant"
        ? "/restaurant-dashboard"
        : role === "delivery"
          ? "/delivery-dashboard"
          : "/";
    return <Navigate to={roleHome} replace />;
  }

  return children;
}
