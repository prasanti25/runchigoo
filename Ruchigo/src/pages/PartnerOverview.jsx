import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bike,
  CalendarDays,
  Check,
  ChefHat,
  Clock3,
  Download,
  IndianRupee,
  LifeBuoy,
  MapPin,
  Navigation,
  PackageCheck,
  Power,
  RefreshCw,
  Search,
  ShoppingBag,
  Store,
  Utensils,
} from "lucide-react";
import toast from "react-hot-toast";
import { WorkspaceFrame } from "../components/product/Workspace.jsx";
import {
  EmptyState,
  ErrorNotice,
  Skeleton,
} from "../components/product/UI.jsx";
import OrderPerformance from "../components/product/OrderPerformance.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  dateTime,
  money,
  orderNumber,
  statusLabel,
  useRemote,
} from "../lib/product.js";
import {
  partnerReportCsv,
  partnerReportRange,
  statusCount,
} from "../lib/partnerOverview.js";

const count = (value) =>
  value == null ? "—" : Number(value).toLocaleString("en-IN");

function Metric({ label, value, Icon, note, featured = false, change }) {
  return (
    <article className={`partner-metric${featured ? " featured" : ""}`}>
      <header>
        <span>{label}</span>
        <Icon size={18} />
      </header>
      <strong>{value}</strong>
      {change != null && (
        <span className="partner-change">
          {change >= 0 ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {Math.abs(change)}% vs previous period
        </span>
      )}
      <p>{note}</p>
    </article>
  );
}

function SectionHeading({ title, subtitle, to, action = "View all" }) {
  return (
    <header className="partner-section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {action}
          <ArrowRight size={15} />
        </Link>
      )}
    </header>
  );
}

function OrderRows({ orders, type, history = false }) {
  return (
    <div className="partner-order-list">
      {orders.map((order) => (
        <Link
          className="partner-order-row"
          key={order.id}
          to={
            type === "restaurant"
              ? `/restaurant-orders?status=${order.status}&order_id=${order.id}`
              : `/delivery-navigation?order=${order.id}`
          }
        >
          <span className="partner-order-icon">
            {type === "restaurant" ? (
              <ShoppingBag size={19} />
            ) : (
              <Bike size={19} />
            )}
          </span>
          <div className="partner-order-identity">
            <strong>
              {type === "delivery"
                ? order.restaurant_detail?.name || "Restaurant"
                : `#${orderNumber(order)}`}
            </strong>
            <p>
              {type === "delivery"
                ? `#${orderNumber(order)} · ${order.delivery_address_detail?.city || "Delivery"}`
                : order.items
                    .map((item) => `${item.quantity} × ${item.name}`)
                    .join(", ")}
            </p>
            <small>
              {history && order.delivery?.delivered_at
                ? `Delivered ${dateTime(order.delivery.delivered_at)}`
                : `Placed ${dateTime(order.created_at)}`}
            </small>
          </div>
          <span className={`status-pill ${order.status}`}>
            {statusLabel(order.status)}
          </span>
          <div className="partner-order-value">
            <strong>{money(order.total)}</strong>
            <small>Order value</small>
          </div>
          <ArrowRight size={16} />
        </Link>
      ))}
    </div>
  );
}

