import { useEffect, useState } from "react";
import { CheckCircle2, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";

export default function Payment() {
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  useEffect(() => { apiRequest("/orders/", { token }).then((data) => setOrder((data.results || data)[0] || null)); }, [token]);
  return <><Navbar /><main className="min-h-screen bg-[#fffaf7]"><section className="mx-auto max-w-2xl px-6 py-16 text-center"><div className="rounded-3xl border border-orange-100 bg-white p-10 shadow-sm">{order ? <><CheckCircle2 className="mx-auto text-green-500" size={64} /><h1 className="mt-5 text-3xl font-bold text-gray-900">Order confirmed</h1><p className="mt-3 text-gray-600">Your cash-on-delivery order has been placed with {order.restaurant_detail?.name || "the restaurant"}.</p><div className="mt-6 rounded-2xl bg-orange-50 p-5"><Truck className="mx-auto text-orange-500" size={28} /><p className="mt-2 font-semibold">Pay ₹{order.total} when your order arrives.</p></div><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to={`/tracking/${order.id}`} className="flex-1 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white">Track order</Link><Link to="/orders" className="flex-1 rounded-xl border border-orange-200 px-5 py-3 font-semibold text-orange-500">View orders</Link></div></> : <><h1 className="text-3xl font-bold text-gray-900">No order awaiting payment</h1><Link to="/" className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white">Browse food</Link></>}</div></section></main></>;
}
