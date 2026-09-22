"""Google address suggestions: server-only credential, no result cache or writes."""
import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings

from .geocoding import address_fields, clean


def google_address_enabled():
    server = getattr(settings, "GOOGLE_MAPS_SERVER_API_KEY", "")
    browser = getattr(settings, "GOOGLE_MAPS_BROWSER_API_KEY", "")
    # Never publish the server credential, even if accidentally copied into the
    # browser setting. Google results are only enabled with a Google map.
    return bool(server and browser and server != browser)


def google_address_fields(data):
    results = data.get("results") if isinstance(data, dict) else None
    if not isinstance(results, list):
        raise ValueError("Invalid address results")
    candidates = []
    for result in results[:30]:
        if not isinstance(result, dict) or not isinstance(result.get("address_components"), list):
            continue
        components = {}
        for component in result["address_components"]:
            if not isinstance(component, dict) or not isinstance(component.get("types"), list):
                continue
            for kind in component["types"]:
                if isinstance(kind, str) and kind not in components:
                    components[kind] = clean(component.get("short_name" if kind == "country" else "long_name"))
        road = components.get("route", "")
        locality = next((components.get(key) for key in (
            "sublocality_level_3", "sublocality_level_2", "sublocality_level_1", "sublocality", "neighborhood",
        ) if components.get(key)), "")
        city = components.get("locality", "") or components.get("postal_town", "")
        geometry = result.get("geometry")
        precision = geometry.get("location_type", "") if isinstance(geometry, dict) else ""
        # Interpolated numbers and partial matches must not become a suggested
        # exact house number. Never infer a floor, flat or a named business.
        house = components.get("street_number", "") if precision == "ROOFTOP" and not result.get("partial_match") else ""
        try:
            fields = address_fields({"address": {
                "house_number": house, "road": road, "suburb": locality,
                "city": city, "state": components.get("administrative_area_level_1", ""),
                "postcode": components.get("postal_code", ""), "country_code": components.get("country", ""),
            }})
        except ValueError:
            continue
        fields.update({
            "line1": road or locality or fields["city"],
            "street": road, "house_number": house, "provider": "google",
            "label": " ".join(filter(None, [house, road])) or locality or fields["city"] or "Selected location",
            "attribution": "Google Maps", "attribution_url": "https://maps.google.com/",
        })
        fields["line2"] = locality if locality != fields["line1"] else ""
        fields["partial"] = fields["partial"] or bool(result.get("partial_match"))
        # Preserve Google's ordering among street-level candidates. Do not
        # combine components from different buildings/roads to fill gaps.
        candidates.append((bool(road), fields))
    if not candidates:
        raise ValueError("No usable address")
    return next((fields for has_road, fields in candidates if has_road), candidates[0][1])


def google_reverse_address(latitude, longitude):
    key = getattr(settings, "GOOGLE_MAPS_SERVER_API_KEY", "")
    if not key:
        return None, "unavailable"
    parameters = urlencode({"key": key, "latlng": f"{latitude:.6f},{longitude:.6f}", "language": "en", "region": "in"})
    try:
        request = Request(f"https://maps.googleapis.com/maps/api/geocode/json?{parameters}", headers={"Accept": "application/json"})
        with urlopen(request, timeout=8) as response:
            data = json.loads(response.read(262144))
        if not isinstance(data, dict):
            raise ValueError("Invalid response")
        status = data.get("status")
        if status != "OK":
            return None, "no_match" if status == "ZERO_RESULTS" else "rate_limited" if status in {"OVER_QUERY_LIMIT", "OVER_DAILY_LIMIT"} else "unavailable"
        return google_address_fields(data), "ready"
    except HTTPError as error:
        return None, "rate_limited" if error.code == 429 else "unavailable"
    except (URLError, OSError, ValueError, TypeError, KeyError):
        return None, "unavailable"
