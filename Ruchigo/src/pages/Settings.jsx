import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, LogOut, Save, User } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const inputClass = "mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500";

export default function Settings() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profile);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (passwords.newPassword.length < 8) {
      toast.error("The new password must contain at least 8 characters.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(passwords);
    } catch (error) {
      toast.error(error.message);
      setSavingPassword(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fffaf7]">
        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-10">
            <p className="font-semibold text-orange-500">Account</p>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">Settings</h1>
            <p className="mt-3 text-gray-500">Keep your profile and sign-in details up to date.</p>
          </div>

          <form onSubmit={saveProfile} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <User className="text-orange-500" />
              <h2 className="text-2xl font-bold">Profile</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">First name<input className={inputClass} value={profile.first_name} onChange={(event) => setProfile((current) => ({ ...current, first_name: event.target.value }))} /></label>
              <label className="text-sm font-medium text-gray-700">Last name<input className={inputClass} value={profile.last_name} onChange={(event) => setProfile((current) => ({ ...current, last_name: event.target.value }))} /></label>
              <label className="text-sm font-medium text-gray-700">Email<input className={inputClass} type="email" required value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} /></label>
              <label className="text-sm font-medium text-gray-700">Phone<input className={inputClass} type="tel" value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} /></label>
            </div>
            <button disabled={savingProfile} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white disabled:opacity-60"><Save size={18} />{savingProfile ? "Saving…" : "Save profile"}</button>
          </form>

          <form onSubmit={savePassword} className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Lock className="text-orange-500" />
              <h2 className="text-2xl font-bold">Change password</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <label className="text-sm font-medium text-gray-700">Current password<input className={inputClass} type="password" required autoComplete="current-password" value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} /></label>
              <label className="text-sm font-medium text-gray-700">New password<input className={inputClass} type="password" required minLength="8" autoComplete="new-password" value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} /></label>
              <label className="text-sm font-medium text-gray-700">Confirm password<input className={inputClass} type="password" required minLength="8" autoComplete="new-password" value={passwords.confirmPassword} onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))} /></label>
            </div>
            <button disabled={savingPassword} className="mt-6 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white disabled:opacity-60">{savingPassword ? "Updating…" : "Update password"}</button>
          </form>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Privacy & legal</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/privacy" className="rounded-xl border border-orange-200 px-5 py-3 font-semibold text-orange-600">Privacy Policy</Link>
              <Link to="/terms" className="rounded-xl border border-orange-200 px-5 py-3 font-semibold text-orange-600">Terms & Conditions</Link>
            </div>
          </div>

          <button onClick={() => logout()} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-4 font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"><LogOut size={19} />Logout</button>
        </section>
      </main>
    </>
  );
}
