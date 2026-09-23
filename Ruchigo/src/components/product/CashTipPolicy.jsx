import { useState } from "react";
import { apiRequest } from "../../lib/api.js";
import { useRemote, money } from "../../lib/product.js";
import { ErrorNotice, Modal } from "./UI.jsx";

export default function CashTipPolicy({ token }) {
  const policy = useRemote("/checkout-options/", token);
  const [form, setForm] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <section className="panel mt-6">
      <h2>Optional cash tips</h2>
      <p className="muted mt-3">
        Disabled until you approve your cash-handling process. Customers pay
        this optional amount directly to their rider as part of cash on
        delivery. This does not enable online tips or payouts.
      </p>
      <ErrorNotice error={policy.error} onRetry={policy.reload} />
      {policy.data && (
        <>
          <p className="mt-4">
            {policy.data.cash_tips_enabled
              ? `Enabled · up to ${money(policy.data.max_cash_tip)}`
              : "Not enabled"}
          </p>
          <button
            className="btn secondary mt-4"
            onClick={() => {
              setError("");
              setForm({
                enabled: policy.data.cash_tips_enabled,
                maximum: policy.data.max_cash_tip,
                revision: policy.data.revision,
                reason: "",
              });
            }}
          >
            Review cash-tip policy
          </button>
        </>
      )}
      {form && (
        <Modal
          title="Configure cash tips"
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
                await apiRequest("/checkout-options/configure/", {
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
              />
              Enable optional cash-on-delivery tips
            </label>
            <label className="field">
              <span>Maximum optional tip (₹)</span>
              <input
                type="number"
                min="1"
                max="5000"
                step="0.01"
                required
                value={form.maximum}
                onChange={(event) =>
                  setForm({ ...form, maximum: event.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Reason and cash-handling approval</span>
              <textarea
                minLength={5}
                maxLength={500}
                required
                value={form.reason}
                onChange={(event) =>
                  setForm({ ...form, reason: event.target.value })
                }
              />
            </label>
            <p className="form-help">
              Applies to new checkouts only. Existing totals are unchanged.
              Record approval only after your rider cash-handling process is
              agreed.
            </p>
            <ErrorNotice error={error} />
            <button className="btn primary" disabled={busy}>
              {busy ? "Saving…" : "Confirm policy change"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
