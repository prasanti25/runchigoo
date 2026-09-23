"""Owned shopping analytics. No invented wallet balance or inferred payouts."""
from decimal import Decimal
from django.db.models import Case, Count, DecimalField, ExpressionWrapper, F, OuterRef, Subquery, Sum, Value, When
from django.db.models.functions import Coalesce, Greatest, TruncMonth
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from .admin_access import AdminScopeMixin
from .insights import ReportQuery, midnight, report_window, window_summary
from .models import Order, OrderItem, Payment, RefundRequest, SavedRestaurant, Wishlist
from .rewards import account_summary


def paid_orders(orders):
    amount = DecimalField(max_digits=14, decimal_places=2)
    zero = Value(Decimal(0), output_field=amount)
    refunds = RefundRequest.objects.filter(order_id=OuterRef("pk"), status="processed").order_by().values("order_id").annotate(total=Sum("approved_amount")).values("total")
    return orders.filter(payment__status__in=[Payment.Status.PAID, Payment.Status.REFUNDED]).annotate(
        captured=F("payment__amount"),
        confirmed_refunds=Case(When(payment__status=Payment.Status.REFUNDED, then=F("payment__amount")), default=Coalesce(Subquery(refunds), zero), output_field=amount),
    ).annotate(net_paid=Greatest(ExpressionWrapper(F("captured")-F("confirmed_refunds"), output_field=amount), zero))


def spending(orders):
    totals = paid_orders(orders).aggregate(paid=Sum("captured"), refunded=Sum("confirmed_refunds"), net=Sum("net_paid"))
    return {key: str(value or Decimal("0.00")) for key, value in totals.items()}


class CustomerInsightsViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        query = ReportQuery(data=request.query_params)
        query.is_valid(raise_exception=True)
        today = timezone.localdate()
        start = query.validated_data.get("start", today.replace(day=1))
        end = query.validated_data.get("end", today)
        orders = Order.objects.filter(customer=request.user)
        selected = report_window(orders, start, end)
        summary = window_summary(selected)
        summary["spending"] = spending(selected)
        summary["orders_per_week"] = round(summary["orders"]*7/((end-start).days+1), 2)
        month_keys = []
        for offset in range(11, -1, -1):
            index = today.year*12+today.month-1-offset
            month_keys.append(today.replace(year=index//12, month=index % 12+1, day=1))
        monthly_orders = orders.filter(created_at__gte=midnight(month_keys[0]))
        counts = {row["month"].strftime("%Y-%m"): row["count"] for row in monthly_orders.annotate(month=TruncMonth("created_at")).values("month").annotate(count=Count("id"))}
        values = {row["month"].strftime("%Y-%m"): row for row in paid_orders(monthly_orders).annotate(month=TruncMonth("created_at")).values("month").annotate(net=Sum("net_paid"), refunded=Sum("confirmed_refunds"))}
        completed = orders.filter(status=Order.Status.DELIVERED)
        most_ordered = list(OrderItem.objects.filter(order__in=completed).values("menu_item_id", "name").annotate(quantity=Sum("quantity")).order_by("-quantity", "name")[:5])
        return Response({
            "period": {"start": str(start), "end": str(end), "timezone": str(timezone.get_current_timezone())},
            "summary": summary,
            "lifetime": {"orders": orders.count(), "delivered": completed.count(), "spending": spending(orders)},
            "monthly": [{"month": key.strftime("%Y-%m"), "orders": counts.get(key.strftime("%Y-%m"), 0), "net_spending": str(values.get(key.strftime("%Y-%m"), {}).get("net") or Decimal(0))} for key in month_keys],
            "saved_restaurants": list(SavedRestaurant.objects.filter(user=request.user).order_by("-created_at").values("restaurant_id", "restaurant__name")[:6]),
            "saved_food": list(Wishlist.objects.filter(user=request.user).order_by("-created_at").values("menu_item_id", "menu_item__name", "menu_item__restaurant_id")[:6]),
            "most_ordered": most_ordered,
            "loyalty": account_summary(request.user),
            "definition": "Spending is recorded collected payments minus confirmed refunds, grouped by order date. Unpaid orders are excluded. Refund requests are not deducted until processed. This is shopping history, not a bank statement.",
        })
