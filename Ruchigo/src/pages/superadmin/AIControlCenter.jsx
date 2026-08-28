import Navbar from "../../components/Navbar.jsx";

import {
  Bot,
  BrainCircuit,
  Sparkles,
  Cpu,
  MessageSquare,
  TrendingUp,
  Search,
  Filter,
  Download,
  Settings,
  PlayCircle,
  PauseCircle,
} from "lucide-react";

export default function AIControlCenter() {

  const stats = [
    {
      title: "AI Models",
      value: "12",
      icon: BrainCircuit,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Daily Predictions",
      value: "156K",
      icon: Sparkles,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Chatbot Conversations",
      value: "48,932",
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "AI Accuracy",
      value: "98.7%",
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
    },
  ];

  const models = [
    {
      name: "Food Recommendation AI",
      status: "Running",
      accuracy: "98%",
      requests: "24K/day",
    },
    {
      name: "Demand Forecast AI",
      status: "Running",
      accuracy: "96%",
      requests: "18K/day",
    },
    {
      name: "Fraud Detection AI",
      status: "Running",
      accuracy: "99%",
      requests: "8K/day",
    },
    {
      name: "Delivery Route AI",
      status: "Training",
      accuracy: "93%",
      requests: "15K/day",
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

                AI Control Center

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Monitor, configure, and optimize every AI model powering
                recommendations, delivery optimization, fraud detection,
                customer support, and analytics.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

              <Bot size={20} />

              Deploy AI Model

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
                  placeholder="Search AI models..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-orange-500"
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

          {/* AI Models */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                AI Models Management
              </h2>

              <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-600">

                {models.length} Active Models

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Model</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Accuracy</th>
                    <th className="px-4 py-4">Requests</th>
                    <th className="px-4 py-4">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {models.map((model) => (

                    <tr
                      key={model.name}
                      className="border-b transition hover:bg-purple-50"
                    >

                      <td className="px-4 py-5">

                        <div className="flex items-center gap-3">

                          <div className="rounded-xl bg-purple-100 p-3">

                            <Bot
                              size={22}
                              className="text-purple-600"
                            />

                          </div>

                          <div>

                            <h3 className="font-semibold">

                              {model.name}

                            </h3>

                            <p className="text-sm text-gray-500">

                              AI Service

                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            model.status === "Running"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >

                          {model.status}

                        </span>

                      </td>

                      <td className="px-4 py-5 font-semibold text-green-600">

                        {model.accuracy}

                      </td>

                      <td className="px-4 py-5">

                        {model.requests}

                      </td>

                      <td className="px-4 py-5">

                        <div className="flex flex-wrap gap-2">

                          <button className="rounded-lg bg-green-100 px-3 py-2 text-green-600 hover:bg-green-200">

                            <PlayCircle size={18} />

                          </button>

                          <button className="rounded-lg bg-yellow-100 px-3 py-2 text-yellow-700 hover:bg-yellow-200">

                            <PauseCircle size={18} />

                          </button>

                          <button className="rounded-lg bg-blue-100 px-3 py-2 text-blue-600 hover:bg-blue-200">

                            Retrain

                          </button>

                          <button className="rounded-lg bg-purple-100 px-3 py-2 text-purple-600 hover:bg-purple-200">

                            <Settings size={18} />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* AI Configuration */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                AI Configuration

              </h2>

              <div className="mt-8 space-y-6">

                {[
                  "Recommendation Engine",
                  "Fraud Detection",
                  "Delivery Optimization",
                  "Dynamic Pricing",
                  "Demand Forecasting",
                  "Customer Support Bot",
                ].map((feature) => (

                  <div
                    key={feature}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {feature}

                    </span>

                    <label className="relative inline-flex cursor-pointer items-center">

                      <input
                        type="checkbox"
                        defaultChecked
                        className="peer sr-only"
                      />

                      <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-500 peer-checked:after:translate-x-5"></div>

                    </label>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Chatbot Performance

              </h2>

              <div className="mt-8 space-y-6">

                {[
                  ["Daily Conversations", "48,932"],
                  ["Resolved Queries", "96%"],
                  ["Average Response", "1.2 sec"],
                  ["Customer Rating", "4.9 / 5"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {title}

                    </span>

                    <span className="font-bold text-blue-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Performance */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="flex items-center gap-3">

                <Cpu className="text-orange-500" />

                <h2 className="text-2xl font-bold">

                  AI Resource Usage

                </h2>

              </div>

              <div className="mt-8 space-y-6">

                {[
                  ["GPU Utilization", "82%"],
                  ["CPU Usage", "56%"],
                  ["Memory Usage", "71%"],
                  ["Inference Queue", "42%"],
                ].map(([label, value]) => (

                  <div key={label}>

                    <div className="mb-2 flex justify-between">

                      <span>{label}</span>

                      <span className="font-semibold text-orange-600">

                        {value}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-orange-500"
                        style={{ width: value }}
                      ></div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white">

              <h2 className="text-2xl font-bold">

                Recommendation Engine

              </h2>

              <div className="mt-8 space-y-5">

                {[
                  "Food Suggestions: 98% Accuracy",
                  "Restaurant Ranking Updated",
                  "Trending Foods Detected",
                  "Customer Preferences Synced",
                  "Personalization Active",
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

          {/* AI Analytics */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* AI Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                AI Analytics

              </h2>

              <div className="mt-8 space-y-6">

                {[
                  ["Prediction Accuracy", "98.7%"],
                  ["Models Deployed", "12"],
                  ["Inference Success", "99.8%"],
                  ["Average Latency", "92 ms"],
                  ["Daily Predictions", "156K"],
                ].map(([label, value]) => (

                  <div key={label}>

                    <div className="mb-2 flex justify-between">

                      <span>{label}</span>

                      <span className="font-semibold text-purple-600">

                        {value}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-purple-500"
                        style={{ width: "85%" }}
                      ></div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Dynamic Pricing */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Dynamic Pricing AI

              </h2>

              <div className="mt-8 space-y-4">

                {[
                  {
                    title: "Weekend Surge",
                    status: "+15%",
                  },
                  {
                    title: "Festival Demand",
                    status: "+22%",
                  },
                  {
                    title: "Rain Forecast",
                    status: "+10%",
                  },
                  {
                    title: "Night Orders",
                    status: "+8%",
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

                      {item.status}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Delivery AI & Fraud Detection */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">

              <h2 className="text-2xl font-bold">

                Delivery Route Optimization

              </h2>

              <div className="mt-8 space-y-5">

                {[
                  "Routes Optimized Today : 18,245",
                  "Fuel Saved : 12%",
                  "Delivery Time Reduced : 18%",
                  "Traffic Alerts : 24",
                  "Live Optimization : Enabled",
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

            <div className="rounded-3xl bg-gradient-to-r from-red-600 to-pink-600 p-8 text-white">

              <h2 className="text-2xl font-bold">

                Fraud Detection Center

              </h2>

              <div className="mt-8 space-y-5">

                {[
                  "Fraud Attempts Blocked : 128",
                  "Payment Risks : Low",
                  "Fake Accounts Detected : 34",
                  "Chargeback Protection : Active",
                  "AI Confidence : 99%",
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

          {/* AI Quick Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              AI Quick Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Deploy Model",
                "Retrain All Models",
                "Restart AI Services",
                "Export Predictions",
                "Generate AI Report",
                "Manage Datasets",
                "View Logs",
                "AI Settings",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-purple-500 hover:bg-purple-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* AI Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 p-8 text-white">

            <h2 className="text-3xl font-bold">

              AI Insights

            </h2>

            <p className="mt-3 text-indigo-100">

              AI predicts customer behavior, restaurant demand, delivery
              efficiency, pricing trends, and potential fraud in real time.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Demand Forecast",
                  value: "97%",
                },
                {
                  title: "Customer Retention",
                  value: "+18%",
                },
                {
                  title: "Revenue Impact",
                  value: "+24%",
                },
                {
                  title: "Overall AI Score",
                  value: "9.8/10",
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

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <h2 className="text-2xl font-bold">

              Enterprise AI Operations Center

            </h2>

            <p className="mt-3 text-gray-500">

              Control, monitor, optimize, and scale every AI service across
              the RuchiGo ecosystem from a single intelligent dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700">

                Export AI Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                AI Performance

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Model Logs

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise AI Operations Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}