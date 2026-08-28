import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthFooter from "../../components/auth/AuthFooter";
import { apiRequest } from "../../lib/api.js";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    apiRequest("/auth/forgot_password/", { method: "POST", body: { email: email.trim().toLowerCase() } })
      .then(() => {
        toast.success("If that account exists, a reset code has been sent.");
        navigate("/verify-otp", {
          state: { email: email.trim().toLowerCase(), purpose: "reset-password" },
        });
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  };

  return (
    <AuthLayout title="Forgot your password?" subtitle="We'll help you get back to ordering delicious food.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          icon={Mail}
          error={error}
          required
        />

        <AuthButton type="submit" loading={loading}>
          Send OTP
        </AuthButton>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="font-semibold text-orange-500 transition hover:text-red-500">
          ← Back to Login
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-4">
        <h3 className="font-semibold text-orange-600">💡 Tip</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">We'll send a One-Time Password (OTP) to your registered email. Use it to securely reset your password.</p>
      </div>

      <AuthFooter />
    </AuthLayout>
  );
};

export default ForgotPassword;
