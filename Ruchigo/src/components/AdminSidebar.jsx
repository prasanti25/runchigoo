import {
  LayoutDashboard,
  Users,
  Store,
  Bike,
  ShoppingBag,
  CreditCard,
  BarChart3,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import Logo from "./common/Logo";
import Navbar from "./Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin-dashboard",
  },
  {
    name: "Users",
    icon: Users,
    path: "/admin-users",
  },
  {
    name: "Restaurants",
    icon: Store,
    path: "/admin-restaurants",
  },
  {
    name: "Delivery Partners",
    icon: Bike,
    path: "/admin-delivery-partners",
  },
  {
    name: "Orders",
    icon: ShoppingBag,
    path: "/admin-orders",
  },
  {
    name: "Payments",
    icon: CreditCard,
    path: "/admin-payments",
  },
  {
    name: "Reports",
    icon: BarChart3,
    path: "/admin-reports",
  },
];

export default function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <>
    <div className="lg:hidden"><Navbar /></div>
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col border-r border-orange-100 bg-white p-6 lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Logo type="icon" size="sm" />

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Ruchi<span className="text-orange-500">Go</span>
          </h1>

          <p className="text-xs text-gray-500">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Admin Profile */}
      <div className="mt-8 rounded-2xl bg-orange-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
            AD
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Administrator
            </p>

            <p className="font-bold text-gray-900">
              RuchiGo Admin
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />

              <p className="text-xs font-semibold text-green-600">
                Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1 space-y-2 overflow-y-auto">
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
          type="button"
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
