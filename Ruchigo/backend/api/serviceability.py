"""Authoritative address eligibility and explicitly configured delivery pricing.

Distances are geodesic (straight line), not driving routes or traffic estimates.
Zone membership uses the customer's pin; the kitchen must be in the same city
and within that zone's configured maximum kitchen-to-door distance.
"""
import hashlib
import json
import math
from decimal import Decimal, ROUND_HALF_UP

from django.core import signing
from django.db import transaction
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import AuditLog, CancellationPolicy, DeliveryPolicy, DeliveryZone
from .permissions import IsAdmin


def canonical_city(value):
    value = " ".join(str(value).casefold().split())
    return {"new delhi": "delhi", "gurgaon": "gurugram"}.get(value, value)


def distance_km(a_lat, a_lng, b_lat, b_lng):
    lat1, lng1, lat2, lng2 = map(lambda n: math.radians(float(n)), (a_lat, a_lng, b_lat, b_lng))
    h = math.sin((lat2-lat1)/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin((lng2-lng1)/2)**2
    return Decimal(str(6371 * 2 * math.asin(math.sqrt(min(1, h)))))


def delivery_quote(restaurant, address, subtotal):
    if canonical_city(restaurant.city) != canonical_city(address.city):
        raise serializers.ValidationError({"address_id": f"This kitchen delivers in {restaurant.city}. Choose an address there or a restaurant near your address."})
    policy = DeliveryPolicy.objects.filter(pk=1).first()
    cancellation = CancellationPolicy.objects.filter(pk=1).first() or CancellationPolicy()
    cancellation_snapshot = {"cutoff": cancellation.cutoff, "allow_prepaid_refunds": cancellation.allow_prepaid_refunds, "revision": cancellation.revision}
    if not policy or not policy.enabled:
        fee = Decimal("40.00") if subtotal < 500 else Decimal("0.00")
        return {"delivery_fee": str(fee), "zone": None, "distance_km": None, "distance_basis": None, "policy_revision": policy.revision if policy else 1, "cancellation_policy": cancellation_snapshot}
    if address.latitude is None or address.longitude is None:
        raise serializers.ValidationError({"address_id": "Add a location pin to this address so we can check delivery availability."})
    if restaurant.latitude is None or restaurant.longitude is None:
        raise serializers.ValidationError({"cart": "This kitchen’s pickup location is not ready for delivery. Please choose another restaurant."})
    distance = distance_km(restaurant.latitude, restaurant.longitude, address.latitude, address.longitude)
    candidates = []
    for zone in DeliveryZone.objects.filter(is_active=True):
        if canonical_city(zone.city) != canonical_city(address.city):
            continue
        if distance_km(zone.latitude, zone.longitude, address.latitude, address.longitude) > zone.radius_km or distance > zone.max_delivery_km:
            continue
        if subtotal < zone.minimum_order:
            candidates.append((zone, None))
            continue
        fee = zone.base_fee + max(Decimal(0), distance-zone.included_km) * zone.per_km_fee
        if zone.free_delivery_above is not None and subtotal >= zone.free_delivery_above:
            fee = Decimal(0)
        candidates.append((zone, fee.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)))
    eligible = [(zone, fee) for zone, fee in candidates if fee is not None]
    if not eligible:
        if candidates:
            minimum = min(zone.minimum_order for zone, _ in candidates)
            raise serializers.ValidationError({"cart": f"The minimum food subtotal for delivery here is ₹{minimum:.2f}."})
        raise serializers.ValidationError({"address_id": "This address is outside this kitchen’s delivery area. Choose a closer address or another restaurant."})
    # Overlap rule is deterministic and customer-friendly: cheapest eligible zone.
    zone, fee = min(eligible, key=lambda row: (row[1], row[0].pk))
    return {"delivery_fee": str(fee), "zone": zone.name, "zone_id": zone.pk,
            "zone_revision": zone.updated_at.isoformat(), "policy_revision": policy.revision,
            "distance_km": str(distance.quantize(Decimal("0.01"))), "distance_basis": "straight_line", "cancellation_policy": cancellation_snapshot}


def quote_fingerprint(user, address, items, quote, coupon_code, subtotal, discount):
    facts = {"user": user.pk, "address": address.pk, "address_version": address.updated_at.isoformat(),
             "items": [[i.menu_item_id, i.quantity, i.configuration_key] for i in items],
             "quote": quote, "coupon": coupon_code or "", "subtotal": str(subtotal), "discount": str(discount)}
    return hashlib.sha256(json.dumps(facts, sort_keys=True).encode()).hexdigest()


def sign_quote(fingerprint):
    return signing.dumps(fingerprint, salt="ruchigo.delivery-quote")


def verify_quote(token, fingerprint):
    try:
        if signing.loads(token, salt="ruchigo.delivery-quote", max_age=600) == fingerprint:
            return
    except signing.BadSignature:
        pass
    raise serializers.ValidationError({"quote_token": "Your bill or delivery details changed. Refresh the bill before placing your order."})


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def validate_city(self, value):
        return canonical_city(value).title()

    def validate(self, attrs):
        included = attrs.get("included_km", getattr(self.instance, "included_km", Decimal(0)))
        maximum = attrs.get("max_delivery_km", getattr(self.instance, "max_delivery_km", None))
        if maximum is not None and included > maximum:
            raise serializers.ValidationError({"included_km": "Included distance cannot exceed the maximum delivery distance."})
        return attrs


from .admin_access import AdminScopeMixin


class DeliveryZoneViewSet(AdminScopeMixin, viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class = DeliveryZoneSerializer
    queryset = DeliveryZone.objects.all()
    http_method_names = ["get", "post", "patch", "head", "options"]

    @transaction.atomic
    def perform_create(self, serializer):
        zone = serializer.save()
        AuditLog.objects.create(actor=self.request.user, action="delivery_zone.created", target=str(zone.pk), metadata=dict(serializer.data))

    @transaction.atomic
    def perform_update(self, serializer):
        before = DeliveryZoneSerializer(self.get_object()).data
        zone = serializer.save()
        AuditLog.objects.create(actor=self.request.user, action="delivery_zone.updated", target=str(zone.pk), metadata={"before": dict(before), "after": dict(serializer.data)})


class PolicyInput(serializers.Serializer):
    enabled = serializers.BooleanField()
    revision = serializers.IntegerField(min_value=1)


class DeliveryPolicyViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes = [IsAdmin]

    def list(self, request):
        policy = DeliveryPolicy.objects.filter(pk=1).first()
        return Response({"enabled": policy.enabled if policy else False, "revision": policy.revision if policy else 1})

    @action(detail=False, methods=["post"])
    @transaction.atomic
    def configure(self, request):
        payload = PolicyInput(data=request.data)
        payload.is_valid(raise_exception=True)
        policy, _ = DeliveryPolicy.objects.select_for_update().get_or_create(pk=1)
        if policy.revision != payload.validated_data["revision"]:
            return Response({"detail": "Settings changed in another session. Reload and try again."}, status=409)
        if payload.validated_data["enabled"] and not DeliveryZone.objects.filter(is_active=True).exists():
            raise serializers.ValidationError("Activate at least one delivery zone first.")
        policy.enabled = payload.validated_data["enabled"]
        policy.revision += 1
        policy.save()
        AuditLog.objects.create(actor=request.user, action="delivery_policy.updated", target="1", metadata={"enabled": policy.enabled, "revision": policy.revision})
        return Response({"enabled": policy.enabled, "revision": policy.revision})
