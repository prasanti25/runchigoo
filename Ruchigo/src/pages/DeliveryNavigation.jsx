import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DeliverySidebar from "../components/DeliverySidebar.jsx";
import {
  Navigation,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ShoppingBag,
  Bike,
  LocateFixed,
  CornerUpRight,
  CheckCircle2,
  Bell,
} from "lucide-react";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function DeliveryNavigation() {
  const { token, user } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const customerName = order?.customer_detail
    ? `${order.customer_detail.first_name || ""} ${order.customer_detail.last_name || ""}`.trim() || order.customer_detail.email
    : "Customer";
  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || "D";
  const deliveryAddress = order?.delivery_address_detail
    ? [order.delivery_address_detail.line1, order.delivery_address_detail.line2, order.delivery_address_detail.city, order.delivery_address_detail.state, order.delivery_address_detail.postal_code].filter(Boolean).join(", ")
    : "Delivery address unavailable";
  const routeSteps = [
    { id: 1, instruction: `Pick up from ${order?.restaurant_detail?.name || "the restaurant"}`, distance: order?.restaurant_detail?.address || order?.restaurant_detail?.city || "Pickup location", icon: ShoppingBag },
    { id: 2, instruction: `Deliver to ${customerName}`, distance: deliveryAddress, icon: MapPin },
  ];

  const getStatusLabel = (status) => {
    if (status === "out_for_delivery") return "Out for delivery";
    if (status === "ready") return "Ready for pickup";
    if (status === "delivered") return "Delivered";
    if (status === "confirmed") return "Confirmed";
    if (status === "preparing") return "Preparing";
    if (status === "cancelled") return "Cancelled";
    return status?.replace(/_/g, " ") || "Unknown";
  };

  const getStatusClass = (status) => {
    if (status === "out_for_delivery") return "bg-orange-50 text-orange-600";
    if (status === "ready") return "bg-blue-50 text-blue-600";
    if (status === "delivered") return "bg-green-50 text-green-600";
    if (status === "cancelled") return "bg-red-50 text-red-600";
    return "bg-gray-50 text-gray-600";
  };

  const buildNavigationLink = () => {
    const address = order?.delivery_address_detail;
    if (!address) return null;
    const destination = [address.line1, address.city, address.state, address.postal_code]
      .filter(Boolean)
      .join(", ");
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  };

  const handleOpenMaps = () => {
    const url = buildNavigationLink();
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const loadOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        const path = orderId ? `/orders/${orderId}/` : "/orders/?status=out_for_delivery";
        const data = await apiRequest(path, { token });
        const result = orderId ? data : (data.results || data)[0] || null;
        if (!result) {
          if (!isMounted) return;
          setError("No active delivery order found.");
          setOrder(null);
          return;
        }
        if (!isMounted) return;
        setOrder(result);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Unable to load delivery order.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [token, orderId]);

  const handleMarkDelivered = async () => {
    if (!token || !order) return;
    setUpdatingStatus(true);
    try {
      await apiRequest(`/orders/${order.id}/status/`, { method: "POST", token, body: { status: "delivered" } });
      setOrder({ ...order, status: "delivered" });
    } catch (err) {
      setError(err.message || "Unable to update delivery status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf7]">
        <DeliverySidebar />
        <main className="ml-72 min-h-screen p-10">
          <p>Loading delivery navigation…</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fffaf7]">
        <DeliverySidebar />
        <main className="ml-72 min-h-screen p-10">
          <p className="text-red-500">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <DeliverySidebar />

      <main className="ml-72 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-orange-100 bg-white px-8 py-5">
          <div>
            <p className="text-sm text-gray-500">
              Active Delivery
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Delivery Navigation
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-orange-50 px-5 py-3">
              <p className="text-xs text-gray-500">
                Order ID
              </p>

              <p className="font-bold text-orange-500">
                {order?.number ? `#RG${String(order.number).slice(0, 8).toUpperCase()}` : "—"}
              </p>
            </div>

            <div className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusClass(order?.status)}`}>
              {getStatusLabel(order?.status)}
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

        <section className="p-8">
          <div className="grid gap-7 xl:grid-cols-[1.7fr_1fr]">
            {/* Map Section */}
            <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
              <div className="relative min-h-[650px] overflow-hidden bg-[#f2eee8]">
                {/* Fake Map Roads */}
                <div className="absolute left-[10%] top-0 h-full w-24 rotate-12 bg-white/70" />

                <div className="absolute left-0 top-[25%] h-20 w-full -rotate-6 bg-white/70" />

                <div className="absolute right-[20%] top-0 h-full w-20 -rotate-12 bg-white/70" />

                <div className="absolute left-0 top-[65%] h-16 w-full rotate-3 bg-white/70" />

                {/* Map Blocks */}
                <div className="absolute left-[8%] top-[8%] h-24 w-36 rounded-2xl bg-green-100" />

                <div className="absolute right-[8%] top-[10%] h-32 w-40 rounded-2xl bg-orange-100" />

                <div className="absolute bottom-[10%] left-[12%] h-32 w-44 rounded-2xl bg-blue-100" />

                <div className="absolute bottom-[12%] right-[10%] h-28 w-36 rounded-2xl bg-green-100" />

                {/* Route Line */}
                <div className="absolute left-[28%] top-[18%] h-[420px] w-2 rotate-[-22deg] rounded-full bg-orange-500" />

                {/* Delivery Partner */}
                <div className="absolute left-[35%] top-[42%] z-10">
                  <div className="relative">
                    <div className="absolute -inset-4 animate-ping rounded-full bg-orange-400/30" />

                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-white shadow-xl">
                      <Bike size={27} />
                    </div>
                  </div>
                </div>

                {/* Restaurant Marker */}
                <div className="absolute left-[18%] top-[12%]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-white shadow-lg">
                    <ShoppingBag size={23} />
                  </div>

                  <div className="mt-2 rounded-xl bg-white px-3 py-2 text-center shadow">
                    <p className="text-xs font-bold text-gray-900">
                      {order?.restaurant_detail?.name || "Restaurant"}
                    </p>
                  </div>
                </div>

                {/* Customer Marker */}
                <div className="absolute bottom-[10%] right-[18%]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-green-500 text-white shadow-lg">
                    <MapPin size={23} />
                  </div>

                  <div className="mt-2 rounded-xl bg-white px-3 py-2 text-center shadow">
                    <p className="text-xs font-bold text-gray-900">
                      {customerName}
                    </p>
                  </div>
                </div>

                {/* Current Navigation Card */}
                <div className="absolute left-6 top-6 flex items-center gap-4 rounded-2xl bg-gray-900 px-6 py-5 text-white shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
                    <CornerUpRight size={25} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      IN 650 METERS
                    </p>

                    <p className="mt-1 font-bold">
                      Open live directions in Google Maps
                    </p>
                  </div>
                </div>

                {/* Location Button */}
                <button onClick={handleOpenMaps} disabled={!order?.delivery_address_detail} aria-label="Open route in Google Maps" className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-lg transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60">
                  <LocateFixed size={24} />
                </button>

                {/* ETA Card */}
                <div className="absolute bottom-6 left-6 flex gap-8 rounded-2xl bg-white px-7 py-5 shadow-xl">
                  <div>
                    <p className="text-xs text-gray-400">
                      STATUS
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {getStatusLabel(order?.status)}
                    </p>
                  </div>

                  <div className="border-l border-gray-200 pl-8">
                    <p className="text-xs text-gray-400">
                      ROUTE
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900">
                      Google Maps
                    </p>
                  </div>

                  <div className="border-l border-gray-200 pl-8">
                    <p className="text-xs text-gray-400">
                      PAYMENT
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {order?.payment?.method === "cod" ? "Cash on delivery" : order?.payment?.status || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Right Panel */}
            <div className="space-y-6">
              {/* Customer */}
              <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                  Deliver To
                </p>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white">
                    {order?.customer_detail?.first_name?.[0] || "C"}{order?.customer_detail?.last_name?.[0] || ""}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {order?.customer_detail ? `${order.customer_detail.first_name || ""} ${order.customer_detail.last_name || ""}`.trim() || order.customer_detail.email : "Customer"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Customer
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#fffaf7] p-4">
                  <MapPin
                    size={20}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <div>
                    <p className="font-semibold text-gray-900">
                      {order?.delivery_address_detail?.line1 || "Delivery address"}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {order?.delivery_address_detail ? `${order.delivery_address_detail.city || ""}${order.delivery_address_detail.state ? ", " + order.delivery_address_detail.state : ""}` : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {order?.customer_detail?.phone ? <a href={`tel:${order.customer_detail.phone}`} className="flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 font-semibold text-green-600 transition hover:bg-green-500 hover:text-white"><Phone size={18} />Call</a> : <span className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-400"><Phone size={18} />No phone</span>}

                  {order?.customer_detail?.email ? <a href={`mailto:${order.customer_detail.email}`} className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-600 transition hover:bg-blue-500 hover:text-white"><MessageCircle size={18} />Message</a> : <span className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-400"><MessageCircle size={18} />No email</span>}
                </div>
              </section>

              {/* Delivery Info */}
              <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">
                  Delivery Details
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-orange-50 p-4">
                    <div className="flex items-center gap-3">
                      <ShoppingBag
                        size={19}
                        className="text-orange-500"
                      />

                      <span className="text-sm text-gray-600">
                        Order
                      </span>
                    </div>

                    <span className="font-bold text-gray-900">
                      {order?.number ? `#RG${String(order.number).slice(0, 8).toUpperCase()}` : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-orange-50 p-4">
                    <div className="flex items-center gap-3">
                      <Clock
                        size={19}
                        className="text-orange-500"
                      />

                      <span className="text-sm text-gray-600">
                        Estimated Time
                      </span>
                    </div>

                    <span className="font-bold text-gray-900">
                      Live route
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-orange-50 p-4">
                    <div className="flex items-center gap-3">
                      <Navigation
                        size={19}
                        className="text-orange-500"
                      />

                      <span className="text-sm text-gray-600">
                        Distance
                      </span>
                    </div>

                    <span className="font-bold text-gray-900">
                      Open Maps
                    </span>
                  </div>
                </div>
              </section>

              {/* Delivery Action */}
              <section className="rounded-3xl bg-gradient-to-br from-orange-600 to-orange-400 p-6 text-white shadow-lg">
                <CheckCircle2 size={34} />

                <h2 className="mt-4 text-2xl font-bold">
                  Reached the customer?
                </h2>

                <p className="mt-3 text-sm leading-6 text-orange-100">
                  Confirm the order has been successfully delivered to
                  the customer.
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <button
                    onClick={handleMarkDelivered}
                    disabled={!order || updatingStatus}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 font-bold text-orange-500 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 size={21} />
                    {updatingStatus ? "Updating..." : "Mark as Delivered"}
                  </button>

                  <button
                    onClick={handleOpenMaps}
                    disabled={!order?.delivery_address_detail}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 px-5 py-4 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Navigation size={21} />
                    Open Route
                  </button>
                </div>
              </section>
            </div>
          </div>

          {/* Route Steps */}
          <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              Route Directions
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Step-by-step directions to the customer location.
            </p>

            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {routeSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    className="rounded-2xl border border-orange-100 p-5 transition hover:border-orange-300 hover:bg-orange-50"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
                      <Icon size={20} />
                    </div>

                    <p className="mt-5 font-bold leading-6 text-gray-900">
                      {step.instruction}
                    </p>

                    <p className="mt-3 text-sm font-semibold text-orange-500">
                      {step.distance}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
