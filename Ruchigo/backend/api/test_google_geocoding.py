"""Google fixtures are mocked; no customer locations or provider keys in tests."""
import copy
import json
from decimal import Decimal
from unittest.mock import MagicMock, patch
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlsplit

from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase

from .google_geocoding import google_address_enabled, google_address_fields, google_reverse_address


def component(kind, value, short=None):
    return {"types": [kind], "long_name": value, "short_name": short or value}


@override_settings(GOOGLE_MAPS_SERVER_API_KEY="server-fixture-secret", GOOGLE_MAPS_BROWSER_API_KEY="public-browser-fixture", LOCATIONIQ_API_KEY="location-fixture")
class GoogleGeocodingTests(APITestCase):
    point = {"latitude": "28.631500", "longitude": "77.216700", "consent": True}
    path = "/api/v1/location/reverse/"
    result = {"formatted_address": "Do not return raw provider text", "place_id": "private-provider-id",
              "geometry": {"location_type": "ROOFTOP", "location": {"lat": 1, "lng": 2}},
              "address_components": [component("street_number", "42"), component("route", "Example Lane"),
                component("sublocality_level_1", "Test Area"), component("locality", "New Delhi"),
                component("administrative_area_level_1", "Delhi"), component("postal_code", "110001"), component("country", "India", "IN")]}

    def setUp(self):
        cache.clear()

    @patch("api.google_geocoding.urlopen")
    def test_forward_suggestions_use_sanitized_addresses_and_valid_pins(self, provider):
        self.provider(provider)
        result = self.client.post("/api/v1/location/search/", {"query": "Example Lane Delhi", "consent": True}, format="json")
        self.assertEqual(result.status_code, 200)
        row = result.data["results"][0]
        self.assertEqual(row["line1"], "Example Lane")
        self.assertEqual(row["latitude"], 1)
        self.assertEqual(result["Cache-Control"], "private, no-store")
        self.assertNotIn("server-fixture-secret", result.content.decode())
        self.assertNotIn("private-provider-id", result.content.decode())
        query = parse_qs(urlsplit(provider.call_args.args[0].full_url).query)
        self.assertEqual(query["address"], ["Example Lane Delhi"])
        self.assertEqual(query["components"], ["country:IN"])

    @patch("api.google_geocoding.urlopen")
    def test_forward_requires_explicit_search_and_limits_input(self, provider):
        for body in [{}, {"query":"Delhi"}, {"query":"abc", "consent":True}, {"query":"x"*241, "consent":True}]:
            self.assertEqual(self.client.post("/api/v1/location/search/",body,format="json").status_code,400)
        provider.assert_not_called()

    @patch("api.google_geocoding.urlopen")
    def test_forward_no_match_and_outage_are_distinct(self, provider):
        self.provider(provider, {"status":"ZERO_RESULTS", "results":[]})
        result = self.client.post("/api/v1/location/search/",{"query":"Unknown place", "consent":True},format="json")
        self.assertEqual(result.status_code,200)
        self.assertEqual(result.data["results"],[])
        provider.side_effect = URLError("outage")
        self.assertEqual(self.client.post("/api/v1/location/search/",{"query":"Unknown place", "consent":True},format="json").status_code,503)

    @patch("api.google_geocoding.urlopen")
    def test_forward_never_accepts_invalid_provider_coordinates(self, provider):
        bad = copy.deepcopy(self.result)
        bad["geometry"]["location"]["lat"] = 999
        self.provider(provider, {"status":"OK", "results":[bad]})
        result = self.client.post("/api/v1/location/search/",{"query":"Example Lane", "consent":True},format="json")
        self.assertEqual(result.data["results"],[])

    def provider(self, mock, data=None):
        response = MagicMock()
        response.read.return_value = json.dumps(data if data is not None else {"status": "OK", "results": [self.result]}).encode()
        mock.return_value.__enter__.return_value = response
        return response

    @patch("api.google_geocoding.urlopen")
    @patch("api.geocoding.urlopen")
    def test_google_lookup_is_read_only_and_keeps_server_key_raw_payload_and_centroid_private(self, other, provider):
        response_mock = self.provider(provider)
        with self.assertNumQueries(0):
            response = self.client.post(self.path, self.point, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Cache-Control"], "private, no-store")
        fields = response.data["address"]
        self.assertEqual(fields["line1"], "Example Lane")
        self.assertEqual(fields["house_number"], "42")
        self.assertEqual(fields["label"], "42 Example Lane")
        self.assertEqual(fields["city"], "Delhi")
        self.assertEqual(fields["line2"], "Test Area")
        self.assertEqual(fields["provider"], "google")
        self.assertFalse(fields["partial"])
        for value in ("server-fixture-secret", "private-provider-id", "raw provider text", "public-browser-fixture"):
            self.assertNotIn(value, response.content.decode())
        for key in ("latitude", "longitude", "lat", "lng", "place_id", "geometry"):
            self.assertNotIn(key, fields)
        query = parse_qs(urlsplit(provider.call_args.args[0].full_url).query)
        self.assertEqual(query["latlng"], ["28.631500,77.216700"])
        self.assertEqual(provider.call_args.kwargs["timeout"], 8)
        response_mock.read.assert_called_once_with(262144)
        other.assert_not_called()

    def test_map_config_only_exposes_different_browser_key_for_address_map(self):
        response = self.client.get("/api/v1/location/map-config/?purpose=address")
        self.assertEqual(response.data["engine"], "google")
        self.assertEqual(response.data["browser_key"], "public-browser-fixture")
        self.assertNotIn("server-fixture-secret", response.content.decode())
        self.assertEqual(response["Cache-Control"], "private, no-store")
        rider = self.client.get("/api/v1/location/map-config/")
        self.assertIn("tile_url", rider.data)
        self.assertNotIn("browser_key", rider.data)
        delivery = self.client.get("/api/v1/location/map-config/?purpose=delivery")
        self.assertEqual(delivery.data["engine"], "google")
        self.assertEqual(delivery.data["browser_key"], "public-browser-fixture")

    def test_missing_or_reused_browser_key_cannot_publish_server_key_or_enable_google_map(self):
        for browser in ("", "server-fixture-secret"):
            with self.settings(GOOGLE_MAPS_BROWSER_API_KEY=browser):
                self.assertFalse(google_address_enabled())
                response = self.client.get("/api/v1/location/map-config/?purpose=address")
                self.assertNotIn("browser_key", response.data)
                self.assertNotIn("server-fixture-secret", response.content.decode())

    @patch("api.google_geocoding.urlopen")
    def test_validation_requires_valid_coordinates_and_consent(self, provider):
        for point in ({}, {**self.point, "consent": False}, {**self.point, "latitude": "NaN"}, {**self.point, "longitude": 190}):
            self.assertEqual(self.client.post(self.path, point, format="json").status_code, 400)
        provider.assert_not_called()

    @patch("api.google_geocoding.urlopen")
    def test_same_coordinate_has_no_application_result_cache(self, provider):
        self.provider(provider)
        for _ in range(2):
            fields, status = google_reverse_address(Decimal("28.631500"), Decimal("77.216700"))
            self.assertEqual(status, "ready")
            self.assertEqual(fields["line1"], "Example Lane")
        self.assertEqual(provider.call_count, 2)

    def test_interpolated_numbers_and_partial_matches_are_not_suggested_as_exact_house(self):
        for precision, partial in [("RANGE_INTERPOLATED", False), ("APPROXIMATE", False), ("ROOFTOP", True)]:
            result = copy.deepcopy(self.result)
            result["geometry"]["location_type"] = precision
            result["partial_match"] = partial
            fields = google_address_fields({"results": [result]})
            self.assertEqual(fields["house_number"], "")
            self.assertEqual(fields["line1"], "Example Lane")
            if partial:
                self.assertTrue(fields["partial"])

    def test_locality_only_result_does_not_invent_house_or_street(self):
        result = {"address_components": [component("locality", "Delhi"), component("country", "India", "IN")]}
        fields = google_address_fields({"results": [result]})
        self.assertEqual(fields["street"], "")
        self.assertEqual(fields["house_number"], "")
        self.assertEqual(fields["postal_code"], "")
        self.assertTrue(fields["partial"])

    def test_never_combines_components_from_different_results(self):
        incomplete = copy.deepcopy(self.result)
        incomplete["address_components"] = [c for c in incomplete["address_components"] if c["types"] != ["postal_code"]]
        fields = google_address_fields({"results": [incomplete, self.result]})
        self.assertEqual(fields["postal_code"], "")
        self.assertTrue(fields["partial"])

    @patch("api.google_geocoding.urlopen")
    def test_safe_statuses_never_return_provider_error_messages(self, provider):
        for status, http in [("ZERO_RESULTS", 503), ("OVER_QUERY_LIMIT", 429), ("OVER_DAILY_LIMIT", 429), ("REQUEST_DENIED", 503), ("INVALID_REQUEST", 503)]:
            self.provider(provider, {"status": status, "error_message": "server-fixture-secret"})
            response = self.client.post(self.path, self.point, format="json")
            self.assertEqual(response.status_code, http)
            self.assertNotIn("server-fixture-secret", response.content.decode())

    @patch("api.google_geocoding.urlopen")
    def test_provider_failures_are_recoverable_without_key_or_url_leaks(self, provider):
        for error in [TimeoutError("server-fixture-secret"), URLError("private"), HTTPError("https://provider/?key=secret", 403, "private", {}, None)]:
            provider.side_effect = error
            response = self.client.post(self.path, self.point, format="json")
            self.assertEqual(response.status_code, 503)
            self.assertNotIn("secret", response.content.decode())

    @patch("api.google_geocoding.urlopen")
    def test_invalid_payloads_fail_closed(self, provider):
        for payload in [[], None, {"status": "OK", "results": {}}, {"status": "OK", "results": [None, {"address_components": []}]}]:
            provider.return_value.__enter__.return_value.read.return_value = json.dumps(payload).encode()
            self.assertEqual(self.client.post(self.path, self.point, format="json").status_code, 503)

    @patch("api.google_geocoding.urlopen")
    def test_geocoding_throttle_still_applies(self, provider):
        self.provider(provider)
        for _ in range(10):
            self.assertEqual(self.client.post(self.path, self.point, format="json").status_code, 200)
        self.assertEqual(self.client.post(self.path, self.point, format="json").status_code, 429)
        self.assertEqual(provider.call_count, 10)
