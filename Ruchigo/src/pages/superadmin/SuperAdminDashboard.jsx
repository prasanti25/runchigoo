import Navbar from "../../components/Navbar.jsx";

import {
  ShieldCheck,
  Users,
  Store,
  Bike,
  IndianRupee,
  ShoppingBag,
  Server,
  Activity,
  Brain,
  Bell,
  Settings,
  ArrowUpRight,
} from "lucide-react";

export default function SuperAdminDashboard() {

  const stats = [
    {
      title: "Platform Revenue",
      value: "₹3.82 Cr",
      icon: IndianRupee,
      color: "bg-green-100 text-green-600",
      growth: "+18%",
    },
    {
      title: "Total Orders",
      value: "8,74,200",
      icon: ShoppingBag,
      color: "bg-orange-100 text-orange-600",
      growth: "+12%",
    },
    {
      title: "Customers",
      value: "2,41,590",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      growth: "+8%",
    },
    {
      title: "Restaurants",
      value: "4,812",
      icon: Store,
      color: "bg-pink-100 text-pink-600",
      growth: "+6%",
    },
    {
      title: "Delivery Partners",
      value: "12,946",
      icon: Bike,
      color: "bg-yellow-100 text-yellow-600",
      growth: "+10%",
    },
    {
      title: "Platform Admins",
      value: "42",
      icon: ShieldCheck,
      color: "bg-purple-100 text-purple-600",
      growth: "+2",
    },
    {
      title: "Active Servers",
      value: "18",
      icon: Server,
      color: "bg-cyan-100 text-cyan-600",
      growth: "100%",
    },
    {
      title: "AI Services",
      value: "14 Running",
      icon: Brain,
      color: "bg-indigo-100 text-indigo-600",
      growth: "Healthy",
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

              <h1 className="mt-2 text-4xl font-bold text-gray-900">
                Global Command Center
              </h1>

              <p className="mt-3 text-gray-500 max-w-3xl">
                Monitor every aspect of the RuchiGo ecosystem including
                infrastructure, revenue, AI services, restaurants,
                administrators and security from one centralized dashboard.
              </p>

            </div>

            <div className="flex gap-4">

              <button className="rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

                <span className="flex items-center gap-2">

                  <Bell size={18} />

                  Alerts

                </span>

              </button>

              <button className="rounded-2xl border px-6 py-3 font-semibold hover:bg-gray-100">

                <span className="flex items-center gap-2">

                  <Settings size={18} />

                  Settings

                </span>

              </button>

            </div>

          </div>

          {/* Statistics */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {stats.map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.title}
                  className="rounded-3xl bg-white p-6 shadow-sm hover:-translate-y-1 transition"
                >

                  <div className="flex items-center justify-between">

                    <div
                      className={`rounded-2xl p-4 ${item.color}`}
                    >

                      <Icon size={28} />

                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">

                      {item.growth}

                    </span>

                  </div>

                  <h3 className="mt-6 text-gray-500">
                    {item.title}
                  </h3>

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {item.value}
                  </h2>

                </div>

              );

            })}

          </div>

          {/* Platform Monitoring */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-3">

            {/* Infrastructure Status */}

            <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm">

              <div className="flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                  Platform Monitoring
                </h2>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-600">
                  ● All Systems Operational
                </span>

              </div>

              <div className="mt-8 space-y-6">

                {[
                  {
                    service: "Application Servers",
                    value: "94%",
                    width: "94%",
                    color: "bg-green-500",
                  },
                  {
                    service: "Database Cluster",
                    value: "81%",
                    width: "81%",
                    color: "bg-blue-500",
                  },
                  {
                    service: "API Gateway",
                    value: "88%",
                    width: "88%",
                    color: "bg-orange-500",
                  },
                  {
                    service: "Redis Cache",
                    value: "73%",
                    width: "73%",
                    color: "bg-purple-500",
                  },
                  {
                    service: "Storage Usage",
                    value: "67%",
                    width: "67%",
                    color: "bg-pink-500",
                  },
                ].map((item) => (

                  <div key={item.service}>

                    <div className="mb-2 flex justify-between">

                      <span className="font-medium">
                        {item.service}
                      </span>

                      <span className="font-semibold">
                        {item.value}
                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className={`h-3 rounded-full ${item.color}`}
                        style={{ width: item.width }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* System Health */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                System Health
              </h2>

              <div className="mt-8 space-y-5">

                {[
                  {
                    title: "CPU Usage",
                    value: "38%",
                    color: "text-green-600",
                  },
                  {
                    title: "Memory Usage",
                    value: "62%",
                    color: "text-blue-600",
                  },
                  {
                    title: "Disk Usage",
                    value: "54%",
                    color: "text-orange-600",
                  },
                  {
                    title: "Network",
                    value: "Healthy",
                    color: "text-green-600",
                  },
                  {
                    title: "Response Time",
                    value: "148 ms",
                    color: "text-purple-600",
                  },
                ].map((item) => (

                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border p-4"
                  >

                    <span className="font-medium">
                      {item.title}
                    </span>

                    <span className={`font-bold ${item.color}`}>
                      {item.value}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Control Center */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-3xl font-bold">
                  AI Control Center
                </h2>

                <p className="mt-2 text-indigo-100">
                  Monitor all AI-powered services running across the platform.
                </p>

              </div>

              <button className="rounded-2xl bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-gray-100">

                View AI Dashboard

              </button>

            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Food Recommendation AI",
                  status: "Running",
                },
                {
                  title: "Fraud Detection",
                  status: "Protected",
                },
                {
                  title: "Demand Prediction",
                  status: "Learning",
                },
                {
                  title: "Customer Chatbot",
                  status: "Online",
                },
              ].map((item) => (

                <div
                  key={item.title}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur"
                >

                  <Brain size={34} />

                  <h3 className="mt-5 text-lg font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-indigo-100">
                    Current Status
                  </p>

                  <span className="mt-5 inline-flex rounded-full bg-green-500 px-4 py-2 text-sm font-semibold">

                    {item.status}

                  </span>

                </div>

              ))}

            </div>

          </div>

          {/* Security Overview */}

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {[
              {
                title: "Blocked Attacks",
                value: "2,143",
                icon: ShieldCheck,
              },
              {
                title: "Failed Logins",
                value: "318",
                icon: Activity,
              },
              {
                title: "Active Sessions",
                value: "14,728",
                icon: Users,
              },
              {
                title: "System Uptime",
                value: "99.98%",
                icon: ArrowUpRight,
              },
            ].map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.title}
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >

                  <div className="flex items-center justify-between">

                    <Icon
                      className="text-red-500"
                      size={28}
                    />

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-600">

                      Stable

                    </span>

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

          {/* Global Analytics */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-3">

            {/* Revenue Analytics */}

            <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm">

              <div className="flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                  Global Revenue Analytics
                </h2>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-600">

                  +21.4% This Month

                </span>

              </div>

              <div className="mt-8 space-y-6">

                {[
                  { month: "January", revenue: "₹2.1 Cr", width: "52%" },
                  { month: "February", revenue: "₹2.4 Cr", width: "61%" },
                  { month: "March", revenue: "₹2.8 Cr", width: "69%" },
                  { month: "April", revenue: "₹3.0 Cr", width: "75%" },
                  { month: "May", revenue: "₹3.3 Cr", width: "83%" },
                  { month: "June", revenue: "₹3.8 Cr", width: "96%" },
                ].map((item) => (

                  <div key={item.month}>

                    <div className="mb-2 flex justify-between">

                      <span className="font-medium">
                        {item.month}
                      </span>

                      <span className="font-bold">
                        {item.revenue}
                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-orange-500"
                        style={{ width: item.width }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Regional Performance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Regional Performance
              </h2>

              <div className="mt-8 space-y-5">

                {[
                  ["Hyderabad", "98%"],
                  ["Bengaluru", "95%"],
                  ["Chennai", "91%"],
                  ["Mumbai", "89%"],
                  ["Pune", "86%"],
                ].map(([city, value]) => (

                  <div
                    key={city}
                    className="flex items-center justify-between rounded-2xl border p-4"
                  >

                    <span className="font-medium">
                      {city}
                    </span>

                    <span className="font-bold text-green-600">
                      {value}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Business Performance */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Top Restaurants */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Top Restaurants
              </h2>

              <div className="mt-8 space-y-4">

                {[
                  ["Paradise Biryani", "₹42.8L"],
                  ["Mehfil", "₹39.6L"],
                  ["KFC", "₹35.4L"],
                  ["Domino's", "₹34.2L"],
                  ["Burger King", "₹31.8L"],
                ].map(([name, revenue]) => (

                  <div
                    key={name}
                    className="flex items-center justify-between rounded-2xl border p-5 hover:bg-orange-50 transition"
                  >

                    <div>

                      <h3 className="font-semibold">
                        {name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Monthly Revenue
                      </p>

                    </div>

                    <span className="font-bold text-orange-600">
                      {revenue}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Top Delivery Partners */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Top Delivery Partners
              </h2>

              <div className="mt-8 space-y-4">

                {[
                  ["Rahul Kumar", "1,284 Orders"],
                  ["Amit Singh", "1,197 Orders"],
                  ["Ravi Teja", "1,155 Orders"],
                  ["Suresh Kumar", "1,094 Orders"],
                  ["Akash Patel", "1,048 Orders"],
                ].map(([name, orders]) => (

                  <div
                    key={name}
                    className="flex items-center justify-between rounded-2xl border p-5 hover:bg-blue-50 transition"
                  >

                    <div>

                      <h3 className="font-semibold">
                        {name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Completed Deliveries
                      </p>

                    </div>

                    <span className="font-bold text-blue-600">
                      {orders}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Recent Activities & Quick Actions */}

          <div className="mt-10 grid gap-8 lg:grid-cols-3">

            {/* Recent Activities */}

            <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Recent Platform Activities
              </h2>

              <div className="mt-8 space-y-4">

                {[
                  "✅ New restaurant approved in Hyderabad.",
                  "🚚 52 delivery partners joined today.",
                  "💳 Payment gateway settlement completed.",
                  "🤖 AI Fraud Detection blocked 18 suspicious transactions.",
                  "👤 New Super Admin created.",
                  "📊 Revenue crossed ₹3.8 Cr this month.",
                ].map((activity, index) => (

                  <div
                    key={index}
                    className="rounded-2xl border-l-4 border-orange-500 bg-orange-50 p-4"
                  >

                    {activity}

                  </div>

                ))}

              </div>

            </div>

            {/* Quick Actions */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Quick Actions
              </h2>

              <div className="mt-8 space-y-4">

                {[
                  "Create Admin",
                  "Approve Restaurant",
                  "Suspend Account",
                  "Generate Report",
                  "Open Security Center",
                  "Launch Maintenance Mode",
                ].map((action) => (

                  <button
                    key={action}
                    className="w-full rounded-2xl bg-orange-500 px-5 py-4 font-semibold text-white transition hover:bg-orange-600"
                  >

                    {action}

                  </button>

                ))}

              </div>

            </div>

          </div>

          {/* Executive Insights */}
                    <div className="mt-10 rounded-3xl bg-gradient-to-r from-slate-900 via-gray-900 to-black p-8 text-white">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-orange-400 font-semibold">
                  AI Executive Intelligence
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Executive Insights
                </h2>

                <p className="mt-3 max-w-3xl text-gray-300">
                  AI continuously analyzes platform activity, predicts business
                  growth, identifies risks, and recommends improvements for
                  better operational efficiency.
                </p>

              </div>

              <button className="rounded-2xl bg-orange-500 px-6 py-3 font-semibold hover:bg-orange-600">

                Generate Full Report

              </button>

            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Revenue Forecast",
                  value: "₹4.45 Cr",
                  desc: "Expected next month",
                },
                {
                  title: "Customer Growth",
                  value: "+18%",
                  desc: "Projected increase",
                },
                {
                  title: "Restaurant Expansion",
                  value: "126",
                  desc: "New partners expected",
                },
                {
                  title: "Risk Level",
                  value: "Low",
                  desc: "Platform operating normally",
                },
              ].map((item) => (

                <div
                  key={item.title}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur"
                >

                  <h3 className="text-lg font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-3xl font-bold text-orange-300">
                    {item.value}
                  </p>

                  <p className="mt-2 text-sm text-gray-300">
                    {item.desc}
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Upcoming Events & Recommendations */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Upcoming Events */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Upcoming Platform Events
              </h2>

              <div className="mt-8 space-y-4">

                {[
                  "📅 Scheduled database optimization - Tomorrow 02:00 AM",
                  "🚀 Version 3.0 deployment - Friday",
                  "💳 Monthly restaurant settlement - 28th",
                  "🔒 Security audit - Next Monday",
                  "☁ Full cloud backup - Sunday",
                ].map((event, index) => (

                  <div
                    key={index}
                    className="rounded-2xl border-l-4 border-orange-500 bg-orange-50 p-4"
                  >
                    {event}
                  </div>

                ))}

              </div>

            </div>

            {/* Recommendations */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                AI Recommendations
              </h2>

              <div className="mt-8 space-y-4">

                {[
                  "Increase marketing campaigns in Bengaluru.",
                  "Enable additional caching to reduce API latency.",
                  "Promote top-performing restaurants.",
                  "Recruit delivery partners in high-demand cities.",
                  "Rotate admin API keys within 30 days.",
                ].map((item, index) => (

                  <div
                    key={index}
                    className="rounded-2xl bg-green-50 p-4"
                  >

                    <p className="font-medium text-green-700">
                      ✓ {item}
                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Emergency Controls */}

          <div className="mt-10 rounded-3xl bg-red-50 border border-red-200 p-8">

            <h2 className="text-3xl font-bold text-red-700">
              Emergency Controls
            </h2>

            <p className="mt-3 text-gray-600">
              Use these controls only during critical incidents affecting the
              platform.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              <button className="rounded-2xl bg-red-600 py-4 font-semibold text-white hover:bg-red-700">

                Enable Maintenance

              </button>

              <button className="rounded-2xl bg-orange-500 py-4 font-semibold text-white hover:bg-orange-600">

                Restart Services

              </button>

              <button className="rounded-2xl bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700">

                Restore Backup

              </button>

              <button className="rounded-2xl bg-gray-900 py-4 font-semibold text-white hover:bg-black">

                Contact Infrastructure Team

              </button>

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <h3 className="text-2xl font-bold">
              RuchiGo Super Admin Console
            </h3>

            <p className="mt-3 text-gray-500">
              Enterprise Command Center for managing the complete RuchiGo
              ecosystem with AI-powered insights, infrastructure monitoring,
              security management, and global administration.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

                Export Dashboard

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Download Reports

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                System Documentation

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">
              © 2026 RuchiGo Technologies. All Rights Reserved.
            </p>

          </footer>

        </section>

      </main>

    </>

  );

}