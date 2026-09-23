from decimal import Decimal

from django.db.models import Q
from rest_framework import serializers
from rest_framework.pagination import PageNumberPagination

from .coupon_savings import cart_coupons, coupon_row
from .menu_options import cart_unit_price
from .models import Address, Cart
from .serviceability import delivery_quote


class SavingsQuery(serializers.Serializer):
    q = serializers.CharField(required=False, allow_blank=True, max_length=80)
    address_id = serializers.IntegerField(required=False, min_value=1)


def savings_address(user, address_id=None):
    addresses = Address.objects.filter(user=user)
    address = addresses.filter(pk=address_id).first() if address_id else addresses.order_by("-is_default", "pk").first()
    if address_id and not address:
        raise serializers.ValidationError({"address_id": "Choose one of your saved delivery addresses."})
    return address


def savings_response(request):
    query = SavingsQuery(data=request.query_params)
    query.is_valid(raise_exception=True)
    address_id = query.validated_data.get("address_id")
    address = savings_address(request.user, address_id)
    cart = Cart.objects.filter(user=request.user).select_related("restaurant").first()
    items = list(cart.items.select_related("menu_item")) if cart else []
    if not items or not cart.restaurant_id:
        raise serializers.ValidationError({"cart": "Add a dish to explore savings for your bag."})
    subtotal = sum((cart_unit_price(item, strict=True) * item.quantity for item in items), Decimal(0))
    delivery = {"status": "address_required", "reason": "Add a delivery address to check free-delivery savings.", "is_estimate": not bool(address_id)}
    fee = None
    if address:
        try:
            quote = delivery_quote(cart.restaurant, address, subtotal)
            threshold = quote.get("free_delivery_above")
            remaining = max(Decimal(0), Decimal(threshold)-subtotal) if threshold is not None else None
            fee = Decimal(quote["delivery_fee"])
            delivery.update(status="free" if fee == 0 else "progress" if remaining is not None else "standard",
                            fee=str(fee), threshold=threshold, remaining=str(remaining) if remaining is not None else None,
                            address_label=address.label or "saved address", reason="", zone=quote.get("zone"))
        except serializers.ValidationError as error:
            detail = error.detail
            values = detail.values() if isinstance(detail, dict) else detail if isinstance(detail, list) else [detail]
            delivery.update(status="unavailable", reason=" ".join(str(value[0] if isinstance(value, list) else value) for value in values))
    coupons, context = cart_coupons(request.user, cart.restaurant, subtotal, items=items, delivery_fee=fee, free_delivery_above=delivery.get("threshold"))
    next_coupon = coupons.filter(eligibility_rank=1).first()
    search = query.validated_data.get("q", "")
    if search:
        coupons = coupons.filter(Q(code__icontains=search) | Q(description__icontains=search) | Q(campaign_label__icontains=search))
    paginator = PageNumberPagination()
    paginator.page_size = 20
    page = paginator.paginate_queryset(coupons, request)
    response = paginator.get_paginated_response([coupon_row(coupon, subtotal, **context) for coupon in page])
    response["Cache-Control"] = "private, no-store"
    response.data.update(subtotal=str(subtotal), restaurant_id=cart.restaurant_id, available_count=coupons.filter(eligibility_rank=0).count(),
                         delivery=delivery, next_coupon=coupon_row(next_coupon, subtotal, **context) if next_coupon else None)
    return response
