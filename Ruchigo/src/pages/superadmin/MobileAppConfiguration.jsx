import Navbar from "../../components/Navbar.jsx";

import {
  Smartphone,
  TabletSmartphone,
  Download,
  Upload,
  Bell,
  Settings,
  Search,
  Filter,
  TrendingUp,
  Play,
  SmartphoneCharging,
} from "lucide-react";

export default function MobileAppConfiguration() {

  const stats = [
    {
      title: "Android Version",
      value: "v6.2.1",
      icon: Smartphone,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "iOS Version",
      value: "v6.2.0",
      icon: TabletSmartphone,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Devices",
      value: "245K",
      icon: SmartphoneCharging,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Updates Today",
      value: "18.6K",
      icon: Download,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const versions = [
    {
      platform: "Android",
      version: "6.2.1",
      build: "241",
      status: "Live",
    },
    {
      platform: "iOS",
      version: "6.2.0",
      build: "198",
      status: "Live",
    },
    {
      platform: "Android Beta",
      version: "6.3.0",
      build: "252",
      status: "Testing",
    },
    {
      platform: "iOS Beta",
      version: "6.3.0",
      build: "210",
      status: "Testing",
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

                Mobile App Configuration

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Manage Android & iOS applications including app
                versions, feature flags, maintenance mode,
                push notifications, splash screens, remote
                configuration and deployment.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">

              <Upload size={20} />

              Publish Update

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
                  placeholder="Search app versions..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-green-500"
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

          {/* App Versions */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                Application Versions

              </h2>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-600">

                {versions.length} Releases

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Platform</th>

                    <th className="px-4 py-4">Version</th>

                    <th className="px-4 py-4">Build</th>

                    <th className="px-4 py-4">Status</th>

                    <th className="px-4 py-4">Action</th>

                  </tr>

                </thead>

                <tbody>

                  {versions.map((app) => (

                    <tr
                      key={app.platform}
                      className="border-b transition hover:bg-green-50"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {app.platform}

                      </td>

                      <td className="px-4 py-5">

                        {app.version}

                      </td>

                      <td className="px-4 py-5">

                        #{app.build}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            app.status === "Live"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >

                          {app.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-green-100 px-4 py-2 text-green-700 hover:bg-green-200">

                          Manage

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Force Update */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Download className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Force Update Control

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Minimum Android Version", "6.1.0"],
                  ["Minimum iOS Version", "6.0.8"],
                  ["Force Update", "Enabled"],
                  ["Grace Period", "3 Days"],
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

            {/* Maintenance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Settings className="text-orange-600" />

                <h2 className="text-2xl font-bold">

                  Maintenance Mode

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Current Status", "Offline"],
                  ["Scheduled Window", "2:00 AM"],
                  ["Affected Region", "Global"],
                  ["Estimated Duration", "30 Minutes"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-orange-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Feature Flags */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <Play className="text-blue-600" />

              <h2 className="text-2xl font-bold">

                Feature Flags

              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {[
                ["AI Recommendations", "Enabled"],
                ["Voice Search", "Enabled"],
                ["Dark Mode", "Beta"],
                ["Live Order Tracking", "Enabled"],
                ["Referral Program", "Enabled"],
                ["Wallet Payments", "Enabled"],
                ["Drone Delivery", "Testing"],
                ["AR Menu Preview", "Coming Soon"],
              ].map(([title, status]) => (

                <div
                  key={title}
                  className="rounded-2xl border p-6 text-center"
                >

                  <h3 className="text-gray-500">

                    {title}

                  </h3>

                  <p className="mt-3 text-xl font-bold text-blue-600">

                    {status}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Notifications & Branding */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Bell className="text-red-600" />

                <h2 className="text-2xl font-bold">

                  Push Notifications

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Promotional Alerts", "Enabled"],
                  ["Order Notifications", "Enabled"],
                  ["Flash Sale Alerts", "Enabled"],
                  ["Marketing Campaigns", "Scheduled"],
                ].map(([title, status]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-red-600">

                      {status}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Smartphone className="text-purple-600" />

                <h2 className="text-2xl font-bold">

                  Splash Screen & Branding

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Current Theme", "RuchiGo 2026"],
                  ["Splash Screen", "Updated"],
                  ["App Logo", "Latest"],
                  ["Brand Assets", "Synced"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-purple-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Regional Configuration */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Regional Configuration */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <TabletSmartphone className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Regional Configuration

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["India", "Enabled"],
                  ["UAE", "Enabled"],
                  ["Singapore", "Testing"],
                  ["United Kingdom", "Coming Soon"],
                ].map(([country, status]) => (

                  <div
                    key={country}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{country}</span>

                    <span className="font-semibold text-green-600">

                      {status}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* App Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <TrendingUp className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Mobile App Analytics

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Daily Active Users", "182K"],
                  ["Monthly Active Users", "1.2M"],
                  ["Crash Free Rate", "99.95%"],
                  ["Average Session", "14m 28s"],
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

          </div>

          {/* Remote Configuration */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <Settings className="text-indigo-600" />

              <h2 className="text-2xl font-bold">

                Remote Configuration

              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {[
                ["API Endpoint", "Production"],
                ["Cache Duration", "30 Minutes"],
                ["Location Services", "Enabled"],
                ["Remote Config Sync", "Every 15 mins"],
                ["Firebase Config", "Connected"],
                ["Analytics SDK", "Enabled"],
                ["Crash Reporting", "Active"],
                ["Experiment Groups", "6 Running"],
              ].map(([title, value]) => (

                <div
                  key={title}
                  className="rounded-2xl border p-6 text-center"
                >

                  <h3 className="text-gray-500">

                    {title}

                  </h3>

                  <p className="mt-3 text-lg font-bold text-indigo-600">

                    {value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Device Statistics */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 p-8 text-white">

            <div className="flex items-center gap-3">

              <SmartphoneCharging size={32} />

              <h2 className="text-3xl font-bold">

                Device Statistics

              </h2>

            </div>

            <p className="mt-4 text-green-100">

              Monitor application adoption, device compatibility,
              operating system distribution, performance metrics,
              update progress, crash reports and user engagement
              across Android and iOS devices worldwide.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Android Users",
                  value: "72%",
                },
                {
                  title: "iOS Users",
                  value: "28%",
                },
                {
                  title: "Latest Version Adoption",
                  value: "93%",
                },
                {
                  title: "Crash Free Sessions",
                  value: "99.95%",
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

          {/* Quick Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Mobile Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Publish Update",
                "Enable Maintenance",
                "Send Push Notification",
                "Manage Feature Flags",
                "Update Splash Screen",
                "Remote Configuration",
                "View Crash Reports",
                "Export Mobile Analytics",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-green-500 hover:bg-green-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <Smartphone
              size={42}
              className="mx-auto text-green-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Mobile Operations Center

            </h2>

            <p className="mt-3 text-gray-500">

              Configure Android & iOS applications, manage releases,
              feature flags, maintenance mode, remote settings,
              branding, notifications, analytics, regional rollout
              and live application monitoring from one centralized
              dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">

                Publish Update

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Mobile Analytics

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Export Report

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Mobile Operations Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}