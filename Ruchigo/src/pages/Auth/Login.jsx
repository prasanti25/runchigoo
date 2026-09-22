import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthTabs from "../../components/auth/AuthTabs";
import RoleSelector from "../../components/auth/RoleSelector";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthFooter from "../../components/auth/AuthFooter";

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "customer",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRole = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must contain at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    await login({
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });
  };

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Your favourites are one sign-in away."
    >
      <AuthTabs
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          if (tab === "register") navigate("/register");
        }}
      />

      <form onSubmit={handleLogin} className="space-y-5">
        <RoleSelector
          selectedRole={formData.role}
          onSelectRole={handleRole}
          allowAdmin
        />

        <AuthInput
          label="Email Address"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          icon={Mail}
          error={errors.email}
          autoComplete="email"
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          error={errors.password}
          required
        />

        <div className="mb-6 flex items-center justify-between gap-3">
          <span className="muted text-xs">Sign in with your email</span>

          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-orange-500 transition hover:text-red-500"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthButton type="submit" loading={loading}>
          Login
        </AuthButton>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-orange-500 transition hover:text-red-500"
          >
            Create Account
          </Link>
        </p>
      </div>

      <AuthFooter />
    </AuthLayout>
  );
};

export default Login;
