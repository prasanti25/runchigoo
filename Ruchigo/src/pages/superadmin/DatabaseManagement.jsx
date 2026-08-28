import Navbar from "../../components/Navbar.jsx";

import {
  Database,
  HardDrive,
  Activity,
  Server,
  Search,
  Filter,
  Download,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Clock,
  BarChart3,
} from "lucide-react";

export default function DatabaseManagement() {

  const stats = [
    {
      title: "Databases",
      value: "12",
      icon: Database,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Storage Used",
      value: "2.4 TB",
      icon: HardDrive,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Queries / Min",
      value: "18.7K",
      icon: Activity,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Server Health",
      value: "99.9%",
      icon: Server,
      color: "bg-red-100 text-red-600",
    },
  ];

  const databases = [
    {
      name: "CustomerDB",
      engine: "PostgreSQL",
      status: "Healthy",
      storage: "540 GB",
    },
    {
      name: "OrdersDB",
      engine: "PostgreSQL",
      status: "Healthy",
      storage: "780 GB",
    },
    {
      name: "PaymentsDB",
      engine: "MySQL",
      status: "Warning",
      storage: "320 GB",
    },
    {
      name: "AnalyticsDB",
      engine: "MongoDB",
      status: "Healthy",
      storage: "860 GB",
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

                Database Management

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Monitor database health, storage utilization,
                replication, backups, indexing, performance,
                and AI-powered optimization across the RuchiGo platform.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">

              <Database size={20}/>

              Backup Database

            </button>

          </div>

          {/* KPI */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {stats.map((item)=>{

              const Icon = item.icon;

              return(

                <div
                  key={item.title}
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >

                  <div className="flex items-center justify-between">

                    <div className={`rounded-2xl p-4 ${item.color}`}>

                      <Icon size={28}/>

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

            <div className="flex flex-col gap-4 lg:flex-row">

              <div className="relative flex-1">

                <Search
                  size={20}
                  className="absolute left-4 top-3.5 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search databases..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-indigo-500"
                />

              </div>

              <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100">

                <Filter size={18}/>

                Filter

              </button>

              <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100">

                <Download size={18}/>

                Export

              </button>

            </div>

          </div>

          {/* Database Table */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                Database Instances

              </h2>

              <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-600">

                {databases.length} Active Databases

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Database</th>
                    <th className="px-4 py-4">Engine</th>
                    <th className="px-4 py-4">Storage</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {databases.map((db) => (

                    <tr
                      key={db.name}
                      className="border-b transition hover:bg-indigo-50"
                    >

                      <td className="px-4 py-5">

                        <div className="flex items-center gap-3">

                          <div className="rounded-xl bg-indigo-100 p-3">

                            <Database
                              size={22}
                              className="text-indigo-600"
                            />

                          </div>

                          <span className="font-semibold">

                            {db.name}

                          </span>

                        </div>

                      </td>

                      <td className="px-4 py-5">

                        {db.engine}

                      </td>

                      <td className="px-4 py-5">

                        {db.storage}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            db.status === "Healthy"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >

                          {db.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-indigo-100 px-4 py-2 text-indigo-600 hover:bg-indigo-200">

                          Manage

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Storage Analytics & Replication */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <HardDrive className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Storage Analytics

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Customer Data", "540 GB", "68%"],
                  ["Orders", "780 GB", "82%"],
                  ["Payments", "320 GB", "44%"],
                  ["Analytics", "860 GB", "91%"],
                ].map(([name, size, usage]) => (

                  <div key={name}>

                    <div className="mb-2 flex justify-between">

                      <span>{name}</span>

                      <span className="font-semibold text-green-600">

                        {size}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-green-500"
                        style={{ width: usage }}
                      ></div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Server className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Replication Status

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Primary Cluster", "Online"],
                  ["Replica 1", "Synced"],
                  ["Replica 2", "Synced"],
                  ["Disaster Recovery", "Ready"],
                ].map(([server, status]) => (

                  <div
                    key={server}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {server}

                    </span>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">

                      {status}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Backup History & Query Performance */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Clock className="text-orange-600" />

                <h2 className="text-2xl font-bold">

                  Backup History

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Today 02:00 AM", "Completed"],
                  ["Yesterday", "Completed"],
                  ["2 Days Ago", "Completed"],
                  ["Weekly Full Backup", "Completed"],
                ].map(([backup, status]) => (

                  <div
                    key={backup}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{backup}</span>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">

                      {status}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-8 text-white">

              <div className="mb-6 flex items-center gap-3">

                <Cpu />

                <h2 className="text-2xl font-bold">

                  Query Performance

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Average Query Time", "18 ms"],
                  ["Queries / Minute", "18.7K"],
                  ["Slow Queries", "24"],
                  ["Cache Hit Ratio", "99.1%"],
                ].map(([label, value]) => (

                  <div
                    key={label}
                    className="rounded-2xl bg-white/10 p-5 backdrop-blur"
                  >

                    <div className="flex justify-between">

                      <span>{label}</span>

                      <span className="font-bold">

                        {value}

                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Resource Usage */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Resource Usage */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <BarChart3 className="text-indigo-600" />

                <h2 className="text-2xl font-bold">

                  Resource Usage

                </h2>

              </div>

              <div className="space-y-6">

                {[
                  ["CPU Usage", "72%"],
                  ["Memory Usage", "64%"],
                  ["Disk I/O", "48%"],
                  ["Network Traffic", "81%"],
                ].map(([title, value]) => (

                  <div key={title}>

                    <div className="mb-2 flex justify-between">

                      <span>{title}</span>

                      <span className="font-semibold text-indigo-600">

                        {value}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-indigo-500"
                        style={{ width: value }}
                      ></div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* AI Query Optimization */}

            <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white">

              <h2 className="text-2xl font-bold">

                AI Query Optimization

              </h2>

              <p className="mt-3 text-indigo-100">

                AI continuously analyzes slow queries, recommends indexes,
                predicts workload spikes, and optimizes execution plans.

              </p>

              <div className="mt-8 space-y-4">

                {[
                  ["Optimization Score", "98.4%"],
                  ["Queries Optimized", "4,286"],
                  ["Execution Time Saved", "42%"],
                  ["AI Confidence", "99.2%"],
                ].map(([label, value]) => (

                  <div
                    key={label}
                    className="rounded-2xl bg-white/10 p-5 backdrop-blur"
                  >

                    <div className="flex justify-between">

                      <span>{label}</span>

                      <span className="font-bold">

                        {value}

                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Index Management */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Index Management

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                ["Users Index", "Healthy"],
                ["Orders Index", "Healthy"],
                ["Payments Index", "Rebuild Needed"],
                ["Analytics Index", "Healthy"],
              ].map(([index, status]) => (

                <div
                  key={index}
                  className="rounded-2xl border p-5"
                >

                  <h3 className="font-semibold">

                    {index}

                  </h3>

                  <span
                    className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                      status === "Healthy"
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

          {/* Database Alerts */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Database Alerts

            </h2>

            <div className="mt-8 space-y-4">

              {[
                "PaymentsDB storage has reached 80% capacity.",
                "24 slow queries detected in the last hour.",
                "AnalyticsDB index optimization recommended.",
                "Next scheduled backup at 02:00 AM.",
              ].map((alert) => (

                <div
                  key={alert}
                  className="flex items-center gap-4 rounded-2xl border p-5"
                >

                  <ShieldCheck
                    size={22}
                    className="text-orange-500"
                  />

                  <span>{alert}</span>

                </div>

              ))}

            </div>

          </div>

          {/* Quick Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Database Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Create Backup",
                "Restore Backup",
                "Optimize Tables",
                "Rebuild Indexes",
                "View Slow Queries",
                "Restart Database",
                "Export Statistics",
                "Performance Report",
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

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <Database
              size={42}
              className="mx-auto text-indigo-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Database Control Center

            </h2>

            <p className="mt-3 text-gray-500">

              Centralized monitoring for database performance, storage,
              backups, replication, indexing, AI optimization, and
              enterprise-grade database operations.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">

                Export Database Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Backup History

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Performance Dashboard

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Database Management Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}