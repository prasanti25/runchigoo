import { useState } from "react";
import LoadingScreen from "../components/common/LoadingScreen.jsx";
import { Eye, EyeOff, Search, Star } from "lucide-react";
import toast from "react-hot-toast";
import { WorkspaceFrame } from "../components/product/Workspace.jsx";
import { EmptyState, ErrorNotice, Modal } from "../components/product/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import { dateTime, useRemote } from "../lib/product.js";

export default function OperationsWorkspace({ reviews = false }) {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("");
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const remote = useRemote(
    `/${reviews ? "review-moderation" : "audit-logs"}/?page=${page}&search=${encodeURIComponent(search)}${reviews && visibility ? `&is_visible=${visibility}` : ""}`,
    token,
  );
  const moderate = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/review-moderation/${selected.id}/visibility/`, {
        token,
        method: "POST",
        body: { is_visible: !selected.is_visible, reason },
      });
      setSelected(null);
      remote.reload();
      toast.success("Review visibility updated and logged");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <WorkspaceFrame
      type="admin"
      title={
        reviews ? "Keep the conversation fair." : "A record of what changed."
      }
      description={
        reviews
          ? "Moderate reviews with a recorded reason. Hidden reviews do not contribute to public ratings."
          : "Read-only history of recorded order, delivery, approval, support and moderation actions."
      }
    >
      <form
        className="filter-bar"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(query);
          setPage(1);
        }}
      >
        <label className="field flex-1">
          <span className="sr-only">
            Search {reviews ? "reviews" : "activity"}
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              reviews
                ? "Search restaurant or review…"
                : "Search action, account or target…"
            }
          />
        </label>
        {reviews && (
          <label className="field">
            <span className="sr-only">Review visibility</span>
            <select
              value={visibility}
              onChange={(event) => {
                setVisibility(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All reviews</option>
              <option value="true">Published</option>
              <option value="false">Hidden</option>
            </select>
          </label>
        )}
        <button className="btn dark">
          <Search size={17} />
          Search
        </button>
      </form>
      <ErrorNotice error={remote.error} onRetry={remote.reload} />
      {remote.loading && (
        <LoadingScreen inline message="Loading records…" />
      )}
      {reviews ? (
        <div className="kitchen-grid">
          {remote.data?.results.map((review) => (
            <article className="panel" key={review.id}>
              <div className="flex-row between">
                <h2>{review.restaurant_name}</h2>
                <span
                  className={`status-pill ${review.is_visible ? "" : "cancelled"}`}
                >
                  {review.is_visible ? "Published" : "Hidden"}
                </span>
              </div>
              <p className="flex-row mt-4">
                <Star size={16} />
                {review.rating}/5{" "}
                <span className="muted">· Order #{review.order}</span>
              </p>
              <p className="review-copy mt-4">
                {review.comment || "No written comment."}
              </p>
              <p className="form-help">{dateTime(review.created_at)}</p>
              <button
                className="btn secondary mt-4"
                onClick={() => {
                  setSelected(review);
                  setReason("");
                  setError("");
                }}
              >
                {review.is_visible ? <EyeOff size={16} /> : <Eye size={16} />}
                {review.is_visible ? "Hide review" : "Publish review"}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="audit-list">
          {remote.data?.results.map((entry) => (
            <article className="panel" key={entry.id}>
              <div className="flex-row between">
                <h2>{entry.action}</h2>
                <time className="muted">{dateTime(entry.created_at)}</time>
              </div>
              <p className="muted mt-3">
                {entry.actor_email || "System / deleted account"} · Target{" "}
                {entry.target}
              </p>
              {Object.keys(entry.metadata || {}).length > 0 && (
                <details className="mt-3">
                  <summary>Action details</summary>
                  <pre>{JSON.stringify(entry.metadata, null, 2)}</pre>
                </details>
              )}
            </article>
          ))}
        </div>
      )}
      {!remote.loading && !remote.error && !remote.data?.count && (
        <EmptyState
          title="No matching records"
          description="Try a different search or check back after the next activity."
        />
      )}
      {(remote.data?.next || remote.data?.previous) && (
        <div className="pagination">
          <button
            className="btn secondary"
            disabled={!remote.data.previous}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            className="btn secondary"
            disabled={!remote.data.next}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
      {selected && (
        <Modal
          title={
            selected.is_visible ? "Hide this review?" : "Publish this review?"
          }
          onClose={() => setSelected(null)}
        >
          <form className="form-stack" onSubmit={moderate}>
            <p className="muted">
              The review text is preserved. This action and your reason will be
              recorded in the activity log.
            </p>
            <label className="field">
              <span>Reason for moderation</span>
              <textarea
                required
                maxLength={500}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <ErrorNotice error={error} />
            <button className="btn primary" disabled={busy || !reason.trim()}>
              {busy ? "Saving…" : "Confirm visibility change"}
            </button>
          </form>
        </Modal>
      )}
    </WorkspaceFrame>
  );
}
