"""Explicit administrator delegation, checked in addition to role/ownership rules."""
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils.cache import patch_vary_headers
from rest_framework import permissions, serializers, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import AdminAccessGrant, AuditLog, User

SCOPES = {
    "people": "Customer and partner accounts",
    "partners": "Restaurant listings and partner approval",
    "catalog": "Menus and food categories",
    "orders": "Order and delivery operations",
    "finance": "Payment records and refund decisions",
    "promotions": "Offers and coupons",
    "support": "Support conversations and feedback",
    "reports": "Business analytics and risk review",
    "moderation": "Review moderation",
    "policies": "Delivery areas and order policies",
    "audit": "Read-only activity log",
}


def effective_scopes(user):
    if not user.is_authenticated or user.role != User.Role.ADMIN:
        return []
    if user.is_superuser:
        return ["*"]
    grant = AdminAccessGrant.objects.filter(user=user).first()
    # Explicit backwards-compatible transition: existing administrator accounts
    # retain their previous authority until a superuser reviews their grants.
    if grant is None or grant.full_access:
        return ["*"]
    return [scope for scope in grant.scopes if scope in SCOPES]


class AdminScopeMixin:
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.user.is_authenticated:
            response["Cache-Control"] = "private, no-store"
            patch_vary_headers(response, ["Authorization"])
        return response

    def check_permissions(self, request):
        super().check_permissions(request)
        user = request.user
        if not user.is_authenticated or user.role != User.Role.ADMIN or user.is_superuser:
            return
        scopes = effective_scopes(user)
        if "*" in scopes:
            return
        basename, action = getattr(self, "basename", None), getattr(self, "action", None)
        # Self-service and public catalog discovery retain their existing
        # ownership permissions. Unknown/new endpoints fail closed for delegates.
        if basename in {"auth", "notification", "address", "wishlist", "cart", "review", "location", "discovery", "restaurant-review", "intelligence"}:
            return
        required = {
            "user-management": {"people"}, "restaurant": {"partners", "catalog"},
            "category": {"catalog", "promotions"}, "menuitem": {"catalog"},
            "order": {"orders"}, "payment": {"finance"}, "online-payment": {"finance"},
            "coupon": {"promotions"}, "offer": {"promotions"}, "delivery": {"orders"},
            "analytics": {"reports"}, "insights": {"reports"}, "support": {"support"},
            "audit-log": {"audit"}, "review-moderation": {"moderation"},
            "delivery-policy": {"policies"}, "delivery-zone": {"policies"},
            "cancellation-policy": {"policies"}, "refund-request": {"finance"},
            "order-operations": {"orders"},
        }.get(basename, set())
        if basename == "user-management" and action in {"list", "retrieve", "summary", "approve", "block", "unblock"}:
            # Partner approval cannot grant general account-management power.
            # The view applies a partner-only queryset for this delegate.
            required = {"people", "partners"}
        if basename == "restaurant" and request.method not in permissions.SAFE_METHODS:
            required = {"partners"}
        if basename == "restaurant" and action == "lookup":
            required = {"partners", "catalog", "promotions"}
        if basename == "category" and request.method not in permissions.SAFE_METHODS:
            required = {"catalog"}
        if basename == "order" and action in {"list", "retrieve", "summary"}:
            required = {"orders", "support", "finance"}
        if basename == "order-operations" and action == "cancel" and "finance" not in scopes:
            raise PermissionDenied("Order cancellation decisions require finance access as well as order operations.")
        if not required.intersection(scopes):
            raise PermissionDenied("Your administrator access does not include this workspace or action.")


class IsAccessManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and request.user.is_superuser and request.user.role == User.Role.ADMIN)


class GrantInput(serializers.Serializer):
    full_access = serializers.BooleanField()
    scopes = serializers.ListField(child=serializers.ChoiceField(choices=list(SCOPES)), max_length=len(SCOPES))
    reason = serializers.CharField(max_length=500, trim_whitespace=True)
    expected_revision = serializers.IntegerField(min_value=0)

    def validate(self, data):
        if data["full_access"] and data["scopes"]:
            raise serializers.ValidationError("Choose either full access or specific workspaces.")
        data["scopes"] = sorted(set(data["scopes"]))
        return data


class AdminAccessViewSet(viewsets.ViewSet):
    permission_classes = [IsAccessManager]

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response["Cache-Control"] = "private, no-store"
        return response

    def list(self, request):
        users = User.objects.filter(role=User.Role.ADMIN).select_related("admin_access_grant").order_by("id")
        return Response({"scopes": SCOPES, "administrators": [self.output(user) for user in users]})

    def output(self, user):
        grant = getattr(user, "admin_access_grant", None)
        return {"id": user.pk, "email": user.email, "name": user.get_full_name(), "is_superuser": user.is_superuser,
                "full_access": user.is_superuser or grant is None or grant.full_access,
                "scopes": grant.scopes if grant else [], "revision": grant.revision if grant else 0,
                "review_required": not user.is_superuser and grant is None}

    @transaction.atomic
    def update(self, request, pk=None):
        data = GrantInput(data=request.data)
        data.is_valid(raise_exception=True)
        target_id = serializers.IntegerField(min_value=1).run_validation(pk)
        target = get_object_or_404(User.objects.select_for_update(), pk=target_id, role=User.Role.ADMIN)
        if target.is_superuser or target.pk == request.user.pk:
            raise serializers.ValidationError("Superuser authority cannot be changed in this workspace.")
        grant = AdminAccessGrant.objects.filter(user=target).first()
        revision = grant.revision if grant else 0
        if data.validated_data["expected_revision"] != revision:
            return Response({"detail": "Access changed since this page loaded. Refresh before saving."}, status=409)
        before = effective_scopes(target)
        grant, _ = AdminAccessGrant.objects.update_or_create(user=target, defaults={"full_access": data.validated_data["full_access"], "scopes": data.validated_data["scopes"], "revision": revision+1})
        AuditLog.objects.create(actor=request.user, action="admin.access_changed", target=str(target.pk), metadata={"previous_scopes": before, "scopes": ["*"] if grant.full_access else grant.scopes, "reason": data.validated_data["reason"], "revision": grant.revision})
        return Response(self.output(User.objects.select_related("admin_access_grant").get(pk=target.pk)))
