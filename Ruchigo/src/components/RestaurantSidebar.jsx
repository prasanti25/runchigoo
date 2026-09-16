import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Wallet,
  ChartNoAxesCombined,
  Store,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "./common/Logo";
import { useAuth } from "../context/AuthContext.jsx";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/restaurant-dashboard",
  },
  {
    name: "Menu",
    icon: UtensilsCrossed,
    path: "/restaurant-menu",
  },
  {
    name: "Orders",
    icon: ShoppingBag,
    path: "/restaurant-orders",
  },
  {
    name: "Earnings",
    icon: Wallet,
    path: "/restaurant-earnings",
  },
  {
    name: "Analytics",
    icon: ChartNoAxesCombined,
    path: "/restaurant-analytics",
  },
];

export default function RestaurantSidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-orange-100 bg-white p-6">
      <div className="flex items-center gap-3">
        <Logo type="icon" size="sm" />

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Ruchi<span className="text-orange-500">Go</span>
          </h1>

          <p className="text-xs text-gray-500">
            Restaurant Partner
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-orange-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-orange-500">
            <Store size={21} />
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Restaurant
            </p>

            <p className="font-bold text-gray-900">
              {user?.email || "Restaurant account"}
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `flex items-center gap-4 rounded-2xl px-5 py-4 font-semibold transition ${isActive ? "bg-orange-500 text-white shadow-lg" : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"}`}
            >
              <Icon size={21} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-gray-100 pt-5">
        <NavLink to="/settings" className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-semibold text-gray-600 transition hover:bg-orange-50 hover:text-orange-500">
          <Settings size={21} />
          Settings
        </NavLink>

        <button onClick={() => logout()} className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-semibold text-red-500 transition hover:bg-red-50">
          <LogOut size={21} />
          Logout
        </button>
      </div>
    </aside>
  );
}
