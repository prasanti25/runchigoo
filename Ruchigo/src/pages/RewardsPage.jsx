import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  Gift,
  ReceiptText,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { ErrorNotice, Skeleton } from "../components/product/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import { dateTime, money, useRemote } from "../lib/product.js";
import "../components/product/Rewards.css";

const kinds = {
  earn: "Meal rewards",
  redeem: "Used at checkout",
  restore: "Rewards returned",
  referral: "Referral reward",
};

export default function RewardsPage() {
  const { token } = useAuth();
  const rewards = useRemote("/rewards/", token, 15000);
  const [page, setPage] = useState(1);
  const history = useRemote(`/rewards/history/?page=${page}`, token, 15000);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const data = rewards.data;
  return (
    <>
      <Navbar />
      <main className="customer-main rewards-page">
        <div className="container">
          <Link className="text-link" to="/profile">
            <ArrowLeft size={16} /> My account
          </Link>
          <header className="rewards-heading">
            <div>
              <p className="eyebrow">A LITTLE BACK, EVERY TIME</p>
              <h1>Your meals. Your rewards.</h1>
              <p>One place for your points, credits and every adjustment.</p>
            </div>
            <Wallet size={36} strokeWidth={1.4} />
          </header>
          <ErrorNotice error={rewards.error} onRetry={rewards.reload} />
          {rewards.loading && <Skeleton count={2} />}
          {data && !rewards.loading && (
            <>
              <div className="rewards-balances">
                <section className="rewards-credit">
                  <Wallet size={24} />
                  <span>RuchiGo credits</span>
                  <strong>{money(data.credits)}</strong>
                  <p>Promotional discounts. No top-ups or withdrawals.</p>
                  <Link to="/search">
                    Find your next meal <ArrowUpRight size={17} />
                  </Link>
                </section>
                <section className="panel rewards-points">
                  <Gift size={24} />
                  <span>Your points</span>
                  <strong>{Number(data.points).toLocaleString("en-IN")}</strong>
                  <p>{data.tier || "Your food journey"}</p>
                  {data.next_tier && (
                    <>
                      <progress
                        max={data.next_tier.points}
                        value={data.qualifying_points}
                        aria-label={`Progress towards ${data.next_tier.name}`}
                      />
                      <small>
                        {data.next_tier.points - data.qualifying_points}{" "}
                        qualifying points to {data.next_tier.name}
                      </small>
                    </>
                  )}
                  {!data.next_tier && Number(data.qualifying_points) > 0 && (
                    <small>
                      {data.qualifying_points} qualifying points earned after
                      adjustments
                    </small>
                  )}
                </section>
              </div>
              {!data.enabled && (
                <section className="panel">
                  <h2>Rewards are not active right now</h2>
                  <p className="muted mt-3">
                    You can still check your activity. New earnings and
                    redemption will be available when the programme is enabled.
                  </p>
                </section>
              )}
              {data.adjustment_due && (
                <section className="panel">
                  <h2>An adjustment to your balance</h2>
                  <p className="muted mt-3">
                    Rewards from a refunded order had already been used. Future
                    rewards first cover this balance. This is not a charge to
                    your payment method.
                  </p>
                </section>
              )}
              <div className="rewards-layout">
                <section className="panel rewards-history">
                  <div className="flex-row between">
                    <h2>Recent activity</h2>
                    <ReceiptText size={20} />
                  </div>
                  <ErrorNotice error={history.error} onRetry={history.reload} />
                  {history.loading ? (
                    <Skeleton count={3} />
                  ) : history.data?.results.length ? (
                    <>
                      {history.data.results.map((entry) => (
                        <article key={entry.id} className="reward-entry">
                          <div>
                            <Link
                              to={
                                entry.order
                                  ? `/orders/${entry.order}`
                                  : "/rewards"
                              }
                            >
                              {kinds[entry.kind]} <ArrowUpRight size={14} />
                            </Link>
                            <p>{entry.note}</p>
                            <small>{dateTime(entry.created_at)}</small>
                          </div>
                          <div className="reward-entry-value">
                            {entry.points !== 0 && (
                              <strong
                                className={entry.points > 0 ? "positive" : ""}
                              >
                                {entry.points > 0 ? "+" : ""}
                                {entry.points} pts
                              </strong>
                            )}
                            {Number(entry.credits) !== 0 && (
                              <strong
                                className={
                                  Number(entry.credits) > 0 ? "positive" : ""
                                }
                              >
                                {Number(entry.credits) > 0 ? "+" : ""}
                                {money(entry.credits)}
                              </strong>
                            )}
                          </div>
                        </article>
                      ))}
                      <div className="flex-row between mt-5">
                        <button
                          className="btn secondary"
                          disabled={!history.data.previous}
                          onClick={() => setPage(page - 1)}
                        >
                          Previous
                        </button>
                        <span className="muted">Page {page}</span>
                        <button
                          className="btn secondary"
                          disabled={!history.data.next}
                          onClick={() => setPage(page + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="reward-empty">
                      <ReceiptText size={28} />
                      <h3>Every reward has a story</h3>
                      <p>
                        Your eligible delivered orders, redemptions and
                        adjustments will appear here.
                      </p>
                      <Link className="text-link" to="/search">
                        Explore restaurants <ArrowUpRight size={15} />
                      </Link>
                    </div>
                  )}
                </section>
                <aside>
                  {data.enabled && Number(data.policy.referral_credit) > 0 && (
                    <section className="panel reward-referral">
                      <Gift size={24} />
                      <h2>Good food is better shared.</h2>
                      <p>
                        Both of you get {money(data.policy.referral_credit)} in
                        credits after your friend’s first qualifying delivered,
                        paid order with at least{" "}
                        {money(data.policy.referral_minimum)} in food after
                        discounts.
                      </p>
                      <p className="form-help">
                        Your friend must link your code before placing any
                        order. A confirmed refund can reverse the bonus; it
                        cannot be claimed again.
                      </p>
                      <label className="field">
                        <span>Your referral code</span>
                        <input readOnly value={data.referral_code || ""} />
                      </label>
                      <button
                        className="btn secondary w-full"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              data.referral_code,
                            );
                            toast.success("Referral code copied");
                          } catch {
                            toast.error("Select and copy your code above");
                          }
                        }}
                      >
                        <Copy size={15} /> Copy code
                      </button>
                      {data.referral_bound && (
                        <p className="flex-row mt-4">
                          <Check size={17} /> Your referral is linked
                        </p>
                      )}
                      {data.can_bind_referral && (
                        <form
                          className="form-stack mt-5"
                          onSubmit={async (event) => {
                            event.preventDefault();
                            setBusy(true);
                            setError("");
                            try {
                              await apiRequest("/rewards/referral/", {
                                token,
                                method: "POST",
                                body: { code: code.trim() },
                              });
                              rewards.reload();
                              toast.success("Referral linked");
                            } catch (err) {
                              setError(err.message);
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          <label className="field">
                            <span>Have a friend’s code?</span>
                            <input
                              required
                              maxLength={36}
                              value={code}
                              onChange={(event) => setCode(event.target.value)}
                              placeholder="Paste their referral code"
                            />
                          </label>
                          <ErrorNotice error={error} />
                          <button className="btn primary" disabled={busy}>
                            {busy ? "Linking…" : "Link referral"}
                          </button>
                        </form>
                      )}
                    </section>
                  )}
                  <section className="panel reward-rules">
                    <h2>How it works</h2>
                    {data.enabled && (
                      <ul>
                        {data.policy.points_per_100 > 0 && (
                          <li>
                            Earn {data.policy.points_per_100} points per ₹100 of
                            eligible food paid.
                          </li>
                        )}
                        {Number(data.policy.point_value) > 0 && (
                          <li>
                            Each point is worth {money(data.policy.point_value)}{" "}
                            at checkout.
                          </li>
                        )}
                        {Number(data.policy.cashback_percent) > 0 && (
                          <li>
                            {data.policy.cashback_percent}% promotional
                            cashback, up to {money(data.policy.cashback_cap)}{" "}
                            per order.
                          </li>
                        )}
                        <li>
                          Combined rewards cover up to{" "}
                          {data.policy.redemption_percent}% of food after
                          coupons.
                        </li>
                        <li>
                          Earn after delivery and payment. Delivery charges and
                          tips never earn rewards.
                        </li>
                      </ul>
                    )}
                    <p className="form-help">{data.disclosure}</p>
                    <Link className="text-link mt-4" to="/support">
                      Need help with rewards? <ArrowUpRight size={15} />
                    </Link>
                  </section>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
