from datetime import timedelta
from unittest.mock import patch

from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Address, DeliveryAssignment, Order, Restaurant, Review, User


@override_settings(GEMINI_API_KEY="")
class TrackingFeedbackTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user("map-customer@example.test", role="customer")
        self.other = User.objects.create_user("map-other@example.test", role="customer")
        self.owner = User.objects.create_user("map-owner@example.test", role="restaurant")
        self.courier = User.objects.create_user("map-rider@example.test", role="delivery")
        self.other_courier = User.objects.create_user("map-other-rider@example.test", role="delivery")
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Map Kitchen", city="Delhi", is_approved=True)
        self.address = Address.objects.create(user=self.customer, line1="Private address", city="Delhi", state="Delhi", postal_code="110001")
        self.order = Order.objects.create(customer=self.customer, restaurant=self.restaurant, delivery_address=self.address, status="assigned", subtotal=100, total=100)
        self.assignment = DeliveryAssignment.objects.create(order=self.order, partner=self.courier)
        self.location_path = f"/api/v1/deliveries/{self.assignment.pk}/"
        self.point = {"current_latitude": "28.610001", "current_longitude": "77.210001"}
        self.client.force_authenticate(self.courier)

    def test_gps_timestamp_is_server_owned_and_changes_only_with_coordinates(self):
        first = self.client.patch(self.location_path, self.point, format="json")
        self.assertEqual(first.status_code, 200)
        timestamp = first.data["location_updated_at"]
        self.assertIsNotNone(timestamp)
        response = self.client.patch(self.location_path, {"location_updated_at": "2099-01-01T00:00:00Z"}, format="json")
        self.assertEqual(response.data["location_updated_at"], timestamp)
        self.client.force_authenticate(self.customer)
        order = self.client.get(f"/api/v1/orders/{self.order.pk}/").data
        self.assertEqual(order["delivery"]["location_updated_at"], timestamp)

    def test_gps_pair_validation_ranges_and_clear(self):
        for values in [
            {"current_latitude": 28}, {"current_longitude": 77},
            {"current_latitude": None, "current_longitude": 77},
            {"current_latitude": 91, "current_longitude": 77},
            {"current_latitude": 28, "current_longitude": -181},
        ]:
            self.assertEqual(self.client.patch(self.location_path, values, format="json").status_code, 400)
        response = self.client.patch(self.location_path, {"current_latitude": 0, "current_longitude": 0}, format="json")
        self.assertEqual(response.status_code, 200)
        cleared = self.client.patch(self.location_path, {"current_latitude": None, "current_longitude": None}, format="json")
        self.assertIsNone(cleared.data["location_updated_at"])

    def test_other_rider_and_customer_cannot_write_location(self):
        self.client.force_authenticate(self.other_courier)
        self.assertEqual(self.client.patch(self.location_path, self.point, format="json").status_code, 404)
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.patch(self.location_path, self.point, format="json").status_code, 403)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f"/api/v1/orders/{self.order.pk}/").status_code, 404)

    def test_finished_order_rejects_further_location_updates(self):
        self.order.status = "delivered"
        self.order.save()
        self.assertEqual(self.client.patch(self.location_path, self.point, format="json").status_code, 400)

    def test_old_location_does_not_become_fresh_when_assignment_changes(self):
        old = timezone.now() - timedelta(minutes=4)
        DeliveryAssignment.objects.filter(pk=self.assignment.pk).update(**self.point, location_updated_at=old)
        self.assignment.refresh_from_db()
        self.assignment.pickup_at = timezone.now()
        self.assignment.save()
        self.assertEqual(self.assignment.location_updated_at, old)

    def test_map_config_is_public_validated_and_does_not_expose_server_tokens(self):
        self.client.force_authenticate(None)
        with override_settings(GEMINI_API_KEY="private-gemini", IPINFO_TOKEN="private-ipinfo"):
            response = self.client.get("/api/v1/location/map-config/")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("private-", str(response.data))
        self.assertEqual(response.data["provider"], "OpenStreetMap")
        with override_settings(MAP_TILE_URL="javascript:alert(1)"):
            self.assertEqual(self.client.get("/api/v1/location/map-config/").status_code, 503)

    def review(self, **values):
        self.client.force_authenticate(self.customer)
        return self.client.post("/api/v1/reviews/", {"order": self.order.pk, "rating": 4, "comment": "Good meal", **values}, format="json")

    def test_delivered_meal_review_create_edit_and_public_rating(self):
        self.assertEqual(self.review().status_code, 400)
        self.order.status = "delivered"
        self.order.save()
        response = self.review()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.review().status_code, 400)
        path = f"/api/v1/reviews/{response.data['id']}/"
        self.assertEqual(self.client.patch(path, {"rating": 2, "comment": "Portion was small"}, format="json").status_code, 200)
        self.restaurant.refresh_from_db()
        self.assertEqual(float(self.restaurant.average_rating), 2)
        self.assertEqual(self.client.get(f"/api/v1/orders/{self.order.pk}/").data["review"]["comment"], "Portion was small")
        public = self.client.get(f"/api/v1/restaurant-reviews/?restaurant={self.restaurant.pk}").data["results"]
        self.assertEqual(public[0]["rating"], 2)
        self.assertNotIn("email", public[0])

    def test_review_validation_and_ownership(self):
        self.order.status = "delivered"
        self.order.save()
        for values in [{"rating": 0}, {"rating": 6}, {"comment": "a" * 2001}]:
            self.assertEqual(self.review(**values).status_code, 400)
        created = self.review()
        path = f"/api/v1/reviews/{created.data['id']}/"
        other_order = Order.objects.create(customer=self.customer, restaurant=self.restaurant, delivery_address=self.address, status="delivered", subtotal=100, total=100)
        self.assertEqual(self.client.patch(path, {"order": other_order.pk}, format="json").status_code, 400)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.patch(path, {"rating": 1}, format="json").status_code, 404)
        self.assertEqual(Review.objects.count(), 1)

    def test_support_is_order_scoped_and_links_to_explicit_ticket_composer(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post("/api/v1/intelligence/assistant/", {"mode": "support", "order_id": self.order.pk, "message": "Where is my order?"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("pickup is not confirmed", response.data["reply"])
        self.assertIn(f"/support?order={self.order.pk}&compose=1", str(response.data["links"]))
        self.client.force_authenticate(self.other)
        for message in ["Where is my order?", "An item is missing", "hello"]:
            self.assertEqual(self.client.post("/api/v1/intelligence/assistant/", {"mode": "support", "order_id": self.order.pk, "message": message}, format="json").status_code, 404)

    @patch("api.intelligence.structured_response", return_value={"topic": "missing"})
    def test_support_gemini_classifies_without_receiving_order_secrets_or_mutating(self, provider):
        self.client.force_authenticate(self.customer)
        response = self.client.post("/api/v1/intelligence/assistant/", {"mode": "support", "order_id": self.order.pk, "message": "khana kam aya abc@example.com 9999999999", "history": ["private previous message"]}, format="json")
        self.assertEqual(response.status_code, 200)
        sent = provider.call_args.args[1]
        self.assertEqual(set(sent), {"message"})
        self.assertNotIn("abc@example.com", str(sent))
        self.assertNotIn("9999999999", str(sent))
        self.assertNotIn("Private address", str(sent))
        self.assertIn("missing or wrong", response.data["reply"])
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "assigned")

    @patch("api.intelligence.structured_response", return_value=None)
    def test_support_failure_stays_helpful_without_invented_food_or_actions(self, provider):
        self.client.force_authenticate(self.customer)
        response = self.client.post("/api/v1/intelligence/assistant/", {"mode": "support", "message": "help please"}, format="json")
        self.assertEqual(response.data["items"], [])
        self.assertEqual(response.data["source"], "help")
        self.assertIn("open a ticket", response.data["reply"])

    def test_review_support_has_working_entry_point(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post("/api/v1/intelligence/assistant/", {"mode": "support", "order_id": self.order.pk, "message": "How can I rate my meal?"}, format="json")
        self.assertIn("delivered meal", response.data["reply"])
        self.assertEqual(response.data["links"][0]["to"], f"/tracking/{self.order.pk}")
