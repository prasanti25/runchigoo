import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Star, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { ErrorNotice, Modal } from "./UI.jsx";

const labels = [
  "Tap a star to rate your meal",
  "Disappointing",
  "Could be better",
  "It was okay",
  "Really good",
  "Loved it",
];

export default function OrderReview({
  order,
  onSaved,
  compact = false,
  nudge = false,
  onDismiss,
}) {
  const [open, setOpen] = useState(false);
  const [initialRating, setInitialRating] = useState(0);
  if (order.status !== "delivered") return null;
  const review = order.review;
  return (
    <>
      {nudge ? (
        <aside
          className="recent-review-nudge"
          aria-label="Review your recent meal"
        >
          <div>
            <strong>{order.restaurant_detail?.name}</strong>
            <span>How was your food?</span>
          </div>
          <div
            className="nudge-stars"
            role="group"
            aria-label="Rate your recent meal"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Rate recent meal ${value} stars`}
                onClick={() => {
                  setInitialRating(value);
                  setOpen(true);
                }}
              >
                <Star size={23} />
              </button>
            ))}
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Dismiss rating reminder"
            onClick={onDismiss}
          >
            <X size={17} />
          </button>
        </aside>
      ) : compact ? (
        <button className="btn secondary" onClick={() => setOpen(true)}>
          <Star size={15} />
          {review ? `Rated ${review.rating}/5 · Edit` : "Rate meal"}
        </button>
      ) : (
        <section className="order-review-card" aria-label="Rate your order">
          <div className="review-card-icon">
            {review ? <Check size={24} /> : <Star size={24} />}
          </div>
          <div>
            <h2>
              {review ? "Thanks for your feedback" : "How was your food?"}
            </h2>
            <p>
              {review
                ? `You rated ${order.restaurant_detail?.name} ${review.rating} out of 5.`
                : `Rate your meal from ${order.restaurant_detail?.name}.`}
            </p>
            {review?.comment && (
              <p className="saved-review-comment">{review.comment}</p>
            )}
            <div
              className="inline-meal-stars"
              role="group"
              aria-label="Rate your meal"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Rate meal ${value} stars`}
                  onClick={() => {
                    setInitialRating(value);
                    setOpen(true);
                  }}
                >
                  <Star
                    size={26}
                    fill={
                      value <= (review?.rating || 0) ? "currentColor" : "none"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <button
            className="btn dark"
            onClick={() => {
              setInitialRating(0);
              setOpen(true);
            }}
          >
            {review ? "Edit review" : "Rate meal"}
            <Star size={15} />
          </button>
        </section>
      )}
      {open && (
        <ReviewForm
          order={order}
          initialRating={initialRating}
          onClose={() => setOpen(false)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}

function ReviewForm({ order, onClose, onSaved, initialRating }) {
  const { token } = useAuth();
  const [rating, setRating] = useState(
    initialRating || order.review?.rating || 0,
  );
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(order.review?.comment || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    if (!rating || busy) return;
    setBusy(true);
    setError("");
    try {
      await apiRequest(
        order.review ? `/reviews/${order.review.id}/` : "/reviews/",
        {
          token,
          method: order.review ? "PATCH" : "POST",
          body: {
            ...(order.review ? {} : { order: order.id }),
            rating,
            comment: comment.trim(),
          },
        },
      );
      toast.success(
        order.review
          ? "Your review has been updated"
          : "Thanks for sharing your experience!",
      );
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title="How was your meal?"
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form className="form-stack review-form" onSubmit={save}>
        <div className="review-restaurant">
          <strong>{order.restaurant_detail?.name}</strong>
          <p>
            {order.items
              ?.map((item) => `${item.quantity} × ${item.name}`)
              .join(" · ")}
          </p>
        </div>
        <div
          className="meal-rating"
          role="group"
          aria-label="Meal rating"
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} stars`}
              aria-pressed={rating === value}
              disabled={busy}
              onMouseEnter={() => setHovered(value)}
              onFocus={() => setHovered(value)}
              onBlur={() => setHovered(0)}
              onClick={() => setRating(value)}
            >
              <Star
                size={34}
                fill={value <= (hovered || rating) ? "currentColor" : "none"}
              />
            </button>
          ))}
        </div>
        <p
          className={`meal-rating-label ${rating ? "selected" : ""}`}
          aria-live="polite"
        >
          {labels[hovered || rating]}
        </p>
        <label className="field">
          <span>
            Anything you’d like to share?{" "}
            <small className="muted">(optional)</small>
          </span>
          <textarea
            maxLength={2000}
            rows={4}
            value={comment}
            disabled={busy}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Tell us about the taste, portions or packaging…"
          />
        </label>
        <p className="review-privacy">
          Your first name, rating and feedback appear with restaurant reviews.
          Please leave out personal details.
        </p>
        {rating > 0 && rating <= 2 && (
          <Link
            className="review-issue-link"
            to={`/support?order=${order.id}&category=food_quality&compose=1`}
          >
            Food spoiled or unsafe? Report a food-quality issue and request a
            refund review.
          </Link>
        )}
        <ErrorNotice error={error} />
        <button className="btn primary w-full" disabled={busy || !rating}>
          {busy
            ? "Saving your review…"
            : order.review
              ? "Update review"
              : "Share your review"}
        </button>
        <Link
          className="text-link review-help"
          to={`/support?order=${order.id}`}
        >
          Something went wrong? Get help with this order
        </Link>
      </form>
    </Modal>
  );
}
