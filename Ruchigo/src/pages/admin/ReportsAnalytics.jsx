import Navbar from "../../components/Navbar.jsx";

import {
  BarChart3,
  CalendarDays,
  Filter,
 Download,
} from "lucide-react";

export default function ReportsAnalytics() {

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
                Reports & Analytics
              </h1>

              <p className="mt-3 text-gray-500">
                Monitor platform growth, revenue, customer engagement and business performance.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <button className="flex items-center gap-2 rounded-2xl border px-5 py-3 hover:bg-gray-100">

                <CalendarDays size={18} />

                This Month

              </button>

              <button className="flex items-center gap-2 rounded-2xl border px-5 py-3 hover:bg-gray-100">

                <Filter size={18} />

                Filters

              </button>

              <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600">

                <Download size={18} />

                Export Report

              </button>

            </div>

          </div>

          {/* KPI Cards */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

            {[
              {
                title: "Revenue",
                value: "₹1.12 Cr",
                color: "text-green-600",
              },
              {
                title: "Orders",
                value: "18,540",
                color: "text-orange-600",
              },
              {
                title: "Customers",
                value: "8,924",
                color: "text-blue-600",
              },
              {
                title: "Restaurants",
                value: "426",
                color: "text-purple-600",
              },
              {
                title: "Delivery Partners",
                value: "318",
                color: "text-red-600",
              },
            ].map((item) => (

              <div
                key={item.title}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >

                <BarChart3
                  size={30}
                  className={item.color}
                />

                <h3 className="mt-5 text-gray-500">
                  {item.title}
                </h3>

                <p className={`mt-2 text-3xl font-bold ${item.color}`}>
                  {item.value}
                </p>

              </div>

            ))}

          </div>

          {/* Analytics Section */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Revenue Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Revenue Analytics
              </h2>

              <p className="mt-2 text-gray-500">
                Revenue performance over the last 7 days.
              </p>

              <div className="mt-8 flex h-72 items-end justify-between gap-4">

                {[
                  { day: "Mon", value: 45 },
                  { day: "Tue", value: 62 },
                  { day: "Wed", value: 70 },
                  { day: "Thu", value: 88 },
                  { day: "Fri", value: 95 },
                  { day: "Sat", value: 100 },
                  { day: "Sun", value: 82 },
                ].map((item) => (

                  <div
                    key={item.day}
                    className="flex flex-1 flex-col items-center"
                  >

                    <div
                      className="w-full rounded-t-xl bg-green-500 transition hover:bg-green-600"
                      style={{ height: `${item.value * 2.2}px` }}
                    />

                    <span className="mt-3 text-sm font-medium text-gray-600">
                      {item.day}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Orders Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Orders Trend
              </h2>

              <p className="mt-2 text-gray-500">
                Daily order growth across the platform.
              </p>

              <div className="mt-8 space-y-6">

                {[
                  {
                    label: "Completed Orders",
                    value: "18,540",
                    width: "94%",
                    color: "bg-green-500",
                  },
                  {
                    label: "Pending Orders",
                    value: "324",
                    width: "28%",
                    color: "bg-yellow-500",
                  },
                  {
                    label: "Cancelled Orders",
                    value: "102",
                    width: "12%",
                    color: "bg-red-500",
                  },
                  {
                    label: "Refunded Orders",
                    value: "54",
                    width: "8%",
                    color: "bg-blue-500",
                  },
                ].map((item) => (

                  <div key={item.label}>

                    <div className="mb-2 flex justify-between">

                      <span>{item.label}</span>

                      <span className="font-semibold">
                        {item.value}
                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: item.width }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Customer & Restaurant Analytics */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Customer Growth */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Customer Growth
              </h2>

              <p className="mt-2 text-gray-500">
                Customer acquisition and engagement.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-5">

                <div className="rounded-2xl bg-blue-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-blue-600">
                    8,924
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Total Customers
                  </p>

                </div>

                <div className="rounded-2xl bg-green-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-green-600">
                    1,248
                  </h3>

                  <p className="mt-2 text-gray-600">
                    New This Month
                  </p>

                </div>

                <div className="rounded-2xl bg-orange-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-orange-600">
                    74%
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Retention Rate
                  </p>

                </div>

                <div className="rounded-2xl bg-purple-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-purple-600">
                    68%
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Repeat Customers
                  </p>

                </div>

              </div>

            </div>

            {/* Restaurant Performance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Restaurant Performance
              </h2>

              <p className="mt-2 text-gray-500">
                Best performing restaurants this month.
              </p>

              <div className="mt-8 space-y-5">

                {[
                  {
                    name: "Paradise Biryani",
                    revenue: "₹18.4L",
                    rating: "4.9★",
                  },
                  {
                    name: "Domino's Pizza",
                    revenue: "₹16.8L",
                    rating: "4.8★",
                  },
                  {
                    name: "KFC",
                    revenue: "₹15.3L",
                    rating: "4.7★",
                  },
                  {
                    name: "Burger King",
                    revenue: "₹13.6L",
                    rating: "4.7★",
                  },
                  {
                    name: "Mehfil Restaurant",
                    revenue: "₹12.2L",
                    rating: "4.8★",
                  },
                ].map((restaurant, index) => (

                  <div
                    key={restaurant.name}
                    className="flex items-center justify-between rounded-2xl border p-4 transition hover:bg-orange-50"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">

                        #{index + 1}

                      </div>

                      <div>

                        <h3 className="font-semibold text-gray-900">
                          {restaurant.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          Revenue: {restaurant.revenue}
                        </p>

                      </div>

                    </div>

                    <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                      {restaurant.rating}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Delivery Analytics */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Delivery Performance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Delivery Performance
              </h2>

              <p className="mt-2 text-gray-500">
                Performance of delivery operations across the platform.
              </p>

              <div className="mt-8 space-y-6">

                {[
                  {
                    title: "On-Time Delivery",
                    value: "96%",
                    width: "96%",
                    color: "bg-green-500",
                  },
                  {
                    title: "Average Delivery Time",
                    value: "27 mins",
                    width: "82%",
                    color: "bg-blue-500",
                  },
                  {
                    title: "Successful Deliveries",
                    value: "98.4%",
                    width: "98%",
                    color: "bg-orange-500",
                  },
                  {
                    title: "Cancelled Deliveries",
                    value: "1.6%",
                    width: "12%",
                    color: "bg-red-500",
                  },
                ].map((item) => (

                  <div key={item.title}>

                    <div className="mb-2 flex justify-between">

                      <span>{item.title}</span>

                      <span className="font-semibold">
                        {item.value}
                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: item.width }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Ratings Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Ratings & Reviews
              </h2>

              <p className="mt-2 text-gray-500">
                Average ratings across the platform.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-5">

                <div className="rounded-2xl bg-yellow-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-yellow-600">
                    ⭐ 4.8
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Customer Rating
                  </p>

                </div>

                <div className="rounded-2xl bg-green-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-green-600">
                    ⭐ 4.7
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Restaurant Rating
                  </p>

                </div>

                <div className="rounded-2xl bg-blue-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-blue-600">
                    ⭐ 4.9
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Delivery Rating
                  </p>

                </div>

                <div className="rounded-2xl bg-purple-50 p-5 text-center">

                  <h3 className="text-3xl font-bold text-purple-600">
                    18,240
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Reviews Received
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Payment & City Analytics */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Payment Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Payment Analytics
              </h2>

              <p className="mt-2 text-gray-500">
                Payment success and preferred methods.
              </p>

              <div className="mt-8 space-y-6">

                {[
                  {
                    method: "UPI",
                    percentage: "62%",
                    width: "62%",
                    color: "bg-blue-500",
                  },
                  {
                    method: "Credit Card",
                    percentage: "18%",
                    width: "18%",
                    color: "bg-green-500",
                  },
                  {
                    method: "Debit Card",
                    percentage: "12%",
                    width: "12%",
                    color: "bg-orange-500",
                  },
                  {
                    method: "Wallet",
                    percentage: "8%",
                    width: "8%",
                    color: "bg-purple-500",
                  },
                ].map((payment) => (

                  <div key={payment.method}>

                    <div className="mb-2 flex justify-between">

                      <span>{payment.method}</span>

                      <span className="font-semibold">
                        {payment.percentage}
                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className={`h-full rounded-full ${payment.color}`}
                        style={{ width: payment.width }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* City-wise Sales */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                City-wise Sales
              </h2>

              <p className="mt-2 text-gray-500">
                Top performing cities by revenue.
              </p>

              <div className="mt-8 space-y-5">

                {[
                  {
                    city: "Hyderabad",
                    revenue: "₹36.4L",
                  },
                  {
                    city: "Bengaluru",
                    revenue: "₹29.8L",
                  },
                  {
                    city: "Chennai",
                    revenue: "₹22.5L",
                  },
                  {
                    city: "Mumbai",
                    revenue: "₹19.2L",
                  },
                  {
                    city: "Pune",
                    revenue: "₹14.8L",
                  },
                ].map((city, index) => (

                  <div
                    key={city.city}
                    className="flex items-center justify-between rounded-2xl border p-4 hover:bg-orange-50 transition"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">

                        #{index + 1}

                      </div>

                      <div>

                        <h3 className="font-semibold text-gray-900">
                          {city.city}
                        </h3>

                        <p className="text-sm text-gray-500">
                          Revenue Generated
                        </p>

                      </div>

                    </div>

                    <span className="font-bold text-green-600">
                      {city.revenue}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Peak Hours & Categories */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Peak Ordering Hours */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Peak Ordering Hours
              </h2>

              <p className="mt-2 text-gray-500">
                Customer ordering activity throughout the day.
              </p>

              <div className="mt-8 flex h-64 items-end justify-between gap-3">

                {[
                  { hour: "9 AM", value: 18 },
                  { hour: "11 AM", value: 38 },
                  { hour: "1 PM", value: 95 },
                  { hour: "3 PM", value: 52 },
                  { hour: "6 PM", value: 80 },
                  { hour: "8 PM", value: 100 },
                  { hour: "10 PM", value: 72 },
                ].map((item) => (

                  <div
                    key={item.hour}
                    className="flex flex-1 flex-col items-center"
                  >

                    <div
                      className="w-full rounded-t-xl bg-orange-500 transition hover:bg-orange-600"
                      style={{ height: `${item.value * 2}px` }}
                    />

                    <span className="mt-3 text-xs font-medium text-gray-600">
                      {item.hour}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Popular Food Categories */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Popular Food Categories
              </h2>

              <p className="mt-2 text-gray-500">
                Most ordered food categories this month.
              </p>

              <div className="mt-8 space-y-6">

                {[
                  {
                    name: "🍕 Pizza",
                    orders: "32%",
                    width: "32%",
                    color: "bg-red-500",
                  },
                  {
                    name: "🍔 Burgers",
                    orders: "24%",
                    width: "24%",
                    color: "bg-yellow-500",
                  },
                  {
                    name: "🍛 Biryani",
                    orders: "21%",
                    width: "21%",
                    color: "bg-orange-500",
                  },
                  {
                    name: "🥤 Beverages",
                    orders: "14%",
                    width: "14%",
                    color: "bg-blue-500",
                  },
                  {
                    name: "🍰 Desserts",
                    orders: "9%",
                    width: "9%",
                    color: "bg-pink-500",
                  },
                ].map((category) => (

                  <div key={category.name}>

                    <div className="mb-2 flex justify-between">

                      <span className="font-medium">
                        {category.name}
                      </span>

                      <span className="font-semibold">
                        {category.orders}
                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className={`h-full rounded-full ${category.color}`}
                        style={{ width: category.width }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Business Insights */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold text-gray-900">
              AI Business Insights
            </h2>

            <p className="mt-2 text-gray-500">
              Automated recommendations based on current platform performance.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-2xl bg-green-50 p-6">

                <h3 className="font-semibold text-green-700">
                  📈 Revenue Growth
                </h3>

                <p className="mt-3 text-gray-600">
                  Revenue has increased by <strong>22%</strong> compared to last month.
                </p>

              </div>

              <div className="rounded-2xl bg-blue-50 p-6">

                <h3 className="font-semibold text-blue-700">
                  👥 Customer Retention
                </h3>

                <p className="mt-3 text-gray-600">
                  Loyal customers account for <strong>68%</strong> of total orders.
                </p>

              </div>

              <div className="rounded-2xl bg-orange-50 p-6">

                <h3 className="font-semibold text-orange-700">
                  🚚 Delivery Efficiency
                </h3>

                <p className="mt-3 text-gray-600">
                  Average delivery time has improved by <strong>11%</strong>.
                </p>

              </div>

              <div className="rounded-2xl bg-purple-50 p-6">

                <h3 className="font-semibold text-purple-700">
                  💡 Recommendation
                </h3>

                <p className="mt-3 text-gray-600">
                  Increase dinner-time promotions between <strong>7 PM - 9 PM</strong>.
                </p>

              </div>

            </div>

          </div>

          {/* Executive Summary */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-8 text-white">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-3xl font-bold">
                  Executive Summary
                </h2>

                <p className="mt-3 max-w-3xl text-orange-100">
                  RuchiGo continues to show strong platform growth with increasing
                  customer engagement, higher order volumes, improved delivery
                  efficiency, and steady revenue growth. AI insights indicate
                  excellent business performance while highlighting opportunities
                  for further optimization during peak ordering hours.
                </p>

              </div>

              <div className="flex flex-wrap gap-4">

                <button className="rounded-2xl bg-white px-6 py-3 font-semibold text-orange-600 transition hover:bg-orange-100">
                  Download PDF
                </button>

                <button className="rounded-2xl border border-white px-6 py-3 font-semibold transition hover:bg-white hover:text-orange-600">
                  Export Excel
                </button>

              </div>

            </div>

          </div>

        </section>

      </main>

    </>

  );

}