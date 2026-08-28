import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import SearchPage from "./pages/Search.jsx";
import Restaurant from "./pages/Restaurant.jsx";
import FoodDetails from "./pages/FoodDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Payment from "./pages/Payment.jsx";
import Tracking from "./pages/Tracking.jsx";
import Profile from "./pages/Profile.jsx";
import Orders from "./pages/Orders.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Settings from "./pages/Settings.jsx";
import Addresses from "./pages/Addresses.jsx";
import Notifications from "./pages/Notifications.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import FAQ from "./pages/FAQ.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import Offers from "./pages/Offers.jsx";
import Support from "./pages/Support.jsx";

import RestaurantDashboard from "./pages/RestaurantDashboard.jsx";
import RestaurantMenu from "./pages/RestaurantMenu.jsx";
import RestaurantOrders from "./pages/RestaurantOrders.jsx";
import RestaurantEarnings from "./pages/RestaurantEarnings.jsx";
import RestaurantAnalytics from "./pages/RestaurantAnalytics.jsx";

import DeliveryDashboard from "./pages/DeliveryDashboard.jsx";
import DeliveryOrders from "./pages/DeliveryOrders.jsx";
import DeliveryNavigation from "./pages/DeliveryNavigation.jsx";
import DeliveryEarnings from "./pages/DeliveryEarnings.jsx";
import DeliveryProfile from "./pages/DeliveryProfile.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import AdminRestaurants from "./pages/AdminRestaurants.jsx";
import AdminDeliveryPartners from "./pages/AdminDeliveryPartners.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminPayments from "./pages/AdminPayments.jsx";
import AdminReports from "./pages/AdminReports.jsx";

import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import PendingApproval from "./pages/Auth/PendingApproval.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import VerifyOTP from "./pages/Auth/VerifyOTP.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";
import EmailVerification from "./pages/Auth/EmailVerification.jsx";
import TwoFactorAuth from "./pages/Auth/TwoFactorAuth.jsx";
import AccountLocked from "./pages/Auth/AccountLocked.jsx";
import Unauthorized from "./pages/Auth/Unauthorized.jsx";
import AccessDenied from "./pages/Auth/AccessDenied.jsx";
import SessionExpired from "./pages/Auth/SessionExpired.jsx";

import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import GuestRoute from "./components/auth/GuestRoute.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/pending-approval" element={<GuestRoute><PendingApproval /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/verify-otp" element={<GuestRoute><VerifyOTP /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
        <Route path="/email-verification" element={<ProtectedRoute><EmailVerification /></ProtectedRoute>} />
        <Route path="/two-factor-auth" element={<GuestRoute><TwoFactorAuth /></GuestRoute>} />
        <Route path="/account-locked" element={<GuestRoute><AccountLocked /></GuestRoute>} />
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
        <Route path="/restaurant/:id" element={<Restaurant />} />
        <Route path="/food-details/:id" element={<FoodDetails />} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/tracking/:id?" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        <Route path="/restaurant-dashboard" element={<ProtectedRoute allowedRoles={["restaurant"]}><RestaurantDashboard /></ProtectedRoute>} />
        <Route path="/restaurant-menu" element={<ProtectedRoute allowedRoles={["restaurant"]}><RestaurantMenu /></ProtectedRoute>} />
        <Route path="/restaurant-orders" element={<ProtectedRoute allowedRoles={["restaurant"]}><RestaurantOrders /></ProtectedRoute>} />
        <Route path="/restaurant-earnings" element={<ProtectedRoute allowedRoles={["restaurant"]}><RestaurantEarnings /></ProtectedRoute>} />
        <Route path="/restaurant-analytics" element={<ProtectedRoute allowedRoles={["restaurant"]}><RestaurantAnalytics /></ProtectedRoute>} />

        <Route path="/delivery-dashboard" element={<ProtectedRoute allowedRoles={["delivery"]}><DeliveryDashboard /></ProtectedRoute>} />
        <Route path="/delivery-orders" element={<ProtectedRoute allowedRoles={["delivery"]}><DeliveryOrders /></ProtectedRoute>} />
        <Route path="/delivery-navigation" element={<ProtectedRoute allowedRoles={["delivery"]}><DeliveryNavigation /></ProtectedRoute>} />
        <Route path="/delivery-earnings" element={<ProtectedRoute allowedRoles={["delivery"]}><DeliveryEarnings /></ProtectedRoute>} />
        <Route path="/delivery-profile" element={<ProtectedRoute allowedRoles={["delivery"]}><DeliveryProfile /></ProtectedRoute>} />

        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin-users" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin-restaurants" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRestaurants /></ProtectedRoute>} />
        <Route path="/admin-delivery-partners" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDeliveryPartners /></ProtectedRoute>} />
        <Route path="/admin-orders" element={<ProtectedRoute allowedRoles={["admin"]}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin-payments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPayments /></ProtectedRoute>} />
        <Route path="/admin-reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>} />

        <Route path="*" element={<div className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-4 text-center"><div className="rounded-[28px] border border-orange-100 bg-white p-8 shadow-sm"><h1 className="text-3xl font-black text-gray-900">404 - Page Not Found</h1><p className="mt-2 text-sm text-gray-600">The page you are looking for does not exist.</p><a href="/" className="mt-5 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white">Back to Home</a></div></div>} />
      </Routes>
      <Footer />
    </>
  );
}
