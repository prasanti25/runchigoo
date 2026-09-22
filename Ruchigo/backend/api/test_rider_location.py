from datetime import timedelta
from unittest.mock import patch

from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Address, DeliveryAssignment, Order, Restaurant, User


@override_settings(LOCATIONIQ_API_KEY="")
class RiderLocationTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user("rider-location-customer@example.test")
        self.other = User.objects.create_user("rider-location-other@example.test")
        self.owner = User.objects.create_user("rider-location-kitchen@example.test", role="restaurant")
        self.rider = User.objects.create_user("rider-location-rider@example.test", role="delivery")
        self.stranger = User.objects.create_user("rider-location-stranger@example.test", role="delivery")
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Location fixture kitchen", city="Delhi", is_approved=True)
        self.address = Address.objects.create(user=self.customer, line1="Private flat", city="Delhi", state="Delhi", postal_code="110001")
        self.order = Order.objects.create(customer=self.customer, restaurant=self.restaurant, delivery_address=self.address, status="assigned", subtotal=100, total=100)
        self.delivery = DeliveryAssignment.objects.create(order=self.order, partner=self.rider, current_latitude="28.631500", current_longitude="77.216700", location_updated_at=timezone.now())
        self.gps = f"/api/v1/orders/{self.order.pk}/live-location/"
        self.place = f"/api/v1/orders/{self.order.pk}/rider-place/"
        self.client.force_authenticate(self.customer)

    @patch("api.rider_location.reverse_address")
    def test_lightweight_owned_gps_is_private_and_never_calls_provider(self, provider):
        with self.assertNumQueries(1):
            response = self.client.get(self.gps)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Cache-Control"], "private, no-store")
        self.assertEqual(response.data["status"], "live")
        self.assertEqual(response.data["delivery"]["current_latitude"], "28.631500")
        for private in ["Private flat", "customer", "phone", "delivery_code", "payment"]:
            self.assertNotIn(private, str(response.data))
        provider.assert_not_called()

    @patch("api.rider_location.reverse_address")
    def test_other_customers_couriers_and_anonymous_cannot_read_or_lookup(self, provider):
        for user, status in [(self.other, 404), (self.stranger, 404), (None, 401)]:
            self.client.force_authenticate(user)
            self.assertEqual(self.client.get(self.gps).status_code, status)
            self.assertEqual(self.client.get(self.place).status_code, status)
        provider.assert_not_called()

    @patch("api.rider_location.reverse_address")
    def test_gps_write_then_lightweight_read_returns_latest_real_sample(self, provider):
        self.client.force_authenticate(self.rider)
        result = self.client.patch(f"/api/v1/deliveries/{self.delivery.pk}/", {"current_latitude": "28.632000", "current_longitude": "77.217000"}, format="json")
        self.assertEqual(result.status_code, 200)
        self.client.force_authenticate(self.customer)
        result = self.client.get(self.gps)
        self.assertEqual(result.data["delivery"]["current_latitude"], "28.632000")
        provider.assert_not_called()

    @patch("api.rider_location.reverse_address")
    def test_missing_old_and_future_gps_dont_trigger_geocoder(self, provider):
        for update, expected in [
            ({"location_updated_at": None}, "awaiting_gps"),
            ({"location_updated_at": timezone.now()-timedelta(seconds=16)}, "stale"),
            ({"location_updated_at": timezone.now()+timedelta(seconds=30)}, "stale"),
            ({"current_latitude": None, "current_longitude": None}, "awaiting_gps"),
        ]:
            DeliveryAssignment.objects.filter(pk=self.delivery.pk).update(**update)
            self.assertEqual(self.client.get(self.gps).data["status"], expected)
            self.assertEqual(self.client.get(self.place).data["status"], expected)
        provider.assert_not_called()

    @patch("api.rider_location.reverse_address")
    def test_ended_unassigned_or_paused_delivery_hides_gps_and_stops_lookups(self, provider):
        for status in ["preparing", "ready", "cancelled", "delivered"]:
            Order.objects.filter(pk=self.order.pk).update(status=status)
            response = self.client.get(self.gps)
            self.assertEqual(response.data["status"], "inactive")
            self.assertIsNone(response.data["delivery"])
            self.assertIsNone(self.client.get(self.place).data["place"])
        Order.objects.filter(pk=self.order.pk).update(status="assigned", fulfillment_paused_at=timezone.now())
        self.assertEqual(self.client.get(self.gps).data["status"], "inactive")
        self.assertIsNone(self.client.get(self.place).data["place"])
        provider.assert_not_called()

    @patch("api.rider_location.reverse_address", return_value=({"line1": "Outer Circle", "locality": "Connaught Place", "city": "Delhi", "attribution": "Search by LocationIQ"}, "ready"))
    def test_place_cached_separately_while_gps_keeps_changing(self, provider):
        first = self.client.get(self.place)
        self.assertEqual(first.data["place"]["label"], "Outer Circle, Connaught Place")
        self.assertEqual(first["Cache-Control"], "private, no-store")
        DeliveryAssignment.objects.filter(pk=self.delivery.pk).update(current_latitude="28.632000")
        self.assertEqual(self.client.get(self.place).data, first.data)
        self.assertEqual(self.client.get(self.gps).data["delivery"]["current_latitude"], "28.632000")
        provider.assert_called_once()
        cache.delete(f"rider-place:v1:{self.delivery.pk}")
        self.assertEqual(self.client.get(self.place).data["place"]["latitude"], "28.632000")
        self.assertEqual(provider.call_count, 2)

    @patch("api.rider_location.reverse_address", return_value=(None, "unavailable"))
    def test_provider_failure_never_stops_gps_or_fakes_street(self, provider):
        self.assertIsNone(self.client.get(self.place).data["place"])
        self.assertIsNone(self.client.get(self.place).data["place"])
        self.assertEqual(self.client.get(self.gps).data["status"], "live")
        provider.assert_called_once()

    @patch("api.rider_location.reverse_address")
    def test_concurrent_place_lock_does_not_block_lightweight_gps(self, provider):
        cache.add(f"rider-place:v1:{self.delivery.pk}:lock", True, 10)
        self.assertEqual(self.client.get(self.place).data["status"], "pending")
        self.assertEqual(self.client.get(self.gps).data["status"], "live")
        provider.assert_not_called()
