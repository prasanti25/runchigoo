import Navbar from "../../components/Navbar.jsx";

import {
  ShieldCheck,
  Lock,
  KeyRound,
  UserCheck,
  AlertTriangle,
  Search,
  Filter,
  Download,
  TrendingUp,
  Globe,
  Fingerprint,
} from "lucide-react";

export default function SecurityCenter() {

  const stats = [
    {
      title: "Security Score",
      value: "98%",
      icon: ShieldCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Active Sessions",
      value: "2,846",
      icon: UserCheck,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Blocked Threats",
      value: "482",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Protected APIs",
      value: "48",
      icon: KeyRound,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const alerts = [
    {
      title: "Multiple Failed Login Attempts",
      severity: "High",
      time: "3 mins ago",
    },
    {
      title: "New Device Login",
      severity: "Medium",
      time: "18 mins ago",
    },
    {
      title: "API Rate Limit Triggered",
      severity: "Low",
      time: "1 hour ago",
    },
    {
      title: "Admin Password Updated",
      severity: "Info",
      time: "2 hours ago",
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

                Security Center

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Monitor threats, protect user accounts, manage authentication,
                API security, devices, permissions, and platform-wide security
                policies.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-600">

              <ShieldCheck size={20} />

              Run Security Scan

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

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

              <div className="relative flex-1">

                <Search
                  size={20}
                  className="absolute left-4 top-3.5 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search alerts, users or devices..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-red-500"
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

          {/* Security Alerts */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                Live Security Alerts
              </h2>

              <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">

                {alerts.length} Active Alerts

              </span>

            </div>

            <div className="space-y-4">

              {alerts.map((alert) => (

                <div
                  key={alert.title}
                  className="flex items-center justify-between rounded-2xl border p-5 hover:bg-red-50"
                >

                  <div className="flex items-center gap-4">

                    <div className="rounded-xl bg-red-100 p-3">

                      <AlertTriangle
                        size={22}
                        className="text-red-600"
                      />

                    </div>

                    <div>

                      <h3 className="font-semibold">

                        {alert.title}

                      </h3>

                      <p className="text-sm text-gray-500">

                        {alert.time}

                      </p>

                    </div>

                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      alert.severity === "High"
                        ? "bg-red-100 text-red-600"
                        : alert.severity === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : alert.severity === "Low"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >

                    {alert.severity}

                  </span>

                </div>

              ))}

            </div>

          </div>

          {/* User Access & API Security */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* User Access */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                User Access Management

              </h2>

              <div className="mt-8 space-y-4">

                {[
                  {
                    role: "Super Admin",
                    users: "2",
                  },
                  {
                    role: "Admin",
                    users: "12",
                  },
                  {
                    role: "Restaurant Owners",
                    users: "4,528",
                  },
                  {
                    role: "Delivery Partners",
                    users: "8,214",
                  },
                  {
                    role: "Customers",
                    users: "84,256",
                  },
                ].map((item) => (

                  <div
                    key={item.role}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {item.role}

                    </span>

                    <span className="font-bold text-blue-600">

                      {item.users}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* API Keys */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                API Key Management

              </h2>

              <div className="mt-8 space-y-4">

                {[
                  {
                    key: "Payment API",
                    status: "Active",
                  },
                  {
                    key: "Maps API",
                    status: "Active",
                  },
                  {
                    key: "Notification API",
                    status: "Expiring Soon",
                  },
                  {
                    key: "AI API",
                    status: "Active",
                  },
                ].map((api) => (

                  <div
                    key={api.key}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {api.key}

                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        api.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >

                      {api.status}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Login Activity & Device Management */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Globe className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Recent Login Activity

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Hyderabad", "Chrome • Windows", "2 mins ago"],
                  ["Bengaluru", "Edge • Windows", "15 mins ago"],
                  ["Mumbai", "Android App", "1 hour ago"],
                  ["Delhi", "Safari • iPhone", "3 hours ago"],
                ].map(([location, device, time]) => (

                  <div
                    key={location + device}
                    className="rounded-2xl border p-5"
                  >

                    <div className="flex justify-between">

                      <div>

                        <h3 className="font-semibold">

                          {location}

                        </h3>

                        <p className="text-sm text-gray-500">

                          {device}

                        </p>

                      </div>

                      <span className="text-sm font-semibold text-blue-600">

                        {time}

                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Fingerprint className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Device Management

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  "Windows Desktop",
                  "Android Phone",
                  "MacBook Pro",
                  "iPhone 15",
                  "Restaurant POS Terminal",
                ].map((device) => (

                  <div
                    key={device}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {device}

                    </span>

                    <button className="rounded-lg bg-green-100 px-4 py-2 text-green-600 hover:bg-green-200">

                      Verified

                    </button>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Two Factor Authentication */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Two Factor Authentication */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Lock className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Two-Factor Authentication

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  {
                    title: "Super Administrators",
                    value: "100%",
                  },
                  {
                    title: "Administrators",
                    value: "92%",
                  },
                  {
                    title: "Restaurant Owners",
                    value: "81%",
                  },
                  {
                    title: "Delivery Partners",
                    value: "74%",
                  },
                ].map((item) => (

                  <div key={item.title}>

                    <div className="mb-2 flex justify-between">

                      <span>{item.title}</span>

                      <span className="font-semibold text-green-600">

                        {item.value}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-green-500"
                        style={{ width: item.value }}
                      ></div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Audit Logs */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Audit Logs

              </h2>

              <div className="mt-8 space-y-4">

                {[
                  {
                    action: "Role Updated",
                    user: "Super Admin",
                    time: "10 mins ago",
                  },
                  {
                    action: "API Key Regenerated",
                    user: "System",
                    time: "28 mins ago",
                  },
                  {
                    action: "Restaurant Suspended",
                    user: "Admin",
                    time: "1 hour ago",
                  },
                  {
                    action: "Security Policy Changed",
                    user: "Super Admin",
                    time: "3 hours ago",
                  },
                ].map((log) => (

                  <div
                    key={log.action}
                    className="rounded-2xl border p-5"
                  >

                    <div className="flex justify-between">

                      <div>

                        <h3 className="font-semibold">

                          {log.action}

                        </h3>

                        <p className="text-sm text-gray-500">

                          {log.user}

                        </p>

                      </div>

                      <span className="text-sm font-semibold text-red-500">

                        {log.time}

                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Security Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-red-600 via-pink-600 to-purple-700 p-8 text-white">

            <h2 className="text-3xl font-bold">

              AI Security Insights

            </h2>

            <p className="mt-3 text-red-100">

              Artificial Intelligence continuously analyzes user behavior,
              detects suspicious activity, predicts threats, and protects
              platform resources automatically.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Threat Detection",
                  value: "99.7%",
                },
                {
                  title: "Blocked Attacks",
                  value: "482",
                },
                {
                  title: "Risk Score",
                  value: "Low",
                },
                {
                  title: "Security Health",
                  value: "98%",
                },
              ].map((item) => (

                <div
                  key={item.title}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur"
                >

                  <h3 className="font-semibold">

                    {item.title}

                  </h3>

                  <p className="mt-4 text-3xl font-bold">

                    {item.value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Quick Security Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Security Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Run Security Scan",
                "Reset API Keys",
                "Block Suspicious IP",
                "Force Logout All",
                "Download Logs",
                "Backup Security Data",
                "Enable Maintenance",
                "View Compliance Report",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-red-500 hover:bg-red-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <h2 className="text-2xl font-bold">

              Enterprise Security Operations Center

            </h2>

            <p className="mt-3 text-gray-500">

              Protect users, monitor threats, manage authentication,
              secure APIs, and maintain complete visibility across the
              RuchiGo platform.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700">

                Export Security Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Threat Analytics

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                View Audit Logs

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Security Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}