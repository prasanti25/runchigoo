import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import DeliverySidebar from "../components/DeliverySidebar.jsx";
import RestaurantSidebar from "../components/RestaurantSidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import { fetchAllPages } from "../lib/collections.js";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Date(value).toLocaleString() : "—";
const label = (value) => String(value || "—").replaceAll("_", " ");

function RoleFrame({ type, title, subtitle, children }) {
  const Sidebar = type === "delivery" ? DeliverySidebar : RestaurantSidebar;
  return <div className="min-h-screen bg-[#fffaf7]"><Sidebar /><main className="ml-72 min-h-screen p-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">{type} workspace</p><h1 className="mt-2 text-3xl font-bold text-gray-900">{title}</h1><p className="mt-2 text-sm text-gray-500">{subtitle}</p><div className="mt-8">{children}</div></main></div>;
}

function Notice({ loading, error, empty }) {
  if (loading) return <p className="rounded-2xl bg-white p-6 text-gray-500">Loading live data…</p>;
  if (error) return <p className="rounded-2xl bg-red-50 p-6 text-red-700">{error}</p>;
  if (empty) return <p className="rounded-2xl bg-white p-6 text-gray-500">No records found.</p>;
  return null;
}

function Metrics({ entries }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{entries.map(([name, value]) => <div key={name} className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"><p className="text-sm text-gray-500">{name}</p><p className="mt-2 text-3xl font-bold text-gray-900">{value}</p></div>)}</div>;
}

function useCollection(path) {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetchAllPages(path, { token }).then((items) => { if (active) setRecords(items); }).catch((requestError) => { if (active) setError(requestError.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path, token]);
  return { records, loading, error };
}

export function RestaurantEarnings() {
  const { records, loading, error } = useCollection("/payments/");
  const paid = records.filter((item) => item.status === "paid");
  return <RoleFrame type="restaurant" title="Payments" subtitle="Live gross order payments. Settlement and commission accounting require a payout provider."><Metrics entries={[["Transactions", records.length], ["Paid order value", money(paid.reduce((sum, item) => sum + Number(item.amount), 0))], ["Pending", records.filter((item) => item.status === "pending").length], ["Refunded", records.filter((item) => item.status === "refunded").length]]} /><Notice loading={loading} error={error} empty={!loading && !records.length} />{!!records.length && <div className="mt-6 overflow-x-auto rounded-3xl border border-orange-100 bg-white p-6"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="py-3">Payment</th><th>Order</th><th>Method</th><th>Status</th><th>Gross value</th><th>Date</th></tr></thead><tbody>{records.map((payment) => <tr key={payment.id} className="border-b border-gray-100"><td className="py-4 font-semibold">#{payment.id}</td><td>#{payment.order}</td><td className="uppercase">{payment.method}</td><td className="capitalize">{payment.status}</td><td>{money(payment.amount)}</td><td>{date(payment.created_at)}</td></tr>)}</tbody></table></div>}</RoleFrame>;
}

export function RestaurantAnalytics() {
  const { records, loading, error } = useCollection("/orders/");
  const itemCounts = useMemo(() => {
    const counts = new Map();
    records.forEach((order) => order.items.forEach((item) => counts.set(item.name, (counts.get(item.name) || 0) + item.quantity)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [records]);
  const delivered = records.filter((item) => item.status === "delivered");
  return <RoleFrame type="restaurant" title="Analytics" subtitle="Metrics calculated from your live order history."><Metrics entries={[["Orders", records.length], ["Delivered", delivered.length], ["Delivered value", money(delivered.reduce((sum, item) => sum + Number(item.total), 0))], ["Cancelled", records.filter((item) => item.status === "cancelled").length]]} /><Notice loading={loading} error={error} empty={!loading && !records.length} />{!!records.length && <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-3xl border border-orange-100 bg-white p-6"><h2 className="text-xl font-bold">Order status</h2>{[...new Set(records.map((item) => item.status))].map((status) => <div key={status} className="mt-4 flex justify-between capitalize"><span>{label(status)}</span><strong>{records.filter((item) => item.status === status).length}</strong></div>)}</section><section className="rounded-3xl border border-orange-100 bg-white p-6"><h2 className="text-xl font-bold">Top ordered items</h2>{itemCounts.map(([name, count]) => <div key={name} className="mt-4 flex justify-between"><span>{name}</span><strong>{count}</strong></div>)}{!itemCounts.length && <p className="mt-4 text-gray-500">No item history yet.</p>}</section></div>}</RoleFrame>;
}

function DeliveryOrderTable({ records }) {
  return <div className="overflow-x-auto rounded-3xl border border-orange-100 bg-white p-6"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="py-3">Order</th><th>Restaurant</th><th>Customer</th><th>Status</th><th>Updated</th></tr></thead><tbody>{records.map((order) => <tr key={order.id} className="border-b border-gray-100"><td className="py-4 font-semibold">#{String(order.number).slice(0, 8)}</td><td>{order.restaurant_detail?.name}</td><td>{order.customer_detail?.first_name || order.customer_detail?.email}</td><td className="capitalize">{label(order.status)}</td><td>{date(order.updated_at)}</td></tr>)}</tbody></table></div>;
}

export function DeliveryDashboard() {
  const { records, loading, error } = useCollection("/orders/");
  const active = records.filter((item) => item.status === "out_for_delivery");
  const delivered = records.filter((item) => item.status === "delivered");
  return <RoleFrame type="delivery" title="Delivery dashboard" subtitle="Your assigned and completed deliveries."><Metrics entries={[["Assigned", records.length], ["Active", active.length], ["Delivered", delivered.length], ["Completion rate", records.length ? `${Math.round((delivered.length / records.length) * 100)}%` : "—"]]} /><Notice loading={loading} error={error} empty={!loading && !records.length} />{!!records.length && <div className="mt-6"><DeliveryOrderTable records={records.slice(0, 8)} /></div>}</RoleFrame>;
}

export function DeliveryEarnings() {
  const { records, loading, error } = useCollection("/orders/?status=delivered");
  return <RoleFrame type="delivery" title="Delivery activity" subtitle="Completed-delivery history. Payout amounts are hidden until a payout model and provider are configured."><Metrics entries={[["Completed deliveries", records.length], ["Today", records.filter((item) => new Date(item.updated_at).toDateString() === new Date().toDateString()).length], ["Payout total", "Not configured"], ["Settlement status", "Unavailable"]]} /><Notice loading={loading} error={error} empty={!loading && !records.length} />{!!records.length && <div className="mt-6"><DeliveryOrderTable records={records} /></div>}</RoleFrame>;
}

export function DeliveryProfile() {
  const { token, updateProfile } = useAuth();
  const { records, loading: ordersLoading, error: ordersError } = useCollection("/orders/?status=delivered");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { apiRequest("/auth/me/", { token }).then(setProfile).catch((requestError) => setError(requestError.message)); }, [token]);
  const toggleAvailability = async () => { setSaving(true); try { const updated = await updateProfile({ is_available: !profile.is_available }); setProfile(updated); toast.success("Availability updated."); } catch (requestError) { toast.error(requestError.message); } finally { setSaving(false); } };
  const name = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || profile?.email;
  return <RoleFrame type="delivery" title="My profile" subtitle="Your real delivery account details and availability."><Notice loading={!profile && !error} error={error || ordersError} /><>{profile && <><section className="rounded-3xl border border-orange-100 bg-white p-7"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><h2 className="text-2xl font-bold">{name}</h2><p className="mt-2 text-gray-500">{profile.email} · {profile.phone || "No phone added"}</p><p className="mt-2 text-sm text-gray-500">Email {profile.email_verified ? "verified" : "not verified"}</p></div><div className="flex flex-wrap gap-3"><button disabled={saving} onClick={toggleAvailability} className={`rounded-xl px-5 py-3 font-semibold ${profile.is_available ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"}`}>{saving ? "Saving…" : profile.is_available ? "Available" : "Unavailable"}</button><Link to="/settings" className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white">Edit profile</Link></div></div></section><div className="mt-6"><Metrics entries={[["Completed deliveries", records.length], ["Account status", profile.is_active ? "Active" : "Inactive"], ["Availability", profile.is_available ? "Online" : "Offline"], ["Joined", new Date(profile.created_at).toLocaleDateString()]]} /></div></>}</><Notice loading={ordersLoading} error="" /></RoleFrame>;
}
