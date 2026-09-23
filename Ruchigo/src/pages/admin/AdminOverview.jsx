import { useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bike,
  CalendarDays,
  Check,
  ChefHat,
  CircleCheck,
  Clock3,
  CreditCard,
  Download,
  RefreshCw,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { hasAdminScope } from "../../lib/adminAccess.js";
import {
  dateTime,
  money,
  orderNumber,
  statusLabel,
  useRemote,
} from "../../lib/product.js";
import { WorkspaceFrame } from "../../components/product/Workspace.jsx";
import { EmptyState, ErrorNotice } from "../../components/product/UI.jsx";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import "./AdminOverview.css";
import OrderPerformance from "../../components/product/OrderPerformance.jsx";

const number = (value) => Number(value || 0).toLocaleString("en-IN");
const shortDate = (value) =>
  new Date(value + "T12:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
// The report follows the operating timezone, not a travelling admin's device.
function reportRange(days) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (name) => parts.find((entry) => entry.type === name).value;
  const end = new Date(
    part("year") + "-" + part("month") + "-" + part("day") + "T00:00:00Z",
  );
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function Change({ value, days }) {
  if (value == null)
    return (
      <span className="overview-comparison neutral">
        No previous-period baseline
      </span>
    );
  const Icon =
    value < 0 ? ArrowDownRight : value > 0 ? ArrowUpRight : ArrowRight;
  return (
    <span
      className={
        "overview-comparison " +
        (value < 0 ? "down" : value > 0 ? "up" : "neutral")
      }
    >
      <Icon size={13} />
      {Math.abs(value)}% <small>vs previous {days} days</small>
    </span>
  );
}

function exportReport(report) {
  const rows = [
    [
      "Date",
      "Placed orders",
      "Delivered orders",
      "Cancelled orders",
      "Delivered order value INR",
    ],
    ...report.daily.map((day) => [
      day.date,
      day.placed_orders,
      day.orders,
      day.cancelled,
      day.gross_order_value,
    ]),
  ];
  const url = URL.createObjectURL(
    new Blob([rows.map((row) => row.join(",")).join("\r\n")], {
      type: "text/csv;charset=utf-8",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download =
    "ruchigo-overview-" +
    report.period.start +
    "-" +
    report.period.end +
    ".csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AdminOverview() {
  const { token, user } = useAuth();
  const [days, setDays] = useState(7);
  const range = reportRange(days);
  const remote = useRemote("/analytics/", token, 30000);
  const report = useRemote(
    "/insights/?" + new URLSearchParams(range),
    token,
    60000,
  );
  const data = remote.data;
  const summary = report.data?.summary;
  const change = report.data?.comparison.change_percent;
  const count = (status) =>
    data?.orders.find((row) => row.status === status)?.count || 0;
  const active = (data?.orders || [])
    .filter(
      (row) =>
        !["delivered", "cancelled", "awaiting_payment"].includes(row.status),
    )
    .reduce((sum, row) => sum + row.count, 0);
  const roleCount = (role) =>
    data?.users.find((row) => row.role === role)?.count || 0;
  const pendingPartners = data
    ? data.restaurants.total - data.restaurants.approved
    : 0;
  const canOrders = hasAdminScope(user, "orders");
  const flow = [
    ["pending", "Awaiting confirmation", Clock3],
    ["confirmed", "Accepted by kitchen", Check],
    ["preparing", "Preparing food", ChefHat],
    ["ready", "Ready for pickup", ShoppingBag],
    ["assigned", "Rider assigned", Bike],
    ["out_for_delivery", "On the way", ArrowUpRight],
  ];
  const metrics = [
    {
      label: "Orders placed",
      value: number(summary?.orders),
      change: change?.orders,
      icon: ShoppingBag,
      tone: "orange",
      note: "All orders in selected period",
    },
    {
      label: "Delivered order value",
      value: money(summary?.gross_order_value),
      change: change?.gross_order_value,
      icon: CreditCard,
      tone: "green",
      note: "Gross order value · not platform profit",
    },
    {
      label: "Average order value",
      value: money(summary?.average_order_value),
      change: change?.average_order_value,
      icon: TrendingUp,
      tone: "blue",
      note: "Across delivered orders",
    },
    {
      label: "Cancellation rate",
      value: (summary?.cancellation_rate ?? 0) + "%",
      icon: XCircle,
      tone: "rose",
      note:
        number(summary?.cancelled) +
        " of " +
        number(summary?.orders) +
        " placed orders",
      extra: number(summary?.delivered) + " orders delivered",
    },
  ];
  return (
    <WorkspaceFrame
      type="admin"
      className="admin-overview-workspace"
      title="Platform overview"
      description="Marketplace performance, live order operations and partner activity."
      action={
        <button
          className="btn secondary overview-refresh"
          aria-label="Refresh overview"
          disabled={remote.loading || report.loading}
          onClick={() => {
            remote.reload();
            report.reload();
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      }
    >
      <div className="admin-overview">
        <div className="overview-toolbar">
          <div className="overview-date">
            <CalendarDays size={16} />
            <span>
              {shortDate(range.start)} – {shortDate(range.end)}
              <small>IST · completed days</small>
            </span>
          </div>
          <div className="overview-toolbar-actions">
            <div
              className="overview-range"
              role="group"
              aria-label="Overview date range"
            >
              {[7, 30, 90].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={days === value}
                  onClick={() => setDays(value)}
                >
                  {value} days
                </button>
              ))}
            </div>
            <button
              className="overview-export"
              disabled={!report.data || Boolean(report.error)}
              onClick={() => exportReport(report.data)}
            >
              <Download size={15} />
              Export<span className="sr-only"> overview CSV</span>
            </button>
          </div>
        </div>
        <ErrorNotice error={remote.error} onRetry={remote.reload} />
        <ErrorNotice error={report.error} onRetry={report.reload} />
        {remote.loading && (
          <LoadingScreen inline message="Loading platform activity…" />
        )}
        {data && (
          <section
            className="overview-pulse"
            aria-label="Current operations snapshot"
          >
            <div className="overview-pulse-heading">
              <span
                className={"overview-sync" + (remote.error ? " stale" : "")}
              >
                <i />
                {remote.error
                  ? "Last available snapshot"
                  : "LIVE OPERATIONS · 30s refresh"}
              </span>
              <h2>
                <strong>{number(active)}</strong> orders in progress
              </h2>
              {canOrders && (
                <Link to="/admin-orders">
                  Open order operations <ArrowUpRight size={16} />
                </Link>
              )}
            </div>
            <div className="overview-pulse-stats">
              <div>
                <span className="overview-pulse-icon">
                  <Clock3 size={21} />
                </span>
                <strong>{number(count("pending"))}</strong>
                <span>Awaiting confirmation</span>
              </div>
              <div>
                <span className="overview-pulse-icon">
                  <ChefHat size={21} />
                </span>
                <strong>{number(count("preparing"))}</strong>
                <span>In the kitchen</span>
              </div>
              <div>
                <span className="overview-pulse-icon">
                  <Bike size={21} />
                </span>
                <strong>{number(count("out_for_delivery"))}</strong>
                <span>On the way</span>
              </div>
            </div>
          </section>
        )}
        <div className="overview-metrics" aria-busy={report.loading}>
          {metrics.map(
            ({
              label,
              value,
              change: difference,
              icon: Icon,
              tone,
              note,
              extra,
            }) => (
              <article key={label} className={"overview-metric " + tone}>
                <div className="overview-metric-top">
                  <span>{label}</span>
                  <span className="overview-metric-icon">
                    <Icon size={18} />
                  </span>
                </div>
                <strong>{report.data ? value : "—"}</strong>
                <p>
                  {report.data
                    ? note
                    : report.error
                      ? "Report unavailable"
                      : "Loading report…"}
                </p>
                <div className="overview-metric-footer">
                  {extra && report.data ? (
                    <span className="overview-comparison neutral">
                      <CircleCheck size={13} />
                      {extra}
                    </span>
                  ) : report.data ? (
                    <Change value={difference} days={days} />
                  ) : (
                    <span className="overview-comparison neutral">
                      Selected reporting period
                    </span>
                  )}
                </div>
              </article>
            ),
          )}
        </div>
        <div className="overview-middle">
          <section
            className="overview-panel overview-trend"
            aria-label="Order performance"
          >
            <div className="overview-section-title">
              <div>
                <h2>Order performance</h2>
                <p>Grouped by placement date · latest delivery status.</p>
              </div>
              <span className="overview-period-chip">Last {days} days</span>
            </div>
            {report.loading && (
              <LoadingScreen inline message="Loading order trends…" />
            )}
            {report.data && (
              <OrderPerformance
                key={range.start + "-" + range.end}
                report={report.data}
              />
            )}
            {!report.data && report.error && (
              <div className="overview-chart-empty">
                <BarChart3 size={28} />
                <strong>Trend unavailable</strong>
                <span>Retry the report above to load your figures.</span>
              </div>
            )}
          </section>
          <section
            className="overview-panel overview-flow"
            aria-label="Order stages"
          >
            <div className="overview-section-title">
              <div>
                <h2>Order flow</h2>
                <p>Current stages · all active orders</p>
              </div>
              <span className="overview-flow-total">
                {data ? number(active) : "—"}
              </span>
            </div>
            <div className="overview-flow-list">
              {flow.map(([status, label, Icon]) => {
                const content = (
                  <>
                    <span className={"overview-stage-icon " + status}>
                      <Icon size={16} />
                    </span>
                    <span>{label}</span>
                    <strong>{data ? number(count(status)) : "—"}</strong>
                    {canOrders && <ArrowUpRight size={13} />}
                  </>
                );
                return canOrders ? (
                  <Link
                    key={status}
                    to={"/admin-orders?status=" + status}
                    aria-label={
                      label +
                      ": " +
                      (data ? count(status) : "loading") +
                      " orders"
                    }
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={status}>{content}</div>
                );
              })}
            </div>
            <p className="overview-flow-note">
              <CreditCard size={14} />
              {data ? number(count("awaiting_payment")) : "—"} awaiting payment
              · excluded above
            </p>
          </section>
        </div>
        {data && (
          <div className="overview-lower">
            <section className="overview-panel overview-orders">
              <div className="overview-section-title">
                <div>
                  <h2>Latest orders</h2>
                  <p>The five most recent orders across the platform.</p>
                </div>
                {canOrders && (
                  <Link to="/admin-orders" className="text-link">
                    View all <ArrowUpRight size={15} />
                  </Link>
                )}
              </div>
              {data.recent_orders.length ? (
                <div className="overview-order-list">
                  <div className="overview-order-labels" aria-hidden="true">
                    <span>Order / customer</span>
                    <span>Restaurant</span>
                    <span>Status</span>
                    <span>Amount</span>
                  </div>
                  {data.recent_orders.map((order) => (
                    <article className="overview-order" key={order.id}>
                      <div className="overview-order-customer">
                        {canOrders ? (
                          <Link
                            to={
                              "/admin-orders?search=" +
                              encodeURIComponent(order.number)
                            }
                            aria-label={"View order " + orderNumber(order)}
                          >
                            #{orderNumber(order)}
                            <ArrowUpRight size={12} />
                          </Link>
                        ) : (
                          <strong>#{orderNumber(order)}</strong>
                        )}
                        <span>
                          {order.customer_detail?.first_name || "Customer"}
                        </span>
                        <time dateTime={order.created_at}>
                          {dateTime(order.created_at)}
                        </time>
                      </div>
                      <div className="overview-order-kitchen">
                        <Store size={15} />
                        <span>{order.restaurant_detail?.name}</span>
                      </div>
                      <div className="overview-order-status">
                        <span className={"status-pill " + order.status}>
                          {statusLabel(order.status)}
                        </span>
                      </div>
                      <strong className="overview-order-total">
                        {money(order.total)}
                      </strong>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="The first order starts here"
                  description="New orders will appear as customers place them. Restaurant teams accept and prepare their own orders."
                />
              )}
            </section>
            <aside className="overview-network-column">
              <section className="overview-panel overview-network">
                <div className="overview-section-title">
                  <div>
                    <h2>Partner network</h2>
                    <p>Restaurant listing approvals</p>
                  </div>
                  <Store size={18} />
                </div>
                <div className="overview-network-summary">
                  <div
                    className="overview-approval-ring"
                    style={{
                      "--approved":
                        (data.restaurants.total
                          ? (data.restaurants.approved /
                              data.restaurants.total) *
                            100
                          : 0) + "%",
                    }}
                  >
                    <div>
                      <strong>{number(data.restaurants.approved)}</strong>
                      <span>approved</span>
                    </div>
                  </div>
                  <div className="overview-network-counts">
                    <p>
                      <i />
                      <span>Approved</span>
                      <strong>{number(data.restaurants.approved)}</strong>
                    </p>
                    <p>
                      <i />
                      <span>Awaiting review</span>
                      <strong>{number(pendingPartners)}</strong>
                    </p>
                    <small>
                      {number(data.restaurants.total)} restaurants in total
                    </small>
                  </div>
                </div>
                {hasAdminScope(user, "partners") && (
                  <Link
                    className="overview-network-action"
                    to="/admin-restaurants"
                  >
                    {pendingPartners
                      ? "Review restaurant listings"
                      : "Manage restaurant partners"}
                    <ArrowRight size={16} />
                  </Link>
                )}
                <div className="overview-community">
                  <div>
                    <Users size={16} />
                    <strong>{number(roleCount("customer"))}</strong>
                    <span>Customers</span>
                  </div>
                  <div>
                    <Bike size={16} />
                    <strong>{number(roleCount("delivery"))}</strong>
                    <span>Registered riders</span>
                  </div>
                </div>
              </section>
              {hasAdminScope(user, "finance") && (
                <Link
                  className="overview-finance-link"
                  to="/admin-payments?tab=refunds"
                >
                  <span>
                    <CreditCard size={21} />
                  </span>
                  <div>
                    <strong>Payments & refunds</strong>
                    <p>Review requests and reconcile payments.</p>
                  </div>
                  <ArrowUpRight size={18} />
                </Link>
              )}
            </aside>
          </div>
        )}
        <div className="overview-bottom">
          <p>
            Restaurant teams accept and prepare orders. Riders handle pickup and
            delivery.
          </p>
          {hasAdminScope(user, "support") && (
            <Link to="/support?view=team" className="text-link">
              Support inbox <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </WorkspaceFrame>
  );
}
