"""One source of truth for coupon eligibility, amounts and cart discovery.

Browsing/applying never reserves a redemption. Checkout rechecks under a coupon
row lock; delivery thresholds use the same address/zone quote as checkout.
"""
from decimal import Decimal

from django.db.models import Case, Count, F, IntegerField, OuterRef, Q, Subquery, Value, When
from django.db.models.functions import Coalesce
from django.utils import timezone

from .models import Coupon, Order


def coupon_discount(coupon, subtotal):
    amount, percent = coupon.discount_amount or Decimal(0), coupon.discount_percent or Decimal(0)
    discount = amount if amount > 0 else subtotal * percent / Decimal(100)
    if coupon.max_discount is not None:
        discount = min(discount, coupon.max_discount)
    return max(Decimal(0), min(discount, subtotal)).quantize(Decimal("0.01"))


def coupon_status(coupon, subtotal, *, user=None, restaurant=None, now=None, has_orders=None, uses=None):
    now = now or timezone.now()
    status, reason = "eligible", "Ready to apply to this bag."
    history = Order.objects.filter(customer=user).exclude(status=Order.Status.CANCELLED) if user else Order.objects.none()
    if not coupon.is_active:
        status, reason = "inactive", "This coupon is no longer available."
    elif coupon.starts_at > now:
        status, reason = "upcoming", "This offer has not started yet."
    elif coupon.ends_at <= now:
        status, reason = "expired", "This coupon has expired."
    elif coupon.usage_limit is not None and coupon.usage_count >= coupon.usage_limit:
        status, reason = "exhausted", "This coupon has reached its usage limit."
    elif coupon.restaurant_id and coupon.restaurant_id != getattr(restaurant, "pk", None):
        status, reason = "different_restaurant", "This coupon belongs to a different restaurant."
    elif coupon.first_order_only and (not user or (history.exists() if has_orders is None else has_orders)):
        status, reason = "first_order_only", "This offer is available on your first order only."
    elif coupon.per_user_limit and (not user or (history.filter(coupon=coupon).count() if uses is None else uses) >= coupon.per_user_limit):
        status, reason = "user_limit", "You have reached the limit for this coupon."
    elif (coupon.discount_amount or 0) <= 0 and (coupon.discount_percent or 0) <= 0:
        status, reason = "no_discount", "This coupon has no valid discount."
    elif subtotal < coupon.min_order_amount:
        status, reason = "minimum_spend", f"Add ₹{coupon.min_order_amount-subtotal:.2f} more in food to unlock this offer."
    elif coupon_discount(coupon, subtotal) <= 0:
        status, reason = "no_discount", "This coupon does not reduce the current bill."
    return {"status": status, "eligible": status == "eligible", "reason": reason,
            "amount_to_unlock": str(coupon.min_order_amount-subtotal) if status == "minimum_spend" else "0.00",
            "discount": str(coupon_discount(coupon, subtotal)) if status == "eligible" else "0.00",
            "unlock_discount": str(coupon_discount(coupon, coupon.min_order_amount)) if status == "minimum_spend" else "0.00"}


def coupon_row(coupon, subtotal, **context):
    return {"id": coupon.pk, "code": coupon.code, "description": coupon.description,
            "restaurant_name": coupon.restaurant.name if coupon.restaurant_id else None,
            "discount_amount": coupon.discount_amount, "discount_percent": coupon.discount_percent,
            "max_discount": coupon.max_discount, "min_order_amount": coupon.min_order_amount,
            "first_order_only": coupon.first_order_only, "per_user_limit": coupon.per_user_limit,
            "starts_at": coupon.starts_at, "ends_at": coupon.ends_at,
            **coupon_status(coupon, subtotal, uses=getattr(coupon, "user_uses", None), **context)}


def cart_coupons(user, restaurant, subtotal):
    now = timezone.now()
    history = Order.objects.filter(customer=user).exclude(status=Order.Status.CANCELLED)
    has_orders = history.exists()
    uses = history.filter(coupon_id=OuterRef("pk")).values("coupon_id").annotate(n=Count("pk")).values("n")
    # Inactive drafts and unrelated restaurant campaigns are not a public feed.
    coupons = Coupon.objects.filter(is_active=True).filter(Q(restaurant__isnull=True) | Q(restaurant=restaurant)).select_related("restaurant").annotate(user_uses=Coalesce(Subquery(uses), Value(0)))
    valid = Q(starts_at__lte=now, ends_at__gt=now) & (Q(usage_limit__isnull=True) | Q(usage_count__lt=F("usage_limit"))) & (Q(per_user_limit__isnull=True) | Q(user_uses__lt=F("per_user_limit"))) & (Q(discount_amount__gt=0) | Q(discount_percent__gt=0))
    if has_orders:
        valid &= Q(first_order_only=False)
    ready = valid & Q(min_order_amount__lte=subtotal) if subtotal > 0 else Q(pk__isnull=True)
    coupons = coupons.annotate(eligibility_rank=Case(When(ready, then=Value(0)), When(valid & Q(min_order_amount__gt=subtotal), then=Value(1)), default=Value(2), output_field=IntegerField())).order_by("eligibility_rank", "min_order_amount", "ends_at", "pk")
    return coupons, {"user": user, "restaurant": restaurant, "now": now, "has_orders": has_orders}
