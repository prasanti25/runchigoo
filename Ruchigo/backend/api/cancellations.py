"""One self-service cancellation policy for order cards, tracking and the API."""
from django.db import transaction
from django.db.models import F
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .availability import restore_order_stock
from .models import AuditLog, CancellationPolicy, Coupon, Order, OrderEvent, Payment, RefundRequest, SupportTicket, TicketMessage
from .notifications import notify_order
from .permissions import IsAdmin
from .refunds import record_refund_update


def current_policy():
    return CancellationPolicy.objects.filter(pk=1).first() or CancellationPolicy(pk=1)


def order_policy(order):
    # Existing orders without a snapshot retain the original pre-acceptance,
    # support-reviewed prepaid policy. New admin settings never remove a right
    # already presented at checkout or silently enable old financial actions.
    snapshot = order.cancellation_policy_snapshot
    return CancellationPolicy(cutoff=snapshot.get("cutoff", "acceptance"),
                              allow_prepaid_refunds=snapshot.get("allow_prepaid_refunds", False),
                              revision=snapshot.get("revision", 1))


def cancellation_details(order, policy=None, payment=None):
    policy = policy or order_policy(order)
    payment = payment or getattr(order, "payment", None)
    result = {"allowed": False, "cutoff": policy.cutoff, "policy_revision": policy.revision,
              "refund_amount": None, "refund_destination": None, "message": "", "support_path": f"/support?order={order.pk}"}
    terminal = {
        Order.Status.PREPARING: "Your food is already being prepared, so this order can’t be cancelled. Contact support if something is wrong.",
        Order.Status.READY: "Your meal has been prepared. Cancellation is no longer available.",
        Order.Status.ASSIGNED: "Your prepared meal is awaiting pickup. Cancellation is no longer available.",
        Order.Status.OUT: "Your meal has been picked up and is on the way. Contact support for delivery help.",
        Order.Status.DELIVERED: "Delivered orders can’t be cancelled. Report a food or delivery issue to request a review.",
        Order.Status.CANCELLED: "This order is already cancelled.",
    }
    if order.status in terminal:
        result["message"] = terminal[order.status]
        return result
    if order.fulfillment_paused_at:
        result["message"] = "Support is reviewing a fulfilment issue with this order. Continue in the linked help conversation for the cancellation decision."
        return result
    if order.status == Order.Status.CONFIRMED and policy.cutoff != "preparation":
        result["message"] = "The restaurant has accepted your order. Self-service cancellation closes at acceptance; contact support for help."
        return result
    if order.status not in [Order.Status.AWAITING_PAYMENT, Order.Status.PENDING, Order.Status.CONFIRMED]:
        result["message"] = "Contact support to check this order before making changes."
        return result
    if payment and payment.status == Payment.Status.PAID:
        if payment.method != "razorpay" or not policy.allow_prepaid_refunds:
            result["message"] = "This payment needs a cancellation and refund review. Contact support before making another payment."
            return result
        if not payment.transaction_id or payment.amount < 1 or order.refund_requests.exists():
            result["message"] = "A payment or refund review is already required for this order. Continue with support."
            return result
        result.update(refund_amount=str(payment.amount), refund_destination="original_payment_method")
    elif payment and payment.status == Payment.Status.REFUNDED:
        result["message"] = "This payment is already refunded. Contact support to confirm the order status."
        return result
    result["allowed"] = True
    result["message"] = ("Payment is not confirmed. Cancelling closes this order; if a debit arrives later, it will be reviewed without restarting the order."
                         if order.status == Order.Status.AWAITING_PAYMENT else
                         "You can cancel before cooking starts." if policy.cutoff == "preparation" else
                         "You can cancel until the restaurant accepts your order.")
    return result


