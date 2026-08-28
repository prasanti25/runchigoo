import Navbar from "../../components/Navbar.jsx";

import {
  Bike,
  Search,
  Filter,
  Download,
  UserPlus,
} from "lucide-react";

export default function DeliveryPartnerManagement() {

  const partners = [
    {
      id: "DP001",
      name: "Rahul Kumar",
      area: "Hyderabad",
      deliveries: 1240,
      earnings: "₹1.82L",
      rating: 4.9,
      status: "Online",
    },
    {
      id: "DP002",
      name: "Arjun Reddy",
      area: "Gachibowli",
      deliveries: 980,
      earnings: "₹1.45L",
      rating: 4.8,
      status: "Offline",
    },
    {
      id: "DP003",
      name: "Vikram Patel",
      area: "Madhapur",
      deliveries: 1125,
      earnings: "₹1.60L",
      rating: 4.7,
      status: "Pending",
    },
    {
      id: "DP004",
      name: "Sanjay Rao",
      area: "Kukatpally",
      deliveries: 1350,
      earnings: "₹1.95L",
      rating: 4.9,
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
                Delivery Partner Management
              </h1>

              <p className="mt-3 text-gray-500">
                Manage delivery partners, approvals, earnings, ratings and operational status.
              </p>

            </div>

            <div className="flex gap-4">

              <button className="flex items-center gap-2 rounded-2xl border px-5 py-3 font-semibold hover:bg-gray-100">

                <Download size={18} />

                Export

              </button>

              <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600">

                <UserPlus size={18} />

                Add Partner

              </button>

            </div>

          </div>

          {/* Statistics */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {[
              {
                title: "Total Partners",
                value: "1,240",
                color: "text-orange-600",
              },
              {
                title: "Online",
                value: "842",
                color: "text-green-600",
              },
              {
                title: "Pending Verification",
                value: "48",
                color: "text-yellow-600",
              },
              {
                title: "Suspended",
                value: "16",
                color: "text-red-600",
              },
            ].map((item) => (

              <div
                key={item.title}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >

                <Bike className={item.color} size={30} />

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
                  placeholder="Search partner, ID or assigned area..."
                  className="w-full rounded-2xl border py-3 pl-12 pr-4 outline-none focus:border-orange-500"
                />

              </div>

              <select className="rounded-2xl border px-5 py-3 outline-none focus:border-orange-500">

                <option>All Status</option>
                <option>Online</option>
                <option>Offline</option>
                <option>Pending</option>
                <option>Suspended</option>

              </select>

              <button className="flex items-center justify-center gap-2 rounded-2xl border px-6 py-3 hover:bg-gray-100">

                <Filter size={18} />

                Filters

              </button>

            </div>

          </div>

          {/* Delivery Partner Table */}
                    <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-orange-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Partner
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Partner ID
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Area
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Rating
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Deliveries
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Earnings
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

                  {partners.map((partner) => (

                    <tr
                      key={partner.id}
                      className="border-t transition hover:bg-orange-50/40"
                    >

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-4">

                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              partner.name
                            )}&background=f97316&color=fff`}
                            alt={partner.name}
                            className="h-12 w-12 rounded-full"
                          />

                          <div>

                            <h3 className="font-semibold text-gray-900">
                              {partner.name}
                            </h3>

                            <p className="text-sm text-gray-500">
                              Delivery Partner
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-5 font-medium text-gray-700">
                        {partner.id}
                      </td>

                      <td className="px-6 py-5 text-gray-700">
                        {partner.area}
                      </td>

                      <td className="px-6 py-5">

                        <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">

                          ⭐ {partner.rating}

                        </span>

                      </td>

                      <td className="px-6 py-5 font-semibold text-gray-700">
                        {partner.deliveries}
                      </td>

                      <td className="px-6 py-5 font-semibold text-green-600">
                        {partner.earnings}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-4 py-2 text-sm font-semibold
                            ${
                              partner.status === "Online"
                                ? "bg-green-100 text-green-700"
                                : partner.status === "Offline"
                                ? "bg-gray-200 text-gray-700"
                                : partner.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                          {partner.status}
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

                          {partner.status === "Pending" ? (

                            <button className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600">
                              Verify
                            </button>

                          ) : partner.status === "Suspended" ? (

                            <button className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600">
                              Activate
                            </button>

                          ) : (

                            <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
                              Suspend
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

          {/* Delivery Partner Overview */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Delivery Partner Overview */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Delivery Partner Overview
              </h2>

              <p className="mt-2 text-gray-500">
                Overall distribution of delivery partners across the platform.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-5">

                <div className="rounded-2xl bg-orange-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-orange-600">
                    1,240
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Total Partners
                  </p>

                </div>

                <div className="rounded-2xl bg-green-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-green-600">
                    842
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Online
                  </p>

                </div>

                <div className="rounded-2xl bg-yellow-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-yellow-600">
                    48
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Pending Verification
                  </p>

                </div>

                <div className="rounded-2xl bg-red-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-red-600">
                    16
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Suspended
                  </p>

                </div>

              </div>

            </div>

            {/* Weekly Deliveries */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Weekly Deliveries
              </h2>

              <p className="mt-2 text-gray-500">
                Deliveries completed throughout the week.
              </p>

              <div className="mt-8 flex h-64 items-end justify-between gap-4">

                {[
                  { day: "Mon", value: 42 },
                  { day: "Tue", value: 56 },
                  { day: "Wed", value: 64 },
                  { day: "Thu", value: 78 },
                  { day: "Fri", value: 92 },
                  { day: "Sat", value: 100 },
                  { day: "Sun", value: 74 },
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

          {/* Top Delivery Partners */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Top Delivery Partners
              </h2>

              <div className="mt-8 space-y-5">

                {[
                  {
                    name: "Rahul Kumar",
                    deliveries: 1240,
                    rating: "4.9",
                  },
                  {
                    name: "Sanjay Rao",
                    deliveries: 1198,
                    rating: "4.9",
                  },
                  {
                    name: "Arjun Reddy",
                    deliveries: 1102,
                    rating: "4.8",
                  },
                  {
                    name: "Vikram Patel",
                    deliveries: 1045,
                    rating: "4.7",
                  },
                  {
                    name: "Ajay Kumar",
                    deliveries: 995,
                    rating: "4.7",
                  },
                ].map((partner, index) => (

                  <div
                    key={partner.name}
                    className="flex items-center justify-between rounded-2xl border p-4 transition hover:bg-orange-50"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">

                        #{index + 1}

                      </div>

                      <div>

                        <h3 className="font-semibold text-gray-900">
                          {partner.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {partner.deliveries} Deliveries
                        </p>

                      </div>

                    </div>

                    <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
                      ⭐ {partner.rating}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Delivery Zone Performance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Delivery Zone Performance
              </h2>

              <div className="mt-8 space-y-5">

                {[
                  {
                    area: "Hyderabad",
                    orders: "4,560",
                    success: "98%",
                  },
                  {
                    area: "Gachibowli",
                    orders: "3,940",
                    success: "97%",
                  },
                  {
                    area: "Madhapur",
                    orders: "3,420",
                    success: "96%",
                  },
                  {
                    area: "Kukatpally",
                    orders: "3,180",
                    success: "95%",
                  },
                  {
                    area: "Secunderabad",
                    orders: "2,960",
                    success: "95%",
                  },
                ].map((zone) => (

                  <div
                    key={zone.area}
                    className="rounded-2xl border p-5"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="font-semibold text-gray-900">
                          {zone.area}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {zone.orders} Orders
                        </p>

                      </div>

                      <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                        {zone.success}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Earnings & Fleet Insights */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Earnings Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Earnings Analytics
              </h2>

              <p className="mt-2 text-gray-500">
                Overall earnings and payout performance of delivery partners.
              </p>

              <div className="mt-8 space-y-6">

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Total Monthly Earnings</span>

                    <span className="font-bold text-green-600">
                      ₹18.5L
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: "92%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Payout Success</span>

                    <span className="font-bold text-blue-600">
                      99%
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: "99%" }}
                    />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Bonus Distributed</span>

                    <span className="font-bold text-orange-600">
                      ₹2.3L
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: "76%" }}
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* Fleet Insights */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Fleet Insights
              </h2>

              <p className="mt-2 text-gray-500">
                Real-time operational overview of the delivery fleet.
              </p>

              <div className="mt-8 space-y-5">

                <div className="rounded-2xl bg-green-50 p-5">

                  <h3 className="font-semibold text-green-700">
                    🟢 Active Fleet
                  </h3>

                  <p className="mt-2 text-gray-600">
                    <strong>842</strong> delivery partners are currently online and accepting orders.
                  </p>

                </div>

                <div className="rounded-2xl bg-blue-50 p-5">

                  <h3 className="font-semibold text-blue-700">
                    🚚 Delivery Efficiency
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Average delivery completion rate reached <strong>97%</strong> this week.
                  </p>

                </div>

                <div className="rounded-2xl bg-yellow-50 p-5">

                  <h3 className="font-semibold text-yellow-700">
                    ⭐ Customer Satisfaction
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Delivery partners maintain an average customer rating of <strong>4.8/5</strong>.
                  </p>

                </div>

                <div className="rounded-2xl bg-red-50 p-5">

                  <h3 className="font-semibold text-red-700">
                    ⚠ Pending Verification
                  </h3>

                  <p className="mt-2 text-gray-600">
                    <strong>48</strong> new delivery partners are awaiting verification.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Footer */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">

            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">

              <div>

                <h2 className="text-3xl font-bold">
                  Delivery Partner Management Center
                </h2>

                <p className="mt-2 text-orange-100">
                  Monitor partner performance, manage approvals, optimize deliveries,
                  and ensure smooth logistics operations across the platform.
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