import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  MapPin,
  MessageCircle,
  RotateCcw,
  Utensils,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { useDeliveryLocation } from "../../lib/product.js";
import { ErrorNotice, FoodCard } from "./UI.jsx";
import VoiceInput from "./VoiceInput.jsx";
import AssistantIcon from "../common/AssistantIcon.jsx";

export default function FoodAssistant({
  support = false,
  orderId = null,
  feed = false,
}) {
  const { token } = useAuth();
  const { city } = useDeliveryLocation();
  return (
    <Conversation
      key={`${token || "guest"}:${city}:${orderId || "general"}:${support}`}
      token={token}
      city={city}
      support={support}
      orderId={orderId}
      feed={feed}
    />
  );
}

function Conversation({ token, city, support, orderId, feed }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searchCity, setSearchCity] = useState(city || "");
  const request = useRef(null);
  const conversationQuery = useRef("");
  const end = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    const log = end.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, busy]);
  const send = async (text, options = {}) => {
    const message = text.trim();
    if (!message || request.current) return;
    const controller = new AbortController();
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 45000);
    request.current = controller;
    setBusy(true);
    setError("");
    setResult(null);
    setMessages((current) =>
      current.at(-1)?.role === "user" && current.at(-1)?.text === message
        ? current
        : [...current, { role: "user", text: message }].slice(-12),
    );
    setInput("");
    const chosenCity = options.city ?? searchCity;
    setSearchCity(chosenCity);
    try {
      const response = await apiRequest("/intelligence/assistant/", {
        token,
        method: "POST",
        signal: controller.signal,
        body: {
          message,
          mode: support ? "support" : "food",
          ...(support && orderId ? { order_id: orderId } : {}),
          history: messages
            .filter((item) => item.role === "user")
            .slice(-6)
            .map((item) => item.text),
          preferences: {
            city: chosenCity,
            ...(!support && conversationQuery.current
              ? { q: conversationQuery.current }
              : {}),
          },
        },
      });
      if (controller.signal.aborted) return;
      if (
        typeof response.query === "string" &&
        response.status !== "needs_clarification"
      )
        conversationQuery.current = response.query;
      setMessages((current) =>
        [
          ...current,
          {
            role: "assistant",
            text: response.reply,
            links: response.links,
            actions: response.actions,
          },
        ].slice(-12),
      );
      setInput("");
      setResult(response);
    } catch (err) {
      if (!controller.signal.aborted || timedOut) {
        setError(
          timedOut
            ? "This is taking longer than expected. Your message is saved below—please try again."
            : err.message,
        );
        setInput(message);
      }
    } finally {
      window.clearTimeout(timeout);
      if (!controller.signal.aborted || timedOut) setBusy(false);
      request.current = null;
    }
  };
  return (
    <section
      className={`food-assistant ${feed ? "feed-assistant" : ""}`}
      aria-label="RuchiGo assistant"
    >
      <div className="assistant-heading">
        <span className="assistant-mark">
          {support ? <MessageCircle size={23} /> : <AssistantIcon size={25} />}
        </span>
        <div>
          <p className="eyebrow">
            {support ? "RUCHIGO ASSISTANT" : "A LITTLE HELP CHOOSING"}
          </p>
          <h2>
            {support
              ? "How can we help?"
              : feed
                ? "What do you feel like eating?"
                : "Let’s find your next meal."}
          </h2>
        </div>
        {!!messages.length && (
          <button
            className="btn ghost"
            type="button"
            disabled={busy}
            onClick={() => {
              setMessages([]);
              conversationQuery.current = "";
              setResult(null);
              setInput("");
              setError("");
              setSearchCity(city || "");
            }}
            aria-label="Start a new conversation"
          >
            <RotateCcw size={17} />
            <span>Start fresh</span>
          </button>
        )}
      </div>
      {!support && (
        <div className="assistant-scope">
          <MapPin size={14} />
          <span>
            {searchCity
              ? `Searching menus in ${searchCity}`
              : "Browsing available service cities"}
            {searchCity !== (city || "") && (
              <small>
                Browsing only · your delivery city is still{" "}
                {city || "not selected"}.
              </small>
            )}
          </span>
          {searchCity !== (city || "") && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setSearchCity(city || "");
                setMessages([]);
                conversationQuery.current = "";
                setResult(null);
                setInput("");
                setError("");
              }}
            >
              Back to {city || "all cities"}
            </button>
          )}
        </div>
      )}
      <div
        className="assistant-log"
        ref={end}
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        aria-relevant="additions"
      >
        {!messages.length && !feed && (
          <div className="assistant-welcome">
            {support ? <MessageCircle size={24} /> : <Utensils size={24} />}
            <h3>
              {support
                ? "Order questions? Start here."
                : "A craving, a budget, or “surprise me”."}
            </h3>
            <p>
              {support
                ? "Tell us what happened. Get a quick answer here, or open a ticket for our support team."
                : "Tell me what you’re in the mood for. You can refine your choices as we go."}
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <div className={`assistant-bubble ${message.role}`} key={index}>
            <span className="sr-only">
              {message.role === "user" ? "You: " : "RuchiGo: "}
            </span>
            <p>{message.text}</p>
            {message.links?.map((link) => (
              <Link key={link.to} to={link.to} className="assistant-link">
                {link.label}
              </Link>
            ))}
            {index === messages.length - 1 && !!message.actions?.length && (
              <div className="assistant-next-steps">
                {message.actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      send(
                        action.message,
                        action.kind === "browse_city"
                          ? { city: action.city }
                          : {},
                      )
                    }
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div
            className="assistant-thinking"
            role="status"
            aria-label="RuchiGo assistant is typing"
          >
            <span className="typing-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>Typing…</span>
          </div>
        )}
      </div>
      {!messages.length && (
        <div className="assistant-suggestions">
          {(support
            ? [
                "Where is my order?",
                "An item is missing",
                "How do I request a refund?",
              ]
            : [
                "A vegetarian meal under 250",
                "Something spicy for dinner",
                "Coffee under 150",
              ]
          ).map((text) => (
            <button
              key={text}
              type="button"
              disabled={busy}
              onClick={() => send(text)}
            >
              {text}
            </button>
          ))}
        </div>
      )}
      <ErrorNotice error={error} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="assistant-composer"
      >
        <label className="sr-only" htmlFor="assistant-message">
          Message RuchiGo
        </label>
        <div className="assistant-input-row">
          <input
            id="assistant-message"
            maxLength={200}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              support
                ? "Tell us what happened…"
                : messages.length
                  ? "Try “under 150 instead”…"
                  : "What can we help you find?"
            }
            disabled={busy}
            autoComplete="off"
          />
          <VoiceInput onText={setInput} disabled={busy} />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send message"
          >
            <ArrowUp size={21} />
          </button>
        </div>
      </form>
      <p className="assistant-disclosure">
        {support
          ? "Don’t share passwords, OTPs or payment details. "
          : "Suggestions only. You review and place every order yourself. Don’t share passwords, OTPs or payment details. "}
        <Link to="/privacy#ai">How your data is used</Link>
      </p>
      {!!result?.items?.length && (
        <div className="assistant-results">
          <div className="section-title">
            <h3>
              {result.source === "gemini"
                ? "Your meal shortlist"
                : "From the current menu"}
            </h3>
            <span>
              {result.items.length}{" "}
              {result.items.length === 1 ? "option" : "options"}
            </span>
          </div>
          <p className="muted">
            Prices are per dish, before extras and delivery. Confirm allergies
            directly with the restaurant.
          </p>
          <div className="food-grid">
            {result.items.map((item) => (
              <FoodCard key={item.id} item={item} reason={item.reason} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
