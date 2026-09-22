import { Link } from "react-router-dom";
import { ArrowRight, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import InfoLayout from "../components/product/InfoLayout.jsx";

export default function ContactPage() {
  return (
    <InfoLayout
      eyebrow="WE’RE HERE TO HELP"
      title="Let’s find the right next step."
      description="An order question, an account issue, or something you’d like to know? Start here."
    >
      <div className="info-card-grid">
        <article className="info-card">
          <MessageSquare size={27} strokeWidth={1.5} />
          <h2>Help with an order</h2>
          <p>
            Open a ticket, add the order ID and keep your conversation in one
            place.
          </p>
          <Link className="text-link" to="/support">
            Open support <ArrowRight size={15} />
          </Link>
        </article>
        <article className="info-card">
          <Mail size={27} strokeWidth={1.5} />
          <h2>Write to RuchiGo</h2>
          <p>
            For account access, partnerships or general questions, use our
            existing support address.
          </p>
          <a className="text-link" href="mailto:Support@ruchigo.online">
            Support@ruchigo.online <ArrowRight size={15} />
          </a>
        </article>
        <article className="info-card">
          <ShieldCheck size={27} strokeWidth={1.5} />
          <h2>Questions about your data</h2>
          <p>
            Ask about access, corrections or deletion through a private support
            request.
          </p>
          <Link className="text-link" to="/support?category=privacy">
            Privacy request <ArrowRight size={15} />
          </Link>
        </article>
      </div>
      <section className="info-help">
        <div>
          <h2>A quick answer might be all you need.</h2>
          <p>
            Ordering, payment, delivery and account questions, explained in
            plain language.
          </p>
        </div>
        <Link className="btn dark" to="/faq">
          Read the FAQs <ArrowRight size={16} />
        </Link>
      </section>
      <p className="form-help">
        Keep passwords, verification codes, card details and payment PINs out of
        support messages. For an order issue, your order ID and a description
        are a good starting point.
      </p>
    </InfoLayout>
  );
}
