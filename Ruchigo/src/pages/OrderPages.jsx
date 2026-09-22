import { lazy, Suspense, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  ChefHat,
  Clock3,
  MapPin,
  PackageCheck,
  Printer,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { DeliveryEstimate } from "../components/product/BusinessInsights.jsx";
import {
  EmptyState,
  ErrorNotice,
  Skeleton,
} from "../components/product/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import {
  dateTime,
  money,
  orderNumber,
  statusLabel,
  useRemote,
} from "../lib/product.js";
import { apiRequest } from "../lib/api.js";
import { payForOrder } from "../lib/payments.js";
import OrderReview from "../components/product/OrderReview.jsx";
import OrderHelp from "../components/product/OrderHelp.jsx";
import CancelOrder from "../components/product/CancelOrder.jsx";
import OrderOperations from "../components/product/OrderOperations.jsx";
import RefundStatus from "../components/product/RefundStatus.jsx";

import DeliveryChat from "../components/product/DeliveryChat.jsx";

const LiveDeliveryMap = lazy(
  () => import("../components/product/LiveDeliveryMap.jsx"),
);

export function OrdersPage() {
  const { token } = useAuth();
  const { loadCart } = useCart();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useRemote(
    `/orders/?page=${page}`,
    token,
    15000,
  );
  const [tab, setTab] = useState("all");
  const [busy, setBusy] = useState(null);
  const orders = (data?.results || []).filter(
    (order) =>
      tab === "all" ||
      (tab === "active"
        ? !["delivered", "cancelled"].includes(order.status)
        : ["delivered", "cancelled"].includes(order.status)),
  );
  const action = async (order, kind) => {
    setBusy(order.id);
    try {
      await apiRequest(`/orders/${order.id}/${kind}/`, {
        token,
        method: "POST",
      });
      if (kind === "reorder") {
        await loadCart();
        navigate("/cart");
        toast.success(
          "Your favourites are back in your bag. Prices reflect today’s menu.",
        );
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className="container" style={{ maxWidth: 950 }}>
          <div className="page-heading">
            <p className="eyebrow">EVERY MEAL HAS A STORY</p>
            <h1>Your orders.</h1>
            <p className="muted">
              Track what’s cooking, revisit a favourite, or share a little
              feedback.
            </p>
          </div>
          <div className="results-heading">
            <div className="segmented">
              {[
                ["all", "All orders"],
                ["active", "In progress"],
                ["past", "Past orders"],
              ].map(([key, name]) => (
                <button
                  className={tab === key ? "active" : ""}
                  key={key}
                  onClick={() => setTab(key)}
                >
                  {name}
                </button>
              ))}
            </div>
            <span className="tiny muted">Updates automatically</span>
          </div>
          <ErrorNotice error={error} onRetry={reload} />
          {loading ? (
            <Skeleton count={2} />
          ) : orders.length ? (
            orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="flex-row between">
                  <div>
                    <h3>{order.restaurant_detail?.name}</h3>
                    <p className="muted">
                      #{orderNumber(order)} · {dateTime(order.created_at)}
                    </p>
                  </div>
                  <span className={`status-pill ${order.status}`}>
                    {statusLabel(order.status)}
                  </span>
                </div>
                <div className="order-items-summary">
                  {order.items.map((item) => (
                    <span key={item.id} className="block">
                      {item.quantity} × {item.name}
                      {item.add_ons?.length > 0 && (
                        <small className="order-addon-note">
                          {item.add_ons.map((row) => row.name).join(", ")}
                        </small>
                      )}
                    </span>
                  ))}
                </div>
                <div className="flex-row between">
                  <div className="order-actions">
                    <Link className="btn dark" to={`/tracking/${order.id}`}>
                      {["delivered", "cancelled"].includes(order.status)
                        ? "View details"
                        : "Track order"}
                      <ArrowRight size={14} />
                    </Link>
                    {["delivered", "cancelled"].includes(order.status) && (
                      <button
                        className="btn secondary"
                        disabled={busy === order.id}
                        onClick={() => action(order, "reorder")}
                      >
                        <RotateCcw size={14} />
                        Reorder
                      </button>
                    )}
                    <CancelOrder order={order} onUpdated={reload} compact />
                    <OrderReview order={order} onSaved={reload} compact />
                  </div>
                  <strong>{money(order.total)}</strong>
                </div>
              </article>
            ))
          ) : (
            !error && (
              <EmptyState
                title={
                  tab === "active"
                    ? "Nothing cooking just yet"
                    : "Your food story starts here"
                }
                description="Your orders will appear here, from the kitchen to your door."
                to="/search"
              />
            )
          )}
          {data?.count > 20 && (
            <div className="pagination">
              <button
                className="btn secondary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                className="btn secondary"
                disabled={!data.next}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

const stages = [
  ["pending", "Order placed", Check],
  ["confirmed", "Restaurant accepted", PackageCheck],
  ["preparing", "Freshly preparing your meal", ChefHat],
  ["ready", "Ready for pickup", Clock3],
  ["assigned", "Delivery partner assigned", Bike],
  ["out_for_delivery", "On the way to you", Bike],
  ["delivered", "Enjoy your meal", Check],
];
export function TrackingPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [paying, setPaying] = useState(false);
  const { data, loading, error, reload } = useRemote(
    id ? `/orders/${id}/` : "/orders/",
    token,
    10000,
  );
  const order = id ? data : data?.results?.[0];
  const options = useRemote(
    order?.status === "awaiting_payment" ? "/online-payments/" : null,
    token,
  );
  const pay = async () => {
    setPaying(true);
    try {
      await payForOrder(order, { token, keyId: options.data?.key_id, user });
      toast.success("Payment confirmed");
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPaying(false);
    }
  };
  const stage = stages.findIndex(([status]) => status === order?.status);
  const address = order?.delivery_address_detail;
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/orders" className="flex-row">
              <ArrowLeft size={15} />
              Your orders
            </Link>
          </div>
          <ErrorNotice error={error} onRetry={reload} />
          {loading ? (
            <Skeleton count={2} />
          ) : order ? (
            <>
              <div className="page-heading" style={{ paddingTop: 5 }}>
                <p className="eyebrow">ORDER #{orderNumber(order)}</p>
                <h1>
                  {order.status === "cancelled"
                    ? "This order was cancelled."
                    : order.status === "delivered"
                      ? "Good food. Happy you."
                      : order.fulfillment_paused_at
                        ? "Your order needs attention."
                        : statusLabel(order.status)}
                </h1>
                <p className="muted">
                  {order.restaurant_detail?.name} · {dateTime(order.created_at)}
                </p>
              </div>
              <div className="two-column">
                <div>
                  {import.meta.env.DEV && (
                    <div className="tracking-demo-link">
                      <div>
                        <strong>
                          Want to try the complete delivery journey?
                        </strong>
                        <p>
                          Local preview · automatic kitchen updates and a moving
                          rider. This order stays unchanged.
                        </p>
                      </div>
                      <Link to="/demo/delivery" className="text-link">
                        Try delivery demo <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                  <OrderReview order={order} onSaved={reload} />
                  <CancelOrder order={order} onUpdated={reload} />
                  <OrderOperations order={order} onUpdated={reload} />
                  {order.refunds?.map((refund) => (
                    <div key={refund.id}>
                      <RefundStatus refund={refund} onUpdated={reload} />
                      <Link
                        className="text-link mb-5"
                        to={`/support?order=${order.id}&ticket=${refund.ticket}`}
                      >
                        View refund conversation <ArrowRight size={15} />
                      </Link>
                    </div>
                  ))}
                  {order.status === "delivered" && <OrderHelp order={order} />}
                  {!["cancelled", "delivered", "awaiting_payment"].includes(
                    order.status,
                  ) &&
                    !order.fulfillment_paused_at && (
                      <Suspense
                        fallback={
                          <section className="panel" role="status">
                            Loading delivery map…
                          </section>
                        }
                      >
                        <LiveDeliveryMap key={order.id} order={order} />
                      </Suspense>
                    )}
                  {!order.fulfillment_paused_at && (
                    <DeliveryEstimate order={order} />
                  )}
                  {!["cancelled", "delivered", "awaiting_payment"].includes(
                    order.status,
                  ) &&
                    !order.fulfillment_paused_at && (
                      <p className="tracking-live-note" role="status">
                        {
                          {
                            pending:
                              "Waiting for the restaurant to accept. Your order is in its live queue.",
                            confirmed:
                              "The restaurant has accepted your order and will update you when cooking starts.",
                            preparing:
                              "Your restaurant is cooking. You’ll be notified when the meal is ready.",
                            ready:
                              "Cooking is complete. Waiting for a delivery partner to collect your meal.",
                            assigned:
                              "A delivery partner has accepted the pickup. Your meal is still at the restaurant.",
                            out_for_delivery:
                              "Your partner has collected the meal. Follow their shared location on the map when available.",
                          }[order.status]
                        }{" "}
                        <span>
                          Updates refresh automatically while this page is open.
                        </span>
                      </p>
                    )}
                  {order.status === "awaiting_payment" && (
                    <section className="panel">
                      <h2>Complete your payment</h2>
                      <p className="muted mt-3">
                        Your order will reach the kitchen after payment is
                        confirmed.
                      </p>
                      {order.payment_expires_at && (
                        <p className="form-help">
                          Complete payment by{" "}
                          {new Date(
                            order.payment_expires_at,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          . After that, the order expires and reserved items are
                          released.
                        </p>
                      )}
                      <button
                        className="btn primary mt-5"
                        disabled={paying || !options.data?.online_available}
                        onClick={pay}
                      >
                        {paying
                          ? "Confirming payment…"
                          : `Pay ${money(order.total)}`}
                      </button>
                    </section>
                  )}
                  <section className="panel">
                    <div className="flex-row between">
                      <h2>{statusLabel(order.status)}</h2>
                      <span className="tiny muted">
                        Updates every 10 seconds
                      </span>
                    </div>
                    {order.status === "cancelled" ? (
                      <p className="muted mt-5">
                        Your order has been cancelled. Reach out to support if
                        you need a hand.
                      </p>
                    ) : (
                      <div className="timeline">
                        {stages.map(([status, label, Icon], index) => {
                          const event = order.events?.find(
                            (entry) => entry.status === status,
                          );
                          return (
                            <div
                              className={`timeline-step ${index <= stage ? "done" : ""}`}
                              key={status}
                            >
                              <span>
                                <Icon size={15} />
                              </span>
                              <div>
                                <strong>{label}</strong>
                                {event && <p>{dateTime(event.created_at)}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                  <section className="panel">
                    <div className="flex-row between">
                      <h2>Your meal</h2>
                      <button
                        onClick={() => window.print()}
                        className="text-link no-print"
                      >
                        <Printer size={15} />
                        Print receipt
                      </button>
                    </div>
                    {order.items.map((item) => (
                      <div className="bill-line" key={item.id}>
                        <span>
                          {item.quantity} × {item.name}
                          {item.add_ons?.length > 0 && (
                            <small className="order-addon-note">
                              {item.add_ons.map((row) => row.name).join(", ")}
                            </small>
                          )}
                        </span>
                        <strong>{money(item.total_price)}</strong>
                      </div>
                    ))}
                    <div className="bill-line">
                      <span>Delivery</span>
                      <span>{money(order.delivery_fee)}</span>
                    </div>
                    {Number(order.discount) > 0 && (
                      <div className="bill-line">
                        <span>Discount</span>
                        <span>−{money(order.discount)}</span>
                      </div>
                    )}
                    <div className="bill-line bill-total">
                      <span>Total</span>
                      <span>{money(order.total)}</span>
                    </div>
                    <p className="form-help">
                      {order.payment?.method === "cod"
                        ? "Cash on delivery"
                        : "Online payment"}{" "}
                      · {order.payment?.status || "Pending"}
                    </p>
                  </section>
                </div>
                <aside>
                  {user?.role === "customer" && order.delivery && (
                    <DeliveryChat key={order.id} order={order} />
                  )}
                  <section className="panel">
                    <h2>
                      <MapPin size={19} className="inline mr-2" />
                      Delivering to
                    </h2>
                    <p className="muted mt-4">
                      <strong>{address?.label}</strong>
                      <br />
                      {[
                        address?.line1,
                        address?.line2,
                        address?.city,
                        address?.state,
                        address?.postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {order.notes && (
                      <p className="form-help">Instructions: {order.notes}</p>
                    )}
                    {order.delivery_code &&
                      !["delivered", "cancelled"].includes(order.status) && (
                        <div className="delivery-code mt-5">
                          <span className="tiny muted">YOUR DELIVERY CODE</span>
                          <strong>{order.delivery_code}</strong>
                          <p>Share this only when your food reaches you.</p>
                        </div>
                      )}
                  </section>
                  <section className="panel">
                    <h2>We’re here to help.</h2>
                    <p className="muted mt-3">
                      Something not quite right with your order?
                    </p>
                    <Link
                      className="btn secondary w-full mt-5"
                      to={`/support?order=${order.id}`}
                    >
                      Get help
                      <ArrowRight size={16} />
                    </Link>
                  </section>
                </aside>
              </div>
            </>
          ) : (
            !error && (
              <EmptyState
                title="No order to track yet"
                to="/search"
                description="Choose a meal to get started."
              />
            )
          )}
        </div>
      </main>
    </>
  );
}
