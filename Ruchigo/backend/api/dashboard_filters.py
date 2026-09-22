import django_filters
from rest_framework.exceptions import ValidationError
from .models import Order, Payment


class OrderedDateRangeFilter(django_filters.DateFromToRangeFilter):
    def filter(self, qs, value):
        if value and value.start and value.stop and value.start > value.stop:
            raise ValidationError("The start date must not be after the end date.")
        return super().filter(qs, value)


class OrderDashboardFilter(django_filters.FilterSet):
    placed = OrderedDateRangeFilter(field_name="created_at")
    on_hold = django_filters.BooleanFilter(field_name="fulfillment_paused_at", lookup_expr="isnull", exclude=True)
    order_id = django_filters.NumberFilter(field_name="id")

    class Meta:
        model = Order
        fields = ["status", "restaurant"]


class PaymentDashboardFilter(django_filters.FilterSet):
    recorded = OrderedDateRangeFilter(field_name="created_at")
    restaurant = django_filters.NumberFilter(field_name="order__restaurant_id")

    class Meta:
        model = Payment
        fields = ["status", "method", "order", "reconciliation_required"]
