import Navbar from "../../components/Navbar.jsx";

import {
  Activity,
  Cpu,
  Database,
  Wifi,
  Users,
  Building2,
  Bike,
  Search,
  Filter,
  Download,
  TrendingUp,
} from "lucide-react";

export default function PlatformMonitoring() {

  const stats = [
    {
      title: "Platform Uptime",
      value: "99.98%",
      icon: Activity,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Active Users",
      value: "84,256",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Restaurants Online",
      value: "4,528",
      icon: Building2,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Live Deliveries",
      value: "1,246",
      icon: Bike,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const servers = [
    {
      name: "Authentication Server",
      status: "Healthy",
      cpu: "28%",
      ram: "46%",
      response: "82 ms",
    },
    {
      name: "API Gateway",
      status: "Healthy",
      cpu: "34%",
      ram: "51%",
      response: "96 ms",
    },
    {
      name: "Database Cluster",
      status: "Warning",
      cpu: "74%",
      ram: "69%",
      response: "145 ms",
    },
    {
      name: "Notification Service",
      status: "Healthy",
      cpu: "18%",
      ram: "37%",
      response: "65 ms",
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

                Platform Monitoring

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Monitor servers, APIs, databases, live users, deliveries,
                infrastructure health, and platform performance in real time.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

              <Download size={20} />

              Export Report

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
                  placeholder="Search services..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-orange-500"
                />

              </div>

              <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100">

                <Filter size={18} />

                Filter

              </button>

            </div>

          </div>

          {/* Infrastructure Status */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                Infrastructure Status
              </h2>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-600">

                All Services Monitored

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Service</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">CPU</th>
                    <th className="px-4 py-4">RAM</th>
                    <th className="px-4 py-4">Response</th>
                    <th className="px-4 py-4">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {servers.map((server) => (

                    <tr
                      key={server.name}
                      className="border-b transition hover:bg-orange-50"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {server.name}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            server.status === "Healthy"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >

                          {server.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        {server.cpu}

                      </td>

                      <td className="px-4 py-5">

                        {server.ram}

                      </td>

                      <td className="px-4 py-5">

                        {server.response}

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-blue-100 px-4 py-2 text-blue-600 hover:bg-blue-200">

                          Details

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Resource Monitoring */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="flex items-center gap-3">

                <Cpu className="text-orange-500" />

                <h2 className="text-2xl font-bold">

                  CPU Utilization

                </h2>

              </div>

              <div className="mt-8 space-y-6">

                {[
                  ["API Gateway", "34%"],
                  ["Authentication", "28%"],
                  ["Order Service", "42%"],
                  ["Notification", "18%"],
                  ["Analytics", "51%"],
                ].map(([name, value]) => (

                  <div key={name}>

                    <div className="mb-2 flex justify-between">

                      <span>{name}</span>

                      <span className="font-semibold text-orange-600">

                        {value}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-orange-500"
                        style={{ width: value }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="flex items-center gap-3">

                <Database className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Database Health

                </h2>

              </div>

              <div className="mt-8 space-y-6">

                {[
                  {
                    title: "Storage Used",
                    value: "72%",
                  },
                  {
                    title: "Connections",
                    value: "486",
                  },
                  {
                    title: "Queries/sec",
                    value: "2,148",
                  },
                  {
                    title: "Replication",
                    value: "Healthy",
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

          {/* API Monitoring */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="flex items-center gap-3">

                <Wifi className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  API Response Time

                </h2>

              </div>

              <div className="mt-8 space-y-5">

                {[
                  ["Login API", "82 ms"],
                  ["Restaurant API", "95 ms"],
                  ["Orders API", "103 ms"],
                  ["Payments API", "118 ms"],
                  ["Delivery API", "87 ms"],
                ].map(([api, time]) => (

                  <div
                    key={api}
                    className="flex items-center justify-between rounded-2xl border p-4"
                  >

                    <span className="font-medium">

                      {api}

                    </span>

                    <span className="font-bold text-blue-600">

                      {time}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white">

              <h2 className="text-2xl font-bold">

                Live Platform Overview

              </h2>

              <div className="mt-8 space-y-5">

                {[
                  "84,256 Active Users",
                  "4,528 Restaurants Online",
                  "1,246 Active Deliveries",
                  "99.98% Platform Uptime",
                  "No Critical Incidents",
                ].map((item) => (

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

          {/* Incident Monitoring */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Incident Center */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Incident Center
              </h2>

              <div className="mt-8 space-y-4">

                {[
                  {
                    title: "Database CPU Spike",
                    level: "Medium",
                    time: "5 mins ago",
                  },
                  {
                    title: "Payment Gateway Latency",
                    level: "Low",
                    time: "18 mins ago",
                  },
                  {
                    title: "API Gateway Restart",
                    level: "Resolved",
                    time: "1 hour ago",
                  },
                  {
                    title: "Notification Queue Delay",
                    level: "Resolved",
                    time: "3 hours ago",
                  },
                ].map((incident) => (

                  <div
                    key={incident.title}
                    className="flex items-center justify-between rounded-2xl border p-5 hover:bg-orange-50"
                  >

                    <div>

                      <h3 className="font-semibold">

                        {incident.title}

                      </h3>

                      <p className="text-sm text-gray-500">

                        {incident.time}

                      </p>

                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        incident.level === "Resolved"
                          ? "bg-green-100 text-green-600"
                          : incident.level === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >

                      {incident.level}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Regional Traffic */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Regional Traffic
              </h2>

              <div className="mt-8 space-y-6">

                {[
                  ["Hyderabad", "24%"],
                  ["Bengaluru", "20%"],
                  ["Mumbai", "18%"],
                  ["Chennai", "15%"],
                  ["Delhi", "13%"],
                  ["Others", "10%"],
                ].map(([city, value]) => (

                  <div key={city}>

                    <div className="mb-2 flex justify-between">

                      <span>{city}</span>

                      <span className="font-semibold text-orange-600">

                        {value}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-orange-500"
                        style={{ width: value }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Health Monitoring */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-8 text-white">

            <h2 className="text-3xl font-bold">

              AI Health Monitoring

            </h2>

            <p className="mt-3 text-blue-100">

              AI continuously monitors platform health and predicts issues before
              they affect customers.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Health Score",
                  value: "98%",
                },
                {
                  title: "Predicted Issues",
                  value: "2",
                },
                {
                  title: "Critical Alerts",
                  value: "0",
                },
                {
                  title: "Recovery Success",
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

          {/* Quick Operations */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Operations

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Restart Services",
                "Scale Servers",
                "Backup Database",
                "View Logs",
                "API Diagnostics",
                "Network Status",
                "Generate Report",
                "Maintenance Mode",
              ].map((item) => (

                <button
                  key={item}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-orange-500 hover:bg-orange-50"
                >

                  {item}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <h2 className="text-2xl font-bold">

              Enterprise Platform Monitoring

            </h2>

            <p className="mt-3 text-gray-500">

              Monitor infrastructure, servers, APIs, databases, traffic,
              incidents, and platform health from one centralized operations
              dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

                Export Monitoring Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                View System Logs

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Incident History

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Monitoring & Infrastructure Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}