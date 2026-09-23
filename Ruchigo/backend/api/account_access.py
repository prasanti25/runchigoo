"""Account sign-in state, separate from restaurant listing approval and KYC.

Keep existing accounts compatible without a destructive lifecycle backfill.
Inactive partners with no previous access decision/login await first approval;
historical decisions (including legacy notifications) distinguish blocked access.
The directory computes this in SQL, not one history query per displayed person.
"""
from django.db.models import Case, CharField, Exists, OuterRef, Q, Value, When
from django.db.models.functions import Cast
from .models import AuditLog, Notification, User


def with_access_status(queryset):
    decisions = AuditLog.objects.filter(target=Cast(OuterRef("pk"), CharField())).filter(
        Q(action__in=["account.approved", "account.restored", "account.blocked"])
        | Q(action="account.updated", metadata__previous_active=True)
        | Q(action="account.updated", metadata__active=True)
        | Q(action="account.created", metadata__active=True)
    )
    legacy_decisions = Notification.objects.filter(
        user_id=OuterRef("pk"), kind="account",
        title__in=["Account Approved", "Account Restored", "Account Blocked"],
    )
    return queryset.annotate(
        _access_decided=Exists(decisions), _legacy_access_decided=Exists(legacy_decisions),
    ).annotate(access_status=Case(
        When(is_active=True, then=Value("active")),
        When(role__in=[User.Role.RESTAURANT, User.Role.DELIVERY], last_login__isnull=True,
             _access_decided=False, _legacy_access_decided=False, then=Value("pending")),
        default=Value("blocked"), output_field=CharField(),
    ))


def account_access_status(user):
    if user.is_active:
        return "active"
    # Re-read for mutations: an annotated instance may precede an access change.
    return with_access_status(User.objects.filter(pk=user.pk)).values_list("access_status", flat=True).get()
