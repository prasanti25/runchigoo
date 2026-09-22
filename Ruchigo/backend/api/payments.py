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
from .models import AuditLog, Order, OrderEvent, Payment
from .notifications import notify_order, notify_payment
from .permissions import IsCustomer


def payment_enabled():
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)


def gateway(path, payload=None):
    if not payment_enabled():
        raise serializers.ValidationError("Online payments are not available yet. Choose cash on delivery.")
    credentials = base64.b64encode(f"{settings.RAZORPAY_KEY_ID}:{settings.RAZORPAY_KEY_SECRET}".encode()).decode()
    request = Request(f"https://api.razorpay.com/v1/{path}", data=json.dumps(payload).encode() if payload is not None else None, headers={"Authorization": f"Basic {credentials}", "Content-Type": "application/json"}, method="POST" if payload is not None else "GET")
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
    payment = Payment.objects.select_for_update().filter(provider_order_id=provider_order).first()
    if not payment or int(payment.amount * 100) != amount or currency != "INR":
        raise serializers.ValidationError("Payment details do not match this order.")
    if payment.status == Payment.Status.PAID:
        if payment.transaction_id != payment_id:
            raise serializers.ValidationError("This order already has a different confirmed payment.")
        return payment.order
    order = Order.objects.select_for_update().get(pk=payment.order_id)
    payment.status = Payment.Status.PAID
    payment.transaction_id = payment_id
    payment.save(update_fields=["status", "transaction_id", "updated_at"])
    if order.status == Order.Status.AWAITING_PAYMENT:
        order.status = Order.Status.PENDING
        order.save(update_fields=["status", "updated_at"])
        OrderEvent.objects.create(order=order, status=order.status, message="Payment confirmed. Sent to the restaurant.")
        notify_order(order)
    notify_payment(order)
    AuditLog.objects.create(actor=order.customer, action="payment.captured", target=str(payment.id))
    return order


class PaymentSignature(serializers.Serializer):
    order_id = serializers.IntegerField(min_value=1)
    razorpay_payment_id = serializers.RegexField(r"^pay_[a-zA-Z0-9]+$", max_length=120)
    razorpay_signature = serializers.RegexField(r"^[a-f0-9]{64}$")


class OnlinePaymentViewSet(viewsets.ViewSet):
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
        result = gateway(f"payments/{data['razorpay_payment_id']}")
        if result.get("order_id") != payment.provider_order_id or result.get("amount") != int(payment.amount * 100) or result.get("currency") != "INR":
            raise serializers.ValidationError("Payment amount does not match your order.")
        if result.get("status") == "authorized":
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
        return Response({"received": True})
