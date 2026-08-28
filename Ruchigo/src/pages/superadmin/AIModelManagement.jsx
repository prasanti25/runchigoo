import Navbar from "../../components/Navbar.jsx";

import {
  Brain,
  Bot,
  Cpu,
  Sparkles,
  ShieldCheck,
  BarChart3,
  Search,
  Filter,
  Download,
  TrendingUp,
  Play,
} from "lucide-react";

export default function AIModelManagement() {

  const stats = [
    {
      title: "AI Models",
      value: "18",
      icon: Brain,
      color: "bg-violet-100 text-violet-600",
    },
    {
      title: "Predictions Today",
      value: "4.8 M",
      icon: Cpu,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "AI Accuracy",
      value: "99.2%",
      icon: Sparkles,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Running Models",
      value: "16",
      icon: Bot,
      color: "bg-pink-100 text-pink-600",
    },
  ];

  const models = [
    {
      name: "Food Recommendation AI",
      version: "v4.2",
      accuracy: "98.8%",
      status: "Running",
    },
    {
      name: "Fraud Detection",
      version: "v3.7",
      accuracy: "99.7%",
      status: "Running",
    },
    {
      name: "Delivery Time Predictor",
      version: "v5.1",
      accuracy: "97.9%",
      status: "Training",
    },
    {
      name: "Demand Forecast",
      version: "v2.9",
      accuracy: "98.2%",
      status: "Running",
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

                AI Model Management

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Monitor, deploy, train and optimize AI models
                powering recommendations, fraud detection,
                delivery prediction, pricing, chatbot and
                intelligent automation across RuchiGo.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700">

              <Play size={20} />

              Deploy Model

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
                  placeholder="Search AI models..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-violet-500"
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

                AI Models Registry

              </h2>

              <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-600">

                {models.length} Models

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Model</th>

                    <th className="px-4 py-4">Version</th>

                    <th className="px-4 py-4">Accuracy</th>

                    <th className="px-4 py-4">Status</th>

                    <th className="px-4 py-4">Action</th>

                  </tr>

                </thead>

                <tbody>

                  {models.map((model) => (

                    <tr
                      key={model.name}
                      className="border-b transition hover:bg-violet-50"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {model.name}

                      </td>

                      <td className="px-4 py-5">

                        {model.version}

                      </td>

                      <td className="px-4 py-5">

                        {model.accuracy}

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

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-violet-100 px-4 py-2 text-violet-700 hover:bg-violet-200">

                          Manage

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* AI Engines */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Brain className="text-violet-600" />

                <h2 className="text-2xl font-bold">

                  Recommendation Engine

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Personalized Recommendations", "Running"],
                  ["Restaurant Ranking", "Active"],
                  ["Food Suggestions", "Optimized"],
                  ["Upsell Prediction", "98.9%"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-violet-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <ShieldCheck className="text-red-600" />

                <h2 className="text-2xl font-bold">

                  Fraud Detection

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Transactions Monitored", "82K"],
                  ["Fraud Attempts Blocked", "148"],
                  ["Risk Score Accuracy", "99.7%"],
                  ["Live Monitoring", "Enabled"],
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

          {/* Forecast & Prediction */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <BarChart3 className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Demand Forecasting

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Tomorrow Orders", "18,450"],
                  ["Weekend Prediction", "+24%"],
                  ["Peak Hours", "7 PM - 9 PM"],
                  ["Forecast Accuracy", "98.5%"],
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

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Cpu className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Delivery Time Prediction

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Average ETA", "28 mins"],
                  ["Prediction Accuracy", "97.9%"],
                  ["Traffic Analysis", "Live"],
                  ["Weather Integration", "Enabled"],
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

          {/* Dynamic Pricing */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <Sparkles className="text-amber-600" />

              <h2 className="text-2xl font-bold">

                Dynamic Pricing Engine

              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {[
                ["Peak Hour Multiplier", "1.4x"],
                ["Rain Surge", "Enabled"],
                ["Demand Index", "High"],
                ["Price Optimization", "AI Active"],
              ].map(([title, value]) => (

                <div
                  key={title}
                  className="rounded-2xl border p-6 text-center"
                >

                  <h3 className="text-gray-500">

                    {title}

                  </h3>

                  <p className="mt-3 text-2xl font-bold text-amber-600">

                    {value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* AI Performance */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* AI Performance Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <TrendingUp className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  AI Performance Analytics

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Inference Requests", "4.8 Million"],
                  ["Average Response Time", "148 ms"],
                  ["Model Uptime", "99.99%"],
                  ["Successful Predictions", "99.2%"],
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

            {/* Sentiment Analysis */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Bot className="text-pink-600" />

                <h2 className="text-2xl font-bold">

                  Customer Sentiment Analysis

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Positive Reviews", "91%"],
                  ["Neutral Reviews", "7%"],
                  ["Negative Reviews", "2%"],
                  ["AI Confidence", "98.6%"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-pink-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Model Deployment */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <Cpu className="text-indigo-600" />

              <h2 className="text-2xl font-bold">

                Model Deployment & Version Control

              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {[
                ["Production", "v5.1"],
                ["Staging", "v5.2 Beta"],
                ["Rollback Ready", "Yes"],
                ["Deployment Success", "99.8%"],
              ].map(([title, value]) => (

                <div
                  key={title}
                  className="rounded-2xl border p-6 text-center"
                >

                  <h3 className="text-gray-500">

                    {title}

                  </h3>

                  <p className="mt-3 text-2xl font-bold text-indigo-600">

                    {value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* AI Audit Logs */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <ShieldCheck className="text-red-600" />

              <h2 className="text-2xl font-bold">

                AI Audit Logs

              </h2>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Time</th>

                    <th className="px-4 py-4">Model</th>

                    <th className="px-4 py-4">Action</th>

                    <th className="px-4 py-4">Status</th>

                  </tr>

                </thead>

                <tbody>

                  {[
                    ["10:15 AM", "Recommendation AI", "Deployment", "Success"],
                    ["09:48 AM", "Fraud Detection", "Training", "Running"],
                    ["08:22 AM", "ETA Predictor", "Update", "Completed"],
                    ["Yesterday", "Demand Forecast", "Rollback", "Success"],
                  ].map((log) => (

                    <tr
                      key={log.join("-")}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="px-4 py-5">{log[0]}</td>

                      <td className="px-4 py-5">{log[1]}</td>

                      <td className="px-4 py-5">{log[2]}</td>

                      <td className="px-4 py-5">

                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">

                          {log[3]}

                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Quick AI Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick AI Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Deploy Model",
                "Train New Model",
                "Rollback Version",
                "Monitor Performance",
                "Fraud Dashboard",
                "Recommendation Engine",
                "Export AI Report",
                "AI Configuration",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-violet-500 hover:bg-violet-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <Brain
              size={42}
              className="mx-auto text-violet-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise AI Operations Center

            </h2>

            <p className="mt-3 text-gray-500">

              Manage AI models, recommendation engines, fraud detection,
              forecasting, pricing optimization, chatbot intelligence,
              deployment pipelines, version control, monitoring and audit
              logs from a centralized AI Operations Center.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700">

                Deploy AI Model

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                AI Dashboard

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Export Analytics

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise AI Management Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}