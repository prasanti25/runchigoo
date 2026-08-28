import Navbar from "../../components/Navbar.jsx";

import {
  Crown,
  Gem,
  ShieldCheck,
  Building2,
  IndianRupee,
  Users,
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
} from "lucide-react";

export default function SubscriptionPlans() {

  const stats = [
    {
      title: "Active Plans",
      value: "5",
      icon: Crown,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Subscribers",
      value: "12,548",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Monthly Revenue",
      value: "₹42.8 L",
      icon: IndianRupee,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Enterprise Clients",
      value: "86",
      icon: Building2,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "₹0",
      subscribers: 4820,
      features: "Basic Listing",
      status: "Active",
    },
    {
      name: "Silver",
      price: "₹999",
      subscribers: 3214,
      features: "Priority Support",
      status: "Active",
    },
    {
      name: "Gold",
      price: "₹2,499",
      subscribers: 2380,
      features: "Marketing Tools",
      status: "Active",
    },
    {
      name: "Platinum",
      price: "₹4,999",
      subscribers: 1548,
      features: "AI Analytics",
      status: "Active",
    },
    {
      name: "Enterprise",
      price: "Custom",
      subscribers: 86,
      features: "Dedicated Manager",
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

                Subscription Plans

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Manage pricing plans, subscriptions, enterprise packages,
                billing, upgrades and platform revenue.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

              <Plus size={20} />

              Create Plan

            </button>

          </div>

          {/* Statistics */}

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
                  placeholder="Search subscription plan..."
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

          {/* Subscription Plans Table */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                Subscription Plans
              </h2>

              <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">

                {plans.length} Plans

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Plan</th>
                    <th className="px-4 py-4">Price</th>
                    <th className="px-4 py-4">Subscribers</th>
                    <th className="px-4 py-4">Features</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {plans.map((plan) => (

                    <tr
                      key={plan.name}
                      className="border-b transition hover:bg-orange-50"
                    >

                      <td className="px-4 py-5">

                        <div className="flex items-center gap-3">

                          <div className="rounded-xl bg-orange-100 p-3">

                            <Gem
                              size={22}
                              className="text-orange-600"
                            />

                          </div>

                          <div>

                            <h3 className="font-semibold">

                              {plan.name}

                            </h3>

                            <p className="text-sm text-gray-500">

                              Restaurant Subscription

                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-4 py-5 font-bold text-green-600">

                        {plan.price}

                      </td>

                      <td className="px-4 py-5">

                        {plan.subscribers}

                      </td>

                      <td className="px-4 py-5">

                        {plan.features}

                      </td>

                      <td className="px-4 py-5">

                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">

                          {plan.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <div className="flex flex-wrap gap-2">

                          <button className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200">

                            View

                          </button>

                          <button className="rounded-lg bg-orange-100 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-200">

                            Edit

                          </button>

                          <button className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-200">

                            Delete

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Pricing Cards */}

          <div className="mt-10 grid gap-8 lg:grid-cols-3">

            {[
              {
                title: "Silver",
                price: "₹999 / Month",
                color: "from-gray-500 to-gray-700",
                features: [
                  "Priority Listing",
                  "Basic Analytics",
                  "Email Support",
                  "10 Promotions",
                ],
              },
              {
                title: "Gold",
                price: "₹2,499 / Month",
                color: "from-yellow-500 to-orange-500",
                features: [
                  "AI Insights",
                  "Unlimited Promotions",
                  "Priority Support",
                  "Advanced Reports",
                ],
              },
              {
                title: "Platinum",
                price: "₹4,999 / Month",
                color: "from-purple-600 to-pink-600",
                features: [
                  "Dedicated Manager",
                  "AI Marketing",
                  "Premium Visibility",
                  "Unlimited Everything",
                ],
              },
            ].map((plan) => (

              <div
                key={plan.title}
                className={`rounded-3xl bg-gradient-to-r ${plan.color} p-8 text-white shadow-lg`}
              >

                <h2 className="text-3xl font-bold">

                  {plan.title}

                </h2>

                <p className="mt-3 text-4xl font-bold">

                  {plan.price}

                </p>

                <div className="mt-8 space-y-4">

                  {plan.features.map((feature) => (

                    <div
                      key={feature}
                      className="flex items-center gap-3"
                    >

                      <ShieldCheck size={18} />

                      <span>

                        {feature}

                      </span>

                    </div>

                  ))}

                </div>

                <button className="mt-8 w-full rounded-xl bg-white py-3 font-semibold text-black">

                  View Plan

                </button>

              </div>

            ))}

          </div>

          {/* Revenue & Coupons */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Revenue Analytics

              </h2>

              <div className="mt-8 space-y-6">

                {[
                  ["Subscriptions", "₹42.8 L", "100%"],
                  ["Renewals", "₹18.5 L", "72%"],
                  ["Upgrades", "₹8.4 L", "35%"],
                  ["Enterprise", "₹15.7 L", "61%"],
                ].map(([title, value, width]) => (

                  <div key={title}>

                    <div className="mb-2 flex justify-between">

                      <span className="font-medium">

                        {title}

                      </span>

                      <span className="font-semibold text-orange-600">

                        {value}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-orange-500"
                        style={{ width }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Coupons & Offers

              </h2>

              <div className="mt-8 space-y-4">

                {[
                  "WELCOME50 - 50% Discount",
                  "PREMIUM20 - 20% OFF",
                  "YEARLY30 - Annual Savings",
                  "ENTERPRISE100 - Custom Offer",
                ].map((coupon) => (

                  <div
                    key={coupon}
                    className="rounded-2xl border p-5 hover:bg-orange-50"
                  >

                    {coupon}

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Upgrade Management */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Upgrade & Downgrade History */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Upgrade History
              </h2>

              <div className="mt-8 space-y-4">

                {[
                  {
                    restaurant: "Spice Garden",
                    action: "Silver → Gold",
                    date: "18 Jul 2026",
                  },
                  {
                    restaurant: "Burger Town",
                    action: "Gold → Platinum",
                    date: "16 Jul 2026",
                  },
                  {
                    restaurant: "Pizza House",
                    action: "Free → Silver",
                    date: "15 Jul 2026",
                  },
                  {
                    restaurant: "Royal Biryani",
                    action: "Gold → Enterprise",
                    date: "12 Jul 2026",
                  },
                ].map((item) => (

                  <div
                    key={item.restaurant}
                    className="flex items-center justify-between rounded-2xl border p-5 hover:bg-orange-50"
                  >

                    <div>

                      <h3 className="font-semibold">

                        {item.restaurant}

                      </h3>

                      <p className="text-sm text-gray-500">

                        {item.action}

                      </p>

                    </div>

                    <span className="text-sm font-semibold text-orange-600">

                      {item.date}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Invoice Management */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Invoice Management

              </h2>

              <div className="mt-8 space-y-4">

                {[
                  {
                    invoice: "#INV-1024",
                    amount: "₹4,999",
                    status: "Paid",
                  },
                  {
                    invoice: "#INV-1025",
                    amount: "₹2,499",
                    status: "Pending",
                  },
                  {
                    invoice: "#INV-1026",
                    amount: "₹999",
                    status: "Paid",
                  },
                  {
                    invoice: "#INV-1027",
                    amount: "₹4,999",
                    status: "Failed",
                  },
                ].map((invoice) => (

                  <div
                    key={invoice.invoice}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <div>

                      <h3 className="font-semibold">

                        {invoice.invoice}

                      </h3>

                      <p className="text-sm text-gray-500">

                        {invoice.amount}

                      </p>

                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-600"
                          : invoice.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >

                      {invoice.status}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Pricing Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">

            <h2 className="text-3xl font-bold">

              AI Pricing Insights

            </h2>

            <p className="mt-3 text-blue-100">

              AI analyzes customer behavior and recommends pricing,
              discounts, and subscription improvements.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Renewal Rate",
                  value: "92%",
                },
                {
                  title: "Upgrade Rate",
                  value: "37%",
                },
                {
                  title: "Revenue Growth",
                  value: "+28%",
                },
                {
                  title: "Customer Satisfaction",
                  value: "4.9/5",
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

          {/* Quick Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Create Plan",
                "Generate Invoice",
                "Send Renewal Reminder",
                "Create Coupon",
                "Export Revenue",
                "Billing Report",
                "Subscription Analytics",
                "Enterprise Contracts",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-orange-500 hover:bg-orange-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <h2 className="text-2xl font-bold">

              Subscription Management Platform

            </h2>

            <p className="mt-3 text-gray-500">

              Manage pricing, billing, enterprise plans, subscriptions,
              invoices, renewals, and business growth from a single dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

                Export Subscription Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Billing Analytics

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                View Invoices

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Subscription & Billing Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}