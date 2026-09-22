from decimal import Decimal
from unittest.mock import patch

from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase

from .models import MenuItem, Order, Restaurant, TasteProfile, User
from .recommendations import craving_terms


@override_settings(GEMINI_API_KEY="")
@patch("api.intelligence.structured_response", return_value=None)
class AssistantRecoveryTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.owner = User.objects.create_user("recovery-owner@example.test", role="restaurant")
        self.customer = User.objects.create_user("recovery-customer@example.test")
        self.delhi = Restaurant.objects.create(owner=self.owner, name="Delhi kitchen", city="Delhi", is_approved=True)
        other_owner = User.objects.create_user("recovery-owner2@example.test", role="restaurant")
        self.noida = Restaurant.objects.create(owner=other_owner, name="Noida pizza", city="Noida", is_approved=True)
        self.pizza = MenuItem.objects.create(restaurant=self.noida, name="Farmhouse Pizza", price=349, is_vegetarian=True)
        self.biryani = MenuItem.objects.create(restaurant=self.delhi, name="Chicken Biryani", price=329)
        self.client.force_authenticate(self.customer)

    def ask(self, message, **preferences):
        response = self.client.post("/api/v1/intelligence/assistant/", {"message": message, "preferences": {"city": "Delhi", **preferences}}, format="json")
        self.assertEqual(response.status_code, 200)
        return response.data

    def test_city_mismatch_has_explicit_browse_action_without_mutation(self, _):
        result = self.ask("I want a pizza")
        self.assertEqual(result["items"], [])
        self.assertEqual(result["no_match_reason"], "city")
        self.assertIn("Noida", result["reply"])
        self.assertIn("Delhi", result["reply"])
        action = result["actions"][0]
        self.assertEqual(action["city"], "Noida")
        chosen = self.ask(action["message"], city=action["city"])
        self.assertEqual([row["id"] for row in chosen["items"]], [self.pizza.pk])
        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(TasteProfile.objects.count(), 0)

    def test_exact_missing_dish_is_not_replaced_with_an_ingredient_match(self, _):
        result = self.ask("butter chicken")
        self.assertEqual(result["items"], [])
        self.assertIn("butter chicken", result["reply"])
        self.assertIn("Chicken Biryani", result["reply"])
        self.assertEqual(result["actions"][0]["kind"], "try_message")
        chosen = self.ask(result["actions"][0]["message"])
        self.assertEqual([row["id"] for row in chosen["items"]], [self.biryani.pk])

    def test_compound_food_and_negation(self, _):
        self.assertEqual(craving_terms("butter chicken"), (["butter chicken"], []))
        self.assertEqual(craving_terms("pizza without butter chicken"), (["pizza"], ["butter chicken"]))
        self.assertEqual(craving_terms("murgh makhani"), (["butter chicken"], []))

    def test_city_suggestion_cannot_bypass_budget_or_diet(self, _):
        result = self.ask("pizza under 50")
        self.assertFalse(any(row["kind"] == "browse_city" for row in result["actions"]))
        self.pizza.is_vegetarian = False
        self.pizza.save()
        TasteProfile.objects.create(user=self.customer, vegetarian=True)
        result = self.ask("pizza")
        self.assertEqual(result["items"], [])
        self.assertEqual(result["actions"], [])
        self.assertIn("vegetarian", result["reply"])

    def test_budget_shortfall_reports_actual_price(self, _):
        result = self.ask("pizza under 50", city="Noida")
        self.assertEqual(result["no_match_reason"], "budget")
        self.assertIn("₹349", result["reply"])
        self.assertEqual(result["applied_filters"]["budget"], Decimal("50"))

    def test_closed_soldout_and_blocked_kitchens_are_not_city_suggestions(self, _):
        self.noida.is_open = False
        self.noida.save()
        self.assertNotEqual(self.ask("pizza")["no_match_reason"], "city")
        self.noida.is_open = True
        self.noida.save()
        self.pizza.stock_quantity = 0
        self.pizza.save()
        self.assertNotEqual(self.ask("pizza")["no_match_reason"], "city")
        self.pizza.stock_quantity = None
        self.pizza.save()
        self.noida.owner.is_active = False
        self.noida.owner.save()
        self.assertNotEqual(self.ask("pizza")["no_match_reason"], "city")

    def test_gibberish_is_still_clarified_not_broadened(self, _):
        result = self.ask("zzzxq")
        self.assertEqual(result["status"], "needs_clarification")
        self.assertEqual(result["actions"], [])
