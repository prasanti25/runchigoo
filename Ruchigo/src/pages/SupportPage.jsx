import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, LifeBuoy, Plus, Send } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { EmptyState, ErrorNotice, Modal } from "../components/product/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { dateTime, useRemote } from "../lib/product.js";
import { apiRequest } from "../lib/api.js";

export default function SupportPage() {
  const { token, isAuthenticated, role } = useAuth();
  const [params] = useSearchParams();
  const [page, setPage] = useState(1);
  const tickets = useRemote(
    token ? `/support/?page=${page}` : null,
    token,
    15000,
  );
  const linkedId = /^[1-9]\d*$/.test(params.get("ticket") || "")
    ? Number(params.get("ticket"))
    : null;
  const linkedTicket = useRemote(
    token && linkedId ? `/support/${linkedId}/` : null,
    token,
    15000,
  );
  const [selected, setSelected] = useState(linkedId);
  const privacyRequest = params.get("category") === "privacy";
  const [creating, setCreating] = useState(
    Boolean(params.get("order")) || privacyRequest,
  );
  const [form, setForm] = useState({
    category: privacyRequest ? "privacy" : "delivery",
    subject: privacyRequest ? "Privacy request" : "",
    message: "",
    order: params.get("order") || "",
  });
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const list = tickets.data?.results || [];
  const ticket =
    list.find((item) => item.id === selected) ||
    (selected === linkedId ? linkedTicket.data : null) ||
    list[0];
  const mutate = async (path, body, done) => {
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest(path, { token, method: "POST", body });
      tickets.reload();
      linkedTicket.reload();
      done?.(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className="container">
          <div className="page-heading">
            <p className="eyebrow">A REAL HAND WHEN YOU NEED ONE</p>
            <div className="section-title">
              <div>
                <h1>Let’s make it right.</h1>
                <p className="muted mt-3">
                  Order questions, missing items or account help. We’re
                  listening.
                </p>
              </div>
              {isAuthenticated && (
                <button
                  className="btn primary"
                  onClick={() => setCreating(true)}
                >
                  <Plus size={17} />
                  New ticket
                </button>
              )}
            </div>
          </div>
          {!isAuthenticated ? (
            <section className="panel">
              <LifeBuoy size={30} color="#7e9467" />
              <h2 className="mt-5">Your support, in one place.</h2>
              <p className="muted mt-3">
                Sign in to tell us what happened and follow the conversation.
              </p>
              <Link to="/login" className="btn primary mt-5">
                Sign in for support
                <ArrowRight size={16} />
              </Link>
              <Link to="/faq" className="text-link ml-5">
                Read FAQs
              </Link>
              <p className="form-help mt-5">
                Can’t sign in? Email{" "}
                <a className="text-link" href="mailto:Support@ruchigo.online">
                  Support@ruchigo.online
                </a>
                . Never include passwords or payment PINs.
              </p>
            </section>
          ) : (
            <>
              <ErrorNotice
                error={tickets.error || linkedTicket.error || error}
                onRetry={tickets.error ? tickets.reload : undefined}
              />
              {tickets.loading && (
                <p className="muted">Loading your support conversations…</p>
              )}
              {list.length ? (
                <div className="support-layout">
                  <aside className="ticket-list">
                    {list.map((item) => (
                      <button
                        className={item.id === ticket?.id ? "active" : ""}
                        key={item.id}
                        onClick={() => {
                          setSelected(item.id);
                          setReply("");
                          setError("");
                        }}
                      >
                        <h3>{item.subject}</h3>
                        <span className="tiny muted">
                          #{item.id} · {item.status.replaceAll("_", " ")}
                        </span>
                      </button>
                    ))}
                  </aside>
                  {ticket && (
                    <section className="panel">
                      <div className="flex-row between">
                        <div>
                          <h2>{ticket.subject}</h2>
                          <p className="muted mt-2">
                            Ticket #{ticket.id}
                            {ticket.order && ` · Order #${ticket.order}`}
                          </p>
                        </div>
                        <span className="status-pill">
                          {ticket.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      {ticket.messages.map((message) => (
                        <article
                          key={message.id}
                          className={`ticket-message ${message.from_support ? "from-support" : ""}`}
                        >
                          <p>{message.body}</p>
                          <small>
                            {message.from_support
                              ? "RuchiGo support"
                              : role === "admin"
                                ? "Customer"
                                : "You"}{" "}
                            · {dateTime(message.created_at)}
                          </small>
                        </article>
                      ))}
                      <form
                        className="form-stack"
                        onSubmit={(event) => {
                          event.preventDefault();
                          mutate(
                            `/support/${ticket.id}/reply/`,
                            { message: reply },
                            () => setReply(""),
                          );
                        }}
                      >
                        <label className="field">
                          <span>
                            {ticket.status === "resolved"
                              ? "Still need a hand? Reply to reopen."
                              : "Your reply"}
                          </span>
                          <textarea
                            required
                            maxLength={3000}
                            value={reply}
                            onChange={(event) => setReply(event.target.value)}
                            placeholder="Add a message…"
                          />
                        </label>
                        <div className="flex-row between">
                          <button
                            className="btn primary"
                            disabled={busy || !reply.trim()}
                          >
                            <Send size={15} />
                            Send reply
                          </button>
                          {ticket.status !== "resolved" && (
                            <button
                              type="button"
                              className="text-link"
                              disabled={busy}
                              onClick={() =>
                                mutate(`/support/${ticket.id}/resolve/`, {})
                              }
                            >
                              <Check size={16} />
                              Mark resolved
                            </button>
                          )}
                        </div>
                      </form>
                    </section>
                  )}
                </div>
              ) : (
                !tickets.loading &&
                !tickets.error && (
                  <EmptyState
                    title="No open conversations"
                    description="Need a hand? Create a ticket and our team will respond here."
                  />
                )
              )}
            </>
          )}
          {tickets.data && (tickets.data.next || tickets.data.previous) && (
            <div className="pagination">
              <button
                className="btn secondary"
                disabled={!tickets.data.previous}
                onClick={() => {
                  setPage(page - 1);
                  setReply("");
                }}
              >
                Previous tickets
              </button>
              <span>Page {page}</span>
              <button
                className="btn secondary"
                disabled={!tickets.data.next}
                onClick={() => {
                  setPage(page + 1);
                  setReply("");
                }}
              >
                Next tickets
              </button>
            </div>
          )}
          <section className="discovery-section">
            <h2>Quick answers</h2>
            {[
              [
                "Can I cancel my order?",
                "Cash orders can be cancelled from Your orders before the restaurant accepts. Prepaid cancellation, refund requests and changes after acceptance require a support ticket.",
              ],
              [
                "An item is missing or incorrect.",
                "Open a ticket, choose Missing item or Wrong item, and include your order number. The support team can review the issue with the restaurant.",
              ],
              [
                "How do I confirm my delivery?",
                "Share the six-digit delivery code with your partner only after your food reaches you. Find it on your tracking page.",
              ],
            ].map(([q, a]) => (
              <details className="faq-item" key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </section>
        </div>
      </main>
      {creating && isAuthenticated && (
        <Modal title="Tell us what happened" onClose={() => setCreating(false)}>
          <form
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              mutate(
                "/support/",
                { ...form, order: form.order || null },
                (result) => {
                  setSelected(result.id);
                  setPage(1);
                  setCreating(false);
                  setForm({
                    category: "other",
                    subject: "",
                    message: "",
                    order: "",
                  });
                },
              );
            }}
          >
            <div className="form-grid">
              <label className="field">
                <span id="ticket-topic-label">Topic</span>
                <select
                  aria-labelledby="ticket-topic-label"
                  aria-describedby={
                    form.category === "privacy"
                      ? "privacy-request-help"
                      : undefined
                  }
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  {[
                    "delivery",
                    "missing_item",
                    "wrong_item",
                    "food_quality",
                    "payment",
                    "refund",
                    "account",
                    "privacy",
                    "other",
                  ].map((category) => (
                    <option key={category} value={category}>
                      {category.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                {form.category === "privacy" && (
                  <p className="form-help" id="privacy-request-help">
                    Describe your access, correction or deletion request. This
                    creates a support ticket; it does not automatically delete
                    account or order records.
                  </p>
                )}
              </label>
              <label className="field">
                <span>Order ID (optional)</span>
                <input
                  inputMode="numeric"
                  type="number"
                  min="1"
                  value={form.order}
                  onChange={(event) =>
                    setForm({ ...form, order: event.target.value })
                  }
                />
              </label>
            </div>
            <label className="field">
              <span>Subject</span>
              <input
                required
                maxLength={150}
                value={form.subject}
                onChange={(event) =>
                  setForm({ ...form, subject: event.target.value })
                }
              />
            </label>
            <label className="field">
              <span>What happened?</span>
              <textarea
                required
                maxLength={3000}
                value={form.message}
                onChange={(event) =>
                  setForm({ ...form, message: event.target.value })
                }
              />
            </label>
            <ErrorNotice error={error} />
            <button className="btn primary" disabled={busy}>
              {busy ? "Sending…" : "Create support ticket"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
