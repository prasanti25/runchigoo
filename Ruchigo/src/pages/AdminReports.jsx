import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  BarChart3,
  IndianRupee,
  ShoppingBag,
  Users,
  Store,
  TrendingUp,
  TrendingDown,
  Download,
  CalendarDays,
  FileText,
  Bike,
  Star,
  ArrowUpRight,
} from "lucide-react";

const monthlyRevenue = [
  { month: "Jan", value: 8.2 },
  { month: "Feb", value: 9.6 },
  { month: "Mar", value: 11.4 },
  { month: "Apr", value: 13.2 },
  { month: "May", value: 14.8 },
  { month: "Jun", value: 16.1 },
  { month: "Jul", value: 18.4 },
];

const orderPerformance = [
  { day: "Mon", orders: 4800 },
  { day: "Tue", orders: 6200 },
  { day: "Wed", orders: 5700 },
  { day: "Thu", orders: 7100 },
  { day: "Fri", orders: 8400 },
  { day: "Sat", orders: 9600 },
  { day: "Sun", orders: 8900 },
];

const topRestaurants = [
  {
    rank: 1,
    name: "Paradise Biryani",
    orders: "4,280",
    revenue: "₹8.4L",
    rating: "4.8",
  },
  {
    rank: 2,
    name: "Spice Kitchen",
    orders: "3,942",
    revenue: "₹7.2L",
    rating: "4.7",
  },
  {
    rank: 3,
    name: "Pizza Hub",
    orders: "3,184",
    revenue: "₹6.8L",
    rating: "4.6",
  },
  {
    rank: 4,
    name: "Burger House",
    orders: "2,840",
    revenue: "₹5.4L",
    rating: "4.5",
  },
  {
    rank: 5,
    name: "Royal Tiffins",
    orders: "2,186",
    revenue: "₹3.8L",
    rating: "4.4",
  },
];

const reportTypes = [
  {
    title: "Sales Report",
    description: "Revenue, transactions and order value analysis.",
    icon: IndianRupee,
  },
  {
    title: "Orders Report",
    description: "Order volume, cancellations and delivery analysis.",
    icon: ShoppingBag,
  },
  {
    title: "Customer Report",
    description: "Customer growth and platform activity analysis.",
    icon: Users,
  },
  {
    title: "Restaurant Report",
    description: "Restaurant performance and commission analysis.",
    icon: Store,
  },
  {
    title: "Delivery Report",
    description: "Delivery partner and delivery time analysis.",
    icon: Bike,
  },
];

const stats = [
  {
    title: "Monthly Revenue",
    value: "₹18.4L",
    change: "+21.4%",
    positive: true,
    icon: IndianRupee,
    style: "bg-green-50 text-green-600",
  },
  {
    title: "Total Orders",
    value: "48,920",
    change: "+18.5%",
    positive: true,
    icon: ShoppingBag,
    style: "bg-orange-50 text-orange-500",
  },
  {
    title: "New Customers",
    value: "1,248",
    change: "+12.8%",
    positive: true,
    icon: Users,
    style: "bg-blue-50 text-blue-600",
  },
  {
    title: "Cancellation Rate",
    value: "2.4%",
    change: "-0.8%",
    positive: true,
    icon: TrendingDown,
    style: "bg-purple-50 text-purple-600",
  },
];

