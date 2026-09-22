"""Google road estimates. Read-only, bounded, no stored route or invented GPS."""
import json
import math
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.utils import timezone
from rest_framework.throttling import UserRateThrottle

from .google_geocoding import google_address_enabled
from .models import Order
from .rider_location import live_location


class RouteThrottle(UserRateThrottle):
    scope = "delivery-road-route"
    rate = "6/min"


def point(latitude, longitude):
    try:
        if isinstance(latitude, bool) or isinstance(longitude, bool):
            return None
        lat, lng = float(latitude), float(longitude)
        if math.isfinite(lat) and math.isfinite(lng) and abs(lat) <= 90 and abs(lng) <= 180:
            return [lat, lng]
    except (TypeError, ValueError, OverflowError):
        pass
    return None


def decode_polyline(value):
    if not isinstance(value, str) or len(value) > 100000:
        raise ValueError("Invalid polyline")
    index, lat, lng, result = 0, 0, 0, []
    while index < len(value):
        deltas = []
        for _ in range(2):
            number, shift = 0, 0
            while True:
                if index >= len(value) or shift > 30:
                    raise ValueError("Truncated polyline")
                digit = ord(value[index]) - 63
                index += 1
                if not 0 <= digit <= 63:
                    raise ValueError("Invalid polyline character")
                number |= (digit & 31) << shift
                shift += 5
                if digit < 32:
                    break
            deltas.append(~(number >> 1) if number & 1 else number >> 1)
        lat += deltas[0]
        lng += deltas[1]
        coordinate = point(lat / 1e5, lng / 1e5)
        if coordinate is None or len(result) >= 10000:
            raise ValueError("Invalid route")
        result.append(coordinate)
    if len(result) < 2:
        raise ValueError("Empty route")
    return result


def road_route(origin, destination):
    if not google_address_enabled() or not origin or not destination:
        return None
    waypoint = lambda p: {"location": {"latLng": {"latitude": p[0], "longitude": p[1]}}}
    payload = {"origin": waypoint(origin), "destination": waypoint(destination),
               "travelMode": "DRIVE", "routingPreference": "TRAFFIC_UNAWARE",
               "polylineQuality": "HIGH_QUALITY"}
    request = Request("https://routes.googleapis.com/directions/v2:computeRoutes",
                      data=json.dumps(payload).encode(), headers={
                          "Content-Type": "application/json", "X-Goog-Api-Key": settings.GOOGLE_MAPS_SERVER_API_KEY,
                          "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline"})
    try:
        with urlopen(request, timeout=8) as response:
            data = json.loads(response.read(524288))
        route = data["routes"][0]
        seconds = float(route["duration"].removesuffix("s"))
        distance = float(route["distanceMeters"])
        if not (math.isfinite(seconds) and math.isfinite(distance) and 0 <= seconds <= 86400 and 0 <= distance <= 1000000):
            raise ValueError("Invalid route estimate")
        return {"points": decode_polyline(route["polyline"]["encodedPolyline"]),
                "duration_seconds": seconds, "distance_metres": distance,
                "generated_at": timezone.now().isoformat(), "provider": "google",
                "traffic": False, "travel_mode": "DRIVE"}
    except (HTTPError, URLError, TimeoutError, ValueError, TypeError, KeyError, IndexError, AttributeError):
        # Never return provider error text, request URL/headers, or credentials.
        return None


def order_route(order):
    live = live_location(order)
    base = {"status": live["status"], "order_status": order.status, "route": None}
    if live["status"] != "live":
        return base
    origin = point(order.delivery.current_latitude, order.delivery.current_longitude)
    if order.status == Order.Status.ASSIGNED:
        destination = point(order.restaurant.latitude, order.restaurant.longitude)
        leg = "pickup"
    else:
        address = order.address_snapshot
        destination = point(address.get("latitude"), address.get("longitude")) if address else point(order.delivery_address.latitude, order.delivery_address.longitude)
        leg = "delivery"
    if destination is None:
        return {**base, "status": "missing_pin"}
    route = road_route(origin, destination)
    return {**base, "status": "ready" if route else "unavailable", "leg": leg,
            "delivery_id": order.delivery.pk, "route": route}


def demo_routes():
    # Only these PUBLIC example points; no arbitrary unauthenticated routing
    # proxy and no actual customers/orders. Results live only for this preview.
    start, kitchen, home = [28.637207, 77.213705], [28.632856, 77.218419], [28.626753, 77.228408]
    pickup = road_route(start, kitchen)
    delivery = road_route(kitchen, home) if pickup else None
    if not pickup or not delivery:
        return None
    return {"status": "ready", "simulated": True, "pickup": pickup, "delivery": delivery}
