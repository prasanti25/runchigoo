import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { hasAdminScope } from "../../lib/adminAccess.js";
import {
  dateTime,
  money,
  orderNumber,
  statusLabel,
  useRemote,
} from "../../lib/product.js";
import {
  WorkspaceFrame,
  Metrics,
} from "../../components/product/Workspace.jsx";
import {
  EmptyState,
  ErrorNotice,
  Modal,
} from "../../components/product/UI.jsx";
import OrderOperations from "../../components/product/OrderOperations.jsx";
import "../../components/product/Operations.css";

const statuses = [
  "awaiting_payment",
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "assigned",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
const nextStages = {
  pending: ["confirmed", "Accept order"],
  confirmed: ["preparing", "Start preparation"],
  preparing: ["ready", "Mark ready for pickup"],
};

export default function OrderQueue() {
  const { token, user } = useAuth();
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    on_hold: "",
    placed_after: "",
    placed_before: "",
    ordering: "-created_at",
    page: 1,
  });
  const [search, setSearch] = useState("");
  const [decision, setDecision] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value !== ""),
  );
  const orders = useRemote(`/orders/?${params}`, token, 10000);
  const summaryParams = new URLSearchParams(params);
  summaryParams.delete("page");
  const stats = useRemote(`/orders/summary/?${summaryParams}`, token, 10000);
  const count = (status) =>
    stats.data
      ? stats.data.by_status.find((row) => row.status === status)?.count || 0
      : "—";
  const filter = (name, value) =>
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  function refresh() {
    orders.reload();
    stats.reload();
  }
  async function advance(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/orders/${decision.id}/status/`, {
        token,
        method: "POST",
        body: {
          status: nextStages[decision.status][0],
          expected_status: decision.status,
        },
      });
      setDecision(null);
      refresh();
      toast.success("Order status updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <WorkspaceFrame
      type="admin"
      title="Orders"
      description="Follow each order from confirmation to handover. Updates every 10 seconds."
    >
      <Metrics
        entries={[
          ["Matching orders", stats.data?.total ?? "—"],
          ["Awaiting response", count("pending")],
          ["Preparing", count("preparing")],
          ["Ready for pickup", count("ready")],
        ]}
      />
      <section className="panel">
        <div className="people-toolbar">
          <form
            className="people-search"
            onSubmit={(event) => {
              event.preventDefault();
              filter("search", search.trim());
            }}
          >
            <Search size={18} />
            <input
              aria-label="Search orders"
              placeholder="Order reference or restaurant"
              value={search}
              maxLength={100}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="btn secondary">Search</button>
          </form>
          <label>
            Status
            <select
              aria-label="Order status filter"
              value={filters.status}
              onChange={(event) => filter("status", event.target.value)}
            >
              <option value="">All stages</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Attention
            <select
              aria-label="Order attention filter"
              value={filters.on_hold}
              onChange={(event) => filter("on_hold", event.target.value)}
            >
              <option value="">All orders</option>
              <option value="true">Fulfilment on hold</option>
            </select>
          </label>
        </div>
        <div className="report-toolbar">
          <div className="report-dates">
            <label>
              From
              <input
                type="date"
                aria-label="Order start date"
                value={filters.placed_after}
                onChange={(event) => filter("placed_after", event.target.value)}
              />
            </label>
            <label>
              To
              <input
                type="date"
                aria-label="Order end date"
                value={filters.placed_before}
                onChange={(event) =>
                  filter("placed_before", event.target.value)
                }
              />
            </label>
          </div>
          <div className="people-toolbar">
            <label>
              Order by
              <select
                aria-label="Order sort"
                value={filters.ordering}
                onChange={(event) => filter("ordering", event.target.value)}
              >
                <option value="-created_at">Newest first</option>
                <option value="created_at">Oldest first</option>
                <option value="-total">Highest value</option>
              </select>
            </label>
          </div>
        </div>
        <ErrorNotice error={orders.error || stats.error} onRetry={refresh} />
        {orders.loading && <p role="status">Loading orders…</p>}
        {!orders.loading && !orders.error && !orders.data?.results.length && (
          <EmptyState
            title="No matching orders"
            description="Try another stage, date range or restaurant."
          />
        )}
        <div className="operations-order-list">
          {orders.data?.results.map((order) => (
            <article
              key={order.id}
              className="operations-order"
              aria-label={`Order ${orderNumber(order)}`}
            >
              <header>
                <div>
                  <p className="eyebrow">#{orderNumber(order)}</p>
                  <h3>{order.restaurant_detail?.name}</h3>
                  <p className="muted">
                    {dateTime(order.created_at)} ·{" "}
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    items
                  </p>
                </div>
                <div className="operations-order-price">
                  <strong>{money(order.total)}</strong>
                  <span className={`status-pill ${order.status}`}>
                    {statusLabel(order.status)}
                  </span>
                </div>
              </header>
              <details>
                <summary>Order details and activity</summary>
                <div className="operations-order-details">
                  <div>
                    {order.items.map((item) => (
                      <p key={item.id}>
                        {item.quantity} × {item.name}
                        {item.add_ons?.length > 0 && (
                          <small className="order-addon-note">
                            {item.add_ons
                              .map((option) => option.name)
                              .join(", ")}
                          </small>
                        )}
                      </p>
                    ))}
                    <p className="muted mt-3">
                      Payment:{" "}
                      {order.payment?.method === "cod"
                        ? "Cash on delivery"
                        : "Online"}{" "}
                      · {order.payment?.status || "Pending"}
                    </p>
                    {order.notes && (
                      <p className="form-help">Instructions: {order.notes}</p>
                    )}
                  </div>
                  <ol>
                    {order.events.map((event) => (
                      <li key={event.id}>
                        <strong>{statusLabel(event.status)}</strong>
                        <small>{dateTime(event.created_at)}</small>
                        <p>{event.message}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </details>
              <div className="people-actions">
                <OrderOperations order={order} onUpdated={refresh} />
                {!order.fulfillment_paused_at && nextStages[order.status] && (
                  <button
                    className="btn primary"
                    onClick={() => {
                      setDecision(order);
                      setError("");
                    }}
                  >
                    {nextStages[order.status][1]}
                  </button>
                )}
                {hasAdminScope(user, "support") && (
                  <Link className="text-link" to={`/support?order=${order.id}`}>
                    Order support
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
        <div className="people-pagination">
          <button
            className="btn secondary"
            disabled={filters.page === 1 || orders.loading}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Previous orders
          </button>
          <span>
            Page {filters.page} · {orders.data?.count ?? "—"} matching
          </span>
          <button
            className="btn secondary"
            disabled={!orders.data?.next || orders.loading}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next orders
          </button>
        </div>
      </section>
      {decision && (
        <Modal
          title={nextStages[decision.status][1]}
          onClose={() => !busy && setDecision(null)}
        >
          <form className="people-form" onSubmit={advance}>
            <p>
              Order #{orderNumber(decision)} ·{" "}
              {decision.restaurant_detail?.name}
            </p>
            <p className="muted">
              Confirm this update with the kitchen. It changes the customer’s
              tracking status and sends an order notification. Stale updates
              will be rejected.
            </p>
            <ErrorNotice error={error} />
            <div className="people-actions">
              <button
                type="button"
                className="btn secondary"
                disabled={busy}
                onClick={() => setDecision(null)}
              >
                Keep unchanged
              </button>
              <button className="btn primary" disabled={busy}>
                {busy ? "Updating…" : "Confirm status update"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </WorkspaceFrame>
  );
}
