import { useState } from "react";
import LoadingScreen from "../components/common/LoadingScreen.jsx";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { hasAdminScope } from "../lib/adminAccess.js";
import { dateTime, money, useRemote } from "../lib/product.js";
import { Metrics, WorkspaceFrame } from "../components/product/Workspace.jsx";
import { EmptyState, ErrorNotice } from "../components/product/UI.jsx";
import RefundStatus from "../components/product/RefundStatus.jsx";
import MerchantFinance from "../components/product/MerchantFinance.jsx";
import "../components/product/Operations.css";

export default function LedgerWorkspace() {
  const { token, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabs =
    role === "admin"
      ? [
          ["payments", "Payments"],
          ["earnings", "Restaurant earnings"],
          ["refunds", "Refund reviews"],
        ]
      : [
          ["earnings", "Earnings"],
          ["payments", "Payments"],
        ];
  const tab = tabs.some(([value]) => value === searchParams.get("tab"))
    ? searchParams.get("tab")
    : tabs[0][0];
  const [filters, setFilters] = useState({
    status: "",
    method: "",
    reconciliation_required: "",
    recorded_after: "",
    recorded_before: "",
    page: 1,
  });
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value !== ""),
  );
  const ledger = useRemote(
    tab === "payments" ? `/payments/?${params}` : null,
    token,
    15000,
  );
  const statsParams = new URLSearchParams(params);
  statsParams.delete("page");
  const stats = useRemote(
    tab === "payments" ? `/payments/summary/?${statsParams}` : null,
    token,
    15000,
  );
  const setFilter = (name, value) =>
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  const paid = stats.data?.by_status.find((row) => row.status === "paid");
  const pending = stats.data?.by_status.find((row) => row.status === "pending");
  return (
    <WorkspaceFrame
      type={role === "admin" ? "admin" : "restaurant"}
      title={
        role === "admin"
          ? "Payments & restaurant finance"
          : "Earnings & payments"
      }
      description="Collected payments, restaurant earnings and settlement records, clearly separated."
    >
      <div
        className="finance-workspace-tabs"
        role="tablist"
        aria-label="Finance workspace"
      >
        {tabs.map(([value, label]) => (
          <button
            role="tab"
            id={`finance-tab-${value}`}
            aria-controls="finance-workspace-content"
            aria-selected={tab === value}
            key={value}
            onClick={() => setSearchParams({ tab: value })}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        id="finance-workspace-content"
        role="tabpanel"
        aria-labelledby={`finance-tab-${tab}`}
      >
        {tab === "payments" && (
          <>
            <Metrics
              entries={[
                ["Matching payments", stats.data?.total ?? "—"],
                ["Paid-status value", stats.data ? money(paid?.amount) : "—"],
                ["Pending payments", stats.data ? pending?.count || 0 : "—"],
                ["Needs reconciliation", stats.data?.needs_review ?? "—"],
              ]}
            />
            <section className="panel finance-payment-panel">
              <h2>Payment records</h2>
              <details className="finance-filter-panel">
                <summary>
                  Filter payments
                  {Object.entries(filters).filter(
                    ([key, value]) => key !== "page" && value !== "",
                  ).length > 0
                    ? " · Filters applied"
                    : ""}
                </summary>
                <div className="people-toolbar">
                  <label>
                    Status
                    <select
                      aria-label="Payment status filter"
                      value={filters.status}
                      onChange={(event) =>
                        setFilter("status", event.target.value)
                      }
                    >
                      <option value="">All statuses</option>
                      {["pending", "paid", "failed", "refunded"].map(
                        (value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label>
                    Method
                    <select
                      aria-label="Payment method filter"
                      value={filters.method}
                      onChange={(event) =>
                        setFilter("method", event.target.value)
                      }
                    >
                      <option value="">All methods</option>
                      <option value="cod">Cash on delivery</option>
                      <option value="razorpay">Online</option>
                    </select>
                  </label>
                  <label>
                    Review
                    <select
                      aria-label="Payment review filter"
                      value={filters.reconciliation_required}
                      onChange={(event) =>
                        setFilter("reconciliation_required", event.target.value)
                      }
                    >
                      <option value="">All payments</option>
                      <option value="true">Needs reconciliation</option>
                    </select>
                  </label>
                  <div className="report-dates">
                    <label>
                      From
                      <input
                        type="date"
                        aria-label="Payment start date"
                        value={filters.recorded_after}
                        onChange={(event) =>
                          setFilter("recorded_after", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      To
                      <input
                        type="date"
                        aria-label="Payment end date"
                        value={filters.recorded_before}
                        onChange={(event) =>
                          setFilter("recorded_before", event.target.value)
                        }
                      />
                    </label>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-link"
                  onClick={() =>
                    setFilters({
                      status: "",
                      method: "",
                      reconciliation_required: "",
                      recorded_after: "",
                      recorded_before: "",
                      page: 1,
                    })
                  }
                >
                  Reset filters
                </button>
              </details>
              <p className="finance-payment-hint">
                Collected payments only. Earnings and refunds have their own
                tabs.
              </p>
              <details className="finance-definition">
                <summary>How these totals work</summary>
                <p>
                  Totals match the selected filters and include every matching
                  record, not just this page. Order values are not platform
                  revenue, partner earnings or settlements. Partial refunds do
                  not automatically change a payment’s status to fully refunded.
                </p>
              </details>
              <ErrorNotice
                error={ledger.error || stats.error}
                onRetry={() => {
                  ledger.reload();
                  stats.reload();
                }}
              />
              {ledger.loading && (
                <LoadingScreen inline message="Loading payments…" />
              )}
              {!ledger.loading &&
                !ledger.error &&
                !ledger.data?.results.length && (
                  <EmptyState
                    title="No matching payments"
                    description="Try another status, method or date range."
                  />
                )}
              {!!ledger.data?.results.length && (
                <>
                  <div className="people-table-wrap payment-desktop-table">
                    <table className="people-table">
                      <caption>
                        {ledger.data.count} matching payments · Page{" "}
                        {filters.page}
                      </caption>
                      <thead>
                        <tr>
                          <th>Payment</th>
                          <th>Order</th>
                          <th>Method</th>
                          <th>Status</th>
                          <th>Amount</th>
                          <th>Recorded</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.data.results.map((payment) => (
                          <tr key={payment.id}>
                            <td>#{payment.id}</td>
                            <td>#{payment.order}</td>
                            <td>
                              {payment.method === "cod"
                                ? "Cash on delivery"
                                : "Online"}
                            </td>
                            <td>
                              <span className="status-pill">
                                {payment.status}
                              </span>
                              {payment.reconciliation_required && (
                                <p className="form-help">
                                  Needs reconciliation
                                </p>
                              )}
                            </td>
                            <td>{money(payment.amount)}</td>
                            <td>{dateTime(payment.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div
                    className="payment-mobile-records"
                    aria-label="Payment records"
                  >
                    {ledger.data.results.map((payment) => (
                      <article key={payment.id}>
                        <div>
                          <strong>Order #{payment.order}</strong>
                          <b>{money(payment.amount)}</b>
                        </div>
                        <p>
                          {payment.method === "cod"
                            ? "Cash on delivery"
                            : "Online payment"}{" "}
                          · Payment #{payment.id}
                        </p>
                        <footer>
                          <span className="status-pill">{payment.status}</span>
                          <time>{dateTime(payment.created_at)}</time>
                        </footer>
                        {payment.reconciliation_required && (
                          <p className="form-help">Needs reconciliation</p>
                        )}
                      </article>
                    ))}
                  </div>
                </>
              )}
              {(ledger.data?.next || filters.page > 1) && (
                <div className="people-pagination">
                  <button
                    className="btn secondary"
                    disabled={filters.page === 1 || ledger.loading}
                    onClick={() =>
                      setFilters({ ...filters, page: filters.page - 1 })
                    }
                  >
                    Previous payments
                  </button>
                  <span>Page {filters.page}</span>
                  <button
                    className="btn secondary"
                    disabled={!ledger.data?.next || ledger.loading}
                    onClick={() =>
                      setFilters({ ...filters, page: filters.page + 1 })
                    }
                  >
                    Next payments
                  </button>
                </div>
              )}
            </section>
          </>
        )}
        {tab === "earnings" && <MerchantFinance />}
        {tab === "refunds" && role === "admin" && <RefundQueue />}
      </div>
    </WorkspaceFrame>
  );
}

function RefundQueue() {
  const { token, user } = useAuth();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const remote = useRemote(
    `/refund-requests/?page=${page}${status ? `&status=${status}` : ""}`,
    token,
    15000,
  );
  return (
    <section className="panel mt-6">
      <div className="section-title">
        <div>
          <p className="eyebrow">FINANCE OPERATIONS</p>
          <h2>Refund reviews</h2>
        </div>
      </div>
      <div className="people-toolbar">
        <label>
          Queue
          <select
            aria-label="Refund status filter"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All requests</option>
            {[
              "requested",
              "reviewing",
              "approved",
              "processing",
              "processed",
              "failed",
              "rejected",
            ].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <span className="muted">
          {remote.data?.count ?? "—"} matching requests
        </span>
      </div>
      <p className="muted">
        Review requests, approve an exact amount and explicitly submit approved
        refunds to the original payment method. Approval is not confirmation
        that money has returned.
      </p>
      <ErrorNotice error={remote.error} onRetry={remote.reload} />
      {remote.loading && (
        <LoadingScreen inline message="Loading refund requests…" />
      )}
      {remote.data?.results.map((refund) => (
        <details key={refund.id} className="refund-queue-item">
          <summary>
            Order #{refund.order} ·{" "}
            {money(refund.approved_amount || refund.requested_amount)} ·{" "}
            {refund.status}
          </summary>
          <RefundStatus refund={refund} onUpdated={remote.reload} />
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
      {!remote.loading && !remote.error && !remote.data?.results.length && (
        <p className="muted mt-5">No requests in this queue.</p>
      )}
      <div className="people-pagination">
        <button
          className="btn secondary"
          disabled={page === 1 || remote.loading}
          onClick={() => setPage(page - 1)}
        >
          Previous requests
        </button>
        <span>Page {page}</span>
        <button
          className="btn secondary"
          disabled={!remote.data?.next || remote.loading}
          onClick={() => setPage(page + 1)}
        >
          Next requests
        </button>
      </div>
    </section>
  );
}
