import { Link } from "react-router-dom";
import { Wallet, ArrowUpRight } from "lucide-react";
import { money, useRemote } from "../../lib/product.js";
import { ErrorNotice } from "./UI.jsx";
import "./Rewards.css";

export default function RewardCheckout({ token, value, onChange, foodAmount }) {
  const rewards = useRemote("/rewards/", token, 15000);
  const data = rewards.data;
  if (rewards.error)
    return <ErrorNotice error={rewards.error} onRetry={rewards.reload} />;
  if (!data?.enabled && !value.points && !Number(value.credits)) return null;
  const cap =
    Math.floor(
      Math.max(0, foodAmount) * Number(data?.policy.redemption_percent || 0),
    ) / 100;
  const pointValue = Number(data?.policy.point_value || 0);
  const availablePoints = data?.enabled ? Math.max(0, data.points) : 0;
  const availableCredits = data?.enabled
    ? Math.max(0, Number(data.credits))
    : 0;
  const pointsMax = pointValue
    ? Math.min(
        availablePoints,
        Math.floor(
          Math.max(0, cap - Number(value.credits)) / pointValue + 0.000001,
        ),
      )
    : 0;
  const creditsMax =
    Math.floor(
      Math.min(availableCredits, Math.max(0, cap - value.points * pointValue)) *
        100 +
        0.000001,
    ) / 100;
  return (
    <section className="panel reward-checkout" aria-label="Apply your rewards">
      <div className="flex-row between">
        <h2>
          <Wallet size={21} /> Your rewards
        </h2>
        <Link className="text-link" to="/rewards">
          View activity <ArrowUpRight size={16} />
        </Link>
      </div>
      <p className="muted mt-3">
        Use up to {money(cap)} on this meal, after coupons. Delivery and tips
        are separate.
      </p>
      {data && !data.enabled && (
        <p className="form-help">
          Rewards are currently unavailable. Clear your selection to continue
          with the updated bill.
        </p>
      )}
      {data?.adjustment_due && (
        <p className="form-help">
          A confirmed refund adjusted your rewards. Future earnings first cover
          any negative balance.
        </p>
      )}
      <div className="reward-choice">
        <div>
          <strong>{availablePoints.toLocaleString("en-IN")} points</strong>
          <small>
            {pointValue > 0
              ? `${money(pointValue)} per point`
              : "Point redemption is not enabled"}
          </small>
        </div>
        <button
          className="btn secondary"
          type="button"
          disabled={!value.points && !pointsMax}
          aria-pressed={value.points > 0}
          onClick={() =>
            onChange({ ...value, points: value.points ? 0 : pointsMax })
          }
        >
          {value.points ? `Remove ${value.points} points` : "Use points"}
        </button>
      </div>
      <div className="reward-choice">
        <div>
          <strong>{money(availableCredits)} credits</strong>
          <small>Promotional balance · not cash</small>
        </div>
        <button
          className="btn secondary"
          type="button"
          disabled={!Number(value.credits) && !creditsMax}
          aria-pressed={Number(value.credits) > 0}
          onClick={() =>
            onChange({
              ...value,
              credits: Number(value.credits) ? "0" : creditsMax.toFixed(2),
            })
          }
        >
          {Number(value.credits)
            ? `Remove ${money(value.credits)}`
            : "Use credits"}
        </button>
      </div>
      {(value.points > 0 || Number(value.credits) > 0) && (
        <button
          className="text-link mt-3"
          type="button"
          onClick={() => {
            onChange({ points: 0, credits: "0" });
            rewards.reload();
          }}
        >
          Clear rewards / refresh balance
        </button>
      )}
      {!availablePoints && !availableCredits && (
        <p className="form-help mt-3">
          Eligible rewards appear after your order is delivered and payment is
          collected.
        </p>
      )}
    </section>
  );
}
