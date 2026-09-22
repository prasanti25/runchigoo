import json
from datetime import timedelta
from unittest.mock import MagicMock, patch
from urllib.error import URLError

from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from .google_routing import decode_polyline, road_route
from .models import Address, DeliveryAssignment, Order, Restaurant, User


@override_settings(GOOGLE_MAPS_SERVER_API_KEY="route-server-secret", GOOGLE_MAPS_BROWSER_API_KEY="public-browser")
class GoogleRoutingTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user("route-customer@example.test")
        self.other = User.objects.create_user("route-other@example.test")
        self.owner = User.objects.create_user("route-owner@example.test", role="restaurant")
        self.rider = User.objects.create_user("route-rider@example.test", role="delivery")
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Route kitchen", city="Delhi", latitude=28.63, longitude=77.21)
        self.address = Address.objects.create(user=self.customer, line1="Private flat", city="Delhi", state="Delhi", postal_code="110001", latitude=28.62, longitude=77.22)
        self.order = Order.objects.create(customer=self.customer, restaurant=self.restaurant, delivery_address=self.address, status="assigned", subtotal=100, total=100,
                                          address_snapshot={"latitude": "28.61", "longitude": "77.23", "line1": "Private original flat"})
        self.delivery = DeliveryAssignment.objects.create(order=self.order, partner=self.rider, current_latitude=28.6315, current_longitude=77.2167, location_updated_at=timezone.now())
        self.path = f"/api/v1/orders/{self.order.pk}/road-route/"
        self.client.force_authenticate(self.customer)
        self.route = {"points": [[28.6315, 77.2167], [28.63, 77.21]], "duration_seconds": 100, "distance_metres": 1000, "provider": "google"}

    @patch("api.google_routing.road_route")
    def test_owned_pickup_and_delivery_use_saved_snapshot_not_arbitrary_parameters(self, provider):
        provider.return_value = self.route
        result = self.client.get(self.path, {"latitude": 0, "longitude": 0})
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result["Cache-Control"], "private, no-store")
        self.assertEqual(result.data["leg"], "pickup")
        provider.assert_called_with([28.6315, 77.2167], [28.63, 77.21])
        Order.objects.filter(pk=self.order.pk).update(status="out_for_delivery")
        result = self.client.get(self.path)
        self.assertEqual(result.data["leg"], "delivery")
        provider.assert_called_with([28.6315, 77.2167], [28.61, 77.23])
        self.assertNotIn("Private", str(result.data))

    @patch("api.google_routing.road_route")
    def test_unauthorized_users_cannot_route_other_orders(self, provider):
        for user, code in [(self.other, 404), (None, 401)]:
            self.client.force_authenticate(user)
            self.assertEqual(self.client.get(self.path).status_code, code)
        provider.assert_not_called()

    @patch("api.google_routing.road_route")
    def test_stale_missing_future_and_inactive_gps_never_calls_provider(self, provider):
        for moment in [None, timezone.now() - timedelta(seconds=20), timezone.now() + timedelta(seconds=30)]:
            cache.clear()
            DeliveryAssignment.objects.filter(pk=self.delivery.pk).update(location_updated_at=moment)
            self.assertIsNone(self.client.get(self.path).data["route"])
        DeliveryAssignment.objects.filter(pk=self.delivery.pk).update(location_updated_at=timezone.now())
        for status in ["pending", "preparing", "ready", "delivered", "cancelled"]:
            cache.clear()
            Order.objects.filter(pk=self.order.pk).update(status=status)
            self.assertIsNone(self.client.get(self.path).data["route"])
        Order.objects.filter(pk=self.order.pk).update(status="assigned", fulfillment_paused_at=timezone.now())
        cache.clear()
        self.assertIsNone(self.client.get(self.path).data["route"])
        provider.assert_not_called()

    @patch("api.google_routing.road_route")
    def test_missing_pin_does_not_use_other_address_or_city_centroid(self, provider):
        Order.objects.filter(pk=self.order.pk).update(status="out_for_delivery", address_snapshot={"line1": "No pin"})
        self.assertEqual(self.client.get(self.path).data["status"], "missing_pin")
        provider.assert_not_called()

    @patch("api.google_routing.road_route", return_value=None)
    def test_route_outage_leaves_fast_gps_available(self, provider):
        self.assertEqual(self.client.get(self.path).data["status"], "unavailable")
        self.assertEqual(self.client.get(f"/api/v1/orders/{self.order.pk}/live-location/").data["status"], "live")
        provider.assert_called_once()

    @patch("api.google_routing.road_route")
    def test_demo_is_fixed_public_points_read_only_and_not_cached(self, provider):
        provider.return_value = self.route
        self.client.force_authenticate(None)
        with self.assertNumQueries(0):
            result = self.client.get("/api/v1/location/demo-route/?latitude=0&longitude=0")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result["Cache-Control"], "private, no-store")
        self.assertTrue(result.data["simulated"])
        self.assertEqual(provider.call_count, 2)
        self.assertEqual(provider.call_args_list[0].args[0], [28.637207, 77.213705])

    @patch("api.google_routing.urlopen")
    def test_provider_fields_timeout_headers_and_no_cache(self, provider):
        response = MagicMock()
        response.read.return_value = json.dumps({"routes": [{"duration": "123s", "distanceMeters": 1000, "polyline": {"encodedPolyline": "_p~iF~ps|U_ulLnnqC_mqNvxq`@"}, "private": "Never return"}]}).encode()
        provider.return_value.__enter__.return_value = response
        for _ in range(2):
            route = road_route([28.63, 77.21], [28.62, 77.22])
            self.assertEqual(route["duration_seconds"], 123)
            self.assertEqual(route["points"][0], [38.5, -120.2])
            self.assertNotIn("secret", str(route))
            self.assertNotIn("private", route)
        self.assertEqual(provider.call_count, 2)
        self.assertEqual(provider.call_args.kwargs["timeout"], 8)
        payload = json.loads(provider.call_args.args[0].data)
        self.assertEqual(payload["routingPreference"], "TRAFFIC_UNAWARE")
        self.assertEqual(payload["polylineQuality"], "HIGH_QUALITY")
        response.read.assert_called_with(524288)

    @patch("api.google_routing.urlopen", side_effect=URLError("route-server-secret"))
    def test_provider_error_and_missing_key_are_safe(self, provider):
        self.assertIsNone(road_route([28, 77], [29, 78]))
        with self.settings(GOOGLE_MAPS_SERVER_API_KEY=""):
            self.assertIsNone(road_route([28, 77], [29, 78]))
        provider.assert_called_once()

    def test_invalid_polylines_are_rejected(self):
        for data in ["", "_", "?", "~~~~~~~", "abc\x00", None]:
            with self.assertRaises(ValueError):
                decode_polyline(data)
