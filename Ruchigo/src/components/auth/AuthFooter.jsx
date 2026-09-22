import { Link } from "react-router-dom";
export default function AuthFooter() {
  return (
    <footer className="auth-legal">
      <p>
        Your details are used to manage your account and fulfil your orders.
      </p>
      <nav aria-label="Account information">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/support">Need help?</Link>
      </nav>
    </footer>
  );
}
