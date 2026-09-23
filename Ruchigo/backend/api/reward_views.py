from decimal import Decimal
from django.db import transaction
from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from .admin_access import AdminScopeMixin
from .models import AuditLog, Order, RewardAccount, RewardEntry, RewardPolicy, User
from .permissions import IsAdmin
from .rewards import POLICY_FIELDS, account_summary, policy_data


class TierInput(serializers.Serializer):
    name = serializers.CharField(max_length=30)
    points = serializers.IntegerField(min_value=0, max_value=100000000)


class PolicyInput(serializers.Serializer):
    enabled = serializers.BooleanField()
    revision = serializers.IntegerField(min_value=1)
    points_per_100 = serializers.IntegerField(min_value=0, max_value=1000)
    point_value = serializers.DecimalField(max_digits=6, decimal_places=2, min_value=Decimal(0), max_value=Decimal(100))
    redemption_percent = serializers.IntegerField(min_value=0, max_value=100)
    cashback_percent = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=Decimal(0), max_value=Decimal(100))
    cashback_cap = serializers.DecimalField(max_digits=9, decimal_places=2, min_value=Decimal(0), max_value=Decimal(10000))
    referral_credit = serializers.DecimalField(max_digits=9, decimal_places=2, min_value=Decimal(0), max_value=Decimal(10000))
    referral_minimum = serializers.DecimalField(max_digits=9, decimal_places=2, min_value=Decimal(0), max_value=Decimal(100000))
    tiers = TierInput(many=True, max_length=10)
    reason = serializers.CharField(min_length=10, max_length=500)

    def validate(self, data):
        tiers = data["tiers"]
        if len({t["name"].casefold() for t in tiers}) != len(tiers) or any(tiers[i]["points"] >= tiers[i+1]["points"] for i in range(len(tiers)-1)):
            raise serializers.ValidationError({"tiers": "Use unique level names and increasing point thresholds."})
        if data["cashback_percent"] > 0 and data["cashback_cap"] <= 0:
            raise serializers.ValidationError({"cashback_cap": "Set a positive per-order cashback cap."})
        if data["referral_credit"] > 0 and data["referral_minimum"] <= 0:
            raise serializers.ValidationError({"referral_minimum": "Set the minimum qualifying paid-food amount."})
        return data


class RewardPolicyViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes = [IsAdmin]

    def list(self, request):
        return Response(policy_data())

    @action(detail=False, methods=["post"])
    @transaction.atomic
    def configure(self, request):
        payload = PolicyInput(data=request.data)
        payload.is_valid(raise_exception=True)
        data = payload.validated_data
        policy, _ = RewardPolicy.objects.select_for_update().get_or_create(pk=1)
        if policy.revision != data["revision"]:
            return Response({"detail": "Rewards policy changed. Refresh before saving."}, status=409)
        before = policy_data(policy)
        for field in POLICY_FIELDS:
            if field != "revision":
                setattr(policy, field, data[field])
        policy.revision += 1
        policy.save()
        AuditLog.objects.create(actor=request.user, action="rewards.policy_configured", target="1", metadata={"before": before, "after": policy_data(policy), "reason": data["reason"]})
        return Response(policy_data(policy))


class EntrySerializer(serializers.ModelSerializer):
    order = serializers.SerializerMethodField()

    def get_order(self, entry):
        return entry.order_id if entry.order.customer_id == self.context["request"].user.pk else None

    class Meta:
        model = RewardEntry
        fields = ["id", "order", "kind", "points", "credits", "note", "created_at"]
        read_only_fields = fields


class ReferralInput(serializers.Serializer):
    code = serializers.UUIDField()


class RewardsViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        if policy_data()["enabled"]:
            RewardAccount.objects.get_or_create(user=request.user)
        return Response(account_summary(request.user))

    @action(detail=False, methods=["get"])
    def history(self, request):
        pager = PageNumberPagination()
        pager.page_size = 20
        rows = RewardEntry.objects.filter(account__user=request.user).select_related("order").order_by("-id")
        return pager.get_paginated_response(EntrySerializer(pager.paginate_queryset(rows, request), many=True, context={"request": request}).data)

    @action(detail=False, methods=["post"])
    @transaction.atomic
    def referral(self, request):
        payload = ReferralInput(data=request.data)
        payload.is_valid(raise_exception=True)
        # Same first lock as checkout: claiming after an order is impossible.
        User.objects.select_for_update().get(pk=request.user.pk)
        policy, _ = RewardPolicy.objects.select_for_update().get_or_create(pk=1)
        if not policy.enabled or policy.referral_credit <= 0:
            raise serializers.ValidationError("Referrals are not available right now.")
        if Order.objects.filter(customer=request.user).exists():
            raise serializers.ValidationError("Add a referral before placing your first order.")
        referrer = RewardAccount.objects.filter(referral_code=payload.validated_data["code"], user__is_active=True).first()
        if not referrer or referrer.user_id == request.user.pk:
            raise serializers.ValidationError("Use a valid referral code from another customer.")
        account, _ = RewardAccount.objects.get_or_create(user=request.user)
        account = RewardAccount.objects.select_for_update().get(pk=account.pk)
        if account.referred_by_id:
            if account.referred_by_id == referrer.user_id:
                return Response(account_summary(request.user))
            raise serializers.ValidationError("A referral has already been linked to this account.")
        # All bindings serialize on the policy row. Check the complete chain,
        # not just a two-account loop, without exposing it to the caller.
        seen = {request.user.pk}
        cursor = referrer
        while cursor:
            if cursor.user_id in seen:
                raise serializers.ValidationError("This referral cannot be used.")
            seen.add(cursor.user_id)
            cursor = RewardAccount.objects.filter(user_id=cursor.referred_by_id).first() if cursor.referred_by_id else None
        account.referred_by_id = referrer.user_id
        account.revision += 1
        account.save(update_fields=["referred_by", "revision", "updated_at"])
        AuditLog.objects.create(actor=request.user, action="rewards.referral_linked", target=str(account.pk))
        return Response(account_summary(request.user))
