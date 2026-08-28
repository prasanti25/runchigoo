import Navbar from "../../components/Navbar.jsx";

import {
  Settings,
  ShieldCheck,
  Database,
  Globe,
  CreditCard,
  Mail,
  KeyRound,
  Cloud,
  Search,
  Filter,
  Download,
  TrendingUp,
  Save,
} from "lucide-react";

export default function SystemConfigurationCenter() {

  const stats = [
    {
      title: "Configurations",
      value: "248",
      icon: Settings,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "API Integrations",
      value: "36",
      icon: Globe,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Security Policies",
      value: "48",
      icon: ShieldCheck,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Cloud Services",
      value: "18",
      icon: Cloud,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const configs = [
    {
      name: "Environment",
      value: "Production",
      status: "Active",
    },
    {
      name: "Payment Gateway",
      value: "Razorpay",
      status: "Connected",
    },
    {
      name: "Firebase",
      value: "Enabled",
      status: "Running",
    },
    {
      name: "Redis Cache",
      value: "Cluster",
      status: "Healthy",
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

                System Configuration Center

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Configure platform-wide services, environment
                settings, APIs, cloud infrastructure,
                authentication, payment gateways, messaging,
                storage and enterprise integrations from one
                centralized control center.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">

              <Save size={20} />

              Save Configuration

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
                  placeholder="Search configuration..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-indigo-500"
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

          {/* Configuration Overview */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                Configuration Registry

              </h2>

              <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-600">

                {configs.length} Services

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Configuration</th>

                    <th className="px-4 py-4">Value</th>

                    <th className="px-4 py-4">Status</th>

                    <th className="px-4 py-4">Action</th>

                  </tr>

                </thead>

                <tbody>

                  {configs.map((config) => (

                    <tr
                      key={config.name}
                      className="border-b transition hover:bg-indigo-50"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {config.name}

                      </td>

                      <td className="px-4 py-5">

                        {config.value}

                      </td>

                      <td className="px-4 py-5">

                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">

                          {config.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-indigo-100 px-4 py-2 text-indigo-700 hover:bg-indigo-200">

                          Configure

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Environment & Database */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Globe className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Environment Variables

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Application Mode", "Production"],
                  ["Debug Mode", "Disabled"],
                  ["Server Region", "Asia South"],
                  ["Timezone", "Asia/Kolkata"],
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

                <Database className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Database & Cache

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["PostgreSQL", "Healthy"],
                  ["Redis Cache", "Running"],
                  ["Database Replicas", "3"],
                  ["Automatic Backup", "Enabled"],
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

          {/* Payment & Communication */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <CreditCard className="text-emerald-600" />

                <h2 className="text-2xl font-bold">

                  Payment Gateway

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Razorpay", "Connected"],
                  ["Stripe", "Standby"],
                  ["PayPal", "Enabled"],
                  ["Webhook Status", "Active"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-emerald-600">

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

                  Email & SMS Gateway

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["SMTP Server", "Connected"],
                  ["SendGrid", "Enabled"],
                  ["Twilio SMS", "Running"],
                  ["OTP Delivery", "99.9%"],
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

          {/* API & Cloud */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <KeyRound className="text-amber-600" />

                <h2 className="text-2xl font-bold">

                  API Keys & Integrations

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Google Maps API", "Connected"],
                  ["Firebase API", "Connected"],
                  ["OpenAI API", "Configured"],
                  ["Cloudinary", "Active"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-amber-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Cloud className="text-purple-600" />

                <h2 className="text-2xl font-bold">

                  Cloud Storage & CDN

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["AWS S3", "Connected"],
                  ["CloudFront CDN", "Enabled"],
                  ["Storage Usage", "2.8 TB"],
                  ["CDN Cache Hit", "96.5%"],
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

          {/* Infrastructure Management */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Infrastructure Management */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Cloud className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Infrastructure Management

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Application Servers", "24 Running"],
                  ["Kubernetes Cluster", "Healthy"],
                  ["Load Balancers", "6 Active"],
                  ["Container Instances", "148"],
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

            {/* System Performance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <TrendingUp className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  System Performance

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["CPU Usage", "38%"],
                  ["Memory Usage", "64%"],
                  ["API Response Time", "124 ms"],
                  ["System Uptime", "99.99%"],
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

          {/* Security & Compliance */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <ShieldCheck className="text-red-600" />

              <h2 className="text-2xl font-bold">

                Security & Compliance Overview

              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {[
                ["Security Policies", "48"],
                ["Blocked Threats", "1,286"],
                ["SSL Certificates", "Valid"],
                ["Compliance Score", "99.6%"],
              ].map(([title, value]) => (

                <div
                  key={title}
                  className="rounded-2xl border p-6 text-center"
                >

                  <h3 className="text-gray-500">

                    {title}

                  </h3>

                  <p className="mt-3 text-2xl font-bold text-red-600">

                    {value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* AI Configuration Recommendations */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 p-8 text-white">

            <div className="flex items-center gap-3">

              <Settings size={34} />

              <h2 className="text-3xl font-bold">

                AI Configuration Recommendations

              </h2>

            </div>

            <p className="mt-4 text-indigo-100">

              AI continuously monitors your infrastructure,
              configuration settings, API integrations,
              databases, cloud resources and platform health
              to recommend optimizations, security improvements,
              cost savings and performance enhancements.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Optimization Score",
                  value: "98.4%",
                },
                {
                  title: "Cost Reduction",
                  value: "₹4.2L / Month",
                },
                {
                  title: "Performance Gain",
                  value: "+18%",
                },
                {
                  title: "Security Rating",
                  value: "A+",
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

          {/* Quick Configuration Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Configuration Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Save Configuration",
                "Restart Services",
                "Deploy Updates",
                "Run Health Check",
                "Backup Database",
                "Rotate API Keys",
                "Clear Cache",
                "Export Configuration",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-indigo-500 hover:bg-indigo-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Enterprise Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <Settings
              size={44}
              className="mx-auto text-indigo-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise System Configuration Center

            </h2>

            <p className="mt-3 text-gray-500 max-w-4xl mx-auto">

              Centralized administration for the complete
              RuchiGo ecosystem including infrastructure,
              cloud services, databases, APIs, payment gateways,
              authentication, messaging services, monitoring,
              backups, security and enterprise integrations.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">

                Save Configuration

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Run Diagnostics

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Export Settings

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise System Configuration Center

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}