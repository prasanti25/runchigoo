import { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, FileText, Printer, ShieldCheck } from "lucide-react";
import Navbar from "../Navbar.jsx";

export default function LegalLayout({
  type,
  title,
  description,
  summary,
  sections,
}) {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);
  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container">
          <header className="legal-hero">
            <p className="eyebrow">CLEAR INFORMATION. INFORMED CHOICES.</p>
            <div className="legal-heading">
              <div>
                <h1>{title}</h1>
                <p>{description}</p>
              </div>
              <span className="legal-symbol" aria-hidden="true">
                {type === "privacy" ? (
                  <ShieldCheck size={38} strokeWidth={1.3} />
                ) : (
                  <FileText size={38} strokeWidth={1.3} />
                )}
              </span>
            </div>
            <div className="legal-meta">
              <span>Draft · Updated 22 September 2026</span>
              <button className="text-link" onClick={() => window.print()}>
                <Printer size={15} />
                Print / save PDF
              </button>
            </div>
          </header>
          <nav className="legal-tabs" aria-label="Legal documents">
            <NavLink to="/privacy">Privacy policy</NavLink>
            <NavLink to="/terms">Terms of use</NavLink>
            <Link to="/contact">
              Contact us <ArrowRight size={14} />
            </Link>
          </nav>
          <div className="legal-draft" role="note">
            <strong>
              Preview document — not yet a final published policy.
            </strong>
            <p>
              The operator’s legal name, business address, designated privacy
              contact and approved retention / commercial policies must be
              confirmed before public launch.
            </p>
          </div>
          <div className="legal-layout">
            <aside className="legal-sidebar">
              <p className="eyebrow">ON THIS PAGE</p>
              <nav aria-label="Document sections">
                {sections.map((section, index) => (
                  <a key={section.id} href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                ))}
              </nav>
              <Link className="legal-help" to="/support?category=privacy">
                <ShieldCheck size={20} />
                <strong>A question about your data?</strong>
                <span>
                  Start a privacy request <ArrowRight size={14} />
                </span>
              </Link>
            </aside>
            <div className="legal-content">
              <section className="legal-summary">
                <p className="eyebrow">THE SHORT VERSION</p>
                <p>{summary}</p>
              </section>
              {sections.map((section, index) => (
                <section
                  className="legal-section"
                  id={section.id}
                  key={section.id}
                >
                  <div className="legal-section-heading">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h2>{section.title}</h2>
                  </div>
                  {section.content}
                </section>
              ))}
              <section className="legal-contact">
                <h2>Let’s clear things up.</h2>
                <p>
                  For account, order or privacy questions, use support or the
                  existing RuchiGo support email. Never send a password, payment
                  PIN or delivery code.
                </p>
                <div className="flex-row">
                  <Link className="btn dark" to="/support">
                    Open support <ArrowRight size={15} />
                  </Link>
                  <a className="text-link" href="mailto:Support@ruchigo.online">
                    Support@ruchigo.online
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
