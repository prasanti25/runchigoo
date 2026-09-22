import { Link } from "react-router-dom";
import {
  ArrowRight,
  CircleAlert,
  LifeBuoy,
  PackageX,
  ReceiptText,
  Clock3,
} from "lucide-react";

const orderIssues = [
  {
    category: "food_quality",
    title: "Food spoiled or poor quality",
    description: "Tell us about freshness, taste or safety",
    icon: CircleAlert,
  },
  {
    category: "missing_item",
    title: "Items missing or incorrect",
    description: "Choose the dishes that need attention",
    icon: PackageX,
  },
  {
    category: "refund",
    title: "Payment or refund help",
    description: "Request a review and follow its status",
    icon: ReceiptText,
  },
];

export default function OrderHelp({ order, onChoose }) {
  if (!order) return null;
  const issues = ["delivered", "out_for_delivery"].includes(order.status)
    ? orderIssues
    : [
        {
          category: "delivery",
          title: "Order status or cancellation",
          description: "Check the kitchen update or get help with this order",
          icon: Clock3,
        },
        orderIssues[2],
      ];
  return (
    <section className="order-help-card" aria-label="Help with this order">
      <div className="flex-row between">
        <div>
          <h2>Need help with this order?</h2>
          <p>We’ve got your order details. Tell us what went wrong.</p>
        </div>
        <LifeBuoy size={25} />
      </div>
      <div className="order-issue-options">
        {issues.map(({ category, title, description, icon: Icon }) => {
          const content = (
            <>
              <Icon size={20} />
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <ArrowRight size={16} />
            </>
          );
          return onChoose ? (
            <button key={category} onClick={() => onChoose(category, title)}>
              {content}
            </button>
          ) : (
            <Link
              key={category}
              to={`/support?order=${order.id}&category=${category}&compose=1`}
            >
              {content}
            </Link>
          );
        })}
      </div>
      <Link className="text-link" to={`/support?order=${order.id}`}>
        Chat about this order <ArrowRight size={15} />
      </Link>
    </section>
  );
}
