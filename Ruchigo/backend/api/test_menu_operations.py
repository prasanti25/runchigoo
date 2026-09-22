from decimal import Decimal
from datetime import datetime, timezone as dt_timezone

from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase

from .availability import accepting_orders, validate_hours
from .models import Address, AuditLog, CartItem, MenuItem, Order, OrderItem, Restaurant, User


@override_settings(GEMINI_API_KEY="")
class MenuOperationsTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user("menu-customer@example.test", "Menu-tests-3824")
        self.owner = User.objects.create_user("menu-owner@example.test", "Menu-tests-3824", role="restaurant")
        self.admin = User.objects.create_user("menu-admin@example.test", "Menu-tests-3824", role="admin")
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Options Kitchen", city="Delhi", address="Kitchen", is_approved=True)
        self.item = MenuItem.objects.create(restaurant=self.restaurant, name="Test meal", price=100, is_vegetarian=True, stock_quantity=3)
        self.address = Address.objects.create(user=self.customer, line1="Test address", city="Delhi", state="Delhi", postal_code="110001")
        self.client.force_authenticate(self.customer)
        self.groups = [{"id": "size", "name": "Choose a size", "min_select": 1, "max_select": 1}]
        self.options = [{"id": "regular", "group_id": "size", "name": "Regular", "price": "0.00", "is_available": True}, {"id": "large", "group_id": "size", "name": "Large", "price": "50.00", "is_available": True}, {"id": "raita", "name": "Raita", "price": "20.00", "is_available": True}]

    def configure(self):
        self.item.option_groups = self.groups
        self.item.add_ons = self.options
        self.item.save()

    def add(self, quantity=1, choices=None):
        return self.client.post("/api/v1/cart/items/", {"menu_item": self.item.pk, "quantity": quantity, "addon_ids": choices or []}, format="json")

    def checkout(self, key=None):
        data = {"address_id": self.address.pk, "payment_method": "cod"}
        if key:
            data["checkout_key"] = key
        return self.client.post("/api/v1/cart/checkout/", data, format="json")

    def test_required_size_and_maximum_are_enforced_server_side(self):
        self.configure()
        self.assertEqual(self.add().status_code, 400)
        self.assertEqual(self.add(choices=["regular", "large"]).status_code, 400)
        response = self.add(choices=["large", "raita"])
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Decimal(response.data["items"][0]["unit_price"]), 170)
        order = self.checkout()
        self.assertEqual(order.status_code, 201)
        self.assertEqual(Decimal(order.data["subtotal"]), 170)
        self.assertEqual([row["name"] for row in order.data["items"][0]["add_ons"]], ["Large", "Raita"])

    def test_group_validation_and_dangling_options(self):
        self.client.force_authenticate(self.owner)
        invalids = [
            {"option_groups": self.groups, "add_ons": []},
            {"option_groups": [{**self.groups[0], "min_select": 2, "max_select": 1}]},
            {"add_ons": self.options, "option_groups": []},
            {"option_groups": self.groups*2, "add_ons": self.options},
        ]
        for body in invalids:
            self.assertEqual(self.client.patch(f"/api/v1/menu-items/{self.item.pk}/", body, format="json").status_code, 400)
        self.assertEqual(self.client.patch(f"/api/v1/menu-items/{self.item.pk}/", {"option_groups": self.groups, "add_ons": self.options}, format="json").status_code, 200)

    def test_group_changed_after_cart_blocks_checkout_without_deducting_stock(self):
        self.add()
        self.configure()
        self.assertEqual(self.checkout().status_code, 400)
        self.item.refresh_from_db()
        self.assertEqual(self.item.stock_quantity, 3)
        self.assertFalse(Order.objects.exists())

    def test_unavailable_required_option_is_not_recommended(self):
        self.configure()
        self.item.add_ons = [{**row, "is_available": False} for row in self.options]
        self.item.save()
        self.assertEqual(self.client.get("/api/v1/discovery/").data["items"], [])
        self.assertFalse(self.client.get(f"/api/v1/menu-items/{self.item.pk}/").data["orderable"])

    def test_recommendation_budget_and_from_price_include_required_options(self):
        self.configure()
        self.item.add_ons = [self.options[1]]
        self.item.save()
        response = self.client.post("/api/v1/discovery/recommendations/", {"budget": 120}, format="json")
        self.assertEqual(response.data["items"], [])
        response = self.client.get("/api/v1/discovery/?budget=150")
        self.assertEqual(Decimal(response.data["restaurants"][0]["from_price"]), 150)
        self.assertEqual(Decimal(response.data["items"][0]["minimum_price"]), 150)

    def test_stock_is_shared_across_cart_configurations(self):
        self.configure()
        self.assertEqual(self.add(2, ["regular"]).status_code, 201)
        self.assertEqual(self.add(2, ["large"]).status_code, 400)
        response = self.add(1, ["large"])
        self.assertEqual(response.status_code, 201)
        second = next(item for item in response.data["items"] if item["add_ons"][0]["id"] == "large")
        self.assertEqual(self.client.patch(f"/api/v1/cart/items/{second['id']}/", {"quantity": 2}, format="json").status_code, 400)

    def test_checkout_deducts_stock_once_and_cancellation_restores_once(self):
        import uuid
        self.add(2)
        key = str(uuid.uuid4())
        first = self.checkout(key)
        self.assertEqual(first.status_code, 201)
        self.assertEqual(self.checkout(key).data["id"], first.data["id"])
        self.item.refresh_from_db()
        self.assertEqual(self.item.stock_quantity, 1)
        self.assertEqual(self.client.post(f"/api/v1/orders/{first.data['id']}/cancel/").status_code, 200)
        self.item.refresh_from_db()
        self.assertEqual(self.item.stock_quantity, 3)
        self.client.post(f"/api/v1/orders/{first.data['id']}/cancel/")
        self.item.refresh_from_db()
        self.assertEqual(self.item.stock_quantity, 3)
        self.assertFalse(OrderItem.objects.get(order_id=first.data["id"]).stock_deducted)

    def test_stock_change_after_cart_does_not_oversell(self):
        self.add(3)
        MenuItem.objects.filter(pk=self.item.pk).update(stock_quantity=1)
        self.assertEqual(self.checkout().status_code, 400)
        self.assertFalse(Order.objects.exists())
        self.assertEqual(CartItem.objects.get().quantity, 3)

    def test_cancellation_after_preparation_does_not_restock_consumed_food(self):
        self.add()
        order = self.checkout().data
        self.client.force_authenticate(self.owner)
        for status in ["confirmed", "preparing", "cancelled"]:
            self.assertEqual(self.client.post(f"/api/v1/orders/{order['id']}/status/", {"status": status}).status_code, 200)
        self.item.refresh_from_db()
        self.assertEqual(self.item.stock_quantity, 2)

    def test_sold_out_discovery_and_stock_audit(self):
        self.client.force_authenticate(self.owner)
        response = self.client.patch(f"/api/v1/menu-items/{self.item.pk}/", {"stock_quantity": 0}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(AuditLog.objects.filter(action="inventory.stock_set", target=str(self.item.pk)).exists())
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get("/api/v1/discovery/").data["items"], [])
        self.assertEqual(self.add().status_code, 400)

    def test_untracked_stock_stays_untracked(self):
        self.item.stock_quantity = None
        self.item.save()
        self.add(99)
        self.assertEqual(self.checkout().status_code, 201)
        self.item.refresh_from_db()
        self.assertIsNone(self.item.stock_quantity)

    def test_admin_cannot_reopen_restocked_cancelled_order(self):
        self.add()
        order = self.checkout().data
        self.client.post(f"/api/v1/orders/{order['id']}/cancel/")
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order['id']}/status/", {"status": "confirmed"}).status_code, 403)

    def test_weekly_hours_validate_and_manual_pause_wins(self):
        hours = [{"closed": False, "open": "09:00", "close": "22:00"} for _ in range(7)]
        self.restaurant.opening_hours = validate_hours(hours)
        self.assertTrue(accepting_orders(self.restaurant, datetime(2026, 9, 22, 5, 0, tzinfo=dt_timezone.utc)))
        self.assertFalse(accepting_orders(self.restaurant, datetime(2026, 9, 22, 20, 0, tzinfo=dt_timezone.utc)))
        self.restaurant.is_open = False
        self.assertFalse(accepting_orders(self.restaurant, datetime(2026, 9, 22, 5, 0, tzinfo=dt_timezone.utc)))
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.patch(f"/api/v1/restaurants/{self.restaurant.pk}/", {"opening_hours": hours[:6]}, format="json").status_code, 400)
        hours[0]["close"] = "08:00"
        self.assertEqual(self.client.patch(f"/api/v1/restaurants/{self.restaurant.pk}/", {"opening_hours": hours}, format="json").status_code, 400)

    def test_closed_hours_filter_discovery_cart_and_checkout(self):
        self.add()
        self.restaurant.opening_hours = [{"closed": True} for _ in range(7)]
        self.restaurant.save()
        self.assertEqual(self.client.get("/api/v1/discovery/").data["items"], [])
        self.assertEqual(self.add().status_code, 400)
        self.assertEqual(self.checkout().status_code, 400)
        self.assertFalse(self.client.get(f"/api/v1/restaurants/{self.restaurant.pk}/").data["accepting_orders"])

    def test_open_hours_discovery_and_checkout_agree(self):
        self.restaurant.opening_hours = [{"closed": False, "open": "00:00", "close": "24:00"} for _ in range(7)]
        self.restaurant.save()
        self.assertEqual(len(self.client.get("/api/v1/discovery/").data["items"]), 1)
        self.assertEqual(self.add().status_code, 201)
        self.assertEqual(self.checkout().status_code, 201)
