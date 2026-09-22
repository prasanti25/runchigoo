import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, LifeBuoy, Plus } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { EmptyState, ErrorNotice, Modal } from "../components/product/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { orderNumber, statusLabel, useRemote } from "../lib/product.js";
import { apiRequest } from "../lib/api.js";
import FoodAssistant from "../components/product/FoodAssistant.jsx";
import OrderHelp from "../components/product/OrderHelp.jsx";
import OrderIssueChat from "../components/product/OrderIssueChat.jsx";
import SupportThread from "../components/product/SupportThread.jsx";
import { hasAdminScope } from "../lib/adminAccess.js";

const supportTopics = {
  food_quality: "Food quality issue",
  missing_item: "Missing or incorrect items",
  wrong_item: "Incorrect items",
  refund: "Payment or refund help",
  payment: "Payment help",
  privacy: "Privacy request",
};

export default function SupportPage() {
  const { user } = useAuth();
  if (user?.role === "admin" && !hasAdminScope(user, "support"))
    return (
      <main className="container customer-main">
        <h1>Support access required</h1>
        <p>Ask a superuser to assign the support workspace to your account.</p>
        <Link className="btn secondary mt-5" to="/admin-dashboard">
          Back to your workspace
        </Link>
      </main>
    );
  return <SupportWorkspace />;
}

function SupportWorkspace() {
  const { token, isAuthenticated, role } = useAuth();
  const [params, setParams] = useSearchParams();
  const orderId = /^[1-9]\d*$/.test(params.get("order") || "")
    ? Number(params.get("order"))
    : null;
  const linkedOrder = useRemote(
    token && orderId && role === "customer" ? `/orders/${orderId}/` : null,
    token,
    10000,
  );
  const [page, setPage] = useState(1);
  const tickets = useRemote(
    token
      ? `/support/?page=${page}${orderId ? `&order=${orderId}` : ""}`
      : null,
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
  useEffect(() => {
    if (!linkedId) return;
    const timer = window.setTimeout(() => setSelected(linkedId), 0);
    return () => window.clearTimeout(timer);
  }, [linkedId]);
  const privacyRequest = params.get("category") === "privacy";
  const requestedTopic = Object.hasOwn(supportTopics, params.get("category"))
    ? params.get("category")
    : "delivery";
  const [creating, setCreating] = useState(
    params.get("compose") === "1" || privacyRequest,
  );
  const [form, setForm] = useState({
    category: requestedTopic,
    subject: supportTopics[requestedTopic] || "",
    message: "",
    order: params.get("order") || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const compose = params.get("compose") === "1";
  useEffect(() => {
    if (!compose) return;
    // Defer to let route state settle when a chat link opens a ticket in-place.
    const timer = window.setTimeout(() => {
      setForm((current) => ({
        ...current,
        order: orderId || "",
        category: requestedTopic,
        subject: supportTopics[requestedTopic] || current.subject,
      }));
      setCreating(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [compose, orderId, requestedTopic]);
  const closeComposer = () => {
    setCreating(false);
    if (compose) {
      const next = new URLSearchParams(params);
      next.delete("compose");
      setParams(next, { replace: true });
    }
  };
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
  const created = (result) => {
    setSelected(result.id);
    setPage(1);
    setCreating(false);
    const next = new URLSearchParams(params);
    next.delete("compose");
    next.delete("category");
    next.set("ticket", result.id);
    setParams(next, { replace: true });
    setForm({
      category: "other",
      subject: "",
      message: "",
      order: orderId || "",
    });
  };
  const issueChat =
    creating &&
    linkedOrder.data &&
    [
      "food_quality",
      "missing_item",
      "wrong_item",
      "refund",
      "payment",
    ].includes(form.category);
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className="container">
          <div className="page-heading">
            <p className="eyebrow">HELP & SUPPORT</p>
            <div className="section-title">
              <div>
                <h1>Let’s sort it out.</h1>
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
          <ErrorNotice error={linkedOrder.error} onRetry={linkedOrder.reload} />
          {linkedOrder.data && (
            <Link to={`/tracking/${orderId}`} className="support-order-context">
              <div>
                <strong>{linkedOrder.data.restaurant_detail?.name}</strong>
                <span>
                  Order #{orderNumber(linkedOrder.data)} ·{" "}
                  {statusLabel(linkedOrder.data.status)}
                </span>
              </div>
              <ArrowRight size={18} />
            </Link>
          )}
          {issueChat ? (
            <OrderIssueChat
              key={`${orderId}:${form.category}`}
              order={linkedOrder.data}
              category={form.category}
              busy={busy}
              error={error}
              onClose={closeComposer}
              onSubmit={(body) => mutate("/support/", body, created)}
            />
          ) : (
            linkedOrder.data && (
              <OrderHelp
                order={linkedOrder.data}
                onChoose={(category, subject) => {
                  setForm({ category, subject, message: "", order: orderId });
                  setError("");
                  setCreating(true);
                }}
              />
            )
          )}
          {role !== "admin" && !issueChat && !ticket && !linkedId && (
            <FoodAssistant support orderId={orderId} />
          )}
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
              {list.length || linkedTicket.data ? (
                <div className="support-layout">
                  <aside className="ticket-list">
                    {list.map((item) => (
                      <button
                        className={item.id === ticket?.id ? "active" : ""}
                        key={item.id}
                        onClick={() => {
                          setSelected(item.id);
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
                  {ticket && <SupportThread key={ticket.id} ticket={ticket} />}
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
                "Open Your orders → order details to check the cancellation window saved at checkout. Eligible orders show Cancel order. Self-service cancellation is unavailable once cooking starts. If the window has closed or a payment needs review, choose Get help. A refund request is not a completed refund.",
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
      {creating && isAuthenticated && !issueChat && (
        <Modal title="Tell us what happened" onClose={closeComposer}>
          <form
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              mutate(
                "/support/",
                { ...form, order: form.order || null },
                created,
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
            {form.order &&
              ["refund", "food_quality", "missing_item", "wrong_item"].includes(
                form.category,
              ) && (
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={Boolean(form.request_refund)}
                    onChange={(event) =>
                      setForm({ ...form, request_refund: event.target.checked })
                    }
                  />
                  Request a refund review for this order
                </label>
              )}
            <button className="btn primary" disabled={busy}>
              {busy ? "Sending…" : "Create support ticket"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
