"""Explicit, time-bounded surcharges. No invented automatic demand multiplier."""
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers, viewsets
from .admin_access import AdminScopeMixin
from .models import AuditLog, DeliveryPricingRule, ServiceCity
from .permissions import IsAdmin


def applicable_fees(zone_ids, at=None):
    now = at or timezone.now()
    local = timezone.localtime(now)
    rules = DeliveryPricingRule.objects.filter(zone_id__in=zone_ids, is_active=True, starts_at__lte=now, ends_at__gt=now).order_by("-additional_fee", "id")
    result = {}
    for rule in rules:
        if rule.kind == "peak" and (local.weekday() not in rule.weekdays or not rule.start_time <= local.time().replace(tzinfo=None) < rule.end_time):
            continue
        if rule.zone_id not in result:
            result[rule.zone_id] = {"id": rule.pk, "revision": rule.revision, "name": rule.name, "kind": rule.kind, "fee": str(rule.additional_fee), "timezone": str(timezone.get_current_timezone())}
    return result


class PricingRuleSerializer(serializers.ModelSerializer):
    reason = serializers.CharField(write_only=True, min_length=10, max_length=500)
    expected_revision = serializers.IntegerField(write_only=True, required=False, min_value=1)
    zone_name = serializers.CharField(source="zone.name", read_only=True)
    city = serializers.CharField(source="zone.city", read_only=True)
    weekdays = serializers.ListField(child=serializers.IntegerField(min_value=0,max_value=6), max_length=7, required=False)

    class Meta:
        model = DeliveryPricingRule
        fields = "__all__"
        read_only_fields = ["revision", "created_at", "updated_at"]

    def validate(self, data):
        value = lambda key: data.get(key, getattr(self.instance, key, None))
        if not data.get("reason"):
            raise serializers.ValidationError({"reason": "Record the approval reason for this change."})
        if self.instance and data.get("expected_revision") != self.instance.revision:
            raise serializers.ValidationError({"expected_revision": "This rule changed. Reload before saving."})
        start,end = value("starts_at"),value("ends_at")
        if end <= start or end-start > timedelta(days=90):
            raise serializers.ValidationError({"ends_at": "Choose an end after the start, within 90 days."})
        if value("kind") == "surge":
            if end-start > timedelta(hours=24):
                raise serializers.ValidationError({"ends_at": "Temporary demand pricing must expire within 24 hours."})
            data.update(weekdays=[],start_time=None,end_time=None)
        else:
            opening,closing = value("start_time"),value("end_time")
            if not value("weekdays") or not opening or not closing or opening >= closing:
                raise serializers.ValidationError("Choose weekdays and ordered peak hours. Split overnight hours into separate rules.")
            data["weekdays"] = sorted(set(value("weekdays")))
        if value("is_active") and end <= timezone.now():
            raise serializers.ValidationError({"ends_at": "An active rule must end in the future."})
        return data

    def create(self, data):
        reason=data.pop("reason");data.pop("expected_revision",None)
        rule=super().create(data)
        AuditLog.objects.create(actor=self.context["request"].user,action="delivery_pricing.created",target=str(rule.pk),metadata={"after": dict(self.to_representation(rule)), "reason": reason})
        return rule

    def update(self, instance, data):
        before=dict(self.to_representation(instance))
        reason=data.pop("reason");data.pop("expected_revision",None)
        data["revision"]=instance.revision+1
        rule=super().update(instance,data)
        AuditLog.objects.create(actor=self.context["request"].user,action="delivery_pricing.updated",target=str(rule.pk),metadata={"before": before,"after": dict(self.to_representation(rule)),"reason": reason})
        return rule


class DeliveryPricingViewSet(AdminScopeMixin, viewsets.ModelViewSet):
    serializer_class=PricingRuleSerializer
    permission_classes=[IsAdmin]
    http_method_names=["get","post","patch","head","options"]

    def get_queryset(self):
        query=DeliveryPricingRule.objects.select_related("zone")
        return query.select_for_update() if self.request.method == "PATCH" else query

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        return super().create(request,*args,**kwargs)

    @transaction.atomic
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request,*args,**kwargs)


class ServiceCitySerializer(serializers.ModelSerializer):
    reason=serializers.CharField(write_only=True,min_length=10,max_length=500)
    expected_revision=serializers.IntegerField(write_only=True,required=False,min_value=1)

    class Meta:
        model=ServiceCity
        fields="__all__"
        read_only_fields=["revision","created_at","updated_at"]

    def validate_name(self,value):
        from .serviceability import canonical_city
        value=canonical_city(value).title()
        if not value or not any(char.isalnum() for char in value):
            raise serializers.ValidationError("Enter a valid city name.")
        if self.instance and value != self.instance.name:
            raise serializers.ValidationError("City names cannot be changed after creation. Manage the existing city or add another.")
        if ServiceCity.objects.filter(name=value).exclude(pk=getattr(self.instance,"pk",None)).exists():
            raise serializers.ValidationError("This city is already managed, including its aliases.")
        return value

    def validate(self,data):
        if not data.get("reason"):
            raise serializers.ValidationError({"reason":"Record an operational reason for this change."})
        if self.instance and data.get("expected_revision") != self.instance.revision:
            raise serializers.ValidationError({"expected_revision":"City settings changed. Reload before saving."})
        return data

    def create(self,data):
        reason=data.pop("reason");data.pop("expected_revision",None)
        city=super().create(data)
        AuditLog.objects.create(actor=self.context["request"].user,action="service_city.created",target=str(city.pk),metadata={"after":dict(self.to_representation(city)),"reason":reason})
        return city

    def update(self,instance,data):
        before=dict(self.to_representation(instance))
        reason=data.pop("reason");data.pop("expected_revision",None)
        data["revision"]=instance.revision+1
        city=super().update(instance,data)
        AuditLog.objects.create(actor=self.context["request"].user,action="service_city.updated",target=str(city.pk),metadata={"before":before,"after":dict(self.to_representation(city)),"reason":reason})
        return city


class ServiceCityViewSet(AdminScopeMixin,viewsets.ModelViewSet):
    serializer_class=ServiceCitySerializer
    permission_classes=[IsAdmin]
    http_method_names=["get","post","patch","head","options"]

    def get_queryset(self):
        query=ServiceCity.objects.all()
        return query.select_for_update() if self.request.method=="PATCH" else query

    @transaction.atomic
    def create(self,request,*args,**kwargs):
        return super().create(request,*args,**kwargs)

    @transaction.atomic
    def partial_update(self,request,*args,**kwargs):
        return super().partial_update(request,*args,**kwargs)
