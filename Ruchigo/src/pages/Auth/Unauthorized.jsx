import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/common/Logo";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  LockKeyhole,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Users,
  Store,
  UserCog,
  Home,
  Truck,
} from "lucide-react";

const statistics = [
  {
    title: "Protected Resources",
    value: "12K+",
    icon: ShieldCheck,
    color: "text-cyan-400",
  },
  {
    title: "Unauthorized Blocks",
    value: "850K+",
    icon: ShieldAlert,
    color: "text-red-400",
  },
  {
    title: "Restaurants",
    value: "5,200+",
    icon: Store,
    color: "text-green-400",
  },
  {
    title: "System Uptime",
    value: "99.99%",
    icon: UserCog,
    color: "text-purple-400",
  },
];

const securityBenefits = [
  "Role-Based Access Control (RBAC)",
  "Enterprise permission management",
  "AI-powered authorization monitoring",
  "Secure API authorization",
  "Real-time access validation",
  "Protection against unauthorized requests",
];

const permissionRules = [
  "Customer → Customer Dashboard",
  "Restaurant → Restaurant Dashboard",
  "Delivery Partner → Delivery Portal",
  "Admin → Admin Panel",
  "Super Admin → Full System Access",
  "Permissions verified on every request",
];

const Unauthorized = () => {

  const [loading] = useState(false);

  return (

    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">

      <div className="grid lg:grid-cols-2 min-h-screen">

        {/* ================= LEFT PANEL ================= */}

        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
        >

          {/* Background */}

          <div className="absolute -top-44 -left-44 w-[420px] h-[420px] bg-red-500/20 rounded-full blur-3xl" />

          <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-cyan-500/20 rounded-full blur-3xl" />

          {/* Logo */}

          <div className="relative z-10">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-xl">

                <Logo type="icon" size="md" />

              </div>

              <div>

                <h1 className="text-4xl font-bold">

                  RuchiGo

                </h1>

                <p className="text-slate-400">

                  Enterprise Authorization

                </p>

              </div>

            </div>

          </div>

          {/* Hero */}

          <div className="relative z-10 my-10">

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl font-extrabold leading-tight"
            >

              Unauthorized

              <span className="block bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">

                Access Detected

              </span>

            </motion.h1>

            <p className="mt-8 text-lg text-slate-400 leading-8 max-w-xl">

              Your account is authenticated, but you don't have the
              required permissions to access this resource. RuchiGo's
              enterprise authorization system protects sensitive
              dashboards and APIs using secure role-based access control.

            </p>

            {/* Benefits */}

            <div className="mt-10 space-y-4">

              {securityBenefits.map((item, index) => (

                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >

                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">

                    <CheckCircle2
                      size={20}
                      className="text-red-400"
                    />

                  </div>

                  <span>

                    {item}

                  </span>

                </motion.div>

              ))}

            </div>

          </div>

          {/* Statistics */}

          <div className="relative z-10">

            <div className="grid grid-cols-2 gap-5">

              {statistics.map((item, index) => {

                const Icon = item.icon;

                return (

                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-6"
                  >

                    <div className="flex justify-between items-center">

                      <div>

                        <p className="text-slate-400">

                          {item.title}

                        </p>

                        <h2 className="text-3xl font-bold mt-3">

                          {item.value}

                        </h2>

                      </div>

                      <Icon
                        size={34}
                        className={item.color}
                      />

                    </div>

                  </motion.div>

                );

              })}

            </div>

          </div>

        </motion.div>

        {/* ================= RIGHT PANEL ================= */}

        <div className="flex justify-center items-center p-6 lg:p-12">

          {/* Unauthorized Access Card Starts in Part 1B */}
                    <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl"
          >

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">

              {/* Header */}

              <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 p-8 text-center">

                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-5 border border-white/20">

                  <ShieldAlert
                    size={48}
                    className="text-white"
                  />

                </div>

                <h2 className="text-4xl font-bold">

                  Unauthorized Access

                </h2>

                <p className="text-red-100 mt-3 text-lg">

                  You don't have permission to access this page.

                </p>

              </div>

              {/* Body */}

              <div className="p-8">

                {/* Alert */}

                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex gap-4">

                  <AlertTriangle
                    className="text-red-400 flex-shrink-0 mt-1"
                    size={28}
                  />

                  <div>

                    <h3 className="text-xl font-semibold">

                      Permission Required

                    </h3>

                    <p className="text-slate-400 mt-2 leading-7">

                      Your identity has been verified successfully, however
                      your current role does not include permission to
                      access this resource. Please switch to an authorized
                      account or return to your dashboard.

                    </p>

                  </div>

                </div>

                {/* Role Information */}

                <div className="grid md:grid-cols-2 gap-5 mt-8">

                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                    <div className="flex items-center gap-3 mb-4">

                      <Users
                        size={26}
                        className="text-cyan-400"
                      />

                      <h3 className="text-lg font-semibold">

                        Current Role

                      </h3>

                    </div>

                    <span className="inline-flex px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 font-medium">

                      Customer

                    </span>

                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                    <div className="flex items-center gap-3 mb-4">

                      <ShieldCheck
                        size={26}
                        className="text-green-400"
                      />

                      <h3 className="text-lg font-semibold">

                        Required Role

                      </h3>

                    </div>

                    <span className="inline-flex px-4 py-2 rounded-full bg-green-500/20 text-green-300 font-medium">

                      Administrator

                    </span>

                  </div>

                </div>

                {/* Permission Rules */}

                <div className="mt-8">

                  <h3 className="text-xl font-semibold mb-5">

                    Role Permissions

                  </h3>

                  <div className="space-y-3">

                    {permissionRules.map((rule, index) => (

                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-5 py-4"
                      >

                        <CheckCircle2
                          size={18}
                          className="text-green-400"
                        />

                        <span className="text-slate-300">

                          {rule}

                        </span>

                      </motion.div>

                    ))}

                  </div>

                </div>

                {/* Buttons */}

                <div className="grid sm:grid-cols-2 gap-4 mt-8">

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 font-semibold shadow-lg hover:shadow-red-500/30 transition-all"
                  >

                    {loading ? "Redirecting..." : "Go to Dashboard"}

                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="py-4 rounded-2xl border border-slate-600 bg-slate-800 hover:bg-slate-700 transition-all font-semibold"
                  >

                    Switch Account

                  </motion.button>

                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 w-full py-4 rounded-2xl border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-all font-semibold"
                >

                  Contact Administrator

                </motion.button>

                {/* Security Notice */}

                <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">

                  <div className="flex items-start gap-3">

                    <LockKeyhole
                      size={24}
                      className="text-amber-400 mt-1"
                    />

                    <div>

                      <h4 className="font-semibold text-amber-300">

                        Security Notice

                      </h4>

                      <p className="text-slate-400 mt-2 leading-7">

                        This authorization check protects sensitive
                        resources from unauthorized access. If you believe
                        this restriction is incorrect, please contact your
                        administrator for additional permissions.

                      </p>

                    </div>

                  </div>

                </div>

                {/* Back Home */}

                <div className="mt-8 text-center">

                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >

                    <Home size={18} />

                    Back to Home

                  </Link>

                </div>

              </div>

            </div>

          </motion.div>
                    <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl"
          >

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">

              {/* Header */}

              <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 p-8 text-center">

                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-5 border border-white/20">

                  <ShieldAlert
                    size={48}
                    className="text-white"
                  />

                </div>

                <h2 className="text-4xl font-bold">

                  Unauthorized Access

                </h2>

                <p className="text-red-100 mt-3 text-lg">

                  You don't have permission to access this page.

                </p>

              </div>

              {/* Body */}

              <div className="p-8">

                {/* Alert */}

                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex gap-4">

                  <AlertTriangle
                    className="text-red-400 flex-shrink-0 mt-1"
                    size={28}
                  />

                  <div>

                    <h3 className="text-xl font-semibold">

                      Permission Required

                    </h3>

                    <p className="text-slate-400 mt-2 leading-7">

                      Your identity has been verified successfully, however
                      your current role does not include permission to
                      access this resource. Please switch to an authorized
                      account or return to your dashboard.

                    </p>

                  </div>

                </div>

                {/* Role Information */}

                <div className="grid md:grid-cols-2 gap-5 mt-8">

                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                    <div className="flex items-center gap-3 mb-4">

                      <Users
                        size={26}
                        className="text-cyan-400"
                      />

                      <h3 className="text-lg font-semibold">

                        Current Role

                      </h3>

                    </div>

                    <span className="inline-flex px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 font-medium">

                      Customer

                    </span>

                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                    <div className="flex items-center gap-3 mb-4">

                      <ShieldCheck
                        size={26}
                        className="text-green-400"
                      />

                      <h3 className="text-lg font-semibold">

                        Required Role

                      </h3>

                    </div>

                    <span className="inline-flex px-4 py-2 rounded-full bg-green-500/20 text-green-300 font-medium">

                      Administrator

                    </span>

                  </div>

                </div>

                {/* Permission Rules */}

                <div className="mt-8">

                  <h3 className="text-xl font-semibold mb-5">

                    Role Permissions

                  </h3>

                  <div className="space-y-3">

                    {permissionRules.map((rule, index) => (

                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-5 py-4"
                      >

                        <CheckCircle2
                          size={18}
                          className="text-green-400"
                        />

                        <span className="text-slate-300">

                          {rule}

                        </span>

                      </motion.div>

                    ))}

                  </div>

                </div>

                {/* Buttons */}

                <div className="grid sm:grid-cols-2 gap-4 mt-8">

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 font-semibold shadow-lg hover:shadow-red-500/30 transition-all"
                  >

                    {loading ? "Redirecting..." : "Go to Dashboard"}

                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="py-4 rounded-2xl border border-slate-600 bg-slate-800 hover:bg-slate-700 transition-all font-semibold"
                  >

                    Switch Account

                  </motion.button>

                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 w-full py-4 rounded-2xl border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-all font-semibold"
                >

                  Contact Administrator

                </motion.button>

                {/* Security Notice */}

                <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">

                  <div className="flex items-start gap-3">

                    <LockKeyhole
                      size={24}
                      className="text-amber-400 mt-1"
                    />

                    <div>

                      <h4 className="font-semibold text-amber-300">

                        Security Notice

                      </h4>

                      <p className="text-slate-400 mt-2 leading-7">

                        This authorization check protects sensitive
                        resources from unauthorized access. If you believe
                        this restriction is incorrect, please contact your
                        administrator for additional permissions.

                      </p>

                    </div>

                  </div>

                </div>

                {/* Back Home */}

                <div className="mt-8 text-center">

                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >

                    <Home size={18} />

                    Back to Home

                  </Link>

                </div>

              </div>

            </div>

          </motion.div>
                        {/* Authorization Workflow */}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <ShieldCheck
                      size={30}
                      className="text-cyan-400"
                    />

                    <h3 className="text-2xl font-bold">

                      Authorization Workflow

                    </h3>

                  </div>

                  <div className="grid md:grid-cols-5 gap-4">

                    {[
                      "User Login",
                      "Identity Verified",
                      "Role Validation",
                      "Permission Check",
                      "Access Granted / Denied",
                    ].map((step, index) => (

                      <motion.div
                        key={index}
                        whileHover={{ y: -5 }}
                        className="relative bg-slate-900 border border-slate-700 rounded-2xl p-5 text-center"
                      >

                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-4 font-bold">

                          {index + 1}

                        </div>

                        <p className="text-sm text-slate-300">

                          {step}

                        </p>

                      </motion.div>

                    ))}

                  </div>

                </div>

              </motion.div>

              {/* Enterprise RBAC */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-8"
              >

                <div className="bg-gradient-to-r from-cyan-500/10 via-slate-900 to-red-500/10 border border-cyan-500/20 rounded-2xl p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <LockKeyhole
                      size={30}
                      className="text-cyan-400"
                    />

                    <h3 className="text-2xl font-bold">

                      Enterprise Role-Based Access Control

                    </h3>

                  </div>

                  <div className="grid md:grid-cols-2 gap-5">

                    {[
                      {
                        title: "Customer",
                        desc: "Browse restaurants, place orders, manage profile and payments.",
                        icon: Users,
                        color: "text-cyan-400",
                      },
                      {
                        title: "Restaurant",
                        desc: "Manage menus, orders, earnings, inventory and business settings.",
                        icon: Store,
                        color: "text-green-400",
                      },
                      {
                        title: "Delivery Partner",
                        desc: "Accept deliveries, navigate routes and track earnings securely.",
                        icon: Truck,
                        color: "text-orange-400",
                      },
                      {
                        title: "Administrator",
                        desc: "Manage users, restaurants, reports, analytics and platform settings.",
                        icon: UserCog,
                        color: "text-purple-400",
                      },
                    ].map((role, index) => {

                      const Icon = role.icon;

                      return (

                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          className="bg-slate-900 border border-slate-700 rounded-2xl p-5"
                        >

                          <Icon
                            size={34}
                            className={`${role.color} mb-4`}
                          />

                          <h4 className="text-lg font-semibold">

                            {role.title}

                          </h4>

                          <p className="text-slate-400 mt-3 leading-7">

                            {role.desc}

                          </p>

                        </motion.div>

                      );

                    })}

                  </div>

                </div>

              </motion.div>

              {/* AI Permission Monitoring */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <Sparkles
                      size={28}
                      className="text-purple-400"
                    />

                    <h3 className="text-2xl font-bold">

                      AI Permission Monitoring

                    </h3>

                  </div>

                  <div className="grid md:grid-cols-2 gap-4">

                    {[
                      "Continuously validates user permissions.",
                      "Detects unusual authorization attempts.",
                      "Prevents privilege escalation attacks.",
                      "Monitors protected APIs in real time.",
                      "Logs all authorization decisions securely.",
                      "Provides intelligent security alerts.",
                    ].map((item, index) => (

                      <div
                        key={index}
                        className="flex items-center gap-3"
                      >

                        <CheckCircle2
                          size={18}
                          className="text-green-400"
                        />

                        <span className="text-slate-300">

                          {item}

                        </span>

                      </div>

                    ))}

                  </div>

                </div>

              </motion.div>

              {/* Authorization Security Policy */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="mt-8"
              >

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">

                  <div className="flex items-start gap-4">

                    <ShieldAlert
                      size={30}
                      className="text-amber-400 mt-1"
                    />

                    <div>

                      <h3 className="text-2xl font-bold text-amber-300">

                        Authorization Security Policy

                      </h3>

                      <p className="text-slate-300 mt-4 leading-8">

                        Every request is validated using enterprise-grade
                        Role-Based Access Control (RBAC). Even after a user
                        is authenticated, access to protected dashboards,
                        APIs and administrative resources is granted only
                        when the required permissions are present. This
                        additional authorization layer helps protect
                        sensitive business data and platform operations.

                      </p>

                    </div>

                  </div>

                </div>

              </motion.div>
                            {/* Enterprise Authorization Dashboard */}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <div className="flex justify-between items-center mb-6">

                    <div>

                      <h3 className="text-2xl font-bold">

                        Enterprise Authorization Dashboard

                      </h3>

                      <p className="text-slate-400 mt-2">

                        Real-time authorization status and permission
                        verification across the platform.

                      </p>

                    </div>

                    <ShieldCheck
                      size={34}
                      className="text-cyan-400"
                    />

                  </div>

                  <div className="grid md:grid-cols-3 gap-5">

                    {[
                      {
                        title: "Authentication",
                        value: "Verified",
                        icon: ShieldCheck,
                        color: "text-green-400",
                      },
                      {
                        title: "Authorization",
                        value: "Denied",
                        icon: ShieldAlert,
                        color: "text-red-400",
                      },
                      {
                        title: "Role Status",
                        value: "Customer",
                        icon: Users,
                        color: "text-cyan-400",
                      },
                    ].map((item, index) => {

                      const Icon = item.icon;

                      return (

                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.04 }}
                          className="bg-slate-900 border border-slate-700 rounded-2xl p-5"
                        >

                          <Icon
                            size={32}
                            className={`${item.color} mb-4`}
                          />

                          <h4 className="font-semibold">

                            {item.title}

                          </h4>

                          <h2 className="text-2xl font-bold mt-2">

                            {item.value}

                          </h2>

                        </motion.div>

                      );

                    })}

                  </div>

                </div>

              </motion.div>

              {/* AI Authorization Analytics */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
                className="mt-8"
              >

                <div className="bg-gradient-to-r from-purple-500/10 via-slate-900 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <Sparkles
                      size={28}
                      className="text-purple-400"
                    />

                    <h3 className="text-2xl font-bold">

                      AI Authorization Analytics

                    </h3>

                  </div>

                  <div className="grid md:grid-cols-2 gap-5">

                    {[
                      "Analyzes every authorization request in real time.",
                      "Detects abnormal access behavior automatically.",
                      "Monitors protected dashboards and APIs.",
                      "Prevents privilege escalation attempts.",
                      "Maintains detailed security audit logs.",
                      "Generates intelligent permission insights.",
                    ].map((item, index) => (

                      <div
                        key={index}
                        className="flex items-center gap-3"
                      >

                        <CheckCircle2
                          size={18}
                          className="text-green-400"
                        />

                        <span className="text-slate-300">

                          {item}

                        </span>

                      </div>

                    ))}

                  </div>

                </div>

              </motion.div>

              {/* Developer Ready */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.05 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <h3 className="text-2xl font-bold mb-6">

                    Developer Ready

                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">

                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">

                      <h4 className="font-semibold mb-4">

                        React Hook Form

                      </h4>

                      <ul className="space-y-2 text-slate-400">

                        <li>• register()</li>
                        <li>• handleSubmit()</li>
                        <li>• formState.errors</li>
                        <li>• watch()</li>
                        <li>• reset()</li>

                      </ul>

                    </div>

                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">

                      <h4 className="font-semibold mb-4">

                        Zod Validation

                      </h4>

                      <ul className="space-y-2 text-slate-400">

                        <li>• Role Validation</li>
                        <li>• Permission Validation</li>
                        <li>• API Authorization</li>
                        <li>• Token Verification</li>
                        <li>• Error Handling</li>

                      </ul>

                    </div>

                  </div>

                  <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-5">

                    <p className="text-red-300 font-medium">

                      Example Authorization Response

                    </p>

                    <p className="text-slate-300 mt-3 leading-7">

                      Your identity has been verified successfully, but
                      your current role does not include permission to
                      access this resource. Please return to your
                      dashboard or contact your administrator if you
                      believe this restriction is incorrect.

                    </p>

                  </div>

                </div>

              </motion.div>

              {/* Permission Status */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.15 }}
                className="mt-8"
              >

                <div className="grid md:grid-cols-4 gap-5">

                  {[
                    {
                      title: "Identity",
                      status: "Verified",
                      color: "text-green-400",
                    },
                    {
                      title: "Role",
                      status: "Customer",
                      color: "text-cyan-400",
                    },
                    {
                      title: "Permission",
                      status: "Denied",
                      color: "text-red-400",
                    },
                    {
                      title: "Security",
                      status: "Protected",
                      color: "text-purple-400",
                    },
                  ].map((item, index) => (

                    <motion.div
                      key={index}
                      whileHover={{ y: -5 }}
                      className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
                    >

                      <h4 className="font-semibold">

                        {item.title}

                      </h4>

                      <h2
                        className={`text-2xl font-bold mt-3 ${item.color}`}
                      >

                        {item.status}

                      </h2>

                    </motion.div>

                  ))}

                </div>

              </motion.div>
                            {/* Enterprise Footer */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.55 }}
                className="mt-8"
              >

                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6">

                  <div className="text-center">

                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6">

                      <ShieldAlert size={34} />

                    </div>

                    <h2 className="text-3xl font-bold">

                      Enterprise Authorization System

                    </h2>

                    <p className="text-slate-400 mt-4 max-w-2xl mx-auto leading-8">

                      Every request inside RuchiGo passes through
                      enterprise-grade authentication and Role-Based
                      Access Control (RBAC). By verifying permissions
                      before granting access, we protect customer data,
                      restaurant operations, delivery workflows, and
                      administrative resources from unauthorized use.

                    </p>

                  </div>

                  {/* Footer Links */}

                  <div className="grid md:grid-cols-4 grid-cols-2 gap-8 mt-12">

                    {/* Company */}

                    <div>

                      <h3 className="font-semibold mb-4">

                        Company

                      </h3>

                      <div className="space-y-3">

                        <Link
                          to="/about"
                          className="block text-slate-400 hover:text-red-400 transition"
                        >

                          About Us

                        </Link>

                        <Link
                          to="/careers"
                          className="block text-slate-400 hover:text-red-400 transition"
                        >

                          Careers

                        </Link>

                        <Link
                          to="/contact"
                          className="block text-slate-400 hover:text-red-400 transition"
                        >

                          Contact

                        </Link>

                      </div>

                    </div>

                    {/* Support */}

                    <div>

                      <h3 className="font-semibold mb-4">

                        Support

                      </h3>

                      <div className="space-y-3">

                        <Link
                          to="/help"
                          className="block text-slate-400 hover:text-red-400 transition"
                        >

                          Help Center

                        </Link>

                        <Link
                          to="/faq"
                          className="block text-slate-400 hover:text-red-400 transition"
                        >

                          FAQs

                        </Link>

                        <Link
                          to="/support"
                          className="block text-slate-400 hover:text-red-400 transition"
                        >

                          Contact Support

                        </Link>

                      </div>

                    </div>

                    {/* Legal */}

                    <div>

                      <h3 className="font-semibold mb-4">

                        Legal

                      </h3>

                      <div className="space-y-3">

                        <Link
                          to="/privacy"
                          className="block text-slate-400 hover:text-red-400 transition"
                        >

                          Privacy Policy

                        </Link>

                        <Link
                          to="/terms"
                          className="block text-slate-400 hover:text-red-400 transition"
                        >

                          Terms & Conditions

                        </Link>

                        <Link
                          to="/cookies"
                          className="block text-slate-400 hover:text-red-400 transition"
                        >

                          Cookie Policy

                        </Link>

                      </div>

                    </div>

                    {/* Security */}

                    <div>

                      <h3 className="font-semibold mb-4">

                        Security

                      </h3>

                      <div className="space-y-3">

                        <div className="flex items-center gap-2 text-slate-400">

                          <ShieldCheck
                            size={18}
                            className="text-green-400"
                          />

                          Role Verification

                        </div>

                        <div className="flex items-center gap-2 text-slate-400">

                          <ShieldAlert
                            size={18}
                            className="text-red-400"
                          />

                          AI Authorization

                        </div>

                        <div className="flex items-center gap-2 text-slate-400">

                          <LockKeyhole
                            size={18}
                            className="text-orange-400"
                          />

                          Secure RBAC

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* Bottom Footer */}

                  <div className="border-t border-slate-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">

                    <p className="text-slate-400 text-sm">

                      © {new Date().getFullYear()} RuchiGo Technologies Pvt. Ltd.
                      All Rights Reserved.

                    </p>

                    <div className="flex flex-wrap justify-center gap-6 text-sm">

                      <Link
                        to="/privacy"
                        className="text-slate-400 hover:text-red-400 transition"
                      >

                        Privacy

                      </Link>

                      <Link
                        to="/terms"
                        className="text-slate-400 hover:text-red-400 transition"
                      >

                        Terms

                      </Link>

                      <Link
                        to="/cookies"
                        className="text-slate-400 hover:text-red-400 transition"
                      >

                        Cookies

                      </Link>

                      <Link
                        to="/support"
                        className="text-slate-400 hover:text-red-400 transition"
                      >

                        Support

                      </Link>

                    </div>

                  </div>

                </div>

              </motion.div>

            </div>

        </div>

      </div>

  );

};

export default Unauthorized;