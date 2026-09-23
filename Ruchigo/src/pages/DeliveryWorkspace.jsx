import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Power,
} from "lucide-react";
import toast from "react-hot-toast";
import { WorkspaceFrame, Metrics } from "../components/product/Workspace.jsx";
import {
  EmptyState,
  ErrorNotice,
  Modal,
  Skeleton,
} from "../components/product/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import { locationPoint } from "../lib/addressLocation.js";
import OrderOperations from "../components/product/OrderOperations.jsx";
import DeliveryChat from "../components/product/DeliveryChat.jsx";
import { dateTime, money, orderNumber, useRemote } from "../lib/product.js";

export function DeliveryRequests() {
  const { token, user, updateProfile } = useAuth();
  const available = useRemote("/orders/available/", token, 10000);
  const assigned = useRemote("/orders/?active=true", token, 10000);
  const [busy, setBusy] = useState(null);
  const toggle = async () => {
    setBusy("availability");
    try {
      await updateProfile({ is_available: !user.is_available });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };
  const accept = async (order) => {
    setBusy(order.id);
    try {
      await apiRequest(`/orders/${order.id}/accept/`, {
        token,
        method: "POST",
      });
      available.reload();
      assigned.reload();
      toast.success("Delivery accepted. Head to the restaurant.");
    } catch (err) {
      toast.error(err.message);
      available.reload();
    } finally {
      setBusy(null);
    }
  };
  return (
    <WorkspaceFrame
      type="delivery"
      title="Delivery requests"
      description="Available pickups and your assigned deliveries, clearly separated."
      action={
        <button
          className={`btn ${user.is_available ? "dark" : "secondary"}`}
          disabled={busy !== null}
          onClick={toggle}
        >
          <Power size={17} />
          {user.is_available ? "You’re online" : "Go online"}
        </button>
      }
    >
      <Metrics
        entries={[
          ["Ready for pickup", available.data?.count ?? "—"],
          ["Your active deliveries", assigned.data?.count ?? "—"],
          ["Availability", user.is_available ? "Online" : "Offline"],
        ]}
      />
      <ErrorNotice
        error={available.error || assigned.error}
        onRetry={() => {
          available.reload();
          assigned.reload();
        }}
      />
      <section className="mt-7">
        <h2 className="workspace-section-title">Your active deliveries</h2>
        {assigned.loading && <Skeleton count={2} />}
        <div className="kitchen-grid">
          {assigned.data?.results.map((order) => (
            <article key={order.id} className="order-card">
              <h3>{order.restaurant_detail?.name}</h3>
              <p className="muted mt-3">
                #{orderNumber(order)} · {order.delivery_address_detail?.city}
              </p>
              <p className="muted mt-3">
                {order.delivery_address_detail?.line1}
              </p>
              <Link
                to={`/delivery-navigation?order=${order.id}`}
                className="btn primary mt-5"
              >
                Continue delivery
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
        {!assigned.loading &&
          !assigned.error &&
          !assigned.data?.results.length && (
            <p className="muted">No active deliveries right now.</p>
          )}
      </section>
      <section className="mt-9">
        <h2 className="workspace-section-title">Ready to pick up</h2>
        {available.loading && <Skeleton count={2} />}
        {!user.is_available && (
          <p className="saving-line mb-5">
            You’re offline. Go online when you’re ready to accept a delivery.
          </p>
        )}
        <div className="kitchen-grid">
          {available.data?.results.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="flex-row between">
                <h3>{order.restaurant_detail?.name}</h3>
                <span className="status-pill">Ready</span>
              </div>
              <p className="muted mt-3">
                <MapPin size={14} className="inline mr-1" />
                {order.restaurant_detail?.address},{" "}
                {order.restaurant_detail?.city}
              </p>
              <div className="order-items-summary">
                <strong>Deliver to</strong>
                <p>
                  {order.delivery_address_detail?.line1},{" "}
                  {order.delivery_address_detail?.city}
                </p>
                <p>
                  {order.items.reduce((n, i) => n + i.quantity, 0)} items ·{" "}
                  {money(order.total)} order value
                </p>
              </div>
              <button
                className="btn dark w-full"
                disabled={!user.is_available || busy !== null}
                onClick={() => accept(order)}
              >
                {busy === order.id ? "Accepting…" : "Accept delivery"}
                <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </div>
        {!available.loading &&
          !available.error &&
          !available.data?.results.length && (
            <EmptyState
              title="All caught up"
              description="New pickup requests will appear here automatically."
            />
          )}
      </section>
    </WorkspaceFrame>
  );
}

export function ActiveDelivery() {
  const { token } = useAuth();
  const [params] = useSearchParams();
  const id = params.get("order");
  const remote = useRemote(
    id ? `/orders/${id}/` : "/orders/?active=true",
    token,
    10000,
  );
  const order = id ? remote.data : remote.data?.results[0];
  const [sharing, setSharing] = useState(false);
  const [geoError, setGeoError] = useState("");
  const lastSent = useRef(0);
  const [confirmation, setConfirmation] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const assignment = order?.delivery?.id;
  const pickedUp = order?.status === "out_for_delivery";
  const awaitingPickup = order?.status === "assigned";
  const active = awaitingPickup || pickedUp;
  useEffect(() => {
    if (!sharing || !active || !assignment || !navigator.geolocation) return;
    let alive = true;
    let sending = false;
    lastSent.current = 0;
    const controller = new AbortController();
    const watch = navigator.geolocation.watchPosition(
      async (position) => {
        if (
          sending ||
          Date.now() - lastSent.current < 1000 ||
          Date.now() - position.timestamp > 10000
        )
          return;
        sending = true;
        lastSent.current = Date.now();
        try {
          await apiRequest(`/deliveries/${assignment}/`, {
            token,
            method: "PATCH",
            signal: controller.signal,
            body: {
              current_latitude: position.coords.latitude.toFixed(6),
              current_longitude: position.coords.longitude.toFixed(6),
            },
          });
          if (alive) setGeoError("");
        } catch (err) {
          if (alive) setGeoError(err.message);
        } finally {
          sending = false;
        }
      },
      () => {
        if (alive) {
          setGeoError(
            "Location access is unavailable. Enable location in your browser and try again.",
          );
          setSharing(false);
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
    return () => {
      alive = false;
      controller.abort();
      navigator.geolocation.clearWatch(watch);
    };
  }, [active, assignment, sharing, token]);
  const pickup = async () => {
    setBusy(true);
    try {
      await apiRequest(`/orders/${order.id}/pickup/`, {
        token,
        method: "POST",
      });
      remote.reload();
      toast.success("Pickup confirmed. You’re ready to deliver.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };
  const complete = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/orders/${order.id}/status/`, {
        token,
        method: "POST",
        body: { status: "delivered", delivery_code: code },
      });
      setSharing(false);
      setConfirmation(false);
      remote.reload();
      toast.success("Delivery completed. Thank you!");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const maps = (address) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const customerAddress = order
    ? [
        order.delivery_address_detail?.line1,
        order.delivery_address_detail?.line2,
        order.delivery_address_detail?.city,
        order.delivery_address_detail?.postal_code,
      ]
        .filter(Boolean)
        .join(", ")
    : "";
  const customerPin = locationPoint(order?.delivery_address_detail);
  const restaurantPin = locationPoint(order?.restaurant_detail);
  return (
    <WorkspaceFrame
      type="delivery"
      title={order && !active ? "Delivery details" : "Active delivery"}
      description="Your pickup, directions and handover steps in one place."
    >
      <ErrorNotice
        error={remote.error || geoError}
        onRetry={remote.error ? remote.reload : undefined}
      />
      {remote.loading && <Skeleton count={2} />}
      {order && order.status !== "cancelled" && (
        <div className="partner-delivery-steps" aria-label="Delivery progress">
          {["Pickup from kitchen", "On the way", "Handed over"].map(
            (label, index) => {
              const step = order.status === "delivered" ? 2 : pickedUp ? 1 : 0;
              return (
                <div
                  key={label}
                  className={
                    index < step || order.status === "delivered"
                      ? "complete"
                      : index === step
                        ? "current"
                        : ""
                  }
                  aria-current={index === step ? "step" : undefined}
                >
                  <span>
                    {index < step || order.status === "delivered" ? (
                      <Check size={14} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {label}
                </div>
              );
            },
          )}
        </div>
      )}
      {order ? (
        <div className="two-column">
          <div>
            <section className="panel">
              <div className="flex-row between">
                <h2>Order #{orderNumber(order)}</h2>
                <span className="status-pill">
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>
              <div className="route-stop">
                <span>1</span>
                <div>
                  <p className="eyebrow">PICK UP FROM</p>
                  <h3>{order.restaurant_detail?.name}</h3>
                  <p className="muted mt-2">
                    {order.restaurant_detail?.address},{" "}
                    {order.restaurant_detail?.city}
                  </p>
                  <a
                    className="btn secondary mt-4"
                    target="_blank"
                    rel="noreferrer"
                    href={maps(
                      restaurantPin
                        ? `${restaurantPin.latitude},${restaurantPin.longitude}`
                        : `${order.restaurant_detail?.address}, ${order.restaurant_detail?.city}`,
                    )}
                  >
                    <Navigation size={16} />
                    Directions to kitchen
                  </a>
                </div>
              </div>
              <div className="route-stop">
                <span>2</span>
                <div>
                  <p className="eyebrow">DELIVER TO</p>
                  <h3>{order.customer_detail?.first_name || "Customer"}</h3>
                  <p className="muted mt-2">{customerAddress}</p>
                  <a
                    className="btn secondary mt-4"
                    target="_blank"
                    rel="noreferrer"
                    href={maps(
                      customerPin
                        ? `${customerPin.latitude},${customerPin.longitude}`
                        : customerAddress,
                    )}
                  >
                    <Navigation size={16} />
                    Directions to customer
                  </a>
                  {order.customer_detail?.phone && (
                    <a
                      className="text-link ml-4"
                      href={`tel:${order.customer_detail.phone}`}
                    >
                      <Phone size={15} />
                      Call customer
                    </a>
                  )}
                </div>
              </div>
              {order.notes && (
                <p className="saving-line">
                  Delivery instructions: {order.notes}
                </p>
              )}
            </section>
            <DeliveryChat key={order.id} order={order} />
            <section className="panel">
              <h2>Items to collect</h2>
              {order.items.map((item) => (
                <div className="bill-line" key={item.id}>
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                </div>
              ))}
              <p className="form-help">Placed {dateTime(order.created_at)}</p>
            </section>
          </div>
          <aside>
            <OrderOperations order={order} />
            {awaitingPickup && (
              <section className="panel">
                <h2>Collect from the kitchen</h2>
                <p className="muted mt-3">
                  Check the order number and all items with the restaurant.
                  Confirm only after you have collected the food.
                </p>
                <button
                  className="btn primary w-full mt-5"
                  disabled={busy || Boolean(order.fulfillment_paused_at)}
                  onClick={pickup}
                >
                  <Check size={16} />
                  {busy ? "Confirming…" : "Confirm pickup"}
                </button>
              </section>
            )}
            <section className="panel">
              <h2>Live location sharing</h2>
              <p className="muted mt-3">
                Share your location during this delivery so the customer can
                follow your progress. Your shared GPS is also used by our
                address-lookup service to show the nearby road. Keep this page
                open; updates depend on device GPS and your connection.
              </p>
              <button
                className={`btn ${sharing ? "dark" : "secondary"} w-full mt-5`}
                disabled={!active}
                onClick={() => {
                  if (!navigator.geolocation)
                    setGeoError(
                      "Location sharing is not supported in this browser.",
                    );
                  else setSharing(!sharing);
                }}
              >
                <LocateFixed size={17} />
                {sharing ? "Stop sharing location" : "Share live location"}
              </button>
            </section>
            <section className="panel">
              <h2>
                {!active
                  ? `Order ${order.status.replaceAll("_", " ")}`
                  : order.payment?.method === "cod"
                    ? `Collect ${money(order.total)}${Number(order.tip_amount) > 0 ? ` · includes ${money(order.tip_amount)} cash tip for you` : ""}`
                    : "Payment recorded online"}
              </h2>
              <p className="muted mt-3">
                {!active
                  ? "This assignment is closed. No further pickup or handover action is available."
                  : order.payment?.method === "cod"
                    ? "Collect payment when handing over the order, then ask for the delivery code."
                    : "Ask the customer for their delivery code when handing over their food."}
              </p>
              <button
                className="btn primary w-full mt-5"
                disabled={
                  !pickedUp || busy || Boolean(order.fulfillment_paused_at)
                }
                onClick={() => setConfirmation(true)}
              >
                <Check size={16} />
                {pickedUp
                  ? "Confirm delivery"
                  : awaitingPickup
                    ? "Collect food before delivery"
                    : order.status === "delivered"
                      ? "Delivery complete"
                      : "Delivery unavailable"}
              </button>
              <Link className="text-link mt-5" to={`/support`}>
                Need help with this delivery?
              </Link>
            </section>
          </aside>
        </div>
      ) : (
        !remote.loading &&
        !remote.error && (
          <EmptyState
            title="No active delivery"
            description="Accept an available request to get started."
            to="/delivery-orders"
            action="View requests"
          />
        )
      )}
      {confirmation && (
        <Modal title="Food handed over?" onClose={() => setConfirmation(false)}>
          <p className="muted mt-4">
            Ask the customer for the six-digit code on their order tracking
            page.
          </p>
          <form className="form-stack" onSubmit={complete}>
            <label className="field">
              <span>Delivery code</span>
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
              />
            </label>
            <ErrorNotice error={error} />
            <button className="btn primary" disabled={busy}>
              {busy ? "Confirming…" : "Complete delivery"}
            </button>
          </form>
        </Modal>
      )}
    </WorkspaceFrame>
  );
}
