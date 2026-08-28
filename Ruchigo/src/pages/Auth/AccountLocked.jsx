import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/common/Logo";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  LockKeyhole,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Users,
  Store,
  Clock3,
  Mail,
} from "lucide-react";

const statistics = [
  {
    title: "Protected Accounts",
    value: "250K+",
    icon: Users,
    color: "text-cyan-400",
  },
  {
    title: "Threats Blocked",
    value: "1.2M+",
    icon: ShieldAlert,
    color: "text-red-400",
  },
  {
    title: "Restaurants Secured",
    value: "5,200+",
    icon: Store,
    color: "text-green-400",
  },
  {
    title: "Recovery Success",
    value: "99.8%",
    icon: ShieldCheck,
    color: "text-purple-400",
  },
];

const securityBenefits = [
  "Automatically blocks suspicious login attempts",
  "Prevents brute-force password attacks",
  "AI-powered fraud detection system",
  "Instant account recovery options",
  "Protects payment and personal information",
  "Enterprise-grade account protection",
];

const recoveryOptions = [
  "Unlock using registered email",
  "Wait until temporary lock expires",
  "Contact customer support",
  "Verify your identity securely",
  "Review recent login activity",
  "Reset password if required",
];

const AccountLocked = () => {

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

          {/* Animated Background */}

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

                  Enterprise Security

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

              Account

              <span className="block bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">

                Temporarily Locked

              </span>

            </motion.h1>

            <p className="mt-8 text-lg text-slate-400 leading-8 max-w-xl">

              We've temporarily locked your account to protect it from
              unauthorized access. This usually happens after multiple
              unsuccessful login attempts or when unusual activity is
              detected by our AI security system.

            </p>

            {/* Security Benefits */}

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

          {/* Account Locked Form Starts in Part 1B */}
                    <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl"
          >

            <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700 rounded-3xl shadow-2xl p-8 lg:p-10">

              {/* Header */}

              <div className="text-center mb-8">

                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-5">

                  <LockKeyhole size={34} />

                </div>

                <h2 className="text-3xl font-bold">

                  Account Locked

                </h2>

                <p className="text-slate-400 mt-3 leading-7">

                  Your account has been temporarily locked to protect it
                  from unauthorized access. Please follow the recovery
                  steps below to regain access securely.

                </p>

              </div>

              {/* Lock Details */}

              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-8">

                <div className="flex items-start gap-4">

                  <AlertTriangle
                    size={30}
                    className="text-red-400 mt-1"
                  />

                  <div>

                    <h3 className="text-lg font-semibold">

                      Security Alert

                    </h3>

                    <p className="text-slate-300 mt-2 leading-7">

                      Multiple unsuccessful login attempts were detected
                      from your account. For your protection, access has
                      been temporarily restricted.

                    </p>

                  </div>

                </div>

              </div>

              {/* Countdown Timer */}

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-8">

                <div className="flex justify-between items-center">

                  <div>

                    <h4 className="font-semibold">

                      Remaining Lock Time

                    </h4>

                    <p className="text-slate-400 text-sm mt-1">

                      You can try signing in again after the timer ends.

                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <Clock3
                      size={24}
                      className="text-orange-400"
                    />

                    <span className="text-3xl font-bold text-orange-400">

                      14:59

                    </span>

                  </div>

                </div>

              </div>

              {/* Recovery Options */}

              <div className="space-y-4 mb-8">

                <h3 className="font-semibold text-lg">

                  Recovery Options

                </h3>

                {recoveryOptions.map((option, index) => (

                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-2xl p-4"
                  >

                    <CheckCircle2
                      size={20}
                      className="text-green-400"
                    />

                    <span className="text-slate-300">

                      {option}

                    </span>

                  </motion.div>

                ))}

              </div>

              {/* Unlock Email */}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 font-semibold flex justify-center items-center gap-3"
              >

                {loading ? (

                  <>

                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                    Sending...

                  </>

                ) : (

                  <>

                    <Mail size={20} />

                    Send Unlock Email

                  </>

                )}

              </motion.button>

              {/* Retry Login */}

              <Link to="/login">

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-4 rounded-xl border border-cyan-500 text-cyan-400 font-semibold hover:bg-cyan-500/10 transition"
                >

                  Retry Login

                </motion.button>

              </Link>

              {/* Contact Support */}

              <Link to="/support">

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-4 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-800 transition"
                >

                  Contact Support

                </motion.button>

              </Link>

              {/* Security Notice */}

              <div className="mt-8 bg-slate-800 border border-slate-700 rounded-2xl p-5">

                <div className="flex items-start gap-4">

                  <ShieldCheck
                    size={24}
                    className="text-green-400 mt-1"
                  />

                  <div>

                    <h4 className="font-semibold">

                      Security Notice

                    </h4>

                    <p className="text-slate-400 mt-2 leading-7">

                      If this wasn't you, change your password immediately
                      after regaining access and review your recent login
                      activity for any unfamiliar devices.

                    </p>

                  </div>

                </div>

              </div>

              {/* Back to Login */}

              <div className="mt-8 text-center">

                <p className="text-slate-400">

                  Remembered your credentials?{" "}

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
                        {/* Account Lock Progress */}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <div className="flex justify-between items-center mb-5">

                    <h3 className="text-xl font-bold">

                      Account Recovery Progress

                    </h3>

                    <span className="text-orange-400 font-semibold">

                      Step 1 of 3

                    </span>

                  </div>

                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "33%" }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                    />

                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 text-center">

                    {[
                      "Locked",
                      "Verify",
                      "Unlocked",
                    ].map((step, index) => (

                      <div key={index}>

                        <div
                          className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                            index === 0
                              ? "bg-red-500"
                              : "bg-slate-700"
                          }`}
                        >

                          {index === 0 ? (
                            <LockKeyhole size={18} />
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

              {/* Recovery Workflow */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <Mail
                      className="text-cyan-400"
                      size={26}
                    />

                    <h3 className="text-xl font-bold">

                      Recovery Workflow

                    </h3>

                  </div>

                  <div className="space-y-5">

                    {[
                      "Receive account recovery email.",
                      "Verify your identity securely.",
                      "Reset your password if required.",
                      "Review recent login activity.",
                      "Unlock and access your account safely.",
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

                    {[
                      "AI-powered threat monitoring",
                      "Automatic brute-force protection",
                      "Encrypted account recovery",
                      "Device fingerprint detection",
                      "Real-time login analysis",
                      "Continuous account monitoring",
                    ].map((feature, index) => (

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

              {/* Security Policy */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="mt-8"
              >

                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">

                  <div className="flex items-start gap-4">

                    <ShieldAlert
                      className="text-red-400 mt-1"
                      size={26}
                    />

                    <div>

                      <h3 className="text-lg font-semibold">

                        Security Policy

                      </h3>

                      <p className="text-slate-300 mt-2 leading-7">

                        Accounts may be temporarily locked after multiple
                        failed login attempts or unusual sign-in activity.
                        This policy helps protect your personal information,
                        saved payment methods, and order history from
                        unauthorized access.

                      </p>

                    </div>

                  </div>

                </div>

              </motion.div>

              {/* AI Monitoring */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <Sparkles
                      size={26}
                      className="text-purple-400"
                    />

                    <h3 className="text-xl font-bold">

                      AI Monitoring & Threat Prevention

                    </h3>

                  </div>

                  <div className="space-y-4">

                    {[
                      "Detects suspicious login behavior.",
                      "Analyzes device and location changes.",
                      "Identifies brute-force attack patterns.",
                      "Monitors unusual authentication requests.",
                      "Automatically secures compromised accounts.",
                    ].map((item, index) => (

                      <div
                        key={index}
                        className="flex items-center gap-4"
                      >

                        <CheckCircle2
                          size={18}
                          className="text-purple-400"
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

                        Real-time account protection and recovery status.

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
                        title: "Account Status",
                        value: "Locked",
                        icon: LockKeyhole,
                        color: "text-red-400",
                      },
                      {
                        title: "Threat Level",
                        value: "High",
                        icon: AlertTriangle,
                        color: "text-orange-400",
                      },
                      {
                        title: "Recovery",
                        value: "Available",
                        icon: Mail,
                        color: "text-green-400",
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

              {/* AI Threat Detection */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
                className="mt-8"
              >

                <div className="bg-gradient-to-r from-red-500/10 via-slate-900 to-orange-500/10 border border-red-500/20 rounded-2xl p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <Sparkles
                      size={28}
                      className="text-red-400"
                    />

                    <h3 className="text-2xl font-bold">

                      AI Threat Detection

                    </h3>

                  </div>

                  <div className="grid md:grid-cols-2 gap-5">

                    {[
                      "Detects repeated failed login attempts.",
                      "Identifies unknown devices instantly.",
                      "Analyzes suspicious login locations.",
                      "Blocks brute-force password attacks.",
                      "Monitors account activity continuously.",
                      "Generates intelligent security alerts.",
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

                        <li>• watch()</li>

                        <li>• reset()</li>

                        <li>• formState.errors</li>

                      </ul>

                    </div>

                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">

                      <h4 className="font-semibold mb-4">

                        Zod Validation

                      </h4>

                      <ul className="space-y-2 text-slate-400">

                        <li>• Email Validation</li>

                        <li>• Password Validation</li>

                        <li>• Account Lock Rules</li>

                        <li>• Recovery Token Validation</li>

                        <li>• API Error Handling</li>

                      </ul>

                    </div>

                  </div>

                  <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-5">

                    <p className="text-red-300 font-medium">

                      Example Security Message

                    </p>

                    <p className="text-slate-300 mt-3 leading-7">

                      Your account has been temporarily locked due to
                      multiple unsuccessful login attempts. Please verify
                      your identity using the recovery options below or
                      wait until the lock period expires.

                    </p>

                  </div>

                </div>

              </motion.div>

              {/* Account Status */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.15 }}
                className="mt-8"
              >

                <div className="grid md:grid-cols-3 gap-5">

                  {[
                    {
                      title: "Security",
                      status: "Protected",
                      color: "text-green-400",
                    },
                    {
                      title: "Account",
                      status: "Locked",
                      color: "text-red-400",
                    },
                    {
                      title: "Recovery",
                      status: "Ready",
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

                <div className="bg-gradient-to-r from-red-500/10 via-slate-900 to-orange-500/10 border border-red-500/20 rounded-2xl p-6">

                  <div className="flex justify-between items-center mb-8">

                    <div>

                      <h3 className="text-2xl font-bold">

                        Trusted by Millions

                      </h3>

                      <p className="text-slate-400 mt-2 leading-7">

                        Every security decision is made to protect your
                        account. RuchiGo's intelligent security platform
                        safeguards millions of users, restaurants,
                        delivery partners, and administrators every day.

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
                        value: "1.2M+",
                        title: "Threats Blocked",
                        icon: ShieldAlert,
                        color: "text-red-400",
                      },
                      {
                        value: "24×7",
                        title: "AI Monitoring",
                        icon: Sparkles,
                        color: "text-purple-400",
                      },
                      {
                        value: "99.8%",
                        title: "Recovery Success",
                        icon: ShieldCheck,
                        color: "text-green-400",
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
                          "The account recovery process was smooth and I appreciated that my account was locked before anyone else could access it.",
                      },
                      {
                        name: "Food Paradise",
                        role: "Restaurant Partner",
                        review:
                          "RuchiGo's security instantly protected our restaurant account after suspicious login attempts. We regained access safely.",
                      },
                      {
                        name: "Sneha Patel",
                        role: "Delivery Partner",
                        review:
                          "The recovery email arrived quickly and the entire unlock process was secure and easy to follow.",
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

              {/* Why Account Lock Protection Matters */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.45 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <h3 className="text-2xl font-bold mb-6">

                    Why Account Lock Protection Matters

                  </h3>

                  <div className="grid md:grid-cols-2 gap-5">

                    {[
                      {
                        icon: ShieldAlert,
                        title: "Stops Unauthorized Access",
                        desc: "Automatically blocks repeated failed login attempts before attackers can access your account.",
                        color: "text-red-400",
                      },
                      {
                        icon: LockKeyhole,
                        title: "Protects Personal Data",
                        desc: "Safeguards your addresses, payment methods, saved preferences, and order history.",
                        color: "text-orange-400",
                      },
                      {
                        icon: Sparkles,
                        title: "AI Threat Intelligence",
                        desc: "Artificial intelligence continuously monitors login behavior and detects suspicious activities.",
                        color: "text-purple-400",
                      },
                      {
                        icon: ShieldCheck,
                        title: "Safe Account Recovery",
                        desc: "Multiple secure recovery options help verified users regain access without compromising security.",
                        color: "text-green-400",
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

                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6">

                      <ShieldAlert size={34} />

                    </div>

                    <h2 className="text-3xl font-bold">

                      Enterprise Account Protection

                    </h2>

                    <p className="text-slate-400 mt-4 max-w-2xl mx-auto leading-8">

                      Your account security is our highest priority.
                      RuchiGo combines AI-powered threat detection,
                      enterprise-grade encryption, suspicious activity
                      monitoring, and secure recovery workflows to keep
                      every account protected around the clock.

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

                          Enterprise Protected

                        </div>

                        <div className="flex items-center gap-2 text-slate-400">

                          <ShieldAlert
                            size={18}
                            className="text-red-400"
                          />

                          AI Threat Monitoring

                        </div>

                        <div className="flex items-center gap-2 text-slate-400">

                          <LockKeyhole
                            size={18}
                            className="text-orange-400"
                          />

                          Secure Recovery

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

export default AccountLocked;