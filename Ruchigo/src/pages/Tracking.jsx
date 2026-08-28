import { useEffect, useMemo, useState } from "react";
import { Bike, Check, ChefHat, Home, PackageCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";

const stages = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"];

export default function Tracking() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  useEffect(() => { const path = id ? `/orders/${id}/` : "/orders/"; apiRequest(path, { token }).then((data) => setOrder(id ? data : (data.results || data)[0] || null)); }, [id, token]);
  const currentStage = useMemo(() => stages.indexOf(order?.status), [order]);
  if (!order) return <><Navbar /><main className="min-h-screen bg-[#fffaf7] p-10 text-center"><p>Loading your order…</p></main></>;
  const steps = [["Order placed", Check], ["Restaurant confirmed", PackageCheck], ["Preparing food", ChefHat], ["Out for delivery", Bike], ["Delivered", Home]];
  const completed = [0, 1, 2, 4, 5].filter((stage) => stage <= currentStage).length - 1;
  return <><Navbar /><main className="min-h-screen bg-[#fffaf7]"><section className="mx-auto max-w-3xl px-6 py-12"><p className="font-semibold text-orange-500">Live order</p><h1 className="mt-2 text-4xl font-bold">Track your order</h1><p className="mt-2 text-gray-500">Order #{String(order.number).slice(0, 8).toUpperCase()} · {order.restaurant_detail?.name}</p><div className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm"><p className="text-lg font-bold capitalize">{order.status.replaceAll("_", " ")}</p><p className="mt-2 text-gray-500">Total: ₹{order.total} · {order.payment?.method === "cod" ? "Cash on delivery" : order.payment?.status}</p><div className="mt-8 space-y-5">{steps.map(([label, Icon], index) => <div key={label} className="flex items-center gap-4"><div className={`flex h-11 w-11 items-center justify-center rounded-full ${index <= completed ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}><Icon size={20} /></div><span className={index <= completed ? "font-semibold" : "text-gray-500"}>{label}</span></div>)}</div></div><div className="mt-8 rounded-3xl border border-orange-100 bg-white p-7"><h2 className="text-xl font-bold">Order items</h2>{order.items.map((item) => <div key={item.id} className="mt-4 flex justify-between border-b pb-3 text-gray-700"><span>{item.quantity} × {item.name}</span><span>₹{item.total_price}</span></div>)}</div><Link to="/orders" className="mt-8 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white">View all orders</Link></section></main></>;
}
