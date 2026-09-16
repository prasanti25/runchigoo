import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import DeliverySidebar from "../components/DeliverySidebar.jsx";
import {
  ShoppingBag,
  MapPin,
  Navigation,
  Clock,
  IndianRupee,
  Check,
  Bike,
  PackageCheck,
  Eye,
  Bell,
} from "lucide-react";

const tabs = [
  "All Orders",
  "Available",
  "Active",
  "Completed",
];

const tabPaths = {
  "All Orders": "/orders/",
  Available: "/orders/available/",
  Active: "/orders/?status=out_for_delivery",
  Completed: "/orders/?status=delivered",
};

function getStatusStyle(status) {
  if (status === "Available") {
    return "bg-blue-50 text-blue-600";
  }

  if (status === "Active") {
    return "bg-orange-50 text-orange-500";
  }

  if (status === "Completed") {
    return "bg-green-50 text-green-600";
  }

  return "bg-gray-50 text-gray-500";
}

function normalizeOrder(order) {
  const status = order.status === "out_for_delivery" ? "Active" : order.status === "ready" ? "Available" : order.status === "delivered" ? "Completed" : order.status === "cancelled" ? "Cancelled" : order.status;
  return {
    id: `#RG${String(order.number).slice(0, 8).toUpperCase()}`,
    orderId: order.id,
    restaurant: order.restaurant_detail?.name || "Restaurant",
    restaurantAddress: order.restaurant_detail?.address || order.restaurant_detail?.city || "",
    customer: `${order.customer_detail?.first_name || ""} ${order.customer_detail?.last_name || ""}`.trim() || order.customer_detail?.email || "Customer",
    customerAddress: order.delivery_address_detail?.line1 || "",
    distance: order.delivery?.distance || "—",
    time: order.delivery?.pickup_at ? "Assigned" : "—",
    earning: `₹${order.delivery_fee || 0}`,
    status,
    items: `${order.items?.length || 0} Items`,
    raw: order,
  };
}

