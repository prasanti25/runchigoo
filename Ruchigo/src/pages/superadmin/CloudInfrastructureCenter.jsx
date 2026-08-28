import Navbar from "../../components/Navbar.jsx";

import {
  Cloud,
  Server,
  Database,
  HardDrive,
  Activity,
  Globe,
  Cpu,
  Search,
  Filter,
  Download,
  TrendingUp,
  Plus,
} from "lucide-react";

export default function CloudInfrastructureCenter() {

  const stats = [
    {
      title: "Cloud Servers",
      value: "48",
      icon: Server,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Running Containers",
      value: "382",
      icon: Cpu,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Storage Used",
      value: "12.6 TB",
      icon: HardDrive,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Global Regions",
      value: "14",
      icon: Globe,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const servers = [
    {
      name: "Production Cluster",
      region: "Mumbai",
      cpu: "42%",
      memory: "61%",
      status: "Healthy",
    },
    {
      name: "Analytics Cluster",
      region: "Singapore",
      cpu: "38%",
      memory: "54%",
      status: "Healthy",
    },
    {
      name: "AI Cluster",
      region: "Hyderabad",
      cpu: "71%",
      memory: "69%",
      status: "Scaling",
    },
    {
      name: "Backup Cluster",
      region: "Frankfurt",
      cpu: "18%",
      memory: "29%",
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

              <p className="font-semibold text-blue-600">

                Super Administrator

              </p>

              <h1 className="mt-2 text-4xl font-bold">

                Cloud Infrastructure Center

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Monitor cloud servers, Kubernetes clusters,
                storage, networking, CDN, databases,
                containers and infrastructure resources
                powering the RuchiGo platform.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">

              <Plus size={20}/>

              Provision Server

            </button>

          </div>

          {/* KPI Cards */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {stats.map((item)=>{

              const Icon=item.icon;

              return(

                <div
                  key={item.title}
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >

                  <div className="flex items-center justify-between">

                    <div className={`rounded-2xl p-4 ${item.color}`}>

                      <Icon size={30}/>

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
                  placeholder="Search cloud resources..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-blue-500"
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

          {/* Infrastructure Overview */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                Server Cluster Management

              </h2>

              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">

                {servers.length} Clusters

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Cluster</th>

                    <th className="px-4 py-4">Region</th>

                    <th className="px-4 py-4">CPU</th>

                    <th className="px-4 py-4">Memory</th>

                    <th className="px-4 py-4">Status</th>

                    <th className="px-4 py-4">Action</th>

                  </tr>

                </thead>

                <tbody>

                  {servers.map((server)=>(

                    <tr
                      key={server.name}
                      className="border-b hover:bg-blue-50 transition"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {server.name}

                      </td>

                      <td className="px-4 py-5">

                        {server.region}

                      </td>

                      <td className="px-4 py-5">

                        {server.cpu}

                      </td>

                      <td className="px-4 py-5">

                        {server.memory}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            server.status==="Healthy"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >

                          {server.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200">

                          Manage

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Kubernetes & Containers */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Cpu className="text-green-600"/>

                <h2 className="text-2xl font-bold">

                  Kubernetes Cluster

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Running Pods","482"],
                  ["Worker Nodes","18"],
                  ["Deployments","146"],
                  ["Cluster Health","99.8%"],
                ].map(([title,value])=>(

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

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Activity className="text-orange-600"/>

                <h2 className="text-2xl font-bold">

                  Container Monitoring

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Running Containers","382"],
                  ["Restart Events","12"],
                  ["Failed Containers","2"],
                  ["Availability","99.97%"],
                ].map(([title,value])=>(

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

          {/* Storage & Database */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <HardDrive className="text-purple-600"/>

                <h2 className="text-2xl font-bold">

                  Storage Management

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Total Storage","20 TB"],
                  ["Used","12.6 TB"],
                  ["Available","7.4 TB"],
                  ["Snapshots","624"],
                ].map(([title,value])=>(

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

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Database className="text-red-600"/>

                <h2 className="text-2xl font-bold">

                  Database Infrastructure

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Primary Databases","12"],
                  ["Read Replicas","24"],
                  ["Backup Success","100%"],
                  ["Replication Lag","18 ms"],
                ].map(([title,value])=>(

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

          {/* CDN & Networking */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <Globe className="text-cyan-600"/>

              <h2 className="text-2xl font-bold">

                CDN & Network Infrastructure

              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {[
                ["CDN Edge Locations","185"],
                ["Network Throughput","9.8 Gbps"],
                ["Average Latency","38 ms"],
                ["Traffic Served","84 TB/day"],
              ].map(([title,value])=>(

                <div
                  key={title}
                  className="rounded-2xl border p-6 text-center"
                >

                  <h3 className="text-gray-500">

                    {title}

                  </h3>

                  <p className="mt-3 text-2xl font-bold text-cyan-600">

                    {value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Resource Utilization */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Resource Utilization */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Activity className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Resource Utilization

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["CPU Utilization", "41%"],
                  ["Memory Utilization", "63%"],
                  ["Storage Usage", "62%"],
                  ["Network Usage", "48%"],
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

            {/* AI Infrastructure Insights */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Cloud className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  AI Infrastructure Insights

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Predicted Peak Load", "8:00 PM"],
                  ["Auto Scaling Events", "12 Today"],
                  ["Cost Optimization", "₹3.8L / Month"],
                  ["Infrastructure Score", "98.9%"],
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

          {/* Global Infrastructure KPIs */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-700 p-8 text-white">

            <div className="flex items-center gap-3">

              <Server size={34} />

              <h2 className="text-3xl font-bold">

                Global Infrastructure Overview

              </h2>

            </div>

            <p className="mt-4 text-blue-100">

              Real-time monitoring of worldwide cloud infrastructure,
              Kubernetes clusters, storage, networking, databases,
              CDN performance and intelligent resource allocation
              powering the RuchiGo ecosystem.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Global Availability",
                  value: "99.99%",
                },
                {
                  title: "Running Services",
                  value: "486",
                },
                {
                  title: "Infrastructure Health",
                  value: "98.8%",
                },
                {
                  title: "Cloud Cost Efficiency",
                  value: "94.7%",
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

          {/* Cloud Operations */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Cloud Operations

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Provision Server",
                "Deploy Container",
                "Scale Cluster",
                "Create Snapshot",
                "Backup Database",
                "Restart Services",
                "View Logs",
                "Infrastructure Report",
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

          {/* Enterprise Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <Cloud
              size={44}
              className="mx-auto text-blue-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Cloud Infrastructure Center

            </h2>

            <p className="mt-3 max-w-4xl mx-auto text-gray-500">

              Centralized management for cloud infrastructure,
              Kubernetes, containers, storage, networking,
              databases, CDN, monitoring, scaling, backups,
              disaster recovery and AI-powered cloud optimization
              across the RuchiGo platform.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">

                Launch Server

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Infrastructure Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                System Health

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Cloud Infrastructure Center

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}