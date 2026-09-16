import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf7] text-gray-700">
        <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-5 py-4 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
          <span className="font-semibold">Preparing your experience...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const roleHome = role === "admin"
      ? "/admin-dashboard"
      : role === "restaurant"
        ? "/restaurant-dashboard"
        : role === "delivery"
          ? "/delivery-dashboard"
          : "/";
    return <Navigate to={location.state?.from?.pathname || roleHome} replace />;
  }

  return children;
}
