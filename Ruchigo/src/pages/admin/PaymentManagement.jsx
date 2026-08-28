import Navbar from "../../components/Navbar.jsx";

import {
  CreditCard,
  Search,
  Filter,
  Download,
  CalendarDays,
} from "lucide-react";

export default function PaymentManagement() {

  const payments = [
    {
      id: "TXN100231",
      customer: "Rahul Sharma",
      amount: "₹520",
      method: "UPI",
      status: "Success",
      settlement: "Completed",
      refund: "No",
      date: "20 Jul 2026",
    },
    {
      id: "TXN100232",
      customer: "Priya Reddy",
      amount: "₹340",
      method: "Credit Card",
      status: "Success",
      settlement: "Pending",
      refund: "No",
      date: "20 Jul 2026",
    },
    {
      id: "TXN100233",
      customer: "Kiran Kumar",
      amount: "₹760",
      method: "Wallet",
      status: "Failed",
      settlement: "-",
      refund: "-",
      date: "20 Jul 2026",
    },
    {
      id: "TXN100234",
      customer: "Sneha Patel",
      amount: "₹430",
      method: "Debit Card",
      status: "Refunded",
      settlement: "Completed",
      refund: "Completed",
      date: "19 Jul 2026",
    },
  ];

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="font-semibold text-orange-500">
                Administrator Panel
              </p>

              <h1 className="mt-2 text-4xl font-bold text-gray-900">
                Payment Management
              </h1>

              <p className="mt-3 text-gray-500">
                Monitor transactions, refunds, settlements and platform revenue.
              </p>

            </div>

            <div className="flex gap-4">

              <button className="flex items-center gap-2 rounded-2xl border px-5 py-3 font-semibold hover:bg-gray-100">

                <Download size={18} />

                Export

              </button>

            </div>

          </div>

          {/* Statistics */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {[
              {
                title: "Today's Revenue",
                value: "₹3.82L",
                color: "text-green-600",
              },
              {
                title: "Successful Payments",
                value: "1,245",
                color: "text-blue-600",
              },
              {
                title: "Refund Requests",
                value: "42",
                color: "text-yellow-600",
              },
              {
                title: "Failed Payments",
                value: "18",
                color: "text-red-600",
              },
            ].map((item) => (

              <div
                key={item.title}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >

                <CreditCard
                  className={item.color}
                  size={30}
                />

                <h3 className="mt-5 text-gray-500">
                  {item.title}
                </h3>

                <p className={`mt-2 text-3xl font-bold ${item.color}`}>
                  {item.value}
                </p>

              </div>

            ))}

          </div>

          {/* Search */}

          <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-5 lg:flex-row">

              <div className="relative flex-1">

                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search Transaction ID or Customer..."
                  className="w-full rounded-2xl border py-3 pl-12 pr-4 outline-none focus:border-orange-500"
                />

              </div>

              <select className="rounded-2xl border px-5 py-3">

                <option>All Status</option>
                <option>Success</option>
                <option>Failed</option>
                <option>Refunded</option>
                <option>Pending</option>

              </select>

              <button className="flex items-center gap-2 rounded-2xl border px-5 py-3 hover:bg-gray-100">

                <CalendarDays size={18} />

                Today

              </button>

              <button className="flex items-center gap-2 rounded-2xl border px-5 py-3 hover:bg-gray-100">

                <Filter size={18} />

                Filters

              </button>

            </div>

          </div>

          {/* Payments Table */}
                    <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-orange-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Transaction
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Method
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Settlement
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Refund
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {payments.map((payment) => (

                    <tr
                      key={payment.id}
                      className="border-t transition hover:bg-orange-50/40"
                    >

                      <td className="px-6 py-5">

                        <div>

                          <h3 className="font-semibold text-gray-900">
                            {payment.id}
                          </h3>

                          <p className="text-sm text-gray-500">
                            {payment.date}
                          </p>

                        </div>

                      </td>

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-4">

                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              payment.customer
                            )}&background=f97316&color=fff`}
                            alt={payment.customer}
                            className="h-12 w-12 rounded-full"
                          />

                          <div>

                            <h3 className="font-semibold text-gray-900">
                              {payment.customer}
                            </h3>

                            <p className="text-sm text-gray-500">
                              Customer
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-5 font-bold text-green-600">
                        {payment.amount}
                      </td>

                      <td className="px-6 py-5">
                        {payment.method}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-4 py-2 text-sm font-semibold
                          ${
                            payment.status === "Success"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "Failed"
                              ? "bg-red-100 text-red-700"
                              : payment.status === "Refunded"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {payment.status}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-4 py-2 text-sm font-semibold
                          ${
                            payment.settlement === "Completed"
                              ? "bg-green-100 text-green-700"
                              : payment.settlement === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {payment.settlement}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-4 py-2 text-sm font-semibold
                          ${
                            payment.refund === "Completed"
                              ? "bg-blue-100 text-blue-700"
                              : payment.refund === "No"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {payment.refund}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <div className="flex flex-wrap justify-center gap-2">

                          <button className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">
                            View
                          </button>

                          <button className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600">
                            Invoice
                          </button>

                          {payment.status !== "Refunded" &&
                          payment.status !== "Failed" ? (

                            <button className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
                              Refund
                            </button>

                          ) : payment.status === "Refunded" ? (

                            <button className="rounded-xl bg-gray-400 px-4 py-2 text-sm font-semibold text-white cursor-not-allowed">
                              Refunded
                            </button>

                          ) : (

                            <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
                              Retry
                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Revenue Overview */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Revenue Overview */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Revenue Overview
              </h2>

              <p className="mt-2 text-gray-500">
                Revenue generated across the platform.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-5">

                <div className="rounded-2xl bg-green-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-green-600">
                    ₹3.82L
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Today
                  </p>

                </div>

                <div className="rounded-2xl bg-blue-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-blue-600">
                    ₹24.5L
                  </h3>

                  <p className="mt-2 text-gray-600">
                    This Week
                  </p>

                </div>

                <div className="rounded-2xl bg-orange-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-orange-600">
                    ₹1.12Cr
                  </h3>

                  <p className="mt-2 text-gray-600">
                    This Month
                  </p>

                </div>

                <div className="rounded-2xl bg-purple-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-purple-600">
                    ₹12.8Cr
                  </h3>

                  <p className="mt-2 text-gray-600">
                    This Year
                  </p>

                </div>

              </div>

            </div>

            {/* Weekly Revenue */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Weekly Revenue
              </h2>

              <p className="mt-2 text-gray-500">
                Revenue collected over the last 7 days.
              </p>

              <div className="mt-8 flex h-64 items-end justify-between gap-4">

                {[
                  { day: "Mon", value: 40 },
                  { day: "Tue", value: 52 },
                  { day: "Wed", value: 68 },
                  { day: "Thu", value: 80 },
                  { day: "Fri", value: 95 },
                  { day: "Sat", value: 100 },
                  { day: "Sun", value: 84 },
                ].map((item) => (

                  <div
                    key={item.day}
                    className="flex flex-1 flex-col items-center"
                  >

                    <div
                      className="w-full rounded-t-xl bg-green-500 transition hover:bg-green-600"
                      style={{ height: `${item.value * 2}px` }}
                    />

                    <span className="mt-3 text-sm font-medium text-gray-600">
                      {item.day}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Payment Method & Settlement */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Payment Methods */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Payment Method Distribution
              </h2>

              <p className="mt-2 text-gray-500">
                Most preferred payment methods.
              </p>

              <div className="mt-8 space-y-6">

                {[
                  { method: "UPI", value: "62%", width: "62%", color: "bg-blue-500" },
                  { method: "Credit Card", value: "18%", width: "18%", color: "bg-green-500" },
                  { method: "Debit Card", value: "12%", width: "12%", color: "bg-orange-500" },
                  { method: "Wallet", value: "8%", width: "8%", color: "bg-purple-500" },
                ].map((item) => (

                  <div key={item.method}>

                    <div className="mb-2 flex justify-between">

                      <span>{item.method}</span>

                      <span className="font-semibold">
                        {item.value}
                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: item.width }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Settlement Overview */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Settlement Overview
              </h2>

              <p className="mt-2 text-gray-500">
                Daily settlement progress.
              </p>

              <div className="mt-8 space-y-5">

                <div className="rounded-2xl border p-5">

                  <div className="flex items-center justify-between">

                    <span className="font-medium">
                      Completed Settlements
                    </span>

                    <span className="font-bold text-green-600">
                      ₹2.96L
                    </span>

                  </div>

                </div>

                <div className="rounded-2xl border p-5">

                  <div className="flex items-center justify-between">

                    <span className="font-medium">
                      Pending Settlements
                    </span>

                    <span className="font-bold text-yellow-600">
                      ₹86K
                    </span>

                  </div>

                </div>

                <div className="rounded-2xl border p-5">

                  <div className="flex items-center justify-between">

                    <span className="font-medium">
                      Failed Settlements
                    </span>

                    <span className="font-bold text-red-600">
                      ₹12K
                    </span>

                  </div>

                </div>

                <div className="rounded-2xl border p-5">

                  <div className="flex items-center justify-between">

                    <span className="font-medium">
                      Processing
                    </span>

                    <span className="font-bold text-blue-600">
                      ₹34K
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Refund & Commission */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Refund Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Refund Analytics
              </h2>

              <p className="mt-2 text-gray-500">
                Refund requests and processing status.
              </p>

              <div className="mt-8 space-y-5">

                <div className="rounded-2xl bg-orange-50 p-5 flex items-center justify-between">

                  <div>

                    <h3 className="font-semibold text-orange-700">
                      Pending Refunds
                    </h3>

                    <p className="text-sm text-gray-600 mt-1">
                      Awaiting approval
                    </p>

                  </div>

                  <span className="text-2xl font-bold text-orange-600">
                    42
                  </span>

                </div>

                <div className="rounded-2xl bg-green-50 p-5 flex items-center justify-between">

                  <div>

                    <h3 className="font-semibold text-green-700">
                      Completed Refunds
                    </h3>

                    <p className="text-sm text-gray-600 mt-1">
                      Successfully processed
                    </p>

                  </div>

                  <span className="text-2xl font-bold text-green-600">
                    318
                  </span>

                </div>

                <div className="rounded-2xl bg-red-50 p-5 flex items-center justify-between">

                  <div>

                    <h3 className="font-semibold text-red-700">
                      Failed Refunds
                    </h3>

                    <p className="text-sm text-gray-600 mt-1">
                      Need manual review
                    </p>

                  </div>

                  <span className="text-2xl font-bold text-red-600">
                    6
                  </span>

                </div>

              </div>

            </div>

            {/* Commission Report */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Platform Commission
              </h2>

              <p className="mt-2 text-gray-500">
                Commission earned from restaurant partners.
              </p>

              <div className="mt-8 space-y-6">

                {[
                  {
                    label: "Today's Commission",
                    amount: "₹48,500",
                    width: "78%",
                    color: "bg-green-500",
                  },
                  {
                    label: "This Week",
                    amount: "₹3.45L",
                    width: "90%",
                    color: "bg-blue-500",
                  },
                  {
                    label: "This Month",
                    amount: "₹15.8L",
                    width: "96%",
                    color: "bg-orange-500",
                  },
                ].map((item) => (

                  <div key={item.label}>

                    <div className="mb-2 flex justify-between">

                      <span className="font-medium">
                        {item.label}
                      </span>

                      <span className="font-bold text-gray-900">
                        {item.amount}
                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: item.width }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Recent Activity */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold text-gray-900">
              Recent Payment Activity
            </h2>

            <p className="mt-2 text-gray-500">
              Latest financial transactions across the platform.
            </p>

            <div className="mt-8 space-y-5">

              {[
                {
                  title: "Payment Received",
                  description: "TXN100241 completed successfully via UPI.",
                  time: "2 mins ago",
                  badge: "Success",
                  color: "bg-green-100 text-green-700",
                },
                {
                  title: "Refund Approved",
                  description: "Refund processed for TXN100198.",
                  time: "10 mins ago",
                  badge: "Refund",
                  color: "bg-orange-100 text-orange-700",
                },
                {
                  title: "Settlement Completed",
                  description: "Restaurant payout transferred successfully.",
                  time: "25 mins ago",
                  badge: "Settlement",
                  color: "bg-blue-100 text-blue-700",
                },
                {
                  title: "Payment Failed",
                  description: "Card transaction declined by bank.",
                  time: "38 mins ago",
                  badge: "Failed",
                  color: "bg-red-100 text-red-700",
                },
              ].map((activity, index) => (

                <div
                  key={index}
                  className="flex flex-col gap-4 rounded-2xl border p-5 transition hover:bg-orange-50 lg:flex-row lg:items-center lg:justify-between"
                >

                  <div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${activity.color}`}
                    >
                      {activity.badge}
                    </span>

                    <h3 className="mt-3 font-semibold text-gray-900">
                      {activity.title}
                    </h3>

                    <p className="mt-1 text-gray-600">
                      {activity.description}
                    </p>

                  </div>

                  <span className="text-sm text-gray-500">
                    {activity.time}
                  </span>

                </div>

              ))}

            </div>

          </div>

          {/* Financial Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-white">

            <h2 className="text-3xl font-bold">
              Financial Insights
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-3">

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

                <h3 className="font-semibold">
                  💹 Revenue Growth
                </h3>

                <p className="mt-3 text-green-50">
                  Revenue increased by <strong>22%</strong> compared to last month.
                </p>

              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

                <h3 className="font-semibold">
                  💳 Payment Success
                </h3>

                <p className="mt-3 text-green-50">
                  Overall payment success rate reached <strong>98.6%</strong>.
                </p>

              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

                <h3 className="font-semibold">
                  🏦 Platform Health
                </h3>

                <p className="mt-3 text-green-50">
                  Settlements are processed on schedule with minimal delays.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

    </>

  );

}