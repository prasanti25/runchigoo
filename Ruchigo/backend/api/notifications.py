"""Transactional in-app activity delivery. No external messaging or personal data.

Call from the successful operation's atomic transaction, not model signals: seeds,
failed requests and repeated provider callbacks must not produce extra alerts.
"""
from .models import DeliveryAssignment, Notification, Order, User


def notify(user_ids, *, event, title, message, kind="general", metadata=None):
    ids = set(user_ids) - {None}
    metadata = dict(metadata or {})
    customer_id = Order.objects.filter(pk=metadata["order_id"]).values_list("customer_id", flat=True).first() if isinstance(metadata.get("order_id"), int) else None
    from .models import SupportTicket
    ticket_user = SupportTicket.objects.filter(pk=metadata["ticket_id"]).values_list("user_id", flat=True).first() if isinstance(metadata.get("ticket_id"), int) else None
    Notification.objects.bulk_create([
        Notification(user_id=user_id, event_key=event, title=title, message=message,
                     kind=kind, metadata={**metadata, **({"personal_order": True} if customer_id == user_id else {}), **({"personal_ticket": True} if ticket_user == user_id else {})}) for user_id in ids
    ], ignore_conflicts=True, batch_size=250)


def admin_ids(scope="support"):
    from .admin_access import effective_scopes
    users = User.objects.filter(role=User.Role.ADMIN, is_active=True)
    return [user.pk for user in users if "*" in (scopes := effective_scopes(user)) or scope in scopes]


def notify_order(order):
    number = str(order.number)[:8].upper()
    titles = {
        Order.Status.AWAITING_PAYMENT: "Complete your payment",
        Order.Status.PENDING: "Order placed",
        Order.Status.CONFIRMED: "Your order is accepted",
        Order.Status.PREPARING: "Your meal is being prepared",
        Order.Status.READY: "Your meal is ready",
        Order.Status.ASSIGNED: "Delivery partner assigned",
        Order.Status.OUT: "Your food is on the way",
        Order.Status.DELIVERED: "Delivered. Enjoy your meal!",
        Order.Status.CANCELLED: "Order cancelled",
    }
    metadata = {"order_id": order.pk, "status": order.status}
    event = f"order:{order.pk}:{order.status}"
    title = titles.get(order.status, "Order updated")
    notify([order.customer_id], event=event, title=title,
           message=f"Order #{number} from {order.restaurant.name}: {order.get_status_display().lower()}.",
           kind="order", metadata=metadata)
    if order.status == Order.Status.AWAITING_PAYMENT:
        return  # Never ask a kitchen/courier to act on an unpaid order.
    if order.status in [Order.Status.PENDING, Order.Status.ASSIGNED, Order.Status.OUT, Order.Status.DELIVERED, Order.Status.CANCELLED]:
        notify([order.restaurant.owner_id], event=event,
               title="New order for your kitchen" if order.status == Order.Status.PENDING else title,
               message=f"Order #{number}: {order.get_status_display().lower()}.", kind="order", metadata=metadata)
    partner_id = DeliveryAssignment.objects.filter(order=order).values_list("partner_id", flat=True).first()
    if partner_id and order.status in [Order.Status.ASSIGNED, Order.Status.OUT, Order.Status.DELIVERED, Order.Status.CANCELLED]:
        notify([partner_id], event=event, title=title, message=f"Delivery #{number}: {order.get_status_display().lower()}.", kind="order", metadata=metadata)
    if order.status == Order.Status.READY:
        # Same pool as /orders/available/: geography-based dispatch is not yet
        # implemented. Only active, online partners receive this preview alert.
        notify(User.objects.filter(role=User.Role.DELIVERY, is_active=True, is_available=True).values_list("pk", flat=True),
               event=event, title="A delivery is ready for pickup",
               message=f"{order.restaurant.name}, {order.restaurant.city}. Open requests to check availability.",
               kind="delivery", metadata={"available_delivery": True})


def notify_payment(order):
    notify([order.customer_id, order.restaurant.owner_id], event=f"payment:{order.pk}:paid",
           title="Payment confirmed", message=f"Payment received for order #{str(order.number)[:8].upper()}.",
           kind="payment", metadata={"order_id": order.pk})
