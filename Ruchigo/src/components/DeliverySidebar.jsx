import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  BarChart3,
  LogOut,
  Navigation,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import Logo from "./common/Logo";
import Navbar from "./Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/delivery-dashboard",
  },
  {
    name: "Orders",
    icon: ShoppingBag,
    path: "/delivery-orders",
  },
  {
    name: "Navigation",
    icon: Navigation,
    path: "/delivery-navigation",
  },
  {
    name: "Earnings",
    icon: Wallet,
    path: "/delivery-earnings",
  },
  {
    name: "Profile",
    icon: BarChart3,
    path: "/delivery-profile",
  },
];

export default function DeliverySidebar() {
  const { user, logout } = useAuth();
  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || "D";

  return (
    <>
    <div className="lg:hidden"><Navbar /></div>
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col border-r border-orange-100 bg-white p-6 lg:flex">
      {/* Logo */}
      <NavLink to="/" aria-label="Go to RuchiGo home" className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
        <Logo type="icon" size="sm" />

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Ruchi<span className="text-orange-500">Go</span>
          </h1>

          <p className="text-xs text-gray-500">
            Delivery Partner
          </p>
        </div>
      </NavLink>

      {/* Account Card */}
      <div className="mt-8 rounded-2xl bg-orange-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 font-bold text-white">
            {initials}
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Delivery partner
            </p>

            <p className="font-bold text-gray-900">
              {user?.email || "Delivery account"}
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />

              <p className="text-xs font-semibold text-green-600">
                Signed in
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-2xl px-5 py-4 font-semibold transition ${
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                }`
              }
            >
              <Icon size={21} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 pt-5">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-semibold text-red-500 transition hover:bg-red-50"
        >
          <LogOut size={21} />

          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}
