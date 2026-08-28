import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  ShoppingBag,
  Clock3,
  Bike,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  XCircle,
  MoreVertical,
  Store,
  User,
  IndianRupee,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const orders = [
  {
    id: "#RG1302",
    customer: "Pavan K",
    restaurant: "Paradise Biryani",
    partner: "Rahul Kumar",
    location: "Brodipet, Guntur",
    items: "Chicken Biryani × 2",
    amount: "₹433",
    payment: "UPI",
    time: "15 Jul, 7:30 PM",
    status: "Preparing",
  },
  {
    id: "#RG1301",
    customer: "Sai Nadh",
    restaurant: "Pizza Hub",
    partner: "Sai Teja",
    location: "Arundelpet, Guntur",
    items: "Farmhouse Pizza × 2",
    amount: "₹648",
    payment: "Card",
    time: "15 Jul, 7:12 PM",
    status: "Delivered",
  },
  {
    id: "#RG1300",
    customer: "Suhitha",
    restaurant: "Burger House",
    partner: "Harsha Sai",
    location: "Lakshmipuram, Guntur",
    items: "Chicken Burger × 2",
    amount: "₹348",
    payment: "UPI",
    time: "15 Jul, 6:48 PM",
    status: "On the way",
  },
  {
    id: "#RG1299",
    customer: "Kiran Kumar",
    restaurant: "Spice Kitchen",
    partner: "Not Assigned",
    location: "Pattabhipuram, Guntur",
    items: "South Indian Meals × 3",
    amount: "₹599",
    payment: "COD",
    time: "15 Jul, 6:24 PM",
    status: "Pending",
  },
  {
    id: "#RG1298",
    customer: "Harsha",
    restaurant: "Food Palace",
    partner: "Rahul Kumar",
    location: "Gorantla, Guntur",
    items: "Family Combo × 1",
    amount: "₹896",
    payment: "Card",
    time: "15 Jul, 5:56 PM",
    status: "Delivered",
  },
  {
    id: "#RG1297",
    customer: "Meghana",
    restaurant: "Royal Tiffins",
    partner: "Sai Teja",
    location: "Nallapadu, Guntur",
    items: "Dosa Combo × 2",
    amount: "₹280",
    payment: "UPI",
    time: "15 Jul, 5:28 PM",
    status: "Cancelled",
  },
];

const stats = [
  {
    title: "Total Orders",
    value: "48,920",
    description: "All platform orders",
    icon: ShoppingBag,
    style: "bg-blue-50 text-blue-600",
  },
  {
    title: "Active Orders",
    value: "148",
    description: "Currently being processed",
    icon: Clock3,
    style: "bg-orange-50 text-orange-500",
  },
  {
    title: "Out for Delivery",
    value: "86",
    description: "Orders with delivery partners",
    icon: Bike,
    style: "bg-purple-50 text-purple-600",
  },
  {
    title: "Delivered Today",
    value: "1,284",
    description: "Successfully completed today",
    icon: CheckCircle2,
    style: "bg-green-50 text-green-600",
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

  if (status === "Pending") {
    return "bg-yellow-50 text-yellow-600";
  }

  return "bg-red-50 text-red-500";
}

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredOrders = orders.filter((order) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      order.id.toLowerCase().includes(searchValue) ||
      order.customer.toLowerCase().includes(searchValue) ||
      order.restaurant.toLowerCase().includes(searchValue) ||
      order.partner.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <AdminSidebar />

      <main className="ml-72 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-orange-100 bg-white px-8 py-5">
          <div>
            <p className="text-sm text-gray-500">
              Order Administration
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Orders Management
            </h1>
          </div>

          <div className="rounded-xl bg-green-50 px-5 py-3">
            <p className="text-sm font-semibold text-green-600">
              ● Platform Orders Live
            </p>
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
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.style}`}
                  >
                    <Icon size={23} />
                  </div>

                  <p className="mt-6 text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h2>

                  <p className="mt-3 text-xs text-gray-400">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Orders */}
          <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  All Orders
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Monitor and manage orders across the RuchiGo platform.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
                  <Search size={18} className="text-gray-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search orders..."
                    className="w-64 bg-transparent px-3 py-3 text-sm outline-none"
                  />
                </div>

                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-4">
                  <Filter size={18} className="text-orange-500" />

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="bg-transparent px-3 py-3 text-sm font-semibold text-gray-600 outline-none"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="On the way">On the way</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-7 overflow-x-auto">
              <table className="w-full min-w-[1450px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-400">
                    <th className="pb-4 font-medium">Order</th>
                    <th className="pb-4 font-medium">Customer</th>
                    <th className="pb-4 font-medium">Restaurant</th>
                    <th className="pb-4 font-medium">Delivery Partner</th>
                    <th className="pb-4 font-medium">Amount</th>
                    <th className="pb-4 font-medium">Payment</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 transition hover:bg-orange-50/40"
                    >
                      <td className="py-5">
                        <p className="font-bold text-gray-900">
                          {order.id}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                          {order.items}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {order.time}
                        </p>
                      </td>

                      <td className="py-5">
                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                          <User
                            size={17}
                            className="text-orange-500"
                          />
                          {order.customer}
                        </div>

                        <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <MapPin
                            size={14}
                            className="text-orange-500"
                          />
                          {order.location}
                        </p>
                      </td>

                      <td className="py-5">
                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                          <Store
                            size={17}
                            className="text-orange-500"
                          />
                          {order.restaurant}
                        </div>
                      </td>

                      <td className="py-5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Bike
                            size={17}
                            className="text-orange-500"
                          />
                          {order.partner}
                        </div>
                      </td>

                      <td className="py-5">
                        <div className="flex items-center gap-1 font-bold text-gray-900">
                          <IndianRupee size={16} />
                          {order.amount.replace("₹", "")}
                        </div>
                      </td>

                      <td className="py-5">
                        <span className="rounded-full bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600">
                          {order.payment}
                        </span>
                      </td>

                      <td className="py-5">
                        <span
                          className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <button
                            title="View Order"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition hover:bg-orange-500 hover:text-white"
                          >
                            <Eye size={17} />
                          </button>

                          {order.status !== "Delivered" &&
                            order.status !== "Cancelled" && (
                              <button
                                title="Cancel Order"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                              >
                                <XCircle size={17} />
                              </button>
                            )}

                          <button
                            title="More Actions"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition hover:bg-gray-200"
                          >
                            <MoreVertical size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="py-16 text-center">
                <ShoppingBag
                  size={44}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 text-lg font-bold text-gray-700">
                  No orders found
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Try another order ID, customer, restaurant or status.
                </p>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-7 flex flex-col justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
              <p className="text-sm text-gray-500">
                Showing 1 to {filteredOrders.length} of 48,920 orders
              </p>

              <div className="flex items-center gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400">
                  <ChevronLeft size={18} />
                </button>

                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-semibold text-white">
                  1
                </button>

                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 font-semibold text-gray-600">
                  2
                </button>

                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 font-semibold text-gray-600">
                  3
                </button>

                <span className="px-2 text-gray-400">...</span>

                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}