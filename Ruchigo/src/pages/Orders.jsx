import Navbar from "../components/Navbar.jsx";
import {
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  Bike,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";

const tabs = ["Active", "Completed", "Cancelled"];

const statusLabels = {
  pending: "Order placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for pickup",
  out_for_delivery: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function Orders() {

  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] =
    useState("Active");

  useEffect(() => {
    if (!token) return;
    apiRequest("/orders/", { token }).then((data) => {
      const results = data.results || data;
      setOrders(results.map((order) => ({
        id: `#RG${String(order.number).slice(0, 8).toUpperCase()}`,
        trackingId: order.id,
        restaurant: order.restaurant_detail?.name || "Restaurant",
        items: (order.items || []).map((item) => item.name),
        total: Number(order.total),
        rawStatus: order.status,
        status: statusLabels[order.status] || order.status,
        payment: order.payment?.status === "paid" ? "Paid" : "Cash on delivery",
        date: new Date(order.created_at).toLocaleDateString(),
        icon: "🍽️",
      })));
    }).catch((requestError) => {
      setOrders([]);
      setError(requestError.message);
    }).finally(() => setLoading(false));
  }, [token]);

  const filteredOrders = orders.filter((order) => {

    if (activeTab === "Active")
      return !["delivered", "cancelled"].includes(order.rawStatus);

    if (activeTab === "Completed")
      return order.status === "Delivered";

    return order.status === "Cancelled";

  });

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-8">

            <p className="font-semibold text-orange-500">
              My Orders
            </p>

            <h1 className="mt-2 text-4xl font-bold text-gray-900">
              Orders
            </h1>

            <p className="mt-3 text-gray-500">
              Track, reorder and manage all your food orders.
            </p>

          </div>

          {/* Statistics */}

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">

              <PackageCheck
                className="text-orange-500"
                size={30}
              />

              <h2 className="mt-4 text-3xl font-bold">
                {orders.length}
              </h2>

              <p className="mt-2 text-gray-500">
                Total Orders
              </p>

            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">

              <CheckCircle2
                className="text-green-500"
                size={30}
              />

              <h2 className="mt-4 text-3xl font-bold">
                {
                  orders.filter(
                    (o) => o.status === "Delivered"
                  ).length
                }
              </h2>

              <p className="mt-2 text-gray-500">
                Delivered
              </p>

            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">

              <XCircle
                className="text-red-500"
                size={30}
              />

              <h2 className="mt-4 text-3xl font-bold">
                {
                  orders.filter(
                    (o) => o.status === "Cancelled"
                  ).length
                }
              </h2>

              <p className="mt-2 text-gray-500">
                Cancelled
              </p>

            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">

              <Wallet
                className="text-blue-500"
                size={30}
              />

              <h2 className="mt-4 text-3xl font-bold">

                ₹
                {orders.reduce(
                  (sum, order) => sum + order.total,
                  0
                )}

              </h2>

              <p className="mt-2 text-gray-500">
                Money Spent
              </p>

            </div>

          </div>

          {/* Tabs */}

          <div className="mt-10 flex flex-wrap gap-4">

            {tabs.map((tab) => (

              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-6 py-3 font-semibold transition ${
                  activeTab === tab
                    ? "bg-orange-500 text-white"
                    : "bg-white border border-orange-200 text-orange-500 hover:bg-orange-50"
                }`}
              >
                {tab}
              </button>

            ))}

          </div>

          {/* Orders */}

          <div className="mt-8 space-y-6">
            {loading ? (
              <div className="rounded-3xl border border-orange-100 bg-white py-20 text-center shadow-sm">Loading orders…</div>
            ) : error ? (
              <div className="rounded-3xl border border-red-100 bg-white py-20 text-center text-red-600 shadow-sm">{error}</div>
            ) : filteredOrders.length === 0 ? (

              <div className="rounded-3xl border border-dashed border-orange-200 bg-white py-20 text-center shadow-sm">

                <PackageCheck
                  size={60}
                  className="mx-auto text-orange-300"
                />

                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  No Orders Found
                </h2>

                <p className="mt-3 text-gray-500">
                  There are no {activeTab.toLowerCase()} orders yet.
                </p>

                <Link
                  to="/"
                  className="mt-8 inline-block rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white transition hover:bg-orange-600"
                >
                  Order Food
                </Link>

              </div>

            ) : (

              filteredOrders.map((order) => (

                <div
                  key={order.id}
                  className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition hover:shadow-lg"
                >

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center">

                    {/* Restaurant */}

                    <div className="flex items-center gap-5 flex-1">

                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 text-4xl">

                        {order.icon}

                      </div>

                      <div>

                        <h2 className="text-2xl font-bold text-gray-900">
                          {order.restaurant}
                        </h2>

                        <p className="mt-2 text-gray-500">
                          {order.items.join(", ")}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-5 text-sm text-gray-500">

                          <span className="flex items-center gap-2">

                            <PackageCheck size={16} />

                            {order.id}

                          </span>

                          <span className="flex items-center gap-2">

                            <Clock size={16} />

                            {order.date}

                          </span>

                        </div>

                      </div>

                    </div>

                    {/* Status */}

                    <div className="text-center">

                      <span
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-600"
                            : order.status === "Cancelled"
                            ? "bg-red-100 text-red-600"
                            : "bg-orange-100 text-orange-500"
                        }`}
                      >
                        {order.status}
                      </span>

                      <p className="mt-4 text-gray-500">
                        {order.payment}
                      </p>

                    </div>

                    {/* Price */}

                    <div className="text-center">

                      <p className="text-3xl font-bold text-gray-900">

                        ₹{order.total}

                      </p>

                    </div>

                  </div>

                  {/* Timeline */}

                  <div className="mt-8 rounded-2xl bg-orange-50 p-5">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">

                          <CheckCircle2 size={18} />

                        </div>

                        <span className="font-semibold">
                          Order Placed
                        </span>

                      </div>

                      <div className="hidden h-[2px] flex-1 bg-orange-200 md:block"></div>

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">

                          <CheckCircle2 size={18} />

                        </div>

                        <span className="font-semibold">
                          Preparing
                        </span>

                      </div>

                      <div className="hidden h-[2px] flex-1 bg-orange-200 md:block"></div>

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            order.status === "Cancelled"
                              ? "bg-red-500 text-white"
                              : order.status === "Delivered"
                              ? "bg-green-500 text-white"
                              : "bg-orange-500 text-white"
                          }`}
                        >

                          {order.status === "Cancelled" ? (
                            <XCircle size={18} />
                          ) : order.status === "Delivered" ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <Bike size={18} />
                          )}

                        </div>

                        <span className="font-semibold">
                          {order.status}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* Buttons */}

                  <div className="mt-8 flex flex-wrap gap-4">

                    {!['delivered', 'cancelled'].includes(order.rawStatus) && (

                      <Link
                        to={`/tracking/${order.trackingId}`}
                        className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
                      >
                        Track order
                      </Link>

                    )}

                    <Link to={`/tracking/${order.trackingId}`} className="rounded-xl border border-orange-300 px-6 py-3 font-semibold text-orange-500 transition hover:bg-orange-500 hover:text-white">
                      View details
                    </Link>

                  </div>

                </div>

              ))

            )}
                      </div>

        </section>

      </main>

    </>

  );

}