export default function DeliveryOrders() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({ available: 0, active: 0, completed: 0 });
  const [activeTab, setActiveTab] = useState("Available");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || "D";

  const fetchOrders = useCallback(async (tab) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const path = tabPaths[tab] || "/orders/";
      const data = await apiRequest(path, { token });
      const results = data.results || data;
      const normalized = results.map(normalizeOrder);
      setOrders(normalized);
    } catch (err) {
      setError(err.message || "Unable to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchCounts = useCallback(async () => {
    if (!token) return;
    try {
      const [availableResponse, activeResponse, completedResponse] = await Promise.all([
        apiRequest("/orders/available/", { token }),
        apiRequest("/orders/?status=out_for_delivery", { token }),
        apiRequest("/orders/?status=delivered", { token }),
      ]);

      setCounts({
        available: (availableResponse.results || availableResponse).length,
        active: (activeResponse.results || activeResponse).length,
        completed: (completedResponse.results || completedResponse).length,
      });
    } catch {
      setCounts({ available: 0, active: 0, completed: 0 });
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    let mounted = true;
    const loadOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        await fetchOrders(activeTab);
        if (!mounted) return;
        await fetchCounts();
      } catch (err) {
        if (mounted) setError(err.message || "Unable to load orders.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      mounted = false;
    };
  }, [fetchOrders, fetchCounts, activeTab, token]);

  const handleAccept = async (orderId) => {
    if (!token) return;
    setLoading(true);
    try {
      await apiRequest(`/orders/${orderId}/accept/`, { method: "POST", token });
      setActiveTab("Active");
      await fetchOrders("Active");
      await fetchCounts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    if (!token) return;
    setLoading(true);
    try {
      await apiRequest(`/orders/${orderId}/status/`, { method: "POST", token, body: { status: "delivered" } });
      setActiveTab("Completed");
      await fetchOrders("Completed");
      await fetchCounts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueNavigation = (orderId) => {
    navigate(`/delivery-navigation?orderId=${orderId}`);
  };

  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <DeliverySidebar />

      <main className="min-h-screen lg:ml-72">
        {/* Header */}
        <header className="flex flex-col items-start gap-4 border-b border-orange-100 bg-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm text-gray-500">
              Delivery Management
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Delivery Orders
            </h1>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-green-50 px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-green-500" />

              <span className="font-semibold text-green-600">
                {user?.is_available ? "Online" : "Offline"}
              </span>
            </div>

            <Link to="/notifications" aria-label="Open notifications" className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Bell size={20} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Link>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
              {initials}
            </div>
          </div>
        </header>

        <section className="p-4 sm:p-8">
          {/* Stats */}
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShoppingBag size={23} />
              </div>

              <p className="mt-5 text-sm text-gray-500">
                Available Orders
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {counts.available}
              </h2>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Bike size={23} />
              </div>

              <p className="mt-5 text-sm text-gray-500">
                Active Delivery
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {counts.active}
              </h2>
            </div>

            <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <PackageCheck size={23} />
              </div>

              <p className="mt-5 text-sm text-gray-500">
                Completed Deliveries
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {counts.completed}
              </h2>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-6 py-3 font-semibold transition ${
                  activeTab === tab
                    ? "bg-orange-500 text-white"
                    : "border border-orange-100 bg-white text-gray-600 hover:text-orange-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Orders */}
          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            {loading ? (
              <div className="col-span-full rounded-3xl border border-orange-100 bg-white p-6 text-center text-gray-500 shadow-sm">
                Loading orders…
              </div>
            ) : error ? (
              <div className="col-span-full rounded-3xl border border-orange-100 bg-white p-6 text-center text-red-500 shadow-sm">
                {error}
              </div>
            ) : orders.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center shadow-sm">
                <p className="text-xl font-semibold text-gray-900">No orders found</p>
                <p className="mt-2 text-gray-500">Try a different tab or refresh the page.</p>
              </div>
            ) : orders.map((order) => {
              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                {/* Order Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900">
                        {order.id}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {order.items}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs text-gray-500">
                      Delivery Earnings
                    </p>

                    <p className="mt-1 text-2xl font-bold text-green-600">
                      {order.earning}
                    </p>
                  </div>
                </div>

                {/* Route */}
                <div className="mt-6 rounded-2xl bg-[#fffaf7] p-5">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
                        <ShoppingBag size={18} />
                      </div>

                      <div className="h-16 w-[2px] bg-orange-200" />

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                        <MapPin size={18} />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div>
                        <p className="text-xs text-gray-400">
                          PICKUP FROM
                        </p>

                        <h3 className="mt-1 font-bold text-gray-900">
                          {order.restaurant}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {order.restaurantAddress}
                        </p>
                      </div>

                      <div className="mt-10">
                        <p className="text-xs text-gray-400">
                          DELIVER TO
                        </p>

                        <h3 className="mt-1 font-bold text-gray-900">
                          {order.customer}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {order.customerAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-orange-50 p-4 text-center">
                    <Navigation
                      size={18}
                      className="mx-auto text-orange-500"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      Distance
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      {order.distance}
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-4 text-center">
                    <Clock
                      size={18}
                      className="mx-auto text-orange-500"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      Time
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      {order.time}
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-4 text-center">
                    <IndianRupee
                      size={18}
                      className="mx-auto text-green-600"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      Earnings
                    </p>

                    <p className="mt-1 font-bold text-green-600">
                      {order.earning}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                  {order.status === "Available" && (
                    <>
                      <button
                        onClick={() => handleAccept(order.orderId)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                      >
                        <Check size={18} />
                        Accept Delivery
                      </button>

                    </>
                  )}

                  {order.status === "Active" && (
                    <>
                      <button
                        onClick={() => handleContinueNavigation(order.orderId)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                      >
                        <Navigation size={18} />
                        Continue Navigation
                      </button>
                      <button
                        onClick={() => handleMarkDelivered(order.orderId)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-50 px-5 py-3 font-semibold text-green-600 transition hover:bg-green-100"
                      >
                        <PackageCheck size={18} />
                        Mark Delivered
                      </button>
                    </>
                  )}

                  {order.status === "Completed" && (
                    <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-50 px-5 py-3 font-semibold text-green-600">
                      <PackageCheck size={18} />
                      Delivery Completed
                    </div>
                  )}

                  <button onClick={() => handleContinueNavigation(order.orderId)} aria-label={`View ${order.id}`} className="flex h-12 w-full items-center justify-center rounded-xl border border-orange-100 bg-white text-orange-500 transition hover:bg-orange-50 sm:w-12">
                    <Eye size={19} />
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </section>
      </main>
    </div>
  );
}
