import { useEffect, useState } from "react";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import BusinessInsights from "../../components/product/BusinessInsights.jsx";
import OrderOperations from "../../components/product/OrderOperations.jsx";
import RefundStatus from "../../components/product/RefundStatus.jsx";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  LayoutDashboard,
  ShieldCheck,
  Search,
  Store,
  MapPin,
  Bike,
} from "lucide-react";
import { Modal, ErrorNotice } from "../../components/product/UI.jsx";
import toast from "react-hot-toast";
import {
  WorkspaceFrame,
  Metrics as WorkspaceMetrics,
} from "../../components/product/Workspace.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { fetchAllPages } from "../../lib/collections.js";
import { canOpenAdminRoute, hasAdminScope } from "../../lib/adminAccess.js";
import AdminOverview from "./AdminOverview.jsx";
import { workspaceMenus } from "../../lib/workspaceNavigation.js";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const date = (value) => (value ? new Date(value).toLocaleString() : "—");
const label = (value) => String(value || "—").replaceAll("_", " ");

function AdminFrame({ title, subtitle, children }) {
  return (
    <WorkspaceFrame type="admin" title={title} description={subtitle}>
      {children}
    </WorkspaceFrame>
  );
}

function Notice({ loading, error, empty, onRetry }) {
  if (loading)
    return <LoadingScreen inline message="Loading your workspace…" />;
  if (error) return <ErrorNotice error={error} onRetry={onRetry} />;
  if (empty)
    return (
      <p className="rounded-2xl bg-white p-6 text-gray-500">
        No records found.
      </p>
    );
  return null;
}

function Metrics({ entries }) {
  return <WorkspaceMetrics entries={entries} />;
}

function useCollection(path) {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    fetchAllPages(path, { token })
      .then((items) => {
        if (active) setRecords(items);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, token, version]);
  return {
    records,
    loading,
    error,
    reload: () => {
      setLoading(true);
      setError("");
      setVersion((value) => value + 1);
    },
  };
}

function useAnalytics() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    apiRequest("/analytics/", { token })
      .then(setData)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [token]);
  return { data, loading, error };
}

export function AdminDashboard() {
  const { user } = useAuth();
  if (hasAdminScope(user, "reports")) return <AdminOverview />;
  const links = [
    ["/admin-orders", "Order operations"],
    ["/support", "Support conversations"],
    ["/admin-users", "Manage accounts"],
    ["/admin-restaurants", "Restaurant partners"],
    ["/admin-delivery-partners", "Delivery partners"],
    ["/admin-partner-accounts", "Partner account access"],
    ["/admin-payments", "Payments & refunds"],
    ["/admin-offers", "Offers & coupons"],
    ["/admin-catalog", "Food categories"],
    ["/admin-reviews", "Review moderation"],
    ["/admin-delivery-zones", "Delivery areas"],
    ["/admin-order-policy", "Order policies"],
    ["/admin-activity", "Activity log"],
  ].filter(([path]) => canOpenAdminRoute(user, path));
  return (
    <WorkspaceFrame
      type="admin"
      className="admin-overview-workspace"
      title="Your operations workspace"
      description="Your team, your responsibilities, one place to get to work."
    >
      <section className="overview-access-intro">
        <span>
          <ShieldCheck size={26} />
        </span>
        <div>
          <p>YOUR ASSIGNED ACCESS</p>
          <h2>{links.length} operational workspaces</h2>
          <p>
            Your shortcuts reflect the permissions assigned to your account.
          </p>
        </div>
      </section>
      <div className="overview-access-grid">
        {links.map(([path, title]) => {
          const Icon =
            workspaceMenus.admin.find(
              ([key]) => `/admin-${key}` === path,
            )?.[2] || LayoutDashboard;
          return (
            <Link
              key={path}
              to={path === "/support" ? "/support?view=team" : path}
            >
              <span>
                <Icon size={23} />
              </span>
              <div>
                <strong>{title}</strong>
                <span>Open workspace</span>
              </div>
              <ArrowUpRight size={17} />
            </Link>
          );
        })}
      </div>
      {!links.length && (
        <section className="panel">
          <h2>Waiting for workspace access</h2>
          <p className="muted">
            Your account is active. Ask a superuser to assign the workspaces you
            need.
          </p>
        </section>
      )}
    </WorkspaceFrame>
  );
}

