import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  Users,
  Store,
  Bike,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  Bell,
  Search,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
} from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "24,580",
    change: "+12.8%",
    icon: Users,
    iconStyle: "bg-blue-50 text-blue-600",
  },
  {
    title: "Restaurants",
    value: "842",
    change: "+8.4%",
    icon: Store,
    iconStyle: "bg-orange-50 text-orange-500",
  },
  {
    title: "Delivery Partners",
    value: "1,284",
    change: "+14.2%",
    icon: Bike,
    iconStyle: "bg-purple-50 text-purple-600",
  },
  {
    title: "Total Orders",
    value: "48,920",
    change: "+18.5%",
    icon: ShoppingBag,
    iconStyle: "bg-green-50 text-green-600",
  },
];

const weeklyOrders = [
  { day: "Mon", orders: 4800 },
  { day: "Tue", orders: 6200 },
  { day: "Wed", orders: 5700 },
  { day: "Thu", orders: 7100 },
  { day: "Fri", orders: 8400 },
  { day: "Sat", orders: 9600 },
  { day: "Sun", orders: 8900 },
];

const recentOrders = [
  {
    id: "#RG1302",
    customer: "Pavan K",
    restaurant: "Paradise Biryani",
    amount: "₹433",
    status: "Preparing",
  },
  {
    id: "#RG1301",
    customer: "Sai Nadh",
    restaurant: "Pizza Hub",
    amount: "₹648",
    status: "Delivered",
  },
  {
    id: "#RG1300",
    customer: "Suhitha",
    restaurant: "Burger House",
    amount: "₹348",
    status: "On the way",
  },
  {
    id: "#RG1299",
    customer: "Kiran Kumar",
    restaurant: "Spice Kitchen",
    amount: "₹599",
    status: "Pending",
  },
  {
    id: "#RG1298",
    customer: "Harsha",
    restaurant: "Food Palace",
    amount: "₹896",
    status: "Delivered",
  },
];

function getStatusStyle(status) {
  if (status === "Delivered") {
    return "bg-green-50 text-green-600";
  }

  if (status === "Preparing") {
    return "bg-orange-50 text-orange-500";
  }

  if (status === "On the way") {
    return "bg-blue-50 text-blue-600";
  }

  return "bg-yellow-50 text-yellow-600";
}

export default function AdminDashboard() {
  const maxOrders = Math.max(
    ...weeklyOrders.map((item) => item.orders)
  );

  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <AdminSidebar />

      <main className="ml-72 min-h-screen">
        <header className="flex items-center justify-between border-b border-orange-100 bg-white px-8 py-5">
          <div>
            <p className="text-sm text-gray-500">
              Platform Overview
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center rounded-xl bg-gray-50 px-4 lg:flex">
              <Search size={18} className="text-gray-400" />

              <input
                type="text"
                placeholder="Search platform..."
                className="w-56 bg-transparent px-3 py-3 text-sm outline-none"
              />
            </div>

            <button className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Bell size={20} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
              AD
            </div>
          </div>
        </header>

        <section className="p-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconStyle}`}
                    >
                      <Icon size={23} />
                    </div>

                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-600">
                      <ArrowUpRight size={14} />
                      {stat.change}
                    </span>
                  </div>

                  <p className="mt-6 text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h2>

                  <p className="mt-3 text-xs text-gray-400">
                    Compared to last month
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid gap-7 xl:grid-cols-[1.7fr_1fr]">
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Platform Orders
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Order activity across the platform this week.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                  <TrendingUp size={18} />
                  +18.5%
                </div>
              </div>

              <div className="mt-10 flex h-72 items-end justify-between gap-5 border-b border-gray-100">
                {weeklyOrders.map((item) => {
                  const height =
                    (item.orders / maxOrders) * 100;

                  return (
                    <div
                      key={item.day}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <p className="mb-3 text-xs font-semibold text-gray-500">
                        {(item.orders / 1000).toFixed(1)}K
                      </p>

                      <div
                        className="w-full max-w-14 rounded-t-2xl bg-gradient-to-t from-orange-600 to-orange-400 transition hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />

                      <p className="mt-4 pb-4 text-sm font-medium text-gray-500">
                        {item.day}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="rounded-3xl bg-gradient-to-br from-orange-600 to-orange-400 p-7 text-white shadow-lg">
              <p className="text-sm text-orange-100">
                Platform Revenue
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                ₹18.4L
              </h2>

              <div className="mt-3 flex items-center gap-2 text-orange-100">
                <TrendingUp size={18} />

                <span className="text-sm">
                  21.4% growth this month
                </span>
              </div>

              <div className="mt-8 rounded-2xl bg-white/15 p-5 backdrop-blur-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-100">
                    Order Revenue
                  </span>

                  <span className="font-bold">
                    ₹14.8L
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-orange-100">
                    Platform Commission
                  </span>

                  <span className="font-bold">
                    ₹2.4L
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-orange-100">
                    Delivery Fees
                  </span>

                  <span className="font-bold">
                    ₹1.2L
                  </span>
                </div>
              </div>

              <div className="mt-7 flex items-center gap-3">
                <IndianRupee size={22} />

                <p className="text-sm text-orange-100">
                  Revenue is performing above this month's target.
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-8 grid gap-7 xl:grid-cols-[1.6fr_1fr]">
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Recent Orders
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Latest orders across RuchiGo.
                  </p>
                </div>

                <button className="font-semibold text-orange-500">
                  View All
                </button>
              </div>

              <div className="mt-7 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-sm text-gray-400">
                      <th className="pb-4 font-medium">
                        Order ID
                      </th>

                      <th className="pb-4 font-medium">
                        Customer
                      </th>

                      <th className="pb-4 font-medium">
                        Restaurant
                      </th>

                      <th className="pb-4 font-medium">
                        Amount
                      </th>

                      <th className="pb-4 font-medium">
                        Status
                      </th>

                      <th className="pb-4 font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-50"
                      >
                        <td className="py-5 font-semibold text-gray-900">
                          {order.id}
                        </td>

                        <td className="py-5 text-gray-600">
                          {order.customer}
                        </td>

                        <td className="py-5 text-gray-600">
                          {order.restaurant}
                        </td>

                        <td className="py-5 font-bold text-gray-900">
                          {order.amount}
                        </td>

                        <td className="py-5">
                          <span
                            className={`rounded-full px-3 py-2 text-xs font-semibold ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="py-5">
                          <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition hover:bg-orange-500 hover:text-white">
                            <Eye size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                Platform Status
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Current operational overview.
              </p>

              <div className="mt-7 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl bg-green-50 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500 text-white">
                    <CheckCircle2 size={21} />
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      Platform Online
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      All systems operational
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-orange-50 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
                    <Clock size={21} />
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      148 Active Orders
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Currently being processed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-yellow-50 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500 text-white">
                    <AlertTriangle size={21} />
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      12 Pending Approvals
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Restaurants and partners
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-blue-50 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-white">
                    <Bike size={21} />
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      642 Partners Online
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Available for deliveries
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}