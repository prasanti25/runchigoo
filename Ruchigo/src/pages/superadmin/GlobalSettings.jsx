import Navbar from "../../components/Navbar.jsx";

import {
  Settings,
  Globe,
  Building2,
  Languages,
  Mail,
  Bell,
  ShieldCheck,
  Search,
  Filter,
  Download,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";

export default function GlobalSettings() {

  const stats = [
    {
      title: "Configurations",
      value: "124",
      icon: Settings,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Languages",
      value: "18",
      icon: Languages,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Regions",
      value: "42",
      icon: Globe,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Security Policies",
      value: "16",
      icon: ShieldCheck,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="font-semibold text-red-500">

                Super Administrator

              </p>

              <h1 className="mt-2 text-4xl font-bold">

                Global Settings

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Configure company information, localization,
                currencies, notifications, cloud services,
                security policies, AI features, and platform-wide
                preferences.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700">

              <Settings size={20} />

              Save Settings

            </button>

          </div>

          {/* KPI Cards */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {stats.map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.title}
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >

                  <div className="flex items-center justify-between">

                    <div className={`rounded-2xl p-4 ${item.color}`}>

                      <Icon size={28} />

                    </div>

                    <TrendingUp className="text-green-500" />

                  </div>

                  <h3 className="mt-5 text-gray-500">

                    {item.title}

                  </h3>

                  <h2 className="mt-2 text-3xl font-bold">

                    {item.value}

                  </h2>

                </div>

              );

            })}

          </div>

          {/* Search */}

          <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 lg:flex-row">

              <div className="relative flex-1">

                <Search
                  size={20}
                  className="absolute left-4 top-3.5 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search settings..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-violet-500"
                />

              </div>

              <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100">

                <Filter size={18} />

                Filter

              </button>

              <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100">

                <Download size={18} />

                Export

              </button>

            </div>

          </div>

          {/* Settings Categories */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Company Information */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Building2 className="text-violet-600" />

                <h2 className="text-2xl font-bold">

                  Company Information

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Company Name", "RuchiGo Technologies"],
                  ["Support Email", "support@ruchigo.com"],
                  ["Support Phone", "+91 98765 43210"],
                  ["Website", "www.ruchigo.com"],
                ].map(([label, value]) => (

                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {label}

                    </span>

                    <span className="text-violet-600 font-semibold">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Localization */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Languages className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Localization & Languages

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Default Language", "English"],
                  ["Supported Languages", "18"],
                  ["Default Time Zone", "Asia/Kolkata"],
                  ["Regions Enabled", "42"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-green-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Currency & Email */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Globe className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Currency & Tax Settings

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Default Currency", "INR (₹)"],
                  ["GST Rate", "18%"],
                  ["Service Tax", "Enabled"],
                  ["Multi-Currency", "Enabled"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-blue-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Mail className="text-red-600" />

                <h2 className="text-2xl font-bold">

                  Email Configuration

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["SMTP Server", "smtp.ruchigo.com"],
                  ["Email Provider", "Google Workspace"],
                  ["Daily Email Limit", "100,000"],
                  ["Delivery Status", "Operational"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-red-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Notification & Cloud */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Bell className="text-yellow-500" />

                <h2 className="text-2xl font-bold">

                  Notification Settings

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Push Notifications", "Enabled"],
                  ["Email Notifications", "Enabled"],
                  ["SMS Notifications", "Enabled"],
                  ["Marketing Campaigns", "Disabled"],
                ].map(([title, status]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        status === "Enabled"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >

                      {status}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <SlidersHorizontal className="text-cyan-600" />

                <h2 className="text-2xl font-bold">

                  Cloud Storage

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Storage Provider", "AWS S3"],
                  ["Total Storage", "12 TB"],
                  ["Used Storage", "7.6 TB"],
                  ["Backup Status", "Healthy"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-cyan-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* System Preferences */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* System Preferences */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Settings className="text-violet-600" />

                <h2 className="text-2xl font-bold">

                  System Preferences

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Maintenance Mode", "Disabled"],
                  ["Dark Mode", "Enabled"],
                  ["Auto Updates", "Enabled"],
                  ["Performance Mode", "High"],
                  ["API Cache", "Enabled"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-violet-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Security Policies */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <ShieldCheck className="text-red-600" />

                <h2 className="text-2xl font-bold">

                  Security Policies

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Password Policy", "Strong"],
                  ["Two-Factor Authentication", "Mandatory"],
                  ["Firewall", "Enabled"],
                  ["SSL Encryption", "Enabled"],
                  ["Session Timeout", "30 Minutes"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-red-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Features */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-700 p-8 text-white">

            <h2 className="text-3xl font-bold">

              AI Feature Configuration

            </h2>

            <p className="mt-3 text-violet-100">

              Enable or disable AI-powered services across the entire
              RuchiGo platform including recommendations, fraud detection,
              smart pricing, analytics, chatbot, and predictive insights.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "AI Recommendation",
                  value: "Enabled",
                },
                {
                  title: "Fraud Detection",
                  value: "Enabled",
                },
                {
                  title: "Smart Pricing",
                  value: "Enabled",
                },
                {
                  title: "AI Chatbot",
                  value: "Enabled",
                },
              ].map((item) => (

                <div
                  key={item.title}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur"
                >

                  <h3 className="font-semibold">

                    {item.title}

                  </h3>

                  <p className="mt-4 text-2xl font-bold">

                    {item.value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Backup & Recovery */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Backup & Recovery

            </h2>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {[
                ["Last Backup", "Today 02:00 AM"],
                ["Backup Frequency", "Daily"],
                ["Recovery Status", "Ready"],
                ["Disaster Recovery", "Configured"],
              ].map(([title, value]) => (

                <div
                  key={title}
                  className="rounded-2xl border p-5"
                >

                  <h3 className="text-gray-500">

                    {title}

                  </h3>

                  <p className="mt-3 text-lg font-bold text-emerald-600">

                    {value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Quick Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Configuration Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Save Configuration",
                "Reset Settings",
                "Import Config",
                "Export Config",
                "Run Backup",
                "Restore Backup",
                "Restart Services",
                "System Diagnostics",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-violet-500 hover:bg-violet-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <Settings
              size={42}
              className="mx-auto text-violet-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Global Configuration Center

            </h2>

            <p className="mt-3 text-gray-500">

              Manage organization-wide configurations, localization,
              security policies, AI features, cloud services, backup
              strategies, and platform preferences from one centralized
              dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700">

                Save All Settings

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Export Configuration

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                View Audit History

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Configuration Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}