"""Owned-order GPS reads stay fast; optional street lookup is a separate request."""
from django.core.cache import cache
from django.utils import timezone
from rest_framework.throttling import UserRateThrottle

from .geocoding import reverse_address
from .models import Order


class LiveLocationThrottle(UserRateThrottle):
    scope = "live-location"
    rate = "120/min"


class RiderPlaceThrottle(UserRateThrottle):
    scope = "rider-place"
    rate = "12/min"


def live_location(order):
    result = {"order_status": order.status, "paused": bool(order.fulfillment_paused_at), "delivery": None, "status": "inactive"}
    if order.status not in [Order.Status.ASSIGNED, Order.Status.OUT] or order.fulfillment_paused_at:
        return result
    delivery = getattr(order, "delivery", None)
    result["status"] = "awaiting_gps"
    if not delivery:
        return result
    result["delivery"] = {"id": delivery.pk, "current_latitude": str(delivery.current_latitude) if delivery.current_latitude is not None else None,
                          "current_longitude": str(delivery.current_longitude) if delivery.current_longitude is not None else None, "location_updated_at": delivery.location_updated_at}
    if delivery.current_latitude is None or delivery.current_longitude is None or not delivery.location_updated_at:
        return result
    age = (timezone.now() - delivery.location_updated_at).total_seconds()
    result["status"] = "live" if -5 <= age <= 15 else "stale"
    return result


def rider_place(order):
    live = live_location(order)
    if live["status"] != "live":
        return {"status": live["status"], "place": None}
    delivery = order.delivery
    key = f"rider-place:v1:{delivery.pk}"
    cached = cache.get(key)
    if cached:
        return cached
    # Prevent duplicate lookups from concurrent viewers in this cache worker.
    # Production scale/quota coordination needs a shared cache, not millisecond
    # requests to a geocoder. GPS reads never wait on this provider operation.
    lock = key + ":lock"
    if not cache.add(lock, True, 10):
        return {"status": "pending", "place": None}
    try:
        fields, status = reverse_address(delivery.current_latitude, delivery.current_longitude)
        if fields and (fields.get("line1") or fields.get("locality")):
            parts = list(dict.fromkeys(value for value in [fields.get("line1"), fields.get("locality")] if value))
            result = {"status": "ready", "place": {"label": ", ".join(parts), "city": fields.get("city", ""),
                      "latitude": str(delivery.current_latitude), "longitude": str(delivery.current_longitude),
                      "looked_up_at": timezone.now().isoformat(), "attribution": fields["attribution"]}}
        else:
            result = {"status": status if status != "ready" else "unavailable", "place": None}
        cache.set(key, result, 30)
        return result
    finally:
        cache.delete(lock)
