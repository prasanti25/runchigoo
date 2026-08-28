import DeliverySidebar from "../components/DeliverySidebar.jsx";
import {
  IndianRupee,
  Bike,
  Clock,
  TrendingUp,
  Wallet,
  Gift,
  CalendarDays,
  Download,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

const weeklyEarnings = [
  { day: "Mon", amount: 820 },
  { day: "Tue", amount: 1040 },
  { day: "Wed", amount: 960 },
  { day: "Thu", amount: 1180 },
  { day: "Fri", amount: 1240 },
  { day: "Sat", amount: 1680 },
  { day: "Sun", amount: 1420 },
];

const deliveryHistory = [
  {
    id: "#RG1290",
    restaurant: "Paradise Biryani",
    distance: "3.8 km",
    time: "24 min",
    earning: "₹68",
    date: "15 Jul, 7:30 PM",
  },
  {
    id: "#RG1287",
    restaurant: "Pizza Hub",
    distance: "4.2 km",
    time: "28 min",
    earning: "₹74",
    date: "15 Jul, 6:42 PM",
  },
  {
    id: "#RG1284",
    restaurant: "Burger House",
    distance: "2.6 km",
    time: "18 min",
    earning: "₹55",
    date: "15 Jul, 5:58 PM",
  },
  {
    id: "#RG1281",
    restaurant: "Spice Kitchen",
    distance: "5.4 km",
    time: "32 min",
    earning: "₹86",
    date: "15 Jul, 4:46 PM",
  },
  {
    id: "#RG1278",
    restaurant: "Food Palace",
    distance: "6.1 km",
    time: "38 min",
    earning: "₹96",
    date: "15 Jul, 3:35 PM",
  },
];

export default function DeliveryEarnings() {
  const maxEarning = Math.max(
    ...weeklyEarnings.map((item) => item.amount)
  );

  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <DeliverySidebar />

      <main className="ml-72 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-orange-100 bg-white px-8 py-5">
          <div>
            <p className="text-sm text-gray-500">
              Financial Overview
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              My Earnings
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-5 py-3 font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500">
              <CalendarDays size={19} />
              This Week
            </button>

            <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
              <Download size={19} />
              Download Statement
            </button>
          </div>
        </header>

        <section className="p-8">
          {/* Stats */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <IndianRupee size={23} />
                </div>

                <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-600">
                  <ArrowUpRight size={14} />
                  18.5%
                </span>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Today's Earnings
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                ₹1,240
              </h2>

              <p className="mt-3 text-xs text-green-600">
                ₹194 more than yesterday
              </p>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Bike size={23} />
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Deliveries Today
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                18
              </h2>

              <p className="mt-3 text-xs text-gray-400">
                Average ₹68 per delivery
              </p>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Clock size={23} />
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Online Hours
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                6h 42m
              </h2>

              <p className="mt-3 text-xs text-gray-400">
                ₹185 earned per hour
              </p>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <Wallet size={23} />
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Available Balance
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                ₹6,840
              </h2>

              <button className="mt-3 text-xs font-semibold text-orange-500">
                Withdraw Earnings →
              </button>
            </div>
          </div>

          {/* Chart and Incentive */}
          <div className="mt-8 grid gap-7 xl:grid-cols-[1.7fr_1fr]">
            {/* Weekly Chart */}
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Weekly Earnings
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Your earnings performance for the last 7 days.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                  <TrendingUp size={18} />
                  +16.8%
                </div>
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
                        ₹{item.amount}
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

            {/* Incentive */}
            <aside className="rounded-3xl bg-gradient-to-br from-orange-600 to-orange-400 p-7 text-white shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <Gift size={27} />
              </div>

              <p className="mt-6 text-sm text-orange-100">
                Today's Incentive
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                ₹500 Bonus
              </h2>

              <p className="mt-4 leading-7 text-orange-50">
                Complete 25 deliveries today to unlock your bonus.
              </p>

              <div className="mt-7 rounded-2xl bg-white/15 p-5 backdrop-blur-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-100">
                    Progress
                  </span>

                  <span className="font-bold">
                    18 / 25
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-[72%] rounded-full bg-white" />
                </div>

                <p className="mt-4 text-sm text-orange-100">
                  7 more deliveries remaining
                </p>
              </div>

              <div className="mt-7 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <TrendingUp size={21} />

                <p className="text-sm leading-6">
                  You're on track to achieve today's target.
                </p>
              </div>
            </aside>
          </div>

          {/* Payout Card */}
          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Payout Summary
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Your next payout and bank account details.
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-3">
                <div className="rounded-2xl bg-orange-50 p-5">
                  <p className="text-sm text-gray-500">
                    Next Payout
                  </p>

                  <p className="mt-3 text-2xl font-bold text-gray-900">
                    ₹6,840
                  </p>
                </div>

                <div className="rounded-2xl bg-orange-50 p-5">
                  <p className="text-sm text-gray-500">
                    Payout Date
                  </p>

                  <p className="mt-3 text-lg font-bold text-gray-900">
                    18 Jul 2026
                  </p>
                </div>

                <div className="rounded-2xl bg-orange-50 p-5">
                  <p className="text-sm text-gray-500">
                    Payment Method
                  </p>

                  <p className="mt-3 text-lg font-bold text-gray-900">
                    HDFC •••• 4821
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-green-100 bg-green-50 p-6">
              <CheckCircle2
                size={34}
                className="text-green-600"
              />

              <h2 className="mt-5 text-xl font-bold text-gray-900">
                Payout Account Verified
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Your bank account is verified and ready to receive
                earnings.
              </p>

              <button className="mt-5 font-semibold text-green-600">
                Manage Account →
              </button>
            </div>
          </section>

          {/* Delivery History */}
          <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Earnings History
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Earnings from your recent completed deliveries.
              </p>
            </div>

            <div className="mt-7 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-400">
                    <th className="pb-4 font-medium">
                      Order ID
                    </th>

                    <th className="pb-4 font-medium">
                      Restaurant
                    </th>

                    <th className="pb-4 font-medium">
                      Distance
                    </th>

                    <th className="pb-4 font-medium">
                      Delivery Time
                    </th>

                    <th className="pb-4 font-medium">
                      Date
                    </th>

                    <th className="pb-4 font-medium">
                      Earnings
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {deliveryHistory.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="border-b border-gray-50"
                    >
                      <td className="py-5 font-semibold text-gray-900">
                        {delivery.id}
                      </td>

                      <td className="py-5 text-gray-600">
                        {delivery.restaurant}
                      </td>

                      <td className="py-5 text-gray-600">
                        {delivery.distance}
                      </td>

                      <td className="py-5 text-gray-600">
                        {delivery.time}
                      </td>

                      <td className="py-5 text-gray-500">
                        {delivery.date}
                      </td>

                      <td className="py-5 font-bold text-green-600">
                        {delivery.earning}
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