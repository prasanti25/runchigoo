import RestaurantSidebar from "../components/RestaurantSidebar.jsx";
import {
  IndianRupee,
  Wallet,
  Clock,
  TrendingUp,
  Download,
  CalendarDays,
  ArrowUpRight,
  CheckCircle2,
  Search,
} from "lucide-react";

const transactions = [
  {
    id: "TXN-RG-98421",
    orderId: "#RG1290",
    date: "13 Jul 2026",
    amount: "₹433",
    commission: "₹43",
    earnings: "₹390",
    status: "Completed",
  },
  {
    id: "TXN-RG-98420",
    orderId: "#RG1289",
    date: "13 Jul 2026",
    amount: "₹648",
    commission: "₹65",
    earnings: "₹583",
    status: "Completed",
  },
  {
    id: "TXN-RG-98419",
    orderId: "#RG1288",
    date: "13 Jul 2026",
    amount: "₹348",
    commission: "₹35",
    earnings: "₹313",
    status: "Pending",
  },
  {
    id: "TXN-RG-98418",
    orderId: "#RG1287",
    date: "12 Jul 2026",
    amount: "₹599",
    commission: "₹60",
    earnings: "₹539",
    status: "Completed",
  },
  {
    id: "TXN-RG-98417",
    orderId: "#RG1286",
    date: "12 Jul 2026",
    amount: "₹896",
    commission: "₹90",
    earnings: "₹806",
    status: "Completed",
  },
];

const weeklyEarnings = [
  { day: "Mon", amount: 18000 },
  { day: "Tue", amount: 24000 },
  { day: "Wed", amount: 19500 },
  { day: "Thu", amount: 28500 },
  { day: "Fri", amount: 32000 },
  { day: "Sat", amount: 42000 },
  { day: "Sun", amount: 36500 },
];

export default function RestaurantEarnings() {
  const maxEarning = Math.max(
    ...weeklyEarnings.map((item) => item.amount)
  );

  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <RestaurantSidebar />

      <main className="ml-72 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-orange-100 bg-white px-8 py-5">
          <div>
            <p className="text-sm text-gray-500">
              Financial Overview
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Earnings
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-5 py-3 font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500">
              <CalendarDays size={19} />
              This Week
            </button>

            <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
              <Download size={19} />
              Download Report
            </button>
          </div>
        </header>

        <section className="p-8">
          {/* Stats */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <IndianRupee size={24} />
                </div>

                <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-600">
                  +18.2%
                </span>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Total Earnings
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                ₹4,82,450
              </h2>

              <p className="mt-3 text-xs text-gray-400">
                Current month
              </p>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <TrendingUp size={24} />
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Today's Revenue
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                ₹32,450
              </h2>

              <p className="mt-3 text-xs text-green-600">
                128 completed orders
              </p>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Wallet size={24} />
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Available Balance
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                ₹86,320
              </h2>

              <button className="mt-3 flex items-center gap-1 text-xs font-semibold text-orange-500">
                Request Payout
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                <Clock size={24} />
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Pending Settlement
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                ₹12,680
              </h2>

              <p className="mt-3 text-xs text-gray-400">
                Expected by 15 Jul
              </p>
            </div>
          </div>

          {/* Earnings Chart + Payout */}
          <div className="mt-8 grid gap-7 xl:grid-cols-[1.7fr_1fr]">
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Earnings Overview
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Your earnings performance for this week.
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-600">
                  +14.8% this week
                </span>
              </div>

              <div className="mt-10 flex h-72 items-end justify-between gap-5 border-b border-gray-100">
                {weeklyEarnings.map((item) => {
                  const height =
                    (item.amount / maxEarning) * 100;

                  return (
                    <div
                      key={item.day}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <p className="mb-3 text-xs font-semibold text-gray-500">
                        ₹{item.amount / 1000}K
                      </p>

                      <div
                        className="w-full max-w-14 rounded-t-2xl bg-gradient-to-t from-orange-600 to-orange-400 transition hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />

                      <p className="mt-4 pb-4 text-sm font-medium text-gray-500">
                        {item.day}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="rounded-3xl bg-gradient-to-br from-orange-600 to-orange-400 p-7 text-white shadow-lg">
              <p className="text-sm text-orange-100">
                Next Settlement
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                ₹86,320
              </h2>

              <p className="mt-3 text-orange-100">
                Scheduled for 15 July 2026
              </p>

              <div className="mt-8 rounded-2xl bg-white/15 p-5 backdrop-blur-lg">
                <p className="text-sm text-orange-100">
                  Bank Account
                </p>

                <p className="mt-2 text-lg font-bold">
                  HDFC Bank
                </p>

                <p className="mt-1 text-sm text-orange-100">
                  •••• •••• 4821
                </p>
              </div>

              <button className="mt-7 w-full rounded-2xl bg-white px-6 py-4 font-bold text-orange-500 transition hover:bg-orange-50">
                Manage Payout Account
              </button>

              <div className="mt-6 flex items-center gap-2 text-sm text-orange-100">
                <CheckCircle2 size={18} />
                Bank account verified
              </div>
            </aside>
          </div>

          {/* Transactions */}
          <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Transaction History
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  View your latest order earnings and commission details.
                </p>
              </div>

              <div className="flex items-center rounded-xl bg-gray-50 px-4">
                <Search size={18} className="text-gray-400" />

                <input
                  type="text"
                  placeholder="Search transaction..."
                  className="w-64 bg-transparent px-3 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div className="mt-7 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-400">
                    <th className="pb-4 font-medium">
                      Transaction ID
                    </th>

                    <th className="pb-4 font-medium">
                      Order ID
                    </th>

                    <th className="pb-4 font-medium">
                      Date
                    </th>

                    <th className="pb-4 font-medium">
                      Order Amount
                    </th>

                    <th className="pb-4 font-medium">
                      Commission
                    </th>

                    <th className="pb-4 font-medium">
                      Your Earnings
                    </th>

                    <th className="pb-4 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-50"
                    >
                      <td className="py-5 font-semibold text-gray-900">
                        {transaction.id}
                      </td>

                      <td className="py-5 text-orange-500">
                        {transaction.orderId}
                      </td>

                      <td className="py-5 text-gray-500">
                        {transaction.date}
                      </td>

                      <td className="py-5 font-medium text-gray-700">
                        {transaction.amount}
                      </td>

                      <td className="py-5 text-red-500">
                        - {transaction.commission}
                      </td>

                      <td className="py-5 font-bold text-gray-900">
                        {transaction.earnings}
                      </td>

                      <td className="py-5">
                        <span
                          className={`rounded-full px-3 py-2 text-xs font-semibold ${
                            transaction.status === "Completed"
                              ? "bg-green-50 text-green-600"
                              : "bg-yellow-50 text-yellow-600"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}