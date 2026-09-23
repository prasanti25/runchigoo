import { useState } from "react";
import { Link } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { money, statusLabel, useRemote } from "../../lib/product.js";
import { ErrorNotice, Modal } from "./UI.jsx";
import { hasAdminScope } from "../../lib/adminAccess.js";

export default function OrderOperations({ order, onUpdated, ticketId }) {
  const { token, role, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState("issue");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fresh = useRemote(open ? `/orders/${order.id}/` : null, token, 5000);
  const current = fresh.data;
  const paid = current?.payment?.status === "paid";
  const active = !["awaiting_payment", "cancelled", "delivered"].includes(
    order.status,
  );
  const personal = order.customer === user?.id;
  const staff =
    !personal && (hasAdminScope(user, "orders") || role === "restaurant");
  if (!active) return null;
  return (
    <>
      {order.fulfillment_paused_at && (
        <section className="fulfillment-hold" role="status">
          <CircleAlert size={20} />
          <div>
            <strong>This order is on hold</strong>
            <p>
              A fulfilment issue needs a support decision. Preparation,
              assignment, pickup and delivery are paused.
            </p>
            {personal && (
              <Link
                className="text-link"
                to={`/support?ticket=${order.fulfillment_issue}`}
              >
                Open this support conversation
              </Link>
            )}
          </div>
        </section>
      )}
      {staff &&
        !(role === "restaurant" && order.status === "out_for_delivery") && (
          <button
            className="btn secondary"
            onClick={() => {
              setAction(
                order.fulfillment_paused_at && role === "admin"
                  ? "resume"
                  : "issue",
              );
              setError("");
              setConfirmed(false);
              setOpen(true);
            }}
          >
            <CircleAlert size={15} />
            {role === "admin"
              ? "Support actions"
              : order.fulfillment_paused_at
                ? "View reported issue"
                : "Report a fulfilment issue"}
          </button>
        )}
      {open && (
        <Modal
          title={
            role === "admin"
              ? "Review an order issue"
              : "Problem fulfilling this order?"
          }
          onClose={() => {
            if (!busy) setOpen(false);
          }}
        >
          <form
            className="form-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              if (busy || !current || fresh.error) return;
              setBusy(true);
              setError("");
              try {
                await apiRequest(`/order-operations/${order.id}/${action}/`, {
                  token,
                  method: "POST",
                  body: {
                    note,
                    expected_status: current.status,
                    ...(action === "cancel"
                      ? {
                          confirm_cancel: confirmed,
                          refund_amount: paid ? current.payment.amount : "0",
                          ...(ticketId ? { ticket_id: ticketId } : {}),
                        }
                      : {}),
                  },
                });
                setOpen(false);
                onUpdated?.();
                toast.success(
                  action === "cancel"
                    ? paid
                      ? "Order cancelled; refund approved and awaiting processing."
                      : "Order cancelled by support."
                    : action === "resume"
                      ? "Order resumed."
                      : "Issue reported. Fulfilment is on hold.",
                );
              } catch (err) {
                setError(err.message);
                fresh.reload();
              } finally {
                setBusy(false);
              }
            }}
          >
            <p className="muted">
              {order.restaurant_detail?.name} ·{" "}
              {statusLabel(current?.status || order.status)}
            </p>
            <ErrorNotice error={fresh.error} onRetry={fresh.reload} />
            {role === "admin" && (
              <label className="field">
                <span>Support decision</span>
                <select
                  value={action}
                  onChange={(event) => {
                    setAction(event.target.value);
                    setConfirmed(false);
                  }}
                >
                  <option value="issue">Pause fulfilment for review</option>
                  <option
                    value="resume"
                    disabled={!current?.fulfillment_paused_at}
                  >
                    Resume fulfilment
                  </option>
                  <option
                    value="cancel"
                    disabled={!hasAdminScope(user, "finance")}
                  >
                    Cancel order with a recorded decision
                  </option>
                </select>
              </label>
            )}
            <p className="form-help">
              {action === "cancel"
                ? paid
                  ? `This cancels the order and approves ${money(current.payment.amount)} to the original payment method. It does not submit or complete the refund; process it from the support conversation.`
                  : "This closes the order and notifies the customer and kitchen. Prepared food is not returned to available stock."
                : action === "resume"
                  ? "Only resume after confirming the issue is resolved with the kitchen or rider. This keeps the current order stage; it does not rewind progress."
                  : "The customer and support team will see your note. The order is put on hold; no refund or cancellation is performed."}
            </p>
            <label className="field">
              <span>Decision note (visible to customer)</span>
              <textarea
                required
                maxLength={1000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
            {action === "cancel" && (
              <label className="check-label">
                <input
                  type="checkbox"
                  required
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                />
                {paid
                  ? `I approve cancellation and the full ${money(current.payment.amount)} original-method refund.`
                  : "I confirm this support cancellation."}
              </label>
            )}
            <ErrorNotice error={error} />
            <button
              className={`btn ${action === "cancel" ? "danger" : "primary"}`}
              disabled={
                busy ||
                fresh.loading ||
                !current ||
                Boolean(fresh.error) ||
                !note.trim() ||
                (action === "cancel" && !confirmed)
              }
            >
              {busy
                ? "Saving…"
                : action === "cancel"
                  ? "Confirm support cancellation"
                  : action === "resume"
                    ? "Resume this order"
                    : "Report issue and pause"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
