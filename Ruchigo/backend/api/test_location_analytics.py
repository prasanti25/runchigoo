from datetime import timedelta
from decimal import Decimal
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import AdminAccessGrant, Address, DeliveryPolicy, DeliveryZone, MenuItem, Order, OrderItem, Payment, RefundRequest, Restaurant, SavedRestaurant, SupportTicket, User, Wishlist
from .insights import operational_report
from .serviceability import delivery_quote


@override_settings(GEMINI_API_KEY="")
class LocationDiscoveryTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = User.objects.create_user("geo-customer@example.test")
        cls.kitchens = []
        for index, (lat, city) in enumerate([(28.600, "Delhi"), (28.630, "Delhi"), (29.000, "Delhi"), (None, "Delhi"), (28.600, "Noida")]):
            owner = User.objects.create_user(f"geo-owner-{index}@example.test", role="restaurant")
            kitchen = Restaurant.objects.create(owner=owner, name=f"Geo kitchen {index}", city=city, address="Test", is_approved=True, latitude=lat, longitude=77.2 if lat else None)
            MenuItem.objects.create(restaurant=kitchen, name="Test pizza", price=200, is_vegetarian=True)
            cls.kitchens.append(kitchen)
        cls.address = Address.objects.create(user=cls.customer, line1="Test", city="South Delhi", state="Delhi", postal_code="110001", latitude=28.60, longitude=77.2)

    def query(self, **changes):
        return {"city": "South Delhi", "latitude": 28.60, "longitude": 77.2, "radius_km": 5, "sort": "distance", "delivery_only": True, **changes}

    def ids(self, **changes):
        response = self.client.get("/api/v1/discovery/", self.query(**changes))
        self.assertEqual(response.status_code, 200, response.data)
        return [row["id"] for row in response.data["restaurants"]]

    def test_default_local_candidates_exclude_other_city_far_and_unmapped(self):
        self.assertEqual(self.ids(), [row.pk for row in self.kitchens[:2]])
        self.assertEqual(self.ids(radius_km=2), [self.kitchens[0].pk])

    def test_active_zones_agree_with_checkout_and_allow_multiple_service_areas(self):
        DeliveryPolicy.objects.update_or_create(pk=1, defaults={"enabled": True})
        zone = DeliveryZone.objects.create(name="Test near", city="Delhi", is_active=True, latitude=28.60, longitude=77.2, radius_km=1, max_delivery_km=2, base_fee=20)
        self.assertEqual(self.ids(), [self.kitchens[0].pk])
        delivery_quote(self.kitchens[0], self.address, Decimal(500))
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            delivery_quote(self.kitchens[1], self.address, Decimal(500))
        zone.max_delivery_km = 5; zone.save()
        self.assertEqual(len(self.ids()), 2)
        zone.is_active = False; zone.save()
        self.assertEqual(self.ids(), [])
        DeliveryZone.objects.create(name="Test second area", city="South Delhi", is_active=True, latitude=28.60, longitude=77.2, radius_km=2, max_delivery_km=4, base_fee=30)
        self.assertEqual(len(self.ids()), 2)

    def test_customer_outside_zone_gets_no_delivery_candidates(self):
        DeliveryPolicy.objects.update_or_create(pk=1, defaults={"enabled": True})
        DeliveryZone.objects.create(name="Other area", city="Delhi", is_active=True, latitude=28.8, longitude=77.2, radius_km=1, max_delivery_km=50, base_fee=20)
        self.assertEqual(self.ids(), [])

    def test_single_dish_price_does_not_hide_valid_basket_minimum(self):
        DeliveryPolicy.objects.update_or_create(pk=1, defaults={"enabled": True})
        DeliveryZone.objects.create(name="Minimum", city="Delhi", is_active=True, latitude=28.6, longitude=77.2, radius_km=5, max_delivery_km=5, minimum_order=500, base_fee=20)
        self.assertEqual(len(self.ids()), 2)

    def test_feed_and_recommendation_candidates_share_zone_filter(self):
        DeliveryPolicy.objects.update_or_create(pk=1, defaults={"enabled": True})
        DeliveryZone.objects.create(name="One kitchen", city="Delhi", is_active=True, latitude=28.6, longitude=77.2, radius_km=5, max_delivery_km=2, base_fee=20)
        result = self.client.get("/api/v1/intelligence/feed/", self.query())
        self.assertEqual([row["id"] for row in result.data["restaurants"]], [self.kitchens[0].pk])
        result = self.client.post("/api/v1/discovery/recommendations/", self.query(q="pizza"), format="json")
        self.assertEqual(result.status_code, 200, result.data)
        self.assertEqual(result.data["candidate_count"], 1)

    def test_other_city_suggestion_does_not_crash_with_delivery_only(self):
        from .assistant_matches import empty_shortlist
        result = empty_shortlist(self.query(q="pizza", city="Mumbai"))
        self.assertEqual(result["no_match_reason"], "city")

    def test_delivery_filter_requires_pin_and_city(self):
        for data in [{"delivery_only": True}, {"delivery_only": True, "latitude": 0, "longitude": 0}, self.query(latitude="NaN")]:
            self.assertEqual(self.client.get("/api/v1/discovery/", data).status_code, 400)


class ShoppingAnalyticsTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = User.objects.create_user("analytics-customer@example.test")
        cls.other = User.objects.create_user("analytics-other@example.test")
        cls.owner = User.objects.create_user("analytics-owner@example.test", role="restaurant")
        cls.restaurant = Restaurant.objects.create(owner=cls.owner, name="Analytics kitchen", city="Delhi", is_approved=True)
        cls.item = MenuItem.objects.create(restaurant=cls.restaurant, name="Analytics meal", price=100)

    def order(self, customer=None, status="delivered", paid=True, days_ago=0, amount=140):
        customer = customer or self.customer
        address, _ = Address.objects.get_or_create(user=customer, defaults={"line1": "Test", "city": "Delhi", "state": "Delhi", "postal_code": "110001"})
        order = Order.objects.create(customer=customer, delivery_address=address, restaurant=self.restaurant, status=status, subtotal=100, delivery_fee=40, total=amount)
        Order.objects.filter(pk=order.pk).update(created_at=timezone.now()-timedelta(days=days_ago))
        OrderItem.objects.create(order=order, menu_item=self.item, name=self.item.name, quantity=1, unit_price=100, total_price=100)
        Payment.objects.create(order=order, amount=amount, status="paid" if paid else "pending")
        return order

    def report(self, **params):
        self.client.force_authenticate(self.customer)
        return self.client.get("/api/v1/customer-insights/", params)

    def test_collected_spending_excludes_unpaid_and_deducts_only_processed_refunds(self):
        first = self.order()
        self.order(status="cancelled", paid=False)
        self.order(customer=self.other, amount=999)
        ticket = SupportTicket.objects.create(user=self.customer, order=first, subject="Test refund")
        refund = RefundRequest.objects.create(ticket=ticket, order=first, requested_amount=40, approved_amount=40, status="requested")
        self.assertEqual(Decimal(self.report().data["lifetime"]["spending"]["net"]), 140)
        refund.status="processed"; refund.save()
        data = self.report().data
        self.assertEqual(Decimal(data["lifetime"]["spending"]["net"]), 100)
        self.assertEqual(data["lifetime"]["orders"], 2)
        self.assertEqual(data["most_ordered"][0]["quantity"], 1)

    def test_empty_account_zero_states_not_fake_loyalty(self):
        data = self.report().data
        self.assertEqual(data["lifetime"]["orders"], 0)
        self.assertEqual(len(data["monthly"]), 12)
        self.assertFalse(data["loyalty"]["enabled"])
        self.assertEqual(data["loyalty"]["points"], 0)
        self.assertEqual(Decimal(data["loyalty"]["credits"]), 0)
        self.assertEqual(data["saved_food"], [])

    def test_favourites_are_owned_and_months_include_zeroes(self):
        SavedRestaurant.objects.create(user=self.customer, restaurant=self.restaurant)
        Wishlist.objects.create(user=self.other, menu_item=self.item)
        self.order(days_ago=35)
        data = self.report().data
        self.assertEqual(len(data["saved_restaurants"]), 1)
        self.assertEqual(data["saved_food"], [])
        self.assertEqual(sum(month["orders"] for month in data["monthly"]), 1)

    def test_legacy_full_refund_has_zero_net_spend(self):
        order = self.order()
        Payment.objects.filter(order=order).update(status="refunded")
        self.assertEqual(Decimal(self.report().data["lifetime"]["spending"]["net"]), 0)

    def test_auth_and_range_validation(self):
        self.assertEqual(self.client.get("/api/v1/customer-insights/").status_code, 401)
        self.assertEqual(self.report(start="2020-01-01").status_code, 400)
        self.assertEqual(self.report(start="2020-01-01", end="2020-12-31").status_code, 400)

    def test_admin_shopper_does_not_receive_everyones_spending(self):
        self.order()
        admin = User.objects.create_user("analytics-admin@example.test", role="admin")
        AdminAccessGrant.objects.create(user=admin, full_access=False, scopes=[])
        self.client.force_authenticate(admin)
        result = self.client.get("/api/v1/customer-insights/")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.data["lifetime"]["orders"], 0)

    def test_retention_uses_previous_period_cohort_and_finance_is_scoped(self):
        self.order(days_ago=10)
        self.order(days_ago=2)
        self.order(customer=self.other, days_ago=10)
        today = timezone.localdate()
        report = operational_report(Order.objects.all(), today, today-timedelta(days=7), today-timedelta(days=1))
        self.assertEqual(report["summary"]["retention_rate"], 50)
        self.assertEqual(Decimal(report["financials"]["paid"]), 140)
        self.assertEqual(Decimal(report["financials"]["gross_collected_delivery_fees"]), 40)
        self.assertIsNone(report["financials"]["commission"])
