import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Headphones, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import {
  dateTime,
  orderNumber,
  statusLabel,
  useRemote,
} from "../../lib/product.js";
import { ErrorNotice } from "./UI.jsx";
import RefundStatus from "./RefundStatus.jsx";
import SupportFeedback from "./SupportFeedback.jsx";
import OrderOperations from "./OrderOperations.jsx";

export default function SupportThread({ ticket }) {
  const { token, role } = useAuth();
  const [updated, setUpdated] = useState(null);
  const current =
    updated && new Date(updated.updated_at) >= new Date(ticket.updated_at)
      ? updated
      : ticket;
  const order = useRemote(
    current.order ? `/orders/${current.order}/` : null,
    token,
    5000,
  );
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingText, setPendingText] = useState("");
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState("");
  const [responseError, setResponseError] = useState("");
  const [retry, setRetry] = useState(0);
  const attempts = useRef(new Set());
  const clientKey = useRef(null);
  const log = useRef(null);
  const lastCustomer = current.messages
    .filter((message) => !message.from_support)
    .at(-1);
  const needsResponse =
    role === "customer" &&
    current.status !== "resolved" &&
    !current.staff_requested_at &&
    Boolean(lastCustomer) &&
    !current.messages.some((message) => message.reply_to === lastCustomer.id);
  const messageId = lastCustomer?.id;
  useEffect(() => {
    if (!needsResponse) return;
    const key = `${current.id}:${messageId}:${retry}`;
    if (attempts.current.has(key)) return;
    let active = true;
    // The indicator follows the actual request, not a simulated typing timer.
    queueMicrotask(() => {
      if (!active) return;
      attempts.current.add(key);
      setResponding(true);
      setResponseError("");
      apiRequest(`/support/${current.id}/respond/`, {
        token,
        method: "POST",
        body: { message_id: messageId },
      })
        .then((result) => {
          if (active) {
            setResponding(false);
            setUpdated(result);
          }
        })
        .catch((err) => {
          if (active) setResponseError(err.message);
        })
        .finally(() => {
          if (active) setResponding(false);
        });
    });
    return () => {
      active = false;
    };
  }, [needsResponse, current.id, messageId, token, retry]);
  useEffect(() => {
    log.current?.scrollTo({
      top: log.current.scrollHeight,
      behavior: "instant",
    });
  }, [current.messages.length, responding, pendingText]);
  const refresh = async () => {
    try {
      setUpdated(await apiRequest(`/support/${current.id}/`, { token }));
      order.reload();
    } catch (err) {
      setError(err.message);
    }
  };
  const mutate = async (action, body) => {
    setSending(true);
    setError("");
    try {
      const result = await apiRequest(`/support/${current.id}/${action}/`, {
        token,
        method: "POST",
        body,
      });
      setUpdated(result);
      if (action === "handoff" || action === "resolve") setResponding(false);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSending(false);
    }
  };
  const send = async (value) => {
    const message = value.trim();
    if (!message || sending || responding) return;
    if (clientKey.current?.text !== message)
      clientKey.current = { text: message, id: crypto.randomUUID() };
    setPendingText(message);
    const ok = await mutate("reply", {
      message,
      client_id: clientKey.current.id,
    });
    setPendingText("");
    if (ok) {
      setText("");
      clientKey.current = null;
    }
  };
  return (
    <section className="support-thread" aria-label="Support conversation">
      <header className="support-thread-header">
        <div className="support-thread-avatar">
          <Headphones size={23} />
        </div>
        <div>
          <h2>{role === "admin" ? current.subject : "RuchiGo support"}</h2>
          <p>
            {current.subject} · #{current.id}
          </p>
        </div>
        <span className="status-pill">
          {current.status === "resolved"
            ? "Resolved"
            : current.staff_requested_at
              ? "Team review"
              : "Order help"}
        </span>
      </header>
      {order.data && (
        <Link className="thread-order" to={`/tracking/${order.data.id}`}>
          <div>
            <strong>{order.data.restaurant_detail?.name}</strong>
            <span>
              #{orderNumber(order.data)} ·{" "}
              {order.data.fulfillment_paused_at
                ? "On hold for support"
                : statusLabel(order.data.status)}
            </span>
          </div>
          <ArrowRight size={17} />
        </Link>
      )}
      <ErrorNotice error={order.error} onRetry={order.reload} />
      {role === "admin" && order.data && (
        <div className="thread-refund">
          <OrderOperations
            order={order.data}
            onUpdated={refresh}
            ticketId={current.id}
          />
        </div>
      )}
      {!!current.affected_items?.length && (
        <p className="support-affected-items thread-affected">
          Affected dishes:{" "}
          {current.affected_items
            .map((item) => `${item.quantity} × ${item.name}`)
            .join(" · ")}
        </p>
      )}
      {current.refund_request && (
        <div className="thread-refund">
          <RefundStatus
            key={current.refund_request.id}
            refund={current.refund_request}
            onUpdated={refresh}
          />
        </div>
      )}
      <div
        className="support-thread-log"
        role="log"
        aria-label="Conversation messages"
        aria-live="polite"
        ref={log}
      >
        {current.messages.map((message) => (
          <article
            key={message.id}
            className={`support-bubble ${message.from_support ? "support" : "customer"}`}
          >
            <p>{message.body}</p>
            {!!message.actions?.length && (
              <div className="support-message-actions">
                {message.actions.map((action) => (
                  <Link key={`${action.to}:${action.label}`} to={action.to}>
                    {action.label}
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </div>
            )}
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
        {pendingText && (
          <article className="support-bubble customer">
            <p>{pendingText}</p>
            <small>Sending…</small>
          </article>
        )}
        {responding && !current.staff_requested_at && (
          <div className="support-typing" role="status">
            <span />
            <span />
            <span />
            <small>Typing…</small>
          </div>
        )}
      </div>
      <div className="support-thread-composer">
        <ErrorNotice error={error} />
        <ErrorNotice
          error={responseError}
          onRetry={() => setRetry((value) => value + 1)}
        />
        {role === "customer" &&
          !current.staff_requested_at &&
          current.status !== "resolved" && (
            <div className="thread-quick-actions">
              {[
                "Where is my order?",
                "Can I cancel?",
                "How does my refund work?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  disabled={sending || responding}
                  onClick={() => send(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        {current.staff_requested_at && current.status !== "resolved" && (
          <p className="thread-queue-note">
            Your conversation is in the team review queue. Replies appear here;
            sending a message does not cancel or refund your order.
          </p>
        )}
        <form
          className="thread-message-form"
          onSubmit={(event) => {
            event.preventDefault();
            send(text);
          }}
        >
          <label className="sr-only" htmlFor={`thread-reply-${current.id}`}>
            Your reply
          </label>
          <textarea
            id={`thread-reply-${current.id}`}
            value={text}
            maxLength={3000}
            rows={2}
            disabled={sending}
            onChange={(event) => setText(event.target.value)}
            placeholder={
              current.status === "resolved"
                ? "Reply to reopen this conversation…"
                : "Write a message…"
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                send(text);
              }
            }}
          />
          <button
            className="btn primary"
            aria-label="Send reply"
            disabled={sending || responding || !text.trim()}
          >
            <Send size={19} />
          </button>
        </form>
        <div className="thread-secondary-actions">
          {role === "customer" && !current.staff_requested_at && (
            <button
              className="text-link"
              disabled={sending}
              onClick={() => mutate("handoff", {})}
            >
              <Headphones size={15} />
              Talk to the team
            </button>
          )}
          {current.status !== "resolved" && (
            <button
              className="text-link"
              disabled={sending || responding}
              onClick={() => mutate("resolve", {})}
            >
              <Check size={15} />
              {role === "admin" ? "Mark resolved" : "That helped, close chat"}
            </button>
          )}
        </div>
        <SupportFeedback
          key={`${current.id}:${current.feedback_at || "new"}`}
          ticket={current}
          onSaved={refresh}
        />
      </div>
    </section>
  );
}
