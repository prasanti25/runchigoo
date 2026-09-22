import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import InfoLayout from "../components/product/InfoLayout.jsx";

const faqs = [
  [
    "How do I place an order?",
    "Choose a restaurant, add dishes, then check your cart. Select a saved delivery address, review the total and complete checkout using an available payment option.",
  ],
  [
    "Can I change the delivery address?",
    "Choose or edit your saved address before placing the order. An existing order keeps the address supplied at checkout. Contact support if you spot an error after ordering.",
  ],
  [
    "Why didn’t my coupon apply?",
    "Coupons can have a minimum spend, restaurant restriction, expiry, first-order condition or usage limit. Review the coupon terms and the message shown at checkout.",
  ],
  [
    "Can I cancel my order?",
    "The cancellation option is available before restaurant acceptance where the payment and order state allow it. If it is no longer available, raise an order support ticket. Captured online payments do not yet have an automated refund workflow in this preview.",
  ],
  [
    "My payment was debited, but the order isn’t confirmed. What now?",
    "Check the payment status on your order page. If a debit is visible but the order is unconfirmed, contact support with the order ID and transaction reference before trying again. Never share a payment PIN or card CVV.",
  ],
  [
    "When should I share the delivery code?",
    "Share the six-digit code with the assigned delivery partner only when you receive the order. The partner uses it to confirm handover.",
  ],
  [
    "Why isn’t the live location updating?",
    "Location is shown only when the delivery partner opts to share it. Their page must remain open with location permission and an internet connection. The last update time is shown on the tracking page.",
  ],
  [
    "Are recommendations and veg labels allergy-safe?",
    "No. Recommendations are menu suggestions, not medical advice. A vegetarian dish marker is not a guarantee about kitchen cross-contact. Ask the restaurant about ingredients and allergens.",
  ],
  [
    "How do I ask about my personal data?",
    "Use the privacy request link in the Privacy Policy or choose the privacy topic when opening a support ticket. Requests are reviewed through support; creating a ticket does not automatically delete records.",
  ],
];

export default function FAQPage() {
  return (
    <InfoLayout
      eyebrow="THE LITTLE THINGS, EXPLAINED"
      title="Good questions. Clear answers."
      description="A few things worth knowing before, during and after your order."
    >
      <div className="faq-list">
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <Plus size={18} />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
      <section className="info-help">
        <div>
          <h2>Still need a hand?</h2>
          <p>Tell us what happened and follow the conversation in support.</p>
        </div>
        <Link className="btn dark" to="/support">
          Get help <ArrowRight size={16} />
        </Link>
      </section>
    </InfoLayout>
  );
}
