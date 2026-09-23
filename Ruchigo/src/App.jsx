import { lazy, Suspense } from "react";
import { Link, Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home.jsx"));
const ForYou = lazy(() => import("./pages/ForYou.jsx"));
const SearchPage = lazy(() => import("./pages/Search.jsx"));
const Restaurant = lazy(() =>
  import("./pages/CatalogPages.jsx").then((m) => ({
    default: m.RestaurantPage,
  })),
);
const FoodDetails = lazy(() =>
  import("./pages/CatalogPages.jsx").then((m) => ({
    default: m.FoodDetailPage,
  })),
);
const Cart = lazy(() =>
  import("./pages/CheckoutPages.jsx").then((m) => ({ default: m.CartPage })),
);
const Checkout = lazy(() =>
  import("./pages/CheckoutPages.jsx").then((m) => ({
    default: m.CheckoutPage,
  })),
);
const Payment = lazy(() =>
  import("./pages/OrderPages.jsx").then((m) => ({ default: m.TrackingPage })),
);
const Tracking = lazy(() =>
  import("./pages/OrderPages.jsx").then((m) => ({ default: m.TrackingPage })),
);
// Isolated, explicitly labelled read-only demo; never calls real order writes.
const DeliveryDemo = lazy(() => import("./pages/DeliveryDemo.jsx"));
const Profile = lazy(() => import("./pages/CustomerProfile.jsx"));
const Rewards = lazy(() => import("./pages/RewardsPage.jsx"));
const Orders = lazy(() =>
  import("./pages/OrderPages.jsx").then((m) => ({ default: m.OrdersPage })),
);
const Wishlist = lazy(() =>
  import("./pages/AccountPages.jsx").then((m) => ({ default: m.WishlistPage })),
);
const Settings = lazy(() => import("./pages/Settings.jsx"));
const Addresses = lazy(() =>
  import("./pages/AccountPages.jsx").then((m) => ({
    default: m.AddressesPage,
  })),
);
const Notifications = lazy(() =>
  import("./pages/AccountPages.jsx").then((m) => ({
    default: m.NotificationsPage,
  })),
);
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const FAQ = lazy(() => import("./pages/FAQ.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));
const Offers = lazy(() =>
  import("./pages/AccountPages.jsx").then((m) => ({ default: m.OffersPage })),
);
const Support = lazy(() => import("./pages/SupportPage.jsx"));
const PromotionWorkspace = lazy(() => import("./pages/PromotionWorkspace.jsx"));
const OperationsWorkspace = lazy(
  () => import("./pages/OperationsWorkspace.jsx"),
);
const RestaurantDashboard = lazy(() =>
  import("./pages/PartnerOverview.jsx").then((m) => ({
    default: m.RestaurantOverview,
  })),
);
const RestaurantMenu = lazy(() =>
  import("./pages/RestaurantWorkspace.jsx").then((m) => ({
    default: m.MenuWorkspace,
  })),
);
const RestaurantOrders = lazy(() =>
  import("./pages/RestaurantWorkspace.jsx").then((m) => ({
    default: m.KitchenOrders,
  })),
);
const RestaurantProfile = lazy(() =>
  import("./pages/RestaurantWorkspace.jsx").then((m) => ({
    default: m.RestaurantProfile,
  })),
);
const rolePages = () => import("./pages/LiveRolePages.jsx");
const RestaurantEarnings = lazy(() => import("./pages/LedgerWorkspace.jsx"));
const RestaurantAnalytics = lazy(() =>
  rolePages().then((module) => ({ default: module.RestaurantAnalytics })),
);
const DeliveryDashboard = lazy(() =>
  import("./pages/PartnerOverview.jsx").then((module) => ({
    default: module.DeliveryOverview,
  })),
);
const DeliveryOrders = lazy(() =>
  import("./pages/DeliveryWorkspace.jsx").then((m) => ({
    default: m.DeliveryRequests,
  })),
);
const DeliveryNavigation = lazy(() =>
  import("./pages/DeliveryWorkspace.jsx").then((m) => ({
    default: m.ActiveDelivery,
  })),
);
const DeliveryEarnings = lazy(() =>
  import("./pages/PartnerOverview.jsx").then((module) => ({
    default: module.DeliveryHistory,
  })),
);
const DeliveryProfile = lazy(() => import("./pages/PartnerAccount.jsx"));
const adminPages = () => import("./pages/admin/LiveAdminPages.jsx");
const AdminOrderPolicies = lazy(
  () => import("./pages/admin/OrderPolicies.jsx"),
);
const TeamAccess = lazy(() => import("./pages/admin/TeamAccess.jsx"));
const AdminDeliveryZones = lazy(
  () => import("./pages/admin/DeliveryZones.jsx"),
);
const AdminDashboard = lazy(() =>
  adminPages().then((module) => ({ default: module.AdminDashboard })),
);
const UserManagement = lazy(() => import("./pages/admin/PeopleWorkspace.jsx"));
const AdminRestaurants = lazy(() =>
  adminPages().then((module) => ({ default: module.AdminRestaurants })),
);
const AdminDeliveryPartners = lazy(() =>
  adminPages().then((module) => ({ default: module.AdminDeliveryPartners })),
);
const AdminOrders = lazy(() => import("./pages/admin/OrderQueue.jsx"));
const AdminPayments = lazy(() => import("./pages/LedgerWorkspace.jsx"));
const AdminReports = lazy(() =>
  adminPages().then((module) => ({ default: module.AdminReports })),
);
const Login = lazy(() => import("./pages/Auth/Login.jsx"));
const Register = lazy(() => import("./pages/Auth/Register.jsx"));
const PendingApproval = lazy(() => import("./pages/Auth/PendingApproval.jsx"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword.jsx"));
const VerifyOTP = lazy(() => import("./pages/Auth/VerifyOTP.jsx"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword.jsx"));
const EmailVerification = lazy(
  () => import("./pages/Auth/EmailVerification.jsx"),
);
const TwoFactorAuth = lazy(() => import("./pages/Auth/TwoFactorAuth.jsx"));
const AccountLocked = lazy(() => import("./pages/Auth/AccountLocked.jsx"));
const Unauthorized = lazy(() => import("./pages/Auth/Unauthorized.jsx"));
const AccessDenied = lazy(() => import("./pages/Auth/AccessDenied.jsx"));
const SessionExpired = lazy(() => import("./pages/Auth/SessionExpired.jsx"));

import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import GuestRoute from "./components/auth/GuestRoute.jsx";
import Footer from "./components/Footer.jsx";
import LoadingScreen from "./components/common/LoadingScreen.jsx";
import RouteFocus from "./components/common/RouteFocus.jsx";

export default function App() {
  return (
    <>
      <RouteFocus />
      <Suspense fallback={<LoadingScreen message="Loading page…" />}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path="/pending-approval"
            element={
              <GuestRoute>
                <PendingApproval />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <GuestRoute>
                <VerifyOTP />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestRoute>
                <ResetPassword />
              </GuestRoute>
            }
          />
          <Route
            path="/email-verification"
            element={
              <ProtectedRoute>
                <EmailVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/two-factor-auth"
            element={
              <GuestRoute>
                <TwoFactorAuth />
              </GuestRoute>
            }
          />
          <Route
            path="/account-locked"
            element={
              <GuestRoute>
                <AccountLocked />
              </GuestRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/session-expired" element={<SessionExpired />} />

          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/support" element={<Support />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/for-you" element={<ForYou />} />
          <Route path="/demo/delivery" element={<DeliveryDemo />} />
          <Route path="/restaurant/:id" element={<Restaurant />} />
          <Route path="/food-details/:id" element={<FoodDetails />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Rewards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking/:id?"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Tracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addresses"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Addresses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/restaurant-dashboard"
            element={
              <ProtectedRoute allowedRoles={["restaurant"]}>
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-menu"
            element={
              <ProtectedRoute allowedRoles={["restaurant"]}>
                <RestaurantMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-orders"
            element={
              <ProtectedRoute allowedRoles={["restaurant"]}>
                <RestaurantOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-earnings"
            element={
              <ProtectedRoute allowedRoles={["restaurant"]}>
                <RestaurantEarnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-analytics"
            element={
              <ProtectedRoute allowedRoles={["restaurant"]}>
                <RestaurantAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-profile"
            element={
              <ProtectedRoute allowedRoles={["restaurant"]}>
                <RestaurantProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-offers"
            element={
              <ProtectedRoute allowedRoles={["restaurant"]}>
                <PromotionWorkspace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/delivery-dashboard"
            element={
              <ProtectedRoute allowedRoles={["delivery"]}>
                <DeliveryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery-orders"
            element={
              <ProtectedRoute allowedRoles={["delivery"]}>
                <DeliveryOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery-navigation"
            element={
              <ProtectedRoute allowedRoles={["delivery"]}>
                <DeliveryNavigation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery-earnings"
            element={
              <ProtectedRoute allowedRoles={["delivery"]}>
                <DeliveryEarnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery-profile"
            element={
              <ProtectedRoute allowedRoles={["delivery"]}>
                <DeliveryProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-access"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <TeamAccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-order-policy"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminOrderPolicies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-delivery-zones"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDeliveryZones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-partner-accounts"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserManagement key="partners" partnersOnly />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-restaurants"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRestaurants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-delivery-partners"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDeliveryPartners />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-orders"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-payments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-catalog"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PromotionWorkspace key="catalog" initialTab="categories" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-offers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PromotionWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-reviews"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <OperationsWorkspace key="reviews" reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-activity"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <OperationsWorkspace key="activity" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-profile"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DeliveryProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-4 text-center">
                <div className="rounded-[28px] border border-orange-100 bg-white p-8 shadow-sm">
                  <h1 className="text-3xl font-black text-gray-900">
                    404 - Page Not Found
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    The page you are looking for does not exist.
                  </p>
                  <Link
                    to="/"
                    className="mt-5 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}
