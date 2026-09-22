"""Price restaurant-owned optional extras on the server, never from the client."""
import hashlib
from decimal import Decimal
from rest_framework import serializers


def selected_addons(menu_item, ids, *, previous=None, strict=True):
    available = {row["id"]: row for row in menu_item.add_ons}
    previous = {row["id"]: row for row in (previous or [])}
    result = []
    for key in sorted(set(ids)):
        addon = available.get(key)
        if not addon or not addon.get("is_available", True):
            if strict:
                raise serializers.ValidationError({"add_ons": "A selected add-on is unavailable. Remove this cart item and choose again from the menu."})
            addon = {**previous.get(key, {"id": key, "name": "Unavailable add-on", "price": "0.00"}), "is_available": False}
        result.append(dict(addon))
    return result


def configuration_key(addons):
    return hashlib.sha256("|".join(sorted(row["id"] for row in addons)).encode()).hexdigest() if addons else ""


def cart_addons(item, *, strict=False):
    return selected_addons(item.menu_item, [row["id"] for row in item.add_ons], previous=item.add_ons, strict=strict)


def cart_unit_price(item, *, strict=False):
    return item.menu_item.price + sum((Decimal(row["price"]) for row in cart_addons(item, strict=strict)), Decimal("0"))
