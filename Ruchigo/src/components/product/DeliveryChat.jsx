import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MessageCircle, Send, CheckCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useInbox } from "../../context/InboxContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { dateTime, useRemote } from "../../lib/product.js";
import { ErrorNotice, Modal } from "./UI.jsx";
import "./Operations.css";

export default function DeliveryChat({ order }) {
  const { token, role } = useAuth();
  const { refreshUnread } = useInbox();
  const [params, setParams] = useSearchParams();
  const open = params.get("chat") === "1";
  const remote = useRemote(
    `/delivery-chat/${order.id}/`,
    token,
    open ? 5000 : 15000,
  );
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState("");
  const [extra, setExtra] = useState({ key: "", messages: [] });
  const [older, setOlder] = useState({ key: "", messages: [], next: null });
  const retry = useRef(null);
  const readThrough = useRef(null);
  const log = useRef(null);
  const key = remote.data?.conversation_key;
  const messages = [
    ...new Map(
      [
        ...(older.key === key ? older.messages : []),
        ...(extra.key === key ? extra.messages : []),
        ...(remote.data?.messages || []),
      ].map((message) => [message.id, message]),
    ).values(),
  ].sort((a, b) => a.id - b.id);
  const last = messages.at(-1)?.id;
  const next = older.key === key ? older.next : remote.data?.next_before;
  const customer = ["customer", "admin"].includes(role);
  const title = customer ? "Message your delivery partner" : "Message customer";
  function toggle(value) {
    const updated = new URLSearchParams(params);
    if (value) updated.set("chat", "1");
    else updated.delete("chat");
    setParams(updated, { replace: true });
  }
  useEffect(() => {
    if (open && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [last, open]);
  useEffect(() => {
    if (
      !open ||
      !last ||
      !remote.data?.unread ||
      document.hidden ||
      readThrough.current === `${key}:${last}`
    )
      return;
    readThrough.current = `${key}:${last}`;
    apiRequest(`/delivery-chat/${order.id}/read/`, {
      token,
      method: "POST",
      body: { last_id: last },
    })
      .then(refreshUnread)
      .catch(() => {
        readThrough.current = null;
      });
  }, [open, last, key, remote.data, order.id, token, refreshUnread]);
  async function send(event) {
    event.preventDefault();
    const message = text.trim();
    if (!message || busy) return;
    if (
      !retry.current ||
      retry.current.text !== message ||
      retry.current.key !== key
    )
      retry.current = { text: message, key, client_id: crypto.randomUUID() };
    setBusy(true);
    setError("");
    try {
      const saved = await apiRequest(`/delivery-chat/${order.id}/send/`, {
        token,
        method: "POST",
        body: { text: message, client_id: retry.current.client_id },
      });
      setExtra((previous) => ({
        key,
        messages: [...(previous.key === key ? previous.messages : []), saved],
      }));
      setText("");
      retry.current = null;
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function loadOlder() {
    setLoadingOlder(true);
    setError("");
    try {
      const data = await apiRequest(
        `/delivery-chat/${order.id}/?before=${next}`,
        { token },
      );
      setOlder((previous) => ({
        key: data.conversation_key,
        messages: [
          ...data.messages,
          ...(previous.key === data.conversation_key ? previous.messages : []),
        ],
        next: data.next_before,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingOlder(false);
    }
  }
  return (
    <>
      <section className="panel delivery-chat-entry">
        <MessageCircle size={23} />
        <div>
          <h3>Delivery conversation</h3>
          <p className="muted">
            {customer
              ? "Share a landmark or coordinate the handover."
              : "Coordinate the handover. Message only when safely stopped."}
          </p>
        </div>
        <button className="btn secondary" onClick={() => toggle(true)}>
          {title}
          {remote.data?.unread > 0 && (
            <span className="delivery-unread">{remote.data.unread}</span>
          )}
        </button>
      </section>
      {open && (
        <Modal
          title={title}
          onClose={() => toggle(false)}
          className="delivery-chat-modal"
        >
          <p className="form-help">
            Messages go to the other person, not customer support. Never share
            payment details or your delivery code here.
          </p>
          <ErrorNotice error={remote.error} onRetry={remote.reload} />
          <div
            ref={log}
            className="delivery-chat-log"
            role="log"
            aria-label="Delivery messages"
            aria-live="polite"
          >
            {next && (
              <button
                type="button"
                className="btn secondary"
                disabled={loadingOlder}
                onClick={loadOlder}
              >
                {loadingOlder ? "Loading…" : "Earlier messages"}
              </button>
            )}
            {remote.loading && !messages.length && (
              <p role="status">Loading conversation…</p>
            )}
            {!remote.loading && !remote.error && !messages.length && (
              <div className="delivery-chat-empty">
                <MessageCircle size={32} />
                <h3>A smoother handover starts here</h3>
                <p>
                  Send a useful landmark or ask about the pickup. Replies appear
                  when the other person sends them.
                </p>
              </div>
            )}
            {messages.map((message) => (
              <article
                key={message.id}
                className={`delivery-message ${message.mine ? "mine" : ""}`}
              >
                <small>{message.mine ? "You" : message.sender}</small>
                <p>{message.text}</p>
                <footer>
                  <time dateTime={message.created_at}>
                    {dateTime(message.created_at)}
                  </time>
                  {message.mine && (
                    <span>
                      {message.read_at ? (
                        <>
                          <CheckCheck size={13} /> Read
                        </>
                      ) : (
                        "Sent"
                      )}
                    </span>
                  )}
                </footer>
              </article>
            ))}
          </div>
          {remote.data?.can_send ? (
            <form className="delivery-chat-compose" onSubmit={send}>
              <label
                className="sr-only"
                htmlFor={`delivery-message-${order.id}`}
              >
                Delivery message
              </label>
              <textarea
                id={`delivery-message-${order.id}`}
                placeholder="Type your message…"
                maxLength={1000}
                value={text}
                disabled={busy}
                onChange={(event) => setText(event.target.value)}
              />
              <button
                className="btn primary"
                aria-label="Send delivery message"
                disabled={busy || !text.trim()}
              >
                <Send size={19} />
              </button>
            </form>
          ) : (
            remote.data && (
              <p className="delivery-chat-closed">
                {remote.data.partner_assigned
                  ? "This delivery has ended. Your conversation is read-only."
                  : "Messaging opens after a delivery partner accepts your order."}{" "}
                <Link to={`/support?order=${order.id}`}>Get order support</Link>
              </p>
            )
          )}
          <ErrorNotice error={error} />
        </Modal>
      )}
    </>
  );
}
