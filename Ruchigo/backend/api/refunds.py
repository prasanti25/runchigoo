"""Order-linked refund reviews; only verified provider responses mark money returned."""
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import AuditLog, Order, Payment, RefundRequest, SupportTicket, TicketMessage
from .notifications import admin_ids, notify
from .permissions import IsAdmin
from .payments import gateway, payment_enabled


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = RefundRequest
        fields = ["id", "ticket", "order", "status", "requested_amount", "approved_amount", "decision_note", "processed_at", "created_at", "updated_at"]
        read_only_fields = fields


def record_refund_update(refund, note, actor=None):
    message = TicketMessage.objects.create(ticket=refund.ticket, author=actor, body=note)
    SupportTicket.objects.filter(pk=refund.ticket_id).update(updated_at=timezone.now())
    AuditLog.objects.create(actor=actor, action=f"refund.{refund.status}", target=str(refund.pk))
    notify([refund.ticket.user_id, *admin_ids("finance")], event=f"refund:{refund.pk}:message:{message.pk}",
           title="Refund request updated", message=note, kind="refund", metadata={"order_id": refund.order_id, "ticket_id": refund.ticket_id})


@transaction.atomic
def record_provider_refund(entity, *, expected_refund_id=None):
    if not isinstance(entity, dict):
        raise serializers.ValidationError("Refund confirmation must contain a provider refund record.")
    provider_id = entity.get("id")
    if not isinstance(provider_id, str) or not provider_id.startswith("rfnd_"):
        raise serializers.ValidationError("Refund confirmation is missing a valid reference.")
    candidate = RefundRequest.objects.filter(provider_refund_id=provider_id).first()
    if expected_refund_id is not None:
        if candidate is not None and candidate.pk != expected_refund_id:
            raise serializers.ValidationError("This provider reference belongs to another refund request.")
        candidate = RefundRequest.objects.filter(pk=expected_refund_id).first()
    if candidate is None:
        receipt = str(entity.get("receipt", ""))
        if not receipt.startswith("ruchigo_refund_") or not receipt[15:].isdigit():
            raise serializers.ValidationError("This refund does not match a RuchiGo request.")
        candidate = RefundRequest.objects.filter(pk=int(receipt[15:])).first()
    if candidate is None:
        raise serializers.ValidationError("Refund request not found.")
    order = Order.objects.select_for_update().get(pk=candidate.order_id)
    payment = Payment.objects.select_for_update().get(order=order)
    refund = RefundRequest.objects.select_for_update().get(pk=candidate.pk)
    if (refund.approved_amount is None or entity.get("payment_id") != payment.transaction_id
            or entity.get("currency") != "INR"
            or entity.get("amount") != int(refund.approved_amount * 100)
            or (refund.provider_refund_id and refund.provider_refund_id != provider_id)):
        raise serializers.ValidationError("Refund confirmation does not match the payment and approved amount.")
    if refund.status == RefundRequest.Status.PROCESSED:
        return refund
    if refund.status not in [RefundRequest.Status.PROCESSING, RefundRequest.Status.FAILED]:
        raise serializers.ValidationError("This refund has not been submitted for processing.")
    refund.provider_refund_id = provider_id
    status = entity.get("status")
    if status == "processed":
        refund.status = RefundRequest.Status.PROCESSED
        refund.processed_at = timezone.now()
    elif status == "failed":
        if refund.status == RefundRequest.Status.FAILED:
            return refund
        refund.status = RefundRequest.Status.FAILED
    elif status != "pending":
        raise serializers.ValidationError("Unknown refund status; confirmation is still required.")
    refund.save()
    if status == "processed":
        returned = RefundRequest.objects.filter(order=order, status=RefundRequest.Status.PROCESSED).aggregate(total=Sum("approved_amount"))["total"] or Decimal(0)
        if returned >= payment.amount:
            payment.status = Payment.Status.REFUNDED
            payment.reconciliation_required = False
            payment.save(update_fields=["status", "reconciliation_required", "updated_at"])
        record_refund_update(refund, f"A refund of ₹{refund.approved_amount:.2f} was processed to your original payment method. Your bank or payment app determines when it appears.")
        from .rewards import sync_order_rewards
        sync_order_rewards(order)
        from .merchant_finance import sync_order_finance
        sync_order_finance(order)
    elif status == "failed":
        record_refund_update(refund, "The payment provider could not process this refund. Support needs to review it; the refund is not marked complete.")
    return refund


class RefundDecision(serializers.Serializer):
    decision = serializers.ChoiceField(choices=["reviewing", "approved", "rejected"])
    note = serializers.CharField(max_length=1000, allow_blank=False)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.01"), required=False)


