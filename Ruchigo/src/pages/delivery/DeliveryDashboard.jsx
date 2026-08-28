import Navbar from "../../components/Navbar.jsx";

import {
  Package,
  IndianRupee,
  Star,
  Clock,
  MapPin,
} from "lucide-react";

export default function DeliveryDashboard() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">
        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

            <div>

              <p className="font-semibold text-orange-500">
                Delivery Partner
              </p>

              <h1 className="mt-2 text-4xl font-bold text-gray-900">
                Welcome Back, Pavan 👋
              </h1>

              <p className="mt-3 text-gray-500">
                Track deliveries, earnings and performance in one place.
              </p>

            </div>

            <button className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition">
              🟢 Go Online
            </button>

          </div>

          {/* Summary Cards */}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

            {[
              {
                icon: <Package size={30} />,
                title: "Today's Orders",
                value: "18",
                color: "bg-orange-100 text-orange-600",
              },
              {
                icon: <IndianRupee size={30} />,
                title: "Today's Earnings",
                value: "₹2,450",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: <Star size={30} />,
                title: "Rating",
                value: "4.9",
                color: "bg-yellow-100 text-yellow-600",
              },
              {
                icon: <Clock size={30} />,
                title: "Online Hours",
                value: "7.5 hrs",
                color: "bg-blue-100 text-blue-600",
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

          {/* Current Delivery */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  Active Delivery
                </span>

                <h2 className="mt-4 text-3xl font-bold text-gray-900">
                  Order #RG102458
                </h2>

                <p className="mt-2 text-gray-500">
                  Estimated Delivery Time: <strong>18 Minutes</strong>
                </p>

              </div>

              <button className="rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">
                🗺️ Open Navigation
              </button>

            </div>

            {/* Pickup & Delivery */}

            <div className="mt-10 grid gap-6 lg:grid-cols-2">

              <div className="rounded-2xl bg-orange-50 p-6">

                <div className="flex items-start gap-4">

                  <div className="rounded-full bg-orange-500 p-3 text-white">
                    <MapPin size={22} />
                  </div>

                  <div>

                    <h3 className="text-xl font-bold text-gray-900">
                      Pickup Location
                    </h3>

                    <p className="mt-2 text-gray-600">
                      RuchiGo Restaurant
                    </p>

                    <p className="text-gray-500">
                      24 MG Road, Hyderabad
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-2xl bg-green-50 p-6">

                <div className="flex items-start gap-4">

                  <div className="rounded-full bg-green-600 p-3 text-white">
                    <MapPin size={22} />
                  </div>

                  <div>

                    <h3 className="text-xl font-bold text-gray-900">
                      Delivery Location
                    </h3>

                    <p className="mt-2 text-gray-600">
                      Rahul Sharma
                    </p>

                    <p className="text-gray-500">
                      Jubilee Hills, Hyderabad
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* Delivery Progress */}

            <div className="mt-10">

              <div className="mb-3 flex items-center justify-between">

                <span className="font-semibold text-gray-700">
                  Delivery Progress
                </span>

                <span className="font-bold text-orange-500">
                  70%
                </span>

              </div>

              <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">

                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: "70%" }}
                />

              </div>

            </div>

            {/* Customer Details */}

            <div className="mt-10 rounded-2xl border border-orange-100 p-6">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <h3 className="text-2xl font-bold text-gray-900">
                    Customer Details
                  </h3>

                  <p className="mt-2 text-gray-500">
                    Rahul Sharma
                  </p>

                  <p className="text-gray-500">
                    +91 9876543210
                  </p>

                </div>

                <div className="flex gap-4">

                  <button className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition">
                    📞 Call
                  </button>

                  <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition">
                    💬 Chat
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* Performance */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Weekly Performance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Weekly Performance
              </h2>

              <p className="mt-2 text-gray-500">
                Deliveries completed this week.
              </p>

              <div className="mt-8 flex h-64 items-end justify-between gap-4">

                {[
                  { day: "Mon", value: 65 },
                  { day: "Tue", value: 80 },
                  { day: "Wed", value: 72 },
                  { day: "Thu", value: 95 },
                  { day: "Fri", value: 88 },
                  { day: "Sat", value: 100 },
                  { day: "Sun", value: 76 },
                ].map((item) => (

                  <div
                    key={item.day}
                    className="flex flex-1 flex-col items-center"
                  >

                    <div
                      className="w-full rounded-t-xl bg-orange-500 transition-all hover:bg-orange-600"
                      style={{ height: `${item.value * 2}px` }}
                    />

                    <span className="mt-3 text-sm font-medium text-gray-600">
                      {item.day}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Performance Stats */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Performance Summary
              </h2>

              <div className="mt-8 space-y-5">

                {[
                  {
                    title: "Completed Deliveries",
                    value: "486",
                    color: "text-green-600",
                  },
                  {
                    title: "Cancelled Orders",
                    value: "12",
                    color: "text-red-500",
                  },
                  {
                    title: "Average Delivery Time",
                    value: "24 mins",
                    color: "text-blue-600",
                  },
                  {
                    title: "Customer Rating",
                    value: "4.9 ★",
                    color: "text-yellow-500",
                  },
                ].map((stat) => (

                  <div
                    key={stat.title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium text-gray-700">
                      {stat.title}
                    </span>

                    <span className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Achievements */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold text-gray-900">
              🏆 Achievements
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-3">

              <div className="rounded-2xl bg-yellow-50 p-6 text-center">

                <div className="text-5xl">🥇</div>

                <h3 className="mt-4 text-xl font-bold">
                  Top Performer
                </h3>

                <p className="mt-2 text-gray-500">
                  Completed 100+ deliveries this month.
                </p>

              </div>

              <div className="rounded-2xl bg-green-50 p-6 text-center">

                <div className="text-5xl">⭐</div>

                <h3 className="mt-4 text-xl font-bold">
                  Excellent Rating
                </h3>

                <p className="mt-2 text-gray-500">
                  Maintained a 4.9+ customer rating.
                </p>

              </div>

              <div className="rounded-2xl bg-blue-50 p-6 text-center">

                <div className="text-5xl">🚀</div>

                <h3 className="mt-4 text-xl font-bold">
                  Fast Delivery
                </h3>

                <p className="mt-2 text-gray-500">
                  Average delivery time under 25 minutes.
                </p>

              </div>

            </div>

          </div>

          {/* Recent Activity */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="flex items-center justify-between">

              <h2 className="text-2xl font-bold text-gray-900">
                Recent Delivery Activity
              </h2>

              <button className="rounded-xl bg-orange-100 px-4 py-2 font-semibold text-orange-600 hover:bg-orange-200 transition">
                View All
              </button>

            </div>

            <div className="mt-8 space-y-5">

              {[
                {
                  id: "#RG102451",
                  customer: "Rahul Sharma",
                  location: "Jubilee Hills",
                  status: "Delivered",
                  amount: "₹145",
                },
                {
                  id: "#RG102452",
                  customer: "Priya Reddy",
                  location: "Banjara Hills",
                  status: "Delivered",
                  amount: "₹210",
                },
                {
                  id: "#RG102453",
                  customer: "Arjun Kumar",
                  location: "Madhapur",
                  status: "On The Way",
                  amount: "₹180",
                },
              ].map((order) => (

                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-2xl border border-orange-100 p-5 transition hover:shadow-md lg:flex-row lg:items-center lg:justify-between"
                >

                  <div>

                    <h3 className="text-lg font-bold text-gray-900">
                      {order.id}
                    </h3>

                    <p className="text-gray-500">
                      {order.customer}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Delivery Location
                    </p>

                    <h4 className="font-semibold">
                      {order.location}
                    </h4>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Earnings
                    </p>

                    <h4 className="font-bold text-green-600">
                      {order.amount}
                    </h4>

                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>

                </div>

              ))}

            </div>

          </div>

          {/* Quick Actions */}

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            <button className="rounded-3xl bg-orange-500 p-6 text-left text-white transition hover:bg-orange-600">

              <h3 className="text-xl font-bold">
                🗺️ Open Maps
              </h3>

              <p className="mt-2 text-orange-100">
                Navigate to your next destination instantly.
              </p>

            </button>

            <button className="rounded-3xl bg-green-600 p-6 text-left text-white transition hover:bg-green-700">

              <h3 className="text-xl font-bold">
                💰 Earnings
              </h3>

              <p className="mt-2 text-green-100">
                View today's and monthly earnings.
              </p>

            </button>

            <button className="rounded-3xl bg-blue-600 p-6 text-left text-white transition hover:bg-blue-700">

              <h3 className="text-xl font-bold">
                ⚙️ Settings
              </h3>

              <p className="mt-2 text-blue-100">
                Update profile and delivery preferences.
              </p>

            </button>

          </div>

          {/* Delivery Tip */}

          <div className="mt-10 rounded-3xl border-l-4 border-orange-500 bg-orange-50 p-6">

            <h3 className="text-xl font-bold text-orange-600">
              💡 Delivery Tip
            </h3>

            <p className="mt-3 text-gray-700">
              Keep your GPS enabled, maintain a friendly attitude with
              customers, and always verify the order before handing it over.
              Fast and accurate deliveries improve your ratings and increase
              incentive opportunities.
            </p>

          </div>

        </section>

      </main>

    </>

  );

}