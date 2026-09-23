import { useState } from "react";
import toast from "react-hot-toast";
import { WorkspaceFrame } from "../../components/product/Workspace.jsx";
import { ErrorNotice, Modal, Skeleton } from "../../components/product/UI.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { useRemote } from "../../lib/product.js";
import CashTipPolicy from "../../components/product/CashTipPolicy.jsx";
import RewardPolicy from "../../components/product/RewardPolicy.jsx";
import WorkspaceTabs from "../../components/product/WorkspaceTabs.jsx";

export default function OrderPolicies() {
  const { token } = useAuth();
  const policy = useRemote("/cancellation-policy/", token);
  const [section, setSection] = useState("cancellation");
  return (
    <WorkspaceFrame
      type="admin"
      title="Order policies"
      description="Clear cancellation cutoffs and explicit refund authorization. Existing orders retain their checkout-time policy."
    >
      <WorkspaceTabs
        label="Order policy sections"
        tabs={[
          ["cancellation", "Cancellations"],
          ["tips", "Cash & tips"],
          ["rewards", "Rewards & referrals"],
        ]}
        value={section}
        onChange={setSection}
      >
        <div>
          <ErrorNotice error={policy.error} onRetry={policy.reload} />
          {policy.loading ? (
            <Skeleton count={1} />
          ) : (
            policy.data && (
              <PolicyForm
                key={policy.data.revision}
                initial={policy.data}
                token={token}
                onSaved={policy.reload}
              />
            )
          )}
        </div>
        <CashTipPolicy token={token} />
        <RewardPolicy token={token} />
      </WorkspaceTabs>
    </WorkspaceFrame>
  );
}

function PolicyForm({ initial, token, onSaved }) {
  const [form, setForm] = useState(initial);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <section className="panel order-policy-panel">
      <h2>When can a customer cancel?</h2>
      <p className="muted mt-3">
        Unpaid checkouts can be cancelled before they reach the kitchen. No
        self-service cancellation is allowed once food preparation starts, at
        pickup, in transit or after delivery.
      </p>
      <div className="form-stack mt-6">
        <label className="address-option">
          <span>
            <input
              type="radio"
              name="cutoff"
              checked={form.cutoff === "acceptance"}
              onChange={() => setForm({ ...form, cutoff: "acceptance" })}
            />
            Before restaurant acceptance
          </span>
          <p>
            The cancellation window ends when the kitchen accepts the order.
          </p>
        </label>
        <label className="address-option">
          <span>
            <input
              type="radio"
              name="cutoff"
              checked={form.cutoff === "preparation"}
              onChange={() => setForm({ ...form, cutoff: "preparation" })}
            />
            Until cooking starts
          </span>
          <p>
            An accepted order can still be cancelled until the kitchen marks it
            preparing.
          </p>
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={form.allow_prepaid_refunds}
            onChange={(event) =>
              setForm({ ...form, allow_prepaid_refunds: event.target.checked })
            }
          />
          Enable full original-method refunds for eligible prepaid cancellations
        </label>
        <p className="form-help">
          This authorizes automatic full refund submission after cancellation
          within the selected window. Requires configured payments, signed
          refund webhooks and a recovery worker. When disabled, prepaid
          cancellations require support review.
        </p>
        <button className="btn primary" onClick={() => setConfirm(true)}>
          Review policy change
        </button>
      </div>
      {confirm && (
        <Modal
          title="Apply policy to new orders?"
          onClose={() => {
            if (!busy) setConfirm(false);
          }}
        >
          <p className="muted mt-4">
            New checkouts will allow cancellation{" "}
            {form.cutoff === "preparation"
              ? "until cooking starts"
              : "until restaurant acceptance"}
            .{" "}
            {form.allow_prepaid_refunds
              ? "Eligible captured online payments will be automatically submitted for a full original-method refund on cancellation."
              : "Prepaid cancellation remains support-reviewed."}{" "}
            Existing orders are unchanged.
          </p>
          <ErrorNotice error={error} />
          <button
            className="btn primary mt-5"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await apiRequest("/cancellation-policy/configure/", {
                  token,
                  method: "POST",
                  body: form,
                });
                toast.success("Order policy saved for new checkouts");
                setConfirm(false);
                onSaved();
              } catch (err) {
                setError(err.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving…" : "Confirm policy"}
          </button>
        </Modal>
      )}
    </section>
  );
}
