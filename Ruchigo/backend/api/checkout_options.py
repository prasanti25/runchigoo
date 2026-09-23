"""Explicit kitchen scheduling and optional cash tips; no online payout promise."""
from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .admin_access import AdminScopeMixin
from .availability import accepting_orders
from .models import AuditLog, DeliveryPolicy
from .permissions import IsAdmin


def checkout_extras(restaurant, data):
    quote = {}
    scheduled = data.get("scheduled_for")
    if scheduled:
        if not restaurant.scheduling_enabled or not restaurant.opening_hours:
            raise serializers.ValidationError({"scheduled_for": "This kitchen is not accepting scheduled orders."})
        now = timezone.now()
        if not now+timedelta(minutes=restaurant.schedule_notice_minutes) <= scheduled <= now+timedelta(days=restaurant.schedule_horizon_days):
            raise serializers.ValidationError({"scheduled_for": f"Choose a preparation start at least {restaurant.schedule_notice_minutes} minutes ahead and within {restaurant.schedule_horizon_days} days."})
        if not accepting_orders(restaurant, at=scheduled):
            raise serializers.ValidationError({"scheduled_for": "Choose a time within this restaurant’s opening hours."})
        quote.update(scheduled_for=scheduled.isoformat(), kitchen_schedule_version=restaurant.updated_at.isoformat())
    tip = data.get("tip_amount", Decimal(0))
    if tip:
        policy = DeliveryPolicy.objects.filter(pk=1).first()
        if not policy or not policy.cash_tips_enabled:
            raise serializers.ValidationError({"tip_amount": "Tipping is not available for this checkout."})
        if data.get("payment_method", "cod") != "cod":
            raise serializers.ValidationError({"tip_amount": "Only cash-on-delivery tips are supported. Remove the tip for online payment."})
        if tip > policy.max_cash_tip:
            raise serializers.ValidationError({"tip_amount": f"Choose a tip up to ₹{policy.max_cash_tip}."})
        quote.update(tip_amount=str(tip), tipping_policy_revision=policy.revision)
    return quote


class CashTipInput(serializers.Serializer):
    enabled = serializers.BooleanField()
    maximum = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=Decimal(1), max_value=Decimal(5000))
    revision = serializers.IntegerField(min_value=1)
    reason = serializers.CharField(min_length=5, max_length=500)


class CheckoutOptionsViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        policy = DeliveryPolicy.objects.filter(pk=1).first() or DeliveryPolicy(pk=1)
        return Response({"cash_tips_enabled": policy.cash_tips_enabled, "max_cash_tip": str(policy.max_cash_tip), "revision": policy.revision})

    @action(detail=False, methods=["post"], permission_classes=[IsAdmin])
    @transaction.atomic
    def configure(self, request):
        payload = CashTipInput(data=request.data)
        payload.is_valid(raise_exception=True)
        data = payload.validated_data
        policy, _ = DeliveryPolicy.objects.select_for_update().get_or_create(pk=1)
        if policy.revision != data["revision"]:
            return Response({"detail": "Policy changed. Refresh before saving."}, status=409)
        policy.cash_tips_enabled, policy.max_cash_tip = data["enabled"], data["maximum"]
        policy.revision += 1
        policy.save()
        AuditLog.objects.create(actor=request.user, action="checkout.cash_tips_configured", target="1", metadata={"enabled": data["enabled"], "maximum": str(data["maximum"]), "revision": policy.revision, "reason": data["reason"]})
        return self.list(request)
