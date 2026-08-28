import Navbar from "../../components/Navbar.jsx";

import {
  LifeBuoy,
  MessageCircle,
  Users,
  Ticket,
  Search,
  Filter,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function SupportCenter() {

  const stats = [
    {
      title: "Open Tickets",
      value: "248",
      icon: Ticket,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Resolved Today",
      value: "182",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Support Agents",
      value: "56",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Average Response",
      value: "4 min",
      icon: Clock,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const tickets = [
    {
      id: "#TK-1024",
      user: "Rahul Sharma",
      issue: "Payment Failed",
      priority: "High",
    },
    {
      id: "#TK-1025",
      user: "Anjali Verma",
      issue: "Late Delivery",
      priority: "Medium",
    },
    {
      id: "#TK-1026",
      user: "Burger Hub",
      issue: "Menu Update",
      priority: "Low",
    },
    {
      id: "#TK-1027",
      user: "Delivery Partner",
      issue: "Account Verification",
      priority: "High",
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

                Support Center

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Manage customer support tickets, restaurant issues,
                delivery partner requests, live chat and platform
                assistance from a centralized dashboard.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">

              <LifeBuoy size={20} />

              Open Help Desk

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
                  placeholder="Search support tickets..."
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

          {/* Support Tickets */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                Support Tickets

              </h2>

              <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-600">

                {tickets.length} Active Tickets

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Ticket ID</th>
                    <th className="px-4 py-4">User</th>
                    <th className="px-4 py-4">Issue</th>
                    <th className="px-4 py-4">Priority</th>
                    <th className="px-4 py-4">Action</th>

                  </tr>

                </thead>

                <tbody>

                  {tickets.map((ticket) => (

                    <tr
                      key={ticket.id}
                      className="border-b transition hover:bg-indigo-50"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {ticket.id}

                      </td>

                      <td className="px-4 py-5">

                        {ticket.user}

                      </td>

                      <td className="px-4 py-5">

                        {ticket.issue}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            ticket.priority === "High"
                              ? "bg-red-100 text-red-600"
                              : ticket.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-600"
                          }`}
                        >

                          {ticket.priority}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-indigo-100 px-4 py-2 text-indigo-600 hover:bg-indigo-200">

                          View

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Live Chat & Support Agents */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <MessageCircle className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Live Chat Monitoring

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Active Chats", "84"],
                  ["Waiting Customers", "12"],
                  ["Avg Response Time", "3 mins"],
                  ["Customer Satisfaction", "96%"],
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

                <Users className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Support Agents

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Online Agents", "42"],
                  ["Busy Agents", "9"],
                  ["Offline Agents", "5"],
                  ["Performance Score", "98%"],
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

          {/* Customer & Restaurant Issues */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <AlertTriangle className="text-orange-500" />

                <h2 className="text-2xl font-bold">

                  Customer Issues

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Refund Requests", "28"],
                  ["Payment Problems", "16"],
                  ["Order Cancellation", "13"],
                  ["App Issues", "7"],
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

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Ticket className="text-red-600" />

                <h2 className="text-2xl font-bold">

                  Restaurant & Delivery Issues

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Menu Approval", "11"],
                  ["Restaurant Verification", "6"],
                  ["Delivery Complaints", "21"],
                  ["Partner Verification", "9"],
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

          {/* Ticket Analytics */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Ticket Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <TrendingUp className="text-indigo-600" />

                <h2 className="text-2xl font-bold">

                  Ticket Analytics

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Tickets Today", "326"],
                  ["Resolved Today", "182"],
                  ["Escalated Cases", "17"],
                  ["Average Resolution", "18 mins"],
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

            {/* Priority Distribution */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <AlertTriangle className="text-red-500" />

                <h2 className="text-2xl font-bold">

                  Priority Distribution

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["High Priority", "38"],
                  ["Medium Priority", "104"],
                  ["Low Priority", "106"],
                  ["Critical Cases", "8"],
                ].map(([title, value]) => (

                  <div key={title}>

                    <div className="mb-2 flex justify-between">

                      <span>{title}</span>

                      <span className="font-semibold text-red-600">

                        {value}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-red-500"
                        style={{
                          width:
                            title === "Critical Cases"
                              ? "15%"
                              : title === "High Priority"
                              ? "35%"
                              : title === "Medium Priority"
                              ? "70%"
                              : "90%",
                        }}
                      ></div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Support Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-700 p-8 text-white">

            <h2 className="text-3xl font-bold">

              AI Support Insights

            </h2>

            <p className="mt-3 text-indigo-100">

              AI continuously analyzes customer conversations,
              predicts escalations, detects repeated issues,
              recommends resolutions, and automatically routes
              tickets to the most suitable support agents.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Auto Resolved",
                  value: "71%",
                },
                {
                  title: "Customer Satisfaction",
                  value: "96%",
                },
                {
                  title: "Predicted Escalations",
                  value: "12",
                },
                {
                  title: "AI Accuracy",
                  value: "98.9%",
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

              Quick Support Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Assign Ticket",
                "Close Ticket",
                "Escalate Issue",
                "Open Live Chat",
                "Export Tickets",
                "Generate Report",
                "View Feedback",
                "Support Dashboard",
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

            <LifeBuoy
              size={42}
              className="mx-auto text-indigo-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Support Operations Center

            </h2>

            <p className="mt-3 text-gray-500">

              Manage customer support, restaurant assistance,
              delivery partner requests, AI-powered ticket routing,
              live chat monitoring, and enterprise service operations
              from one centralized dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">

                Export Support Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Agent Dashboard

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Customer Feedback

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Support Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}