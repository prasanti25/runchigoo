import { useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";
import { apiRequest } from "../../lib/api.js";
import { useRemote } from "../../lib/product.js";
import { ErrorNotice, Modal } from "./UI.jsx";
import "./Rewards.css";

const fields = [
  ["points_per_100", "Points per ₹100 of food paid", "1", 1000],
  ["point_value", "Value per point (₹)", "0.01", 100],
  ["redemption_percent", "Maximum food covered by rewards (%)", "1", 100],
  ["cashback_percent", "Promotional cashback (%)", "0.01", 100],
  ["cashback_cap", "Maximum cashback per order (₹)", "0.01", 10000],
  ["referral_credit", "Referral credit per person (₹)", "0.01", 10000],
  ["referral_minimum", "Minimum qualifying food paid (₹)", "0.01", 100000],
];

export default function RewardPolicy({ token }) {
  const policy = useRemote("/reward-policy/", token);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <section className="panel mt-6">
      <div className="flex-row between">
        <h2>Rewards & promotional credits</h2>
        <Wallet size={22} />
      </div>
      <p className="muted mt-3">
        An auditable rewards programme, disabled until commercial approval. This
        is not a stored-money wallet. It never replaces refunds to the original
        payment method.
      </p>
      <ErrorNotice error={policy.error} onRetry={policy.reload} />
      {policy.data && (
        <>
          <p className="mt-4">
            {policy.data.enabled ? "Enabled" : "Not enabled"} · Policy revision{" "}
            {policy.data.revision}
          </p>
          <button
            className="btn secondary mt-4"
            onClick={() => {
              setError("");
              setForm({ ...policy.data, reason: "" });
            }}
          >
            Review rewards policy
          </button>
        </>
      )}
      {form && (
        <Modal
          title="Configure rewards"
          onClose={() => {
            if (!busy) setForm(null);
          }}
        >
          <form
            className="form-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              try {
                await apiRequest("/reward-policy/configure/", {
                  token,
                  method: "POST",
                  body: form,
                });
                setForm(null);
                policy.reload();
              } catch (err) {
                setError(err.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(event) =>
                  setForm({ ...form, enabled: event.target.checked })
                }
              />{" "}
              Enable approved rewards on new orders
            </label>
            <div className="reward-policy-grid">
              {fields.map(([key, label, step, max]) => (
                <label className="field" key={key}>
                  <span>{label}</span>
                  <input
                    type="number"
                    required
                    min="0"
                    max={max}
                    step={step}
                    value={form[key]}
                    onChange={(event) =>
                      setForm({ ...form, [key]: event.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <p className="form-help">
              Zero disables that benefit. Credits and points share the
              redemption cap. Food after coupons and rewards earns benefits;
              delivery and tips do not. Cashback is capped promotional credit. A
              referral rewards both accounts once, after a qualifying delivered
              and paid order.
            </p>
            <h3>Loyalty levels</h3>
            <p className="form-help">
              Recognition based on net earned points, after refund adjustments.
              Names do not promise additional benefits.
            </p>
            {form.tiers.map((tier, index) => (
              <div className="reward-tier-row" key={index}>
                <label className="field">
                  <span>Level name</span>
                  <input
                    required
                    maxLength={30}
                    value={tier.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        tiers: form.tiers.map((row, i) =>
                          i === index
                            ? { ...row, name: event.target.value }
                            : row,
                        ),
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>Qualifying points</span>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100000000"
                    step="1"
                    value={tier.points}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        tiers: form.tiers.map((row, i) =>
                          i === index
                            ? { ...row, points: event.target.value }
                            : row,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  className="icon-button"
                  type="button"
                  aria-label={`Remove level ${index + 1}`}
                  onClick={() =>
                    setForm({
                      ...form,
                      tiers: form.tiers.filter((_, i) => i !== index),
                    })
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              className="btn secondary"
              type="button"
              disabled={form.tiers.length >= 10}
              onClick={() =>
                setForm({
                  ...form,
                  tiers: [...form.tiers, { name: "", points: "" }],
                })
              }
            >
              <Plus size={16} /> Add level
            </button>
            <label className="field">
              <span>Commercial approval reference / reason</span>
              <textarea
                required
                minLength={10}
                maxLength={500}
                value={form.reason}
                onChange={(event) =>
                  setForm({ ...form, reason: event.target.value })
                }
              />
            </label>
            <p className="form-help">
              Saving affects new quotes only; placed orders retain their policy.
              Disabling stops new earnings and redemption, but existing order
              refunds and cancellations still reconcile. No balance grants,
              payouts or money transfers happen here.
            </p>
            <ErrorNotice error={error} />
            <button className="btn primary" disabled={busy}>
              {busy ? "Saving…" : "Save approved rewards policy"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