export function AdminRestaurants() {
  const { token } = useAuth();
  const { records, loading, error, reload } = useCollection(
    "/restaurants/?ordering=-created_at",
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const visible = records.filter(
    (item) =>
      (item.name + " " + item.city + " " + (item.email || ""))
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" ||
        (filter === "pending" && !item.is_approved) ||
        (filter === "approved" && item.is_approved) ||
        (filter === "open" && item.is_open && item.is_approved)),
  );
  const value = (count) => (loading || error ? "—" : count);
  async function confirm() {
    setBusy(true);
    try {
      const approving = selected.action === "approve";
      await apiRequest(
        "/restaurants/" +
          selected.restaurant.id +
          (approving ? "/approve/" : "/"),
        {
          token,
          method: approving ? "POST" : "PATCH",
          ...(approving
            ? {}
            : { body: { is_open: !selected.restaurant.is_open } }),
        },
      );
      toast.success(
        approving ? "Restaurant approved." : "Restaurant availability updated.",
      );
      setSelected(null);
      reload();
    } catch (failure) {
      toast.error(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AdminFrame
      title="Restaurants"
      subtitle="Manage marketplace listings, review approvals and control availability."
    >
      <Metrics
        entries={[
          ["Restaurant listings", value(records.length)],
          [
            "Approved",
            value(records.filter((item) => item.is_approved).length),
          ],
          [
            "Marked open",
            value(
              records.filter((item) => item.is_open && item.is_approved).length,
            ),
          ],
          [
            "Awaiting review",
            value(records.filter((item) => !item.is_approved).length),
          ],
        ]}
      />
      <section className="panel admin-directory">
        <div className="admin-directory-heading">
          <div>
            <h2>Restaurant directory</h2>
            <p>Listing status and operating availability in one place.</p>
          </div>
          <span>{value(visible.length)} matching</span>
        </div>
        <div className="admin-directory-tools">
          <label className="admin-directory-search">
            <Search size={17} />
            <input
              aria-label="Search restaurants"
              placeholder="Search by restaurant, city or email"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Restaurant listing filter</span>
            <select
              aria-label="Restaurant listing filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All listings</option>
              <option value="approved">Approved</option>
              <option value="pending">Awaiting review</option>
              <option value="open">Marked open</option>
            </select>
          </label>
        </div>
        <Notice
          loading={loading}
          error={error}
          onRetry={reload}
          empty={!loading && !visible.length}
        />
        <div className="admin-restaurant-grid">
          {visible.map((restaurant) => (
            <article className="admin-restaurant-card" key={restaurant.id}>
              <header>
                <span className="admin-partner-symbol">
                  <Store size={22} />
                </span>
                <div>
                  <h3>{restaurant.name}</h3>
                  <p>
                    <MapPin size={12} />
                    {restaurant.city || "City not supplied"}
                  </p>
                </div>
                <span
                  className={
                    "status-pill " +
                    (restaurant.is_approved ? "delivered" : "pending")
                  }
                >
                  {restaurant.is_approved ? "Approved" : "Review"}
                </span>
              </header>
              <dl>
                <div>
                  <dt>Public contact</dt>
                  <dd>{restaurant.email || "Not supplied"}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{restaurant.address || "Not supplied"}</dd>
                </div>
              </dl>
              <footer>
                <span
                  className={
                    "admin-availability " + (restaurant.is_open ? "open" : "")
                  }
                >
                  <i />
                  {restaurant.is_open ? "Marked open" : "Marked closed"}
                </span>
                <div>
                  <button
                    className="btn secondary"
                    disabled={busy}
                    onClick={() =>
                      setSelected({ restaurant, action: "availability" })
                    }
                  >
                    Mark {restaurant.is_open ? "closed" : "open"}
                  </button>
                  {!restaurant.is_approved && (
                    <button
                      className="btn primary"
                      disabled={busy}
                      onClick={() =>
                        setSelected({ restaurant, action: "approve" })
                      }
                    >
                      Review listing
                    </button>
                  )}
                </div>
              </footer>
            </article>
          ))}
        </div>
      </section>
      {selected && (
        <Modal
          title={
            selected.action === "approve"
              ? "Approve restaurant listing?"
              : "Change restaurant availability?"
          }
          onClose={() => !busy && setSelected(null)}
        >
          <p className="muted mt-4">{selected.restaurant.name}</p>
          <p className="form-help mt-4">
            {selected.action === "approve"
              ? "This publishes the listing in the customer marketplace. Confirm the merchant information has been reviewed."
              : "Mark this restaurant " +
                (selected.restaurant.is_open ? "closed" : "open") +
                ". Existing orders keep their current state."}
          </p>
          <div className="admin-confirm-actions">
            <button
              className="btn secondary"
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Keep unchanged
            </button>
            <button className="btn primary" disabled={busy} onClick={confirm}>
              {busy
                ? "Saving…"
                : selected.action === "approve"
                  ? "Approve restaurant"
                  : "Confirm availability"}
            </button>
          </div>
        </Modal>
      )}
    </AdminFrame>
  );
}

export function AdminDeliveryPartners() {
  const { token } = useAuth();
  const { records, loading, error, reload } = useCollection(
    "/users/?role=delivery",
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const name = (person) =>
    [person.first_name, person.last_name].filter(Boolean).join(" ") ||
    person.email;
  const visible = records.filter(
    (person) =>
      (name(person) + " " + person.email + " " + (person.phone || ""))
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" ||
        (filter === "active" && person.is_active) ||
        (filter === "inactive" && !person.is_active) ||
        (filter === "available" && person.is_active && person.is_available)),
  );
  const value = (count) => (loading || error ? "—" : count);
  async function confirm() {
    setBusy(true);
    try {
      await apiRequest(
        "/users/" +
          selected.id +
          (selected.is_active ? "/block/" : "/approve/"),
        { token, method: "POST" },
      );
      toast.success("Delivery partner updated.");
      setSelected(null);
      reload();
    } catch (failure) {
      toast.error(failure.message);
    } finally {
      setBusy(false);
    }
  }
  const action = (person) => (
    <button
      className="btn secondary"
      disabled={busy}
      onClick={() => setSelected(person)}
    >
      {person.is_active ? "Review access" : "Review approval"}
    </button>
  );
  return (
    <AdminFrame
      title="Delivery partners"
      subtitle="Review rider accounts, availability and access without changing active deliveries."
    >
      <Metrics
        entries={[
          ["Registered riders", value(records.length)],
          [
            "Active accounts",
            value(records.filter((person) => person.is_active).length),
          ],
          [
            "Pending / blocked",
            value(records.filter((person) => !person.is_active).length),
          ],
          [
            "Available",
            value(
              records.filter(
                (person) => person.is_active && person.is_available,
              ).length,
            ),
          ],
        ]}
      />
      <section className="panel admin-directory">
        <div className="admin-directory-heading">
          <div>
            <h2>Rider directory</h2>
            <p>Availability is reported by riders, not inferred from GPS.</p>
          </div>
          <span>{value(visible.length)} matching</span>
        </div>
        <div className="admin-directory-tools">
          <label className="admin-directory-search">
            <Search size={17} />
            <input
              aria-label="Search delivery partners"
              placeholder="Search by name, email or phone"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Delivery partner filter</span>
            <select
              aria-label="Delivery partner filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All riders</option>
              <option value="active">Active accounts</option>
              <option value="inactive">Pending / blocked</option>
              <option value="available">Available</option>
            </select>
          </label>
        </div>
        <Notice
          loading={loading}
          error={error}
          onRetry={reload}
          empty={!loading && !visible.length}
        />
        {!!visible.length && (
          <>
            <div className="admin-rider-table">
              <table className="people-table">
                <caption className="sr-only">
                  Matching delivery partners
                </caption>
                <thead>
                  <tr>
                    <th>Delivery partner</th>
                    <th>Contact</th>
                    <th>Account</th>
                    <th>Availability</th>
                    <th>Access</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((person) => (
                    <tr key={person.id}>
                      <td>
                        <div className="admin-rider-identity">
                          <span>
                            <Bike size={20} />
                          </span>
                          <div>
                            <strong>{name(person)}</strong>
                            <small>
                              Joined{" "}
                              {new Date(person.created_at).toLocaleDateString(
                                "en-IN",
                              )}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {person.email}
                        <small className="admin-contact-phone">
                          {person.phone || "No phone supplied"}
                        </small>
                      </td>
                      <td>
                        <span
                          className={
                            "status-pill " +
                            (person.is_active ? "delivered" : "cancelled")
                          }
                        >
                          {person.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {person.is_active && person.is_available
                          ? "Available"
                          : "Offline"}
                      </td>
                      <td>{action(person)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-rider-cards">
              {visible.map((person) => (
                <article key={person.id}>
                  <div className="admin-rider-identity">
                    <span>
                      <Bike size={20} />
                    </span>
                    <div>
                      <strong>{name(person)}</strong>
                      <small>{person.email}</small>
                    </div>
                  </div>
                  <dl>
                    <div>
                      <dt>Phone</dt>
                      <dd>{person.phone || "Not supplied"}</dd>
                    </div>
                    <div>
                      <dt>Account</dt>
                      <dd>{person.is_active ? "Active" : "Inactive"}</dd>
                    </div>
                    <div>
                      <dt>Availability</dt>
                      <dd>
                        {person.is_active && person.is_available
                          ? "Available"
                          : "Offline"}
                      </dd>
                    </div>
                  </dl>
                  {action(person)}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
      {selected && (
        <Modal
          title={
            selected.is_active
              ? "Review rider access"
              : "Approve rider account?"
          }
          onClose={() => !busy && setSelected(null)}
        >
          <p className="muted mt-4">{name(selected)}</p>
          <p className="form-help mt-4">
            {selected.is_active
              ? "Blocking prevents account access. The server checks active assignments and can refuse unsafe account changes."
              : "Confirm this partner is approved to access delivery work. This does not perform KYC verification."}
          </p>
          <div className="admin-confirm-actions">
            <button
              className="btn secondary"
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Keep unchanged
            </button>
            <button className="btn primary" disabled={busy} onClick={confirm}>
              {busy
                ? "Saving…"
                : selected.is_active
                  ? "Block account"
                  : "Approve account"}
            </button>
          </div>
        </Modal>
      )}
    </AdminFrame>
  );
}

export function AdminOrders() {
  const { records, loading, error, reload } = useCollection("/orders/");
  return (
    <AdminFrame
      title="Orders"
      subtitle="Monitor kitchen and rider updates. Handle exceptions through support."
    >
      <Metrics
        entries={[
          ["Total", records.length],
          [
            "Pending",
            records.filter((item) => item.status === "pending").length,
          ],
          [
            "In progress",
            records.filter(
              (item) =>
                !["pending", "delivered", "cancelled"].includes(item.status),
            ).length,
          ],
          [
            "Delivered",
            records.filter((item) => item.status === "delivered").length,
          ],
        ]}
      />
      <Notice
        loading={loading}
        error={error}
        empty={!loading && !records.length}
      />
      {!!records.length && (
        <div className="mt-6 overflow-x-auto rounded-3xl border border-orange-100 bg-white p-6">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3">Order</th>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Total</th>
                <th>Created</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((order) => (
                <tr key={order.id} className="border-b border-gray-100">
                  <td className="py-4 font-semibold">
                    #{String(order.number).slice(0, 8)}
                  </td>
                  <td>{order.customer_detail?.email}</td>
                  <td>{order.restaurant_detail?.name}</td>
                  <td>{money(order.total)}</td>
                  <td>{date(order.created_at)}</td>
                  <td>
                    <span className="status-pill">{label(order.status)}</span>
                    <div className="mt-3">
                      <OrderOperations order={order} onUpdated={reload} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminFrame>
  );
}

export function AdminPayments() {
  const { user } = useAuth();
  const { records, loading, error } = useCollection("/payments/");
  const refunds = useCollection("/refund-requests/");
  const paidTotal = records
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  return (
    <AdminFrame
      title="Payments"
      subtitle="Read-only payment ledger from placed orders."
    >
      <Metrics
        entries={[
          ["Transactions", records.length],
          ["Paid volume", money(paidTotal)],
          [
            "Pending",
            records.filter((item) => item.status === "pending").length,
          ],
          [
            "Refunded",
            records.filter((item) => item.status === "refunded").length,
          ],
        ]}
      />
      <Notice
        loading={loading}
        error={error}
        empty={!loading && !records.length}
      />
      <section className="panel mt-6">
        <h2>Refund reviews</h2>
        <p className="muted mt-2">
          Processed refunds:{" "}
          {money(
            refunds.records
              .filter((row) => row.status === "processed")
              .reduce((sum, row) => sum + Number(row.approved_amount), 0),
          )}
          . Requested and approved amounts are not counted as money returned.
        </p>
        <Notice loading={refunds.loading} error={refunds.error} />
        {refunds.records.map((refund) => (
          <details key={refund.id} className="refund-queue-item">
            <summary>
              Order #{refund.order} ·{" "}
              {money(refund.approved_amount || refund.requested_amount)} ·{" "}
              {label(refund.status)}
            </summary>
            <RefundStatus refund={refund} onUpdated={refunds.reload} />
            {hasAdminScope(user, "support") && (
              <Link
                className="text-link"
                to={`/support?order=${refund.order}&ticket=${refund.ticket}`}
              >
                Open support conversation
              </Link>
            )}
          </details>
        ))}
        {!refunds.loading && !refunds.records.length && (
          <p className="muted mt-4">No refund reviews yet.</p>
        )}
      </section>
      {!!records.length && (
        <div className="mt-6 overflow-x-auto rounded-3xl border border-orange-100 bg-white p-6">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3">Payment</th>
                <th>Order ID</th>
                <th>Method</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {records.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100">
                  <td className="py-4 font-semibold">#{payment.id}</td>
                  <td>#{payment.order}</td>
                  <td className="uppercase">{payment.method}</td>
                  <td className="capitalize">
                    {payment.status}
                    {payment.reconciliation_required && (
                      <Link
                        className="block text-link"
                        to={`/support?order=${payment.order}`}
                      >
                        Needs payment review
                      </Link>
                    )}
                  </td>
                  <td>{money(payment.amount)}</td>
                  <td>{date(payment.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminFrame>
  );
}

export function AdminReports() {
  const { data, loading, error } = useAnalytics();
  const totalRevenue =
    data?.orders
      ?.filter((item) => item.status !== "cancelled")
      .reduce((sum, item) => sum + Number(item.revenue || 0), 0) || 0;
  return (
    <AdminFrame
      title="Reports"
      subtitle="Order performance, customer retention and collected payment breakdowns."
    >
      <BusinessInsights />
      <div className="section-title mt-8">
        <div>
          <h2>All-time platform totals</h2>
          <p className="muted">
            These lifetime totals are separate from the date-filtered report
            above.
          </p>
        </div>
      </div>
      <Notice loading={loading} error={error} />
      {data && (
        <>
          <Metrics
            entries={[
              ["Enabled accounts", data.active_users],
              [
                "Ordering customers · last 30 days",
                data.active_ordering_customers_30d,
              ],
              ["Approved restaurants", data.restaurants.approved],
              ["Non-cancelled order value", money(totalRevenue)],
              ["Order states", data.orders.length],
            ]}
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <section className="rounded-3xl border border-orange-100 bg-white p-6">
              <h2 className="text-xl font-bold">Users by role</h2>
              {data.users.map((item) => (
                <div
                  key={item.role}
                  className="mt-4 flex justify-between capitalize"
                >
                  <span>{item.role}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </section>
            <section className="rounded-3xl border border-orange-100 bg-white p-6">
              <h2 className="text-xl font-bold">Orders by state</h2>
              {data.orders.map((item) => (
                <div
                  key={item.status}
                  className="mt-4 flex justify-between capitalize"
                >
                  <span>{label(item.status)}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </section>
            <section className="rounded-3xl border border-orange-100 bg-white p-6">
              <h2 className="text-xl font-bold">Payments by state</h2>
              {data.payments.map((item) => (
                <div
                  key={item.status}
                  className="mt-4 flex justify-between capitalize"
                >
                  <span>{item.status}</span>
                  <strong>
                    {item.count} · {money(item.amount)}
                  </strong>
                </div>
              ))}
            </section>
          </div>
        </>
      )}
    </AdminFrame>
  );
}
