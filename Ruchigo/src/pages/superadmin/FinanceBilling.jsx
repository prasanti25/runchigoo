import Navbar from "../../components/Navbar.jsx";

import {
  Wallet,
  IndianRupee,
  Receipt,
  CreditCard,
  Search,
  Filter,
  Download,
  TrendingUp,
  DollarSign,
  Landmark,
  BarChart3,
} from "lucide-react";

export default function FinanceBilling() {

  const stats = [
    {
      title: "Platform Revenue",
      value: "₹8.42 Cr",
      icon: IndianRupee,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Today's Revenue",
      value: "₹18.6 L",
      icon: Wallet,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pending Payouts",
      value: "₹42 L",
      icon: CreditCard,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Refund Requests",
      value: "126",
      icon: Receipt,
      color: "bg-red-100 text-red-600",
    },
  ];

  const payouts = [
    {
      restaurant: "Burger Hub",
      amount: "₹82,400",
      status: "Pending",
    },
    {
      restaurant: "Pizza Palace",
      amount: "₹1,24,000",
      status: "Completed",
    },
    {
      restaurant: "Spicy Kitchen",
      amount: "₹65,200",
      status: "Completed",
    },
    {
      restaurant: "Food Express",
      amount: "₹48,100",
      status: "Pending",
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

                Finance & Billing

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Monitor platform revenue, restaurant settlements,
                commissions, refunds, taxes, invoices and complete
                financial performance from one dashboard.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">

              <Wallet size={20} />

              Financial Report

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
                  placeholder="Search financial records..."
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

          {/* Restaurant Settlements */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                Restaurant Settlements

              </h2>

              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-600">

                {payouts.length} Settlement Records

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Restaurant</th>
                    <th className="px-4 py-4">Settlement Amount</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Action</th>

                  </tr>

                </thead>

                <tbody>

                  {payouts.map((item) => (

                    <tr
                      key={item.restaurant}
                      className="border-b transition hover:bg-emerald-50"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {item.restaurant}

                      </td>

                      <td className="px-4 py-5">

                        {item.amount}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            item.status === "Completed"
                              ? "bg-green-100 text-green-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >

                          {item.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-emerald-100 px-4 py-2 text-emerald-700 hover:bg-emerald-200">

                          View

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Commission Management */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <DollarSign className="text-emerald-600" />

                <h2 className="text-2xl font-bold">

                  Commission Management

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Restaurant Commission", "18%"],
                  ["Delivery Commission", "10%"],
                  ["Platform Fee", "₹8 / Order"],
                  ["Service Charge", "₹5 / Order"],
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

            {/* Payment Gateway */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <CreditCard className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Payment Gateway

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Successful Payments", "98.9%"],
                  ["Failed Payments", "1.1%"],
                  ["Gateway Uptime", "99.99%"],
                  ["Transactions Today", "28,421"],
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

          {/* Invoice & Refund */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Receipt className="text-purple-600" />

                <h2 className="text-2xl font-bold">

                  Invoice Management

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Invoices Generated", "18,742"],
                  ["Paid Invoices", "18,321"],
                  ["Pending", "421"],
                  ["Cancelled", "28"],
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

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Wallet className="text-red-600" />

                <h2 className="text-2xl font-bold">

                  Refund Center

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Pending Refunds", "126"],
                  ["Approved", "84"],
                  ["Rejected", "19"],
                  ["Refunded Amount", "₹3.6 L"],
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

          {/* Revenue Analytics & Tax */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Revenue Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <BarChart3 className="text-emerald-600" />

                <h2 className="text-2xl font-bold">

                  Revenue Analytics

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Today's Revenue", "₹18.6 L"],
                  ["This Week", "₹1.28 Cr"],
                  ["This Month", "₹8.42 Cr"],
                  ["Annual Growth", "+24.8%"],
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

            {/* Tax & GST */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Landmark className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Tax & GST Overview

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["GST Collected", "₹92.5 L"],
                  ["GST Paid", "₹88.7 L"],
                  ["TDS Deducted", "₹14.2 L"],
                  ["Tax Compliance", "100%"],
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

          {/* AI Financial Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white">

            <h2 className="text-3xl font-bold">

              AI Financial Insights

            </h2>

            <p className="mt-3 text-emerald-100">

              AI continuously analyzes transactions, predicts future revenue,
              detects abnormal financial activities, estimates refund trends,
              optimizes commission strategies, and generates intelligent
              financial recommendations for the RuchiGo platform.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Revenue Prediction",
                  value: "₹9.3 Cr",
                },
                {
                  title: "Fraud Detection",
                  value: "99.8%",
                },
                {
                  title: "Refund Risk",
                  value: "Low",
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

          {/* Quick Finance Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Finance Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Generate Invoice",
                "Approve Refund",
                "Process Settlement",
                "Export Revenue",
                "Download GST Report",
                "Financial Audit",
                "Tax Summary",
                "Billing Dashboard",
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

            <Wallet
              size={42}
              className="mx-auto text-emerald-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Finance & Billing Center

            </h2>

            <p className="mt-3 text-gray-500">

              Manage platform revenue, settlements, commissions, taxes,
              invoices, refunds, payment gateways, and AI-powered financial
              analytics from a centralized enterprise dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">

                Export Financial Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Billing Dashboard

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Audit History

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Finance Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}