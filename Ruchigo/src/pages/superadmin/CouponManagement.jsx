import Navbar from "../../components/Navbar.jsx";

import {
  TicketPercent,
  Gift,
  Percent,
  Users,
  Search,
  Filter,
  Download,
  TrendingUp,
  CalendarDays,
  Tag,
  Sparkles,
} from "lucide-react";

export default function CouponManagement() {

  const stats = [
    {
      title: "Active Coupons",
      value: "148",
      icon: TicketPercent,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Campaigns",
      value: "42",
      icon: Gift,
      color: "bg-pink-100 text-pink-600",
    },
    {
      title: "Discount Given",
      value: "₹48.2 L",
      icon: Percent,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Coupon Usage",
      value: "82%",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  const coupons = [
    {
      code: "WELCOME50",
      type: "Flat ₹50",
      expiry: "31 Dec 2026",
      status: "Active",
    },
    {
      code: "FREEDEL",
      type: "Free Delivery",
      expiry: "15 Aug 2026",
      status: "Active",
    },
    {
      code: "SAVE20",
      type: "20% OFF",
      expiry: "01 Sep 2026",
      status: "Scheduled",
    },
    {
      code: "FEST100",
      type: "₹100 OFF",
      expiry: "30 Oct 2026",
      status: "Expired",
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

                Coupon & Promotion Management

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Create promotional campaigns, discount coupons,
                cashback offers, referral rewards and seasonal
                marketing campaigns across the RuchiGo platform.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-700">

              <Gift size={20} />

              Create Campaign

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
                  placeholder="Search coupons or campaigns..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-pink-500"
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

          {/* Coupons Table */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                Coupon Management

              </h2>

              <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-600">

                {coupons.length} Coupons

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Coupon Code</th>

                    <th className="px-4 py-4">Offer</th>

                    <th className="px-4 py-4">Expiry</th>

                    <th className="px-4 py-4">Status</th>

                    <th className="px-4 py-4">Action</th>

                  </tr>

                </thead>

                <tbody>

                  {coupons.map((coupon) => (

                    <tr
                      key={coupon.code}
                      className="border-b transition hover:bg-pink-50"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {coupon.code}

                      </td>

                      <td className="px-4 py-5">

                        {coupon.type}

                      </td>

                      <td className="px-4 py-5">

                        {coupon.expiry}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            coupon.status === "Active"
                              ? "bg-green-100 text-green-600"
                              : coupon.status === "Scheduled"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >

                          {coupon.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-pink-100 px-4 py-2 text-pink-600 hover:bg-pink-200">

                          Manage

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Campaigns & Referral */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Gift className="text-pink-600" />

                <h2 className="text-2xl font-bold">

                  Marketing Campaigns

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Independence Day Sale", "Running"],
                  ["Weekend Specials", "Scheduled"],
                  ["Diwali Mega Sale", "Upcoming"],
                  ["New User Campaign", "Active"],
                ].map(([campaign, status]) => (

                  <div
                    key={campaign}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{campaign}</span>

                    <span className="font-semibold text-pink-600">

                      {status}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Users className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Referral Program

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Referral Bonus", "₹100"],
                  ["Successful Referrals", "18,420"],
                  ["Reward Distributed", "₹18.4 L"],
                  ["Conversion Rate", "37%"],
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

          {/* Cashback & Free Delivery */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Percent className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Cashback Offers

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Cashback Campaigns", "12"],
                  ["Total Cashback", "₹8.2 L"],
                  ["Today's Cashback", "₹42,800"],
                  ["Redemption Rate", "64%"],
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

                <Tag className="text-orange-600" />

                <h2 className="text-2xl font-bold">

                  Free Delivery Promotions

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Active Offers", "18"],
                  ["Eligible Restaurants", "246"],
                  ["Orders Covered", "12,846"],
                  ["Savings Delivered", "₹4.8 L"],
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

          {/* Campaign Analytics */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Campaign Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <TrendingUp className="text-pink-600" />

                <h2 className="text-2xl font-bold">

                  Campaign Analytics

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Campaign Revenue", "₹2.84 Cr"],
                  ["Coupons Redeemed", "184,260"],
                  ["Conversion Rate", "67%"],
                  ["ROI", "432%"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-pink-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Scheduled Promotions */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <CalendarDays className="text-indigo-600" />

                <h2 className="text-2xl font-bold">

                  Scheduled Promotions

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Friendship Day Offer", "03 Aug 2026"],
                  ["Independence Day Sale", "15 Aug 2026"],
                  ["Ganesh Festival Deals", "18 Sep 2026"],
                  ["Diwali Mega Offers", "08 Nov 2026"],
                ].map(([campaign, date]) => (

                  <div
                    key={campaign}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{campaign}</span>

                    <span className="font-semibold text-indigo-600">

                      {date}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Promotion Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-700 p-8 text-white">

            <div className="flex items-center gap-3">

              <Sparkles size={32} />

              <h2 className="text-3xl font-bold">

                AI Promotion Insights

              </h2>

            </div>

            <p className="mt-4 text-pink-100">

              AI analyzes customer behavior, predicts campaign
              performance, recommends personalized coupons,
              optimizes discount values, identifies high-performing
              marketing channels, and forecasts future promotional ROI.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Predicted ROI",
                  value: "458%",
                },
                {
                  title: "Customer Engagement",
                  value: "91%",
                },
                {
                  title: "Campaign Success",
                  value: "94%",
                },
                {
                  title: "AI Accuracy",
                  value: "99.2%",
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

          {/* Quick Promotion Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Promotion Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Create Coupon",
                "Launch Campaign",
                "Schedule Promotion",
                "Generate Referral Code",
                "Approve Cashback",
                "Export Analytics",
                "Promotion Report",
                "Marketing Dashboard",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-pink-500 hover:bg-pink-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <Gift
              size={42}
              className="mx-auto text-pink-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Coupon & Promotion Center

            </h2>

            <p className="mt-3 text-gray-500">

              Manage discount campaigns, referral programs,
              cashback offers, free delivery promotions,
              AI-powered marketing strategies, and enterprise
              promotional analytics from one centralized dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-700">

                Export Campaign Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Marketing Dashboard

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                View Promotion History

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Marketing Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}