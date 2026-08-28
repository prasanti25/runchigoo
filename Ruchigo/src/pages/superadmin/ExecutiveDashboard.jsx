import Navbar from "../../components/Navbar.jsx";

import {
  LayoutDashboard,
  IndianRupee,
  ShoppingBag,
  Users,
  Store,
  Bike,
  Search,
  Filter,
  Download,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";

export default function ExecutiveDashboard() {

  const stats = [
    {
      title: "Platform Revenue",
      value: "₹12.84 Cr",
      icon: IndianRupee,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Orders Today",
      value: "28,416",
      icon: ShoppingBag,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Active Users",
      value: "2.84 L",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Restaurants",
      value: "3,246",
      icon: Store,
      color: "bg-purple-100 text-purple-600",
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

                Executive Dashboard

              </p>

              <h1 className="mt-2 text-4xl font-bold">

                Business Intelligence Center

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Executive overview of revenue, orders,
                customers, restaurants, delivery operations,
                growth metrics and AI-powered business insights.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">

              <LayoutDashboard size={20} />

              Executive Report

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
                  placeholder="Search reports..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-indigo-500"
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

          {/* Revenue & Growth */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Revenue Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <IndianRupee className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Revenue Growth

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Today's Revenue", "₹18.4 L"],
                  ["Weekly Revenue", "₹1.32 Cr"],
                  ["Monthly Revenue", "₹12.84 Cr"],
                  ["Growth Rate", "+28.4%"],
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

            {/* Orders */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <ShoppingBag className="text-orange-600" />

                <h2 className="text-2xl font-bold">

                  Order Analytics

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Delivered", "25,920"],
                  ["Preparing", "1,126"],
                  ["Cancelled", "302"],
                  ["Refunded", "184"],
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

          {/* Customer & Restaurant */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Users className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Customer Insights

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["New Users", "2,486"],
                  ["Returning Users", "18,240"],
                  ["Premium Members", "28,412"],
                  ["Retention Rate", "89%"],
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

                <Store className="text-purple-600" />

                <h2 className="text-2xl font-bold">

                  Restaurant Performance

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Active Restaurants", "3,246"],
                  ["Top Rated", "812"],
                  ["Pending Approval", "46"],
                  ["Avg Rating", "4.8 ★"],
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

          {/* Delivery & City Analytics */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Bike className="text-red-600" />

                <h2 className="text-2xl font-bold">

                  Delivery Performance

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Online Partners", "5,248"],
                  ["Avg Delivery Time", "24 mins"],
                  ["Completed Today", "24,984"],
                  ["Success Rate", "98.9%"],
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

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Activity className="text-indigo-600" />

                <h2 className="text-2xl font-bold">

                  City-wise Performance

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Hyderabad", "₹3.42 Cr"],
                  ["Bengaluru", "₹2.84 Cr"],
                  ["Chennai", "₹2.10 Cr"],
                  ["Vijayawada", "₹1.28 Cr"],
                ].map(([city, revenue]) => (

                  <div
                    key={city}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{city}</span>

                    <span className="font-semibold text-indigo-600">

                      {revenue}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Live Business Metrics */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-700 p-8 text-white">

            <div className="flex items-center gap-3">

              <BarChart3 size={30} />

              <h2 className="text-3xl font-bold">

                Live Business Metrics

              </h2>

            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Live Orders",
                  value: "2,186",
                },
                {
                  title: "Customers Online",
                  value: "48,920",
                },
                {
                  title: "Restaurants Open",
                  value: "2,982",
                },
                {
                  title: "Delivery Partners",
                  value: "5,248",
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

          {/* AI Executive Insights */}
                    <div className="mt-10 rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 p-8 text-white">

            <div className="flex items-center gap-3">

              <Activity size={32} />

              <h2 className="text-3xl font-bold">

                AI Executive Insights

              </h2>

            </div>

            <p className="mt-4 text-blue-100">

              The AI Executive Engine continuously analyzes platform-wide
              operations, predicts future revenue, identifies business risks,
              detects unusual trends, recommends growth strategies, monitors
              customer satisfaction, and provides real-time decision support
              for executive leadership.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Revenue Forecast",
                  value: "₹14.8 Cr",
                },
                {
                  title: "Growth Confidence",
                  value: "96%",
                },
                {
                  title: "Risk Score",
                  value: "Low",
                },
                {
                  title: "AI Accuracy",
                  value: "99.3%",
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

          {/* Strategic Forecast */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <TrendingUp className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Strategic Forecast

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Projected Revenue", "₹16.2 Cr"],
                  ["Projected Orders", "9.4 L"],
                  ["Expected Growth", "+31%"],
                  ["Expansion Readiness", "High"],
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

                <BarChart3 className="text-indigo-600" />

                <h2 className="text-2xl font-bold">

                  Business Recommendations

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  "Expand to 5 new cities",
                  "Increase delivery partners during weekends",
                  "Launch festive marketing campaigns",
                  "Promote top-performing restaurants",
                  "Optimize delivery routes using AI",
                  "Reduce cancellation rates",
                ].map((item) => (

                  <div
                    key={item}
                    className="rounded-2xl border p-4 hover:bg-indigo-50"
                  >

                    {item}

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Executive Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Executive Quick Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Download Executive Report",
                "Business Analytics",
                "Investor Summary",
                "Revenue Report",
                "Export KPIs",
                "Performance Review",
                "Growth Strategy",
                "AI Recommendations",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-indigo-500 hover:bg-indigo-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <LayoutDashboard
              size={42}
              className="mx-auto text-indigo-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Executive Business Intelligence Center

            </h2>

            <p className="mt-3 text-gray-500">

              Monitor revenue, customers, restaurants, delivery operations,
              platform performance, AI insights, forecasts, and strategic
              business metrics from one centralized executive dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">

                Export Executive Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                View Analytics

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Investor Dashboard

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Executive Business Intelligence Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}