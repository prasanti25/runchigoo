import Navbar from "../../components/Navbar.jsx";

import {
  Building2,
  Truck,
  FileText,
  CreditCard,
  Package,
  Search,
  Filter,
  Download,
  TrendingUp,
  Plus,
} from "lucide-react";

export default function VendorManagement() {

  const stats = [
    {
      title: "Registered Vendors",
      value: "268",
      icon: Building2,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Suppliers",
      value: "194",
      icon: Truck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Purchase Orders",
      value: "1,842",
      icon: Package,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Pending Payments",
      value: "₹12.8L",
      icon: CreditCard,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const vendors = [
    {
      name: "Fresh Foods Pvt Ltd",
      category: "Vegetables",
      city: "Hyderabad",
      rating: "4.9",
      status: "Active",
    },
    {
      name: "Milk Zone",
      category: "Dairy",
      city: "Bangalore",
      rating: "4.8",
      status: "Active",
    },
    {
      name: "Royal Spices",
      category: "Spices",
      city: "Chennai",
      rating: "4.7",
      status: "Pending",
    },
    {
      name: "Cold Chain Logistics",
      category: "Logistics",
      city: "Mumbai",
      rating: "4.9",
      status: "Active",
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

                Vendor Management

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Manage suppliers, procurement partners,
                inventory vendors, logistics providers,
                contracts, invoices and payments across
                the RuchiGo enterprise ecosystem.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">

              <Plus size={20} />

              Add Vendor

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

            <div className="flex flex-col gap-4 lg:flex-row">

              <div className="relative flex-1">

                <Search
                  size={20}
                  className="absolute left-4 top-3.5 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-blue-500"
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

          {/* Vendor Directory */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                Vendor Directory

              </h2>

              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">

                {vendors.length} Vendors

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Vendor</th>

                    <th className="px-4 py-4">Category</th>

                    <th className="px-4 py-4">City</th>

                    <th className="px-4 py-4">Rating</th>

                    <th className="px-4 py-4">Status</th>

                    <th className="px-4 py-4">Action</th>

                  </tr>

                </thead>

                <tbody>

                  {vendors.map((vendor) => (

                    <tr
                      key={vendor.name}
                      className="border-b transition hover:bg-blue-50"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {vendor.name}

                      </td>

                      <td className="px-4 py-5">

                        {vendor.category}

                      </td>

                      <td className="px-4 py-5">

                        {vendor.city}

                      </td>

                      <td className="px-4 py-5">

                        ⭐ {vendor.rating}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            vendor.status === "Active"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >

                          {vendor.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200">

                          View

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Procurement & Purchase Orders */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Package className="text-orange-600" />

                <h2 className="text-2xl font-bold">

                  Procurement Overview

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Open Purchase Requests", "42"],
                  ["Approved Orders", "318"],
                  ["Pending Deliveries", "29"],
                  ["Inventory Alerts", "11"],
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

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <FileText className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Purchase Orders

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Today's Orders", "84"],
                  ["Processing", "31"],
                  ["Delivered", "2,418"],
                  ["Cancelled", "6"],
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

          </div>

          {/* Vendor Payments */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <CreditCard className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Vendor Payments

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Paid This Month", "₹1.82 Cr"],
                  ["Pending Payments", "₹12.8 L"],
                  ["Scheduled Transfers", "₹5.3 L"],
                  ["Payment Success", "99.8%"],
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

                <Building2 className="text-purple-600" />

                <h2 className="text-2xl font-bold">

                  Contract Management

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Active Contracts", "186"],
                  ["Renewals Due", "14"],
                  ["Expired Contracts", "5"],
                  ["Compliance Rate", "98.6%"],
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

          {/* Vendor Performance */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <TrendingUp className="text-emerald-600" />

              <h2 className="text-2xl font-bold">

                Vendor Performance Dashboard

              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {[
                ["Average Rating", "4.8 ⭐"],
                ["On-Time Deliveries", "97.4%"],
                ["Quality Score", "96.8%"],
                ["Vendor Satisfaction", "94.5%"],
              ].map(([title, value]) => (

                <div
                  key={title}
                  className="rounded-2xl border p-6 text-center"
                >

                  <h3 className="text-gray-500">

                    {title}

                  </h3>

                  <p className="mt-3 text-2xl font-bold text-emerald-600">

                    {value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Procurement Analytics */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Procurement Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <TrendingUp className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Procurement Analytics

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Monthly Procurement", "₹8.4 Cr"],
                  ["Cost Savings", "12.8%"],
                  ["Average Delivery Time", "18 Hours"],
                  ["Order Fulfillment", "98.4%"],
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

            {/* AI Supplier Insights */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Truck className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  AI Supplier Insights

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Best Performing Vendor", "Fresh Foods Pvt Ltd"],
                  ["Highest Growth", "Milk Zone"],
                  ["Risk Vendors", "3"],
                  ["AI Confidence", "98.7%"],
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

          </div>

          {/* Supply Chain KPIs */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-700 p-8 text-white">

            <div className="flex items-center gap-3">

              <Package size={32} />

              <h2 className="text-3xl font-bold">

                Supply Chain Performance

              </h2>

            </div>

            <p className="mt-4 text-blue-100">

              Monitor procurement efficiency, supplier reliability,
              logistics performance, inventory replenishment,
              procurement costs and AI-driven supplier optimization
              across the complete RuchiGo supply chain.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Active Suppliers",
                  value: "194",
                },
                {
                  title: "Supply Success",
                  value: "98.4%",
                },
                {
                  title: "Average Lead Time",
                  value: "18 hrs",
                },
                {
                  title: "Inventory Availability",
                  value: "96.9%",
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

          {/* Invoice Management */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <FileText className="text-orange-600" />

              <h2 className="text-2xl font-bold">

                Invoice Management

              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {[
                ["Invoices Generated", "5,286"],
                ["Paid Invoices", "5,021"],
                ["Pending Approval", "118"],
                ["Overdue", "27"],
              ].map(([title, value]) => (

                <div
                  key={title}
                  className="rounded-2xl border p-6 text-center"
                >

                  <h3 className="text-gray-500">

                    {title}

                  </h3>

                  <p className="mt-3 text-2xl font-bold text-orange-600">

                    {value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Quick Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Vendor Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Add Vendor",
                "Create Purchase Order",
                "Approve Invoice",
                "Release Payment",
                "Renew Contract",
                "Supplier Analytics",
                "Export Vendor Report",
                "Inventory Forecast",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-blue-500 hover:bg-blue-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <Building2
              size={42}
              className="mx-auto text-blue-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Vendor Management Center

            </h2>

            <p className="mt-3 text-gray-500">

              Manage suppliers, procurement, purchase orders,
              contracts, invoices, vendor payments, supply chain
              analytics, AI-powered supplier recommendations and
              procurement operations from a centralized enterprise
              dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">

                Add Vendor

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Procurement Dashboard

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Export Report

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Vendor Management Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}