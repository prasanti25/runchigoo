import BrandLogo from "./BrandLogo.jsx";
import "./LoadingScreen.css";

export default function LoadingScreen({
  message = "Getting things ready…",
  inline = false,
}) {
  return (
    <div
      className={`ruchigo-loader ${inline ? "is-inline" : "is-page"}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="ruchigo-loader-mark" aria-hidden="true">
        <span className="ruchigo-loader-halo" />
        <span className="ruchigo-loader-track" />
        <span className="ruchigo-loader-orbit" />
        <span className="ruchigo-loader-orbit secondary" />
        <div className="ruchigo-loader-logo">
          <BrandLogo />
        </div>
      </div>
      <div className="ruchigo-loader-caption" aria-hidden="true">
        <p>{message}</p>
        <span className="ruchigo-loader-dots">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
