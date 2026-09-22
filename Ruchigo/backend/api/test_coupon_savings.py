from decimal import Decimal

from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Address, Cart, Coupon, DeliveryPolicy, DeliveryZone, MenuItem, Order, Restaurant, User


@override_settings(GEMINI_API_KEY="", RAZORPAY_KEY_ID="", RAZORPAY_KEY_SECRET="")
class CouponSavingsTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user("savings@example.test")
        self.other = User.objects.create_user("other-savings@example.test")
        self.owner = User.objects.create_user("savings-kitchen@example.test", role="restaurant")
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Savings kitchen", city="Delhi", is_approved=True, latitude="28.600000", longitude="77.200000")
        self.item = MenuItem.objects.create(restaurant=self.restaurant, name="Test meal", price=200)
        self.address = Address.objects.create(user=self.customer, label="Home", line1="Test address", city="Delhi", state="Delhi", postal_code="110001", is_default=True, latitude="28.610000", longitude="77.200000")
        self.client.force_authenticate(self.customer)
        self.client.post("/api/v1/cart/items/", {"menu_item": self.item.pk, "quantity": 1}, format="json")

    def coupon(self, code="SAVE80", **extra):
        data = {"code": code, "discount_amount": Decimal(80), "min_order_amount": Decimal(200), "starts_at": timezone.now()-timezone.timedelta(days=1), "ends_at": timezone.now()+timezone.timedelta(days=1)}
        data.update(extra)
        return Coupon.objects.create(**data)

    def savings(self, **query):
        response = self.client.get("/api/v1/cart/savings/", query)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response["Cache-Control"], "private, no-store")
        return response.data

    def validate(self, code):
        return self.client.post("/api/v1/cart/validate-coupon/", {"code": code}, format="json")

    def quote(self, code=""):
        return self.client.post("/api/v1/cart/quote/", {"address_id": self.address.pk, "coupon_code": code}, format="json")

    def quantity(self, quantity):
        item = Cart.objects.get(user=self.customer).items.get()
        response = self.client.patch(f"/api/v1/cart/items/{item.pk}/", {"quantity": quantity}, format="json")
        self.assertEqual(response.status_code, 200)

    def zone(self, **extra):
        data = {"name": "Savings zone", "city": "Delhi", "is_active": True, "latitude": "28.600000", "longitude": "77.200000", "radius_km": 10, "max_delivery_km": 5, "base_fee": 25, "per_km_fee": 0, "included_km": 0}
        data.update(extra)
        DeliveryPolicy.objects.update_or_create(pk=1, defaults={"enabled": True})
        return DeliveryZone.objects.create(**data)

    def test_search_lists_eligible_and_locked_with_exact_amounts(self):
        self.coupon()
        self.coupon("SAVE150", min_order_amount=500, discount_amount=150)
        result = self.savings()
        self.assertEqual(result["available_count"], 1)
        ready, locked = result["results"]
        self.assertEqual(ready["discount"], "80.00")
        self.assertEqual(locked["status"], "minimum_spend")
        self.assertEqual(Decimal(locked["amount_to_unlock"]), 300)
        self.assertEqual(locked["unlock_discount"], "150.00")
        self.assertEqual(result["next_coupon"]["code"], "SAVE150")
        self.assertEqual([row["code"] for row in self.savings(q="save150")["results"]], ["SAVE150"])
        self.assertEqual(self.savings(q="not-a-coupon")["results"], [])

    def test_discount_matches_list_validate_quote_and_checkout(self):
        coupon = self.coupon(discount_amount=None, discount_percent="12.34", max_discount=20)
        self.assertEqual(self.savings()["results"][0]["discount"], "20.00")
        validation = self.validate(" save80 ")
        self.assertEqual(validation.status_code, 200)
        self.assertEqual(validation.data["discount"], 20)
        self.assertNotIn("delivery_fee", validation.data)
        quote = self.quote(coupon.code)
        self.assertEqual(quote.data["discount"], 20)
        order = self.client.post("/api/v1/cart/checkout/", {"address_id": self.address.pk, "coupon_code": coupon.code, "quote_token": quote.data["quote_token"]}, format="json")
        self.assertEqual(order.status_code, 201, order.data)
        self.assertEqual(Decimal(order.data["total"]), 220)
        coupon.refresh_from_db()
        self.assertEqual(coupon.usage_count, 1)

    def test_discount_never_exceeds_food_total_and_rounds_once(self):
        self.coupon(discount_amount=500)
        self.assertEqual(self.savings()["results"][0]["discount"], "200.00")
        coupon = self.coupon("PERCENT", discount_amount=None, discount_percent="12.34")
        self.assertEqual(self.validate(coupon.code).data["discount"], Decimal("24.68"))

    def test_additional_food_unlocks_coupon_and_delivery_before_discount(self):
        self.coupon(min_order_amount=400, discount_amount=150)
        self.zone(free_delivery_above=400)
        self.assertEqual(self.savings()["results"][0]["status"], "minimum_spend")
        self.assertEqual(self.validate("SAVE80").status_code, 400)
        self.quantity(2)
        result = self.savings(address_id=self.address.pk)
        self.assertTrue(result["results"][0]["eligible"])
        self.assertEqual(result["delivery"]["status"], "free")
        self.assertFalse(result["delivery"]["is_estimate"])
        self.assertEqual(self.quote("SAVE80").data["total"], 250)
        self.quantity(1)
        self.assertEqual(self.validate("SAVE80").status_code, 400)

    def test_expired_upcoming_and_exhausted_never_prompt_spending(self):
        for code, extra, expected in [
            ("EXPIRED", {"ends_at": timezone.now()-timezone.timedelta(seconds=1)}, "expired"),
            ("LATER", {"starts_at": timezone.now()+timezone.timedelta(hours=1)}, "upcoming"),
            ("LIMIT", {"usage_limit": 1, "usage_count": 1}, "exhausted"),
        ]:
            self.coupon(code, min_order_amount=1000, **extra)
            row = self.savings(q=code)["results"][0]
            self.assertEqual(row["status"], expected)
            self.assertEqual(Decimal(row["amount_to_unlock"]), 0)
            self.assertEqual(self.validate(code).status_code, 400)
        self.assertIsNone(self.savings()["next_coupon"])

    def test_first_order_and_personal_usage_limits_match_checkout(self):
        coupon = self.coupon(per_user_limit=1)
        self.coupon("FIRST", first_order_only=True)
        order = Order.objects.create(customer=self.customer, restaurant=self.restaurant, delivery_address=self.address, coupon=coupon, subtotal=200, total=200)
        rows = {row["code"]: row for row in self.savings()["results"]}
        self.assertEqual(rows["FIRST"]["status"], "first_order_only")
        self.assertEqual(rows["SAVE80"]["status"], "user_limit")
        self.assertEqual(self.validate("FIRST").status_code, 400)
        order.status = "cancelled"
        order.save()
        self.assertTrue(all(row["eligible"] for row in self.savings()["results"]))

    def test_inactive_and_other_restaurant_campaigns_are_not_listed(self):
        owner = User.objects.create_user("other-savings-owner@example.test", role="restaurant")
        other = Restaurant.objects.create(owner=owner, name="Other kitchen", city="Delhi", is_approved=True)
        self.coupon("DRAFT", is_active=False)
        self.coupon("OTHER", restaurant=other)
        self.assertEqual(self.savings()["count"], 0)
        self.assertEqual(self.validate("OTHER").status_code, 400)
        self.assertEqual(self.validate("DRAFT").status_code, 400)

    def test_browsing_and_applying_do_not_reserve_coupon_or_create_orders(self):
        coupon = self.coupon()
        for _ in range(3):
            self.savings()
            self.assertEqual(self.validate(coupon.code).status_code, 200)
        coupon.refresh_from_db()
        self.assertEqual(coupon.usage_count, 0)
        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(Cart.objects.get(user=self.customer).items.get().quantity, 1)

    def test_expiry_and_exhaustion_after_discovery_are_rechecked(self):
        coupon = self.coupon()
        self.assertTrue(self.savings()["results"][0]["eligible"])
        coupon.ends_at = timezone.now()-timezone.timedelta(seconds=1)
        coupon.save()
        self.assertEqual(self.validate(coupon.code).status_code, 400)
        self.assertEqual(self.quote(coupon.code).status_code, 400)
        self.assertEqual(Order.objects.count(), 0)

    def test_no_address_never_promises_free_delivery(self):
        self.address.delete()
        self.assertEqual(self.savings()["delivery"]["status"], "address_required")

    def test_address_ownership_and_serviceability_are_enforced(self):
        other = Address.objects.create(user=self.other, line1="Other", city="Delhi", state="Delhi", postal_code="110001")
        self.assertEqual(self.client.get("/api/v1/cart/savings/", {"address_id": other.pk}).status_code, 400)
        self.address.city = "Mumbai"
        self.address.save()
        self.quantity(3)
        self.assertEqual(self.savings()["delivery"]["status"], "unavailable")

    def test_zone_without_free_delivery_does_not_invent_threshold(self):
        self.zone()
        self.quantity(3)
        delivery = self.savings(address_id=self.address.pk)["delivery"]
        self.assertEqual(delivery["status"], "standard")
        self.assertIsNone(delivery["threshold"])
        self.assertEqual(Decimal(delivery["fee"]), 25)

    def test_overlap_free_threshold_respects_each_zones_minimum(self):
        self.zone(name="Cheap", base_fee=10, free_delivery_above=1000)
        self.zone(name="Earlier free", base_fee=30, minimum_order=350, free_delivery_above=300)
        delivery = self.savings()["delivery"]
        self.assertEqual(Decimal(delivery["threshold"]), 350)
        self.assertEqual(Decimal(delivery["remaining"]), 150)
        self.quantity(2)
        self.assertEqual(self.savings()["delivery"]["status"], "free")

    def test_standard_delivery_progress_matches_existing_checkout_policy(self):
        delivery = self.savings()["delivery"]
        self.assertEqual(Decimal(delivery["threshold"]), 500)
        self.assertEqual(Decimal(delivery["remaining"]), 300)
        self.assertTrue(delivery["is_estimate"])
        self.quantity(3)
        self.assertEqual(self.savings()["delivery"]["status"], "free")
        self.assertEqual(self.quote().data["delivery_fee"], "0.00")

    def test_search_paginates_and_rejects_unbounded_input(self):
        for i in range(23):
            self.coupon(f"PAGED{i:02}")
        first, second = self.savings(q="paged"), self.savings(q="paged", page=2)
        self.assertEqual(first["count"], 23)
        self.assertEqual(len(first["results"]), 20)
        self.assertEqual(len(second["results"]), 3)
        self.assertFalse({row["id"] for row in first["results"]} & {row["id"] for row in second["results"]})
        self.assertEqual(self.client.get("/api/v1/cart/savings/", {"q": "x"*81}).status_code, 400)

    def test_guest_and_non_customer_cannot_inspect_savings(self):
        for user, code in [(None, 401), (self.owner, 403)]:
            self.client.force_authenticate(user)
            self.assertEqual(self.client.get("/api/v1/cart/savings/").status_code, code)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get("/api/v1/cart/savings/").status_code, 400)
        self.assertFalse(Cart.objects.filter(user=self.other).exists())

    def test_valid_addons_count_towards_threshold_but_unavailable_ones_block(self):
        self.coupon(min_order_amount=250)
        self.item.add_ons = [{"id": "side", "name": "Extra side", "price": "60.00", "is_available": True}]
        self.item.save()
        Cart.objects.get(user=self.customer).items.all().delete()
        response = self.client.post("/api/v1/cart/items/", {"menu_item": self.item.pk, "quantity": 1, "addon_ids": ["side"]}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Decimal(self.savings()["subtotal"]), 260)
        self.assertTrue(self.savings()["results"][0]["eligible"])
        self.item.add_ons[0]["is_available"] = False
        self.item.save()
        self.assertEqual(self.client.get("/api/v1/cart/savings/").status_code, 400)
        self.assertEqual(self.validate("SAVE80").status_code, 400)

    def test_public_savings_do_not_expose_global_or_other_customer_usage(self):
        self.coupon(usage_count=13, usage_limit=100, per_user_limit=2)
        row = self.savings()["results"][0]
        self.assertNotIn("usage_count", row)
        self.assertNotIn("usage_limit", row)
        self.assertNotIn("user_uses", row)
        self.assertEqual(row["per_user_limit"], 2)

    def test_zero_value_food_does_not_advertise_zero_value_coupon_savings(self):
        self.item.price = 0
        self.item.save()
        self.coupon(min_order_amount=0)
        result = self.savings()
        self.assertEqual(result["available_count"], 0)
        self.assertEqual(result["results"][0]["status"], "no_discount")
        self.assertIsNone(result["next_coupon"])
