import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BrandLogo from "../common/BrandLogo.jsx";
import AuthFoodStory from "./AuthFoodStory.jsx";

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
        <AuthFoodStory />
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