export default function AdminReports() {
  const [period, setPeriod] = useState("This Month");

  const maxRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.value)
  );

  const maxOrders = Math.max(
    ...orderPerformance.map((item) => item.orders)
  );

  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <AdminSidebar />

      <main className="ml-72 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-orange-100 bg-white px-8 py-5">
          <div>
            <p className="text-sm text-gray-500">
              Platform Intelligence
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Reports & Analytics
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-orange-100 bg-white px-4">
              <CalendarDays
                size={18}
                className="text-orange-500"
              />

              <select
                value={period}
                onChange={(event) =>
                  setPeriod(event.target.value)
                }
                className="bg-transparent px-3 py-3 text-sm font-semibold text-gray-600 outline-none"
              >
                <option>This Week</option>
                <option>This Month</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>
            </div>

            <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
              <Download size={19} />
              Export Report
            </button>
          </div>
        </header>

        <section className="p-8">
          {/* Stats */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.style}`}
                    >
                      <Icon size={23} />
                    </div>

                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-600">
                      <ArrowUpRight size={14} />
                      {stat.change}
                    </span>
                  </div>

                  <p className="mt-6 text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h2>

                  <p className="mt-3 text-xs text-gray-400">
                    Selected period: {period}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="mt-8 grid gap-7 xl:grid-cols-2">
            {/* Revenue Chart */}
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Revenue Growth
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Monthly platform revenue performance.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                  <TrendingUp size={18} />
                  +21.4%
                </div>
              </div>

              <div className="mt-10 flex h-72 items-end justify-between gap-4 border-b border-gray-100">
                {monthlyRevenue.map((item) => {
                  const height =
                    (item.value / maxRevenue) * 100;

                  return (
                    <div
                      key={item.month}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <p className="mb-3 text-xs font-semibold text-gray-500">
                        ₹{item.value}L
                      </p>

                      <div
                        className="w-full max-w-12 rounded-t-2xl bg-gradient-to-t from-orange-600 to-orange-400 transition hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />

                      <p className="mt-4 pb-4 text-sm font-medium text-gray-500">
                        {item.month}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Order Chart */}
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Performance
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Daily order activity across RuchiGo.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                  <TrendingUp size={18} />
                  +18.5%
                </div>
              </div>

              <div className="mt-10 flex h-72 items-end justify-between gap-4 border-b border-gray-100">
                {orderPerformance.map((item) => {
                  const height =
                    (item.orders / maxOrders) * 100;

                  return (
                    <div
                      key={item.day}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <p className="mb-3 text-xs font-semibold text-gray-500">
                        {(item.orders / 1000).toFixed(1)}K
                      </p>

                      <div
                        className="w-full max-w-12 rounded-t-2xl bg-gradient-to-t from-blue-600 to-blue-400 transition hover:opacity-80"
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
          </div>

          {/* Reports and Performance */}
          <div className="mt-8 grid gap-7 xl:grid-cols-[1fr_1.5fr]">
            {/* Generate Reports */}
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Generate Reports
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Download detailed platform reports.
                </p>
              </div>

              <div className="mt-7 space-y-4">
                {reportTypes.map((report) => {
                  const Icon = report.icon;

                  return (
                    <div
                      key={report.title}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-orange-100 p-5 transition hover:bg-orange-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                          <Icon size={21} />
                        </div>

                        <div>
                          <p className="font-bold text-gray-900">
                            {report.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            {report.description}
                          </p>
                        </div>
                      </div>

                      <button
                        title={`Download ${report.title}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600"
                      >
                        <Download size={17} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Top Restaurants */}
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Top Performing Restaurants
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Restaurant ranking based on platform performance.
                  </p>
                </div>

                <BarChart3
                  size={25}
                  className="text-orange-500"
                />
              </div>

              <div className="mt-7 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-sm text-gray-400">
                      <th className="pb-4 font-medium">
                        Rank
                      </th>

                      <th className="pb-4 font-medium">
                        Restaurant
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
                    {topRestaurants.map((restaurant) => (
                      <tr
                        key={restaurant.rank}
                        className="border-b border-gray-50"
                      >
                        <td className="py-5">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
                              restaurant.rank === 1
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            #{restaurant.rank}
                          </div>
                        </td>

                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-500">
                              {restaurant.name
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .slice(0, 2)}
                            </div>

                            <p className="font-bold text-gray-900">
                              {restaurant.name}
                            </p>
                          </div>
                        </td>

                        <td className="py-5 font-semibold text-gray-600">
                          {restaurant.orders}
                        </td>

                        <td className="py-5 font-bold text-green-600">
                          {restaurant.revenue}
                        </td>

                        <td className="py-5">
                          <div className="flex items-center gap-2">
                            <Star
                              size={17}
                              className="fill-yellow-400 text-yellow-400"
                            />

                            <span className="font-bold text-gray-900">
                              {restaurant.rating}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Summary */}
          <section className="mt-8 rounded-3xl bg-gradient-to-r from-orange-600 to-orange-400 p-8 text-white shadow-lg">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <FileText size={27} />

                  <h2 className="text-2xl font-bold">
                    RuchiGo Performance Summary
                  </h2>
                </div>

                <p className="mt-4 max-w-3xl leading-7 text-orange-50">
                  Platform revenue, customer growth and order volume
                  continue to improve. Restaurant and delivery partner
                  performance remain stable with strong platform
                  activity.
                </p>
              </div>

              <button className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-orange-500 transition hover:bg-orange-50">
                <Download size={19} />
                Download Full Report
              </button>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}