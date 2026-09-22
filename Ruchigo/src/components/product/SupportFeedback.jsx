import { useState } from "react";
import { Annoyed, Check, Frown, Laugh, Meh, Smile } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { ErrorNotice } from "./UI.jsx";

const faces = [
  [1, "Very unhappy", Frown],
  [2, "Unhappy", Annoyed],
  [3, "Okay", Meh],
  [4, "Happy", Smile],
  [5, "Delighted", Laugh],
];
export default function SupportFeedback({ ticket, onSaved }) {
  const { token, role } = useAuth();
  const [score, setScore] = useState(ticket.feedback_score || 0);
  const [comment, setComment] = useState(ticket.feedback_comment || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (role === "admin")
    return ticket.feedback_score ? (
      <p className="support-feedback-summary">
        Customer rated this conversation {ticket.feedback_score}/5
        {ticket.feedback_comment ? ` · ${ticket.feedback_comment}` : ""}
      </p>
    ) : null;
  if (ticket.status !== "resolved") return null;
  return (
    <form
      className="support-feedback"
      aria-label="Rate support conversation"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!score || busy) return;
        setBusy(true);
        setError("");
        try {
          await apiRequest(`/support/${ticket.id}/feedback/`, {
            token,
            method: "POST",
            body: { score, comment },
          });
          onSaved?.();
        } catch (err) {
          setError(err.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>
        {ticket.feedback_score
          ? "Thanks for telling us how we did"
          : "How was this conversation?"}
      </h3>
      <p>Your feedback helps improve RuchiGo support.</p>
      <div
        className="support-feedback-faces"
        role="group"
        aria-label="Conversation experience"
      >
        {faces.map(([value, name, Icon]) => (
          <button
            type="button"
            key={value}
            aria-label={name}
            aria-pressed={score === value}
            className={score === value ? "selected" : ""}
            disabled={busy}
            onClick={() => setScore(value)}
          >
            <Icon size={30} strokeWidth={1.7} />
            <span>{name}</span>
          </button>
        ))}
      </div>
      {score > 0 && (
        <>
          <label className="field">
            <span>
              Anything else? <small>(optional)</small>
            </span>
            <textarea
              value={comment}
              maxLength={1000}
              onChange={(event) => setComment(event.target.value)}
              placeholder="What could we do better?"
            />
          </label>
          <button className="btn secondary" disabled={busy}>
            <Check size={15} />
            {busy
              ? "Saving…"
              : ticket.feedback_score
                ? "Update feedback"
                : "Send feedback"}
          </button>
        </>
      )}
      <ErrorNotice error={error} />
    </form>
  );
}
