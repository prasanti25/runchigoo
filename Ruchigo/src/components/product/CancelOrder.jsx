import { useState } from "react";
import { Link } from "react-router-dom";
import { Ban, ChevronRight, Clock3, Utensils } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { money, statusLabel, useRemote } from "../../lib/product.js";
import { ErrorNotice, Modal } from "./UI.jsx";

export default function CancelOrder({ order, onUpdated, compact = false }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fresh = useRemote(open ? `/orders/${order.id}/` : null, token, 5000);
  const state = open ? fresh.data?.cancellation : order.cancellation;
  if (["cancelled", "delivered"].includes(order.status)) return null;
  if (compact && !order.cancellation?.allowed) return null;
  const trigger = (
    <button
      className="btn secondary"
      onClick={() => {
        setError("");
        setOpen(true);
      }}
    >
      <Ban size={15} />
      Cancel order
    </button>
  );
  return (
    <>
      {compact ? (
        trigger
      ) : (
        <section
          className="order-cancellation-card"
          aria-label="Order cancellation"
        >
          <div>
            <h3>
              {order.cancellation?.allowed
                ? "Need to cancel?"
                : "Cancellation unavailable"}
            </h3>
            <p>
              {order.cancellation?.message || "Open help to check this order."}
            </p>
          </div>
          {order.cancellation?.allowed ? (
            trigger
          ) : (
            <Link className="text-link" to={`/support?order=${order.id}`}>
              Get help <ChevronRight size={15} />
            </Link>
          )}
        </section>
      )}
      {open && (
        <Modal
          title="Cancel this order?"
          onClose={() => {
            if (!busy) setOpen(false);
          }}
        >
          <form
            className="form-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              if (
                busy ||
                !state?.allowed ||
                fresh.loading ||
                fresh.error ||
                !reason
              )
                return;
              setBusy(true);
              setError("");
              try {
                const updated = await apiRequest(
                  `/orders/${order.id}/cancel/`,
                  { token, method: "POST", body: { reason, note } },
                );
                setOpen(false);
                onUpdated?.();
                toast.success(
                  updated.refunds?.length
                    ? "Order cancelled. Follow your refund status in order details."
                    : "Order cancelled",
                );
              } catch (err) {
                setError(err.message);
                toast.error(err.message);
                fresh.reload();
                onUpdated?.();
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="cancel-order-summary">
              <span className="cancel-meal-icon">
                <Utensils size={22} />
              </span>
              <div>
                <strong>{order.restaurant_detail?.name}</strong>
                <p>
                  {order.items
                    ?.map((item) => `${item.quantity} × ${item.name}`)
                    .join(" · ")}
                </p>
              </div>
              <span className="status-pill">
                {statusLabel(fresh.data?.status || order.status)}
              </span>
            </div>
            <p className="cancel-window-note">
              <Clock3 size={17} />
              {fresh.loading
                ? "Checking the latest kitchen status…"
                : state?.message}
            </p>
            <ErrorNotice error={fresh.error} onRetry={fresh.reload} />
            {state?.allowed && (
              <>
                <fieldset className="cancel-reasons">
                  <legend>Why are you cancelling?</legend>
                  {[
                    ["ordered_by_mistake", "I placed this order by mistake"],
                    ["wrong_address", "I selected the wrong address"],
                    ["waiting_too_long", "The wait is too long"],
                    ["changed_mind", "I changed my mind"],
                    ["other", "Another reason"],
                  ].map(([value, label]) => (
                    <label
                      key={value}
                      className={reason === value ? "selected" : ""}
                    >
                      <input
                        type="radio"
                        name="cancel-reason"
                        value={value}
                        checked={reason === value}
                        disabled={busy}
                        required
                        onChange={() => setReason(value)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </fieldset>
                <label className="field">
                  <span>
                    {reason === "other"
                      ? "Tell us more"
                      : "Anything else? (optional)"}
                  </span>
                  <textarea
                    required={reason === "other"}
                    maxLength={500}
                    value={note}
                    disabled={busy}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </label>
                {state.refund_amount && (
                  <div className="cancellation-refund-note">
                    <strong>
                      {money(state.refund_amount)} to your original payment
                      method
                    </strong>
                    <p>
                      Cancellation and refund processing are separate. You can
                      track the refund in this order after cancelling.
                    </p>
                  </div>
                )}
              </>
            )}
            <ErrorNotice error={error} />
            <div className="flex-row wrap">
              <button
                type="button"
                className="btn secondary"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Keep my order
              </button>
              <button
                className="btn danger"
                disabled={
                  busy ||
                  !state?.allowed ||
                  !reason ||
                  fresh.loading ||
                  Boolean(fresh.error)
                }
              >
                {busy ? "Cancelling…" : "Confirm cancellation"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
