import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChartNoAxesCombined } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { money, useRemote } from "../../lib/product.js";
import { ErrorNotice, Skeleton } from "./UI.jsx";
import "./CustomerInsights.css";

export default function CustomerInsights() {
  const { token } = useAuth();
  const [days, setDays] = useState(0);
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - Math.max(0, days - 1));
  const date = (value) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  const query = days ? `?start=${date(start)}&end=${date(end)}` : "";
  const report = useRemote(`/customer-insights/${query}`, token);
  const data = report.data;
  return (
    <section
      className="profile-section shopping-insights"
      aria-label="Your food activity"
    >
      <div className="profile-section-title">
        <div>
          <p className="eyebrow">YOUR FOOD STORY</p>
          <h2>Your orders, at a glance</h2>
        </div>
        <ChartNoAxesCombined size={23} />
      </div>
      <div
        className="shopping-period"
        role="group"
        aria-label="Activity period"
      >
        {[
          [0, "This month"],
          [30, "30 days"],
          [90, "90 days"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={days === value}
            onClick={() => setDays(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <ErrorNotice error={report.error} onRetry={report.reload} />
      {report.loading && <Skeleton count={2} />}
      {data && !report.loading && !report.error && (
        <>
          <div className="shopping-stats">
            {[
              ["Lifetime orders", data.lifetime.orders],
              ["Lifetime net spend", money(data.lifetime.spending.net)],
              ["Spent this period", money(data.summary.spending.net)],
              ["Orders / week", data.summary.orders_per_week],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className="muted">
            {data.period.start} – {data.period.end} · {data.period.timezone}.{" "}
            {data.summary.orders} orders placed; {data.summary.delivered}{" "}
            delivered.
          </p>
          {data.loyalty?.enabled && (
            <Link className="text-link mt-4" to="/rewards">
              {data.loyalty.points} points · {money(data.loyalty.credits)}{" "}
              credits <ArrowUpRight size={15} />
            </Link>
          )}
          <details className="shopping-months">
            <summary>Monthly spending · last 12 months</summary>
            <div className="shopping-month-grid">
              {data.monthly.map((month) => (
                <div key={month.month}>
                  <span>{month.month}</span>
                  <strong>{money(month.net_spending)}</strong>
                  <small>{month.orders} orders</small>
                </div>
              ))}
            </div>
          </details>
          <div className="shopping-favourites">
            <div>
              <h3>Saved kitchens</h3>
              {data.saved_restaurants.length ? (
                data.saved_restaurants.map((row) => (
                  <Link
                    key={row.restaurant_id}
                    to={`/restaurant/${row.restaurant_id}`}
                  >
                    {row.restaurant__name}
                    <ArrowUpRight size={15} />
                  </Link>
                ))
              ) : (
                <p className="muted">
                  Save a restaurant you like to find it here.
                </p>
              )}
            </div>
            <div>
              <h3>Your favourite dishes</h3>
              {data.saved_food.length ? (
                data.saved_food.map((row) => (
                  <Link
                    key={row.menu_item_id}
                    to={`/restaurant/${row.menu_item__restaurant_id}`}
                  >
                    {row.menu_item__name}
                    <ArrowUpRight size={15} />
                  </Link>
                ))
              ) : (
                <p className="muted">
                  Tap a dish’s heart to save it for later.
                </p>
              )}
            </div>
          </div>
          {!!data.most_ordered.length && (
            <p className="muted">
              Most enjoyed:{" "}
              {data.most_ordered
                .map((row) => `${row.name} (${row.quantity})`)
                .join(" · ")}
            </p>
          )}
          <details className="shopping-definition">
            <summary>How your spending is calculated</summary>
            <p className="muted">{data.definition}</p>
          </details>
        </>
      )}
    </section>
  );
}
