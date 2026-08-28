import Navbar from "../../components/Navbar.jsx";

import {
  Globe,
  KeyRound,
  Activity,
  Server,
  Search,
  Filter,
  Download,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Wifi,
  Link,
} from "lucide-react";

export default function APIManagement() {

  const stats = [
    {
      title: "Active APIs",
      value: "148",
      icon: Globe,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "API Requests",
      value: "4.2M",
      icon: Activity,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Response Time",
      value: "126 ms",
      icon: Wifi,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Success Rate",
      value: "99.98%",
      icon: ShieldCheck,
      color: "bg-red-100 text-red-600",
    },
  ];

  const apis = [
    {
      name: "Authentication API",
      endpoint: "/api/auth",
      method: "POST",
      status: "Healthy",
    },
    {
      name: "Orders API",
      endpoint: "/api/orders",
      method: "GET",
      status: "Healthy",
    },
    {
      name: "Payments API",
      endpoint: "/api/payments",
      method: "POST",
      status: "Warning",
    },
    {
      name: "Restaurant API",
      endpoint: "/api/restaurants",
      method: "GET",
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

                API Management

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Monitor API performance, gateway health,
                traffic, authentication, rate limiting,
                API keys, and enterprise integrations.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-700">

              <Link size={20} />

              Create API

            </button>

          </div>

          {/* KPI */}

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
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  placeholder="Search APIs..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-cyan-500"
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

          {/* API Gateway */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                API Gateway Endpoints

              </h2>

              <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-600">

                {apis.length} Active Endpoints

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">API</th>
                    <th className="px-4 py-4">Endpoint</th>
                    <th className="px-4 py-4">Method</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {apis.map((api) => (

                    <tr
                      key={api.name}
                      className="border-b transition hover:bg-cyan-50"
                    >

                      <td className="px-4 py-5">

                        <div className="flex items-center gap-3">

                          <div className="rounded-xl bg-cyan-100 p-3">

                            <Globe
                              size={22}
                              className="text-cyan-600"
                            />

                          </div>

                          <span className="font-semibold">

                            {api.name}

                          </span>

                        </div>

                      </td>

                      <td className="px-4 py-5 font-mono text-sm">

                        {api.endpoint}

                      </td>

                      <td className="px-4 py-5">

                        <span className="rounded-lg bg-gray-100 px-3 py-1 font-semibold">

                          {api.method}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            api.status === "Healthy"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >

                          {api.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-cyan-100 px-4 py-2 text-cyan-600 hover:bg-cyan-200">

                          Manage

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* API Key Management & Gateway Health */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <KeyRound className="text-yellow-600" />

                <h2 className="text-2xl font-bold">

                  API Key Management

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Google Maps API", "Active"],
                  ["Stripe API", "Active"],
                  ["Firebase API", "Active"],
                  ["OpenAI API", "Rotation Due"],
                ].map(([name, status]) => (

                  <div
                    key={name}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {name}

                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-700"
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

                <Server className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Gateway Health

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Gateway Uptime", "99.99%"],
                  ["Load Balancer", "Healthy"],
                  ["SSL Certificates", "Valid"],
                  ["CDN Status", "Operational"],
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

          {/* Request Monitoring & Rate Limiting */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 p-8 text-white">

              <div className="mb-6 flex items-center gap-3">

                <Activity />

                <h2 className="text-2xl font-bold">

                  Request Monitoring

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Requests / Minute", "24,680"],
                  ["Average Latency", "126 ms"],
                  ["Peak Traffic", "81K/min"],
                  ["Success Requests", "99.98%"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="rounded-2xl bg-white/10 p-5 backdrop-blur"
                  >

                    <div className="flex justify-between">

                      <span>{title}</span>

                      <span className="font-bold">

                        {value}

                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <BarChart3 className="text-purple-600" />

                <h2 className="text-2xl font-bold">

                  Rate Limiting

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Authentication API", "1000 req/min"],
                  ["Orders API", "5000 req/min"],
                  ["Payments API", "2000 req/min"],
                  ["Restaurant API", "8000 req/min"],
                ].map(([api, limit]) => (

                  <div
                    key={api}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {api}

                    </span>

                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-600">

                      {limit}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Error Monitoring */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Error Monitoring */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <ShieldCheck className="text-red-600" />

                <h2 className="text-2xl font-bold">

                  Error Monitoring

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["500 Internal Server Errors", "14"],
                  ["401 Unauthorized", "38"],
                  ["404 Not Found", "92"],
                  ["429 Rate Limit", "27"],
                  ["Timeout Errors", "9"],
                ].map(([error, count]) => (

                  <div
                    key={error}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{error}</span>

                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">

                      {count}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* API Usage Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <BarChart3 className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  API Usage Analytics

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Daily Requests", "4.2 Million"],
                  ["Peak Hour", "08:00 PM"],
                  ["Unique Clients", "18,426"],
                  ["Bandwidth Used", "2.8 TB"],
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

          {/* AI Traffic Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-700 p-8 text-white">

            <h2 className="text-3xl font-bold">

              AI Traffic Insights

            </h2>

            <p className="mt-3 text-cyan-100">

              Artificial Intelligence continuously analyzes API traffic,
              predicts traffic spikes, detects abnormal request patterns,
              optimizes routing, and improves response performance.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Traffic Health",
                  value: "99.8%",
                },
                {
                  title: "Threat Requests",
                  value: "143",
                },
                {
                  title: "Optimized Routes",
                  value: "96%",
                },
                {
                  title: "AI Confidence",
                  value: "99.4%",
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

              Quick API Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Create API",
                "Generate API Key",
                "Rotate Keys",
                "Restart Gateway",
                "Export Logs",
                "View Documentation",
                "Configure Rate Limits",
                "Traffic Report",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-cyan-500 hover:bg-cyan-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <Globe
              size={42}
              className="mx-auto text-cyan-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise API Control Center

            </h2>

            <p className="mt-3 text-gray-500">

              Monitor APIs, manage gateways, secure integrations,
              optimize traffic, analyze performance, and ensure
              reliable communication across the RuchiGo ecosystem.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-700">

                Export API Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Gateway Dashboard

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                API Documentation

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise API Management Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}