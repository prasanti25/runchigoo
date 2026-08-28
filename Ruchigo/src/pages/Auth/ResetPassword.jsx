import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import PasswordInput from "../../components/auth/PasswordInput.jsx";
import AuthButton from "../../components/auth/AuthButton.jsx";
import { apiRequest } from "../../lib/api.js";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (!state?.email || !state?.code) { toast.error("Request and verify a reset code first."); navigate("/forgot-password"); return; }
    if (password.length < 8) { toast.error("Use at least 8 characters for your password."); return; }
    if (password !== confirmPassword) { toast.error("Passwords do not match."); return; }
    setLoading(true);
    try { await apiRequest("/auth/reset_password/", { method: "POST", body: { email: state.email, code: state.code, password } }); toast.success("Password reset. Please sign in."); navigate("/login", { replace: true }); }
    catch (error) { toast.error(error.message); }
    finally { setLoading(false); }
  };
  return <AuthLayout title="Create a new password" subtitle="Choose a strong password you do not use elsewhere."><form onSubmit={submit} className="space-y-5"><PasswordInput label="New password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} required /><PasswordInput label="Confirm new password" name="confirmPassword" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /><AuthButton type="submit" loading={loading}>Reset password</AuthButton></form><p className="mt-6 text-center text-sm text-gray-600"><Link className="font-semibold text-orange-500" to="/login">Back to login</Link></p></AuthLayout>;
}
