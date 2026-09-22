// Resolve only known internal destinations; never navigate to arbitrary payload URLs.
export function notificationTarget(notification, role) {
  const meta = notification.metadata || {};
  const positiveId = (value) =>
    Number.isSafeInteger(Number(value)) && Number(value) > 0;
  if (positiveId(meta.ticket_id))
    return `/support?ticket=${Number(meta.ticket_id)}`;
  if (role === "admin" && meta.approval_role)
    return meta.approval_role === "delivery"
      ? "/admin-delivery-partners"
      : "/admin-users";
  if (role === "admin" && meta.restaurant_approval) return "/admin-restaurants";
  if (role === "delivery" && meta.available_delivery) return "/delivery-orders";
  if (positiveId(meta.order_id)) {
    if (role === "restaurant") return "/restaurant-orders";
    if (role === "admin") return "/admin-orders";
    if (role === "delivery")
      return meta.status === "delivered" || meta.status === "cancelled"
        ? "/delivery-earnings"
        : "/delivery-navigation";
    return `/tracking/${Number(meta.order_id)}`;
  }
  if (notification.kind === "review" && positiveId(meta.restaurant_id))
    return `/restaurant/${Number(meta.restaurant_id)}`;
  if (notification.kind === "account") return "/settings";
  return null;
}