def submit_approved_refund(refund_id, actor=None):
    if not payment_enabled():
        raise serializers.ValidationError("Payment provider is not configured. Approval does not transfer funds.")
    candidate = RefundRequest.objects.get(pk=refund_id)
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=candidate.order_id)
        payment = Payment.objects.select_for_update().get(order=order)
        refund = RefundRequest.objects.select_for_update().get(pk=candidate.pk)
        if refund.status != RefundRequest.Status.APPROVED:
            raise serializers.ValidationError("Only an approved, unsubmitted request can be processed. Use Check provider status for a pending submission.")
        if payment.method != "razorpay" or payment.status != Payment.Status.PAID or not payment.transaction_id or order.status not in [Order.Status.DELIVERED, Order.Status.CANCELLED]:
            raise serializers.ValidationError("Online refunds require a captured online payment and a delivered or cancelled order. Cash refunds need an approved offline process.")
        refund.status = RefundRequest.Status.PROCESSING
        refund.save()
        record_refund_update(refund, "Your approved refund is being submitted to the payment provider. We’ll update this conversation once it is confirmed.", actor)
    # Durable state + provider idempotency protect against process interruption.
    try:
        entity = gateway(f"payments/{payment.transaction_id}/refund", {"amount": int(refund.approved_amount * 100), "receipt": f"ruchigo_refund_{refund.pk}"}, refund_idempotency_key=f"ruchigo-{order.number}-{refund.pk}")
        return record_provider_refund(entity, expected_refund_id=refund.pk), False
    except serializers.ValidationError:
        return refund, True


from .admin_access import AdminScopeMixin


class RefundViewSet(AdminScopeMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = RefundSerializer
    permission_classes = [IsAdmin]
    queryset = RefundRequest.objects.select_related("ticket", "order").order_by("-created_at")
    filterset_fields = ["status", "order"]

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def review(self, request, pk=None):
        candidate = self.get_object()
        Order.objects.select_for_update().get(pk=candidate.order_id)
        payment = Payment.objects.select_for_update().get(order_id=candidate.order_id)
        refund = RefundRequest.objects.select_for_update().get(pk=candidate.pk)
        data = RefundDecision(data=request.data)
        data.is_valid(raise_exception=True)
        if refund.status not in [RefundRequest.Status.REQUESTED, RefundRequest.Status.REVIEWING]:
            raise serializers.ValidationError("This request already has a decision. Processing and completed refunds cannot be changed here.")
        decision = data.validated_data["decision"]
        if decision == "approved":
            amount = data.validated_data.get("amount")
            if payment.method == "razorpay" and amount is not None and amount < 1:
                raise serializers.ValidationError("The online payment provider requires a refund amount of at least ₹1.")
            reserved = RefundRequest.objects.filter(order_id=refund.order_id, status__in=["approved", "processing", "processed", "failed"]).exclude(pk=refund.pk).aggregate(total=Sum("approved_amount"))["total"] or Decimal(0)
            if payment.status != Payment.Status.PAID or amount is None or amount > min(refund.requested_amount, payment.amount-reserved):
                raise serializers.ValidationError("Approval must be a positive amount no greater than the request and the unrefunded captured payment.")
            refund.approved_amount = amount
        refund.status = decision
        refund.decision_note = data.validated_data["note"]
        refund.save()
        record_refund_update(refund, f"Refund request: {refund.get_status_display().lower()}. {refund.decision_note}", request.user)
        return Response(self.get_serializer(refund).data)

    @action(detail=True, methods=["post"])
    def process(self, request, pk=None):
        refund, pending = submit_approved_refund(self.get_object().pk, request.user)
        if pending:
            return Response({**self.get_serializer(refund).data, "detail": "Submission confirmation is pending. Check provider status; do not submit a duplicate refund."}, status=202)
        return Response(self.get_serializer(refund).data)

    @action(detail=True, methods=["post"])
    def reconcile(self, request, pk=None):
        refund = self.get_object()
        if refund.status not in [RefundRequest.Status.PROCESSING, RefundRequest.Status.FAILED]:
            raise serializers.ValidationError("Only submitted refunds need reconciliation.")
        if refund.provider_refund_id:
            entity = gateway(f"refunds/{refund.provider_refund_id}")
        else:
            result = gateway(f"payments/{refund.order.payment.transaction_id}/refunds?count=100")
            matches = [row for row in result.get("items", []) if row.get("receipt") == f"ruchigo_refund_{refund.pk}"]
            if len(matches) != 1:
                return Response({"detail": "A unique provider confirmation was not found. Keep this request pending and check the provider dashboard; no additional refund was submitted."}, status=409)
            entity = matches[0]
        return Response(self.get_serializer(record_provider_refund(entity, expected_refund_id=refund.pk)).data)
