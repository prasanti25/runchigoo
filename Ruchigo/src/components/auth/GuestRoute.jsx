import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingScreen from "../common/LoadingScreen.jsx";

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Preparing your experience…" />;
  }

  if (isAuthenticated) {
    const roleHome =
      role === "admin"
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
