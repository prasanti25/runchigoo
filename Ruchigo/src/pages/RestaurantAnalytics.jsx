import RestaurantSidebar from "../components/RestaurantSidebar.jsx";
import {
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Users,
  Star,
  CalendarDays,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";

const weeklyOrders = [
  { day: "Mon", orders: 82 },
  { day: "Tue", orders: 96 },
  { day: "Wed", orders: 88 },
  { day: "Thu", orders: 112 },
  { day: "Fri", orders: 128 },
  { day: "Sat", orders: 164 },
  { day: "Sun", orders: 148 },
];

const topItems = [
  {
    id: 1,
    name: "Chicken Dum Biryani",
    category: "Biryani",
    orders: 248,
    revenue: "₹61,752",
    rating: "4.8",
    icon: "🍛",
  },
  {
    id: 2,
    name: "Special Chicken Biryani",
    category: "Biryani",
    orders: 186,
    revenue: "₹55,614",
    rating: "4.7",
    icon: "🥘",
  },
  {
    id: 3,
    name: "Chicken 65",
    category: "Starters",
    orders: 156,
    revenue: "₹31,044",
    rating: "4.6",
    icon: "🍗",
  },
  {
    id: 4,
    name: "Butter Chicken",
    category: "Main Course",
    orders: 112,
    revenue: "₹31,248",
    rating: "4.6",
    icon: "🍲",
  },
];

const peakHours = [
  { time: "10 AM", orders: 25 },
  { time: "12 PM", orders: 65 },
  { time: "2 PM", orders: 88 },
  { time: "4 PM", orders: 42 },
  { time: "6 PM", orders: 76 },
  { time: "8 PM", orders: 120 },
  { time: "10 PM", orders: 92 },
];

export default function RestaurantAnalytics() {
  const maxOrders = Math.max(
    ...weeklyOrders.map((item) => item.orders)
  );

  const maxPeakOrders = Math.max(
    ...peakHours.map((item) => item.orders)
  );

  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <RestaurantSidebar />

      <main className="ml-72 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-orange-100 bg-white px-8 py-5">
          <div>
            <p className="text-sm text-gray-500">
              Business Insights
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Restaurant Analytics
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-5 py-3 font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500">
              <CalendarDays size={19} />
              Last 7 Days
            </button>

            <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
              <Download size={19} />
              Export Report
            </button>
          </div>
        </header>

        <section className="p-8">
          {/* Analytics Stats */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <ShoppingBag size={23} />
                </div>

                <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-600">
                  <ArrowUpRight size={14} />
                  12.5%
                </span>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Total Orders
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                818
              </h2>

              <p className="mt-3 text-xs text-gray-400">
                Compared to last week
              </p>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <IndianRupee size={23} />
                </div>

                <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-600">
                  <ArrowUpRight size={14} />
                  18.2%
                </span>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Total Revenue
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                ₹2,01,500
              </h2>

              <p className="mt-3 text-xs text-gray-400">
                Last 7 days
              </p>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Users size={23} />
                </div>

                <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-600">
                  <ArrowUpRight size={14} />
                  8.4%
                </span>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                New Customers
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                284
              </h2>

              <p className="mt-3 text-xs text-gray-400">
                68% returning customers
              </p>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                  <Star size={23} />
                </div>

                <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-500">
                  <ArrowDownRight size={14} />
                  0.2%
                </span>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Average Rating
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                4.6
              </h2>

              <p className="mt-3 text-xs text-gray-400">
                Based on 1.8K reviews
              </p>
            </div>
          </div>

          {/* Orders Chart + Performance */}
          <div className="mt-8 grid gap-7 xl:grid-cols-[1.7fr_1fr]">
            {/* Weekly Orders */}
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Weekly Orders
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Daily order performance for the last 7 days.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                  <TrendingUp size={18} />
                  +12.5%
                </div>
              </div>

              <div className="mt-10 flex h-72 items-end justify-between gap-5 border-b border-gray-100">
                {weeklyOrders.map((item) => {
                  const height =
                    (item.orders / maxOrders) * 100;

                  return (
                    <div
                      key={item.day}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <p className="mb-3 text-xs font-semibold text-gray-500">
                        {item.orders}
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

            {/* Performance */}
            <aside className="rounded-3xl bg-gradient-to-br from-orange-600 to-orange-400 p-7 text-white shadow-lg">
              <p className="text-sm text-orange-100">
                Performance Score
              </p>

              <div className="mt-5 flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-white/30">
                <div className="text-center">
                  <p className="text-4xl font-bold">
                    92
                  </p>

                  <p className="text-xs text-orange-100">
                    / 100
                  </p>
                </div>
              </div>

              <h2 className="mt-7 text-2xl font-bold">
                Excellent Performance 🎉
              </h2>

              <p className="mt-3 leading-7 text-orange-50">
                Your restaurant is performing better than 87% of
                restaurants in your area.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Order Acceptance</span>
                  <span className="font-bold">98%</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>On-time Preparation</span>
                  <span className="font-bold">94%</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Customer Satisfaction</span>
                  <span className="font-bold">96%</span>
                </div>
              </div>
            </aside>
          </div>

          {/* Top Items */}
          <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Top Selling Items
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Your best performing food items this week.
              </p>
            </div>

            <div className="mt-7 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-400">
                    <th className="pb-4 font-medium">
                      Food Item
                    </th>

                    <th className="pb-4 font-medium">
                      Category
                    </th>

                    <th className="pb-4 font-medium">
                      Orders
                    </th>

                    <th className="pb-4 font-medium">
                      Revenue
                    </th>

                    <th className="pb-4 font-medium">
                      Rating
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {topItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50"
                    >
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-3xl">
                            {item.icon}
                          </div>

                          <p className="font-bold text-gray-900">
                            {item.name}
                          </p>
                        </div>
                      </td>

                      <td className="py-5 text-gray-500">
                        {item.category}
                      </td>

                      <td className="py-5 font-semibold text-gray-900">
                        {item.orders}
                      </td>

                      <td className="py-5 font-bold text-gray-900">
                        {item.revenue}
                      </td>

                      <td className="py-5">
                        <span className="rounded-full bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-600">
                          ⭐ {item.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Peak Order Hours */}
          <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock className="text-orange-500" />

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Peak Order Hours
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Understand when customers order the most.
                </p>
              </div>
            </div>

            <div className="mt-10 flex h-64 items-end justify-between gap-4">
              {peakHours.map((item) => {
                const height =
                  (item.orders / maxPeakOrders) * 100;

                return (
                  <div
                    key={item.time}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <p className="mb-3 text-xs font-semibold text-gray-500">
                      {item.orders}
                    </p>

                    <div
                      className="w-full max-w-16 rounded-t-xl bg-orange-400 transition hover:bg-orange-500"
                      style={{ height: `${height}%` }}
                    />

                    <p className="mt-4 text-xs font-medium text-gray-500">
                      {item.time}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}