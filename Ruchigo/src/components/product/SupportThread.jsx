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
import { ErrorNotice, Modal } from "./UI.jsx";
import RefundStatus from "./RefundStatus.jsx";
import SupportFeedback from "./SupportFeedback.jsx";
import OrderOperations from "./OrderOperations.jsx";
import CancelOrder from "./CancelOrder.jsx";
import OrderReview from "./OrderReview.jsx";
import OrderIssueChat from "./OrderIssueChat.jsx";

export default function SupportThread({ ticket }) {
  const { token } = useAuth();
  const [updated, setUpdated] = useState(null);
  const current =
    updated && new Date(updated.updated_at) > new Date(ticket.updated_at)
      ? updated
      : ticket;
  const isRequester = current.viewer_is_requester === true;
  const order = useRemote(
    current.order ? `/orders/${current.order}/` : null,
    token,
    5000,
  );
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingText, setPendingText] = useState("");
  const [replyPending, setReplyPending] = useState(false);
  const [choicePending, setChoicePending] = useState(false);
  const [error, setError] = useState("");
  const [responseError, setResponseError] = useState("");
  const [issueCategory, setIssueCategory] = useState(null);
  const [retry, setRetry] = useState(0);
  const attempts = useRef(new Set());
  const clientKey = useRef(null);
  const choiceKey = useRef(null);
  const issueKey = useRef(null);
  const log = useRef(null);
  const lastCustomer = current.messages
    .filter((message) => !message.from_support)
    .at(-1);
  const lastSupport = current.messages
    .filter((message) => message.from_support)
    .at(-1);
  const activeActions = lastSupport?.actions || [];
  const quickChoices = (current.quick_choices || []).filter(
    (choice) => !activeActions.some((action) => action.topic === choice.topic),
  );
  const needsResponse =
    isRequester &&
    current.status !== "resolved" &&
    Boolean(lastCustomer) &&
    !current.messages.some((message) => message.reply_to === lastCustomer.id);
  const messageId = lastCustomer?.id;
  // A poll may receive the persisted answer before the POST finishes. Do not
  // leave the composer locked after the answer has already arrived.
  const responding = choicePending || (replyPending && needsResponse);
  useEffect(() => {
    if (!needsResponse) return;
    const key = `${current.id}:${messageId}:${retry}`;
    if (attempts.current.has(key)) return;
    let active = true;
    // The indicator follows the actual request, not a simulated typing timer.
    queueMicrotask(() => {
      if (!active) return;
      attempts.current.add(key);
      setReplyPending(true);
      setResponseError("");
      apiRequest(`/support/${current.id}/respond/`, {
        token,
        method: "POST",
        body: { message_id: messageId },
        signal: AbortSignal.timeout(20000),
      })
        .then((result) => {
          if (active) {
            setReplyPending(false);
            setUpdated(result);
          }
        })
        .catch((err) => {
          if (active) setResponseError(err.message);
        })
        .finally(() => {
          if (active) setReplyPending(false);
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
  useEffect(() => {
    const element = log.current;
    if (!element) return;
    let width = element.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.clientWidth !== width) {
        width = element.clientWidth;
        element.scrollTo({ top: element.scrollHeight, behavior: "instant" });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
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
        signal: AbortSignal.timeout(20000),
      });
      setUpdated(result);
      if (action === "handoff" || action === "resolve") setReplyPending(false);
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
  const choose = async (choice) => {
    if (sending || responding) return;
    if (choiceKey.current?.topic !== choice.topic)
      choiceKey.current = {
        topic: choice.topic,
        client_id: crypto.randomUUID(),
      };
    setPendingText(choice.label);
    setChoicePending(true);
    const ok = await mutate("quick-help", choiceKey.current);
    setChoicePending(false);
    setPendingText("");
    if (ok) choiceKey.current = null;
  };
  const submitIssue = async (body) => {
    const signature = JSON.stringify(body);
    if (issueKey.current?.signature !== signature)
      issueKey.current = { signature, id: crypto.randomUUID() };
    if (
      await mutate("report-issue", { ...body, client_id: issueKey.current.id })
    ) {
      setIssueCategory(null);
      issueKey.current = null;
      order.reload();
    }
  };
  const renderAction = (action, index) => {
    const key = `${action.topic || action.kind || action.to}:${index}`;
    if (action.to)
      return (
        <Link key={key} to={action.to}>
          {action.label}
          <ArrowRight size={14} />
        </Link>
      );
    if (!isRequester) return null;
    if (action.topic)
      return (
        <button
          key={key}
          disabled={sending || responding}
          onClick={() => choose(action)}
        >
          {action.label}
          <ArrowRight size={14} />
        </button>
      );
    if (action.kind === "resolve")
      return (
        current.status !== "resolved" && (
          <button
            key={key}
            disabled={sending || responding}
            onClick={() => mutate("resolve", {})}
          >
            {action.label}
            <Check size={14} />
          </button>
        )
      );
    if (action.kind === "cancel" && order.data)
      return order.data.cancellation?.allowed ? (
        <CancelOrder key={key} order={order.data} compact onUpdated={refresh} />
      ) : (
        <p key={key}>{order.data.cancellation?.message}</p>
      );
    if (action.kind === "review" && order.data)
      return (
        <OrderReview key={key} order={order.data} compact onSaved={refresh} />
      );
    if (action.kind === "issue" && order.data)
      return (
        <button
          key={key}
          disabled={sending || responding}
          onClick={() => {
            setError("");
            setIssueCategory(action.category);
          }}
        >
          {action.label}
          <ArrowRight size={14} />
        </button>
      );
    return null;
  };
  return (
    <section className="support-thread" aria-label="Support conversation">
      <header className="support-thread-header">
        <div className="support-thread-avatar">
          <Headphones size={23} />
        </div>
        <div>
          <h2>{isRequester ? "RuchiGo support" : "Customer conversation"}</h2>
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
      {!isRequester && (
        <div className="thread-context-note">
          <strong>You’re replying as support</strong>
          <p>
            This is a customer’s ticket. Your replies are sent to them; quick
            order help is available in your own conversations.
          </p>
          <Link className="text-link" to="/support?view=mine">
            Open my order help <ArrowRight size={14} />
          </Link>
        </div>
      )}
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
      {!isRequester && order.data && (
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
            readOnly={isRequester}
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
            {message.id === lastSupport?.id && !!message.actions?.length && (
              <div className="support-message-actions">
                {message.actions.map(renderAction)}
              </div>
            )}
            <small>
              {message.from_support
                ? "RuchiGo support"
                : isRequester
                  ? "You"
                  : "Customer"}{" "}
              · {dateTime(message.created_at)}
            </small>
          </article>
        ))}
        {pendingText && (
          <article
            className={`support-bubble ${isRequester ? "customer" : "support"}`}
          >
            <p>{pendingText}</p>
            <small>Sending…</small>
          </article>
        )}
        {responding && (
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
        {isRequester && quickChoices.length > 0 && (
          <div
            className="thread-quick-actions"
            role="group"
            aria-label="Quick order help"
          >
            {quickChoices.map((choice) => (
              <button
                key={choice.topic}
                disabled={sending || responding}
                onClick={() => choose(choice)}
              >
                {choice.label}
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
        {current.staff_requested_at && current.status !== "resolved" && (
          <p className="thread-queue-note">
            {isRequester
              ? "Your review stays open while we help you here. You can keep chatting; any cancellation or refund needs its own confirmation."
              : "This conversation is in the team review queue. Reply to the customer below; order and refund decisions use the support actions."}
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
                : !isRequester
                  ? "Reply to the customer…"
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
          {isRequester &&
            !current.staff_requested_at &&
            current.status !== "resolved" && (
              <button
                className="text-link"
                disabled={sending}
                onClick={() => mutate("handoff", {})}
              >
                <Headphones size={15} />
                Talk to the team
              </button>
            )}
          {current.status !== "resolved" &&
            !activeActions.some((action) => action.kind === "resolve") && (
              <button
                className="text-link"
                disabled={sending || responding}
                onClick={() => mutate("resolve", {})}
              >
                <Check size={15} />
                {isRequester ? "That helped, close chat" : "Mark resolved"}
              </button>
            )}
        </div>
        <SupportFeedback
          key={`${current.id}:${current.feedback_at || "new"}`}
          ticket={current}
          onSaved={refresh}
        />
      </div>
      {issueCategory && order.data && (
        <Modal
          title="Add details to this conversation"
          onClose={() => !sending && setIssueCategory(null)}
        >
          <OrderIssueChat
            key={`${current.id}:${issueCategory}`}
            order={order.data}
            category={issueCategory}
            inThread
            allowRefundRequest={!current.refund_request}
            busy={sending}
            error={error}
            onClose={() => !sending && setIssueCategory(null)}
            onSubmit={submitIssue}
          />
        </Modal>
      )}
    </section>
  );
}
