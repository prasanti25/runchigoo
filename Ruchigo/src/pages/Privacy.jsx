import { Link } from "react-router-dom";
import LegalLayout from "../components/product/LegalLayout.jsx";

const sections = [
  {
    id: "scope",
    title: "About this notice",
    content: (
      <>
        <p>
          This notice explains the information used by the current RuchiGo web
          app when you browse, create an account, place or fulfil an order,
          request recommendations, or contact support. It covers customer,
          restaurant and delivery-partner accounts.
        </p>
        <p>
          RuchiGo is the product name. The registered operator and formal
          privacy / grievance contact have not yet been supplied for this
          preview. The general support channel is listed below; it is not a
          substitute for publishing those details before launch.
        </p>
      </>
    ),
  },
  {
    id: "information",
    title: "Information we handle",
    content: (
      <>
        <p>The information depends on the features you use:</p>
        <ul>
          <li>
            <strong>Account:</strong> name, email, phone number, account role,
            optional profile photo, password hash and verification / account
            status.
          </li>
          <li>
            <strong>Ordering:</strong> saved addresses, cart items, saved
            dishes, order history, delivery instructions, discounts, payment
            references and order-status events.
          </li>
          <li>
            <strong>Restaurant and delivery activity:</strong> restaurant
            profiles, menus, availability, assignments, pickup / delivery
            timestamps and coordinates shared by a delivery partner.
          </li>
          <li>
            <strong>Your contributions:</strong> ratings, written reviews,
            support tickets, replies and recommendation preferences you submit.
          </li>
          <li>
            <strong>Service operation:</strong> authentication tokens, request
            and security information, and recorded administrative actions. A
            hosting or service provider may process connection details such as
            an IP address.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "purposes",
    title: "Why the app uses it",
    content: (
      <>
        <p>
          Information is used to sign you in, maintain your account, display
          restaurants and dishes, create and fulfil orders, verify payments,
          show delivery progress, calculate coupon eligibility, provide support
          and investigate misuse.
        </p>
        <p>
          Previous delivered-order item IDs can help rank food recommendations.
          Restaurant ratings use visible verified-order reviews. In-app
          notifications communicate order, payment and support updates.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who receives information",
    content: (
      <>
        <p>
          The restaurant handling an order and its assigned delivery partner
          receive order, contact and delivery information to fulfil it.
          Unassigned delivery partners see limited request information, not the
          customer’s full delivery address or payment details. Authorized
          platform administrators can access operational information to manage
          the service and support requests.
        </p>
        <p>
          Published reviews show the reviewer’s first name (or “Customer”),
          rating, comment and date. Avoid including contact details, addresses
          or other private information in a review.
        </p>
        <p>
          Configured hosting, email, payment, maps and AI providers process
          information relevant to their service. Their processing locations and
          retention terms depend on the chosen provider setup; these must be
          reviewed before a public launch.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    title: "AI recommendations",
    content: (
      <>
        <p>
          When Gemini recommendations are enabled, the app sends Google’s Gemini
          service your submitted food preferences, selected city, budget /
          dietary filters, and a limited menu catalog. The catalog includes dish
          IDs, names, prices, vegetarian markers, tags and whether a dish was
          previously ordered.
        </p>
        <p>
          The recommendation request does not deliberately include your account
          name, email, phone or delivery address. However, anything you type
          into the preference box can be included. Do not enter sensitive or
          identifying information there.
        </p>
        <p>
          Successful recommendation results are cached by the app for five
          minutes. That does not define Google’s retention period. If Gemini is
          unavailable or not configured, the app uses catalog-based suggestions
          and labels them accordingly. You can browse and order without
          requesting AI recommendations.
        </p>
        <p>
          Suggestions are not medical or allergy advice. Confirm ingredients and
          dietary suitability with the restaurant.
        </p>
      </>
    ),
  },
  {
    id: "location",
    title: "Location and maps",
    content: (
      <>
        <p>
          Customer location access is optional and requires your browser’s
          permission. The selected city and any coordinates you choose to
          capture can be saved in this browser. You can choose a city manually;
          location capture is not a guarantee that an address is serviceable.
          Selecting Near me sends approximate coordinates to RuchiGo to filter
          mapped restaurants by straight-line distance, not driving distance.
        </p>
        <p>
          Choosing approximate network location sends your network IP address to
          IPinfo through our backend to suggest a city. This is optional, may be
          affected by VPNs, and does not establish your delivery address. City
          lookup results are cached for up to 15 minutes; you must confirm an
          available city before it is selected. During a local development
          preview, the estimate may describe the development server’s network.
        </p>
        <p>
          A delivery partner can choose to share live coordinates during an
          active assignment. Sharing relies on the page remaining open, the
          connection and browser permission. Stopping sharing stops new updates;
          it does not delete a coordinate already recorded with the delivery.
        </p>
        <p>
          Opening a Google map or directions shares the location query and
          normal connection information with Google. You can view order status
          without opening the map. Browser settings let you revoke location
          permission.
        </p>
      </>
    ),
  },
  {
    id: "payments",
    title: "Payment information",
    content: (
      <>
        <p>
          When online payment is enabled, Razorpay’s hosted checkout handles
          payment entry. RuchiGo passes order/payment amounts and may prefill
          your name, email and phone. It stores provider order / payment
          references and payment status to verify the transaction.
        </p>
        <p>
          The app does not provide its own storage for full card numbers, CVV or
          UPI PINs. Do not share these in reviews, delivery notes or support
          messages. Available payment options are shown at checkout.
        </p>
      </>
    ),
  },
  {
    id: "storage",
    title: "Browser storage and retention",
    content: (
      <>
        <p>
          The web app uses local browser storage for sign-in/session information
          and preferences such as delivery location. Signing out clears the
          app’s stored authentication state. Clearing site storage can remove
          local preferences and sign you out, but does not delete records held
          by the service.
        </p>
        <p>
          Orders preserve the delivery address supplied at checkout, so editing
          a saved address does not rewrite past orders. Accounts, transactions,
          support conversations, reviews and audit records do not currently have
          an automated deletion schedule in this preview.
        </p>
        <p>
          Before launch, the operator must approve purpose-specific retention
          periods, backup handling and deletion procedures, including records
          that may need to be retained for legal, accounting or dispute-related
          reasons. No immediate or automatic deletion promise is made here.
        </p>
      </>
    ),
  },
  {
    id: "choices",
    title: "Your choices and requests",
    content: (
      <>
        <p>
          You can update supported profile fields in{" "}
          <Link to="/settings">Settings</Link>, manage saved addresses and
          dishes, and control browser location access. You can use normal
          discovery without the recommendation assistant.
        </p>
        <p>
          To ask for access, correction, deletion or an explanation of data use,{" "}
          <Link to="/support?category=privacy">submit a privacy request</Link>{" "}
          or email Support@ruchigo.online from your account email. Describe your
          request without sending passwords, payment credentials or
          identity-document scans.
        </p>
        <p>
          Requests are handled through support; a ticket is not an automatic
          export or deletion. Identity and any applicable record-retention
          requirements need to be assessed before action. This preview does not
          yet publish a statutory grievance officer or guaranteed response
          period.
        </p>
      </>
    ),
  },
  {
    id: "security-updates",
    title: "Security and notice updates",
    content: (
      <>
        <p>
          The app uses password hashing and account-role checks to limit access.
          These measures do not guarantee that a service is risk-free. Keep your
          sign-in details private, sign out on shared devices and report
          suspicious activity through support.
        </p>
        <p>
          This draft will need revision when the legal operator, provider
          configuration, retention rules or data uses are confirmed. The date at
          the top identifies this document revision; it is not a claim that a
          final legal policy is already in effect.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      type="privacy"
      title="Your data. Clearly explained."
      description="What RuchiGo uses, who it shares with, and the choices you have."
      summary="Your account and order details help the service fulfil meals and provide support. Location sharing and AI recommendations are optional. Use the controls in your account or contact support with a privacy request."
      sections={sections}
    />
  );
}