class CancellationInput(serializers.Serializer):
    reason = serializers.ChoiceField(choices=["changed_mind", "wrong_address", "ordered_by_mistake", "waiting_too_long", "other"], default="changed_mind")
    note = serializers.CharField(max_length=500, required=False, allow_blank=True)
    def validate(self, attrs):
        if attrs.get("reason") == "other" and not attrs.get("note"):
            raise serializers.ValidationError({"note": "Tell us briefly why you’re cancelling."})
        return attrs


@transaction.atomic
def cancel_customer_order(order_id, customer, data):
    order = Order.objects.select_for_update().get(pk=order_id, customer=customer)
    payment = Payment.objects.select_for_update().filter(order=order).first()
    policy = order_policy(order)
    eligibility = cancellation_details(order, policy, payment)
    if not eligibility["allowed"]:
        raise serializers.ValidationError(eligibility["message"])
    order.status = Order.Status.CANCELLED
    order.save(update_fields=["status", "updated_at"])
    restore_order_stock(order)
    if order.coupon_id:
        Coupon.objects.filter(pk=order.coupon_id, usage_count__gt=0).update(usage_count=F("usage_count")-1)
    if payment and payment.status == Payment.Status.PENDING:
        payment.status = Payment.Status.FAILED
        payment.save(update_fields=["status", "updated_at"])
    refund_id = None
    if eligibility["refund_amount"]:
        ticket = SupportTicket.objects.create(user=customer, order=order, category="refund", subject="Refund for cancelled order")
        TicketMessage.objects.create(ticket=ticket, body="You cancelled before the configured cutoff. The full captured payment will be submitted for refund to the original payment method. We’ll confirm when processing is complete.")
        refund = RefundRequest.objects.create(ticket=ticket, order=order, requested_amount=payment.amount, approved_amount=payment.amount,
                                             status=RefundRequest.Status.APPROVED, automatic_cancellation=True,
                                             decision_note=f"Full refund under the configured pre-{policy.cutoff} cancellation policy (revision {policy.revision}).")
        record_refund_update(refund, "Cancellation refund approved under the platform policy. Awaiting payment processing.")
        refund_id = refund.pk
    OrderEvent.objects.create(order=order, status=order.status, message="Cancelled by you before cooking started." if policy.cutoff == "preparation" else "Cancelled by you before restaurant acceptance.")
    AuditLog.objects.create(actor=customer, action="order.customer_cancelled", target=str(order.pk), metadata={"reason": data["reason"], "note": data.get("note", ""), "policy_revision": policy.revision, "refund_request_id": refund_id})
    notify_order(order)
    return order, refund_id


class CancellationPolicyInput(serializers.Serializer):
    cutoff = serializers.ChoiceField(choices=["acceptance", "preparation"])
    allow_prepaid_refunds = serializers.BooleanField()
    revision = serializers.IntegerField(min_value=1)


from .admin_access import AdminScopeMixin


class CancellationPolicyViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes = [IsAdmin]

    def list(self, request):
        policy = current_policy()
        return Response({"cutoff": policy.cutoff, "allow_prepaid_refunds": policy.allow_prepaid_refunds, "revision": policy.revision})

    @action(detail=False, methods=["post"])
    @transaction.atomic
    def configure(self, request):
        payload = CancellationPolicyInput(data=request.data)
        payload.is_valid(raise_exception=True)
        policy, _ = CancellationPolicy.objects.select_for_update().get_or_create(pk=1)
        data = payload.validated_data
        if policy.revision != data["revision"]:
            return Response({"detail": "Policy changed in another session. Reload it before saving."}, status=409)
        policy.cutoff = data["cutoff"]
        policy.allow_prepaid_refunds = data["allow_prepaid_refunds"]
        policy.revision += 1
        policy.save()
        AuditLog.objects.create(actor=request.user, action="cancellation_policy.updated", target="1", metadata={"cutoff": policy.cutoff, "allow_prepaid_refunds": policy.allow_prepaid_refunds, "revision": policy.revision})
        return self.list(request)
