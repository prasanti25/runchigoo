import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MessageCircle,
  ReceiptText,
  Send,
  X,
} from "lucide-react";
import { ErrorNotice } from "./UI.jsx";
import { money } from "../../lib/product.js";

export default function OrderIssueChat({
  order,
  category,
  onSubmit,
  onClose,
  busy,
  error,
}) {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [resolution, setResolution] = useState(null);
  const foodIssue = ["food_quality", "missing_item", "wrong_item"].includes(
    category,
  );
  const canReviewRefund = order.payment?.status === "paid";
  const online = order.payment?.method === "razorpay";
  const topics = {
    food_quality: "Food quality issue",
    missing_item: "Missing or incorrect items",
    wrong_item: "Incorrect items",
    refund: "Payment or refund help",
    payment: "Payment help",
  };
  return (
    <section
      className="order-issue-chat panel"
      aria-label="Order support conversation"
    >
      <header className="flex-row between">
        <div className="flex-row">
          <MessageCircle size={22} />
          <div>
            <h2>Let’s make this right</h2>
            <p className="muted">
              {order.restaurant_detail?.name} · Order support
            </p>
          </div>
        </div>
        <button
          className="icon-button"
          aria-label="Close issue conversation"
          disabled={busy}
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </header>
      <div className="issue-chat-bubble">
        <p>
          {category === "food_quality"
            ? "I’m sorry your meal wasn’t right. If it seems spoiled or unsafe, please don’t eat it. Which dishes were affected?"
            : foodIssue
              ? "Let’s check that with the kitchen. Which items need attention?"
              : "I can help you open a payment review for this order. First, tell us what happened."}
        </p>
      </div>
      {step === 1 && (
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            setStep(2);
          }}
        >
          {foodIssue && (
            <fieldset className="issue-dish-picker">
              <legend>Affected dishes</legend>
              {order.items?.map((item) => (
                <label className="check-label" key={item.id}>
                  <input
                    type="checkbox"
                    checked={items.includes(item.id)}
                    onChange={(event) =>
                      setItems(
                        event.target.checked
                          ? [...items, item.id]
                          : items.filter((id) => id !== item.id),
                      )
                    }
                  />
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                </label>
              ))}
            </fieldset>
          )}
          <label className="field">
            <span>
              {foodIssue ? "What was wrong with the food?" : "What happened?"}
            </span>
            <textarea
              autoFocus
              required
              minLength={5}
              maxLength={3000}
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={
                foodIssue
                  ? "For example, the food smelled sour or an item was missing…"
                  : "Tell us about the payment or refund you need help with…"
              }
            />
          </label>
          <button className="btn primary" disabled={foodIssue && !items.length}>
            Continue <ArrowRight size={16} />
          </button>
        </form>
      )}
      {step >= 2 && (
        <>
          <div className="issue-chat-bubble customer">
            <p>{message}</p>
            {!!items.length && (
              <small>
                {order.items
                  .filter((item) => items.includes(item.id))
                  .map((item) => item.name)
                  .join(" · ")}
              </small>
            )}
          </div>
          <div className="issue-chat-bubble">
            <p>Thanks for explaining. How would you like us to help?</p>
          </div>
          <div className="issue-resolution-choices">
            <button
              className={resolution === "refund" ? "selected" : ""}
              disabled={!canReviewRefund || busy}
              onClick={() => setResolution("refund")}
            >
              <ReceiptText size={23} />
              <span>
                <strong>Request a refund review</strong>
                <small>
                  {canReviewRefund
                    ? online
                      ? "If approved, back to your original payment method"
                      : "Cash payment: support will explain available return options"
                    : "No confirmed payment to refund. Choose payment support below."}
                </small>
              </span>
              {resolution === "refund" && <Check size={18} />}
            </button>
            <button
              className={resolution === "support" ? "selected" : ""}
              disabled={busy}
              onClick={() => setResolution("support")}
            >
              <MessageCircle size={23} />
              <span>
                <strong>Talk to support</strong>
                <small>
                  Ask a question or get help without requesting a refund
                </small>
              </span>
              {resolution === "support" && <Check size={18} />}
            </button>
          </div>
          {resolution && (
            <div className="issue-chat-bubble">
              <p>
                {resolution === "refund"
                  ? `Would you like to submit a review for this ${money(order.total)} order? ${online ? "Any approved online refund goes back to the original payment method. We won’t ask for an OTP, UPI PIN or another account." : "This does not start an automatic cash payout."} Support will confirm the eligible amount after reviewing your issue.`
                  : "Would you like to send this to the support team? Your order and selected dishes will be attached, so you don’t need to explain them again."}
              </p>
            </div>
          )}
          <ErrorNotice error={error} />
          <div className="flex-row wrap">
            <button
              className="btn secondary"
              disabled={busy}
              onClick={() => setStep(1)}
            >
              <ArrowLeft size={15} />
              Edit details
            </button>
            <button
              className="btn primary"
              disabled={busy || !resolution}
              onClick={() =>
                onSubmit({
                  order: order.id,
                  category,
                  subject: topics[category] || "Help with my order",
                  message,
                  affected_item_ids: items,
                  request_refund: resolution === "refund",
                })
              }
            >
              <Send size={16} />
              {busy
                ? "Sending…"
                : resolution === "refund"
                  ? "Yes, request a review"
                  : "Send to support"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
