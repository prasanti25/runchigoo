import { useState } from "react";
import {
  BarChart3,
  MessageSquareText,
  ShieldAlert,
  TrendingUp,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { money, useRemote } from "../../lib/product.js";
import { ErrorNotice, Skeleton } from "./UI.jsx";
import "./Operations.css";
import OrderPerformance from "./OrderPerformance.jsx";
import ResponsiveFilters from "./ResponsiveFilters.jsx";

function ReportDateControls({ admin, children }) {
  return admin ? (
    <ResponsiveFilters title="Custom date range">{children}</ResponsiveFilters>
  ) : (
    children
  );
}

export default function BusinessInsights() {
  const { token, role } = useAuth();
  const [range, setRange] = useState("");
  const [dates, setDates] = useState({ start: "", end: "" });
  const [rangeError, setRangeError] = useState("");
  const report = useRemote(`/insights/${range}`, token);
  const [sentiment, setSentiment] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState("");
  const data = report.data;
  function choosePreset(days) {
    const end = new Date();
    if (days !== 1) end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    const format = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const next = { start: format(start), end: format(end) };
    setDates(next);
    setRange(`?${new URLSearchParams(next)}`);
    setRangeError("");
  }
  function downloadReport() {
    const rows = [
      [
        "Date",
        "Placed orders",
        "Completed orders",
        "Cancelled orders",
        "Completed gross order value INR",
      ],
      ...data.daily.map((day) => [
        day.date,
        day.placed_orders,
        day.orders,
        day.cancelled,
        day.gross_order_value,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ruchigo-report-${data.period.start}-${data.period.end}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="business-insights">
      <div className="section-title">
        <div>
          <p className="eyebrow">FROM YOUR OPERATIONS</p>
          <h2>Patterns worth knowing</h2>
        </div>
        <BarChart3 size={25} />
      </div>
      <div className="report-toolbar">
        <div className="report-presets" aria-label="Report presets">
          {[
            [1, "Today"],
            [7, "7 days"],
            [28, "28 days"],
            [90, "90 days"],
          ].map(([days, label]) => (
            <button
              key={days}
              type="button"
              className="btn secondary"
              onClick={() => choosePreset(days)}
            >
              {label}
            </button>
          ))}
        </div>
        <ReportDateControls admin={["admin", "restaurant"].includes(role)}>
          <form
            className="report-dates"
            onSubmit={(event) => {
              event.preventDefault();
              if (
                !dates.start ||
                !dates.end ||
                dates.end < dates.start ||
                (new Date(dates.end) - new Date(dates.start)) / 86400000 > 89
              ) {
                setRangeError(
                  "Choose both dates, in order, up to 90 days apart.",
                );
                return;
              }
              setRangeError("");
              setRange(`?${new URLSearchParams(dates)}`);
            }}
          >
            <label>
              From
              <input
                aria-label="Report start date"
                type="date"
                required
                value={dates.start}
                onChange={(event) =>
                  setDates({ ...dates, start: event.target.value })
                }
              />
            </label>
            <label>
              To
              <input
                aria-label="Report end date"
                type="date"
                required
                value={dates.end}
                onChange={(event) =>
                  setDates({ ...dates, end: event.target.value })
                }
              />
            </label>
            <button className="btn secondary">Apply dates</button>
          </form>
        </ReportDateControls>
        <button
          type="button"
          className="btn secondary"
          onClick={downloadReport}
          disabled={!data || report.loading || Boolean(report.error)}
        >
          <Download size={16} /> Export daily CSV
        </button>
      </div>
      <ErrorNotice error={rangeError} />
      <ErrorNotice error={report.error} onRetry={report.reload} />
      {report.loading && <Skeleton count={2} />}
      {data && (
        <>
          <p className="muted">
            {data.period.start} to {data.period.end} · {data.period.timezone}.
            Order value includes delivery fees and tips, after discounts; it is
            not restaurant earnings or settlement.
          </p>
          {data.truncated && (
            <p role="status" className="insight-notice">
              This window exceeds the reporting limit. Forecasts are disabled;
              displayed metrics cover only the loaded orders.
            </p>
          )}
          <div className="insight-metrics">
            {[
              ["Orders placed", data.summary.orders],
              [
                "Order growth vs previous period",
                data.comparison.change_percent.orders === null
                  ? "No baseline"
                  : `${data.comparison.change_percent.orders > 0 ? "+" : ""}${data.comparison.change_percent.orders}%`,
              ],
              ["Completed orders", data.summary.delivered],
              ["Average order value", money(data.summary.average_order_value)],
              ["Cancellation rate", `${data.summary.cancellation_rate}%`],
              ["Ordering customers", data.summary.unique_ordering_customers],
              [
                "Customer retention",
                data.summary.retention_rate === null
                  ? "No previous cohort"
                  : `${data.summary.retention_rate}%`,
              ],
              [
                "Customers ordering again in this window",
                data.summary.repeat_customers,
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className="muted mb-5">
            Retention: {data.summary.retained_customers} of{" "}
            {data.summary.previous_period_customers} customers with completed
            orders in the previous period ordered again in this period.
          </p>
          {["admin", "restaurant"].includes(role) && (
            <section className="panel report-trend mb-5">
              <h3 className="mb-5">Order performance</h3>
              <OrderPerformance report={data} />
            </section>
          )}
          {data.financials && (
            <section className="panel mb-5" aria-label="Payment analytics">
              <h3>Money behind the orders</h3>
              <div className="insight-metrics">
                {[
                  ["Collected payments", data.financials.paid],
                  ["Confirmed refunds", data.financials.refunded],
                  ["Net collected", data.financials.net],
                  [
                    "Gross delivery fees",
                    data.financials.gross_collected_delivery_fees,
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <small>{label}</small>
                    <strong>{money(value)}</strong>
                  </div>
                ))}
              </div>
              <p className="muted mb-3">
                Accounted commission:{" "}
                {data.financials.commission === null
                  ? "Not yet accounted"
                  : money(data.financials.commission)}{" "}
                · {data.financials.commission_covered_orders || 0} orders
                covered. See Earnings & settlements for the restaurant ledger.
              </p>
              <p className="muted">{data.financials.definition}</p>
            </section>
          )}
          {role !== "admin" && (
            <section className="panel report-trend">
              <div className="section-title">
                <div>
                  <p className="eyebrow">COMPLETED ORDER VALUE</p>
                  <h3>{money(data.summary.gross_order_value)}</h3>
                </div>
                <span className="muted">
                  {data.summary.orders} orders placed · {data.summary.cancelled}{" "}
                  cancelled
                </span>
              </div>
              <p className="muted">
                {data.comparison.change_percent.gross_order_value === null
                  ? "No previous-period sales to compare."
                  : `${data.comparison.change_percent.gross_order_value > 0 ? "+" : ""}${data.comparison.change_percent.gross_order_value}% vs previous period.`}{" "}
                Comparison: {data.comparison.start} to {data.comparison.end}.
                Orders are grouped by the date placed and their current status.
              </p>
            </section>
          )}
          <div className="insight-grid">
            <section className="panel">
              <h3>
                <TrendingUp size={20} /> Coming week outlook
              </h3>
              <p className="muted">{data.forecast.method}</p>
              {data.forecast.status === "insufficient_data" ? (
                <div className="insight-empty">
                  <strong>More history needed</strong>
                  <p>
                    At least 14 observed days and 20 completed orders are needed
                    before showing a seven-day baseline.
                  </p>
                  <small>
                    {data.forecast.observed_days} observed days ·{" "}
                    {data.forecast.completed_orders} completed orders
                  </small>
                </div>
              ) : (
                <div className="insight-table-wrap">
                  <table>
                    <caption>
                      Historical weekday averages, not guaranteed demand or
                      revenue
                    </caption>
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Orders</th>
                        <th>Order value</th>
                        <th>Past range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.forecast.days.map((day) => (
                        <tr key={day.date}>
                          <td>{day.date}</td>
                          <td>{day.orders}</td>
                          <td>{money(day.gross_order_value)}</td>
                          <td>
                            {day.observed_low}–{day.observed_high}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            <section className="panel">
              <h3>When your kitchen gets busy</h3>
              {data.peak_hours.length ? (
                <ol className="insight-rows">
                  {data.peak_hours.map((row) => (
                    <li key={row.hour}>
                      <span>
                        {String(row.hour).padStart(2, "0")}:00–
                        {String((row.hour + 1) % 24).padStart(2, "0")}:00
                      </span>
                      <strong>{row.orders} completed orders</strong>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="muted">
                  Peak hours appear after completed orders.
                </p>
              )}
              <h3>Best-selling dishes</h3>
              {data.best_sellers.length ? (
                <ol className="insight-rows">
                  {data.best_sellers.map((row) => (
                    <li key={`${row.menu_item_id}:${row.name}`}>
                      <span>{row.name}</span>
                      <strong>{row.quantity} sold</strong>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="muted">No completed dish sales in this window.</p>
              )}
            </section>
            <section className="panel">
              <h3>
                <MessageSquareText size={20} /> What customers are saying
              </h3>
              <p className="muted">
                Analyse up to 30 public reviews from the last 90 days. Review
                text is sent to the AI provider; names and account details are
                not included. <Link to="/privacy#ai">Data use</Link>
              </p>
              <button
                type="button"
                className="btn secondary"
                disabled={analysing}
                onClick={async () => {
                  setAnalysing(true);
                  setError("");
                  setSentiment(null);
                  try {
                    setSentiment(
                      await apiRequest("/insights/sentiment/", {
                        token,
                        method: "POST",
                        body: {},
                      }),
                    );
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setAnalysing(false);
                  }
                }}
              >
                {analysing ? "Reading feedback…" : "Analyse review themes"}
              </button>
              <ErrorNotice error={error} />
              {sentiment && (
                <div className="sentiment-result" role="status">
                  {sentiment.status === "no_reviews" ? (
                    <p>No written public reviews to analyse yet.</p>
                  ) : sentiment.status === "unavailable" ? (
                    <p>
                      Review analysis is unavailable right now. Please try
                      later; no scores have been invented.
                    </p>
                  ) : (
                    <>
                      <p>{sentiment.note}</p>
                      <div className="sentiment-counts">
                        {Object.entries(sentiment.counts).map(
                          ([label, count]) => (
                            <span key={label}>
                              {label} <strong>{count}</strong>
                            </span>
                          ),
                        )}
                      </div>
                      <ul className="insight-rows">
                        {sentiment.themes.map((theme) => (
                          <li key={theme.name}>
                            <span>{theme.name}</span>
                            <strong>{theme.reviews} reviews</strong>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </section>
            <section className="panel">
              <h3>City performance</h3>
              {data.cities.length ? (
                <ul className="insight-rows">
                  {data.cities.map((row) => (
                    <li key={row.city}>
                      <span>
                        {row.city}
                        <small>{row.orders} completed orders</small>
                      </span>
                      <strong>{money(row.gross_order_value)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">
                  City breakdown appears after completed orders.
                </p>
              )}
              <p className="muted">
                {data.summary.returning_customers} customers in this window also
                ordered before the reporting period. This is a count, not a
                retention-rate estimate.
              </p>
            </section>
          </div>
          {data.risk_review && (
            <section className="panel risk-review">
              <h3>
                <ShieldAlert size={20} /> Orders that may need a closer look
              </h3>
              <p className="muted">{data.risk_review.method}</p>
              {data.risk_review.signals.length ? (
                <ul className="insight-rows">
                  {data.risk_review.signals.map((signal) => (
                    <li key={`${signal.kind}:${signal.order_id}`}>
                      <span>
                        Order #{signal.order_number}
                        <small>{signal.reason}</small>
                      </span>
                      <Link className="btn secondary" to="/admin-orders">
                        Review orders
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  No current signals met these review thresholds. This is not a
                  guarantee that all activity is safe.
                </p>
              )}
            </section>
          )}
        </>
      )}
    </section>
  );
}

export function DeliveryEstimate({ order }) {
  const { token } = useAuth();
  const active =
    order &&
    !["delivered", "cancelled", "awaiting_payment"].includes(order.status);
  const estimate = useRemote(
    active ? `/insights/eta/?order=${order.id}` : null,
    token,
    60000,
  );
  const data = estimate.data;
  if (
    !active ||
    !data ||
    !["historical_estimate", "taking_longer"].includes(data.status)
  )
    return null;
  return (
    <div className="delivery-estimate" role="status">
      {data.status === "historical_estimate" ? (
        <>
          <strong>
            Estimated arrival in {data.minimum_minutes}–{data.maximum_minutes}{" "}
            min
          </strong>
          <p>
            Based on recent deliveries. The time may change as your order
            progresses.
          </p>
        </>
      ) : data.status === "taking_longer" ? (
        <>
          <strong>Your order is taking a little longer</strong>
          <p>Follow the live order updates or contact support for help.</p>
        </>
      ) : null}
    </div>
  );
}
