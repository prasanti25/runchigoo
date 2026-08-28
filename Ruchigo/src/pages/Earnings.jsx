import Navbar from "../../components/Navbar.jsx";

import {
  Wallet,
  IndianRupee,
  TrendingUp,
  Trophy,
} from "lucide-react";

export default function DeliveryEarnings() {

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="font-semibold text-orange-500">
                Delivery Partner
              </p>

              <h1 className="mt-2 text-4xl font-bold text-gray-900">
                Earnings
              </h1>

              <p className="mt-3 text-gray-500">
                Track your earnings, incentives, payouts and delivery income.
              </p>

            </div>

            <button className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
              📥 Download Statement
            </button>

          </div>

          {/* Summary Cards */}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

            {[
              {
                icon: <Wallet size={30} />,
                title: "Available Balance",
                value: "₹12,480",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: <IndianRupee size={30} />,
                title: "Today's Earnings",
                value: "₹2,450",
                color: "bg-orange-100 text-orange-600",
              },
              {
                icon: <TrendingUp size={30} />,
                title: "This Month",
                value: "₹42,860",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: <Trophy size={30} />,
                title: "Incentives",
                value: "₹5,200",
                color: "bg-yellow-100 text-yellow-600",
              },
            ].map((card) => (

              <div
                key={card.title}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >

                <div className={`inline-flex rounded-2xl p-3 ${card.color}`}>
                  {card.icon}
                </div>

                <h3 className="mt-5 text-gray-500">
                  {card.title}
                </h3>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {card.value}
                </p>

              </div>

            ))}

          </div>

          {/* Earnings Chart */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Weekly Earnings Chart */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Weekly Earnings
              </h2>

              <p className="mt-2 text-gray-500">
                Earnings for the last 7 days.
              </p>

              <div className="mt-8 flex h-64 items-end justify-between gap-4">

                {[
                  { day: "Mon", value: 55 },
                  { day: "Tue", value: 72 },
                  { day: "Wed", value: 68 },
                  { day: "Thu", value: 88 },
                  { day: "Fri", value: 95 },
                  { day: "Sat", value: 100 },
                  { day: "Sun", value: 80 },
                ].map((item) => (

                  <div
                    key={item.day}
                    className="flex flex-1 flex-col items-center"
                  >

                    <div
                      className="w-full rounded-t-xl bg-green-500 transition-all hover:bg-green-600"
                      style={{ height: `${item.value * 2}px` }}
                    />

                    <span className="mt-3 text-sm font-medium text-gray-600">
                      {item.day}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Incentives & Bonus */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Incentives & Bonus
              </h2>

              <p className="mt-2 text-gray-500">
                Complete more deliveries to unlock rewards.
              </p>

              <div className="mt-8 space-y-6">

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Weekly Target</span>

                    <span className="font-bold text-green-600">
                      82 / 100 Orders
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: "82%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Monthly Target</span>

                    <span className="font-bold text-blue-600">
                      265 / 300 Orders
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: "88%" }}
                    />

                  </div>

                </div>

                <div className="rounded-2xl bg-yellow-50 p-5">

                  <h3 className="text-lg font-bold text-yellow-700">
                    🎉 Next Bonus
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Complete <strong>18 more deliveries</strong> to earn an
                    additional <strong>₹2,000</strong> incentive.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Monthly Analytics */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold text-gray-900">
              Monthly Analytics
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-4">

              <div className="rounded-2xl bg-orange-50 p-5">

                <p className="text-sm text-gray-500">
                  Deliveries
                </p>

                <h3 className="mt-2 text-3xl font-bold text-orange-600">
                  286
                </h3>

              </div>

              <div className="rounded-2xl bg-green-50 p-5">

                <p className="text-sm text-gray-500">
                  Incentives Earned
                </p>

                <h3 className="mt-2 text-3xl font-bold text-green-600">
                  ₹5,200
                </h3>

              </div>

              <div className="rounded-2xl bg-blue-50 p-5">

                <p className="text-sm text-gray-500">
                  Average / Day
                </p>

                <h3 className="mt-2 text-3xl font-bold text-blue-600">
                  ₹1,428
                </h3>

              </div>

              <div className="rounded-2xl bg-purple-50 p-5">

                <p className="text-sm text-gray-500">
                  Highest Day
                </p>

                <h3 className="mt-2 text-3xl font-bold text-purple-600">
                  ₹3,240
                </h3>

              </div>

            </div>

          </div>

          {/* Payout Details */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Bank Details */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Payout Details
              </h2>

              <p className="mt-2 text-gray-500">
                Earnings are transferred directly to your registered bank account.
              </p>

              <div className="mt-8 space-y-5">

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <span className="font-medium text-gray-600">
                    Account Holder
                  </span>

                  <span className="font-bold">
                    Pavan Kunchanapalli
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <span className="font-medium text-gray-600">
                    Bank
                  </span>

                  <span className="font-bold">
                    State Bank of India
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <span className="font-medium text-gray-600">
                    Account No.
                  </span>

                  <span className="font-bold">
                    ••••••••4521
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <span className="font-medium text-gray-600">
                    IFSC Code
                  </span>

                  <span className="font-bold">
                    SBIN0001234
                  </span>

                </div>

                <div className="flex gap-4 pt-4">

                  <button className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
                    💰 Withdraw Earnings
                  </button>

                  <button className="rounded-2xl border border-gray-300 px-6 py-3 font-semibold transition hover:bg-gray-100">
                    ✏️ Edit Bank
                  </button>

                </div>

              </div>

            </div>

            {/* Recent Payouts */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Recent Payouts
              </h2>

              <p className="mt-2 text-gray-500">
                Latest transfers credited to your bank account.
              </p>

              <div className="mt-8 space-y-5">

                {[
                  {
                    date: "20 Jul 2026",
                    amount: "₹4,580",
                    status: "Credited",
                  },
                  {
                    date: "16 Jul 2026",
                    amount: "₹5,120",
                    status: "Credited",
                  },
                  {
                    date: "12 Jul 2026",
                    amount: "₹3,950",
                    status: "Processing",
                  },
                ].map((item) => (

                  <div
                    key={item.date}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <div>

                      <p className="font-semibold">
                        {item.date}
                      </p>

                      <p className="text-sm text-gray-500">
                        Weekly Settlement
                      </p>

                    </div>

                    <div className="text-right">

                      <h3 className="text-xl font-bold text-green-600">
                        {item.amount}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "Credited"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Transaction History */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-8 flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Transaction History
                </h2>

                <p className="mt-2 text-gray-500">
                  All earnings received from completed deliveries.
                </p>

              </div>

              <button className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
                📥 Download CSV
              </button>

            </div>

            <div className="space-y-5">

              {[
                {
                  id: "TXN102501",
                  order: "#RG102458",
                  amount: "₹145",
                  date: "20 Jul 2026",
                },
                {
                  id: "TXN102502",
                  order: "#RG102459",
                  amount: "₹185",
                  date: "19 Jul 2026",
                },
                {
                  id: "TXN102503",
                  order: "#RG102460",
                  amount: "₹210",
                  date: "18 Jul 2026",
                },
              ].map((transaction) => (

                <div
                  key={transaction.id}
                  className="flex flex-col gap-5 rounded-2xl border p-5 lg:flex-row lg:items-center lg:justify-between"
                >

                  <div>

                    <h3 className="font-bold text-gray-900">
                      {transaction.id}
                    </h3>

                    <p className="text-gray-500">
                      {transaction.order}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Date
                    </p>

                    <h4 className="font-semibold">
                      {transaction.date}
                    </h4>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Amount
                    </p>

                    <h4 className="text-xl font-bold text-green-600">
                      {transaction.amount}
                    </h4>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* Final Summary */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Earnings Summary */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Earnings Summary
              </h2>

              <div className="mt-8 space-y-5">

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <span>Total Deliveries</span>

                  <span className="text-xl font-bold text-orange-600">
                    286
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <span>Total Earnings</span>

                  <span className="text-xl font-bold text-green-600">
                    ₹42,860
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <span>Total Incentives</span>

                  <span className="text-xl font-bold text-yellow-600">
                    ₹5,200
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <span>Pending Payout</span>

                  <span className="text-xl font-bold text-blue-600">
                    ₹3,950
                  </span>

                </div>

              </div>

            </div>

            {/* Performance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Performance Overview
              </h2>

              <div className="mt-8 space-y-6">

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Delivery Success Rate</span>

                    <span className="font-bold text-green-600">
                      98%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: "98%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Customer Rating</span>

                    <span className="font-bold text-yellow-500">
                      4.9 ★
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-yellow-400"
                      style={{ width: "96%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Target Completion</span>

                    <span className="font-bold text-blue-600">
                      88%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: "88%" }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Earnings Tips */}

          <div className="mt-10 rounded-3xl border-l-4 border-green-500 bg-green-50 p-6">

            <h2 className="text-2xl font-bold text-green-700">
              💡 Earnings Tips
            </h2>

            <ul className="mt-5 list-disc space-y-3 pl-6 text-gray-700">

              <li>Complete deliveries during peak hours to earn surge incentives.</li>

              <li>Maintain a customer rating above 4.8 for bonus rewards.</li>

              <li>Accept more delivery requests to improve incentive eligibility.</li>

              <li>Complete weekly targets to unlock additional payouts.</li>

              <li>Keep your documents and bank details updated for faster settlements.</li>

            </ul>

          </div>

        </section>

      </main>

    </>

  );

}