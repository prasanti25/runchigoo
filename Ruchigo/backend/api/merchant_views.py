from decimal import Decimal
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from .admin_access import AdminScopeMixin, effective_scopes
from .merchant_finance import append_entry, policy_data, totals
from .models import AuditLog, CommissionPolicy, MerchantAccount, MerchantEntry, MerchantSettlement, Order, Restaurant, User
from .permissions import IsAdmin, IsRestaurantOrAdmin


class CommissionInput(serializers.Serializer):
    enabled = serializers.BooleanField()
    percent = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=Decimal(0), max_value=Decimal(100))
    settlement_recording_enabled = serializers.BooleanField()
    revision = serializers.IntegerField(min_value=1)
    reason = serializers.CharField(min_length=10, max_length=500)
    funding_approved = serializers.BooleanField()

    def validate(self, data):
        if (data["enabled"] or data["settlement_recording_enabled"]) and not data["funding_approved"]:
            raise serializers.ValidationError("Approve the stated pre-tax funding and refund convention before enabling accounting.")
        return data


class CommissionPolicyViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes = [IsAdmin]

    def list(self, request):
        return Response(policy_data())

    @action(detail=False, methods=["post"])
    @transaction.atomic
    def configure(self, request):
        scopes = effective_scopes(request.user)
        if "*" not in scopes and not {"finance", "policies"}.issubset(scopes):
            raise PermissionDenied("Commission changes require finance and policy access.")
        payload = CommissionInput(data=request.data)
        payload.is_valid(raise_exception=True)
        data = payload.validated_data
        policy, _ = CommissionPolicy.objects.select_for_update().get_or_create(pk=1)
        if data["revision"] != policy.revision:
            return Response({"detail": "Policy changed. Refresh before saving."}, status=409)
        before = policy_data(policy)
        for key in ("enabled", "percent", "settlement_recording_enabled"):
            setattr(policy, key, data[key])
        policy.revision += 1
        policy.save()
        AuditLog.objects.create(actor=request.user, action="finance.policy_configured", target="1", metadata={"before": before, "after": policy_data(policy), "reason": data["reason"], "funding_version": 1})
        return Response(policy_data(policy))


class SettlementInput(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal("0.01"))
    reference = serializers.RegexField(r"^[A-Za-z0-9][A-Za-z0-9._/-]{3,119}$")
    client_id = serializers.UUIDField()
    paid_at = serializers.DateTimeField()
    note = serializers.CharField(min_length=10, max_length=500)
    revision = serializers.IntegerField(min_value=1)
    confirmed_external_payment = serializers.BooleanField()

    def validate(self, data):
        data["reference"] = data["reference"].upper()
        if not data["confirmed_external_payment"]:
            raise serializers.ValidationError("Confirm the external payment before recording it.")
        if data["paid_at"] > timezone.now():
            raise serializers.ValidationError({"paid_at": "Payment date cannot be in the future."})
        return data


class CorrectionInput(serializers.Serializer):
    settlement_id = serializers.IntegerField(min_value=1)
    revision = serializers.IntegerField(min_value=1)
    note = serializers.CharField(min_length=10, max_length=500)


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MerchantEntry
        fields = ["id", "order", "settlement", "kind", "amount", "merchant_sales", "commission", "platform_promotion", "delivery_collected", "tip_collected", "payment_collected", "rounding_adjustment", "note", "created_at"]


class SettlementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MerchantSettlement
        fields = ["id", "amount", "reference", "paid_at", "note", "created_at", "reversed_at", "reversal_note"]


class MerchantFinanceViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes = [IsRestaurantOrAdmin]

    def restaurants(self):
        rows = Restaurant.objects.all().order_by("name", "id")
        if self.request.user.role != User.Role.ADMIN:
            rows = rows.filter(owner=self.request.user)
        return rows

    def account(self, pk, lock=False):
        restaurant = get_object_or_404(self.restaurants(), pk=pk)
        if lock:
            account, _ = MerchantAccount.objects.get_or_create(restaurant=restaurant)
            return MerchantAccount.objects.select_for_update().get(pk=account.pk)
        return MerchantAccount.objects.filter(restaurant=restaurant).first()

    def list(self, request):
        pager = PageNumberPagination()
        pager.page_size = 25
        rows = self.restaurants()
        search = request.query_params.get("search", "").strip()[:100]
        if search:
            rows = rows.filter(name__icontains=search)
        page = pager.paginate_queryset(rows.select_related("merchant_account"), request)
        return pager.get_paginated_response([{"id": row.pk, "name": row.name, "city": row.city,
            "balance": str(getattr(getattr(row, "merchant_account", None), "balance", Decimal(0)))} for row in page])

    def retrieve(self, request, pk=None):
        account = self.account(pk)
        orders = Order.objects.filter(restaurant_id=pk, status="delivered", payment__status__in=["paid", "refunded"])
        amounts = totals(MerchantEntry.objects.filter(account=account)) if account else totals(MerchantEntry.objects.none())
        covered = orders.filter(merchant_entries__kind="accrual").distinct().count()
        return Response({"restaurant": int(pk), "balance": str(account.balance if account else 0),
            "revision": account.revision if account else 1, "totals": {key: str(value) for key, value in amounts.items()},
            "covered_orders": covered, "unaccounted_orders": orders.count() - covered,
            "settlement_recording_enabled": policy_data()["settlement_recording_enabled"]})

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        account = self.account(pk)
        pager = PageNumberPagination()
        pager.page_size = 20
        rows = MerchantEntry.objects.filter(account=account).order_by("-id")
        return pager.get_paginated_response(EntrySerializer(pager.paginate_queryset(rows, request), many=True).data)

    @action(detail=True, methods=["get"])
    def settlements(self, request, pk=None):
        account = self.account(pk)
        pager = PageNumberPagination()
        pager.page_size = 20
        rows = MerchantSettlement.objects.filter(account=account)
        return pager.get_paginated_response(SettlementSerializer(pager.paginate_queryset(rows, request), many=True).data)

    def require_finance_admin(self):
        if self.request.user.role != User.Role.ADMIN:
            raise PermissionDenied("Only finance administrators can record external settlements.")

    @action(detail=True, methods=["post"], url_path="record-settlement")
    @transaction.atomic
    def record_settlement(self, request, pk=None):
        self.require_finance_admin()
        payload = SettlementInput(data=request.data)
        payload.is_valid(raise_exception=True)
        data = payload.validated_data
        account = self.account(pk, lock=True)
        existing = MerchantSettlement.objects.filter(client_id=data["client_id"]).first()
        if existing:
            if existing.account_id != account.pk or any(getattr(existing, key) != data[key] for key in ("amount", "reference", "paid_at", "note")):
                return Response({"detail": "This request key was already used for different payment details."}, status=409)
            return Response(SettlementSerializer(existing).data)
        if not policy_data()["settlement_recording_enabled"]:
            raise serializers.ValidationError("External settlement recording is not enabled.")
        if account.revision != data["revision"]:
            return Response({"detail": "Balance changed. Refresh before recording a payment."}, status=409)
        if data["amount"] > account.balance:
            raise serializers.ValidationError({"amount": "Amount exceeds the positive outstanding balance."})
        try:
            with transaction.atomic():
                row = MerchantSettlement.objects.create(account=account, recorded_by=request.user,
                    **{key: data[key] for key in ("amount", "reference", "client_id", "paid_at", "note")})
        except IntegrityError:
            raise serializers.ValidationError("This external reference or request key is already recorded.")
        append_entry(account, settlement=row, kind="settlement", amount=-row.amount, note="Finance-confirmed external payment recorded")
        AuditLog.objects.create(actor=request.user, action="finance.settlement_recorded", target=str(row.pk), metadata={"restaurant": int(pk), "amount": str(row.amount), "reason": row.note})
        return Response(SettlementSerializer(row).data, status=201)

    @action(detail=True, methods=["post"], url_path="correct-settlement")
    @transaction.atomic
    def correct_settlement(self, request, pk=None):
        self.require_finance_admin()
        payload = CorrectionInput(data=request.data)
        payload.is_valid(raise_exception=True)
        data = payload.validated_data
        account = self.account(pk, lock=True)
        row = get_object_or_404(MerchantSettlement.objects.select_for_update(), pk=data["settlement_id"], account=account)
        if row.reversed_at:
            return Response(SettlementSerializer(row).data)
        if account.revision != data["revision"]:
            return Response({"detail": "Balance changed. Refresh before correcting this record."}, status=409)
        row.reversed_at = timezone.now()
        row.reversal_note = data["note"]
        row.save(update_fields=["reversed_at", "reversal_note"])
        append_entry(account, settlement=row, kind="correction", amount=row.amount, note="Settlement record corrected · no bank reversal")
        AuditLog.objects.create(actor=request.user, action="finance.settlement_corrected", target=str(row.pk), metadata={"reason": row.reversal_note})
        return Response(SettlementSerializer(row).data)
