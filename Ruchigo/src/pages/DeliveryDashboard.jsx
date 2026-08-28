import DeliverySidebar from "../components/DeliverySidebar.jsx";
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  Star,
  Bell,
  MapPin,
  Navigation,
  Bike,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Today's Deliveries",
    value: "18",
    description: "+4 from yesterday",
    icon: ShoppingBag,
  },
  {
    title: "Today's Earnings",
    value: "₹1,240",
    description: "+18.5% today",
    icon: IndianRupee,
  },
  {
    title: "Online Hours",
    value: "6h 42m",
    description: "Active today",
    icon: Clock,
  },
  {
    title: "Partner Rating",
    value: "4.9",
    description: "1,240 deliveries",
    icon: Star,
  },
];

const recentDeliveries = [
  {
    id: "#RG1287",
    restaurant: "Paradise Biryani",
    customer: "Pavan K",
    amount: "₹68",
    status: "Delivered",
  },
  {
    id: "#RG1284",
    restaurant: "Pizza Hub",
    customer: "Sai Nadh",
    amount: "₹72",
    status: "Delivered",
  },
  {
    id: "#RG1281",
    restaurant: "Burger House",
    customer: "Suhitha",
    amount: "₹55",
    status: "Delivered",
  },
];

export default function DeliveryDashboard() {
  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <DeliverySidebar />

      <main className="ml-72 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-orange-100 bg-white px-8 py-5">
          <div>
            <p className="text-sm text-gray-500">
              Good evening, Rahul 👋
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Delivery Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Online Status */}
            <div className="flex items-center gap-3 rounded-xl bg-green-50 px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-green-500" />

              <span className="font-semibold text-green-600">
                Online
              </span>
            </div>

            <button className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Bell size={20} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
              RK
            </div>
          </div>
        </header>

        <section className="p-8">
          {/* Stats */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <Icon size={23} />
                    </div>

                    <TrendingUp
                      size={19}
                      className="text-green-500"
                    />
                  </div>

                  <p className="mt-6 text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h2>

                  <p className="mt-3 text-xs text-green-600">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="mt-8 grid gap-7 xl:grid-cols-[1.5fr_1fr]">
            {/* Active Delivery */}
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-500">
                    ACTIVE DELIVERY
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    Order #RG1290
                  </h2>
                </div>

                <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-500">
                  On the way
                </span>
              </div>

              {/* Delivery Route */}
              <div className="mt-7 rounded-3xl bg-[#fffaf7] p-6">
                <div className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white">
                      <Bike size={21} />
                    </div>

                    <div className="h-16 w-[2px] bg-orange-300" />

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                      <MapPin size={21} />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div>
                      <p className="text-xs text-gray-400">
                        PICKUP
                      </p>

                      <h3 className="mt-1 font-bold text-gray-900">
                        Paradise Biryani
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Brodipet, Guntur
                      </p>
                    </div>

                    <div className="mt-12">
                      <p className="text-xs text-gray-400">
                        DELIVERY
                      </p>

                      <h3 className="mt-1 font-bold text-gray-900">
                        Pavan K
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Lakshmipuram, Guntur
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-xs text-gray-500">
                    Distance
                  </p>

                  <p className="mt-2 text-lg font-bold text-gray-900">
                    3.8 km
                  </p>
                </div>

                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-xs text-gray-500">
                    Estimated Time
                  </p>

                  <p className="mt-2 text-lg font-bold text-gray-900">
                    12 min
                  </p>
                </div>

                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-xs text-gray-500">
                    Delivery Earnings
                  </p>

                  <p className="mt-2 text-lg font-bold text-green-600">
                    ₹68
                  </p>
                </div>
              </div>

              <Link
                to="/delivery-navigation"
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 px-6 py-4 font-semibold text-white shadow-lg transition hover:bg-orange-600"
              >
                <Navigation size={21} />
                Continue Navigation
                <ArrowRight size={19} />
              </Link>
            </section>

            {/* Daily Target */}
            <aside className="rounded-3xl bg-gradient-to-br from-orange-600 to-orange-400 p-7 text-white shadow-lg">
              <p className="text-sm text-orange-100">
                Today's Target
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                18 / 25 Deliveries
              </h2>

              <p className="mt-3 text-orange-100">
                Complete 7 more deliveries to reach your daily target.
              </p>

              <div className="mt-7">
                <div className="h-3 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-[72%] rounded-full bg-white" />
                </div>

                <div className="mt-3 flex justify-between text-sm text-orange-100">
                  <span>72% Completed</span>
                  <span>7 Remaining</span>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-white/15 p-5 backdrop-blur-lg">
                <p className="text-sm text-orange-100">
                  Target Bonus
                </p>

                <p className="mt-2 text-3xl font-bold">
                  ₹500
                </p>

                <p className="mt-2 text-sm text-orange-100">
                  Complete 25 deliveries today
                </p>
              </div>

              <div className="mt-8">
                <p className="text-sm text-orange-100">
                  Current Earnings
                </p>

                <p className="mt-2 text-4xl font-bold">
                  ₹1,240
                </p>
              </div>
            </aside>
          </div>

          {/* Recent Deliveries */}
          <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Recent Deliveries
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Your latest completed deliveries.
                </p>
              </div>

              <Link
                to="/delivery-orders"
                className="font-semibold text-orange-500"
              >
                View All
              </Link>
            </div>

            <div className="mt-7 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-400">
                    <th className="pb-4 font-medium">
                      Order ID
                    </th>

                    <th className="pb-4 font-medium">
                      Restaurant
                    </th>

                    <th className="pb-4 font-medium">
                      Customer
                    </th>

                    <th className="pb-4 font-medium">
                      Earnings
                    </th>

                    <th className="pb-4 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentDeliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="border-b border-gray-50"
                    >
                      <td className="py-5 font-semibold text-gray-900">
                        {delivery.id}
                      </td>

                      <td className="py-5 text-gray-600">
                        {delivery.restaurant}
                      </td>

                      <td className="py-5 text-gray-600">
                        {delivery.customer}
                      </td>

                      <td className="py-5 font-bold text-green-600">
                        {delivery.amount}
                      </td>

                      <td className="py-5">
                        <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-600">
                          {delivery.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}