"""Versioned promotional rewards, with a reconciliable append-only ledger.

All mutations lock accounts in user-ID order; order lifecycle callers lock the
order first. Provider-confirmed refunds determine proportional adjustments.
No API accepts arbitrary balance changes or replaces an original-method refund.
"""
from decimal import Decimal, ROUND_DOWN
from django.db import transaction
from django.db.models import Sum
from rest_framework import serializers
from .models import Order, Payment, RefundRequest, RewardAccount, RewardEntry, RewardPolicy
from .notifications import notify

ZERO = Decimal("0.00")
CENT = Decimal("0.01")
POLICY_FIELDS = ("enabled", "revision", "points_per_100", "point_value", "redemption_percent", "cashback_percent", "cashback_cap", "referral_credit", "referral_minimum", "tiers")


def money(value):
    return Decimal(value).quantize(CENT, rounding=ROUND_DOWN)


def policy_data(policy=None):
    policy = policy or RewardPolicy.objects.filter(pk=1).first() or RewardPolicy(pk=1)
    return {key: str(getattr(policy, key)) if isinstance(getattr(policy, key), Decimal) else getattr(policy, key) for key in POLICY_FIELDS}


def reward_quote(user, data, food_amount, *, lock=False):
    policy = policy_data()
    points, credits = data.get("reward_points", 0), data.get("reward_credits", ZERO)
    if not policy["enabled"]:
        if points or credits:
            raise serializers.ValidationError({"rewards": "Rewards are not available for this checkout. Remove them and retry."})
        return {}, ZERO, None
    account, _ = RewardAccount.objects.get_or_create(user=user)
    if lock:
        account = RewardAccount.objects.select_for_update().get(pk=account.pk)
    point_value = Decimal(policy["point_value"])
    if points > max(0, account.points) or credits > max(ZERO, account.credits):
        raise serializers.ValidationError({"rewards": "Your rewards balance changed. Refresh and choose an available amount."})
    if points and point_value <= 0:
        raise serializers.ValidationError({"reward_points": "Point redemption is not enabled."})
    saving = money(points * point_value + credits)
    cap = money(food_amount * policy["redemption_percent"] / 100)
    if saving > cap:
        raise serializers.ValidationError({"rewards": f"Use up to ₹{cap:.2f} in rewards on this meal. Delivery and tips are excluded."})
    snapshot = {"policy": policy, "account_revision": account.revision, "points_used": points,
                "credits_used": str(credits), "discount": str(saving), "food_paid": str(money(food_amount-saving))}
    return snapshot, saving, account


def append_entry(account, order, kind, points=0, credits=ZERO, qualifying=0, note=""):
    """Internal only: account must already be locked. Entries are never edited."""
    credits = money(credits)
    if not (points or credits or qualifying):
        return
    account.revision += 1
    entry = RewardEntry.objects.create(account=account, order=order, kind=kind, points=points, credits=credits,
        qualifying_points=qualifying, note=note, event_key=f"rewards:{account.pk}:{account.revision}")
    account.points += points
    account.credits += credits
    account.qualifying_points += qualifying
    account.save(update_fields=["points", "credits", "qualifying_points", "revision", "updated_at"])
    notify([account.user_id], event=f"reward-entry:{entry.pk}", title="Your rewards were updated", message=note,
           kind="loyalty", metadata={"href": "/rewards"})


def reserve_rewards(account, order):
    if account:
        snap = order.reward_snapshot
        append_entry(account, order, "redeem", -snap["points_used"], -Decimal(snap["credits_used"]),
                     note="Rewards used on your meal. Delivery charges and tips are paid separately.")


def set_ledger_target(account, order, kind, *, points=0, credits=ZERO, qualifying=0, note):
    values = RewardEntry.objects.filter(account=account, order=order, kind=kind).aggregate(points=Sum("points"), credits=Sum("credits"), qualifying=Sum("qualifying_points"))
    append_entry(account, order, kind, points-(values["points"] or 0), credits-(values["credits"] or ZERO), qualifying-(values["qualifying"] or 0), note)


