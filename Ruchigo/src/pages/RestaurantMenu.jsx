import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageCheck, PackageX, Search, UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";
import RestaurantSidebar from "../components/RestaurantSidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";

export default function RestaurantMenu() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const load = useCallback(async () => { try { const data = await apiRequest("/menu-items/", { token }); setItems(data.results || data); } catch (error) { toast.error(error.message); } }, [token]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);
  const filtered = useMemo(() => items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())), [items, query]);
  const toggle = async (item) => { try { const updated = await apiRequest(`/menu-items/${item.id}/`, { token, method: "PATCH", body: { is_available: !item.is_available } }); setItems((all) => all.map((entry) => entry.id === item.id ? updated : entry)); toast.success(`${item.name} is now ${updated.is_available ? "available" : "unavailable"}.`); } catch (error) { toast.error(error.message); } };
  const stats = [["Total menu items", items.length, UtensilsCrossed, "text-orange-500"], ["Available", items.filter((item) => item.is_available).length, PackageCheck, "text-green-600"], ["Unavailable", items.filter((item) => !item.is_available).length, PackageX, "text-red-500"]];
  return <div className="min-h-screen bg-[#fffaf7]"><RestaurantSidebar /><main className="ml-72 min-h-screen p-8"><p className="text-sm text-gray-500">Restaurant management</p><h1 className="mt-1 text-3xl font-bold">Menu Management</h1><div className="mt-7 grid gap-5 md:grid-cols-3">{stats.map(([label, value, Icon, color]) => <div key={label} className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"><Icon className={color} /><p className="mt-4 text-sm text-gray-500">{label}</p><p className="text-3xl font-bold">{value}</p></div>)}</div><div className="mt-8 flex items-center rounded-2xl border border-orange-100 bg-white px-4"><Search className="text-gray-400" size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search menu items..." className="w-full px-4 py-4 outline-none" /></div><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((item) => <article key={item.id} className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm"><div className="h-40 bg-orange-50"><img src={item.image || "/favicon.svg"} alt="" className="h-full w-full object-cover" /></div><div className="p-5"><p className="text-sm text-orange-500">{item.category_name || "Menu"}</p><h2 className="mt-1 text-xl font-bold">{item.name}</h2><p className="mt-2 text-sm text-gray-500">₹{item.price}</p><button onClick={() => toggle(item)} className={`mt-5 w-full rounded-xl px-4 py-3 font-semibold ${item.is_available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{item.is_available ? "Available — mark unavailable" : "Unavailable — mark available"}</button></div></article>)}{!filtered.length && <p className="text-gray-500">No menu items found.</p>}</div></main></div>;
}
