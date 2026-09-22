"""Release unpaid reservations without pretending the gateway cannot capture later."""
from django.db import transaction
from django.db.models import F
from django.utils import timezone

from .availability import restore_order_stock
from .models import AuditLog, Coupon, Order, OrderEvent, Payment
from .notifications import notify


def expire_locked_order(order, payment, now=None):
    """Caller holds order then payment locks, in that order across both handlers."""
    now = now or timezone.now()
    if (order.status != Order.Status.AWAITING_PAYMENT or not order.payment_expires_at
            or order.payment_expires_at > now or payment.status == Payment.Status.PAID):
        return False
    order.status = Order.Status.CANCELLED
    order.save(update_fields=["status", "updated_at"])
    restore_order_stock(order)
    payment.status = Payment.Status.FAILED
    payment.save(update_fields=["status", "updated_at"])
    if order.coupon_id:
        Coupon.objects.filter(pk=order.coupon_id, usage_count__gt=0).update(usage_count=F("usage_count")-1)
    OrderEvent.objects.create(order=order, status=order.status, message="Payment time expired. Your items were released. If money was debited, contact support with this order.")
    AuditLog.objects.create(action="payment.reservation_expired", target=str(order.pk))
    notify([order.customer_id], event=f"order:{order.pk}:payment_expired", title="Payment time expired",
           message="This order wasn’t sent to the kitchen. You can reorder at current prices. If money was debited, help is available from your order.",
           kind="payment", metadata={"order_id": order.pk})
    return True


def expire_unpaid_orders(*, customer_id=None, restaurant_id=None, limit=100):
    now = timezone.now()
    orders = Order.objects.filter(status=Order.Status.AWAITING_PAYMENT, payment_expires_at__lte=now)
    if customer_id is not None:
        orders = orders.filter(customer_id=customer_id)
    if restaurant_id is not None:
        orders = orders.filter(restaurant_id=restaurant_id)
    ids = list(orders.order_by("payment_expires_at").values_list("pk", flat=True)[:limit])
    expired = 0
    for pk in ids:
        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=pk)
            payment = Payment.objects.select_for_update().get(order=order)
            expired += int(expire_locked_order(order, payment, now))
    return expired
