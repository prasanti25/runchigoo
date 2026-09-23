import {
  ArrowUpRight,
  Bike,
  CreditCard,
  RefreshCw,
  ShoppingBag,
  Store,
  Users,
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

export default function AdminOverview() {
  const { token, user } = useAuth();
  const remote = useRemote("/analytics/", token, 30000);
  const data = remote.data;
  const count = (status) =>
    data?.orders.find((row) => row.status === status)?.count || 0;
  const orders = data?.orders.reduce((sum, row) => sum + row.count, 0) || 0;
  const active = (data?.orders || [])
    .filter(
      (row) =>
        !["delivered", "cancelled", "awaiting_payment"].includes(row.status),
    )
    .reduce((sum, row) => sum + row.count, 0);
  const paid = data?.payments.find((row) => row.status === "paid");
  const cards = [
    [
      "Registered people",
      data?.users.reduce((sum, row) => sum + row.count, 0),
      "Customer and partner accounts",
      Users,
    ],
    ["Orders placed", orders, "All-time order count", ShoppingBag],
    [
      "Active orders",
      active,
      "Accepted payments / cash orders in progress",
      Bike,
    ],
    [
      "Paid-status volume",
      money(paid?.amount),
      "Payment records, before partial refunds",
      CreditCard,
    ],
  ];
  const actions = [
    {
      scope: "orders",
      path: "/admin-orders",
      title: "Order operations",
      detail: `${active} active · ${count("ready")} ready for pickup`,
      icon: ShoppingBag,
    },
    {
      scope: "partners",
      path: "/admin-restaurants",
      title: "Restaurant partners",
      detail: `${data ? data.restaurants.total - data.restaurants.approved : 0} awaiting listing approval`,
      icon: Store,
    },
    {
      scope: "finance",
      path: "/admin-payments?tab=refunds",
      title: "Payments & refunds",
      detail: "Review requests and reconcile payments",
      icon: CreditCard,
    },
  ].filter((action) => hasAdminScope(user, action.scope));
  return (
    <WorkspaceFrame
      type="admin"
      title="Platform overview"
      description="A clear view of orders, partners and the work that needs you."
      action={
        <button
          className="btn secondary overview-refresh"
          disabled={remote.loading}
          onClick={remote.reload}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      }
    >
      <ErrorNotice error={remote.error} onRetry={remote.reload} />
      {remote.loading && (
        <LoadingScreen inline message="Loading platform activity…" />
      )}
      {data && (
        <div className="admin-overview">
          <div className="overview-metrics">
            {cards.map(([label, value, note, Icon]) => (
              <article key={label}>
                <div>
                  <span>{label}</span>
                  <Icon size={18} />
                </div>
                <strong>{value}</strong>
                <p>{note}</p>
              </article>
            ))}
          </div>
          <div className="overview-section-title">
            <div>
              <p className="eyebrow">OPERATIONS</p>
              <h2>Your next steps</h2>
            </div>
            <span className="overview-refresh-note">
              Updates every 30 seconds while open
            </span>
          </div>
          <div className="overview-actions">
            {actions.map(({ path, title, detail, icon: Icon }) => (
              <Link to={path} key={path}>
                <span className="overview-action-icon">
                  <Icon size={21} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{detail}</p>
                </div>
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
          <section className="panel overview-orders">
            <div className="overview-section-title">
              <div>
                <h2>Latest orders</h2>
                <p>The five most recent orders across the platform.</p>
              </div>
              {hasAdminScope(user, "orders") && (
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
                      <strong>#{orderNumber(order)}</strong>
                      <span>
                        {order.customer_detail?.first_name || "Customer"}
                      </span>
                      <time>{dateTime(order.created_at)}</time>
                    </div>
                    <div className="overview-order-kitchen">
                      <Store size={15} />
                      <span>{order.restaurant_detail?.name}</span>
                    </div>
                    <div className="overview-order-status">
                      <span className={`status-pill ${order.status}`}>
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
          <div className="overview-bottom">
            <p>
              Restaurant teams handle acceptance and cooking. Delivery partners
              handle pickup and delivery.
            </p>
            {hasAdminScope(user, "support") && (
              <Link to="/support?view=team" className="text-link">
                Open support inbox <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
        </div>
      )}
    </WorkspaceFrame>
  );
}
