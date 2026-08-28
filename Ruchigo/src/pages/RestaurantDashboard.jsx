import { useEffect, useState } from "react";
import { Clock, IndianRupee, PackageCheck, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import RestaurantSidebar from "../components/RestaurantSidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";

export default function RestaurantDashboard() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  useEffect(() => { const timer = window.setTimeout(() => { apiRequest("/orders/", { token }).then((data) => setOrders(data.results || data)).catch(() => setOrders([])); }, 0); return () => window.clearTimeout(timer); }, [token]);
  const revenue = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + Number(order.total), 0);
  const pending = orders.filter((order) => ["pending", "confirmed", "preparing"].includes(order.status)).length;
  const cards = [["Total orders", orders.length, ShoppingBag], ["Revenue", `₹${revenue}`, IndianRupee], ["Needs attention", pending, Clock], ["Ready", orders.filter((order) => order.status === "ready").length, PackageCheck]];
  return <div className="min-h-screen bg-[#fffaf7]"><RestaurantSidebar /><main className="ml-72 min-h-screen p-8"><p className="text-sm text-gray-500">Welcome back</p><h1 className="mt-1 text-3xl font-bold">Restaurant Dashboard</h1><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon]) => <div key={label} className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"><Icon className="text-orange-500" /><p className="mt-4 text-sm text-gray-500">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div>)}</div><section className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold">Recent orders</h2><p className="mt-1 text-gray-500">Live orders assigned to your restaurant.</p></div><Link to="/restaurant-orders" className="font-semibold text-orange-500">Manage orders</Link></div><div className="mt-6 divide-y">{orders.slice(0, 6).map((order) => <div key={order.id} className="flex justify-between gap-4 py-4"><div><p className="font-semibold">#{String(order.number).slice(0, 8).toUpperCase()} · {order.customer_detail?.first_name || "Customer"}</p><p className="text-sm text-gray-500">{order.items.length} item(s) · {order.status.replaceAll("_", " ")}</p></div><p className="font-bold">₹{order.total}</p></div>)}{!orders.length && <p className="py-8 text-gray-500">No orders yet.</p>}</div></section></main></div>;
}
