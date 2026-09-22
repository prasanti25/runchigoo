import { useEffect, useId, useRef, useState } from "react";
import { AudioLines, Mic } from "lucide-react";

export default function VoiceInput({ onText, disabled = false }) {
  const recognition = useRef(null);
  const timeout = useRef(null);
  const dismiss = useRef(null);
  const hintId = useId();
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState("");
  const Engine = window.SpeechRecognition || window.webkitSpeechRecognition;
  useEffect(
    () => () => {
      clearTimeout(timeout.current);
      clearTimeout(dismiss.current);
      if (recognition.current) {
        recognition.current.onend = null;
        recognition.current.onresult = null;
        recognition.current.onerror = null;
        recognition.current.abort();
      }
    },
    [],
  );
  const start = () => {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    if (!Engine || disabled) return;
    const session = new Engine();
    recognition.current = session;
    session.lang = navigator.language.toLowerCase().startsWith("hi")
      ? "hi-IN"
      : "en-IN";
    session.interimResults = false;
    session.continuous = false;
    session.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript?.trim();
      if (text) {
        onText(text.slice(0, 200));
        setNotice("");
      }
    };
    session.onerror = (event) =>
      setNotice(
        event.error === "not-allowed"
          ? "Microphone access is off. Allow it in your browser, or type instead."
          : "Couldn’t hear that. Try again, or type your request.",
      );
    session.onend = () => {
      clearTimeout(timeout.current);
      setListening(false);
      recognition.current = null;
      dismiss.current = setTimeout(() => setNotice(""), 4500);
    };
    try {
      session.start();
      setListening(true);
      clearTimeout(dismiss.current);
      setNotice("");
      timeout.current = setTimeout(() => session.stop(), 20000);
    } catch {
      setNotice("Voice isn’t available right now. You can still type.");
      recognition.current = null;
      dismiss.current = setTimeout(() => setNotice(""), 4500);
    }
  };
  if (!Engine) return null;
  return (
    <span className="inline-voice">
      <button
        type="button"
        className={`inline-voice-button ${listening ? "is-listening" : ""}`}
        onClick={start}
        disabled={disabled && !listening}
        aria-pressed={listening}
        aria-label={listening ? "Finish voice input" : "Search by voice"}
        aria-describedby={hintId}
      >
        {listening ? (
          <AudioLines size={20} strokeWidth={1.8} />
        ) : (
          <Mic size={20} strokeWidth={1.8} />
        )}
      </button>
      <span className="sr-only" id={hintId}>
        Voice uses your browser’s speech service. Review the recognised text
        before sending.
      </span>
      {notice && (
        <span className="voice-popover" role="status">
          {notice}
        </span>
      )}
    </span>
  );
}
