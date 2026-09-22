import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ArrowUp, Bike, Store } from "lucide-react";
import BrandLogo from "./common/BrandLogo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const groups = [
  [
    "Discover",
    [
      ["Find restaurants", "/search"],
      ["Food recommendations", "/for-you"],
      ["Explore dishes", "/search?view=dishes"],
      ["Offers for you", "/offers"],
    ],
  ],
  [
    "RuchiGo",
    [
      ["Our story", "/about"],
      ["Contact us", "/contact"],
      ["Help & FAQs", "/faq"],
    ],
  ],
  [
    "Here to help",
    [
      ["Order support", "/support"],
      ["Privacy policy", "/privacy"],
      ["Terms of service", "/terms"],
      ["Privacy requests", "/support?category=privacy"],
    ],
  ],
];

export default function Footer() {
  const { pathname } = useLocation();
  const { role, isAuthenticated } = useAuth();
  if (
    /^\/(login|register|.*password|verify.*|two-factor|account-locked|pending-approval|unauthorized|access-denied|session-expired)/.test(
      pathname,
    )
  )
    return null;
  const partner = isAuthenticated && role !== "customer";
  if (partner)
    return (
      <footer className="workspace-footer" aria-label="Workspace footer">
        <span>© {new Date().getFullYear()} RuchiGo</span>
        <nav aria-label="Workspace help and legal">
          <Link to="/support">Support</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </footer>
    );
  return (
    <footer className="product-footer">
      <div className="container">
        <div className="footer-intro">
          <div>
            <Link className="brand" to="/" aria-label="RuchiGo home">
              <BrandLogo />
            </Link>
            <p>Good food. Your kind of day.</p>
          </div>
          <Link className="footer-explore" to="/search">
            Find your next favourite <ArrowRight size={18} />
          </Link>
        </div>
        <div className="footer-directory">
          {groups.map(([title, links]) => (
            <nav key={title} aria-label={`Footer ${title}`}>
              <h2>{title}</h2>
              {links.map(([label, to]) => (
                <Link key={label} to={to}>
                  {label}
                </Link>
              ))}
            </nav>
          ))}
          <section
            className="footer-partnerships"
            aria-labelledby="footer-partner-title"
          >
            <h2 id="footer-partner-title">Build with RuchiGo</h2>
            <p>
              Your kitchen. Your city.
              <br />A little more possibility.
            </p>
            <Link to="/register?role=restaurant">
              <Store size={17} />
              <span>Restaurant partner</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/register?role=delivery">
              <Bike size={18} />
              <span>Delivery partner</span>
              <ArrowRight size={16} />
            </Link>
          </section>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} RuchiGo. All rights reserved.
          </span>
          <span className="footer-locale">
            India <span aria-hidden="true">/</span> English{" "}
            <span aria-hidden="true">/</span> INR
          </span>
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            Back to top <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}
