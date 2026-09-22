import { Link } from "react-router-dom";
import LegalLayout from "../components/product/LegalLayout.jsx";

const sections = [
  {
    id: "service",
    title: "Using RuchiGo",
    content: (
      <>
        <p>
          RuchiGo connects customers with participating restaurant and delivery
          accounts through discovery, ordering and fulfilment tools. This
          document describes the current web-app workflow and expected use.
        </p>
        <p>
          These are preview terms, pending confirmation of the registered
          operator, business address and approved commercial / legal policies.
          They do not establish an invented company identity, jurisdiction or
          finalized allocation of responsibility between the platform and its
          partners.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts and access",
    content: (
      <>
        <p>
          Provide accurate account and contact information and use an account
          you are authorized to access. Keep your password and verification
          codes private. Contact support if you believe someone else has
          accessed your account.
        </p>
        <p>
          Restaurant and delivery registrations are subject to account approval.
          An approval status in this preview is not a claim that government
          identity documents, food licences or vehicle documents have been
          verified.
        </p>
        <p>
          Use the service respectfully and lawfully. Do not impersonate another
          person, access another account, submit fraudulent orders or attempt to
          bypass access or payment controls.
        </p>
      </>
    ),
  },
  {
    id: "menus",
    title: "Menus and dietary information",
    content: (
      <>
        <p>
          Menus, prices, descriptions, availability and dietary labels are
          managed by the participating restaurants. Illustrative or preview
          photos may not represent the exact portion or presentation delivered.
        </p>
        <p>
          A vegetarian marker describes a dish; it does not certify a
          vegetarian-only kitchen or absence of cross-contact. Optional calorie
          figures, tags and recommendation text are not independently verified
          nutrition or medical advice. Ask the restaurant about ingredients and
          allergens before ordering.
        </p>
      </>
    ),
  },
  {
    id: "ordering",
    title: "Placing and accepting an order",
    content: (
      <>
        <p>
          Review the restaurant, items, quantities, address, instructions and
          final amount before placing an order. A cart currently contains items
          from one restaurant. An order preserves its delivery address at
          checkout; changing an address in your account afterwards does not
          change that order.
        </p>
        <p>
          An order confirmation is followed by separate restaurant acceptance,
          preparation, pickup and delivery stages. For online payment, an order
          reaches the kitchen only after payment has been verified. Availability
          and preparation can change; monitor the order page and contact support
          if needed.
        </p>
        <p>
          Only use options offered in the current app. Scheduled ordering, paid
          add-ons and other future features are not included merely because they
          appear on a product roadmap.
        </p>
      </>
    ),
  },
  {
    id: "pricing",
    title: "Prices, charges and coupons",
    content: (
      <>
        <p>
          Amounts are displayed in Indian rupees. Check the item subtotal,
          delivery charge, applied discount and total at checkout. A displayed
          promotional message does not itself apply a discount.
        </p>
        <p>
          Coupon codes are checked against the current cart and again at
          checkout. They may have a restaurant restriction, minimum order,
          expiry, total usage cap, first-order condition, per-customer limit or
          maximum saving. The coupon’s displayed terms and checkout eligibility
          determine whether it applies.
        </p>
        <p>
          The order receipt is not represented as a GST tax invoice. Tax
          invoicing, commission and any additional fee policies must be
          confirmed before commercial launch.
        </p>
      </>
    ),
  },
  {
    id: "payment",
    title: "Payment and payment issues",
    content: (
      <>
        <p>
          Use a payment option offered at checkout. Cash on delivery is
          collected when the order is handed over. If enabled, online payment
          uses Razorpay’s hosted checkout and is subject to payment
          authorization and verification.
        </p>
        <p>
          A closed or failed payment screen is not proof that money was or was
          not debited. Check your order’s payment status. If you see a debit
          without a confirmed order, contact support with the order ID and
          transaction reference before paying again.
        </p>
        <p>
          Do not provide a card CVV, payment PIN or password to a restaurant,
          courier or support agent.
        </p>
      </>
    ),
  },
  {
    id: "cancellation",
    title: "Cancellations, problems and refunds",
    content: (
      <>
        <p>
          The current app allows customer cancellation before restaurant
          acceptance where the order status and payment state permit it. Once
          preparation has started, use order support to explain the issue;
          cancellation is not automatically guaranteed.
        </p>
        <p>
          Captured online payments do not currently have an automated
          cancellation/refund workflow in this preview. A refund request or
          resolved support ticket does not itself return money. Commercial
          refund eligibility, decision processes and provider timelines must be
          approved and implemented before a paid public launch.
        </p>
        <p>
          For a missing item, wrong item, food-quality issue, delivery problem
          or payment dispute, open <Link to="/support">support</Link> and
          reference the relevant order. Include a clear description, without
          sharing sensitive payment information. Nothing in this draft is
          intended to remove any mandatory consumer rights that apply.
        </p>
      </>
    ),
  },
  {
    id: "delivery",
    title: "Delivery and confirmation",
    content: (
      <>
        <p>
          Provide an accurate, accessible delivery address and contact
          information. A city shown in discovery is not a guarantee of
          address-level serviceability. Displayed preparation times are not
          guaranteed arrival times.
        </p>
        <p>
          Live location is available only when the assigned delivery partner
          shares it. Updates can be delayed or stop because of browser
          permissions, connectivity or a closed page.
        </p>
        <p>
          Share the delivery confirmation code with the assigned partner only
          when receiving the order. Contactless or other delivery instructions
          are requests; confirm that they can be followed safely.
        </p>
      </>
    ),
  },
  {
    id: "reviews-ai",
    title: "Reviews and recommendations",
    content: (
      <>
        <p>
          Reviews are available for your own delivered orders. Keep them
          relevant and honest, and do not include another person’s private
          information, harassment or unlawful content. Administrators can hide
          or restore a review with a recorded reason; hidden reviews are
          excluded from public ratings.
        </p>
        <p>
          The recommendation assistant suggests existing menu items using your
          preferences and, when configured, Gemini. It does not place an order
          for you, verify allergens, guarantee availability or promise an
          outcome. Review your selections before checkout.
        </p>
        <p>
          See the{" "}
          <Link to="/privacy#ai">AI recommendations privacy section</Link>{" "}
          before entering free-text preferences.
        </p>
      </>
    ),
  },
  {
    id: "support-changes",
    title: "Support and future changes",
    content: (
      <>
        <p>
          Use the in-app ticket system for an order-linked conversation or email
          Support@ruchigo.online. Keep your order ID or payment reference
          available. No 24/7 staffing, response-time guarantee or automatic
          compensation is promised by this preview.
        </p>
        <p>
          The final terms must identify the legal operator, applicable dispute
          process, merchant/delivery responsibilities and the policy effective
          date. Material changes to the service or its commercial rules should
          be reflected in the published terms before taking effect. The date
          above identifies this draft revision.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      type="terms"
      title="Good food. Clear terms."
      description="A straightforward guide to accounts, orders, payments and getting help."
      summary="Check your order and final amount before checkout, keep your account secure, and share the delivery code only at handover. Order status controls available actions; support requests do not automatically trigger cancellations or refunds."
      sections={sections}
    />
  );
}
