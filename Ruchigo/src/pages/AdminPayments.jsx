import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  CreditCard,
  IndianRupee,
  CircleCheckBig,
  CircleX,
  Search,
  Filter,
  Eye,
  RotateCcw,
  MoreVertical,
  User,
  Store,
  CalendarDays,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const payments = [
  {
    id: "PAY1302",
    orderId: "#RG1302",
    customer: "Pavan K",
    restaurant: "Paradise Biryani",
    amount: "₹433",
    method: "UPI",
    transactionId: "TXN88421029",
    date: "15 Jul 2026, 7:31 PM",
    status: "Successful",
  },
  {
    id: "PAY1301",
    orderId: "#RG1301",
    customer: "Sai Nadh",
    restaurant: "Pizza Hub",
    amount: "₹648",
    method: "Card",
    transactionId: "TXN88421018",
    date: "15 Jul 2026, 7:13 PM",
    status: "Successful",
  },
  {
    id: "PAY1300",
    orderId: "#RG1300",
    customer: "Suhitha",
    restaurant: "Burger House",
    amount: "₹348",
    method: "UPI",
    transactionId: "TXN88420984",
    date: "15 Jul 2026, 6:49 PM",
    status: "Successful",
  },
  {
    id: "PAY1299",
    orderId: "#RG1299",
    customer: "Kiran Kumar",
    restaurant: "Spice Kitchen",
    amount: "₹599",
    method: "COD",
    transactionId: "COD-RG1299",
    date: "15 Jul 2026, 6:25 PM",
    status: "Pending",
  },
  {
    id: "PAY1298",
    orderId: "#RG1298",
    customer: "Harsha",
    restaurant: "Food Palace",
    amount: "₹896",
    method: "Card",
    transactionId: "TXN88420876",
    date: "15 Jul 2026, 5:57 PM",
    status: "Successful",
  },
  {
    id: "PAY1297",
    orderId: "#RG1297",
    customer: "Meghana",
    restaurant: "Royal Tiffins",
    amount: "₹280",
    method: "UPI",
    transactionId: "TXN88420742",
    date: "15 Jul 2026, 5:29 PM",
    status: "Refunded",
  },
  {
    id: "PAY1296",
    orderId: "#RG1296",
    customer: "Vamsi Krishna",
    restaurant: "Pizza Hub",
    amount: "₹520",
    method: "UPI",
    transactionId: "TXN88420618",
    date: "15 Jul 2026, 4:48 PM",
    status: "Failed",
  },
];

const stats = [
  {
    title: "Total Revenue",
    value: "₹18.4L",
    description: "Platform revenue this month",
    icon: IndianRupee,
    style: "bg-green-50 text-green-600",
  },
  {
    title: "Successful Payments",
    value: "46,842",
    description: "95.7% success rate",
    icon: CircleCheckBig,
    style: "bg-blue-50 text-blue-600",
  },
  {
    title: "Pending Payments",
    value: "284",
    description: "Awaiting confirmation",
    icon: CreditCard,
    style: "bg-orange-50 text-orange-500",
  },
  {
    title: "Failed Payments",
    value: "148",
    description: "0.3% failure rate",
    icon: CircleX,
    style: "bg-red-50 text-red-500",
  },
];

function getStatusStyle(status) {
  if (status === "Successful") {
    return "bg-green-50 text-green-600";
  }

  if (status === "Pending") {
    return "bg-orange-50 text-orange-500";
  }

  if (status === "Refunded") {
    return "bg-blue-50 text-blue-600";
  }

  return "bg-red-50 text-red-500";
}

function getMethodStyle(method) {
  if (method === "UPI") {
    return "bg-purple-50 text-purple-600";
  }

  if (method === "Card") {
    return "bg-blue-50 text-blue-600";
  }

  return "bg-gray-100 text-gray-600";
}

export default function AdminPayments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPayments = payments.filter((payment) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      payment.id.toLowerCase().includes(searchValue) ||
      payment.orderId.toLowerCase().includes(searchValue) ||
      payment.customer.toLowerCase().includes(searchValue) ||
      payment.restaurant.toLowerCase().includes(searchValue) ||
      payment.transactionId.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" ||
      payment.status === statusFilter;

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
              Financial Administration
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Payments Management
            </h1>
          </div>

          <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
            <Download size={19} />
            Export Transactions
          </button>
        </header>

        <section className="p-8">
          {/* Statistics */}
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

          {/* Transactions */}
          <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Payment Transactions
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Monitor customer payments and platform transactions.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Search */}
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
                  <Search
                    size={18}
                    className="text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search transactions..."
                    className="w-64 bg-transparent px-3 py-3 text-sm outline-none"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-4">
                  <Filter
                    size={18}
                    className="text-orange-500"
                  />

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="bg-transparent px-3 py-3 text-sm font-semibold text-gray-600 outline-none"
                  >
                    <option value="All">All Status</option>
                    <option value="Successful">
                      Successful
                    </option>
                    <option value="Pending">
                      Pending
                    </option>
                    <option value="Refunded">
                      Refunded
                    </option>
                    <option value="Failed">
                      Failed
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="mt-7 overflow-x-auto">
              <table className="w-full min-w-[1450px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-400">
                    <th className="pb-4 font-medium">
                      Payment
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
                      Method
                    </th>

                    <th className="pb-4 font-medium">
                      Transaction ID
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
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-50 transition hover:bg-orange-50/40"
                    >
                      {/* Payment */}
                      <td className="py-5">
                        <p className="font-bold text-gray-900">
                          {payment.id}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-orange-500">
                          {payment.orderId}
                        </p>

                        <p className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                          <CalendarDays size={14} />
                          {payment.date}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="py-5">
                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                          <User
                            size={17}
                            className="text-orange-500"
                          />

                          {payment.customer}
                        </div>
                      </td>

                      {/* Restaurant */}
                      <td className="py-5">
                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                          <Store
                            size={17}
                            className="text-orange-500"
                          />

                          {payment.restaurant}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-5">
                        <div className="flex items-center gap-1 font-bold text-gray-900">
                          <IndianRupee size={16} />

                          {payment.amount.replace("₹", "")}
                        </div>
                      </td>

                      {/* Method */}
                      <td className="py-5">
                        <span
                          className={`rounded-full px-4 py-2 text-xs font-semibold ${getMethodStyle(
                            payment.method
                          )}`}
                        >
                          {payment.method}
                        </span>
                      </td>

                      {/* Transaction */}
                      <td className="py-5">
                        <p className="font-mono text-sm text-gray-600">
                          {payment.transactionId}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-5">
                        <span
                          className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusStyle(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <button
                            title="View Transaction"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition hover:bg-orange-500 hover:text-white"
                          >
                            <Eye size={17} />
                          </button>

                          {payment.status === "Failed" && (
                            <button
                              title="Retry Payment"
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-500 hover:text-white"
                            >
                              <RotateCcw size={17} />
                            </button>
                          )}

                          {payment.status === "Successful" && (
                            <button
                              title="Refund Payment"
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                            >
                              <RotateCcw size={17} />
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
            {filteredPayments.length === 0 && (
              <div className="py-16 text-center">
                <CreditCard
                  size={44}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 text-lg font-bold text-gray-700">
                  No transactions found
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Try another payment ID, order ID or status.
                </p>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-7 flex flex-col justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
              <p className="text-sm text-gray-500">
                Showing 1 to {filteredPayments.length} of 47,274
                transactions
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

                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-orange-300 hover:text-orange-500">
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