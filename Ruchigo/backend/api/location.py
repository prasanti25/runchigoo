"""Optional, approximate IP-based city suggestions. No token or IP is returned."""
import hashlib
import ipaddress
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from urllib.parse import urlsplit

from django.conf import settings
from django.core.cache import cache
from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from .models import Restaurant


class LocationThrottle(SimpleRateThrottle):
    rate = "10/min"

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": "ip-location", "ident": request.META.get("REMOTE_ADDR", "unknown")}


class AddressSearchThrottle(LocationThrottle):
    rate = "30/min"
    def get_cache_key(self, request, view):
        identity = f"user:{request.user.pk}" if request.user.is_authenticated else self.get_ident(request)
        return self.cache_format % {"scope": "address-search", "ident": identity}


def client_address(request):
    remote = ipaddress.ip_address(request.META.get("REMOTE_ADDR", ""))
    trusted = [ipaddress.ip_network(value) for value in settings.IPINFO_TRUSTED_PROXY_CIDRS]
    if any(remote in network for network in trusted):
        chain = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")
        for value in reversed(chain):
            candidate = ipaddress.ip_address(value.strip())
            if not any(candidate in network for network in trusted):
                return candidate
    return remote


from .admin_access import AdminScopeMixin


class LocationViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if self.action in {"reverse", "demo_route", "search"}:
            response["Cache-Control"] = "private, no-store"
        return response

    @action(detail=False, methods=["post"], throttle_classes=[AddressSearchThrottle])
    def search(self, request):
        from .google_geocoding import google_search_addresses
        query = serializers.CharField(min_length=4, max_length=240, trim_whitespace=True).run_validation(request.data.get("query"))
        if request.data.get("consent") is not True:
            raise serializers.ValidationError("Choose to search for a delivery address first.")
        results, result = google_search_addresses(query)
        if result in {"ready", "no_match"}:
            return Response({"results": results, "status": result})
        response = Response({"results": [], "detail": "Address suggestions are temporarily unavailable. You can use the map pin or enter your address manually."}, status=429 if result == "rate_limited" else 503)
        if result == "rate_limited":
            response["Retry-After"] = "5"
        return response

    @action(detail=False, methods=["post"], throttle_classes=[LocationThrottle])
    def reverse(self, request):
        from .geocoding import ReverseLocationInput, reverse_address
        from .google_geocoding import google_address_enabled, google_reverse_address
        payload = ReverseLocationInput(data=request.data)
        payload.is_valid(raise_exception=True)
        lookup = google_reverse_address if google_address_enabled() else reverse_address
        fields, result = lookup(payload.validated_data["latitude"], payload.validated_data["longitude"])
        if fields:
            response = Response({"address": fields, "status": "ready"})
        else:
            response = Response({"status": result, "detail": "The address couldn’t be found for this pin. You can keep the pin and enter the address details." if result == "no_match" else "Address lookup is temporarily unavailable. You can keep this pin and fill in the address."}, status=429 if result == "rate_limited" else 503)
            if result == "rate_limited":
                response["Retry-After"] = "2"
        response["Cache-Control"] = "private, no-store"
        return response

    @action(detail=False, methods=["get"], url_path="map-config")
    def map_config(self, request):
        from .google_geocoding import google_address_enabled
        if request.query_params.get("purpose") in {"address", "delivery"} and google_address_enabled():
            response = Response({"engine": "google", "provider": "Google Maps", "browser_key": settings.GOOGLE_MAPS_BROWSER_API_KEY})
            response["Cache-Control"] = "private, no-store"
            return response
        # Only a PUBLIC, origin-restricted browser tile URL may be configured.
        # Never reuse server-side IPinfo/Gemini credentials here.
        tile_url = getattr(settings, "MAP_TILE_URL", "https://tile.openstreetmap.org/{z}/{x}/{y}.png")
        attribution_url = getattr(settings, "MAP_ATTRIBUTION_URL", "https://www.openstreetmap.org/copyright")
        if urlsplit(tile_url).scheme != "https" or not all(key in tile_url for key in ("{z}", "{x}", "{y}")) or urlsplit(attribution_url).scheme != "https":
            return Response({"detail": "The map is temporarily unavailable. Your order updates are still available."}, status=503)
        return Response({
            "tile_url": tile_url,
            "attribution": getattr(settings, "MAP_ATTRIBUTION", "© OpenStreetMap contributors"),
            "attribution_url": attribution_url,
            "provider": getattr(settings, "MAP_PROVIDER", "OpenStreetMap"),
        })

    @action(detail=False, methods=["get"], url_path="demo-route", throttle_classes=[LocationThrottle])
    def demo_route(self, request):
        from .google_routing import demo_routes
        result = demo_routes()
        return Response(result or {"detail": "The preview route couldn’t load. Please try again shortly."}, status=200 if result else 503)

    @action(detail=False, methods=["get"], throttle_classes=[LocationThrottle])
    def approximate(self, request):
        if not settings.IPINFO_TOKEN:
            return Response({"detail": "Network location is not configured. Choose a city or use GPS."}, status=503)
        try:
            address = client_address(request)
        except ValueError:
            return Response({"detail": "Your network address could not be verified. Choose a city manually."}, status=400)
        local_preview = settings.DEBUG and address.is_loopback
        if not address.is_global and not local_preview:
            return Response({"detail": "Network location is unavailable behind this proxy. Use GPS or choose a city."}, status=400)
        lookup = "local-preview" if local_preview else str(address)
        cache_key = "ipinfo-city:" + hashlib.sha256(lookup.encode()).hexdigest()
        city_data = cache.get(cache_key)
        if not city_data:
            endpoint = "https://ipinfo.io/json" if local_preview else f"https://ipinfo.io/{address}/json"
            try:
                with urlopen(Request(endpoint, headers={"Authorization": f"Bearer {settings.IPINFO_TOKEN}", "Accept": "application/json"}), timeout=5) as response:
                    data = json.load(response)
                if not isinstance(data, dict) or not isinstance(data.get("city"), str) or not data["city"].strip():
                    raise ValueError("Missing city")
                city_data = {key: str(data.get(key, ""))[:100] for key in ("city", "region", "country")}
                cache.set(cache_key, city_data, 900)
            except (HTTPError, URLError, TimeoutError, ValueError, TypeError):
                return Response({"detail": "We couldn’t estimate your city right now. GPS and manual city selection are still available."}, status=503)
        aliases = {"new delhi": "Delhi", "gurgaon": "Gurugram"}
        city = aliases.get(city_data["city"].lower(), city_data["city"])
        serving = Restaurant.objects.filter(city__iexact=city, is_approved=True, is_open=True, owner__is_active=True).values_list("city", flat=True).first()
        return Response({**city_data, "service_city": serving, "source": "ipinfo", "accuracy": "approximate", "local_preview": local_preview})