function StatusFlow({ summary, type }) {
  const restaurant = type === "restaurant";
  const stages = restaurant
    ? [
        ["pending", "New orders", ShoppingBag],
        ["confirmed", "Accepted", Check],
        ["preparing", "Preparing", ChefHat],
        ["ready", "Ready for pickup", PackageCheck],
        ["assigned", "Rider assigned", Bike],
        ["out_for_delivery", "On the way", Navigation],
      ]
    : [
        ["assigned", "Heading to pickup", Store],
        ["out_for_delivery", "On the way", Navigation],
        ["delivered", "Delivered", PackageCheck],
        ["cancelled", "Cancelled", Clock3],
      ];
  const total = stages.reduce(
    (sum, [status]) => sum + (statusCount(summary, status) || 0),
    0,
  );
  return (
    <section className="partner-panel partner-flow">
      <SectionHeading
        title={restaurant ? "Kitchen flow" : "Your delivery record"}
        subtitle={
          restaurant
            ? "Current stages · active orders"
            : "All-time assigned orders · current status"
        }
      />
      <div className="partner-flow-total">
        <strong>{summary ? count(total) : "—"}</strong>
        <span>{restaurant ? "orders in progress" : "assignments"}</span>
      </div>
      {stages.map(([status, label, Icon]) => (
        <Link
          key={status}
          to={
            restaurant
              ? `/restaurant-orders?status=${status}`
              : status === "delivered"
                ? "/delivery-earnings"
                : status === "cancelled"
                  ? "/delivery-earnings?status=cancelled"
                  : "/delivery-navigation"
          }
          className="partner-flow-row"
        >
          <Icon size={16} />
          <span>
            {label}
            <i>
              <b
                style={{
                  width: `${summary && total ? (statusCount(summary, status) / total) * 100 : 0}%`,
                }}
              />
            </i>
          </span>
          <strong>{count(statusCount(summary, status))}</strong>
          <ArrowRight size={13} />
        </Link>
      ))}
    </section>
  );
}

export function DeliveryAvailability() {
  const { user, updateProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true);
    try {
      await updateProfile({ is_available: !user.is_available });
      toast.success(user.is_available ? "You’re offline" : "You’re online");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      className={`partner-availability ${user.is_available ? "online" : ""}`}
      aria-pressed={Boolean(user.is_available)}
      disabled={busy}
      onClick={toggle}
    >
      <Power size={16} />
      {busy ? "Updating…" : user.is_available ? "You’re online" : "Go online"}
      <span aria-hidden="true">
        <i />
      </span>
    </button>
  );
}

