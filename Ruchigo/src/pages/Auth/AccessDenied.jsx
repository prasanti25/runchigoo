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
  Ban,
  UtensilsCrossed,
} from "lucide-react";

const statistics = [
  {
    title: "Protected Accounts",
    value: "500K+",
    icon: ShieldCheck,
    color: "text-green-400",
  },
  {
    title: "Policy Blocks",
    value: "1.1M+",
    icon: Ban,
    color: "text-red-400",
  },
  {
    title: "Restaurants",
    value: "5,000+",
    icon: Store,
    color: "text-orange-400",
  },
  {
    title: "Security Uptime",
    value: "99.99%",
    icon: Sparkles,
    color: "text-cyan-400",
  },
];

const securityBenefits = [
  "Enterprise security policy enforcement",
  "AI-powered risk detection",
  "Automatic account protection",
  "Continuous compliance monitoring",
  "Secure account recovery process",
  "Real-time access validation",
];

const restrictionReasons = [
  "Account temporarily suspended",
  "Pending identity verification",
  "Policy violation detected",
  "Administrative restriction applied",
  "Region or compliance limitation",
  "Security review in progress",
];

const AccessDenied = () => {

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

          <div className="absolute -top-44 -left-44 w-[420px] h-[420px] rounded-full bg-red-500/20 blur-3xl" />

          <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-orange-500/20 blur-3xl" />

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

                  Enterprise Security Platform

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

              Access

              <span className="block bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">

                Denied

              </span>

            </motion.h1>

            <p className="mt-8 text-lg text-slate-400 leading-8 max-w-xl">

              Your account has been authenticated successfully,
              but access to this resource has been restricted due
              to security policies or administrative rules.
              RuchiGo continuously protects users, restaurants,
              delivery partners, and administrators using
              enterprise-grade security controls.

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

          {/* Access Denied Card Starts in Part 1B */}
                    <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl"
          >

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">

              {/* Header */}

              <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 p-8 text-center">

                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-5">

                  <Ban
                    size={48}
                    className="text-white"
                  />

                </div>

                <h2 className="text-4xl font-bold">

                  Access Denied

                </h2>

                <p className="text-red-100 mt-3 text-lg">

                  Your account is currently restricted.

                </p>

              </div>

              {/* Body */}

              <div className="p-8">

                {/* Restriction Alert */}

                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex gap-4">

                  <AlertTriangle
                    size={28}
                    className="text-red-400 flex-shrink-0 mt-1"
                  />

                  <div>

                    <h3 className="text-xl font-semibold">

                      Security Restriction

                    </h3>

                    <p className="text-slate-400 mt-2 leading-7">

                      Your account has been authenticated successfully,
                      however access has been restricted due to a security
                      policy, administrative action, or compliance
                      requirement. Please review the information below or
                      contact support for assistance.

                    </p>

                  </div>

                </div>

                {/* Account Information */}

                <div className="grid md:grid-cols-2 gap-5 mt-8">

                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                    <div className="flex items-center gap-3 mb-4">

                      <ShieldAlert
                        size={26}
                        className="text-red-400"
                      />

                      <h3 className="text-lg font-semibold">

                        Account Status

                      </h3>

                    </div>

                    <span className="inline-flex px-4 py-2 rounded-full bg-red-500/20 text-red-300 font-medium">

                      Restricted

                    </span>

                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                    <div className="flex items-center gap-3 mb-4">

                      <LockKeyhole
                        size={26}
                        className="text-orange-400"
                      />

                      <h3 className="text-lg font-semibold">

                        Restriction Level

                      </h3>

                    </div>

                    <span className="inline-flex px-4 py-2 rounded-full bg-orange-500/20 text-orange-300 font-medium">

                      Temporary

                    </span>

                  </div>

                </div>

                {/* Restriction Reasons */}

                <div className="mt-8">

                  <h3 className="text-xl font-semibold mb-5">

                    Possible Restriction Reasons

                  </h3>

                  <div className="space-y-3">

                    {restrictionReasons.map((reason, index) => (

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

                          {reason}

                        </span>

                      </motion.div>

                    ))}

                  </div>

                </div>

                {/* Action Buttons */}

                <div className="grid sm:grid-cols-2 gap-4 mt-8">

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 font-semibold shadow-lg hover:shadow-red-500/30 transition-all"
                  >

                    {loading ? "Submitting..." : "Submit Appeal"}

                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="py-4 rounded-2xl border border-slate-600 bg-slate-800 hover:bg-slate-700 transition-all font-semibold"
                  >

                    Contact Support

                  </motion.button>

                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 w-full py-4 rounded-2xl border border-red-500 text-red-400 hover:bg-red-500/10 transition-all font-semibold"
                >

                  Logout

                </motion.button>

                {/* Security Notice */}

                <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">

                  <div className="flex items-start gap-3">

                    <ShieldCheck
                      size={24}
                      className="text-amber-400 mt-1"
                    />

                    <div>

                      <h4 className="font-semibold text-amber-300">

                        Security Notice

                      </h4>

                      <p className="text-slate-400 mt-2 leading-7">

                        Restrictions are applied to help protect the
                        platform, its users, and business operations.
                        Once the underlying issue has been resolved or
                        verified, your access can be restored according
                        to platform policies.

                      </p>

                    </div>

                  </div>

                </div>

                {/* Back to Home */}

                <div className="mt-8 text-center">

                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >

                    <UtensilsCrossed size={18} />

                    Back to Home

                  </Link>

                </div>

              </div>

            </div>

          </motion.div>
                        {/* Enterprise Restriction Dashboard */}

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

                        Enterprise Restriction Dashboard

                      </h3>

                      <p className="text-slate-400 mt-2">

                        Live overview of account status, restriction
                        policies and recovery eligibility.

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
                        title: "Account Status",
                        value: "Restricted",
                        icon: Ban,
                        color: "text-red-400",
                      },
                      {
                        title: "Review Status",
                        value: "Pending",
                        icon: AlertTriangle,
                        color: "text-orange-400",
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

              {/* AI Restriction Analytics */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
                className="mt-8"
              >

                <div className="bg-gradient-to-r from-purple-500/10 via-slate-900 to-red-500/10 border border-purple-500/20 rounded-2xl p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <Sparkles
                      size={28}
                      className="text-purple-400"
                    />

                    <h3 className="text-2xl font-bold">

                      AI Restriction Analytics

                    </h3>

                  </div>

                  <div className="grid md:grid-cols-2 gap-5">

                    {[
                      "Analyzes account risk continuously.",
                      "Detects suspicious behavioral patterns.",
                      "Automatically flags policy violations.",
                      "Maintains secure audit history.",
                      "Predicts potential security threats.",
                      "Supports intelligent administrator reviews.",
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

                        <li>• Restriction Validation</li>
                        <li>• Appeal Request Validation</li>
                        <li>• Identity Verification</li>
                        <li>• Security Policy Validation</li>
                        <li>• API Error Handling</li>

                      </ul>

                    </div>

                  </div>

                  <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-5">

                    <p className="text-red-300 font-medium">

                      Example Restriction Message

                    </p>

                    <p className="text-slate-300 mt-3 leading-7">

                      Your account is currently restricted due to a
                      platform security policy or administrative review.
                      If you believe this action was taken in error,
                      submit an appeal or contact our support team for
                      further assistance.

                    </p>

                  </div>

                </div>

              </motion.div>

              {/* Restriction Status */}

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
                      title: "Restriction",
                      status: "Active",
                      color: "text-red-400",
                    },
                    {
                      title: "Review",
                      status: "Pending",
                      color: "text-orange-400",
                    },
                    {
                      title: "Security",
                      status: "Protected",
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

                      <h2
                        className={`text-2xl font-bold mt-3 ${item.color}`}
                      >

                        {item.status}

                      </h2>

                    </motion.div>

                  ))}

                </div>

              </motion.div>
                            {/* Trusted by Organizations */}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.25 }}
                className="mt-8"
              >

                <div className="bg-gradient-to-r from-red-500/10 via-slate-900 to-cyan-500/10 border border-red-500/20 rounded-2xl p-6">

                  <div className="flex justify-between items-center mb-8">

                    <div>

                      <h3 className="text-2xl font-bold">

                        Trusted by Organizations

                      </h3>

                      <p className="text-slate-400 mt-2 leading-7">

                        RuchiGo protects customers, restaurants,
                        delivery partners, and administrators with
                        enterprise-grade security policies, intelligent
                        monitoring, and continuous compliance checks.
                        Every restriction is designed to safeguard users
                        and maintain platform integrity.

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
                        value: "750K+",
                        title: "Protected Accounts",
                        icon: Users,
                        color: "text-cyan-400",
                      },
                      {
                        value: "1.4M+",
                        title: "Security Actions",
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
                        value: "99.99%",
                        title: "Platform Reliability",
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
                        name: "Priya Reddy",
                        role: "Customer",
                        review:
                          "Support reviewed my account quickly and restored access after my identity verification was completed.",
                      },
                      {
                        name: "Spice Kingdom",
                        role: "Restaurant Partner",
                        review:
                          "Security policies helped protect our business account during an unusual login attempt. The review process was transparent.",
                      },
                      {
                        name: "Operations Team",
                        role: "Platform Administration",
                        review:
                          "Automated restriction policies reduce security risks while ensuring legitimate users can appeal and recover access safely.",
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

              {/* Why Security Policies Matter */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.45 }}
                className="mt-8"
              >

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

                  <h3 className="text-2xl font-bold mb-6">

                    Why Security Policies Matter

                  </h3>

                  <div className="grid md:grid-cols-2 gap-5">

                    {[
                      {
                        icon: ShieldAlert,
                        title: "Protects Platform Integrity",
                        desc: "Security restrictions help prevent misuse, fraud, and unauthorized activities across the platform.",
                        color: "text-red-400",
                      },
                      {
                        icon: LockKeyhole,
                        title: "Ensures Compliance",
                        desc: "Policy enforcement supports regulatory, business, and operational compliance requirements.",
                        color: "text-orange-400",
                      },
                      {
                        icon: Sparkles,
                        title: "AI Risk Detection",
                        desc: "Artificial intelligence continuously evaluates account behavior to identify potential security risks.",
                        color: "text-purple-400",
                      },
                      {
                        icon: ShieldCheck,
                        title: "Safe Recovery Process",
                        desc: "Verified users can request reviews or submit appeals to restore access through secure workflows.",
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

                      <Ban size={34} />

                    </div>

                    <h2 className="text-3xl font-bold">

                      Enterprise Security & Compliance

                    </h2>

                    <p className="text-slate-400 mt-4 max-w-2xl mx-auto leading-8">

                      Access restrictions help maintain a secure,
                      compliant, and trustworthy platform. Every policy,
                      review, and verification step is designed to
                      protect customers, restaurants, delivery partners,
                      administrators, and business operations while
                      ensuring a fair appeal and recovery process.

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
                          to="/support"
                          className="block text-slate-400 hover:text-red-400 transition"
                        >

                          Contact Support

                        </Link>

                        <Link
                          to="/appeal"
                          className="block text-slate-400 hover:text-red-400 transition"
                        >

                          Submit Appeal

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

                          <Sparkles
                            size={18}
                            className="text-purple-400"
                          />

                          AI Risk Detection

                        </div>

                        <div className="flex items-center gap-2 text-slate-400">

                          <LockKeyhole
                            size={18}
                            className="text-orange-400"
                          />

                          Policy Enforcement

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

export default AccessDenied;