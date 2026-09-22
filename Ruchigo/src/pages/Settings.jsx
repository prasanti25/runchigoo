import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, LogOut, Save, User } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import ProfilePhoto from "../components/common/ProfilePhoto.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const inputClass =
  "mt-2 w-full rounded-xl border border-[#dfe4d8] bg-white px-4 py-3 outline-none transition focus:border-[#8ca676] focus:ring-2 focus:ring-[#ecf1e6]";

export default function Settings() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
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
      <main className="customer-main settings-page">
        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="page-heading">
            <p className="eyebrow">YOUR ACCOUNT, YOUR WAY</p>
            <h1 className="mt-3">The little details that matter.</h1>
            <p className="muted mt-3">
              Keep your profile and sign-in details up to date.
            </p>
          </div>

          <section className="panel settings-photo">
            <ProfilePhoto />
            <div>
              <h2>Profile photo</h2>
              <p className="muted">Update the photo on your RuchiGo account.</p>
            </div>
          </section>
          <form onSubmit={saveProfile} className="panel">
            <div className="mb-6 flex items-center gap-3">
              <User className="text-orange-500" />
              <h2 className="text-2xl font-bold">Profile</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                First name
                <input
                  className={inputClass}
                  value={profile.first_name}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      first_name: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Last name
                <input
                  className={inputClass}
                  value={profile.last_name}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      last_name: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Email
                <input
                  className={inputClass}
                  type="email"
                  required
                  value={profile.email}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Phone
                <input
                  className={inputClass}
                  type="tel"
                  value={profile.phone}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <button disabled={savingProfile} className="btn primary mt-6">
              <Save size={18} />
              {savingProfile ? "Saving…" : "Save profile"}
            </button>
          </form>

          <form onSubmit={savePassword} className="panel">
            <div className="mb-6 flex items-center gap-3">
              <Lock className="text-orange-500" />
              <h2 className="text-2xl font-bold">Change password</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <label className="text-sm font-medium text-gray-700">
                Current password
                <input
                  className={inputClass}
                  type="password"
                  required
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={(event) =>
                    setPasswords((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                New password
                <input
                  className={inputClass}
                  type="password"
                  required
                  minLength="8"
                  autoComplete="new-password"
                  value={passwords.newPassword}
                  onChange={(event) =>
                    setPasswords((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Confirm password
                <input
                  className={inputClass}
                  type="password"
                  required
                  minLength="8"
                  autoComplete="new-password"
                  value={passwords.confirmPassword}
                  onChange={(event) =>
                    setPasswords((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <button disabled={savingPassword} className="btn dark mt-6">
              {savingPassword ? "Updating…" : "Update password"}
            </button>
          </form>

          <div className="panel">
            <h2 className="text-2xl font-bold">Privacy & legal</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/privacy" className="btn secondary">
                Privacy Policy
              </Link>
              <Link to="/terms" className="btn secondary">
                Terms & Conditions
              </Link>
              <Link to="/support?category=privacy" className="btn secondary">
                Privacy request
              </Link>
            </div>
          </div>

          <button onClick={() => logout()} className="btn danger">
            <LogOut size={19} />
            Sign out
          </button>
        </section>
      </main>
    </>
  );
}
