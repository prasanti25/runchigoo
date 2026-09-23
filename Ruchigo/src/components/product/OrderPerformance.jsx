import { useId, useState } from "react";
import {
  BarChart3,
  ChartNoAxesCombined,
  ChevronDown,
  Info,
} from "lucide-react";
import { money } from "../../lib/product.js";
import { chartBuckets, chartScale } from "../../lib/overviewChart.js";
import "./OrderPerformance.css";

const count = (value) => Number(value).toLocaleString("en-IN");
const date = (value) =>
  new Date(value + "T12:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
const periodLabel = (row) =>
  row.date === row.end
    ? date(row.date)
    : date(row.date) + " – " + date(row.end);
const compact = (value, currency) =>
  (currency ? "₹" : "") +
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: value > 0 && value < 1 ? 3 : 1,
  }).format(value);

export default function OrderPerformance({ report }) {
  const gradient = useId();
  const [metric, setMetric] = useState("orders");
  const [style, setStyle] = useState("bars");
  const [weekly, setWeekly] = useState(false);
  const [delivered, setDelivered] = useState(true);
  const [selected, setSelected] = useState(null);
  const currency = metric === "value";
  const rows = chartBuckets(report.daily, weekly);
  const primary = currency ? "gross_order_value" : "placed_orders";
  const max = chartScale(
    rows.map((row) => row[primary]),
    currency,
  );
  const w = 700,
    h = 280,
    left = 48,
    right = 20,
    top = 22,
    bottom = 36;
  const step = (w - left - right) / Math.max(1, rows.length);
  const x = (index) => left + step * (index + 0.5);
  const y = (value) => h - bottom - (value / max) * (h - bottom - top);
  const points = (key) =>
    rows.map((row, index) => x(index) + "," + y(row[key])).join(" ");
  const selectedIndex = rows.findIndex((row) => row.date === selected);
  const focused = rows[selectedIndex];
  const barWidth = Math.max(1, Math.min(26, step * (currency ? 0.6 : 0.27)));
  const activeDays = report.daily.filter((day) => day.placed_orders > 0).length;
  const lastIndex = rows.length - 1;
  const labelIndices = [
    ...new Set([
      0,
      Math.floor(lastIndex / 3),
      Math.floor((lastIndex * 2) / 3),
      lastIndex,
    ]),
  ];
  function chooseBucket(index) {
    setSelected(rows[Math.max(0, Math.min(lastIndex, index))]?.date ?? null);
  }
  function resetView(callback) {
    setSelected(null);
    callback();
  }
  const total = currency
    ? money(report.summary.gross_order_value)
    : count(report.summary.orders);
  return (
    <div className="overview-trend-content performance-panel">
      <div className="performance-controls">
        <div
          className="performance-metric-tabs"
          role="group"
          aria-label="Chart metric"
        >
          <button
            aria-pressed={!currency}
            onClick={() => resetView(() => setMetric("orders"))}
          >
            Orders
          </button>
          <button
            aria-pressed={currency}
            onClick={() => resetView(() => setMetric("value"))}
          >
            Order value
          </button>
        </div>
        <div className="performance-view-controls">
          <label className="performance-granularity">
            <span className="sr-only">Chart grouping</span>
            <select
              value={weekly ? "weekly" : "daily"}
              onChange={(event) =>
                resetView(() => setWeekly(event.target.value === "weekly"))
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">7-day groups</option>
            </select>
            <ChevronDown size={13} />
          </label>
          <div
            className="performance-style"
            role="group"
            aria-label="Chart style"
          >
            <button
              aria-label="Bar chart"
              aria-pressed={style === "bars"}
              onClick={() => setStyle("bars")}
            >
              <BarChart3 size={16} />
            </button>
            <button
              aria-label="Trend chart"
              aria-pressed={style === "trend"}
              onClick={() => setStyle("trend")}
            >
              <ChartNoAxesCombined size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="performance-headline">
        <div>
          <strong>{total}</strong>
          <span>{currency ? "delivered order value" : "orders placed"}</span>
        </div>
        <div className="performance-legend">
          <span>
            <i />
            {currency ? "Order value" : "Placed"}
          </span>
          {!currency && (
            <button
              aria-pressed={delivered}
              onClick={() => setDelivered(!delivered)}
            >
              <i />
              Delivered
            </button>
          )}
        </div>
      </div>
      <div className="overview-chart-inspection" aria-live="polite">
        {focused
          ? periodLabel(focused) +
            " · " +
            count(focused.placed_orders) +
            " placed · " +
            count(focused.orders) +
            " delivered · " +
            count(focused.cancelled) +
            " cancelled"
          : currency
            ? "Gross delivered-order totals, before refund adjustments. Not platform profit."
            : "Select any day for its order breakdown. Arrow keys move between dates."}
      </div>
      {report.summary.orders ? (
        <div className="performance-plot">
          <svg
            className="overview-chart performance-chart"
            viewBox={"0 0 " + w + " " + h}
            role="group"
            aria-label="Interactive order performance chart"
            onPointerLeave={() => setSelected(null)}
          >
            <defs>
              <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ef7942" stopOpacity=".25" />
                <stop offset="100%" stopColor="#ef7942" stopOpacity=".015" />
              </linearGradient>
            </defs>
            {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
              <g key={ratio}>
                <line
                  x1={left}
                  x2={w - right}
                  y1={y(ratio * max)}
                  y2={y(ratio * max)}
                  className="performance-grid"
                />
                <text x={left - 10} y={y(ratio * max) + 4} textAnchor="end">
                  {compact(ratio * max, currency)}
                </text>
              </g>
            ))}
            {style === "trend" && (
              <>
                <polygon
                  points={
                    x(0) +
                    "," +
                    y(0) +
                    " " +
                    points(primary) +
                    " " +
                    x(lastIndex) +
                    "," +
                    y(0)
                  }
                  fill={"url(#" + gradient + ")"}
                />
                <polyline
                  points={points(primary)}
                  fill="none"
                  stroke="#e77337"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                {!currency && delivered && (
                  <polyline
                    points={points("orders")}
                    fill="none"
                    stroke="#567d66"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeDasharray="5 4"
                  />
                )}
              </>
            )}
            {selectedIndex >= 0 && (
              <rect
                x={left + selectedIndex * step}
                y={top}
                width={step}
                height={h - top - bottom}
                rx="6"
                fill="#e8eee5"
                opacity=".5"
              />
            )}
            {rows.map((row, index) => (
              <g
                key={row.date}
                role="button"
                tabIndex={0}
                aria-label={
                  periodLabel(row) +
                  ": " +
                  row.placed_orders +
                  " placed, " +
                  row.orders +
                  " delivered, " +
                  row.cancelled +
                  " cancelled, " +
                  money(row.gross_order_value) +
                  " order value"
                }
                onPointerEnter={() => chooseBucket(index)}
                onFocus={() => chooseBucket(index)}
                onClick={() => chooseBucket(index)}
                onKeyDown={(event) => {
                  if (
                    [
                      "ArrowLeft",
                      "ArrowRight",
                      "Home",
                      "End",
                      "Enter",
                      " ",
                    ].includes(event.key)
                  ) {
                    event.preventDefault();
                    const next =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? lastIndex
                          : event.key === "ArrowLeft"
                            ? Math.max(0, index - 1)
                            : event.key === "ArrowRight"
                              ? Math.min(lastIndex, index + 1)
                              : index;
                    chooseBucket(next);
                    event.currentTarget.parentElement
                      .querySelectorAll('[role="button"]')
                      .item(next)
                      ?.focus();
                  }
                }}
              >
                <rect
                  x={left + step * index}
                  y={top}
                  width={step}
                  height={h - top - bottom}
                  fill="transparent"
                />
                {style === "bars" ? (
                  <>
                    <rect
                      className="performance-primary-bar"
                      x={
                        x(index) -
                        (currency || !delivered ? barWidth / 2 : barWidth + 2)
                      }
                      y={y(row[primary])}
                      width={barWidth}
                      height={y(0) - y(row[primary])}
                      rx="3"
                    />
                    {!currency && delivered && (
                      <rect
                        className="performance-delivered-bar"
                        x={x(index) + 2}
                        y={y(row.orders)}
                        width={barWidth}
                        height={y(0) - y(row.orders)}
                        rx="3"
                      />
                    )}
                  </>
                ) : (
                  <circle
                    cx={x(index)}
                    cy={y(row[primary])}
                    r={selected === row.date ? 5 : 3}
                    fill="#e77337"
                    stroke="white"
                    strokeWidth="2"
                  />
                )}
              </g>
            ))}
            {labelIndices.map((index) => (
              <text
                key={index}
                x={x(index)}
                y={h - 9}
                textAnchor={
                  index === 0 ? "start" : index === lastIndex ? "end" : "middle"
                }
              >
                {date(rows[index].date)}
              </text>
            ))}
          </svg>
          {focused && (
            <div
              className="performance-tooltip"
              style={{ "--tooltip-x": (x(selectedIndex) / w) * 100 + "%" }}
            >
              <strong>{periodLabel(focused)}</strong>
              <dl>
                <div>
                  <dt>
                    <i />
                    Placed
                  </dt>
                  <dd>{count(focused.placed_orders)}</dd>
                </div>
                <div>
                  <dt>Delivered</dt>
                  <dd>{count(focused.orders)}</dd>
                </div>
                <div>
                  <dt>Cancelled</dt>
                  <dd>{count(focused.cancelled)}</dd>
                </div>
                <div>
                  <dt>Order value</dt>
                  <dd>{money(focused.gross_order_value)}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      ) : (
        <div className="overview-chart-empty">
          <BarChart3 size={30} />
          <strong>No orders in this period</strong>
          <span>Choose another date range to view recorded activity.</span>
        </div>
      )}
      <div className="performance-footnote">
        <Info size={13} />
        <span>
          {activeDays === 1
            ? "Orders are recorded on 1 day in this range. Empty dates stay at zero."
            : "Grouped by order placement date. Delivery status is the latest recorded status."}
        </span>
      </div>
      <details className="overview-chart-data">
        <summary>View daily figures</summary>
        <div className="overview-data-scroll">
          <table>
            <caption>Daily order activity, {report.period.timezone}</caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Placed</th>
                <th>Delivered</th>
                <th>Cancelled</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {report.daily.map((row) => (
                <tr key={row.date}>
                  <th>{date(row.date)}</th>
                  <td>{count(row.placed_orders)}</td>
                  <td>{count(row.orders)}</td>
                  <td>{count(row.cancelled)}</td>
                  <td>{money(row.gross_order_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
