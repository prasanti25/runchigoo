import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useRemote } from "../../lib/product.js";
import OrderReview from "./OrderReview.jsx";

export default function RecentMealReview() {
  const { token, user, role } = useAuth();
  return token && role === "customer" ? (
    <Reminder key={user.id} token={token} userId={user.id} />
  ) : null;
}

function Reminder({ token, userId }) {
  const storageKey = `ruchigo-review-reminders:${userId}`;
  const [dismissed, setDismissed] = useState(() => {
    try {
      const value = JSON.parse(sessionStorage.getItem(storageKey) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  });
  const orders = useRemote("/orders/?status=delivered", token);
  const order = orders.data?.results.find(
    (item) => !item.review && !dismissed.includes(item.id),
  );
  if (!order) return null;
  return (
    <OrderReview
      key={order.id}
      order={order}
      nudge
      onSaved={orders.reload}
      onDismiss={() => {
        // Dismiss this session's reminders altogether; never rotate another prompt
        // into place immediately after the customer has closed one.
        const next = orders.data.results.map((item) => item.id);
        setDismissed(next);
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          /* Session-only state still works. */
        }
      }}
    />
  );
}
