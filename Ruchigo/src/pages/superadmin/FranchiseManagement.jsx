import Navbar from "../../components/Navbar.jsx";

import {
  Building2,
  MapPinned,
  Users,
  IndianRupee,
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
  Globe,
} from "lucide-react";

export default function FranchiseManagement() {

  const stats = [
    {
      title: "Total Franchises",
      value: "48",
      icon: Building2,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Active Cities",
      value: "32",
      icon: MapPinned,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Regional Managers",
      value: "64",
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: "₹8.42 Cr",
      icon: IndianRupee,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const franchises = [
    {
      city: "Hyderabad",
      manager: "Rahul Sharma",
      restaurants: 612,
      revenue: "₹1.84 Cr",
      status: "Active",
    },
    {
      city: "Bengaluru",
      manager: "Priya Reddy",
      restaurants: 540,
      revenue: "₹1.52 Cr",
      status: "Active",
    },
    {
      city: "Chennai",
      manager: "Amit Kumar",
      restaurants: 421,
      revenue: "₹1.18 Cr",
      status: "Active",
    },
    {
      city: "Mumbai",
      manager: "Sneha Patel",
      restaurants: 702,
      revenue: "₹2.14 Cr",
      status: "Active",
    },
    {
      city: "Pune",
      manager: "Vikram Singh",
      restaurants: 356,
      revenue: "₹0.92 Cr",
      status: "Pending",
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
                Franchise Management
              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">
                Manage franchise partners, city operations, regional managers,
                revenue sharing, and nationwide expansion.
              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

              <Plus size={20} />

              Add Franchise

            </button>

          </div>

          {/* KPI Cards */}

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

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

              <div className="relative flex-1">

                <Search
                  size={20}
                  className="absolute left-4 top-3.5 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search franchise..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-orange-500"
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

          {/* Franchise Table */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                Franchise Directory
              </h2>

              <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">

                {franchises.length} Franchises

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">City</th>
                    <th className="px-4 py-4">Regional Manager</th>
                    <th className="px-4 py-4">Restaurants</th>
                    <th className="px-4 py-4">Revenue</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {franchises.map((item) => (

                    <tr
                      key={item.city}
                      className="border-b hover:bg-orange-50 transition"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {item.city}

                      </td>

                      <td className="px-4 py-5">

                        {item.manager}

                      </td>

                      <td className="px-4 py-5">

                        {item.restaurants}

                      </td>

                      <td className="px-4 py-5 font-semibold text-green-600">

                        {item.revenue}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            item.status === "Active"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >

                          {item.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <div className="flex flex-wrap gap-2">

                          <button className="rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-600 hover:bg-blue-200">

                            View

                          </button>

                          <button className="rounded-lg bg-orange-100 px-3 py-2 text-sm text-orange-600 hover:bg-orange-200">

                            Edit

                          </button>

                          <button className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-200">

                            Suspend

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Territory & Revenue */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Territory Management */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="flex items-center gap-3">

                <Globe className="text-orange-500" />

                <h2 className="text-2xl font-bold">
                  Territory Management
                </h2>

              </div>

              <div className="mt-8 space-y-5">

                {[
                  {
                    region: "South India",
                    cities: "12 Cities",
                    manager: "Rahul Sharma",
                  },
                  {
                    region: "West India",
                    cities: "9 Cities",
                    manager: "Sneha Patel",
                  },
                  {
                    region: "North India",
                    cities: "7 Cities",
                    manager: "Amit Kumar",
                  },
                  {
                    region: "East India",
                    cities: "4 Cities",
                    manager: "Priya Reddy",
                  },
                ].map((region) => (

                  <div
                    key={region.region}
                    className="rounded-2xl border p-5 hover:bg-orange-50"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="font-semibold">

                          {region.region}

                        </h3>

                        <p className="text-sm text-gray-500">

                          {region.cities}

                        </p>

                      </div>

                      <span className="font-semibold text-orange-600">

                        {region.manager}

                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Revenue Sharing */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Revenue Sharing

              </h2>

              <div className="mt-8 space-y-6">

                {[
                  {
                    title: "Platform Share",
                    value: "30%",
                    width: "30%",
                  },
                  {
                    title: "Franchise Share",
                    value: "55%",
                    width: "55%",
                  },
                  {
                    title: "Regional Incentives",
                    value: "10%",
                    width: "10%",
                  },
                  {
                    title: "Operational Reserve",
                    value: "5%",
                    width: "5%",
                  },
                ].map((item) => (

                  <div key={item.title}>

                    <div className="mb-2 flex justify-between">

                      <span className="font-medium">

                        {item.title}

                      </span>

                      <span className="font-semibold text-orange-600">

                        {item.value}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-orange-500"
                        style={{ width: item.width }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Franchise Performance */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Top Performing Franchises

              </h2>

              <div className="mt-8 space-y-4">

                {[
                  ["Mumbai", "₹2.14 Cr"],
                  ["Hyderabad", "₹1.84 Cr"],
                  ["Bengaluru", "₹1.52 Cr"],
                  ["Chennai", "₹1.18 Cr"],
                  ["Pune", "₹0.92 Cr"],
                ].map(([city, revenue]) => (

                  <div
                    key={city}
                    className="flex items-center justify-between rounded-2xl border p-4"
                  >

                    <span className="font-semibold">

                      {city}

                    </span>

                    <span className="font-bold text-green-600">

                      {revenue}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">

              <h2 className="text-2xl font-bold">

                Expansion Opportunities

              </h2>

              <div className="mt-8 space-y-4">

                {[
                  "Visakhapatnam",
                  "Vijayawada",
                  "Mysuru",
                  "Nagpur",
                  "Indore",
                ].map((city) => (

                  <div
                    key={city}
                    className="rounded-2xl bg-white/10 p-4 backdrop-blur"
                  >

                    <h3 className="font-semibold">

                      {city}

                    </h3>

                    <p className="mt-1 text-sm text-orange-100">

                      High demand with strong franchise potential.

                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Quick Actions */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Quick Actions */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Quick Actions
              </h2>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                {[
                  "Add Franchise",
                  "Assign Manager",
                  "Approve Expansion",
                  "Revenue Report",
                  "Send Notification",
                  "Export Data",
                  "View Contracts",
                  "Generate Analytics",
                ].map((action) => (

                  <button
                    key={action}
                    className="rounded-2xl border p-5 text-left font-semibold transition hover:border-orange-500 hover:bg-orange-50"
                  >
                    {action}
                  </button>

                ))}

              </div>

            </div>

            {/* Contracts */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Contracts & Agreements
              </h2>

              <div className="mt-8 space-y-4">

                {[
                  {
                    city: "Hyderabad",
                    expiry: "12 Dec 2028",
                    status: "Active",
                  },
                  {
                    city: "Mumbai",
                    expiry: "18 Aug 2029",
                    status: "Active",
                  },
                  {
                    city: "Pune",
                    expiry: "30 Jan 2027",
                    status: "Renewal Due",
                  },
                  {
                    city: "Chennai",
                    expiry: "10 Oct 2028",
                    status: "Active",
                  },
                ].map((contract) => (

                  <div
                    key={contract.city}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <div>

                      <h3 className="font-semibold">
                        {contract.city}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Expires: {contract.expiry}
                      </p>

                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        contract.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {contract.status}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Franchise Announcements */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">
              Franchise Announcements
            </h2>

            <div className="mt-8 space-y-4">

              {[
                "📢 New franchise onboarding starts from 1st September.",
                "🎉 Hyderabad region achieved record monthly revenue.",
                "🚀 Expansion approved for Visakhapatnam.",
                "💼 Annual franchise leadership summit scheduled next month.",
              ].map((item) => (

                <div
                  key={item}
                  className="rounded-2xl border-l-4 border-orange-500 bg-orange-50 p-5"
                >
                  {item}
                </div>

              ))}

            </div>

          </div>

          {/* AI Growth Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white">

            <h2 className="text-3xl font-bold">
              AI Growth Insights
            </h2>

            <p className="mt-3 text-indigo-100">
              AI continuously evaluates franchise performance and recommends expansion opportunities.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Growth Score",
                  value: "97%",
                },
                {
                  title: "Expansion Cities",
                  value: "15",
                },
                {
                  title: "Revenue Forecast",
                  value: "₹12.8 Cr",
                },
                {
                  title: "Risk Index",
                  value: "Low",
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

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <h2 className="text-2xl font-bold">
              National Franchise Network
            </h2>

            <p className="mt-3 text-gray-500">
              Manage every franchise, territory, contract, regional manager,
              and business expansion from one centralized enterprise dashboard.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

                Export Franchise Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                View Agreements

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Expansion Analytics

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">
              © 2026 RuchiGo Technologies • Enterprise Franchise Management Suite
            </p>

          </footer>

        </section>

      </main>

    </>

  );

}