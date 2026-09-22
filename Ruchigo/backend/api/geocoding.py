"""Explicit pin-to-address lookup; never infers a flat number or saves an address."""
import hashlib
import json
from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.cache import cache
from rest_framework import serializers

from .serviceability import canonical_city


class ReverseLocationInput(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=Decimal("-90"), max_value=Decimal("90"))
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=Decimal("-180"), max_value=Decimal("180"))
    consent = serializers.BooleanField()

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError("Choose to use the map pin before looking up its address.")
        return value


def clean(value, length=100):
    return " ".join(value.split())[:length] if isinstance(value, str) else ""


def address_fields(data):
    address = data.get("address") if isinstance(data, dict) else None
    if not isinstance(address, dict):
        raise ValueError("No address")
    first = lambda *keys: next((clean(address.get(key)) for key in keys if clean(address.get(key))), "")
    street = first("road", "pedestrian", "residential", "footway")
    locality = first("neighbourhood", "suburb", "quarter", "city_district", "hamlet")
    city = first("city", "town", "village", "municipality")
    state = first("state", "region")
    if not city and canonical_city(state) == "delhi":
        city = "Delhi"
    city = {"delhi": "Delhi", "gurugram": "Gurugram"}.get(canonical_city(city), city)
    country = clean(address.get("country_code"), 2).upper()
    # LocationIQ sometimes omits the territory for its New Delhi city result.
    # Normalize this known Indian administrative alias only; never invent a
    # street, postal code or a state for an unrecognized/foreign city.
    if not state and country == "IN" and canonical_city(city) == "delhi":
        state = "Delhi"
    postcode = clean(address.get("postcode"), 20)
    line1 = clean(" ".join(filter(None, [first("house_number"), street])), 255) or locality
    parts = list(dict.fromkeys(part for part in [line1, locality, city, state, postcode] if part))
    if not parts:
        raise ValueError("No usable address")
    # Do not return provider HTML, full raw payload, names/contact data, IDs or
    # a provider feature's centroid in place of the customer's actual pin.
    return {"line1": line1, "line2": locality if locality != line1 else "", "locality": locality,
            "city": city, "state": state, "postal_code": postcode, "country_code": country,
            "label": locality or street or city or "Selected location", "formatted_address": ", ".join(parts),
            "partial": not all([street, city, state, postcode]),
            "attribution": "Search by LocationIQ", "attribution_url": "https://locationiq.com/"}


def reverse_address(latitude, longitude):
    key = getattr(settings, "LOCATIONIQ_API_KEY", "")
    region = getattr(settings, "LOCATIONIQ_REGION", "us1")
    if not key or region not in {"us1", "eu1"}:
        return None, "unavailable"
    identity = f"{region}:{latitude:.6f}:{longitude:.6f}"
    cache_key = "reverse-address:v2:" + hashlib.sha256(identity.encode()).hexdigest()
    cached = cache.get(cache_key)
    if cached:
        return cached, "ready"
    parameters = urlencode({"key": key, "lat": f"{latitude:.6f}", "lon": f"{longitude:.6f}", "format": "json", "addressdetails": 1, "normalizeaddress": 1, "accept-language": "en"})
    try:
        request = Request(f"https://{region}.locationiq.com/v1/reverse?{parameters}", headers={"Accept": "application/json", "User-Agent": "RuchiGo/1.0 (delivery-address-confirmation)"})
        with urlopen(request, timeout=8) as response:
            data = json.loads(response.read(65536))
        fields = address_fields(data)
        cache.set(cache_key, fields, 86400)
        return fields, "ready"
    except HTTPError as error:
        return None, "no_match" if error.code == 404 else "rate_limited" if error.code == 429 else "unavailable"
    except (URLError, OSError, ValueError, TypeError, KeyError):
        return None, "unavailable"
