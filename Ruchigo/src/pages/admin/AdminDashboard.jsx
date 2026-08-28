import Navbar from "../../components/Navbar.jsx";

import {
  Users,
  Store,
  Bike,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {

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
                Dashboard Overview
              </h1>

              <p className="mt-3 text-gray-500">
                Monitor platform performance, users, restaurants, delivery partners and revenue.
              </p>

            </div>

            <button className="rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">

              Generate Report

            </button>

          </div>

          {/* Overview Cards */}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

            {[
              {
                title: "Total Users",
                value: "18,450",
                icon: <Users size={30} />,
                color: "bg-blue-100 text-blue-600",
              },
              {
                title: "Restaurants",
                value: "540",
                icon: <Store size={30} />,
                color: "bg-orange-100 text-orange-600",
              },
              {
                title: "Delivery Partners",
                value: "1,240",
                icon: <Bike size={30} />,
                color: "bg-green-100 text-green-600",
              },
              {
                title: "Today's Orders",
                value: "3,426",
                icon: <ShoppingBag size={30} />,
                color: "bg-purple-100 text-purple-600",
              },
              {
                title: "Today's Revenue",
                value: "₹8.42L",
                icon: <IndianRupee size={30} />,
                color: "bg-yellow-100 text-yellow-700",
              },
              {
                title: "Growth",
                value: "+18%",
                icon: <TrendingUp size={30} />,
                color: "bg-pink-100 text-pink-600",
              },
            ].map((card) => (

              <div
                key={card.title}
                className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-lg"
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

          {/* Revenue Analytics */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Revenue Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Revenue Analytics
              </h2>

              <p className="mt-2 text-gray-500">
                Revenue generated over the last 7 days.
              </p>

              <div className="mt-8 flex h-72 items-end justify-between gap-4">

                {[
                  { day: "Mon", value: 55 },
                  { day: "Tue", value: 68 },
                  { day: "Wed", value: 74 },
                  { day: "Thu", value: 82 },
                  { day: "Fri", value: 94 },
                  { day: "Sat", value: 100 },
                  { day: "Sun", value: 88 },
                ].map((item) => (

                  <div
                    key={item.day}
                    className="flex flex-1 flex-col items-center"
                  >

                    <div
                      className="w-full rounded-t-xl bg-orange-500 transition-all hover:bg-orange-600"
                      style={{ height: `${item.value * 2.2}px` }}
                    />

                    <span className="mt-3 text-sm font-medium text-gray-600">
                      {item.day}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Monthly Statistics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Monthly Statistics
              </h2>

              <p className="mt-2 text-gray-500">
                Current month's business performance.
              </p>

              <div className="mt-8 space-y-6">

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Total Orders</span>

                    <span className="font-bold text-orange-600">
                      82,540
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: "90%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Revenue Target</span>

                    <span className="font-bold text-green-600">
                      ₹2.4Cr / ₹3Cr
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: "80%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Customer Satisfaction</span>

                    <span className="font-bold text-blue-600">
                      96%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: "96%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Restaurant Growth</span>

                    <span className="font-bold text-purple-600">
                      +15%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: "75%" }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Top Performing Restaurants */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-8 flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Top Performing Restaurants
                </h2>

                <p className="mt-2 text-gray-500">
                  Restaurants with the highest orders and customer ratings.
                </p>

              </div>

            </div>

            <div className="space-y-5">

              {[
                {
                  name: "Paradise Biryani",
                  orders: "4,520 Orders",
                  rating: "4.9 ★",
                  revenue: "₹18.6L",
                },
                {
                  name: "Domino's Pizza",
                  orders: "3,980 Orders",
                  rating: "4.8 ★",
                  revenue: "₹15.2L",
                },
                {
                  name: "KFC",
                  orders: "3,540 Orders",
                  rating: "4.7 ★",
                  revenue: "₹13.8L",
                },
                {
                  name: "Burger King",
                  orders: "3,220 Orders",
                  rating: "4.7 ★",
                  revenue: "₹12.9L",
                },
              ].map((restaurant, index) => (

                <div
                  key={restaurant.name}
                  className="flex flex-col gap-5 rounded-2xl border p-5 lg:flex-row lg:items-center lg:justify-between"
                >

                  <div className="flex items-center gap-5">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">

                      #{index + 1}

                    </div>

                    <div>

                      <h3 className="font-bold text-gray-900">
                        {restaurant.name}
                      </h3>

                      <p className="text-gray-500">
                        {restaurant.orders}
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="font-semibold text-yellow-500">
                      {restaurant.rating}
                    </p>

                    <h4 className="text-xl font-bold text-green-600">
                      {restaurant.revenue}
                    </h4>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* Platform Performance */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Platform Performance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Platform Performance
              </h2>

              <p className="mt-2 text-gray-500">
                Overall performance metrics of the RuchiGo platform.
              </p>

              <div className="mt-8 space-y-6">

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>App Uptime</span>

                    <span className="font-bold text-green-600">
                      99.98%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: "99%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Order Success Rate</span>

                    <span className="font-bold text-blue-600">
                      97%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: "97%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Delivery Success Rate</span>

                    <span className="font-bold text-orange-600">
                      95%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: "95%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Customer Retention</span>

                    <span className="font-bold text-purple-600">
                      92%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: "92%" }}
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* Pending Approvals */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Pending Approvals
              </h2>

              <p className="mt-2 text-gray-500">
                Items requiring administrator action.
              </p>

              <div className="mt-8 space-y-5">

                {[
                  {
                    title: "Restaurant Registrations",
                    count: 18,
                    color: "bg-orange-100 text-orange-600",
                  },
                  {
                    title: "Delivery Partner Applications",
                    count: 27,
                    color: "bg-green-100 text-green-600",
                  },
                  {
                    title: "Refund Requests",
                    count: 12,
                    color: "bg-red-100 text-red-600",
                  },
                  {
                    title: "Restaurant Menu Updates",
                    count: 31,
                    color: "bg-blue-100 text-blue-600",
                  },
                ].map((item) => (

                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium text-gray-700">
                      {item.title}
                    </span>

                    <span className={`rounded-full px-4 py-2 font-bold ${item.color}`}>
                      {item.count}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Recent Activities */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-8">

              <h2 className="text-2xl font-bold text-gray-900">
                Recent Activities
              </h2>

              <p className="mt-2 text-gray-500">
                Latest actions happening across the platform.
              </p>

            </div>

            <div className="space-y-5">

              {[
                {
                  title: "New restaurant 'Spice Hub' joined the platform",
                  time: "5 minutes ago",
                },
                {
                  title: "Delivery partner Rahul Verma completed 1000 deliveries",
                  time: "18 minutes ago",
                },
                {
                  title: "Order #RG125894 successfully delivered",
                  time: "26 minutes ago",
                },
                {
                  title: "Customer submitted a 5★ review for Pizza Palace",
                  time: "42 minutes ago",
                },
                {
                  title: "Monthly payout processed for 1,240 delivery partners",
                  time: "1 hour ago",
                },
              ].map((activity) => (

                <div
                  key={activity.title}
                  className="flex items-start gap-4 rounded-2xl border p-5"
                >

                  <div className="mt-1 h-3 w-3 rounded-full bg-orange-500" />

                  <div>

                    <h3 className="font-semibold text-gray-900">
                      {activity.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {activity.time}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* Quick Overview */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Quick Actions */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Quick Actions
              </h2>

              <p className="mt-2 text-gray-500">
                Frequently used administrative actions.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-5">

                <button className="rounded-2xl bg-orange-500 p-5 font-semibold text-white transition hover:bg-orange-600">
                  👥 Manage Users
                </button>

                <button className="rounded-2xl bg-blue-500 p-5 font-semibold text-white transition hover:bg-blue-600">
                  🍽 Restaurants
                </button>

                <button className="rounded-2xl bg-green-500 p-5 font-semibold text-white transition hover:bg-green-600">
                  🚴 Delivery Partners
                </button>

                <button className="rounded-2xl bg-purple-500 p-5 font-semibold text-white transition hover:bg-purple-600">
                  📦 View Orders
                </button>

                <button className="rounded-2xl bg-yellow-500 p-5 font-semibold text-white transition hover:bg-yellow-600">
                  💳 Payments
                </button>

                <button className="rounded-2xl bg-red-500 p-5 font-semibold text-white transition hover:bg-red-600">
                  📊 Analytics
                </button>

              </div>

            </div>

            {/* System Health */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                System Health
              </h2>

              <p className="mt-2 text-gray-500">
                Current platform status and infrastructure health.
              </p>

              <div className="mt-8 space-y-5">

                {[
                  {
                    name: "API Server",
                    status: "Operational",
                    color: "bg-green-500",
                  },
                  {
                    name: "Database",
                    status: "Healthy",
                    color: "bg-green-500",
                  },
                  {
                    name: "Payment Gateway",
                    status: "Operational",
                    color: "bg-green-500",
                  },
                  {
                    name: "Notification Service",
                    status: "Running",
                    color: "bg-green-500",
                  },
                  {
                    name: "Storage Service",
                    status: "Healthy",
                    color: "bg-green-500",
                  },
                ].map((service) => (

                  <div
                    key={service.name}
                    className="flex items-center justify-between rounded-2xl border p-4"
                  >

                    <span className="font-medium text-gray-800">
                      {service.name}
                    </span>

                    <div className="flex items-center gap-3">

                      <div
                        className={`h-3 w-3 rounded-full ${service.color}`}
                      />

                      <span className="font-semibold text-green-600">
                        {service.status}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Admin Tips */}

          <div className="mt-10 rounded-3xl border-l-4 border-orange-500 bg-orange-50 p-8">

            <h2 className="text-2xl font-bold text-orange-700">
              💡 Administrator Tips
            </h2>

            <ul className="mt-6 list-disc space-y-3 pl-6 text-gray-700">

              <li>Review pending restaurant and delivery partner approvals daily.</li>

              <li>Monitor revenue reports and order trends regularly.</li>

              <li>Resolve refund requests promptly to improve customer satisfaction.</li>

              <li>Track platform performance and uptime for uninterrupted service.</li>

              <li>Regularly verify restaurant compliance and delivery partner documents.</li>

              <li>Use analytics to identify peak business hours and optimize operations.</li>

            </ul>

          </div>

          {/* Footer Summary */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">

            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">

              <div>

                <h2 className="text-3xl font-bold">
                  RuchiGo Admin Console
                </h2>

                <p className="mt-2 text-orange-100">
                  Version 1.0.0 • Platform Monitoring & Administration
                </p>

              </div>

              <div className="text-center lg:text-right">

                <h3 className="text-xl font-bold">
                  Platform Status
                </h3>

                <p className="mt-2 rounded-full bg-white/20 px-5 py-2 font-semibold inline-block">
                  🟢 All Systems Operational
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

    </>

  );

}