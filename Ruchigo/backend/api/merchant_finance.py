"""Pre-tax merchant payable accounting; never initiates a bank transfer.

Version 1 funding: merchant coupons reduce sales; global food coupons and
promotional rewards are platform-funded. Confirmed refunds reduce each bill
component proportionally. Delivery/tips are excluded from commission.
"""
from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction
from django.db.models import Sum
from .models import CommissionPolicy, MerchantAccount, MerchantEntry, Order, Payment, RefundRequest

FIELDS = ("amount", "merchant_sales", "commission", "platform_promotion", "delivery_collected",
          "tip_collected", "payment_collected", "rounding_adjustment")


def cash(value):
    return Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def policy_data(policy=None):
    policy = policy or CommissionPolicy.objects.filter(pk=1).first() or CommissionPolicy(pk=1)
    return {"enabled": policy.enabled, "percent": str(policy.percent),
            "settlement_recording_enabled": policy.settlement_recording_enabled, "revision": policy.revision}


def commission_snapshot(subtotal, discount, reward_discount, coupon):
    policy = CommissionPolicy.objects.filter(pk=1).first()
    if not policy or not policy.enabled:
        return {}
    merchant_discount = discount if coupon and coupon.restaurant_id else Decimal(0)
    return {"version": 1, "revision": policy.revision, "percent": str(policy.percent),
            "merchant_sales": str(cash(subtotal - merchant_discount)),
            "platform_promotion": str(cash(discount - merchant_discount + reward_discount))}


def totals(queryset):
    result = queryset.aggregate(**{field: Sum(field) for field in FIELDS})
    return {field: result[field] or Decimal(0) for field in FIELDS}


def append_entry(account, **values):
    account.revision += 1
    account.balance += values.get("amount", Decimal(0))
    entry = MerchantEntry.objects.create(account=account, event_key=f"merchant:{account.pk}:{account.revision}", **values)
    account.save(update_fields=["balance", "revision", "updated_at"])
    return entry


@transaction.atomic
def sync_order_finance(order):
    # Same lock ordering as payment/refund callbacks, then one merchant account.
    order = Order.objects.select_for_update().get(pk=order.pk)
    snap = order.commission_snapshot
    if not snap or snap.get("version") != 1 or order.status != Order.Status.DELIVERED:
        return
    payment = Payment.objects.filter(order=order).first()
    if not payment or payment.status not in [Payment.Status.PAID, Payment.Status.REFUNDED] or payment.reconciliation_required:
        return
    if payment.amount != order.total or order.total < 0:
        return
    returned = RefundRequest.objects.filter(order=order, status="processed").aggregate(total=Sum("approved_amount"))["total"] or Decimal(0)
    # A legacy 'refunded' flag is not proof for a new snapshotted order.
    if returned < 0 or returned > order.total or (payment.status == Payment.Status.REFUNDED and returned != order.total):
        return
    ratio = (order.total - returned) / order.total if order.total else Decimal(1)
    target = {"merchant_sales": cash(Decimal(snap["merchant_sales"]) * ratio),
              "platform_promotion": cash(Decimal(snap["platform_promotion"]) * ratio),
              "delivery_collected": cash(order.delivery_fee * ratio), "tip_collected": cash(order.tip_amount * ratio),
              "payment_collected": cash(order.total - returned)}
    target["commission"] = cash(target["merchant_sales"] * Decimal(snap["percent"]) / 100)
    target["amount"] = target["merchant_sales"] - target["commission"]
    target["rounding_adjustment"] = target["payment_collected"] + target["platform_promotion"] - target["merchant_sales"] - target["delivery_collected"] - target["tip_collected"]
    account, _ = MerchantAccount.objects.get_or_create(restaurant_id=order.restaurant_id)
    account = MerchantAccount.objects.select_for_update().get(pk=account.pk)
    previous = totals(account.entries.filter(order=order, kind="accrual"))
    delta = {field: target[field] - previous[field] for field in FIELDS}
    if any(delta.values()) or not account.entries.filter(order=order, kind="accrual").exists():
        append_entry(account, order=order, kind="accrual", note="Confirmed refund adjustment" if returned else "Delivered order · collected payment", **delta)