@transaction.atomic
def sync_order_rewards(order):
    # Reload even when passed an instance; reconciliation cannot use stale state.
    order = Order.objects.select_for_update().get(pk=order.pk)
    snap = order.reward_snapshot
    if not snap or not snap.get("policy", {}).get("enabled"):
        return
    payment = Payment.objects.filter(order=order).first()
    customer = RewardAccount.objects.get(user_id=order.customer_id)
    user_ids = [order.customer_id]
    if customer.referred_by_id:
        user_ids.append(customer.referred_by_id)
    accounts = {a.user_id: a for a in RewardAccount.objects.select_for_update().filter(user_id__in=user_ids).order_by("user_id")}
    account = accounts[order.customer_id]
    refunded = RefundRequest.objects.filter(order=order, status=RefundRequest.Status.PROCESSED).aggregate(amount=Sum("approved_amount"))["amount"] or ZERO
    if payment and payment.status == Payment.Status.REFUNDED:
        refunded = payment.amount
    ratio = min(Decimal(1), refunded / order.total) if order.total > 0 else ZERO
    cancelled = order.status == Order.Status.CANCELLED
    returned = Decimal(1) if cancelled else ratio
    set_ledger_target(account, order, "restore", points=int(snap["points_used"]*returned),
        credits=money(Decimal(snap["credits_used"])*returned),
        note="Rewards returned after cancellation or a confirmed refund.")
    paid = payment and payment.status in [Payment.Status.PAID, Payment.Status.REFUNDED] and not payment.reconciliation_required
    qualifies = order.status == Order.Status.DELIVERED and paid
    food_paid = money(Decimal(snap["food_paid"])*(1-ratio)) if qualifies else ZERO
    policy = snap["policy"]
    earned = int(food_paid*policy["points_per_100"]/100)
    cashback = min(money(food_paid*Decimal(policy["cashback_percent"])/100), Decimal(policy["cashback_cap"]))
    set_ledger_target(account, order, "earn", points=earned, credits=cashback, qualifying=earned,
        note="Meal rewards updated from your collected payment, after confirmed refunds. Cashback is promotional credit, not cash.")
    # Reserve qualification under the account lock. A refund never permits
    # claiming a second referral bonus on a later order.
    referral_eligible = qualifies and food_paid > 0 and food_paid >= Decimal(policy["referral_minimum"])
    if account.referred_by_id and not account.referral_order_id and referral_eligible and Decimal(policy["referral_credit"]) > 0:
        account.referral_order = order
        account.save(update_fields=["referral_order", "updated_at"])
    referral = Decimal(policy["referral_credit"]) if referral_eligible and account.referral_order_id == order.pk else ZERO
    if account.referred_by_id:
        for recipient in [account, accounts[account.referred_by_id]]:
            set_ledger_target(recipient, order, "referral", credits=referral,
                note="Referral credit updated for the first qualifying delivered and paid meal. Confirmed refunds can reverse this credit.")


def account_summary(user):
    policy = policy_data()
    account = RewardAccount.objects.filter(user=user).first()
    points = account.points if account else 0
    credits = account.credits if account else ZERO
    qualifying = max(0, account.qualifying_points) if account else 0
    tiers = policy["tiers"]
    reached = [tier for tier in tiers if tier["points"] <= qualifying]
    next_tier = next((tier for tier in tiers if tier["points"] > qualifying), None)
    return {"enabled": policy["enabled"], "points": points, "credits": str(credits), "qualifying_points": qualifying,
            "tier": reached[-1]["name"] if reached else None, "next_tier": next_tier,
            "referral_code": str(account.referral_code) if account else None,
            "referral_bound": bool(account and account.referred_by_id),
            "can_bind_referral": policy["enabled"] and not (account and account.referred_by_id) and not Order.objects.filter(customer=user).exists(),
            "adjustment_due": points < 0 or credits < 0, "policy": policy,
            "disclosure": "RuchiGo credits are promotional discounts, not cash. No top-ups, transfers or withdrawals. Rewards apply to food after coupons, not delivery or tips. Confirmed refunds proportionally adjust rewards; spent rewards may leave an adjustment balance."}
