import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/common/Logo";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Smartphone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Users,
  Store,
  LockKeyhole,
  Fingerprint,
} from "lucide-react";

const statistics = [
  {
    title: "Protected Accounts",
    value: "250K+",
    icon: Users,
    color: "text-cyan-400",
  },
  {
    title: "Restaurants Secured",
    value: "5,200+",
    icon: Store,
    color: "text-green-400",
  },
  {
    title: "Trusted Devices",
    value: "120K+",
    icon: Smartphone,
    color: "text-orange-400",
  },
  {
    title: "2FA Success Rate",
    value: "99.98%",
    icon: ShieldCheck,
    color: "text-purple-400",
  },
];

const securityBenefits = [
  "Prevent unauthorized account access",
  "Protect sensitive personal information",
  "Secure payments and saved addresses",
  "AI-powered fraud detection",
  "Trusted device recognition",
  "Enterprise-grade multi-factor security",
];

const securityFeatures = [
  "Authenticator App Support",
  "SMS Verification",
  "Email Verification",
  "Trusted Device Recognition",
  "AI Risk Detection",
  "AES-256 Encryption",
];

const TwoFactorAuth = () => {

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

          {/* Background Effects */}

          <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

          {/* Logo */}

          <div className="relative z-10">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl">

                <Logo type="icon" size="md" />

              </div>

              <div>

                <h1 className="text-4xl font-bold">

                  RuchiGo

                </h1>

                <p className="text-slate-400">

                  Two-Factor Authentication

                </p>

              </div>

            </div>

          </div>

          {/* Hero */}

          <div className="relative z-10 my-10">

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl font-extrabold leading-tight"
            >

              Secure Your

              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

                Account Access

              </span>

            </motion.h1>

            <p className="mt-8 text-lg text-slate-400 leading-8 max-w-xl">

              Two-Factor Authentication adds an additional layer of
              protection to your RuchiGo account. Verify your identity
              using a trusted authentication method before accessing
              your dashboard.

            </p>

            {/* Benefits */}

            <div className="mt-10 space-y-4">

              {securityBenefits.map((item, index) => (

                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >

                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">

                    <CheckCircle2
                      className="text-cyan-400"
                      size={20}
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
                        className={item.color}
                        size={34}
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

          {/* Two-Factor Authentication Form Starts in Part 1B */}
                    <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl"
          >

            <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700 rounded-3xl shadow-2xl p-8 lg:p-10">

              {/* Header */}

              <div className="text-center mb-8">

                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-5">

                  <Fingerprint size={34} />

                </div>

                <h2 className="text-3xl font-bold">

                  Two-Factor Authentication

                </h2>

                <p className="text-slate-400 mt-3 leading-7">

                  Choose a verification method and enter the
                  6-digit security code to continue securely.

                </p>

              </div>

              {/* Authentication Method */}

              <div className="mb-8">

                <label className="block mb-4 font-medium">

                  Verification Method

                </label>

                <div className="grid gap-4">

                  <button
                    type="button"
                    className="flex items-center justify-between bg-slate-800 border border-cyan-500 rounded-2xl p-4 hover:bg-slate-700 transition"
                  >

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">

                        <Smartphone
                          size={24}
                          className="text-cyan-400"
                        />

                      </div>

                      <div className="text-left">

                        <h4 className="font-semibold">

                          Authenticator App

                        </h4>

                        <p className="text-sm text-slate-400">

                          Google Authenticator / Microsoft Authenticator

                        </p>

                      </div>

                    </div>

                    <CheckCircle2
                      className="text-cyan-400"
                      size={22}
                    />

                  </button>

                  <button
                    type="button"
                    className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-cyan-500 transition"
                  >

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">

                        <MessageSquare
                          size={24}
                          className="text-green-400"
                        />

                      </div>

                      <div className="text-left">

                        <h4 className="font-semibold">

                          SMS Verification

                        </h4>

                        <p className="text-sm text-slate-400">

                          Send code to +91 ••••••4567

                        </p>

                      </div>

                    </div>

                  </button>

                  <button
                    type="button"
                    className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-cyan-500 transition"
                  >

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">

                        <Mail
                          size={24}
                          className="text-orange-400"
                        />

                      </div>

                      <div className="text-left">

                        <h4 className="font-semibold">

                          Email Verification

                        </h4>

                        <p className="text-sm text-slate-400">

                          Send code to pavan@example.com

                        </p>

                      </div>

                    </div>

                  </button>

                </div>

              </div>

              {/* Verification Code */}

              <form className="space-y-8">

                <div>

                  <label className="block mb-4 font-medium">

                    Authentication Code

                  </label>

                  <div className="flex justify-between gap-3">

                    {[...Array(6)].map((_, index) => (

                      <motion.input
                        key={index}
                        whileFocus={{ scale: 1.05 }}
                        maxLength={1}
                        type="text"
                        className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 text-center text-xl font-bold outline-none focus:border-cyan-500 transition"
                      />

                    ))}

                  </div>

                </div>

                {/* Trust Device */}

                <label className="flex items-center gap-3 cursor-pointer">

                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-cyan-500"
                  />

                  <span className="text-slate-300">

                    Trust this device for 30 days

                  </span>

                </label>

                {/* Timer */}

                <div className="flex justify-between items-center bg-slate-800 border border-slate-700 rounded-2xl p-4">

                  <div>

                    <h4 className="font-semibold">

                      Code Expires In

                    </h4>

                    <p className="text-slate-400 text-sm">

                      Request a new code if it expires.

                    </p>

                  </div>

                  <span className="text-2xl font-bold text-orange-400">

                    04:59

                  </span>

                </div>

                {/* Verify Button */}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold flex justify-center items-center gap-3"
                >

                  {loading ? (

                    <>

                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                      Verifying...

                    </>

                  ) : (

                    <>

                      Verify Identity

                      <ShieldCheck size={20} />

                    </>

                  )}

                </motion.button>

                {/* Resend */}

                <button
                  type="button"
                  className="w-full border border-cyan-500 rounded-xl py-3 text-cyan-400 font-semibold hover:bg-cyan-500/10 transition"
                >

                  Resend Authentication Code

                </button>

              </form>

              {/* Security Notice */}

              <div className="mt-8 rounded-2xl bg-slate-800 border border-slate-700 p-5">

                <div className="flex items-start gap-4">

                  <ShieldCheck
                    className="text-green-400 mt-1"
                    size={24}
                  />

                  <div>

                    <h4 className="font-semibold">

                      Security Notice

                    </h4>

                    <p className="text-slate-400 mt-2 leading-7">

                      Two-Factor Authentication protects your account
                      even if your password is compromised. Never share
                      your authentication code with anyone.

                    </p>

                  </div>

                </div>

              </div>

              {/* Back */}

              <div className="mt-8 text-center">

                <p className="text-slate-400">

                  Want to use another account?{" "}

                  <Link
                    to="/login"
                    className="text-cyan-400 font-semibold hover:underline"
                  >

                    Back to Login

                  </Link>

                </p>

              </div>

            </div>

          </motion.div>
                        {/* Authentication Progress */}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <div className="flex justify-between items-center mb-5">

                    <h3 className="text-xl font-bold">

                      Authentication Progress

                    </h3>

                    <span className="text-cyan-400 font-semibold">

                      Step 2 of 3

                    </span>

                  </div>

                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "66%" }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                    />

                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 text-center">

                    {[
                      "Login",
                      "2FA",
                      "Dashboard",
                    ].map((step, index) => (

                      <div key={index}>

                        <div
                          className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                            index <= 1
                              ? "bg-cyan-500"
                              : "bg-slate-700"
                          }`}
                        >

                          {index <= 1 ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            index + 1
                          )}

                        </div>

                        <p className="mt-3 text-sm text-slate-400">

                          {step}

                        </p>

                      </div>

                    ))}

                  </div>

                </div>

              </motion.div>

              {/* Trusted Device Management */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <Smartphone
                      className="text-cyan-400"
                      size={26}
                    />

                    <h3 className="text-xl font-bold">

                      Trusted Device Management

                    </h3>

                  </div>

                  <div className="space-y-5">

                    {[
                      "Recognize frequently used devices.",
                      "Reduce repeated verification requests.",
                      "Revoke trusted devices anytime.",
                      "Detect unknown devices automatically.",
                    ].map((item, index) => (

                      <div
                        key={index}
                        className="flex items-center gap-4"
                      >

                        <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center">

                          <CheckCircle2
                            size={18}
                            className="text-cyan-400"
                          />

                        </div>

                        <span className="text-slate-300">

                          {item}

                        </span>

                      </div>

                    ))}

                  </div>

                </div>

              </motion.div>

              {/* Enterprise Protection */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mt-8"
              >

                <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6">

                  <div className="flex justify-between items-center mb-6">

                    <h3 className="text-xl font-bold">

                      Enterprise Protection

                    </h3>

                    <ShieldCheck
                      size={28}
                      className="text-cyan-400"
                    />

                  </div>

                  <div className="grid md:grid-cols-2 gap-5">

                    {securityFeatures.map((feature, index) => (

                      <div
                        key={index}
                        className="flex items-center gap-3"
                      >

                        <CheckCircle2
                          size={18}
                          className="text-green-400"
                        />

                        <span className="text-slate-300">

                          {feature}

                        </span>

                      </div>

                    ))}

                  </div>

                </div>

              </motion.div>

              {/* Recovery Codes */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="mt-8"
              >

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6">

                  <div className="flex items-start gap-4">

                    <LockKeyhole
                      className="text-cyan-400 mt-1"
                      size={26}
                    />

                    <div>

                      <h3 className="text-lg font-semibold">

                        Recovery Codes

                      </h3>

                      <p className="text-slate-300 mt-2 leading-7">

                        Save your recovery codes in a secure location.
                        These one-time codes allow access to your account
                        if you lose access to your authentication device.

                      </p>

                    </div>

                  </div>

                </div>

              </motion.div>

              {/* Security Notice */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <ShieldCheck
                      size={26}
                      className="text-green-400"
                    />

                    <h3 className="text-xl font-bold">

                      Security Notice

                    </h3>

                  </div>

                  <div className="space-y-4">

                    {[
                      "Never share your authentication code.",
                      "Verify you're on the official RuchiGo website.",
                      "Report suspicious login attempts immediately.",
                      "Enable authenticator apps for maximum protection.",
                    ].map((item, index) => (

                      <div
                        key={index}
                        className="flex items-center gap-4"
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
                            {/* Enterprise Security Dashboard */}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <div className="flex justify-between items-center mb-6">

                    <div>

                      <h3 className="text-2xl font-bold">

                        Enterprise Security Dashboard

                      </h3>

                      <p className="text-slate-400 mt-2">

                        Real-time protection for your RuchiGo account.

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
                        value: "Waiting",
                        icon: Fingerprint,
                        color: "text-orange-400",
                      },
                      {
                        title: "Device Security",
                        value: "Trusted",
                        icon: Smartphone,
                        color: "text-green-400",
                      },
                      {
                        title: "Risk Score",
                        value: "Low",
                        icon: ShieldCheck,
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

              {/* AI Risk Detection */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
                className="mt-8"
              >

                <div className="bg-gradient-to-r from-cyan-500/10 via-slate-900 to-blue-600/10 border border-cyan-500/20 rounded-2xl p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <Sparkles
                      size={28}
                      className="text-cyan-400"
                    />

                    <h3 className="text-2xl font-bold">

                      AI Risk Detection

                    </h3>

                  </div>

                  <div className="grid md:grid-cols-2 gap-5">

                    {[
                      "Detects suspicious login attempts.",
                      "Recognizes unusual devices automatically.",
                      "Analyzes login location and behavior.",
                      "Blocks brute-force authentication attacks.",
                      "Monitors verification attempts continuously.",
                      "Provides real-time fraud prevention.",
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

                    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700">

                      <h4 className="font-semibold mb-4">

                        React Hook Form

                      </h4>

                      <ul className="space-y-2 text-slate-400">

                        <li>• register()</li>

                        <li>• handleSubmit()</li>

                        <li>• watch()</li>

                        <li>• setValue()</li>

                        <li>• formState.errors</li>

                      </ul>

                    </div>

                    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700">

                      <h4 className="font-semibold mb-4">

                        Zod Validation

                      </h4>

                      <ul className="space-y-2 text-slate-400">

                        <li>• Required Authentication Code</li>

                        <li>• Six-Digit Validation</li>

                        <li>• Expired Code Detection</li>

                        <li>• Invalid Code Handling</li>

                        <li>• API Error Responses</li>

                      </ul>

                    </div>

                  </div>

                  <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5">

                    <p className="text-cyan-300 font-medium">

                      Example Validation Message

                    </p>

                    <p className="text-slate-300 mt-3 leading-7">

                      Invalid authentication code. Please enter the correct
                      six-digit verification code or request a new one.

                    </p>

                  </div>

                </div>

              </motion.div>

              {/* Authentication Status */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.15 }}
                className="mt-8"
              >

                <div className="grid md:grid-cols-3 gap-5">

                  {[
                    {
                      title: "Login",
                      status: "Verified",
                      color: "text-green-400",
                    },
                    {
                      title: "2FA",
                      status: "Pending",
                      color: "text-orange-400",
                    },
                    {
                      title: "Dashboard",
                      status: "Locked",
                      color: "text-cyan-400",
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

                      <h2 className={`text-2xl font-bold mt-3 ${item.color}`}>

                        {item.status}

                      </h2>

                    </motion.div>

                  ))}

                </div>

              </motion.div>
                            {/* Trusted by Millions */}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.25 }}
                className="mt-8"
              >

                <div className="bg-gradient-to-r from-cyan-500/10 via-slate-900 to-blue-600/10 border border-cyan-500/20 rounded-2xl p-6">

                  <div className="flex justify-between items-center mb-8">

                    <div>

                      <h3 className="text-2xl font-bold">

                        Trusted by Millions

                      </h3>

                      <p className="text-slate-400 mt-2 leading-7">

                        Every day millions of secure authentication requests
                        protect customers, restaurants, delivery partners,
                        and administrators across the RuchiGo ecosystem.

                      </p>

                    </div>

                    <ShieldCheck
                      size={34}
                      className="text-cyan-400"
                    />

                  </div>

                  <div className="grid md:grid-cols-4 grid-cols-2 gap-5">

                    {[
                      {
                        value: "250K+",
                        title: "Protected Users",
                        icon: Users,
                        color: "text-cyan-400",
                      },
                      {
                        value: "99.99%",
                        title: "Verification Success",
                        icon: CheckCircle2,
                        color: "text-green-400",
                      },
                      {
                        value: "24×7",
                        title: "AI Monitoring",
                        icon: Sparkles,
                        color: "text-purple-400",
                      },
                      {
                        value: "<15 Sec",
                        title: "Average Verification",
                        icon: Fingerprint,
                        color: "text-orange-400",
                      },
                    ].map((item, index) => {

                      const Icon = item.icon;

                      return (

                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className="bg-slate-900 border border-slate-700 rounded-2xl p-5 text-center"
                        >

                          <Icon
                            size={34}
                            className={`mx-auto mb-3 ${item.color}`}
                          />

                          <h2 className="text-3xl font-bold">

                            {item.value}

                          </h2>

                          <p className="text-slate-400 mt-2">

                            {item.title}

                          </p>

                        </motion.div>

                      );

                    })}

                  </div>

                </div>

              </motion.div>

              {/* Customer Success Stories */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.35 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <h3 className="text-2xl font-bold mb-6">

                    Customer Success Stories

                  </h3>

                  <div className="space-y-5">

                    {[
                      {
                        name: "Rahul Sharma",
                        role: "Customer",
                        review:
                          "The two-factor authentication process was incredibly fast and gave me complete confidence that my account was protected.",
                      },
                      {
                        name: "Food Paradise",
                        role: "Restaurant Partner",
                        review:
                          "RuchiGo's enterprise-grade security keeps our restaurant dashboard safe from unauthorized access.",
                      },
                      {
                        name: "Sneha Patel",
                        role: "Delivery Partner",
                        review:
                          "I can securely log in from any device knowing every authentication request is verified.",
                      },
                    ].map((story, index) => (

                      <motion.div
                        key={index}
                        whileHover={{ x: 5 }}
                        className="bg-slate-900 border border-slate-700 rounded-2xl p-5"
                      >

                        <div className="flex justify-between items-center mb-3">

                          <div>

                            <h4 className="font-semibold">

                              {story.name}

                            </h4>

                            <p className="text-cyan-400 text-sm">

                              {story.role}

                            </p>

                          </div>

                          <div className="flex gap-1">

                            {[...Array(5)].map((_, i) => (

                              <Sparkles
                                key={i}
                                size={16}
                                className="text-yellow-400"
                              />

                            ))}

                          </div>

                        </div>

                        <p className="text-slate-400 leading-7">

                          "{story.review}"

                        </p>

                      </motion.div>

                    ))}

                  </div>

                </div>

              </motion.div>

              {/* Why Two-Factor Authentication Matters */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.45 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <h3 className="text-2xl font-bold mb-6">

                    Why Two-Factor Authentication Matters

                  </h3>

                  <div className="grid md:grid-cols-2 gap-5">

                    {[
                      {
                        icon: ShieldCheck,
                        title: "Extra Account Protection",
                        desc: "Even if someone knows your password, they cannot access your account without the second verification factor.",
                        color: "text-green-400",
                      },
                      {
                        icon: Smartphone,
                        title: "Trusted Devices",
                        desc: "Recognize and securely manage trusted devices while detecting new login attempts automatically.",
                        color: "text-cyan-400",
                      },
                      {
                        icon: Sparkles,
                        title: "AI Threat Detection",
                        desc: "Machine learning continuously analyzes login behavior to identify suspicious authentication attempts.",
                        color: "text-purple-400",
                      },
                      {
                        icon: LockKeyhole,
                        title: "Enterprise Encryption",
                        desc: "Every authentication request is encrypted using enterprise-grade security standards.",
                        color: "text-orange-400",
                      },
                    ].map((feature, index) => {

                      const Icon = feature.icon;

                      return (

                        <motion.div
                          key={index}
                          whileHover={{ y: -6 }}
                          className="bg-slate-900 border border-slate-700 rounded-2xl p-5"
                        >

                          <Icon
                            size={34}
                            className={`${feature.color} mb-4`}
                          />

                          <h4 className="text-lg font-semibold">

                            {feature.title}

                          </h4>

                          <p className="text-slate-400 mt-3 leading-7">

                            {feature.desc}

                          </p>

                        </motion.div>

                      );

                    })}

                  </div>

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

                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-6">

                      <ShieldCheck size={34} />

                    </div>

                    <h2 className="text-3xl font-bold">

                      Enterprise Multi-Factor Security

                    </h2>

                    <p className="text-slate-400 mt-4 max-w-2xl mx-auto leading-8">

                      RuchiGo protects every account with enterprise-grade
                      multi-factor authentication, AI-powered threat detection,
                      encrypted communication, trusted device management,
                      and continuous security monitoring.

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
                          className="block text-slate-400 hover:text-cyan-400 transition"
                        >

                          About Us

                        </Link>

                        <Link
                          to="/careers"
                          className="block text-slate-400 hover:text-cyan-400 transition"
                        >

                          Careers

                        </Link>

                        <Link
                          to="/contact"
                          className="block text-slate-400 hover:text-cyan-400 transition"
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
                          className="block text-slate-400 hover:text-cyan-400 transition"
                        >

                          Help Center

                        </Link>

                        <Link
                          to="/faq"
                          className="block text-slate-400 hover:text-cyan-400 transition"
                        >

                          FAQs

                        </Link>

                        <Link
                          to="/support"
                          className="block text-slate-400 hover:text-cyan-400 transition"
                        >

                          Customer Support

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
                          className="block text-slate-400 hover:text-cyan-400 transition"
                        >

                          Privacy Policy

                        </Link>

                        <Link
                          to="/terms"
                          className="block text-slate-400 hover:text-cyan-400 transition"
                        >

                          Terms & Conditions

                        </Link>

                        <Link
                          to="/cookies"
                          className="block text-slate-400 hover:text-cyan-400 transition"
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

                          Multi-Factor Protected

                        </div>

                        <div className="flex items-center gap-2 text-slate-400">

                          <Fingerprint
                            size={18}
                            className="text-cyan-400"
                          />

                          Trusted Devices

                        </div>

                        <div className="flex items-center gap-2 text-slate-400">

                          <Sparkles
                            size={18}
                            className="text-purple-400"
                          />

                          AI Risk Detection

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
                        className="text-slate-400 hover:text-cyan-400 transition"
                      >

                        Privacy

                      </Link>

                      <Link
                        to="/terms"
                        className="text-slate-400 hover:text-cyan-400 transition"
                      >

                        Terms

                      </Link>

                      <Link
                        to="/cookies"
                        className="text-slate-400 hover:text-cyan-400 transition"
                      >

                        Cookies

                      </Link>

                      <Link
                        to="/support"
                        className="text-slate-400 hover:text-cyan-400 transition"
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

export default TwoFactorAuth;