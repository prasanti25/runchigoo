import Navbar from "../../components/Navbar.jsx";

import {
  Store,
  Search,
  Filter,
  Download,
  Plus,
} from "lucide-react";

export default function RestaurantManagement() {

  const restaurants = [
    {
      id: "RST001",
      name: "Paradise Biryani",
      owner: "Rahul Sharma",
      rating: "4.9",
      orders: "4520",
      revenue: "₹18.6L",
      status: "Active",
    },
    {
      id: "RST002",
      name: "Domino's Pizza",
      owner: "Priya Reddy",
      rating: "4.8",
      orders: "3980",
      revenue: "₹15.2L",
      status: "Active",
    },
    {
      id: "RST003",
      name: "Burger King",
      owner: "Vikram Kumar",
      rating: "4.7",
      orders: "3220",
      revenue: "₹12.9L",
      status: "Pending",
    },
    {
      id: "RST004",
      name: "KFC",
      owner: "Sneha Patel",
      rating: "4.7",
      orders: "3540",
      revenue: "₹13.8L",
      status: "Suspended",
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
                Restaurant Management
              </h1>

              <p className="mt-3 text-gray-500">
                Manage restaurant registrations, approvals, performance and operational status.
              </p>

            </div>

            <div className="flex gap-4">

              <button className="flex items-center gap-2 rounded-2xl border px-5 py-3 font-semibold hover:bg-gray-100">

                <Download size={18} />

                Export

              </button>

              <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600">

                <Plus size={18} />

                Add Restaurant

              </button>

            </div>

          </div>

          {/* Statistics */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {[
              {
                title: "Total Restaurants",
                value: "540",
                color: "text-orange-600",
              },
              {
                title: "Active",
                value: "498",
                color: "text-green-600",
              },
              {
                title: "Pending Approval",
                value: "24",
                color: "text-yellow-600",
              },
              {
                title: "Suspended",
                value: "18",
                color: "text-red-600",
              },
            ].map((item) => (

              <div
                key={item.title}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >

                <Store className={item.color} size={30} />

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
                  placeholder="Search restaurant, owner or restaurant ID..."
                  className="w-full rounded-2xl border py-3 pl-12 pr-4 outline-none focus:border-orange-500"
                />

              </div>

              <select className="rounded-2xl border px-5 py-3 outline-none focus:border-orange-500">

                <option>All Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>

              </select>

              <button className="flex items-center justify-center gap-2 rounded-2xl border px-6 py-3 hover:bg-gray-100">

                <Filter size={18} />

                Filters

              </button>

            </div>

          </div>

          {/* Restaurant Table */}
                    <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-orange-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Restaurant
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Restaurant ID
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Owner
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Rating
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Orders
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Revenue
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

                  {restaurants.map((restaurant) => (

                    <tr
                      key={restaurant.id}
                      className="border-t transition hover:bg-orange-50/40"
                    >

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-4">

                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              restaurant.name
                            )}&background=f97316&color=fff`}
                            alt={restaurant.name}
                            className="h-12 w-12 rounded-full"
                          />

                          <div>

                            <h3 className="font-semibold text-gray-900">
                              {restaurant.name}
                            </h3>

                            <p className="text-sm text-gray-500">
                              Restaurant
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-5 font-medium text-gray-700">
                        {restaurant.id}
                      </td>

                      <td className="px-6 py-5 text-gray-700">
                        {restaurant.owner}
                      </td>

                      <td className="px-6 py-5">

                        <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">

                          ⭐ {restaurant.rating}

                        </span>

                      </td>

                      <td className="px-6 py-5 font-semibold text-gray-700">
                        {restaurant.orders}
                      </td>

                      <td className="px-6 py-5 font-semibold text-green-600">
                        {restaurant.revenue}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-4 py-2 text-sm font-semibold
                            ${
                              restaurant.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : restaurant.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                          {restaurant.status}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <div className="flex flex-wrap justify-center gap-2">

                          <button className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">
                            View
                          </button>

                          <button className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-600">
                            Edit
                          </button>

                          {restaurant.status === "Pending" ? (

                            <button className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600">
                              Approve
                            </button>

                          ) : restaurant.status === "Active" ? (

                            <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
                              Suspend
                            </button>

                          ) : (

                            <button className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600">
                              Activate
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

          {/* Restaurant Overview */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Restaurant Overview */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Restaurant Overview
              </h2>

              <p className="mt-2 text-gray-500">
                Current distribution of restaurants on the platform.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-5">

                <div className="rounded-2xl bg-orange-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-orange-600">
                    540
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Total Restaurants
                  </p>

                </div>

                <div className="rounded-2xl bg-green-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-green-600">
                    498
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Active
                  </p>

                </div>

                <div className="rounded-2xl bg-yellow-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-yellow-600">
                    24
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Pending Approval
                  </p>

                </div>

                <div className="rounded-2xl bg-red-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-red-600">
                    18
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Suspended
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
                Revenue generated from restaurants this week.
              </p>

              <div className="mt-8 flex h-64 items-end justify-between gap-4">

                {[
                  { day: "Mon", value: 45 },
                  { day: "Tue", value: 58 },
                  { day: "Wed", value: 70 },
                  { day: "Thu", value: 82 },
                  { day: "Fri", value: 95 },
                  { day: "Sat", value: 100 },
                  { day: "Sun", value: 76 },
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

          {/* Top Rated Restaurants */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Top Rated Restaurants
              </h2>

              <div className="mt-8 space-y-5">

                {[
                  {
                    name: "Paradise Biryani",
                    rating: "4.9",
                    orders: "4520",
                  },
                  {
                    name: "Domino's Pizza",
                    rating: "4.8",
                    orders: "3980",
                  },
                  {
                    name: "Mehfil Restaurant",
                    rating: "4.8",
                    orders: "3850",
                  },
                  {
                    name: "Burger King",
                    rating: "4.7",
                    orders: "3220",
                  },
                  {
                    name: "KFC",
                    rating: "4.7",
                    orders: "3540",
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

                    <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
                      ⭐ {restaurant.rating}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Recently Registered */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Recently Registered Restaurants
              </h2>

              <div className="mt-8 space-y-5">

                {[
                  "Spicy Hub",
                  "Royal Kitchen",
                  "Tandoori House",
                  "Food Junction",
                  "Urban Bites",
                ].map((restaurant, index) => (

                  <div
                    key={restaurant}
                    className="flex items-center justify-between rounded-2xl border p-4"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">

                        {index + 1}

                      </div>

                      <span className="font-medium text-gray-800">
                        {restaurant}
                      </span>

                    </div>

                    <span className="text-sm text-gray-500">
                      Today
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Business Insights */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Business Insights */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Business Insights
              </h2>

              <p className="mt-2 text-gray-500">
                Platform performance overview for restaurant operations.
              </p>

              <div className="mt-8 space-y-5">

                <div className="rounded-2xl bg-green-50 p-5">

                  <h3 className="font-semibold text-green-700">
                    📈 Revenue Growth
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Restaurant revenue increased by <strong>22%</strong> compared
                    to last week.
                  </p>

                </div>

                <div className="rounded-2xl bg-blue-50 p-5">

                  <h3 className="font-semibold text-blue-700">
                    🍽 Restaurant Performance
                  </h3>

                  <p className="mt-2 text-gray-600">
                    <strong>94%</strong> of restaurants maintained a customer
                    rating above 4.5 stars.
                  </p>

                </div>

                <div className="rounded-2xl bg-yellow-50 p-5">

                  <h3 className="font-semibold text-yellow-700">
                    ⏱ Average Delivery Time
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Average food delivery time is <strong>28 minutes</strong>
                    across all cities.
                  </p>

                </div>

                <div className="rounded-2xl bg-red-50 p-5">

                  <h3 className="font-semibold text-red-700">
                    ⚠ Pending Approvals
                  </h3>

                  <p className="mt-2 text-gray-600">
                    <strong>24</strong> new restaurant registrations are waiting
                    for administrator approval.
                  </p>

                </div>

              </div>

            </div>

            {/* Order Performance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Order Performance
              </h2>

              <p className="mt-2 text-gray-500">
                Overall platform order statistics.
              </p>

              <div className="mt-8 space-y-6">

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Total Orders Completed</span>

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

                    <span>Orders Cancelled</span>

                    <span className="font-bold text-red-600">
                      2%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{ width: "2%" }}
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

              </div>

            </div>

          </div>

          {/* Footer */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">

            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">

              <div>

                <h2 className="text-3xl font-bold">
                  Restaurant Management Center
                </h2>

                <p className="mt-2 text-orange-100">
                  Manage restaurant partners, approvals, ratings, revenue and
                  operational performance from one place.
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