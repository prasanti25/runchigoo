import Navbar from "../../components/Navbar.jsx";

import {
  MapPin,
  Phone,
} from "lucide-react";

export default function ActiveDeliveries() {

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="font-semibold text-orange-500">
                Delivery Partner
              </p>

              <h1 className="mt-2 text-4xl font-bold text-gray-900">
                Active Deliveries
              </h1>

              <p className="mt-3 text-gray-500">
                Manage your assigned orders and update delivery status in real time.
              </p>

            </div>

            <button className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
              Refresh Orders
            </button>

          </div>

          {/* Active Orders */}

          <div className="space-y-8">

            {[
              {
                id: "#RG102458",
                restaurant: "RuchiGo Restaurant",
                customer: "Rahul Sharma",
                pickup: "MG Road, Hyderabad",
                delivery: "Jubilee Hills",
                amount: "₹145",
                eta: "18 mins",
                status: "Ready for Pickup",
              },
              {
                id: "#RG102459",
                restaurant: "Spicy Hub",
                customer: "Sneha Reddy",
                pickup: "Madhapur",
                delivery: "Gachibowli",
                amount: "₹185",
                eta: "22 mins",
                status: "On the Way",
              },
            ].map((order) => (

              <div
                key={order.id}
                className="rounded-3xl bg-white p-8 shadow-sm"
              >

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                  <div>

                    <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
                      {order.status}
                    </span>

                    <h2 className="mt-4 text-2xl font-bold text-gray-900">
                      {order.id}
                    </h2>

                  </div>

                  <div className="flex gap-4">

                    <div className="rounded-xl bg-green-50 px-5 py-3">

                      <p className="text-sm text-gray-500">
                        Earnings
                      </p>

                      <h3 className="text-xl font-bold text-green-600">
                        {order.amount}
                      </h3>

                    </div>

                    <div className="rounded-xl bg-blue-50 px-5 py-3">

                      <p className="text-sm text-gray-500">
                        ETA
                      </p>

                      <h3 className="text-xl font-bold text-blue-600">
                        {order.eta}
                      </h3>

                    </div>

                  </div>

                </div>

                {/* Restaurant & Customer */}
                                <div className="mt-8 grid gap-6 lg:grid-cols-2">

                  {/* Restaurant Details */}

                  <div className="rounded-2xl bg-orange-50 p-6">

                    <h3 className="mb-5 text-xl font-bold text-gray-900">
                      🏪 Restaurant Details
                    </h3>

                    <div className="space-y-4">

                      <div className="flex items-start gap-3">

                        <MapPin className="mt-1 text-orange-500" size={20} />

                        <div>

                          <p className="font-semibold">
                            {order.restaurant}
                          </p>

                          <p className="text-gray-500">
                            {order.pickup}
                          </p>

                        </div>

                      </div>

                      <button className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700">

                        <Phone size={18} />

                        Call Restaurant

                      </button>

                    </div>

                  </div>

                  {/* Customer Details */}

                  <div className="rounded-2xl bg-green-50 p-6">

                    <h3 className="mb-5 text-xl font-bold text-gray-900">
                      👤 Customer Details
                    </h3>

                    <div className="space-y-4">

                      <div className="flex items-start gap-3">

                        <MapPin className="mt-1 text-green-600" size={20} />

                        <div>

                          <p className="font-semibold">
                            {order.customer}
                          </p>

                          <p className="text-gray-500">
                            {order.delivery}
                          </p>

                        </div>

                      </div>

                      <div className="flex flex-wrap gap-3">

                        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">

                          <Phone size={18} />

                          Call Customer

                        </button>

                        <button className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700">

                          💬 Chat

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Pickup & Delivery Route */}

                <div className="mt-8 rounded-2xl border border-orange-100 p-6">

                  <h3 className="mb-6 text-xl font-bold text-gray-900">
                    📍 Delivery Route
                  </h3>

                  <div className="space-y-6">

                    <div className="flex items-start gap-4">

                      <div className="rounded-full bg-orange-500 p-2 text-white">

                        <MapPin size={18} />

                      </div>

                      <div>

                        <p className="font-semibold text-gray-900">
                          Pickup Address
                        </p>

                        <p className="text-gray-500">
                          {order.pickup}
                        </p>

                      </div>

                    </div>

                    <div className="ml-5 h-10 w-1 rounded-full bg-orange-300"></div>

                    <div className="flex items-start gap-4">

                      <div className="rounded-full bg-green-600 p-2 text-white">

                        <MapPin size={18} />

                      </div>

                      <div>

                        <p className="font-semibold text-gray-900">
                          Delivery Address
                        </p>

                        <p className="text-gray-500">
                          {order.delivery}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Order Actions */}
                                <div className="mt-8 rounded-2xl bg-gray-50 p-6">

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                      <h3 className="text-2xl font-bold text-gray-900">
                        Delivery Actions
                      </h3>

                      <p className="mt-2 text-gray-500">
                        Update the order status as you complete each delivery step.
                      </p>

                    </div>

                    <button className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
                      🗺️ Open Navigation
                    </button>

                  </div>

                  {/* Progress */}

                  <div className="mt-8">

                    <div className="mb-3 flex items-center justify-between">

                      <span className="font-semibold text-gray-700">
                        Delivery Progress
                      </span>

                      <span className="font-bold text-orange-500">
                        50%
                      </span>

                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-gray-200">

                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{ width: "50%" }}
                      />

                    </div>

                  </div>

                  {/* Status Timeline */}

                  <div className="mt-10 grid gap-5 md:grid-cols-4">

                    <div className="rounded-2xl bg-green-100 p-5 text-center">

                      <div className="text-3xl">✅</div>

                      <h4 className="mt-3 font-bold">
                        Accepted
                      </h4>

                    </div>

                    <div className="rounded-2xl bg-yellow-100 p-5 text-center">

                      <div className="text-3xl">📦</div>

                      <h4 className="mt-3 font-bold">
                        Picked Up
                      </h4>

                    </div>

                    <div className="rounded-2xl bg-blue-100 p-5 text-center">

                      <div className="text-3xl">🚚</div>

                      <h4 className="mt-3 font-bold">
                        On The Way
                      </h4>

                    </div>

                    <div className="rounded-2xl bg-gray-200 p-5 text-center">

                      <div className="text-3xl">🏁</div>

                      <h4 className="mt-3 font-bold">
                        Delivered
                      </h4>

                    </div>

                  </div>

                  {/* Action Buttons */}

                  <div className="mt-10 flex flex-wrap gap-4">

                    <button className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
                      ✅ Accept Order
                    </button>

                    <button className="rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">
                      📦 Pick Up Order
                    </button>

                    <button className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
                      🚚 Start Delivery
                    </button>

                    <button className="rounded-2xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700">
                      🏁 Mark as Delivered
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

          {/* Delivery Statistics */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Today's Statistics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Today's Statistics
              </h2>

              <div className="mt-8 space-y-5">

                {[
                  {
                    title: "Orders Completed",
                    value: "18",
                    color: "text-green-600",
                  },
                  {
                    title: "Orders In Progress",
                    value: "2",
                    color: "text-orange-500",
                  },
                  {
                    title: "Distance Covered",
                    value: "86 KM",
                    color: "text-blue-600",
                  },
                  {
                    title: "Today's Earnings",
                    value: "₹2,450",
                    color: "text-purple-600",
                  },
                ].map((item) => (

                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium text-gray-700">
                      {item.title}
                    </span>

                    <span className={`text-xl font-bold ${item.color}`}>
                      {item.value}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Performance Card */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Daily Performance
              </h2>

              <div className="mt-8 space-y-6">

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
                      style={{ width: "98%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>On-Time Delivery</span>

                    <span className="font-bold text-green-600">
                      96%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: "96%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Acceptance Rate</span>

                    <span className="font-bold text-blue-600">
                      94%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: "94%" }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Delivery Tips */}

          <div className="mt-10 rounded-3xl border-l-4 border-orange-500 bg-orange-50 p-6">

            <h2 className="text-2xl font-bold text-orange-600">
              💡 Delivery Tips
            </h2>

            <ul className="mt-5 list-disc space-y-3 pl-6 text-gray-700">

              <li>Always verify the order before leaving the restaurant.</li>

              <li>Use navigation for the fastest delivery route.</li>

              <li>Communicate with customers if there's any delay.</li>

              <li>Handle food carefully to maintain quality.</li>

              <li>Completing deliveries on time improves incentives and ratings.</li>

            </ul>

          </div>

        </section>

      </main>

    </>

  );

}