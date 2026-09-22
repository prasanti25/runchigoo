from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from .insights import operational_report
from .models import Address, Category, Coupon, DeliveryAssignment, MenuItem, Order, OrderItem, Payment, Restaurant, RestaurantVisit, Review, SavedRestaurant, TasteProfile, User


@override_settings(GEMINI_API_KEY="")
class IntelligenceTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user("taste@example.test", "Pass-test-4928")
        self.other = User.objects.create_user("other-taste@example.test", "Pass-test-4928")
        self.owner = User.objects.create_user("kitchen-taste@example.test", "Pass-test-4928", role="restaurant")
        self.owner2 = User.objects.create_user("second-kitchen@example.test", "Pass-test-4928", role="restaurant")
        self.admin = User.objects.create_user("admin-taste@example.test", "Pass-test-4928", role="admin")
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Taste Kitchen", city="Delhi", address="Kitchen", is_approved=True)
        self.restaurant2 = Restaurant.objects.create(owner=self.owner2, name="Other Kitchen", city="Mumbai", address="Kitchen", is_approved=True)
        self.category = Category.objects.create(name="Indian", slug="indian")
        self.item = MenuItem.objects.create(restaurant=self.restaurant, category=self.category, name="Veg thali", price=120, is_vegetarian=True, tags=["vegan"])
        self.coffee = MenuItem.objects.create(restaurant=self.restaurant, name="Cold coffee", price=90, is_vegetarian=True)
        self.item2 = MenuItem.objects.create(restaurant=self.restaurant2, name="Veg thali", price=150, is_vegetarian=True)
        self.address = Address.objects.create(user=self.customer, line1="Private address", city="Delhi", state="Delhi", postal_code="110001")
        self.client.force_authenticate(self.customer)

    def order(self, **kwargs):
        return Order.objects.create(customer=kwargs.pop("customer", self.customer), restaurant=kwargs.pop("restaurant", self.restaurant), delivery_address=self.address, subtotal=120, total=120, **kwargs)

    def past_order(self, days=3, **kwargs):
        order = self.order(status="delivered", **kwargs)
        created = timezone.now()-timedelta(days=days, minutes=45)
        Order.objects.filter(pk=order.pk).update(created_at=created)
        order.refresh_from_db()
        OrderItem.objects.create(order=order, menu_item=self.item, name=self.item.name, unit_price=120, quantity=1, total_price=120)
        DeliveryAssignment.objects.create(order=order, pickup_at=created+timedelta(minutes=20), delivered_at=created+timedelta(minutes=45))
        return order

    def test_preferences_are_private_validated_and_clearable(self):
        payload = {"vegetarian": True, "budget": 150, "dietary_tags": ["vegan"], "cuisines": [" Indian ", "Indian"], "use_order_history": False}
        response = self.client.patch("/api/v1/intelligence/preferences/", payload, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["cuisines"], ["indian"])
        self.client.force_authenticate(self.other)
        self.assertIsNone(self.client.get("/api/v1/intelligence/preferences/").data["budget"])
        self.assertEqual(self.client.patch("/api/v1/intelligence/preferences/", {"dietary_tags": ["allergy-safe"]}, format="json").status_code, 400)
        self.assertEqual(self.client.patch("/api/v1/intelligence/preferences/", {"budget": -1}, format="json").status_code, 400)
        self.client.force_authenticate(self.customer)
        self.client.post("/api/v1/intelligence/visits/", {"restaurant_id": self.restaurant.pk})
        self.assertEqual(self.client.delete("/api/v1/intelligence/preferences/").status_code, 204)
        self.assertFalse(TasteProfile.objects.filter(user=self.customer).exists())
        self.assertFalse(RestaurantVisit.objects.filter(user=self.customer).exists())

    def test_mutation_permissions_require_customer(self):
        for user, expected in [(None, 401), (self.owner, 403), (self.admin, 403)]:
            self.client.force_authenticate(user)
            self.assertEqual(self.client.patch("/api/v1/intelligence/preferences/", {}, format="json").status_code, expected)
            self.assertEqual(self.client.post("/api/v1/intelligence/saved/", {"restaurant_id": self.restaurant.pk}).status_code, expected)

    def test_saving_is_idempotent_and_scoped(self):
        for _ in range(2):
            self.assertEqual(self.client.post("/api/v1/intelligence/saved/", {"restaurant_id": self.restaurant.pk}).status_code, 204)
        self.assertEqual(SavedRestaurant.objects.count(), 1)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get("/api/v1/intelligence/saved/").data["restaurant_ids"], [])
        self.client.delete("/api/v1/intelligence/saved/", {"restaurant_id": self.restaurant.pk}, format="json")
        self.assertEqual(SavedRestaurant.objects.count(), 1)

    def test_visits_keep_one_per_kitchen_and_can_be_cleared(self):
        for _ in range(2):
            self.client.post("/api/v1/intelligence/visits/", {"restaurant_id": self.restaurant.pk})
        self.assertEqual(RestaurantVisit.objects.count(), 1)
        response = self.client.get("/api/v1/intelligence/feed/")
        self.assertEqual(response.data["recent_restaurants"][0]["id"], self.restaurant.pk)
        self.client.delete("/api/v1/intelligence/visits/")
        self.assertEqual(self.client.get("/api/v1/intelligence/feed/").data["recent_restaurants"], [])

    def test_saved_kitchen_ranks_first_and_closed_ones_do_not_show(self):
        SavedRestaurant.objects.create(user=self.customer, restaurant=self.restaurant2)
        response = self.client.get("/api/v1/intelligence/feed/")
        self.assertEqual(response.data["restaurants"][0]["id"], self.restaurant2.pk)
        self.restaurant2.is_open = False
        self.restaurant2.save()
        self.assertNotIn(self.restaurant2.pk, [row["id"] for row in self.client.get("/api/v1/intelligence/feed/").data["restaurants"]])

    def test_dietary_tags_are_strict_and_budget_city_enforced(self):
        TasteProfile.objects.create(user=self.customer, vegetarian=True, dietary_tags=["vegan"], budget=130)
        MenuItem.objects.create(restaurant=self.restaurant2, name="Non-vegan", price=100, is_vegetarian=True, tags=["non-vegan"])
        response = self.client.get("/api/v1/intelligence/feed/?city=Delhi")
        self.assertEqual([r["id"] for r in response.data["restaurants"]], [self.restaurant.pk])
        self.assertEqual(response.data["restaurants"][0]["menu_count"], 1)
        response = self.client.post("/api/v1/discovery/recommendations/", {"dietary_tags": ["vegan"]}, format="json")
        self.assertEqual([row["id"] for row in response.data["items"]], [self.item.pk])

    def test_coupons_exclude_expired_exhausted_used_first_order_and_other_city(self):
        now = timezone.now()
        for code, extra in [("VALID", {}), ("FIRST", {"first_order_only": True}), ("EXHAUSTED", {"usage_limit": 1, "usage_count": 1}), ("MUMBAI", {"restaurant": self.restaurant2}), ("ONCE", {"per_user_limit": 1})]:
            Coupon.objects.create(code=code, discount_amount=20, starts_at=now-timedelta(days=1), ends_at=now+timedelta(days=1), **extra)
        used = Coupon.objects.get(code="ONCE")
        self.order(coupon=used)
        result = self.client.get("/api/v1/intelligence/feed/?city=Delhi")
        self.assertEqual([c["code"] for c in result.data["coupons"]], ["VALID"])

    def test_history_optout_removes_recent_items_and_rank_signals(self):
        self.past_order()
        self.assertEqual(len(self.client.get("/api/v1/intelligence/feed/").data["recent_items"]), 1)
        TasteProfile.objects.create(user=self.customer, use_order_history=False)
        self.assertEqual(self.client.get("/api/v1/intelligence/feed/").data["recent_items"], [])
        response = self.client.post("/api/v1/discovery/recommendations/", {}, format="json")
        self.assertFalse(any("You ordered this before" in row["match_reasons"] for row in response.data["items"]))

    @patch("api.intelligence.structured_response", return_value={"intent": "food", "query": "Coffee under 100"})
    def test_assistant_followup_uses_real_catalog_and_no_mutations(self, provider):
        response = self.client.post("/api/v1/intelligence/assistant/", {"message": "under 100 instead", "history": ["Coffee please"], "preferences": {"city": "Delhi"}}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data["items"]], [self.coffee.pk])
        self.assertEqual(provider.call_args.args[1]["history"], ["Coffee please"])
        self.assertEqual(Order.objects.count(), 0)
        self.assertNotIn("model", response.data)

    @patch("api.intelligence.structured_response", return_value={"intent": "food", "query": "thali"})
    def test_model_cannot_weaken_original_explicit_budget(self, _):
        response = self.client.post("/api/v1/intelligence/assistant/", {"message": "Thali under 50"}, format="json")
        self.assertEqual(response.data["items"], [])

    @patch("api.intelligence.structured_response", return_value=None)
    def test_unclear_assistant_input_has_no_fake_matches(self, _):
        result = self.client.post("/api/v1/intelligence/assistant/", {"message": "uhbh"}, format="json")
        self.assertEqual(result.data["status"], "needs_clarification")
        self.assertEqual(result.data["items"], [])

    @patch("api.intelligence.structured_response")
    def test_support_does_not_send_private_order_data_to_provider_or_cancel(self, provider):
        order = self.order()
        result = self.client.post("/api/v1/intelligence/assistant/", {"message": "Where is my order?", "order_id": order.pk}, format="json")
        self.assertEqual(result.data["links"][0]["to"], f"/tracking/{order.pk}")
        self.client.post("/api/v1/intelligence/assistant/", {"message": "Cancel my order"}, format="json")
        order.refresh_from_db()
        self.assertEqual(order.status, "pending")
        provider.assert_not_called()
        self.client.force_authenticate(self.other)
        response = self.client.post("/api/v1/intelligence/assistant/", {"message": "Where is my order?", "order_id": order.pk}, format="json")
        self.assertNotIn(f"/tracking/{order.pk}", str(response.data))

    def test_chat_input_is_bounded(self):
        for body in [{"message": "x"*201}, {"message": "coffee", "history": ["a"]*7}, {"message": ""}]:
            self.assertEqual(self.client.post("/api/v1/intelligence/assistant/", body, format="json").status_code, 400)

    def test_insights_are_role_scoped(self):
        self.past_order()
        self.assertEqual(self.client.get("/api/v1/insights/").status_code, 403)
        self.client.force_authenticate(self.owner)
        report = self.client.get("/api/v1/insights/").data
        self.assertEqual(report["summary"]["delivered"], 1)
        self.assertNotIn("risk_review", report)
        self.assertEqual(report["forecast"]["status"], "insufficient_data")
        self.client.force_authenticate(self.owner2)
        self.assertEqual(self.client.get("/api/v1/insights/").data["summary"]["delivered"], 0)

    def test_forecast_requires_real_history_and_uses_completed_orders_only(self):
        for day in range(1, 29):
            self.past_order(days=day)
        self.order(status="cancelled")
        report = operational_report(Order.objects.all(), timezone.localdate())
        self.assertEqual(report["forecast"]["status"], "baseline")
        self.assertEqual(len(report["forecast"]["days"]), 7)
        self.assertTrue(all(day["orders"] == 1 for day in report["forecast"]["days"]))
        self.assertTrue(all(Decimal(day["gross_order_value"]) == 120 for day in report["forecast"]["days"]))

    def test_eta_is_owned_and_abstains_without_samples(self):
        order = self.order()
        result = self.client.get(f"/api/v1/insights/eta/?order={order.pk}")
        self.assertEqual(result.data["status"], "insufficient_data")
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f"/api/v1/insights/eta/?order={order.pk}").status_code, 404)

    def test_eta_uses_delivered_samples_not_preparation_time(self):
        for _ in range(10):
            self.past_order()
        order = self.order()
        result = self.client.get(f"/api/v1/insights/eta/?order={order.pk}")
        self.assertEqual(result.data["status"], "historical_estimate")
        self.assertTrue(40 <= result.data["maximum_minutes"] <= 45)

    def test_risk_signals_require_admin_and_never_block(self):
        for _ in range(5):
            self.order()
        self.client.force_authenticate(self.admin)
        signals = self.client.get("/api/v1/insights/").data["risk_review"]["signals"]
        self.assertEqual(signals[0]["kind"], "order_velocity")
        self.customer.refresh_from_db()
        self.assertTrue(self.customer.is_active)
        self.assertEqual(Order.objects.filter(status="pending").count(), 5)

    @patch("api.insights.structured_response")
    def test_sentiment_is_scoped_validated_cached_and_redacts_common_identifiers(self, provider):
        own = Review.objects.create(order=self.past_order(), customer=self.customer, restaurant=self.restaurant, rating=4, comment="Good food. Email me at person@example.test or 9876543210")
        Review.objects.create(order=self.past_order(restaurant=self.restaurant2), customer=self.customer, restaurant=self.restaurant2, rating=1, comment="Not for the first kitchen")
        provider.return_value = {"reviews": [{"id": own.pk, "sentiment": "positive", "theme": "food"}]}
        self.client.force_authenticate(self.owner)
        response = self.client.post("/api/v1/insights/sentiment/", {}, format="json")
        self.assertEqual(response.data["counts"], {"positive": 1})
        sent = provider.call_args.args[1]["reviews"]
        self.assertEqual(len(sent), 1)
        self.assertNotIn("person@example.test", sent[0]["text"])
        self.assertNotIn("9876543210", sent[0]["text"])
        self.client.post("/api/v1/insights/sentiment/", {}, format="json")
        self.assertEqual(provider.call_count, 1)

    @patch("api.insights.structured_response", return_value={"reviews": [{"id": 999999, "sentiment": "positive", "theme": "food"}]})
    def test_sentiment_invalid_ids_do_not_fabricate_analysis(self, _):
        Review.objects.create(order=self.past_order(), customer=self.customer, restaurant=self.restaurant, rating=4, comment="Nice")
        self.client.force_authenticate(self.owner)
        response = self.client.post("/api/v1/insights/sentiment/", {}, format="json")
        self.assertEqual(response.data["status"], "unavailable")
        self.assertEqual(response.data["counts"], {})
