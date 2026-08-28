import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  Store,
  StoreIcon,
  Clock3,
  Ban,
  Search,
  Filter,
  Star,
  ShoppingBag,
  Percent,
  Eye,
  Check,
  X,
  MoreVertical,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const restaurants = [
  {
    id: "RES001",
    name: "Paradise Biryani",
    initials: "PB",
    owner: "Ramesh Kumar",
    email: "paradise@ruchigo.in",
    location: "Brodipet, Guntur",
    cuisine: "Biryani • Indian",
    rating: "4.8",
    orders: 4280,
    commission: "18%",
    status: "Active",
  },
  {
    id: "RES002",
    name: "Pizza Hub",
    initials: "PH",
    owner: "Suresh Reddy",
    email: "pizzahub@ruchigo.in",
    location: "Arundelpet, Guntur",
    cuisine: "Pizza • Italian",
    rating: "4.6",
    orders: 3184,
    commission: "20%",
    status: "Active",
  },
  {
    id: "RES003",
    name: "Burger House",
    initials: "BH",
    owner: "Rahul Varma",
    email: "burgerhouse@ruchigo.in",
    location: "Lakshmipuram, Guntur",
    cuisine: "Burgers • Fast Food",
    rating: "4.5",
    orders: 2840,
    commission: "18%",
    status: "Pending",
  },
  {
    id: "RES004",
    name: "Spice Kitchen",
    initials: "SK",
    owner: "Kiran Rao",
    email: "spicekitchen@ruchigo.in",
    location: "Pattabhipuram, Guntur",
    cuisine: "South Indian • Meals",
    rating: "4.7",
    orders: 3942,
    commission: "19%",
    status: "Active",
  },
  {
    id: "RES005",
    name: "Food Palace",
    initials: "FP",
    owner: "Harsha Sai",
    email: "foodpalace@ruchigo.in",
    location: "Gorantla, Guntur",
    cuisine: "Multi Cuisine",
    rating: "4.2",
    orders: 1628,
    commission: "17%",
    status: "Suspended",
  },
  {
    id: "RES006",
    name: "Royal Tiffins",
    initials: "RT",
    owner: "Meghana Devi",
    email: "royaltiffins@ruchigo.in",
    location: "Nallapadu, Guntur",
    cuisine: "Breakfast • South Indian",
    rating: "4.4",
    orders: 2186,
    commission: "18%",
    status: "Pending",
  },
];

const stats = [
  {
    title: "Total Restaurants",
    value: "842",
    description: "Registered restaurants",
    icon: Store,
    style: "bg-blue-50 text-blue-600",
  },
  {
    title: "Active Restaurants",
    value: "796",
    description: "Currently accepting orders",
    icon: StoreIcon,
    style: "bg-green-50 text-green-600",
  },
  {
    title: "Pending Approval",
    value: "28",
    description: "Waiting for verification",
    icon: Clock3,
    style: "bg-orange-50 text-orange-500",
  },
  {
    title: "Suspended",
    value: "18",
    description: "Temporarily restricted",
    icon: Ban,
    style: "bg-red-50 text-red-500",
  },
];

function getStatusStyle(status) {
  if (status === "Active") {
    return "bg-green-50 text-green-600";
  }

  if (status === "Pending") {
    return "bg-orange-50 text-orange-500";
  }

  return "bg-red-50 text-red-500";
}

export default function AdminRestaurants() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchValue) ||
      restaurant.owner.toLowerCase().includes(searchValue) ||
      restaurant.id.toLowerCase().includes(searchValue) ||
      restaurant.location.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" ||
      restaurant.status === statusFilter;

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
              Restaurant Administration
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Restaurants Management
            </h1>
          </div>

          <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
            <Store size={19} />
            Add Restaurant
          </button>
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

          {/* Restaurants Table */}
          <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  All Restaurants
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Review and manage restaurants registered on RuchiGo.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Search */}
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
                  <Search size={18} className="text-gray-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search restaurants..."
                    className="w-64 bg-transparent px-3 py-3 text-sm outline-none"
                  />
                </div>

                {/* Filter */}
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
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-7 overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-400">
                    <th className="pb-4 font-medium">
                      Restaurant
                    </th>

                    <th className="pb-4 font-medium">
                      Owner
                    </th>

                    <th className="pb-4 font-medium">
                      Rating
                    </th>

                    <th className="pb-4 font-medium">
                      Orders
                    </th>

                    <th className="pb-4 font-medium">
                      Commission
                    </th>

                    <th className="pb-4 font-medium">
                      Status
                    </th>

                    <th className="pb-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRestaurants.map((restaurant) => (
                    <tr
                      key={restaurant.id}
                      className="border-b border-gray-50 transition hover:bg-orange-50/40"
                    >
                      {/* Restaurant */}
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 font-bold text-orange-500">
                            {restaurant.initials}
                          </div>

                          <div>
                            <p className="font-bold text-gray-900">
                              {restaurant.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {restaurant.id}
                            </p>

                            <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                              <MapPin
                                size={14}
                                className="text-orange-500"
                              />
                              {restaurant.location}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {restaurant.cuisine}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-5">
                        <p className="font-semibold text-gray-700">
                          {restaurant.owner}
                        </p>

                        <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                          <Mail
                            size={15}
                            className="text-orange-500"
                          />
                          {restaurant.email}
                        </p>
                      </td>

                      {/* Rating */}
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <Star
                            size={18}
                            className="fill-yellow-400 text-yellow-400"
                          />

                          <span className="font-bold text-gray-900">
                            {restaurant.rating}
                          </span>
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="py-5">
                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                          <ShoppingBag
                            size={17}
                            className="text-orange-500"
                          />

                          {restaurant.orders.toLocaleString()}
                        </div>
                      </td>

                      {/* Commission */}
                      <td className="py-5">
                        <div className="flex items-center gap-2 font-bold text-gray-900">
                          <Percent
                            size={17}
                            className="text-orange-500"
                          />

                          {restaurant.commission}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-5">
                        <span
                          className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusStyle(
                            restaurant.status
                          )}`}
                        >
                          {restaurant.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <button
                            title="View Restaurant"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition hover:bg-orange-500 hover:text-white"
                          >
                            <Eye size={17} />
                          </button>

                          {restaurant.status === "Pending" && (
                            <>
                              <button
                                title="Approve Restaurant"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 transition hover:bg-green-500 hover:text-white"
                              >
                                <Check size={17} />
                              </button>

                              <button
                                title="Reject Restaurant"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                              >
                                <X size={17} />
                              </button>
                            </>
                          )}

                          {restaurant.status === "Active" && (
                            <button
                              title="Suspend Restaurant"
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                            >
                              <Ban size={17} />
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

            {/* No Results */}
            {filteredRestaurants.length === 0 && (
              <div className="py-16 text-center">
                <Store
                  size={44}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 text-lg font-bold text-gray-700">
                  No restaurants found
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Try another restaurant name or status filter.
                </p>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-7 flex flex-col justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
              <p className="text-sm text-gray-500">
                Showing 1 to {filteredRestaurants.length} of 842
                restaurants
              </p>

              <div className="flex items-center gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400">
                  <ChevronLeft size={18} />
                </button>

                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-semibold text-white">
                  1
                </button>

                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500">
                  2
                </button>

                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500">
                  3
                </button>

                <span className="px-2 text-gray-400">
                  ...
                </span>

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