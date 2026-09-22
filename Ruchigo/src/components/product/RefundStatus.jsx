import { useState } from "react";
import { Check, Clock3, ReceiptText } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { money, dateTime } from "../../lib/product.js";
import { ErrorNotice, Modal } from "./UI.jsx";
import { hasAdminScope } from "../../lib/adminAccess.js";

const labels = {
  requested: "Refund review requested",
  reviewing: "Under review",
  approved: "Approved · awaiting processing",
  processing: "Refund processing",
  processed: "Refund processed",
  rejected: "Request not approved",
  failed: "Processing needs attention",
};
export default function RefundStatus({ refund, onUpdated }) {
  const { user, token } = useAuth();
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState(refund?.requested_amount || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  if (!refund) return null;
  const update = async (action, body) => {
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/refund-requests/${refund.id}/${action}/`, {
        token,
        method: "POST",
        body,
      });
      setConfirm(false);
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const stage = [
    "requested",
    "reviewing",
    "approved",
    "processing",
    "processed",
  ].indexOf(refund.status);
  return (
    <section
      className={`refund-status ${refund.status}`}
      aria-label="Refund status"
    >
      <div className="flex-row">
        <ReceiptText size={22} />
        <div>
          <h3>{labels[refund.status]}</h3>
          <p>
            {refund.approved_amount
              ? `${money(refund.approved_amount)} approved`
              : `Review requested for up to ${money(refund.requested_amount)}`}
          </p>
        </div>
      </div>
      <ol className="refund-progress">
        {["Requested", "Review", "Decision", "Processing", "Processed"].map(
          (label, index) => (
            <li className={index <= stage ? "reached" : ""} key={label}>
              {index < stage || refund.status === "processed" ? (
                <Check size={13} />
              ) : (
                <Clock3 size={13} />
              )}
              <span>{label}</span>
            </li>
          ),
        )}
      </ol>
      {refund.decision_note && <p>{refund.decision_note}</p>}
      <p className="form-help">
        {refund.status === "processed"
          ? `Confirmed ${dateTime(refund.processed_at)}. Check your original payment method; bank posting times vary.`
          : refund.status === "rejected"
            ? "You can reply below if you have more information for the support team."
            : "Your request stays linked to this conversation. Requested or approved does not mean money has already been returned."}
      </p>
      {hasAdminScope(user, "finance") && (
        <div className="refund-admin-controls">
          {["requested", "reviewing"].includes(refund.status) && (
            <form
              className="form-stack"
              onSubmit={(event) => {
                event.preventDefault();
                const decision = event.nativeEvent.submitter?.value;
                if (decision)
                  update("review", {
                    decision,
                    note,
                    ...(decision === "approved" ? { amount } : {}),
                  });
              }}
            >
              <label className="field">
                <span>Decision note (visible to customer)</span>
                <textarea
                  required
                  maxLength={1000}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Approved refund amount (₹)</span>
                <input
                  type="number"
                  min="0.01"
                  max={refund.requested_amount}
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>
              <div className="flex-row wrap">
                <button
                  className="btn secondary"
                  value="reviewing"
                  disabled={busy}
                >
                  Start review
                </button>
                <button
                  className="btn secondary"
                  value="rejected"
                  disabled={busy}
                >
                  Reject request
                </button>
                <button
                  className="btn primary"
                  value="approved"
                  disabled={busy}
                >
                  Approve amount
                </button>
              </div>
            </form>
          )}
          {refund.status === "approved" && (
            <button
              className="btn primary"
              disabled={busy}
              onClick={() => setConfirm(true)}
            >
              Process approved refund
            </button>
          )}
          {["processing", "failed"].includes(refund.status) && (
            <button
              className="btn secondary"
              disabled={busy}
              onClick={() => update("reconcile", {})}
            >
              Check provider status
            </button>
          )}
          <ErrorNotice error={error} />
        </div>
      )}
      {confirm && (
        <Modal
          title={`Process refund of ${money(refund.approved_amount)}?`}
          onClose={() => {
            if (!busy) setConfirm(false);
          }}
        >
          <p className="muted mt-4">
            This submits a real refund to the configured payment provider. It
            only supports captured online payments on delivered or cancelled
            orders. Cash refunds require an approved offline process.
          </p>
          <ErrorNotice error={error} />
          <button
            className="btn primary mt-5"
            disabled={busy}
            onClick={() => update("process", {})}
          >
            {busy ? "Submitting…" : "Confirm refund submission"}
          </button>
        </Modal>
      )}
    </section>
  );
}
