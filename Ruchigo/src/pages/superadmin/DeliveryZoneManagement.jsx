import Navbar from "../../components/Navbar.jsx";

import {
  MapPinned,
  Map,
  Navigation,
  Bike,
  IndianRupee,
  Search,
  Filter,
  Download,
  TrendingUp,
  Globe,
  Route,
} from "lucide-react";

export default function DeliveryZoneManagement() {

  const stats = [
    {
      title: "Cities",
      value: "28",
      icon: Globe,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Delivery Zones",
      value: "214",
      icon: MapPinned,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Active Riders",
      value: "5,428",
      icon: Bike,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Avg Delivery",
      value: "24 min",
      icon: Route,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const zones = [
    {
      city: "Hyderabad",
      zone: "Madhapur",
      radius: "8 KM",
      fee: "₹30",
      status: "Active",
    },
    {
      city: "Hyderabad",
      zone: "Gachibowli",
      radius: "10 KM",
      fee: "₹35",
      status: "Active",
    },
    {
      city: "Bengaluru",
      zone: "Whitefield",
      radius: "12 KM",
      fee: "₹40",
      status: "Active",
    },
    {
      city: "Chennai",
      zone: "Velachery",
      radius: "9 KM",
      fee: "₹32",
      status: "Maintenance",
    },
  ];

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="font-semibold text-red-500">

                Super Administrator

              </p>

              <h1 className="mt-2 text-4xl font-bold">

                Delivery Zone Management

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Configure cities, delivery zones, geofencing,
                delivery charges, service radius, estimated
                delivery times and AI-powered route optimization.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">

              <MapPinned size={20} />

              Add Zone

            </button>

          </div>

          {/* KPI */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {stats.map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.title}
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >

                  <div className="flex items-center justify-between">

                    <div className={`rounded-2xl p-4 ${item.color}`}>

                      <Icon size={28} />

                    </div>

                    <TrendingUp className="text-green-500" />

                  </div>

                  <h3 className="mt-5 text-gray-500">

                    {item.title}

                  </h3>

                  <h2 className="mt-2 text-3xl font-bold">

                    {item.value}

                  </h2>

                </div>

              );

            })}

          </div>

          {/* Search */}

          <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 lg:flex-row">

              <div className="relative flex-1">

                <Search
                  size={20}
                  className="absolute left-4 top-3.5 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search delivery zones..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-green-500"
                />

              </div>

              <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100">

                <Filter size={18} />

                Filter

              </button>

              <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100">

                <Download size={18} />

                Export

              </button>

            </div>

          </div>

          {/* Zone Management */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                Delivery Zone Management

              </h2>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-600">

                {zones.length} Active Zones

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">City</th>

                    <th className="px-4 py-4">Zone</th>

                    <th className="px-4 py-4">Radius</th>

                    <th className="px-4 py-4">Delivery Fee</th>

                    <th className="px-4 py-4">Status</th>

                    <th className="px-4 py-4">Action</th>

                  </tr>

                </thead>

                <tbody>

                  {zones.map((zone) => (

                    <tr
                      key={`${zone.city}-${zone.zone}`}
                      className="border-b transition hover:bg-green-50"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {zone.city}

                      </td>

                      <td className="px-4 py-5">

                        {zone.zone}

                      </td>

                      <td className="px-4 py-5">

                        {zone.radius}

                      </td>

                      <td className="px-4 py-5">

                        {zone.fee}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            zone.status === "Active"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >

                          {zone.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-green-100 px-4 py-2 text-green-600 hover:bg-green-200">

                          Manage

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Geofencing & Delivery Fees */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Map className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Geofencing Configuration

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Active Geofences", "214"],
                  ["Restricted Zones", "18"],
                  ["High Traffic Areas", "32"],
                  ["AI Optimized Zones", "186"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-green-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <IndianRupee className="text-orange-600" />

                <h2 className="text-2xl font-bold">

                  Delivery Fee Settings

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Base Fee", "₹25"],
                  ["Peak Hour Fee", "+₹15"],
                  ["Long Distance", "+₹20"],
                  ["Free Delivery Limit", "₹299"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-orange-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* ETA & Rider Allocation */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Route className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  ETA Configuration

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Normal Hours", "25 mins"],
                  ["Peak Hours", "38 mins"],
                  ["Rain Mode", "45 mins"],
                  ["Express Delivery", "15 mins"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-blue-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Navigation className="text-purple-600" />

                <h2 className="text-2xl font-bold">

                  Rider Allocation

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Available Riders", "5,428"],
                  ["Busy Riders", "1,248"],
                  ["Offline Riders", "684"],
                  ["AI Auto Assignment", "Enabled"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-purple-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Zone Performance */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Zone Performance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <TrendingUp className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Zone Performance

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Average Delivery Time", "24 mins"],
                  ["Successful Deliveries", "98.8%"],
                  ["Customer Satisfaction", "4.9 ★"],
                  ["On-Time Delivery", "96.4%"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-green-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Restricted Areas */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <MapPinned className="text-red-600" />

                <h2 className="text-2xl font-bold">

                  Restricted Areas

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Military Zones", "4"],
                  ["Construction Areas", "9"],
                  ["Flood Alert Zones", "3"],
                  ["Temporary Closures", "6"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-red-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Route Optimization */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 p-8 text-white">

            <div className="flex items-center gap-3">

              <Route size={32} />

              <h2 className="text-3xl font-bold">

                AI Route Optimization

              </h2>

            </div>

            <p className="mt-4 text-green-100">

              AI continuously optimizes delivery routes using live traffic,
              weather conditions, rider availability, restaurant preparation
              time, customer location, and historical delivery patterns to
              reduce delays and improve delivery efficiency.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Optimized Routes",
                  value: "2,846",
                },
                {
                  title: "Fuel Savings",
                  value: "18%",
                },
                {
                  title: "ETA Accuracy",
                  value: "97.8%",
                },
                {
                  title: "AI Confidence",
                  value: "99.1%",
                },
              ].map((item) => (

                <div
                  key={item.title}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur"
                >

                  <h3 className="font-semibold">

                    {item.title}

                  </h3>

                  <p className="mt-4 text-3xl font-bold">

                    {item.value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Quick Zone Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Zone Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Add New Zone",
                "Configure Geofence",
                "Update Delivery Fees",
                "Assign Riders",
                "View Traffic Report",
                "Export Zone Report",
                "Manage Restricted Areas",
                "AI Route Planner",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-green-500 hover:bg-green-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <MapPinned
              size={42}
              className="mx-auto text-green-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Delivery Zone Management Center

            </h2>

            <p className="mt-3 text-gray-500">

              Configure cities, delivery zones, geofencing, delivery
              charges, rider allocation, restricted areas, AI-powered
              route optimization, and logistics analytics from one
              centralized operations dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">

                Export Zone Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Logistics Dashboard

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Route Analytics

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Logistics Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}