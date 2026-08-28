import Navbar from "../../components/Navbar.jsx";

import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  CalendarDays,
} from "lucide-react";

export default function OrderManagement() {

  const orders = [
    {
      id: "ORD10231",
      customer: "Rahul Sharma",
      restaurant: "Paradise Biryani",
      partner: "Ramesh",
      amount: "₹520",
      payment: "Paid",
      status: "Delivered",
      date: "20 Jul 2026",
    },
    {
      id: "ORD10232",
      customer: "Priya Reddy",
      restaurant: "Burger King",
      partner: "Arjun",
      amount: "₹340",
      payment: "Paid",
      status: "Preparing",
      date: "20 Jul 2026",
    },
    {
      id: "ORD10233",
      customer: "Kiran Kumar",
      restaurant: "KFC",
      partner: "-",
      amount: "₹760",
      payment: "Pending",
      status: "Pending",
      date: "20 Jul 2026",
    },
    {
      id: "ORD10234",
      customer: "Sneha Patel",
      restaurant: "Domino's Pizza",
      partner: "Sanjay",
      amount: "₹430",
      payment: "Paid",
      status: "Cancelled",
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
                Order Management
              </h1>

              <p className="mt-3 text-gray-500">
                Monitor, manage and track all customer orders across the platform.
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
                title: "Today's Orders",
                value: "1,284",
                color: "text-orange-600",
              },
              {
                title: "Delivered",
                value: "1,082",
                color: "text-green-600",
              },
              {
                title: "Pending",
                value: "126",
                color: "text-yellow-600",
              },
              {
                title: "Cancelled",
                value: "76",
                color: "text-red-600",
              },
            ].map((item) => (

              <div
                key={item.title}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >

                <ShoppingBag className={item.color} size={30} />

                <h3 className="mt-5 text-gray-500">
                  {item.title}
                </h3>

                <p className={`mt-2 text-3xl font-bold ${item.color}`}>
                  {item.value}
                </p>

              </div>

            ))}

          </div>

          {/* Search & Filters */}

          <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-5 lg:flex-row">

              <div className="relative flex-1">

                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search Order ID, Customer or Restaurant..."
                  className="w-full rounded-2xl border py-3 pl-12 pr-4 outline-none focus:border-orange-500"
                />

              </div>

              <select className="rounded-2xl border px-5 py-3 outline-none">

                <option>All Status</option>
                <option>Pending</option>
                <option>Preparing</option>
                <option>Out for Delivery</option>
                <option>Delivered</option>
                <option>Cancelled</option>

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

          {/* Orders Table */}
                    <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-orange-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Order
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Restaurant
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Delivery Partner
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {orders.map((order) => (

                    <tr
                      key={order.id}
                      className="border-t transition hover:bg-orange-50/40"
                    >

                      <td className="px-6 py-5">

                        <div>

                          <h3 className="font-semibold text-gray-900">
                            {order.id}
                          </h3>

                          <p className="text-sm text-gray-500">
                            {order.date}
                          </p>

                        </div>

                      </td>

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-4">

                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              order.customer
                            )}&background=f97316&color=fff`}
                            alt={order.customer}
                            className="h-12 w-12 rounded-full"
                          />

                          <div>

                            <h3 className="font-semibold text-gray-900">
                              {order.customer}
                            </h3>

                            <p className="text-sm text-gray-500">
                              Customer
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-5 font-medium text-gray-700">
                        {order.restaurant}
                      </td>

                      <td className="px-6 py-5 text-gray-700">
                        {order.partner}
                      </td>

                      <td className="px-6 py-5 font-semibold text-green-600">
                        {order.amount}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${
                            order.payment === "Paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.payment}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-4 py-2 text-sm font-semibold
                            ${
                              order.status === "Delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status === "Preparing"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : order.status === "Out for Delivery"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                          {order.status}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <div className="flex flex-wrap justify-center gap-2">

                          <button className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">
                            View
                          </button>

                          <button className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-600">
                            Update
                          </button>

                          {order.status !== "Cancelled" &&
                          order.status !== "Delivered" ? (

                            <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
                              Cancel
                            </button>

                          ) : order.status === "Cancelled" ? (

                            <button className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
                              Refund
                            </button>

                          ) : (

                            <button className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600">
                              Completed
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

          {/* Order Overview */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Order Overview */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Order Overview
              </h2>

              <p className="mt-2 text-gray-500">
                Overall order distribution across the platform.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-5">

                <div className="rounded-2xl bg-green-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-green-600">
                    18,450
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Delivered
                  </p>

                </div>

                <div className="rounded-2xl bg-yellow-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-yellow-600">
                    620
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Preparing
                  </p>

                </div>

                <div className="rounded-2xl bg-blue-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-blue-600">
                    480
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Out for Delivery
                  </p>

                </div>

                <div className="rounded-2xl bg-red-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-red-600">
                    310
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Cancelled
                  </p>

                </div>

              </div>

            </div>

            {/* Weekly Orders */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Weekly Orders
              </h2>

              <p className="mt-2 text-gray-500">
                Orders processed during the last 7 days.
              </p>

              <div className="mt-8 flex h-64 items-end justify-between gap-4">

                {[
                  { day: "Mon", value: 40 },
                  { day: "Tue", value: 55 },
                  { day: "Wed", value: 68 },
                  { day: "Thu", value: 82 },
                  { day: "Fri", value: 94 },
                  { day: "Sat", value: 100 },
                  { day: "Sun", value: 78 },
                ].map((item) => (

                  <div
                    key={item.day}
                    className="flex flex-1 flex-col items-center"
                  >

                    <div
                      className="w-full rounded-t-xl bg-orange-500 transition hover:bg-orange-600"
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

          {/* Revenue & Top Restaurants */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Revenue Summary */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Revenue Summary
              </h2>

              <p className="mt-2 text-gray-500">
                Platform revenue generated from customer orders.
              </p>

              <div className="mt-8 space-y-6">

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Today's Revenue</span>

                    <span className="font-bold text-green-600">
                      ₹3.82L
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: "88%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>This Week</span>

                    <span className="font-bold text-blue-600">
                      ₹24.5L
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: "95%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>This Month</span>

                    <span className="font-bold text-orange-600">
                      ₹1.12Cr
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: "91%" }}
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* Top Restaurants */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Top Restaurants
              </h2>

              <p className="mt-2 text-gray-500">
                Restaurants with the highest order volume.
              </p>

              <div className="mt-8 space-y-5">

                {[
                  {
                    name: "Paradise Biryani",
                    orders: "4,520",
                  },
                  {
                    name: "Domino's Pizza",
                    orders: "3,980",
                  },
                  {
                    name: "KFC",
                    orders: "3,540",
                  },
                  {
                    name: "Burger King",
                    orders: "3,220",
                  },
                  {
                    name: "Mehfil Restaurant",
                    orders: "3,010",
                  },
                ].map((restaurant, index) => (

                  <div
                    key={restaurant.name}
                    className="flex items-center justify-between rounded-2xl border p-4 transition hover:bg-orange-50"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">

                        #{index + 1}

                      </div>

                      <div>

                        <h3 className="font-semibold text-gray-900">
                          {restaurant.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {restaurant.orders} Orders
                        </p>

                      </div>

                    </div>

                    <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                      Active
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Live Order Insights */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Live Order Insights */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Live Order Insights
              </h2>

              <p className="mt-2 text-gray-500">
                Current operational status of customer orders.
              </p>

              <div className="mt-8 space-y-5">

                <div className="rounded-2xl bg-blue-50 p-5">

                  <h3 className="font-semibold text-blue-700">
                    📦 Orders Being Prepared
                  </h3>

                  <p className="mt-2 text-gray-600">
                    <strong>126</strong> orders are currently being prepared by restaurants.
                  </p>

                </div>

                <div className="rounded-2xl bg-purple-50 p-5">

                  <h3 className="font-semibold text-purple-700">
                    🚚 Out for Delivery
                  </h3>

                  <p className="mt-2 text-gray-600">
                    <strong>98</strong> orders are currently assigned to delivery partners.
                  </p>

                </div>

                <div className="rounded-2xl bg-green-50 p-5">

                  <h3 className="font-semibold text-green-700">
                    ✅ Successfully Delivered
                  </h3>

                  <p className="mt-2 text-gray-600">
                    <strong>1,082</strong> orders have been successfully delivered today.
                  </p>

                </div>

                <div className="rounded-2xl bg-red-50 p-5">

                  <h3 className="font-semibold text-red-700">
                    ❌ Cancelled Orders
                  </h3>

                  <p className="mt-2 text-gray-600">
                    <strong>76</strong> orders were cancelled due to customer or restaurant requests.
                  </p>

                </div>

              </div>

            </div>

            {/* Recent Order Activity */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Recent Order Activity
              </h2>

              <p className="mt-2 text-gray-500">
                Latest updates from the platform.
              </p>

              <div className="mt-8 space-y-5">

                {[
                  {
                    title: "Order Delivered",
                    desc: "ORD10231 delivered successfully.",
                    time: "2 mins ago",
                    color: "bg-green-100 text-green-700",
                  },
                  {
                    title: "New Order",
                    desc: "ORD10245 placed at Paradise Biryani.",
                    time: "5 mins ago",
                    color: "bg-blue-100 text-blue-700",
                  },
                  {
                    title: "Refund Requested",
                    desc: "ORD10220 refund initiated.",
                    time: "12 mins ago",
                    color: "bg-yellow-100 text-yellow-700",
                  },
                  {
                    title: "Order Cancelled",
                    desc: "ORD10218 cancelled by customer.",
                    time: "18 mins ago",
                    color: "bg-red-100 text-red-700",
                  },
                ].map((activity) => (

                  <div
                    key={activity.title + activity.time}
                    className="flex items-start justify-between rounded-2xl border p-4 transition hover:bg-orange-50"
                  >

                    <div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${activity.color}`}
                      >
                        {activity.title}
                      </span>

                      <p className="mt-3 text-gray-700">
                        {activity.desc}
                      </p>

                    </div>

                    <span className="text-sm text-gray-500">
                      {activity.time}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Admin Insights */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold text-gray-900">
              Admin Insights
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-3">

              <div className="rounded-2xl bg-green-50 p-6">

                <h3 className="font-semibold text-green-700">
                  📈 Growth
                </h3>

                <p className="mt-3 text-gray-600">
                  Daily order volume has increased by <strong>18%</strong> compared to yesterday.
                </p>

              </div>

              <div className="rounded-2xl bg-blue-50 p-6">

                <h3 className="font-semibold text-blue-700">
                  ⭐ Customer Satisfaction
                </h3>

                <p className="mt-3 text-gray-600">
                  Average customer rating remains at <strong>4.8/5</strong>.
                </p>

              </div>

              <div className="rounded-2xl bg-orange-50 p-6">

                <h3 className="font-semibold text-orange-700">
                  🚚 Delivery Performance
                </h3>

                <p className="mt-3 text-gray-600">
                  Average delivery time has improved to <strong>27 minutes</strong>.
                </p>

              </div>

            </div>

          </div>

          {/* Footer */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">

            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">

              <div>

                <h2 className="text-3xl font-bold">
                  Order Management Center
                </h2>

                <p className="mt-2 text-orange-100">
                  Monitor every order from placement to delivery, manage refunds,
                  cancellations, payments, and ensure a seamless customer experience.
                </p>

              </div>

              <div className="flex flex-wrap gap-4">

                <button className="rounded-2xl bg-white px-6 py-3 font-semibold text-orange-600 transition hover:bg-orange-100">
                  Refresh Dashboard
                </button>

                <button className="rounded-2xl border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-orange-600">
                  Export Report
                </button>

              </div>

            </div>

          </div>

        </section>

      </main>

    </>

  );

}