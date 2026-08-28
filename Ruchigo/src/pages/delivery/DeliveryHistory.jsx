import Navbar from "../../components/Navbar.jsx";

import {
  Search,
  Star,
  Download,
} from "lucide-react";

export default function DeliveryHistory() {

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
                Delivery History
              </h1>

              <p className="mt-3 text-gray-500">
                View all completed, cancelled and previous deliveries.
              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">

              <Download size={20} />

              Download Report

            </button>

          </div>

          {/* Search & Filters */}

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <div className="grid gap-5 lg:grid-cols-3">

              <div className="relative">

                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  placeholder="Search by Order ID or Customer"
                  className="w-full rounded-2xl border py-3 pl-12 pr-4 outline-none focus:border-orange-500"
                />

              </div>

              <input
                type="date"
                className="rounded-2xl border p-3 outline-none focus:border-orange-500"
              />

              <select className="rounded-2xl border p-3 outline-none focus:border-orange-500">

                <option>All Orders</option>

                <option>Delivered</option>

                <option>Cancelled</option>

                <option>Returned</option>

              </select>

            </div>

          </div>

          {/* History List */}
                    <div className="mt-10 space-y-8">

            {[
              {
                id: "#RG102458",
                restaurant: "RuchiGo Restaurant",
                customer: "Rahul Sharma",
                address: "Jubilee Hills, Hyderabad",
                date: "20 Jul 2026",
                earnings: "₹145",
                rating: "5.0",
                status: "Delivered",
              },
              {
                id: "#RG102459",
                restaurant: "Spicy Hub",
                customer: "Sneha Reddy",
                address: "Gachibowli, Hyderabad",
                date: "19 Jul 2026",
                earnings: "₹180",
                rating: "4.8",
                status: "Delivered",
              },
              {
                id: "#RG102460",
                restaurant: "Burger House",
                customer: "Ajay Kumar",
                address: "Madhapur, Hyderabad",
                date: "18 Jul 2026",
                earnings: "₹0",
                rating: "-",
                status: "Cancelled",
              },
            ].map((order) => (

              <div
                key={order.id}
                className="rounded-3xl bg-white p-8 shadow-sm transition hover:shadow-md"
              >

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                  <div>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>

                    <h2 className="mt-4 text-2xl font-bold text-gray-900">
                      {order.id}
                    </h2>

                    <p className="mt-2 text-gray-500">
                      {order.date}
                    </p>

                  </div>

                  <div className="flex flex-wrap gap-6">

                    <div>

                      <p className="text-sm text-gray-500">
                        Earnings
                      </p>

                      <h3 className="text-xl font-bold text-green-600">
                        {order.earnings}
                      </h3>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">
                        Rating
                      </p>

                      <h3 className="flex items-center gap-1 text-xl font-bold text-yellow-500">

                        <Star size={18} />

                        {order.rating}

                      </h3>

                    </div>

                  </div>

                </div>

                {/* Order Details */}

                <div className="mt-8 grid gap-6 lg:grid-cols-2">

                  <div className="rounded-2xl bg-orange-50 p-6">

                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                      🏪 Restaurant
                    </h3>

                    <p className="font-semibold">
                      {order.restaurant}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-green-50 p-6">

                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                      👤 Customer
                    </h3>

                    <p className="font-semibold">
                      {order.customer}
                    </p>

                  </div>

                </div>

                <div className="mt-6 rounded-2xl border border-orange-100 p-6">

                  <h3 className="mb-3 text-lg font-bold text-gray-900">
                    📍 Delivery Address
                  </h3>

                  <p className="text-gray-600">
                    {order.address}
                  </p>

                </div>

                {/* Actions */}
                                <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex flex-wrap gap-4">

                    <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">
                      👁️ View Details
                    </button>

                    <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
                      🧾 Download Invoice
                    </button>

                    <button className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
                      📍 View Route
                    </button>

                  </div>

                  <div className="rounded-2xl bg-gray-100 px-5 py-3">

                    <p className="text-sm text-gray-500">
                      Delivery Time
                    </p>

                    <h3 className="font-bold text-green-600">
                      24 Minutes
                    </h3>

                  </div>

                </div>

                {/* Route Summary */}

                <div className="mt-8 rounded-2xl border border-orange-100 p-6">

                  <h3 className="mb-6 text-xl font-bold text-gray-900">
                    🛣️ Route Summary
                  </h3>

                  <div className="space-y-6">

                    <div className="flex items-start gap-4">

                      <div className="rounded-full bg-orange-500 p-2 text-white">
                        📍
                      </div>

                      <div>

                        <h4 className="font-semibold">
                          Picked Up From
                        </h4>

                        <p className="text-gray-500">
                          {order.restaurant}
                        </p>

                      </div>

                    </div>

                    <div className="ml-5 h-10 w-1 rounded-full bg-orange-300"></div>

                    <div className="flex items-start gap-4">

                      <div className="rounded-full bg-green-600 p-2 text-white">
                        🏠
                      </div>

                      <div>

                        <h4 className="font-semibold">
                          Delivered To
                        </h4>

                        <p className="text-gray-500">
                          {order.address}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Delivery Timeline */}

                <div className="mt-8 rounded-2xl bg-gray-50 p-6">

                  <h3 className="mb-6 text-xl font-bold text-gray-900">
                    📊 Delivery Timeline
                  </h3>

                  <div className="space-y-5">

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                        ✓
                      </div>

                      <div>

                        <h4 className="font-semibold">
                          Order Accepted
                        </h4>

                        <p className="text-sm text-gray-500">
                          11:42 AM
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
                        📦
                      </div>

                      <div>

                        <h4 className="font-semibold">
                          Picked Up From Restaurant
                        </h4>

                        <p className="text-sm text-gray-500">
                          11:55 AM
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                        🚚
                      </div>

                      <div>

                        <h4 className="font-semibold">
                          Started Delivery
                        </h4>

                        <p className="text-sm text-gray-500">
                          12:02 PM
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white">
                        🏁
                      </div>

                      <div>

                        <h4 className="font-semibold">
                          Delivered Successfully
                        </h4>

                        <p className="text-sm text-gray-500">
                          12:18 PM
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

          {/* Monthly Summary */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Monthly Summary */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Monthly Summary
              </h2>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">

                <div className="rounded-2xl bg-green-50 p-5">

                  <p className="text-gray-500">
                    Total Earnings
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-green-600">
                    ₹42,860
                  </h3>

                </div>

                <div className="rounded-2xl bg-blue-50 p-5">

                  <p className="text-gray-500">
                    Deliveries
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-blue-600">
                    286
                  </h3>

                </div>

                <div className="rounded-2xl bg-yellow-50 p-5">

                  <p className="text-gray-500">
                    Average Rating
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-yellow-500">
                    ⭐ 4.9
                  </h3>

                </div>

                <div className="rounded-2xl bg-purple-50 p-5">

                  <p className="text-gray-500">
                    Success Rate
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-purple-600">
                    98%
                  </h3>

                </div>

              </div>

            </div>

            {/* Performance Overview */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Performance Overview
              </h2>

              <div className="mt-8 space-y-6">

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Total Deliveries</span>

                    <span className="font-bold text-orange-500">
                      286
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

                    <span>Customer Satisfaction</span>

                    <span className="font-bold text-green-600">
                      97%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: "97%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>On-Time Delivery</span>

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

          {/* Performance Tips */}

          <div className="mt-10 rounded-3xl border-l-4 border-green-500 bg-green-50 p-6">

            <h2 className="text-2xl font-bold text-green-700">
              🚀 Performance Tips
            </h2>

            <ul className="mt-5 list-disc space-y-3 pl-6 text-gray-700">

              <li>Accept delivery requests quickly to maintain a high acceptance rate.</li>

              <li>Use the fastest navigation route to reduce delivery time.</li>

              <li>Communicate with customers if delays occur.</li>

              <li>Handle food packages carefully to avoid complaints.</li>

              <li>Maintain a friendly attitude to improve customer ratings.</li>

            </ul>

          </div>

        </section>

      </main>

    </>

  );

}