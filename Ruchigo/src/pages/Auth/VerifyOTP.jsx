import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import AuthInput from "../../components/auth/AuthInput.jsx";
import AuthButton from "../../components/auth/AuthButton.jsx";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!email) { toast.error("Start by requesting a password reset."); navigate("/forgot-password"); return; }
    if (!/^\d{6}$/.test(code)) { toast.error("Enter the 6-digit code from your email."); return; }
    setLoading(true);
    // Reset endpoint validates this code atomically when the new password is submitted.
    navigate("/reset-password", { state: { email, code } });
    setLoading(false);
  };

  return <AuthLayout title="Verify reset code" subtitle={`Enter the 6-digit code sent to ${email || "your email"}.`}><form onSubmit={submit} className="space-y-5"><AuthInput label="Verification code" name="code" inputMode="numeric" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} icon={KeyRound} placeholder="123456" required /><AuthButton type="submit" loading={loading}>Continue</AuthButton></form><p className="mt-6 text-center text-sm text-gray-600">Didn’t receive a code? <Link className="font-semibold text-orange-500" to="/forgot-password">Request a new one</Link></p></AuthLayout>;
}
