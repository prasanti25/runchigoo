import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  Bike,
  UserCheck,
  Clock3,
  Ban,
  Search,
  Filter,
  Star,
  ShoppingBag,
  IndianRupee,
  Eye,
  Check,
  X,
  MoreVertical,
  Phone,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const partners = [
  {
    id: "DP001",
    name: "Rahul Kumar",
    initials: "RK",
    phone: "+91 98765 48210",
    location: "Guntur",
    vehicle: "Honda Shine",
    vehicleNumber: "AP 07 BK 4821",
    rating: "4.9",
    deliveries: 1240,
    earnings: "₹86,420",
    availability: "Online",
    status: "Verified",
  },
  {
    id: "DP002",
    name: "Sai Teja",
    initials: "ST",
    phone: "+91 98482 14256",
    location: "Guntur",
    vehicle: "TVS Raider",
    vehicleNumber: "AP 07 CL 2841",
    rating: "4.8",
    deliveries: 986,
    earnings: "₹68,840",
    availability: "Online",
    status: "Verified",
  },
  {
    id: "DP003",
    name: "Kiran Reddy",
    initials: "KR",
    phone: "+91 99887 65432",
    location: "Tenali",
    vehicle: "Hero Splendor",
    vehicleNumber: "AP 07 DM 6482",
    rating: "4.6",
    deliveries: 0,
    earnings: "₹0",
    availability: "Offline",
    status: "Pending",
  },
  {
    id: "DP004",
    name: "Harsha Sai",
    initials: "HS",
    phone: "+91 91234 56789",
    location: "Guntur",
    vehicle: "Bajaj Pulsar",
    vehicleNumber: "AP 07 EN 9284",
    rating: "4.7",
    deliveries: 842,
    earnings: "₹58,620",
    availability: "Offline",
    status: "Verified",
  },
  {
    id: "DP005",
    name: "Naveen Kumar",
    initials: "NK",
    phone: "+91 97654 32109",
    location: "Mangalagiri",
    vehicle: "Honda Activa",
    vehicleNumber: "AP 07 FP 1482",
    rating: "3.8",
    deliveries: 428,
    earnings: "₹29,840",
    availability: "Offline",
    status: "Suspended",
  },
  {
    id: "DP006",
    name: "Vamsi Krishna",
    initials: "VK",
    phone: "+91 96543 21098",
    location: "Guntur",
    vehicle: "Yamaha FZ",
    vehicleNumber: "AP 07 GR 8241",
    rating: "4.5",
    deliveries: 0,
    earnings: "₹0",
    availability: "Offline",
    status: "Pending",
  },
];

const stats = [
  {
    title: "Total Partners",
    value: "1,284",
    description: "Registered delivery partners",
    icon: Bike,
    style: "bg-blue-50 text-blue-600",
  },
  {
    title: "Verified Partners",
    value: "1,198",
    description: "Approved for deliveries",
    icon: UserCheck,
    style: "bg-green-50 text-green-600",
  },
  {
    title: "Pending Approval",
    value: "64",
    description: "Documents under review",
    icon: Clock3,
    style: "bg-orange-50 text-orange-500",
  },
  {
    title: "Suspended",
    value: "22",
    description: "Restricted partner accounts",
    icon: Ban,
    style: "bg-red-50 text-red-500",
  },
];

function getStatusStyle(status) {
  if (status === "Verified") {
    return "bg-green-50 text-green-600";
  }

  if (status === "Pending") {
    return "bg-orange-50 text-orange-500";
  }

  return "bg-red-50 text-red-500";
}

export default function AdminDeliveryPartners() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPartners = partners.filter((partner) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      partner.name.toLowerCase().includes(searchValue) ||
      partner.id.toLowerCase().includes(searchValue) ||
      partner.location.toLowerCase().includes(searchValue) ||
      partner.vehicleNumber.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" ||
      partner.status === statusFilter;

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
              Delivery Administration
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Delivery Partners
            </h1>
          </div>

          <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
            <Bike size={19} />
            Add Partner
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

          {/* Partners Table */}
          <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  All Delivery Partners
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Review, verify and manage RuchiGo delivery partners.
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
                    placeholder="Search partners..."
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
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-7 overflow-x-auto">
              <table className="w-full min-w-[1400px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-400">
                    <th className="pb-4 font-medium">
                      Partner
                    </th>

                    <th className="pb-4 font-medium">
                      Vehicle
                    </th>

                    <th className="pb-4 font-medium">
                      Rating
                    </th>

                    <th className="pb-4 font-medium">
                      Deliveries
                    </th>

                    <th className="pb-4 font-medium">
                      Earnings
                    </th>

                    <th className="pb-4 font-medium">
                      Availability
                    </th>

                    <th className="pb-4 font-medium">
                      Verification
                    </th>

                    <th className="pb-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPartners.map((partner) => (
                    <tr
                      key={partner.id}
                      className="border-b border-gray-50 transition hover:bg-orange-50/40"
                    >
                      {/* Partner */}
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-500">
                            {partner.initials}
                          </div>

                          <div>
                            <p className="font-bold text-gray-900">
                              {partner.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {partner.id}
                            </p>

                            <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <Phone
                                size={14}
                                className="text-orange-500"
                              />
                              {partner.phone}
                            </p>

                            <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                              <MapPin
                                size={14}
                                className="text-orange-500"
                              />
                              {partner.location}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-5">
                        <div className="flex items-start gap-3">
                          <Bike
                            size={19}
                            className="mt-1 text-orange-500"
                          />

                          <div>
                            <p className="font-semibold text-gray-700">
                              {partner.vehicle}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {partner.vehicleNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <Star
                            size={18}
                            className="fill-yellow-400 text-yellow-400"
                          />

                          <span className="font-bold text-gray-900">
                            {partner.rating}
                          </span>
                        </div>
                      </td>

                      {/* Deliveries */}
                      <td className="py-5">
                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                          <ShoppingBag
                            size={17}
                            className="text-orange-500"
                          />

                          {partner.deliveries.toLocaleString()}
                        </div>
                      </td>

                      {/* Earnings */}
                      <td className="py-5">
                        <div className="flex items-center gap-1 font-bold text-green-600">
                          <IndianRupee size={16} />
                          {partner.earnings.replace("₹", "")}
                        </div>
                      </td>

                      {/* Availability */}
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-3 w-3 rounded-full ${
                              partner.availability === "Online"
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />

                          <span
                            className={`text-sm font-semibold ${
                              partner.availability === "Online"
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {partner.availability}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${getStatusStyle(
                            partner.status
                          )}`}
                        >
                          {partner.status === "Verified" && (
                            <ShieldCheck size={15} />
                          )}

                          {partner.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <button
                            title="View Partner"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition hover:bg-orange-500 hover:text-white"
                          >
                            <Eye size={17} />
                          </button>

                          {partner.status === "Pending" && (
                            <>
                              <button
                                title="Approve Partner"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 transition hover:bg-green-500 hover:text-white"
                              >
                                <Check size={17} />
                              </button>

                              <button
                                title="Reject Partner"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                              >
                                <X size={17} />
                              </button>
                            </>
                          )}

                          {partner.status === "Verified" && (
                            <button
                              title="Suspend Partner"
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
            {filteredPartners.length === 0 && (
              <div className="py-16 text-center">
                <Bike
                  size={44}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 text-lg font-bold text-gray-700">
                  No delivery partners found
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Try another name, partner ID, location or status.
                </p>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-7 flex flex-col justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
              <p className="text-sm text-gray-500">
                Showing 1 to {filteredPartners.length} of 1,284 partners
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