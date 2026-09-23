"""Razorpay checkout. Amounts and payment status are always verified server-side."""
import base64
import hashlib
import hmac
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from django.conf import settings
from django.db import transaction
from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AuditLog, Order, OrderEvent, Payment, SupportTicket, TicketMessage
from .notifications import notify, admin_ids, notify_order, notify_payment
from .payment_expiry import expire_locked_order, expire_unpaid_orders
from .permissions import IsCustomer


def payment_enabled():
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)


def gateway(path, payload=None, *, refund_idempotency_key=None):
    if not payment_enabled():
        raise serializers.ValidationError("Online payments are not available yet. Choose cash on delivery.")
    credentials = base64.b64encode(f"{settings.RAZORPAY_KEY_ID}:{settings.RAZORPAY_KEY_SECRET}".encode()).decode()
    headers = {"Authorization": f"Basic {credentials}", "Content-Type": "application/json"}
    if refund_idempotency_key:
        headers["X-Refund-Idempotency"] = refund_idempotency_key
    request = Request(f"https://api.razorpay.com/v1/{path}", data=json.dumps(payload).encode() if payload is not None else None, headers=headers, method="POST" if payload is not None else "GET")
    try:
        with urlopen(request, timeout=12) as response:
            return json.load(response)
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        raise serializers.ValidationError("The payment service could not confirm this request. Please retry or contact support.") from exc


def create_payment_order(payment):
    result = gateway("orders", {"amount": int(payment.amount * 100), "currency": "INR", "receipt": f"ruchigo_{payment.order_id}"})
    if not result.get("id"):
        raise serializers.ValidationError("Payment checkout could not be opened.")
    payment.provider_order_id = result["id"]
    payment.save(update_fields=["provider_order_id", "updated_at"])


@transaction.atomic
def record_captured(provider_order, payment_id, amount, currency):
    candidate = Payment.objects.filter(provider_order_id=provider_order).first() if provider_order and payment_id else None
    if not candidate or int(candidate.amount * 100) != amount or currency != "INR":
        raise serializers.ValidationError("Payment details do not match this order.")
    order = Order.objects.select_for_update().get(pk=candidate.order_id)
    payment = Payment.objects.select_for_update().get(pk=candidate.pk)
    if payment.status in [Payment.Status.PAID, Payment.Status.REFUNDED]:
        if payment.transaction_id != payment_id:
            raise serializers.ValidationError("This order already has a different confirmed payment.")
        return order
    expire_locked_order(order, payment)
    payment.status = Payment.Status.PAID
    payment.transaction_id = payment_id
    payment.reconciliation_required = order.status == Order.Status.CANCELLED
    payment.save(update_fields=["status", "transaction_id", "reconciliation_required", "updated_at"])
    if payment.reconciliation_required:
        # Never revive an expired order: its inventory may already be sold.
        # Record the real capture and open one auditable resolution case. A
        # refund is NOT marked complete without provider confirmation.
        ticket = SupportTicket.objects.create(user=order.customer, order=order, category="refund", subject="Payment received after order closed")
        from .models import RefundRequest
        RefundRequest.objects.create(ticket=ticket, order=order, requested_amount=payment.amount)
        TicketMessage.objects.create(ticket=ticket, body="Payment reached us after this order closed. The kitchen will not prepare this order. Support will check the payment and arrange the appropriate resolution.")
        notify([order.customer_id, *admin_ids("finance")], event=f"payment:{payment.pk}:late_capture", title="Payment needs a review",
               message="Payment arrived after the order closed. A support case has been opened; the order has not been restarted.",
               kind="payment", metadata={"order_id": order.pk, "ticket_id": ticket.pk})
        AuditLog.objects.create(action="payment.late_capture", target=str(payment.pk), metadata={"ticket_id": ticket.pk})
        return order
    if order.status == Order.Status.AWAITING_PAYMENT:
        order.status = Order.Status.PENDING
        order.save(update_fields=["status", "updated_at"])
        OrderEvent.objects.create(order=order, status=order.status, message="Payment confirmed. Sent to the restaurant.")
        notify_order(order)
    notify_payment(order)
    AuditLog.objects.create(actor=order.customer, action="payment.captured", target=str(payment.id))
    from .rewards import sync_order_rewards
    sync_order_rewards(order)
    from .merchant_finance import sync_order_finance
    sync_order_finance(order)
    return order


class PaymentSignature(serializers.Serializer):
    order_id = serializers.IntegerField(min_value=1)
    razorpay_payment_id = serializers.RegexField(r"^pay_[a-zA-Z0-9]+$", max_length=120)
    razorpay_signature = serializers.RegexField(r"^[a-f0-9]{64}$")


from .admin_access import AdminScopeMixin


class OnlinePaymentViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes = [IsCustomer]
    def list(self, request):
        return Response({"online_available": payment_enabled(), "key_id": settings.RAZORPAY_KEY_ID if payment_enabled() else ""})

    @action(detail=False, methods=["post"])
    def verify(self, request):
        payload = PaymentSignature(data=request.data)
        payload.is_valid(raise_exception=True)
        data = payload.validated_data
        payment = Payment.objects.filter(order_id=data["order_id"], order__customer=request.user, method="razorpay").first()
        if not payment or not payment.provider_order_id or not payment_enabled():
            raise serializers.ValidationError("This payment checkout is unavailable.")
        expected = hmac.new(settings.RAZORPAY_KEY_SECRET.encode(), f"{payment.provider_order_id}|{data['razorpay_payment_id']}".encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, data["razorpay_signature"]):
            raise serializers.ValidationError("The payment signature could not be verified.")
        expire_unpaid_orders(customer_id=request.user.pk)
        result = gateway(f"payments/{data['razorpay_payment_id']}")
        if result.get("order_id") != payment.provider_order_id or result.get("amount") != int(payment.amount * 100) or result.get("currency") != "INR":
            raise serializers.ValidationError("Payment amount does not match your order.")
        if result.get("status") == "authorized":
            if Order.objects.filter(pk=payment.order_id, status=Order.Status.CANCELLED).exists():
                raise serializers.ValidationError("This payment window has expired. Contact support if money was debited; do not pay again for this order.")
            result = gateway(f"payments/{data['razorpay_payment_id']}/capture", {"amount": int(payment.amount * 100), "currency": "INR"})
        if result.get("status") != "captured":
            raise serializers.ValidationError("Payment has not been captured. Your order will update after confirmation.")
        order = record_captured(payment.provider_order_id, data["razorpay_payment_id"], result["amount"], result["currency"])
        return Response({"order_id": order.id, "status": order.status, "payment_status": "paid"})

    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def webhook(self, request):
        secret = settings.RAZORPAY_WEBHOOK_SECRET
        signature = request.headers.get("X-Razorpay-Signature", "")
        expected = hmac.new(secret.encode(), request.body, hashlib.sha256).hexdigest() if secret else ""
        if not secret or not hmac.compare_digest(expected, signature):
            return Response({"detail": "Invalid webhook signature."}, status=400)
        if request.data.get("event") == "payment.captured":
            entity = request.data.get("payload", {}).get("payment", {}).get("entity", {})
            record_captured(entity.get("order_id"), entity.get("id"), entity.get("amount"), entity.get("currency"))
        elif request.data.get("event") in ["refund.processed", "refund.failed"]:
            from .refunds import record_provider_refund
            entity = request.data.get("payload", {}).get("refund", {}).get("entity", {})
            record_provider_refund(entity)
        return Response({"received": True})
