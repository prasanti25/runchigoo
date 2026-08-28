import { useCallback, useEffect, useState } from "react";
import { Home, MapPin, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";

const emptyAddress = { label: "Home", line1: "", line2: "", city: "", state: "", postal_code: "" };

export default function Addresses() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyAddress);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAddresses = useCallback(async () => {
    try {
      const data = await apiRequest("/addresses/", { token });
      setAddresses(data.results || data);
    } catch (error) { toast.error(error.message); }
  }, [token]);
  useEffect(() => { const timer = window.setTimeout(() => { void loadAddresses(); }, 0); return () => window.clearTimeout(timer); }, [loadAddresses]);

  const createAddress = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiRequest("/addresses/", { token, method: "POST", body: { ...form, is_default: addresses.length === 0 } });
      toast.success("Address saved."); setForm(emptyAddress); setShowForm(false); await loadAddresses();
    } catch (error) { toast.error(error.message); } finally { setSaving(false); }
  };
  const removeAddress = async (id) => {
    try { await apiRequest(`/addresses/${id}/`, { token, method: "DELETE" }); setAddresses((items) => items.filter((item) => item.id !== id)); toast.success("Address removed."); }
    catch (error) { toast.error(error.message); }
  };

  return <><Navbar /><main className="min-h-screen bg-[#fffaf7]"><section className="mx-auto max-w-4xl px-6 py-10">
    <div className="mb-8 flex items-center justify-between gap-4"><div><p className="font-semibold text-orange-500">Delivery</p><h1 className="mt-2 text-4xl font-bold text-gray-900">Saved Addresses</h1><p className="mt-3 text-gray-500">Manage delivery locations for checkout.</p></div><button onClick={() => setShowForm((open) => !open)} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white"><Plus size={18} />Add address</button></div>
    {showForm && <form onSubmit={createAddress} className="mb-6 grid gap-3 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm md:grid-cols-2">{Object.entries(form).map(([key, value]) => <label key={key} className="text-sm font-medium text-gray-700">{key.replace("_", " ")}<input required={key !== "line2"} value={value} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 capitalize" /></label>)}<button disabled={saving} className="rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white md:col-span-2">{saving ? "Saving..." : "Save address"}</button></form>}
    <div className="space-y-4">{addresses.length ? addresses.map((address) => <div key={address.id} className="flex items-start justify-between gap-4 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"><div className="flex gap-4"><div className="rounded-2xl bg-orange-50 p-3 text-orange-500"><Home /></div><div><h2 className="font-bold text-gray-900">{address.label}{address.is_default && <span className="ml-2 text-xs text-green-600">Default</span>}</h2><p className="mt-2 text-gray-600">{[address.line1, address.line2, address.city, address.state, address.postal_code].filter(Boolean).join(", ")}</p></div></div><button onClick={() => removeAddress(address.id)} aria-label="Delete address" className="rounded-xl p-2 text-red-500 hover:bg-red-50"><Trash2 size={20} /></button></div>) : <div className="rounded-3xl border border-dashed border-orange-200 bg-white py-16 text-center"><MapPin className="mx-auto text-orange-300" size={48} /><p className="mt-4 font-semibold text-gray-700">No saved addresses yet.</p></div>}</div>
  </section></main></>;
}
