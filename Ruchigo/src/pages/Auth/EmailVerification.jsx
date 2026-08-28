import { useState } from "react";
import { Mail, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import AuthInput from "../../components/auth/AuthInput.jsx";
import AuthButton from "../../components/auth/AuthButton.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";

export default function EmailVerification() {
  const { token, user } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const requestCode = async () => { setLoading(true); try { await apiRequest("/auth/request_email_verification/", { token, method: "POST" }); toast.success("Verification code sent."); } catch (error) { toast.error(error.message); } finally { setLoading(false); } };
  const verify = async (event) => { event.preventDefault(); if (!/^\d{6}$/.test(code)) { toast.error("Enter the 6-digit code."); return; } setLoading(true); try { await apiRequest("/auth/verify_email/", { token, method: "POST", body: { code } }); toast.success("Email verified successfully."); } catch (error) { toast.error(error.message); } finally { setLoading(false); } };
  return <AuthLayout title="Verify your email" subtitle={`Verify ${user?.email || "your email"} to secure your account.`}><button onClick={requestCode} disabled={loading} className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 py-3 font-semibold text-orange-500 hover:bg-orange-50"><Mail size={18} />Send verification code</button><form onSubmit={verify} className="space-y-5"><AuthInput label="Verification code" name="code" inputMode="numeric" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} icon={KeyRound} placeholder="123456" required /><AuthButton type="submit" loading={loading}>Verify email</AuthButton></form></AuthLayout>;
}
