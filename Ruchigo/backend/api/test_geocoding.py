"""Provider fixtures are mocked: these are not live geocoding acceptance tests."""
import json
from decimal import Decimal
from unittest.mock import MagicMock, patch
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlsplit

from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase

from .geocoding import address_fields, reverse_address
from .models import User


@override_settings(LOCATIONIQ_API_KEY="location-fixture-secret", LOCATIONIQ_REGION="us1")
class GeocodingTests(APITestCase):
    path = "/api/v1/location/reverse/"
    point = {"latitude": "28.631500", "longitude": "77.216700", "consent": True}
    provider_data = {"lat": "1", "lon": "2", "display_name": "Never return raw provider display", "address": {
        "road": " Parliament Street ", "suburb": "Connaught Place", "city": "New Delhi",
        "state": "Delhi", "postcode": "110001", "country_code": "in",
    }}

    def setUp(self):
        cache.clear()

    def provider(self, mock, payload=None):
        response = MagicMock()
        response.read.return_value = json.dumps(payload or self.provider_data).encode()
        mock.return_value.__enter__.return_value = response
        return response

    @patch("api.geocoding.urlopen")
    def test_lookup_is_public_read_only_and_keeps_keys_centroid_and_payload_private(self, provider):
        response_mock = self.provider(provider)
        with self.assertNumQueries(0):
            response = self.client.post(self.path, self.point, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Cache-Control"], "private, no-store")
        address = response.data["address"]
        self.assertEqual(address["label"], "Connaught Place")
        self.assertEqual(address["line1"], "Parliament Street")
        self.assertEqual(address["city"], "Delhi")
        self.assertEqual(address["country_code"], "IN")
        self.assertFalse(address["partial"])
        for field in ("latitude", "longitude", "lat", "lon", "display_name", "key"):
            self.assertNotIn(field, address)
        self.assertNotIn("location-fixture-secret", response.content.decode())
        query = parse_qs(urlsplit(provider.call_args.args[0].full_url).query)
        self.assertEqual(query["lat"], [self.point["latitude"]])
        self.assertEqual(query["lon"], [self.point["longitude"]])
        self.assertEqual(query["normalizeaddress"], ["1"])
        self.assertEqual(provider.call_args.kwargs["timeout"], 8)
        response_mock.read.assert_called_once_with(65536)

    @patch("api.geocoding.urlopen")
    def test_coordinates_and_explicit_consent_are_required(self, provider):
        invalid = [
            {}, {"latitude": "28", "longitude": "77"},
            {**self.point, "consent": False}, {**self.point, "latitude": 91},
            {**self.point, "longitude": -181}, {**self.point, "latitude": None},
            {**self.point, "latitude": "NaN"}, {**self.point, "longitude": True},
            {**self.point, "latitude": "28.1234567"},
        ]
        for payload in invalid:
            with self.subTest(payload=payload):
                cache.clear()
                response = self.client.post(self.path, payload, format="json")
                self.assertEqual(response.status_code, 400)
                self.assertEqual(response["Cache-Control"], "private, no-store")
        provider.assert_not_called()

    @patch("api.geocoding.urlopen")
    def test_zero_and_boundary_coordinates_are_valid(self, provider):
        self.provider(provider)
        for lat, lon in [(0, 0), (-90, -180), (90, 180)]:
            response = self.client.post(self.path, {"latitude": lat, "longitude": lon, "consent": True}, format="json")
            self.assertEqual(response.status_code, 200)

    @patch("api.geocoding.urlopen")
    def test_unconfigured_or_invalid_region_never_calls_provider(self, provider):
        for settings in ({"LOCATIONIQ_API_KEY": ""}, {"LOCATIONIQ_REGION": "evil.example"}):
            with self.settings(**settings):
                response = self.client.post(self.path, self.point, format="json")
                self.assertEqual(response.status_code, 503)
                self.assertIn("fill in the address", response.data["detail"])
        provider.assert_not_called()

    @patch("api.geocoding.urlopen")
    def test_timeout_and_connection_failure_have_safe_manual_fallback(self, provider):
        for error in [TimeoutError("private"), URLError("secret"), ConnectionResetError("key")]:
            provider.side_effect = error
            response = self.client.post(self.path, self.point, format="json")
            self.assertEqual(response.status_code, 503)
            self.assertNotIn(str(error), response.data["detail"])

    @patch("api.geocoding.urlopen")
    def test_provider_http_failures_do_not_expose_request_url(self, provider):
        for code, expected in [(401, 503), (404, 503), (429, 429), (500, 503)]:
            provider.side_effect = HTTPError("https://provider/?key=secret", code, "secret", {}, None)
            response = self.client.post(self.path, self.point, format="json")
            self.assertEqual(response.status_code, expected)
            self.assertNotIn("secret", response.content.decode())
            if code == 429:
                self.assertEqual(response["Retry-After"], "2")

    @patch("api.geocoding.urlopen")
    def test_bad_json_and_empty_or_malformed_addresses_fail_closed(self, provider):
        for raw in [b"not json", b"[]", b"null", b'{"address":[]}', b'{"address":{}}', b'{"address":{"road": []}}', b'{"address":{"postcode":null}}']:
            provider.return_value.__enter__.return_value.read.return_value = raw
            response = self.client.post(self.path, self.point, format="json")
            self.assertEqual(response.status_code, 503)

    def test_partial_address_and_aliases(self):
        self.assertEqual(address_fields({"address": {"state": "Delhi"}})["city"], "Delhi")
        address = address_fields({"address": {"town": "Gurgaon", "road": "Main Road"}})
        self.assertEqual(address["city"], "Gurugram")
        self.assertTrue(address["partial"])
        self.assertEqual(address["line1"], "Main Road")

    def test_new_delhi_territory_omitted_by_provider_is_normalized_for_india(self):
        address = address_fields({"address": {"road": "Outer Circle", "suburb": "Connaught Place", "city": "New Delhi", "postcode": "110001", "country_code": "in"}})
        self.assertEqual(address["state"], "Delhi")
        self.assertEqual(address["city"], "Delhi")
        self.assertFalse(address["partial"])

    def test_missing_state_is_not_invented_for_foreign_or_unknown_cities(self):
        for city, country in [("Delhi", "us"), ("Delhi", ""), ("Unknown city", "in")]:
            address = address_fields({"address": {"road": "Main Street", "city": city, "postcode": "12345", "country_code": country}})
            self.assertEqual(address["state"], "")
            self.assertTrue(address["partial"])

    @patch("api.geocoding.urlopen")
    def test_same_point_cached_but_moving_pin_gets_new_lookup(self, provider):
        self.provider(provider)
        first = reverse_address(Decimal("28.631500"), Decimal("77.216700"))
        self.assertEqual(first, reverse_address(Decimal("28.631500"), Decimal("77.216700")))
        self.assertEqual(provider.call_count, 1)
        reverse_address(Decimal("28.631501"), Decimal("77.216700"))
        self.assertEqual(provider.call_count, 2)

    @patch("api.geocoding.urlopen")
    def test_application_throttle_applies_to_reverse_lookup(self, provider):
        self.provider(provider)
        for _ in range(10):
            self.assertEqual(self.client.post(self.path, self.point, format="json").status_code, 200)
        response = self.client.post(self.path, self.point, format="json")
        self.assertEqual(response.status_code, 429)
        self.assertEqual(response["Cache-Control"], "private, no-store")

    def test_customer_can_persist_pin_but_not_read_another_customers_address(self):
        customer = User.objects.create_user("address-fixture@example.test", role="customer")
        other = User.objects.create_user("other-address-fixture@example.test", role="customer")
        self.client.force_authenticate(customer)
        response = self.client.post("/api/v1/addresses/", {
            "label": "Home", "line1": "Flat 4, Parliament Street", "line2": "Connaught Place",
            "city": "Delhi", "state": "Delhi", "postal_code": "110001",
            "latitude": self.point["latitude"], "longitude": self.point["longitude"],
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["latitude"], self.point["latitude"])
        address_path = f'/api/v1/addresses/{response.data["id"]}/'
        self.assertEqual(self.client.get(address_path).data["line1"], "Flat 4, Parliament Street")
        self.client.force_authenticate(other)
        self.assertEqual(self.client.get(address_path).status_code, 404)
        self.assertEqual(self.client.patch(address_path, {"line1": "Changed"}).status_code, 404)
