import Logo from "./common/Logo.jsx";
import {
  BarChart3,
  ChefHat,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  User,
  Users,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";

export default function Navbar() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const guestItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Restaurants", icon: Search, path: "/search" },
    { name: "Offers", icon: MapPin, path: "/offers" },
  ];

  const customerItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Restaurants", icon: Search, path: "/search" },
    { name: "Cart", icon: ShoppingCart, path: "/cart" },
    { name: "Orders", icon: Package, path: "/orders" },
    { name: "Wishlist", icon: Heart, path: "/wishlist" },
  ];

  const restaurantItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/restaurant-dashboard" },
    { name: "Menu", icon: ChefHat, path: "/restaurant-menu" },
    { name: "Orders", icon: Package, path: "/restaurant-orders" },
    { name: "Earnings", icon: BarChart3, path: "/restaurant-earnings" },
    { name: "Analytics", icon: BarChart3, path: "/restaurant-analytics" },
  ];

  const deliveryItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/delivery-dashboard" },
    { name: "Orders", icon: Package, path: "/delivery-orders" },
    { name: "Navigation", icon: Truck, path: "/delivery-navigation" },
    { name: "Earnings", icon: BarChart3, path: "/delivery-earnings" },
    { name: "Profile", icon: User, path: "/delivery-profile" },
  ];

  const adminItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
    { name: "Users", icon: Users, path: "/admin-users" },
    { name: "Restaurants", icon: ChefHat, path: "/admin-restaurants" },
    { name: "Delivery", icon: Truck, path: "/admin-delivery-partners" },
    { name: "Orders", icon: Package, path: "/admin-orders" },
    { name: "Payments", icon: ShoppingCart, path: "/admin-payments" },
    { name: "Reports", icon: BarChart3, path: "/admin-reports" },
  ];

  const items =
    role === "restaurant"
      ? restaurantItems
      : role === "delivery"
        ? deliveryItems
        : role === "admin"
          ? adminItems
          : isAuthenticated
            ? customerItems
            : guestItems;

  const profileItems = [
    { name: "My Profile", icon: User, path: "/profile" },
    { name: "My Orders", icon: Package, path: "/orders" },
    { name: "Saved Addresses", icon: MapPin, path: "/addresses" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  const roleLabel =
    role === "restaurant"
      ? "Restaurant Partner"
      : role === "delivery"
        ? "Delivery Partner"
        : role === "admin"
          ? "Admin"
          : "Customer";

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex min-w-0 items-center gap-2">
          <Logo type="full" className="h-10 w-auto sm:h-11" showText />
        </NavLink>

        <div className="hidden items-center gap-2 lg:flex">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="hidden items-center gap-3 lg:flex">
              <div className="rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2 text-sm text-gray-700">
                <p className="text-[11px] text-gray-500">Signed in as</p>
                <p className="font-semibold text-gray-900">{user?.name || roleLabel}</p>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-3 py-2">
                {profileItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                  >
                    {item.name}
                  </NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-2 py-1 text-sm text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <NavLink
                to="/login"
                className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Register
              </NavLink>
            </div>
          )}

          <button
            className="rounded-xl border border-orange-100 p-2 text-orange-500 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-orange-100 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {isAuthenticated ? (
              <>
                {profileItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-500"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="rounded-xl border border-orange-200 px-3 py-3 text-center text-sm font-semibold text-orange-500"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-xl bg-orange-500 px-3 py-3 text-center text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
