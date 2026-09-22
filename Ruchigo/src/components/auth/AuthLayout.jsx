import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import BrandLogo from "../common/BrandLogo.jsx";

export default function AuthLayout({
  children,
  title = "Welcome to RuchiGo",
  subtitle = "Your favourites are one sign-in away.",
}) {
  return (
    <main className="auth-screen">
      <header className="auth-topbar">
        <Link to="/" className="brand" aria-label="RuchiGo home">
          <BrandLogo />
        </Link>
        <Link className="text-link" to="/">
          <ArrowLeft size={16} />
          Back to explore
        </Link>
      </header>
      <div className="auth-shell">
        <aside className="auth-visual">
          <div className="auth-visual-copy">
            <span className="auth-editorial-label">GOOD FOOD STARTS HERE</span>
            <h2>
              Every craving
              <br />
              has a <em>home.</em>
            </h2>
            <p>
              Discover your next favourite.
              <br />
              Fresh from a kitchen near you.
            </p>
          </div>
          <img
            src="/food/biryani.webp"
            alt="Freshly prepared biryani served with accompaniments"
            fetchPriority="high"
          />
          <div className="auth-photo-caption">
            <span>
              <MapPin size={16} />
              Local kitchens. Big flavours.
            </span>
            <ArrowUpRight size={19} />
          </div>
        </aside>
        <section className="auth-form-side">
          <div className="auth-form-content">
            <p className="eyebrow">YOUR EVERYDAY, A LITTLE TASTIER</p>
            <h1>{title}</h1>
            <p className="muted auth-subtitle">{subtitle}</p>
            {children}
          </div>
        </section>
      </div>
      <p className="auth-page-note">Good food. Great moments. RuchiGo.</p>
    </main>
  );
}
