import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  WorkspaceFrame,
  Metrics as WorkspaceMetrics,
} from "../../components/product/Workspace.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { fetchAllPages } from "../../lib/collections.js";

const orderStatuses = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "assigned",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
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

function Notice({ loading, error, empty }) {
  if (loading)
    return (
      <p className="rounded-2xl bg-white p-6 text-gray-500">
        Loading live data…
      </p>
    );
  if (error)
    return <p className="rounded-2xl bg-red-50 p-6 text-red-700">{error}</p>;
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
  const { data, loading, error } = useAnalytics();
  const totalUsers =
    data?.users?.reduce((sum, item) => sum + item.count, 0) || 0;
  const totalOrders =
    data?.orders?.reduce((sum, item) => sum + item.count, 0) || 0;
  const paid = data?.payments?.find((item) => item.status === "paid");
  return (
    <AdminFrame
      title="Platform dashboard"
      subtitle="Live platform totals and the newest orders."
    >
      <Notice loading={loading} error={error} />
      {data && (
        <>
          <Metrics
            entries={[
              ["Users", totalUsers],
              ["Restaurants", data.restaurants.total],
              ["Orders", totalOrders],
              ["Paid volume", money(paid?.amount)],
            ]}
          />
          <div className="workspace-quicklinks">
            <Link to="/admin-restaurants">
              <div>
                <strong>
                  {data.restaurants.total - data.restaurants.approved}{" "}
                  restaurants awaiting approval
                </strong>
                <span>Review restaurant profiles and catalog access.</span>
              </div>
            </Link>
            <Link to="/support">
              <div>
                <strong>Customer & partner support</strong>
                <span>Read requests, reply and track resolution.</span>
              </div>
            </Link>
            <Link to="/admin-reviews">
              <div>
                <strong>Reviews & platform activity</strong>
                <span>Moderate transparently with recorded reasons.</span>
              </div>
            </Link>
          </div>
          <section className="panel overflow-x-auto">
            <h2 className="text-xl font-bold">Recent orders</h2>
            <table className="mt-5 w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3">Order</th>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100">
                    <td className="py-4 font-medium">
                      #{String(order.number).slice(0, 8)}
                    </td>
                    <td>{order.customer_detail?.email}</td>
                    <td>{order.restaurant_detail?.name}</td>
                    <td className="capitalize">{label(order.status)}</td>
                    <td>{money(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.recent_orders.length && (
              <p className="mt-5 text-gray-500">No orders yet.</p>
            )}
          </section>
        </>
      )}
    </AdminFrame>
  );
}

export function AdminRestaurants() {
  const { token } = useAuth();
  const [approving, setApproving] = useState(null);
  const { records, loading, error, reload } = useCollection(
    "/restaurants/?ordering=-created_at",
  );
  const [query, setQuery] = useState("");
  const approve = async (restaurant) => {
    if (
      !window.confirm(
        `Approve ${restaurant.name} to appear in the customer catalog?`,
      )
    )
      return;
    setApproving(restaurant.id);
    try {
      await apiRequest(`/restaurants/${restaurant.id}/approve/`, {
        token,
        method: "POST",
      });
      toast.success("Restaurant approved.");
      reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setApproving(null);
    }
  };
  const visible = useMemo(
    () =>
      records.filter((item) =>
        `${item.name} ${item.city} ${item.email}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [records, query],
  );
  const toggleOpen = useCallback(
    async (restaurant) => {
      try {
        await apiRequest(`/restaurants/${restaurant.id}/`, {
          token,
          method: "PATCH",
          body: { is_open: !restaurant.is_open },
        });
        toast.success("Restaurant status updated.");
        reload();
      } catch (requestError) {
        toast.error(requestError.message);
      }
    },
    [reload, token],
  );
  return (
    <AdminFrame
      title="Restaurants"
      subtitle="Review live restaurant profiles and availability."
    >
      <Metrics
        entries={[
          ["Total", records.length],
          ["Approved", records.filter((item) => item.is_approved).length],
          [
            "Open",
            records.filter((item) => item.is_open && item.is_approved).length,
          ],
          ["Pending", records.filter((item) => !item.is_approved).length],
        ]}
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search restaurants"
        className="mt-6 w-full rounded-2xl border border-orange-100 bg-white px-5 py-4 outline-none"
      />
      <Notice
        loading={loading}
        error={error}
        empty={!loading && !visible.length}
      />
      {!!visible.length && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {visible.map((restaurant) => (
            <article
              key={restaurant.id}
              className="rounded-3xl border border-orange-100 bg-white p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{restaurant.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {restaurant.city} · {restaurant.email || "No public email"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${restaurant.is_approved ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}
                >
                  {restaurant.is_approved ? "Approved" : "Pending"}
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-600">{restaurant.address}</p>
              <button
                onClick={() => toggleOpen(restaurant)}
                className="mt-5 rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600"
              >
                Mark {restaurant.is_open ? "closed" : "open"}
              </button>
              {!restaurant.is_approved && (
                <button
                  className="btn primary ml-3 mt-5"
                  disabled={approving === restaurant.id}
                  onClick={() => approve(restaurant)}
                >
                  {approving === restaurant.id
                    ? "Approving…"
                    : "Approve restaurant"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </AdminFrame>
  );
}

export function AdminDeliveryPartners() {
  const { token } = useAuth();
  const { records, loading, error, reload } = useCollection(
    "/users/?role=delivery",
  );
  const mutate = useCallback(
    async (user, action) => {
      try {
        await apiRequest(`/users/${user.id}/${action}/`, {
          token,
          method: "POST",
        });
        toast.success("Delivery partner updated.");
        reload();
      } catch (requestError) {
        toast.error(requestError.message);
      }
    },
    [reload, token],
  );
  return (
    <AdminFrame
      title="Delivery partners"
      subtitle="Approve or block delivery accounts using live account data."
    >
      <Metrics
        entries={[
          ["Total", records.length],
          ["Active", records.filter((item) => item.is_active).length],
          [
            "Pending / blocked",
            records.filter((item) => !item.is_active).length,
          ],
          [
            "Available",
            records.filter((item) => item.is_active && item.is_available)
              .length,
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
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3">Partner</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="py-4">
                    <p className="font-semibold">
                      {`${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                        user.email}
                    </p>
                    <p className="text-gray-500">{user.email}</p>
                  </td>
                  <td>{user.phone || "—"}</td>
                  <td>{user.is_active ? "Active" : "Inactive"}</td>
                  <td>{date(user.created_at)}</td>
                  <td>
                    <button
                      onClick={() =>
                        mutate(user, user.is_active ? "block" : "approve")
                      }
                      className="rounded-lg bg-orange-50 px-3 py-2 font-semibold text-orange-700"
                    >
                      {user.is_active ? "Block" : "Approve"}
                    </button>
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

export function AdminOrders() {
  const { token } = useAuth();
  const { records, loading, error, reload } = useCollection("/orders/");
  const update = useCallback(
    async (order, nextStatus) => {
      try {
        await apiRequest(`/orders/${order.id}/status/`, {
          token,
          method: "POST",
          body: { status: nextStatus },
        });
        toast.success("Order status updated.");
        reload();
      } catch (requestError) {
        toast.error(requestError.message);
      }
    },
    [reload, token],
  );
  return (
    <AdminFrame
      title="Orders"
      subtitle="Inspect and correct live order states."
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
                    <select
                      value={order.status}
                      onChange={(event) => update(order, event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 capitalize"
                    >
                      {orderStatuses.map((value) => (
                        <option key={value} value={value}>
                          {label(value)}
                        </option>
                      ))}
                    </select>
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
  const { records, loading, error } = useCollection("/payments/");
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
                  <td className="capitalize">{payment.status}</td>
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
      subtitle="Current aggregate platform data; no placeholder forecasts."
    >
      <Notice loading={loading} error={error} />
      {data && (
        <>
          <Metrics
            entries={[
              ["Active users", data.active_users],
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
