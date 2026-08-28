import Navbar from "../../components/Navbar.jsx";

import {
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
  Wifi,
  Search,
  Filter,
  Download,
  TrendingUp,
  ShieldCheck,
  Gauge,
} from "lucide-react";

export default function SystemHealth() {

  const stats = [
    {
      title: "System Health",
      value: "99.98%",
      icon: ShieldCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Active Servers",
      value: "48",
      icon: Server,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "CPU Load",
      value: "42%",
      icon: Cpu,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Network Uptime",
      value: "99.99%",
      icon: Wifi,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const servers = [
    {
      name: "Production-01",
      location: "Mumbai",
      uptime: "99.99%",
      status: "Healthy",
    },
    {
      name: "Production-02",
      location: "Hyderabad",
      uptime: "99.98%",
      status: "Healthy",
    },
    {
      name: "Analytics",
      location: "Bangalore",
      uptime: "99.92%",
      status: "Warning",
    },
    {
      name: "Backup",
      location: "Chennai",
      uptime: "100%",
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

                System Health

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Monitor servers, CPU, memory, storage,
                containers, network traffic, uptime,
                infrastructure performance and overall
                platform stability.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">

              <Activity size={20} />

              Live Diagnostics

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
                  size={20}
                  className="absolute left-4 top-3.5 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search servers..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-emerald-500"
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

          {/* Infrastructure Status */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                Infrastructure Status

              </h2>

              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-600">

                {servers.length} Active Servers

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Server</th>
                    <th className="px-4 py-4">Location</th>
                    <th className="px-4 py-4">Uptime</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {servers.map((server) => (

                    <tr
                      key={server.name}
                      className="border-b transition hover:bg-emerald-50"
                    >

                      <td className="px-4 py-5">

                        <div className="flex items-center gap-3">

                          <div className="rounded-xl bg-emerald-100 p-3">

                            <Server
                              size={22}
                              className="text-emerald-600"
                            />

                          </div>

                          <span className="font-semibold">

                            {server.name}

                          </span>

                        </div>

                      </td>

                      <td className="px-4 py-5">

                        {server.location}

                      </td>

                      <td className="px-4 py-5">

                        {server.uptime}

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

                        <button className="rounded-lg bg-emerald-100 px-4 py-2 text-emerald-600 hover:bg-emerald-200">

                          Monitor

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* CPU & Memory */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Cpu className="text-orange-600" />

                <h2 className="text-2xl font-bold">

                  CPU Monitoring

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Application Servers", "42%"],
                  ["Database Servers", "58%"],
                  ["Analytics Cluster", "71%"],
                  ["Backup Server", "24%"],
                ].map(([server, usage]) => (

                  <div key={server}>

                    <div className="mb-2 flex justify-between">

                      <span>{server}</span>

                      <span className="font-semibold text-orange-600">

                        {usage}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-orange-500"
                        style={{ width: usage }}
                      ></div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <MemoryStick className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Memory Usage

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Application Memory", "64%"],
                  ["Database Cache", "72%"],
                  ["Analytics Memory", "48%"],
                  ["System Reserved", "18%"],
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

          </div>

          {/* Disk Usage & Network */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <HardDrive className="text-purple-600" />

                <h2 className="text-2xl font-bold">

                  Disk Usage

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["SSD Cluster", "2.4 TB / 4 TB"],
                  ["Backup Storage", "8.1 TB / 12 TB"],
                  ["Logs Storage", "860 GB / 1 TB"],
                  ["Media Storage", "4.6 TB / 6 TB"],
                ].map(([disk, usage]) => (

                  <div
                    key={disk}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{disk}</span>

                    <span className="font-semibold text-purple-600">

                      {usage}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">

              <div className="mb-6 flex items-center gap-3">

                <Wifi />

                <h2 className="text-2xl font-bold">

                  Network Monitoring

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Bandwidth Usage", "7.8 Gbps"],
                  ["Incoming Traffic", "3.2 Gbps"],
                  ["Outgoing Traffic", "4.6 Gbps"],
                  ["Packet Loss", "0.02%"],
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

          </div>

          {/* Docker & Kubernetes */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Docker Container Status */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Server className="text-cyan-600" />

                <h2 className="text-2xl font-bold">

                  Docker Containers

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["API Gateway", "Running"],
                  ["Authentication Service", "Running"],
                  ["Payment Service", "Running"],
                  ["Analytics Service", "Restarting"],
                  ["Notification Service", "Running"],
                ].map(([container, status]) => (

                  <div
                    key={container}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {container}

                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        status === "Running"
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

            {/* Kubernetes Cluster */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Gauge className="text-indigo-600" />

                <h2 className="text-2xl font-bold">

                  Kubernetes Cluster

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Master Nodes", "3 Online"],
                  ["Worker Nodes", "12 Online"],
                  ["Running Pods", "286"],
                  ["Cluster Health", "99.9%"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-indigo-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Infrastructure Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 p-8 text-white">

            <h2 className="text-3xl font-bold">

              AI Infrastructure Insights

            </h2>

            <p className="mt-3 text-green-100">

              AI continuously monitors infrastructure performance,
              predicts hardware failures, detects resource bottlenecks,
              recommends scaling actions, and optimizes workloads.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Infrastructure Score",
                  value: "99.8%",
                },
                {
                  title: "Predicted Issues",
                  value: "3",
                },
                {
                  title: "Auto Optimizations",
                  value: "42",
                },
                {
                  title: "AI Confidence",
                  value: "99.5%",
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

          {/* Critical Alerts */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Critical Alerts

            </h2>

            <div className="mt-8 space-y-4">

              {[
                "Analytics Service memory usage exceeded 85%.",
                "Payment Service container restarted automatically.",
                "SSD Cluster storage reached 82% capacity.",
                "Scheduled maintenance window starts at 02:00 AM.",
              ].map((alert) => (

                <div
                  key={alert}
                  className="flex items-center gap-4 rounded-2xl border p-5"
                >

                  <ShieldCheck
                    size={22}
                    className="text-red-500"
                  />

                  <span>{alert}</span>

                </div>

              ))}

            </div>

          </div>

          {/* Quick Maintenance */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Maintenance Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Restart Services",
                "Scale Servers",
                "Restart Containers",
                "Deploy Updates",
                "Clear Cache",
                "Backup System",
                "Infrastructure Report",
                "Maintenance Mode",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-emerald-500 hover:bg-emerald-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <Server
              size={42}
              className="mx-auto text-emerald-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Infrastructure Control Center

            </h2>

            <p className="mt-3 text-gray-500">

              Monitor servers, containers, Kubernetes clusters,
              CPU, memory, storage, network traffic, uptime,
              AI insights, and enterprise infrastructure health
              from a centralized dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">

                Export Infrastructure Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                System Dashboard

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Maintenance History

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Infrastructure Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}