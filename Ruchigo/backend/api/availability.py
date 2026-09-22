"""One availability policy for discovery, cart and checkout."""
import re
from django.db.models import Q, F
from django.utils import timezone
from rest_framework import serializers


def validate_hours(hours):
    if hours == []:
        return []
    if not isinstance(hours, list) or len(hours) != 7:
        raise serializers.ValidationError("Provide seven days, Monday to Sunday, or an empty schedule.")
    result = []
    for row in hours:
        if not isinstance(row, dict) or type(row.get("closed")) is not bool:
            raise serializers.ValidationError("Each day needs a closed flag.")
        if row["closed"]:
            result.append({"closed": True})
            continue
        opening, closing = row.get("open", ""), row.get("close", "")
        pattern = r"(?:[01]\d|2[0-3]):[0-5]\d"
        if not isinstance(opening, str) or not isinstance(closing, str) or not re.fullmatch(pattern, opening) or not (re.fullmatch(pattern, closing) or closing == "24:00") or opening >= closing:
            raise serializers.ValidationError("Use opening/closing times in HH:MM order. For overnight hours, split the service across two days; 24:00 means midnight.")
        result.append({"closed": False, "open": opening, "close": closing})
    return result


def accepting_orders(restaurant, at=None):
    if not restaurant.is_open or not restaurant.is_approved or not restaurant.owner.is_active:
        return False
    if not restaurant.opening_hours:
        return True
    now = timezone.localtime(at or timezone.now())
    row = restaurant.opening_hours[now.weekday()]
    return not row["closed"] and row["open"] <= now.strftime("%H:%M") < row["close"]


def accepting_filter(prefix=""):
    now = timezone.localtime()
    day = f"{prefix}opening_hours__{now.weekday()}"
    schedule = Q(**{f"{prefix}opening_hours": []}) | Q(**{f"{day}__closed": False, f"{day}__open__lte": now.strftime("%H:%M"), f"{day}__close__gt": now.strftime("%H:%M")})
    return Q(**{f"{prefix}is_open": True, f"{prefix}is_approved": True, f"{prefix}owner__is_active": True}) & schedule


def in_stock_filter(prefix=""):
    return Q(**{f"{prefix}stock_quantity__isnull": True}) | Q(**{f"{prefix}stock_quantity__gt": 0})


def check_cart_stock(cart, menu_item, quantity, *, excluding=None):
    from .models import CartItem
    if menu_item.stock_quantity is None:
        return
    rows = CartItem.objects.filter(cart=cart, menu_item=menu_item)
    if excluding:
        rows = rows.exclude(pk=excluding)
    other = sum(rows.values_list("quantity", flat=True))
    if quantity + other > menu_item.stock_quantity:
        raise serializers.ValidationError({"quantity": f"Only {menu_item.stock_quantity} portions of {menu_item.name} are currently available across your cart."})


def restore_order_stock(order):
    # Caller holds the order row lock. Repeated cancellation cannot credit twice.
    from .models import MenuItem
    items = list(order.items.filter(stock_deducted=True).order_by("menu_item_id"))
    for item in items:
        MenuItem.objects.filter(pk=item.menu_item_id, stock_quantity__isnull=False).update(stock_quantity=F("stock_quantity")+item.quantity)
    order.items.filter(stock_deducted=True).update(stock_deducted=False)
