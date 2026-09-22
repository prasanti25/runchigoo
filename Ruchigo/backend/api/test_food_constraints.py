from unittest.mock import patch
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase
from .models import Category, MenuItem, Order, Restaurant, TasteProfile, User


@override_settings(GEMINI_API_KEY="")
class FoodConstraintTests(APITestCase):
    def setUp(self):
        cache.clear()
        owner = User.objects.create_user("constraint-owner@example.test", role="restaurant")
        self.user = User.objects.create_user("constraint-customer@example.test")
        self.restaurant = Restaurant.objects.create(owner=owner, name="Kitchen", city="Noida", is_approved=True)
        pizza = Category.objects.create(name="Pizza", slug="pizza")
        self.veg = MenuItem.objects.create(restaurant=self.restaurant, category=pizza, name="Farmhouse Pizza", price=249, is_vegetarian=True)
        self.chicken = MenuItem.objects.create(restaurant=self.restaurant, category=pizza, name="Smoky Chicken Pizza", price=399, is_vegetarian=False)
        self.biryani = MenuItem.objects.create(restaurant=self.restaurant, name="Chicken Biryani", price=199, is_vegetarian=False)
        self.coffee = MenuItem.objects.create(restaurant=self.restaurant, name="Cold Coffee", price=99, is_vegetarian=True, description="Enjoy with pizza")
        self.client.force_authenticate(self.user)

    def ask(self, message, history=None, preferences=None, interpretation=None):
        with patch("api.intelligence.structured_response", return_value=interpretation):
            response = self.client.post("/api/v1/intelligence/assistant/", {"message": message, "history": history or [], "preferences": preferences or {}}, format="json")
        self.assertEqual(response.status_code, 200)
        return response.data

    def assertItems(self, response, expected):
        self.assertEqual({row["id"] for row in response["items"]}, {item.pk for item in expected})

    def test_exact_reported_nonveg_request_and_correction_without_provider(self):
        first = "i would like to have a non veg pizza"
        self.assertItems(self.ask(first), [self.chicken])
        result = self.ask("You showing me veg also i said just non veg", [first])
        self.assertItems(result, [self.chicken])
        self.assertTrue(result["applied_filters"]["non_vegetarian"])
        self.assertIn("pizza", result["reply"])
        self.assertIn("non-vegetarian", result["reply"])
        self.assertEqual(Order.objects.count(), 0)

    def test_interpreter_cannot_replace_requested_pizza_with_coffee(self):
        result = self.ask("non-veg pizza", interpretation={"intent": "food", "query": "coffee"})
        self.assertItems(result, [self.chicken])
        result = self.ask("just non veg", ["pizza"], interpretation={"intent": "food", "query": "food"})
        self.assertItems(result, [self.chicken])

    def test_explicit_nonveg_variants_and_veg_switch(self):
        for phrase in ("nonveg pizza", "non vegetarian pizza", "pizza not veg", "pizza no vegetarian"):
            with self.subTest(phrase=phrase):
                self.assertItems(self.ask(phrase), [self.chicken])
        self.assertItems(self.ask("veg only instead", ["non-veg pizza"]), [self.veg])
        self.assertItems(self.ask("pizza not non-veg"), [self.veg])

    def test_budget_followups_retain_food_and_diet_but_can_raise_budget(self):
        result = self.ask("under 300 instead", ["non veg pizza"])
        self.assertItems(result, [])
        self.assertEqual(result["no_match_reason"], "budget")
        self.assertIn("399", result["reply"])
        self.assertItems(self.ask("under 450 instead", ["non veg pizza", "under 300 instead"]), [self.chicken])

    def test_new_dish_replaces_previous_dish_and_preserves_diet(self):
        self.assertItems(self.ask("biryani instead", ["non veg pizza"]), [self.biryani])

    def test_ingredient_with_dish_is_not_an_or_match(self):
        self.assertItems(self.ask("chicken pizza"), [self.chicken])

    def test_wrong_result_correction_does_not_request_wrong_item(self):
        self.assertItems(self.ask("why coffee? i asked for non veg pizza", ["pizza"]), [self.chicken])

    def test_no_matching_nonveg_never_returns_vegetarian_substitutes(self):
        self.chicken.is_available = False
        self.chicken.save()
        result = self.ask("non veg pizza")
        self.assertItems(result, [])
        self.assertIn("couldn’t find", result["reply"])
        self.assertFalse(any("Coffee" in action["label"] or "Farmhouse" in action["label"] for action in result["actions"]))

    def test_saved_diet_conflict_explained_without_mutation(self):
        profile = TasteProfile.objects.create(user=self.user, vegetarian=True)
        result = self.ask("non veg pizza")
        self.assertItems(result, [])
        self.assertEqual(result["status"], "preference_conflict")
        profile.refresh_from_db()
        self.assertTrue(profile.vegetarian)

    def test_recommendations_endpoint_enforces_nonveg_too(self):
        result = self.client.post("/api/v1/discovery/recommendations/", {"q": "non veg pizza"}, format="json")
        self.assertEqual(result.status_code, 200)
        self.assertItems(result.data, [self.chicken])

    def test_gibberish_followup_does_not_repeat_last_shortlist(self):
        self.assertItems(self.ask("zzzxq", ["non veg pizza"]), [])

    def test_city_and_explicit_control_budget_still_enforced(self):
        self.assertItems(self.ask("non veg pizza", preferences={"city": "Delhi"}), [])
        self.assertItems(self.ask("non veg pizza under 500", preferences={"budget": "200"}), [])

    def test_resolved_context_survives_bounded_transcript(self):
        result = self.ask("under 450 instead", ["just non veg"] * 6, preferences={"q": "pizza non-vegetarian under 300"})
        self.assertItems(result, [self.chicken])
        self.assertTrue(result["applied_filters"]["non_vegetarian"])