export function RestaurantOverview() {
  const { token } = useAuth();
  const [days, setDays] = useState(7);
  const [range, setRange] = useState(() => partnerReportRange(7));
  const report = useRemote(`/insights/?${new URLSearchParams(range)}`, token);
  const restaurant = useRemote("/restaurants/", token, 30000);
  const orders = useRemote("/orders/", token, 10000);
  const summary = useRemote("/orders/summary/", token, 10000);
  const kitchen = restaurant.data?.results[0];
  const data = report.data;
  const newOrders = statusCount(summary.data, "pending");
  const reload = () => {
    report.reload();
    restaurant.reload();
    orders.reload();
    summary.reload();
  };
  function download() {
    if (!data) return;
    const url = URL.createObjectURL(
      new Blob([partnerReportCsv(data)], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `ruchigo-kitchen-${data.period.start}-${data.period.end}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <WorkspaceFrame
      type="restaurant"
      title="Kitchen overview"
      description="A clear view of your kitchen. From the first order to the last pickup."
      className="partner-overview"
      action={
        <Link className="btn primary" to="/restaurant-orders">
          <ShoppingBag size={16} />
          Open order queue
        </Link>
      }
    >
      <section className="partner-operating-strip">
        <span className="partner-kitchen-symbol">
          <ChefHat size={25} />
        </span>
        <div>
          <strong>
            {kitchen?.name ||
              (restaurant.loading
                ? "Loading your restaurant…"
                : "Your restaurant")}
          </strong>
          <p>
            <MapPin size={12} />
            {kitchen?.city || "Add your business details in Restaurant profile"}
          </p>
        </div>
        <span
          className={`partner-operating-status ${kitchen?.accepting_orders ? "open" : ""}`}
        >
          <i />
          {kitchen
            ? !kitchen.is_approved
              ? "Approval pending"
              : kitchen.accepting_orders
                ? "Accepting orders"
                : "Not accepting orders"
            : "Status unavailable"}
        </span>
        <Link to="/restaurant-profile" className="text-link">
          Manage kitchen
          <ArrowRight size={14} />
        </Link>
      </section>
      <ErrorNotice error={restaurant.error || summary.error} onRetry={reload} />
      <div className="partner-report-toolbar">
        <div
          className="partner-period-tabs"
          role="group"
          aria-label="Performance period"
        >
          {[7, 30, 90].map((value) => (
            <button
              key={value}
              aria-pressed={days === value}
              onClick={() => {
                setDays(value);
                setRange(partnerReportRange(value));
              }}
            >
              Last {value} days
            </button>
          ))}
        </div>
        <span className="partner-date-label">
          <CalendarDays size={14} />
          {range.start} — {range.end} · IST
        </span>
        <button
          className="btn secondary"
          disabled={!data || Boolean(report.error)}
          onClick={download}
        >
          <Download size={15} />
          Export
        </button>
        <button
          className="partner-icon-button"
          aria-label="Refresh overview"
          onClick={reload}
        >
          <RefreshCw size={17} />
        </button>
      </div>
      <ErrorNotice error={report.error} onRetry={report.reload} />
      <div className="partner-metrics" aria-label="Kitchen performance">
        <Metric
          label="Orders placed"
          value={count(data?.summary.orders)}
          Icon={ShoppingBag}
          note="In your selected period"
          change={data?.comparison.change_percent.orders}
        />
        <Metric
          label="Delivered order value"
          value={data ? money(data.summary.gross_order_value) : "—"}
          Icon={IndianRupee}
          featured
          note="Gross order value · not your payout"
          change={data?.comparison.change_percent.gross_order_value}
        />
        <Metric
          label="Average order value"
          value={data ? money(data.summary.average_order_value) : "—"}
          Icon={Utensils}
          note="Across delivered orders"
        />
        <Metric
          label="Orders delivered"
          value={count(data?.summary.delivered)}
          Icon={PackageCheck}
          note={
            data
              ? `${data.summary.cancelled} cancelled in this period`
              : "In your selected period"
          }
        />
      </div>
      <div className="partner-overview-grid">
        <section className="partner-panel partner-trend">
          <SectionHeading
            title="Order performance"
            subtitle="Orders grouped by placement date · latest delivery status"
          />
          {report.loading ? (
            <Skeleton count={2} />
          ) : data ? (
            <OrderPerformance report={data} />
          ) : (
            <p className="muted">
              Your report is unavailable. Use retry above.
            </p>
          )}
        </section>
        <StatusFlow summary={summary.data} type="restaurant" />
      </div>
      <div className="partner-action-grid">
        <Link
          className="partner-action-card"
          to="/restaurant-orders?status=pending"
        >
          <span>
            <ShoppingBag size={21} />
          </span>
          <div>
            <strong>
              {newOrders == null
                ? "Incoming orders"
                : `${count(newOrders)} ${newOrders === 1 ? "order needs" : "orders need"} your response`}
            </strong>
            <p>Review and accept before starting preparation.</p>
          </div>
          <ArrowRight size={17} />
        </Link>
        <Link className="partner-action-card" to="/restaurant-menu">
          <span>
            <Utensils size={21} />
          </span>
          <div>
            <strong>Make your menu work for you</strong>
            <p>Keep dishes, add-ons and stock up to date.</p>
          </div>
          <ArrowRight size={17} />
        </Link>
      </div>
      <section className="partner-panel">
        <SectionHeading
          title="Recent orders"
          subtitle="Latest orders across your kitchen"
          to="/restaurant-orders"
        />
        <ErrorNotice error={orders.error} onRetry={orders.reload} />
        {orders.loading ? (
          <Skeleton count={2} />
        ) : orders.data?.results.length ? (
          <OrderRows
            orders={orders.data.results.slice(0, 5)}
            type="restaurant"
          />
        ) : (
          !orders.error && (
            <EmptyState
              title="Ready for your next order"
              description="New orders will appear here automatically."
            />
          )
        )}
      </section>
    </WorkspaceFrame>
  );
}

export function DeliveryOverview() {
  const { token, user } = useAuth();
  const summary = useRemote("/orders/summary/", token, 10000);
  const active = useRemote("/orders/?active=true", token, 10000);
  const history = useRemote("/orders/?status=delivered", token);
  const available = useRemote("/orders/available/", token, 10000);
  const total = summary.data?.total;
  const delivered = statusCount(summary.data, "delivered");
  const current = statusCount(summary.data, "assigned", "out_for_delivery");
  const refresh = () => {
    summary.reload();
    active.reload();
    history.reload();
    available.reload();
  };
  return (
    <WorkspaceFrame
      type="delivery"
      title="Your delivery overview"
      description="Your next pickup, active routes and delivery record. All in one place."
      className="partner-overview"
      action={<DeliveryAvailability />}
    >
      <section className="partner-operating-strip">
        <span className="partner-kitchen-symbol">
          <Bike size={26} />
        </span>
        <div>
          <strong>
            {user.is_available
              ? "Ready for your next delivery"
              : "Take a break. We’ll be here."}
          </strong>
          <p>
            {user.is_available
              ? "Check requests, confirm pickup, then deliver safely."
              : "Go online when you’re ready to accept requests."}
          </p>
        </div>
        <span
          className={`partner-operating-status ${user.is_available ? "open" : ""}`}
        >
          <i />
          {user.is_available ? "Online" : "Offline"}
        </span>
        <button
          className="partner-icon-button"
          onClick={refresh}
          aria-label="Refresh delivery overview"
        >
          <RefreshCw size={17} />
        </button>
      </section>
      <ErrorNotice
        error={summary.error || active.error || available.error}
        onRetry={refresh}
      />
      <div className="partner-metrics" aria-label="Delivery performance">
        <Metric
          label="Active deliveries"
          value={count(current)}
          Icon={Navigation}
          featured
          note="Assigned to you right now"
        />
        <Metric
          label="Pickup requests"
          value={count(available.data?.count)}
          Icon={Store}
          note="Available requests · not yet assigned"
        />
        <Metric
          label="Completed deliveries"
          value={count(delivered)}
          Icon={PackageCheck}
          note="Your all-time delivery record"
        />
        <Metric
          label="Completion rate"
          value={total ? `${Math.round((delivered / total) * 100)}%` : "—"}
          Icon={Check}
          note={
            total
              ? `${count(delivered)} of ${count(total)} assignments`
              : "Available after your first assignment"
          }
        />
      </div>
      <div className="partner-overview-grid">
        <section className="partner-panel partner-active-panel">
          <SectionHeading
            title="On your route"
            subtitle="Your active pickups and handovers"
            to="/delivery-orders"
            action="All requests"
          />
          {active.loading ? (
            <Skeleton count={2} />
          ) : active.data?.results.length ? (
            active.data.results.map((order) => (
              <article className="partner-route-card" key={order.id}>
                <header>
                  <strong>#{orderNumber(order)}</strong>
                  <span className={`status-pill ${order.status}`}>
                    {order.status === "assigned"
                      ? "Head to pickup"
                      : "Deliver to customer"}
                  </span>
                </header>
                <div className="partner-route-stops">
                  <div>
                    <span>
                      <Store size={17} />
                    </span>
                    <div>
                      <small>PICKUP</small>
                      <strong>{order.restaurant_detail?.name}</strong>
                      <p>{order.restaurant_detail?.address}</p>
                    </div>
                  </div>
                  <div>
                    <span>
                      <MapPin size={17} />
                    </span>
                    <div>
                      <small>DROP-OFF</small>
                      <strong>{order.delivery_address_detail?.line1}</strong>
                      <p>
                        {[
                          order.delivery_address_detail?.line2,
                          order.delivery_address_detail?.city,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  className="btn primary"
                  to={`/delivery-navigation?order=${order.id}`}
                >
                  <Navigation size={16} />
                  Continue delivery
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))
          ) : (
            !active.error && (
              <EmptyState
                title="Your next route starts here"
                description="Accept a pickup request to see directions and delivery steps."
                to="/delivery-orders"
                action="View delivery requests"
              />
            )
          )}
        </section>
        <StatusFlow summary={summary.data} type="delivery" />
      </div>
      <div className="partner-action-grid">
        <Link className="partner-action-card" to="/delivery-earnings">
          <span>
            <PackageCheck size={21} />
          </span>
          <div>
            <strong>Every delivery, in one place</strong>
            <p>Review completed trips and order details.</p>
          </div>
          <ArrowRight size={17} />
        </Link>
        <Link className="partner-action-card" to="/support">
          <span>
            <LifeBuoy size={21} />
          </span>
          <div>
            <strong>Need a hand on the road?</strong>
            <p>Get help and follow your support conversations.</p>
          </div>
          <ArrowRight size={17} />
        </Link>
      </div>
      <section className="partner-panel">
        <SectionHeading
          title="Recently delivered"
          subtitle="Your latest completed deliveries"
          to="/delivery-earnings"
        />
        <ErrorNotice error={history.error} onRetry={history.reload} />
        {history.loading ? (
          <Skeleton count={2} />
        ) : history.data?.results.length ? (
          <OrderRows
            orders={history.data.results.slice(0, 4)}
            type="delivery"
            history
          />
        ) : (
          !history.error && (
            <EmptyState
              title="A fresh start"
              description="Completed deliveries will appear here after handover."
            />
          )
        )}
      </section>
    </WorkspaceFrame>
  );
}

export function DeliveryHistory() {
  const { token } = useAuth();
  const [params, setParams] = useSearchParams();
  const filters = {
    status: params.get("status") === "cancelled" ? "cancelled" : "delivered",
    search: params.get("search") || "",
    page: /^[1-9]\d*$/.test(params.get("page") || "")
      ? Number(params.get("page"))
      : 1,
  };
  const setFilters = (next) => setParams(next);
  const [query, setQuery] = useState(() => params.get("search") || "");
  const records = useRemote(`/orders/?${new URLSearchParams(filters)}`, token);
  const summary = useRemote("/orders/summary/", token);
  return (
    <WorkspaceFrame
      type="delivery"
      title="Delivery history"
      description="A record of your completed and cancelled assignments."
      className="partner-history"
    >
      <div className="partner-metrics">
        <Metric
          label="Completed deliveries"
          value={count(statusCount(summary.data, "delivered"))}
          Icon={PackageCheck}
          featured
          note="All-time completed assignments"
        />
        <Metric
          label="Cancelled assignments"
          value={count(statusCount(summary.data, "cancelled"))}
          Icon={Clock3}
          note="Includes cancellations after assignment"
        />
        <Metric
          label="Matching records"
          value={count(records.data?.count)}
          Icon={Search}
          note="Using your selected status and search"
        />
      </div>
      <div className="partner-inline-notice">
        <IndianRupee size={20} />
        <div>
          <strong>Order value is not your earnings</strong>
          <p>
            Delivery payouts and incentives are not configured yet. No earnings
            are estimated from customer bills.
          </p>
        </div>
      </div>
      <section className="partner-panel">
        <SectionHeading
          title="Your assignments"
          subtitle="Search by order number or restaurant"
        />
        <form
          className="partner-list-toolbar"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters({ ...filters, search: query.trim(), page: 1 });
          }}
        >
          <label className="partner-search">
            <Search size={17} />
            <input
              aria-label="Search delivery history"
              placeholder="Order number or restaurant…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            aria-label="Delivery history status"
            value={filters.status}
            onChange={(event) =>
              setFilters({ ...filters, status: event.target.value, page: 1 })
            }
          >
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn secondary">Search</button>
        </form>
        <ErrorNotice
          error={records.error || summary.error}
          onRetry={() => {
            records.reload();
            summary.reload();
          }}
        />
        {records.loading ? (
          <Skeleton count={3} />
        ) : records.data?.results.length ? (
          <OrderRows orders={records.data.results} type="delivery" history />
        ) : (
          !records.error && (
            <EmptyState
              title="No matching deliveries"
              description="Try a different order number or switch the status filter."
            />
          )
        )}
        {records.data && (
          <div className="partner-pagination">
            <span>
              {count(records.data.count)} records · Page {filters.page}
            </span>
            <div>
              <button
                className="btn secondary"
                disabled={!records.data.previous}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
              >
                Previous
              </button>
              <button
                className="btn secondary"
                disabled={!records.data.next}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </WorkspaceFrame>
  );
}
