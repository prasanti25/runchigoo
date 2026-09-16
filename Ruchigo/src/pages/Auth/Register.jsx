import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User, Phone } from "lucide-react";
import { motion } from "framer-motion";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthTabs from "../../components/auth/AuthTabs";
import RoleSelector from "../../components/auth/RoleSelector";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthFooter from "../../components/auth/AuthFooter";
import { useAuth } from "../../context/AuthContext.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("register");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    agree: false,
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
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (formData.phone.length < 10) {
      newErrors.phone = "Enter a valid phone number.";
    }

    if (formData.password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.agree) {
      newErrors.agree = "Please accept Terms & Conditions.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    await register({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
    });
  };

  return (
    <AuthLayout
      title="Create your RuchiGo Account"
      subtitle="Fresh food delivered to your doorstep."
    >
      <AuthTabs
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);

          if (tab === "login") {
            navigate("/login");
          }
        }}
      />

      <form onSubmit={handleRegister} className="space-y-5">
        <RoleSelector selectedRole={formData.role} onSelectRole={handleRole} />

        <p className="text-xs text-gray-500">
          Restaurant and delivery accounts require admin approval after registration.
        </p>

        <AuthInput
          label="Full Name"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
          icon={User}
          error={errors.fullName}
          required
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
          required
        />

        <AuthInput
          label="Mobile Number"
          name="phone"
          type="tel"
          placeholder="Enter your mobile number"
          value={formData.phone}
          onChange={handleChange}
          icon={Phone}
          error={errors.phone}
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          error={errors.password}
          required
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          error={errors.confirmPassword}
          required
        />

        <div className="mb-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              className="mt-1 accent-orange-500"
            />

            <span className="text-sm leading-6 text-gray-600">
              I agree to the{" "}
              <Link
                to="/terms"
                className="font-medium text-orange-500 hover:text-red-500"
              >
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="font-medium text-orange-500 hover:text-red-500"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {errors.agree && (
            <p className="mt-2 text-sm text-red-500">
              {errors.agree}
            </p>
          )}
        </div>

        <AuthButton type="submit" loading={loading}>
          Create Account
        </AuthButton>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-orange-500 hover:text-red-500 transition"
          >
            Login Here
          </Link>
        </p>
      </div>

      {/* Security Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-4"
      >
        <h3 className="text-sm font-semibold text-orange-600">
          🔐 Your Account is Safe
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          We use encrypted authentication, secure password storage,
          and protected communication to keep your personal data safe.
          Your information is never shared without your permission.
        </p>
      </motion.div>

      <AuthFooter />
    </AuthLayout>
  );
};

export default Register;
