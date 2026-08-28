import Navbar from "../../components/Navbar.jsx";

import {
  ClipboardList,
  History,
  User,
  ShieldCheck,
  Search,
  Filter,
  Download,
  TrendingUp,
  CalendarDays,
  Clock,
  Activity,
  FileText,
} from "lucide-react";

export default function AuditLogs() {

  const stats = [
    {
      title: "Total Logs",
      value: "2.8M",
      icon: ClipboardList,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Today's Events",
      value: "18,452",
      icon: Activity,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Critical Events",
      value: "36",
      icon: ShieldCheck,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Compliance Score",
      value: "99.8%",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const logs = [
    {
      user: "Super Admin",
      action: "Created Restaurant",
      module: "Restaurant",
      severity: "Info",
      time: "2 mins ago",
    },
    {
      user: "Admin",
      action: "Blocked User",
      module: "Users",
      severity: "Warning",
      time: "8 mins ago",
    },
    {
      user: "System",
      action: "Database Backup",
      module: "Database",
      severity: "Success",
      time: "22 mins ago",
    },
    {
      user: "AI Engine",
      action: "Fraud Detected",
      module: "Security",
      severity: "Critical",
      time: "31 mins ago",
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

                Audit Logs

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Track every action across the platform including user activity,
                security events, AI decisions, restaurant operations,
                payments, orders and administrator changes.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">

              <Download size={20} />

              Export Logs

            </button>

          </div>

          {/* Statistics */}

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

                    <TrendingUp className="text-green-500"/>

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
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  placeholder="Search logs..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-blue-500"
                />

              </div>

              <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100">

                <Filter size={18}/>

                Filter

              </button>

              <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100">

                <CalendarDays size={18}/>

                Date Range

              </button>

            </div>

          </div>

          {/* Audit Log Table */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                Enterprise Audit Logs
              </h2>

              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">

                {logs.length} Recent Events

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">User</th>
                    <th className="px-4 py-4">Action</th>
                    <th className="px-4 py-4">Module</th>
                    <th className="px-4 py-4">Severity</th>
                    <th className="px-4 py-4">Time</th>
                    <th className="px-4 py-4">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {logs.map((log) => (

                    <tr
                      key={`${log.user}-${log.action}-${log.time}`}
                      className="border-b transition hover:bg-blue-50"
                    >

                      <td className="px-4 py-5">

                        <div className="flex items-center gap-3">

                          <div className="rounded-xl bg-blue-100 p-3">

                            <User
                              size={20}
                              className="text-blue-600"
                            />

                          </div>

                          <span className="font-semibold">

                            {log.user}

                          </span>

                        </div>

                      </td>

                      <td className="px-4 py-5">

                        {log.action}

                      </td>

                      <td className="px-4 py-5">

                        {log.module}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            log.severity === "Critical"
                              ? "bg-red-100 text-red-600"
                              : log.severity === "Warning"
                              ? "bg-yellow-100 text-yellow-700"
                              : log.severity === "Success"
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >

                          {log.severity}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        {log.time}

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-blue-100 px-4 py-2 text-blue-600 hover:bg-blue-200">

                          View

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* User Activity Timeline */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <History className="text-blue-600"/>

                <h2 className="text-2xl font-bold">

                  User Activity Timeline

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  {
                    user:"Super Admin",
                    action:"Updated Platform Settings",
                    time:"10:15 AM"
                  },
                  {
                    user:"Admin",
                    action:"Approved Restaurant",
                    time:"09:42 AM"
                  },
                  {
                    user:"Restaurant Owner",
                    action:"Updated Menu",
                    time:"09:18 AM"
                  },
                  {
                    user:"Delivery Partner",
                    action:"Completed Delivery",
                    time:"08:57 AM"
                  },
                ].map((item)=>(

                  <div
                    key={item.user + item.time}
                    className="flex gap-4 rounded-2xl border p-5"
                  >

                    <Clock className="mt-1 text-blue-600"/>

                    <div>

                      <h3 className="font-semibold">

                        {item.user}

                      </h3>

                      <p className="text-gray-600">

                        {item.action}

                      </p>

                      <p className="mt-1 text-sm text-gray-400">

                        {item.time}

                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Security Events */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Security Event Logs

              </h2>

              <div className="mt-8 space-y-4">

                {[
                  "Blocked 18 suspicious login attempts",
                  "API token rotated successfully",
                  "Firewall rules updated",
                  "2FA enabled for 46 users",
                  "Password policy updated",
                ].map((event)=>(

                  <div
                    key={event}
                    className="flex items-center gap-4 rounded-2xl border p-5"
                  >

                    <ShieldCheck
                      className="text-green-600"
                      size={22}
                    />

                    <span>

                      {event}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Payment & AI Logs */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Payment Audit Logs

              </h2>

              <div className="mt-8 space-y-4">

                {[
                  ["Successful Transactions","18,426"],
                  ["Refund Requests","128"],
                  ["Failed Payments","42"],
                  ["Chargebacks","7"],
                ].map(([label,value])=>(

                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {label}

                    </span>

                    <span className="font-bold text-green-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-8 text-white">

              <h2 className="text-2xl font-bold">

                AI Decision Logs

              </h2>

              <div className="mt-8 space-y-4">

                {[
                  "Fraud Detection Triggered",
                  "Restaurant Ranking Updated",
                  "Dynamic Pricing Calculated",
                  "Delivery Routes Optimized",
                  "Demand Forecast Generated",
                ].map((item)=>(

                  <div
                    key={item}
                    className="rounded-2xl bg-white/10 p-4 backdrop-blur"
                  >

                    {item}

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Compliance Analytics */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Compliance Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Compliance Analytics

              </h2>

              <div className="mt-8 space-y-6">

                {[
                  ["GDPR Compliance", "99%"],
                  ["PCI-DSS", "100%"],
                  ["ISO 27001", "98%"],
                  ["SOC 2", "97%"],
                  ["Internal Policies", "100%"],
                ].map(([title, value]) => (

                  <div key={title}>

                    <div className="mb-2 flex justify-between">

                      <span>{title}</span>

                      <span className="font-semibold text-blue-600">

                        {value}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-blue-500"
                        style={{ width: value }}
                      ></div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Audit Statistics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Audit Statistics

              </h2>

              <div className="mt-8 space-y-5">

                {[
                  {
                    title: "Logs Generated Today",
                    value: "18,452",
                  },
                  {
                    title: "Security Events",
                    value: "214",
                  },
                  {
                    title: "Admin Activities",
                    value: "86",
                  },
                  {
                    title: "System Events",
                    value: "4,826",
                  },
                ].map((item) => (

                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {item.title}

                    </span>

                    <span className="font-bold text-green-600">

                      {item.value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Compliance Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-8 text-white">

            <h2 className="text-3xl font-bold">

              AI Compliance Insights

            </h2>

            <p className="mt-3 text-blue-100">

              AI continuously reviews audit records, identifies abnormal
              behavior, monitors regulatory compliance, and predicts
              potential security or operational risks before they occur.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Compliance Score",
                  value: "99.8%",
                },
                {
                  title: "Risk Level",
                  value: "Low",
                },
                {
                  title: "Anomalies Detected",
                  value: "14",
                },
                {
                  title: "AI Confidence",
                  value: "98.9%",
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

          {/* Quick Audit Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Audit Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Generate Audit Report",
                "Export All Logs",
                "Compliance Report",
                "Review Critical Events",
                "View Security Logs",
                "Archive Old Logs",
                "Download CSV",
                "Open Investigation",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-blue-500 hover:bg-blue-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <div className="flex justify-center">

              <FileText
                size={40}
                className="text-blue-600"
              />

            </div>

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Audit & Compliance Center

            </h2>

            <p className="mt-3 text-gray-500">

              Maintain complete transparency across every module with
              centralized audit logging, compliance monitoring, AI-powered
              insights, and enterprise reporting.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">

                Export Compliance Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Audit Dashboard

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                View Archived Logs

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Audit & Compliance Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}