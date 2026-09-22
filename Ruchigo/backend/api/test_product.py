import hashlib
import hmac
import io
import json
import uuid
from decimal import Decimal
from unittest.mock import patch
from django.test import override_settings
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import Address, AuditLog, Cart, CartItem, Category, Coupon, DeliveryAssignment, MenuItem, Notification, Offer, Order, OrderEvent, OrderItem, Payment, Restaurant, Review, SupportTicket, User


class ProductFlowTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user("product-customer@example.com", "LongProductPass123", role="customer")
        self.owner = User.objects.create_user("product-owner@example.com", "LongProductPass123", role="restaurant")
        self.courier = User.objects.create_user("product-courier@example.com", "LongProductPass123", role="delivery")
        self.other = User.objects.create_user("other-product@example.com", "LongProductPass123")
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Product Kitchen", address="Main Street", city="Delhi", phone="1234567890", is_approved=True)
        self.category = Category.objects.create(name="Meals", slug="meals")
        self.item = MenuItem.objects.create(restaurant=self.restaurant, category=self.category, name="Veg thali", price=Decimal("249"), is_vegetarian=True)
        self.address = Address.objects.create(user=self.customer, line1="Home", city="Delhi", state="Delhi", postal_code="110001")
        self.client.force_authenticate(self.customer)

    def checkout(self, **extra):
        self.client.post("/api/v1/cart/items/", {"menu_item": self.item.id, "quantity": 1}, format="json")
        return self.client.post("/api/v1/cart/checkout/", {"address_id": self.address.id, "payment_method": "cod", **extra}, format="json")

    def test_checkout_is_idempotent_and_snapshots_delivery_address(self):
        key = str(uuid.uuid4())
        first = self.checkout(checkout_key=key)
        second = self.client.post("/api/v1/cart/checkout/", {"address_id": self.address.id, "checkout_key": key}, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(first.data["id"], second.data["id"])
        self.assertEqual(Order.objects.count(), 1)
        self.address.line1 = "Changed later"
        self.address.save()
        response = self.client.get(f"/api/v1/orders/{first.data['id']}/")
        self.assertEqual(response.data["delivery_address_detail"]["line1"], "Home")
        self.assertEqual(len(response.data["delivery_code"]), 6)
        self.assertEqual(len(response.data["events"]), 1)

    def test_pickup_is_separate_owned_and_idempotent(self):
        order = Order.objects.get(pk=self.checkout().data["id"])
        order.status = Order.Status.READY
        order.save()
        self.client.force_authenticate(self.courier)
        response = self.client.post(f"/api/v1/orders/{order.id}/accept/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "assigned")
        self.assertIsNone(DeliveryAssignment.objects.get(order=order).pickup_at)
        self.assertEqual(self.client.get("/api/v1/orders/?active=true").data["count"], 1)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.id}/status/", {"status": "delivered", "delivery_code": order.delivery_code}).status_code, 403)
        other_courier = User.objects.create_user("second-courier@example.com", "LongProductPass123", role="delivery")
        self.client.force_authenticate(other_courier)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.id}/pickup/").status_code, 404)
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.id}/pickup/").status_code, 403)
        self.client.force_authenticate(self.courier)
        for _ in range(2):
            self.assertEqual(self.client.post(f"/api/v1/orders/{order.id}/pickup/").status_code, 200)
        self.assertEqual(OrderEvent.objects.filter(order=order, status="out_for_delivery").count(), 1)
        self.assertIsNotNone(DeliveryAssignment.objects.get(order=order).pickup_at)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.id}/status/", {"status": "delivered", "delivery_code": order.delivery_code}).status_code, 200)
        self.assertEqual(self.client.get("/api/v1/orders/?active=true").data["count"], 0)

    def coupon(self, **extra):
        return Coupon.objects.create(code="NEWMEAL", discount_percent=50, starts_at=timezone.now()-timezone.timedelta(hours=1), ends_at=timezone.now()+timezone.timedelta(days=1), **extra)

    def test_restaurant_coupon_and_maximum_saving(self):
        coupon = self.coupon(restaurant=self.restaurant, max_discount=30)
        response = self.checkout(coupon_code=coupon.code)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["discount"], "30.00")
        other_owner = User.objects.create_user("coupon-kitchen@example.com", "LongProductPass123", role="restaurant")
        other_restaurant = Restaurant.objects.create(owner=other_owner, name="Other", address="Elsewhere", city="Delhi")
        coupon.restaurant = other_restaurant
        coupon.save()
        self.assertEqual(self.checkout(coupon_code=coupon.code).status_code, 400)

    def test_first_order_coupon_is_not_reusable(self):
        coupon = self.coupon(first_order_only=True)
        self.assertEqual(self.checkout(coupon_code=coupon.code).status_code, 201)
        self.assertEqual(self.checkout(coupon_code=coupon.code).status_code, 400)
        self.assertEqual(self.client.get("/api/v1/coupons/available/").data["count"], 0)

    def test_per_customer_coupon_limit_and_available_feed(self):
        coupon = self.coupon(per_user_limit=1)
        self.assertEqual(self.checkout(coupon_code=coupon.code).status_code, 201)
        self.assertEqual(self.checkout(coupon_code=coupon.code).status_code, 400)
        self.assertEqual(self.client.get("/api/v1/coupons/available/").data["count"], 0)
        self.client.force_authenticate(self.other)
        response = self.client.get("/api/v1/coupons/available/")
        self.assertEqual(response.data["count"], 1)
        self.assertNotIn("usage_count", response.data["results"][0])
        self.assertEqual(self.client.get("/api/v1/coupons/").status_code, 403)

    def test_coupon_feed_excludes_expired_exhausted_and_blocked_kitchens(self):
        coupon = self.coupon(usage_limit=1, usage_count=1)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/v1/coupons/available/").data["count"], 0)
        coupon.usage_count = 0
        coupon.ends_at = timezone.now()-timezone.timedelta(minutes=1)
        coupon.save()
        self.assertEqual(self.client.get("/api/v1/coupons/available/").data["count"], 0)
        coupon.ends_at = timezone.now()+timezone.timedelta(days=1)
        coupon.restaurant = self.restaurant
        coupon.save()
        self.owner.is_active = False
        self.owner.save()
        self.assertEqual(self.client.get("/api/v1/coupons/available/").data["count"], 0)

    def test_review_moderation_is_admin_only_and_audited(self):
        order = Order.objects.get(pk=self.checkout().data["id"])
        order.status = Order.Status.DELIVERED
        order.save()
        response = self.client.post("/api/v1/reviews/", {"order": order.id, "rating": 5, "comment": "Great"})
        review_id = response.data["id"]
        path = f"/api/v1/review-moderation/{review_id}/visibility/"
        self.assertEqual(self.client.get("/api/v1/audit-logs/").status_code, 403)
        self.assertEqual(self.client.post(path, {"is_visible": False, "reason": "Test"}).status_code, 403)
        admin = User.objects.create_user("moderation-admin@example.com", "LongProductPass123", role="admin")
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.post(path, {"is_visible": False}).status_code, 400)
        for _ in range(2):
            self.assertEqual(self.client.post(path, {"is_visible": False, "reason": "Contains private information"}).status_code, 200)
        self.assertEqual(AuditLog.objects.filter(action="review.hidden").count(), 1)
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.average_rating, 0)
        log = self.client.get("/api/v1/audit-logs/?search=review.hidden").data["results"][0]
        self.assertEqual(log["metadata"]["reason"], "Contains private information")
        self.assertEqual(self.client.delete(f"/api/v1/audit-logs/{log['id']}/").status_code, 405)
        self.client.force_authenticate(self.customer)
        self.client.patch(f"/api/v1/reviews/{review_id}/", {"is_visible": True, "comment": "Edited"})
        self.assertFalse(Review.objects.get(pk=review_id).is_visible)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(f"/api/v1/restaurant-reviews/?restaurant={self.restaurant.id}").data["results"], [])
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.post(path, {"is_visible": True, "reason": "Rechecked"}).status_code, 200)
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.average_rating, 5)

    def test_review_moderation_preserves_other_customers_identical_comments(self):
        first_order = Order.objects.get(pk=self.checkout().data["id"])
        first_order.status = Order.Status.DELIVERED
        first_order.save()
        first = self.client.post("/api/v1/reviews/", {"order": first_order.id, "rating": 5, "comment": "Fresh food and a smooth delivery."}).data
        second_order = Order.objects.get(pk=self.checkout().data["id"])
        second_order.status = Order.Status.DELIVERED
        second_order.customer = self.other
        second_order.save()
        self.client.force_authenticate(self.other)
        second = self.client.post("/api/v1/reviews/", {"order": second_order.id, "rating": 4, "comment": first["comment"]}).data
        admin = User.objects.create_user("review-cleanup-admin@example.com", "LongProductPass123", role="admin")
        self.client.force_authenticate(admin)
        response = self.client.post(f"/api/v1/review-moderation/{first['id']}/visibility/", {"is_visible": False, "reason": "Archive confirmed test review"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Review.objects.count(), 2)
        self.assertTrue(Review.objects.get(pk=second["id"]).is_visible)
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.average_rating, 4)
        self.client.force_authenticate(None)
        public = self.client.get(f"/api/v1/restaurant-reviews/?restaurant={self.restaurant.id}").data["results"]
        self.assertEqual([r["id"] for r in public], [second["id"]])

    def test_deleting_temporary_review_preserves_other_reviews_and_rating(self):
        review_ids = []
        for rating in (4, 5):
            order = Order.objects.get(pk=self.checkout().data["id"])
            order.status = Order.Status.DELIVERED
            order.save()
            response = self.client.post("/api/v1/reviews/", {"order": order.id, "rating": rating, "comment": "Test"})
            self.assertEqual(response.status_code, 201)
            review_ids.append(response.data["id"])
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.delete(f"/api/v1/reviews/{review_ids[1]}/").status_code, 404)
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.delete(f"/api/v1/reviews/{review_ids[1]}/").status_code, 204)
        self.assertEqual(list(Review.objects.values_list("id", flat=True)), [review_ids[0]])
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.average_rating, 4)

    def test_restaurant_cannot_self_approve(self):
        self.restaurant.is_approved = False
        self.restaurant.save()
        self.client.force_authenticate(self.owner)
        response = self.client.post(f"/api/v1/restaurants/{self.restaurant.id}/approve/")
        self.assertEqual(response.status_code, 403)
        self.restaurant.refresh_from_db()
        self.assertFalse(self.restaurant.is_approved)
        admin = User.objects.create_user("product-admin@example.com", "LongProductPass123", role="admin")
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.post(f"/api/v1/restaurants/{self.restaurant.id}/approve/").status_code, 200)

    def test_order_summary_is_scoped_to_current_account(self):
        self.checkout()
        summary = self.client.get("/api/v1/orders/summary/")
        self.assertEqual(summary.data["total"], 1)
        self.assertEqual(summary.data["by_status"][0]["count"], 1)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get("/api/v1/orders/summary/").data["total"], 0)

    def test_blocked_restaurant_cannot_receive_checkout(self):
        self.owner.is_active = False
        self.owner.save()
        self.assertEqual(self.checkout().status_code, 400)

    def test_cancel_is_owned_and_only_before_acceptance(self):
        order_id = self.checkout().data["id"]
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order_id}/cancel/").status_code, 404)
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order_id}/cancel/").status_code, 200)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order_id}/cancel/").status_code, 400)

    def test_reorder_uses_current_prices_and_does_not_replace_cart(self):
        order_id = self.checkout().data["id"]
        self.item.price = Decimal("300")
        self.item.save()
        response = self.client.post(f"/api/v1/orders/{order_id}/reorder/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["items"][0]["menu_item_detail"]["price"], "300.00")
        self.assertEqual(self.client.post(f"/api/v1/orders/{order_id}/reorder/").status_code, 400)

    def test_delivery_requires_code_and_never_exposes_it_to_courier(self):
        order = Order.objects.get(pk=self.checkout().data["id"])
        order.status = Order.Status.OUT
        order.save()
        DeliveryAssignment.objects.create(order=order, partner=self.courier)
        self.client.force_authenticate(self.courier)
        self.assertIsNone(self.client.get(f"/api/v1/orders/{order.id}/").data["delivery_code"])
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.id}/status/", {"status": "delivered", "delivery_code": "wrong"}).status_code, 400)
        response = self.client.post(f"/api/v1/orders/{order.id}/status/", {"status": "delivered", "delivery_code": order.delivery_code})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Payment.objects.get(order=order).status, Payment.Status.PAID)
        self.assertTrue(AuditLog.objects.filter(action="order.delivered").exists())

    def test_offline_courier_cannot_accept_and_coordinates_are_validated(self):
        order = Order.objects.get(pk=self.checkout().data["id"])
        order.status = Order.Status.READY
        order.save()
        self.courier.is_available = False
        self.courier.save()
        self.client.force_authenticate(self.courier)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.id}/accept/").status_code, 400)
        assignment = DeliveryAssignment.objects.create(order=order, partner=self.courier)
        self.assertEqual(self.client.patch(f"/api/v1/deliveries/{assignment.id}/", {"current_latitude": 1000}).status_code, 400)

    def test_support_messages_are_owned_and_replies_reopen_ticket(self):
        response = self.client.post("/api/v1/support/", {"subject": "Need help", "category": "account", "message": "Please help me update my profile."}, format="json")
        self.assertEqual(response.status_code, 201)
        ticket_id = response.data["id"]
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f"/api/v1/support/{ticket_id}/").status_code, 404)
        self.assertEqual(self.client.post(f"/api/v1/support/{ticket_id}/reply/", {"message": "Read this"}).status_code, 404)
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.post(f"/api/v1/support/{ticket_id}/resolve/").status_code, 200)
        response = self.client.post(f"/api/v1/support/{ticket_id}/reply/", {"message": "Still need help"})
        self.assertEqual(response.data["status"], "open")
        self.assertEqual(len(response.data["messages"]), 2)

    def test_support_cannot_reference_someone_elses_order(self):
        order_id = self.checkout().data["id"]
        self.client.force_authenticate(self.other)
        response = self.client.post("/api/v1/support/", {"order": order_id, "subject": "Wrong order", "category": "refund", "message": "Test"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(SupportTicket.objects.count(), 0)

    def test_privacy_request_is_a_ticket_not_automatic_deletion(self):
        response = self.client.post("/api/v1/support/", {"subject": "Delete my data", "category": "privacy", "message": "Please explain deletion of my account data."}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["category"], "privacy")
        self.assertTrue(User.objects.filter(pk=self.customer.pk).exists())
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f"/api/v1/support/{response.data['id']}/").status_code, 404)

    def test_partner_order_contact_omits_account_fields(self):
        order_id = self.checkout().data["id"]
        self.client.force_authenticate(self.owner)
        contact = self.client.get(f"/api/v1/orders/{order_id}/").data["customer_detail"]
        self.assertEqual(set(contact), {"first_name", "last_name", "phone"})
        self.assertNotIn("email", contact)

    @override_settings(GEMINI_API_KEY="")
    def test_recommendations_respect_budget_diet_and_city_without_ai(self):
        MenuItem.objects.create(restaurant=self.restaurant, name="Chicken", price=100, is_vegetarian=False)
        response = self.client.post("/api/v1/discovery/recommendations/", {"vegetarian": True, "budget": 250, "city": "Delhi"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["source"], "curated")
        self.assertEqual([i["id"] for i in response.data["items"]], [self.item.id])
        response = self.client.post("/api/v1/discovery/recommendations/", {"city": "Mumbai"}, format="json")
        self.assertEqual(response.data["items"], [])

    @override_settings(GEMINI_API_KEY="")
    def test_cravings_change_results_and_text_constraints_are_enforced(self):
        pizza = MenuItem.objects.create(restaurant=self.restaurant, category=self.category, name="Veg pizza", price=199, is_vegetarian=True)
        coffee = MenuItem.objects.create(restaurant=self.restaurant, category=self.category, name="Cold coffee", price=99, is_vegetarian=True)
        MenuItem.objects.create(restaurant=self.restaurant, name="Chicken pizza", price=150, is_vegetarian=False)
        MenuItem.objects.create(restaurant=self.restaurant, name="Unavailable pizza", price=100, is_available=False)
        first = self.client.post("/api/v1/discovery/recommendations/", {"q": "veg pizza under 200"}, format="json")
        self.assertEqual(first.status_code, 200)
        self.assertEqual([item["id"] for item in first.data["items"]], [pizza.id])
        self.assertEqual(first.data["status"], "not_configured")
        second = self.client.post("/api/v1/discovery/recommendations/", {"q": "Coffee", "budget": 150}, format="json")
        self.assertEqual([item["id"] for item in second.data["items"]], [coffee.id])
        self.assertIn("coffee", second.data["items"][0]["reason"])
        empty = self.client.post("/api/v1/discovery/recommendations/", {"q": "pizza", "budget": 50}, format="json")
        self.assertEqual(empty.data["items"], [])
        excluded = self.client.post("/api/v1/discovery/recommendations/", {"q": "no coffee"}, format="json")
        self.assertNotIn(coffee.id, [item["id"] for item in excluded.data["items"]])

    @override_settings(GEMINI_API_KEY="")
    def test_recommendations_exclude_closed_and_blocked_restaurants(self):
        for field in ("is_open", "is_approved"):
            setattr(self.restaurant, field, False)
            self.restaurant.save()
            self.assertEqual(self.client.post("/api/v1/discovery/recommendations/", {}, format="json").data["items"], [])
            setattr(self.restaurant, field, True)
        self.restaurant.save()
        self.owner.is_active = False
        self.owner.save()
        self.assertEqual(self.client.post("/api/v1/discovery/recommendations/", {}, format="json").data["items"], [])

    @override_settings(GEMINI_API_KEY="test-only")
    @patch("api.recommendations.urlopen")
    def test_gemini_cannot_supply_unverified_claims_or_boolean_ids(self, provider):
        generated = {"intent": "clear", "items": [None, {"id": True}, {"id": self.item.id, "reason": "Guaranteed allergy-safe, free delivery in 2 minutes"}]}
        provider.return_value = io.BytesIO(json.dumps({"candidates": [{"content": {"parts": [{"text": json.dumps(generated)}]}}]}).encode())
        result = self.client.post("/api/v1/discovery/recommendations/", {"vegetarian": True, "budget": 250}, format="json")
        self.assertEqual(result.data["source"], "gemini")
        self.assertEqual(len(result.data["items"]), 1)
        self.assertNotIn("allergy-safe", result.data["items"][0]["reason"])
        self.assertIn("Vegetarian", result.data["items"][0]["match_reasons"])

    @override_settings(IPINFO_TOKEN="test-ip-only", IPINFO_TRUSTED_PROXY_CIDRS=[], DEBUG=False)
    @patch("api.location.urlopen")
    def test_ipinfo_city_is_approximate_cached_and_does_not_expose_secrets(self, provider):
        provider.return_value = io.BytesIO(json.dumps({"ip": "8.8.8.8", "city": "New Delhi", "region": "Delhi", "country": "IN", "loc": "28.6,77.2"}).encode())
        response = self.client.get("/api/v1/location/approximate/", REMOTE_ADDR="8.8.8.8", HTTP_X_FORWARDED_FOR="1.1.1.1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["service_city"], "Delhi")
        self.assertEqual(response.data["accuracy"], "approximate")
        self.assertNotIn("ip", response.data)
        self.assertNotIn("loc", response.data)
        self.assertNotIn("test-ip-only", json.dumps(response.data))
        self.assertEqual(provider.call_args.args[0].full_url, "https://ipinfo.io/8.8.8.8/json")
        self.client.get("/api/v1/location/approximate/", REMOTE_ADDR="8.8.8.8")
        self.assertEqual(provider.call_count, 1)

    @override_settings(IPINFO_TOKEN="test-ip-only", IPINFO_TRUSTED_PROXY_CIDRS=[], DEBUG=False)
    @patch("api.location.urlopen", side_effect=TimeoutError)
    def test_ipinfo_failure_and_private_address_keep_manual_location_available(self, provider):
        self.assertEqual(self.client.get("/api/v1/location/approximate/", REMOTE_ADDR="127.0.0.1").status_code, 400)
        provider.assert_not_called()
        self.assertEqual(self.client.get("/api/v1/location/approximate/", REMOTE_ADDR="8.8.8.8").status_code, 503)

    @override_settings(IPINFO_TOKEN="test-ip-only", IPINFO_TRUSTED_PROXY_CIDRS=["10.0.0.0/8"], DEBUG=False)
    @patch("api.location.urlopen")
    def test_ipinfo_trusted_proxy_walks_from_right_not_spoofed_first_address(self, provider):
        provider.return_value = io.BytesIO(json.dumps({"city": "Mumbai", "country": "IN"}).encode())
        response = self.client.get("/api/v1/location/approximate/", REMOTE_ADDR="10.0.0.2", HTTP_X_FORWARDED_FOR="1.1.1.1, 8.8.8.8, 10.0.0.1")
        self.assertEqual(provider.call_args.args[0].full_url, "https://ipinfo.io/8.8.8.8/json")
        self.assertIsNone(response.data["service_city"])

    def test_discovery_filters_on_server_and_rejects_invalid_budget(self):
        response = self.client.get("/api/v1/discovery/?city=Delhi&budget=200")
        self.assertEqual(response.data["item_count"], 0)
        self.assertEqual(self.client.get("/api/v1/discovery/?budget=-1").status_code, 400)
        self.restaurant.is_approved = False
        self.restaurant.save()
        self.assertEqual(self.client.get("/api/v1/discovery/").data["restaurant_count"], 0)

    def test_review_updates_rating_and_public_feed_hides_email(self):
        order = Order.objects.get(pk=self.checkout().data["id"])
        order.status = Order.Status.DELIVERED
        order.save()
        response = self.client.post("/api/v1/reviews/", {"order": order.id, "rating": 4, "comment": "Nice"})
        self.assertEqual(response.status_code, 201)
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.average_rating, Decimal("4"))
        self.client.force_authenticate(None)
        review = self.client.get(f"/api/v1/restaurant-reviews/?restaurant={self.restaurant.id}").data["results"][0]
        self.assertNotIn("email", review)
        self.assertEqual(self.client.get("/api/v1/restaurant-reviews/?restaurant=nope").status_code, 400)

    @override_settings(RAZORPAY_KEY_ID="rzp_test", RAZORPAY_KEY_SECRET="test_secret")
    @patch("api.payments.gateway")
    def test_online_checkout_is_hidden_from_kitchen_until_verified(self, gateway):
        gateway.return_value = {"id": "order_test123"}
        response = self.checkout(payment_method="razorpay")
        self.assertEqual(response.status_code, 201)
        order_id = response.data["id"]
        self.assertEqual(response.data["status"], "awaiting_payment")
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.get("/api/v1/orders/").data["count"], 0)
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.post("/api/v1/online-payments/verify/", {"order_id": order_id, "razorpay_payment_id": "pay_test123", "razorpay_signature": "0" * 64}).status_code, 400)
        signature = hmac.new(b"test_secret", b"order_test123|pay_test123", hashlib.sha256).hexdigest()
        gateway.return_value = {"id": "pay_test123", "order_id": "order_test123", "amount": 28900, "currency": "INR", "status": "captured"}
        payload = {"order_id": order_id, "razorpay_payment_id": "pay_test123", "razorpay_signature": signature}
        self.assertEqual(self.client.post("/api/v1/online-payments/verify/", payload).status_code, 200)
        self.assertEqual(self.client.post("/api/v1/online-payments/verify/", payload).status_code, 200)
        self.assertEqual(OrderEvent.objects.filter(order_id=order_id, status="pending").count(), 1)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.get("/api/v1/orders/").data["count"], 1)

    def test_webhook_rejects_unsigned_payload(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.post("/api/v1/online-payments/webhook/", {"event": "payment.captured"}, format="json").status_code, 400)

    def test_available_deliveries_do_not_leak_customer_data(self):
        order = Order.objects.get(pk=self.checkout().data["id"])
        order.status = Order.Status.READY
        order.save()
        self.client.force_authenticate(self.courier)
        record = self.client.get("/api/v1/orders/available/").data["results"][0]
        self.assertNotIn("customer_detail", record)
        self.assertNotIn("payment", record)
        self.assertNotIn("delivery_code", record)
        self.assertEqual(record["delivery_address_detail"]["city"], "Delhi")
        self.assertNotEqual(record["delivery_address_detail"]["line1"], self.address.line1)

    def test_used_address_deletion_is_a_clear_validation_error(self):
        self.checkout()
        self.assertEqual(self.client.delete(f"/api/v1/addresses/{self.address.id}/").status_code, 400)
        self.assertTrue(Address.objects.filter(pk=self.address.id).exists())

    def test_delivery_code_locks_after_five_incorrect_attempts(self):
        order = Order.objects.get(pk=self.checkout().data["id"])
        order.status = Order.Status.OUT
        order.save()
        DeliveryAssignment.objects.create(order=order, partner=self.courier)
        self.client.force_authenticate(self.courier)
        for _ in range(5):
            self.assertEqual(self.client.post(f"/api/v1/orders/{order.id}/status/", {"status": "delivered", "delivery_code": "bad"}).status_code, 400)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.id}/status/", {"status": "delivered", "delivery_code": order.delivery_code}).status_code, 400)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.OUT)

    @override_settings(GEMINI_API_KEY="test-only")
    @patch("api.recommendations.urlopen")
    def test_gemini_output_is_grounded_deduplicated_and_cached(self, provider):
        generated = {"intent": "clear", "items": [{"id": 999999, "reason": "Invented"}, {"id": self.item.id, "reason": "A warm vegetarian meal"}, {"id": self.item.id, "reason": "Duplicate"}]}
        response = {"candidates": [{"content": {"parts": [{"text": json.dumps(generated)}]}}]}
        provider.return_value = io.BytesIO(json.dumps(response).encode())
        payload = {"vegetarian": True, "budget": 250}
        first = self.client.post("/api/v1/discovery/recommendations/", payload, format="json")
        self.assertEqual(first.data["source"], "gemini")
        self.assertEqual([item["id"] for item in first.data["items"]], [self.item.id])
        self.client.post("/api/v1/discovery/recommendations/", payload, format="json")
        self.assertEqual(provider.call_count, 1)
        self.assertNotIn(self.customer.email, provider.call_args.args[0].data.decode())

    @override_settings(GEMINI_API_KEY="test-only")
    @patch("api.recommendations.urlopen", side_effect=TimeoutError)
    def test_gemini_timeout_returns_catalog_fallback(self, provider):
        result = self.client.post("/api/v1/discovery/recommendations/", {"vegetarian": True}, format="json")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.data["source"], "curated")

    @override_settings(GEMINI_API_KEY="")
    def test_unclear_craving_never_becomes_random_fallback_matches(self):
        for query in ("uhbh", "asdfgh", "12345", "!!!!!!"):
            response = self.client.post("/api/v1/discovery/recommendations/", {"q": query, "city": "Delhi"}, format="json")
            self.assertEqual(response.data["items"], [], query)
            self.assertEqual(response.data["status"], "needs_clarification", query)

    @override_settings(GEMINI_API_KEY="test-only")
    @patch("api.recommendations.urlopen")
    def test_model_clarification_or_no_match_cannot_be_replaced_with_catalog_items(self, provider):
        for intent, expected in (("unclear", "needs_clarification"), ("unavailable", "no_matches")):
            cache.clear()
            generated = {"intent": intent, "items": [{"id": self.item.id}]}
            provider.return_value = io.BytesIO(json.dumps({"candidates": [{"content": {"parts": [{"text": json.dumps(generated)}]}}]}).encode())
            response = self.client.post("/api/v1/discovery/recommendations/", {"q": "uhbh"}, format="json")
            self.assertEqual(response.data["items"], [])
            self.assertEqual(response.data["status"], expected)

    @override_settings(GEMINI_API_KEY="test-only")
    @patch("api.recommendations.urlopen", side_effect=TimeoutError)
    def test_unknown_craving_with_provider_down_requests_clarification(self, provider):
        response = self.client.post("/api/v1/discovery/recommendations/", {"q": "uhbh"}, format="json")
        self.assertEqual(response.data["items"], [])
        self.assertEqual(response.data["status"], "needs_clarification")

    @override_settings(RAZORPAY_WEBHOOK_SECRET="webhook-test")
    def test_captured_webhook_checks_amount_and_is_idempotent(self):
        order = Order.objects.get(pk=self.checkout().data["id"])
        order.status = Order.Status.AWAITING_PAYMENT
        order.save()
        payment = order.payment
        payment.method = "razorpay"
        payment.provider_order_id = "order_webhooktest"
        payment.save()
        self.client.force_authenticate(None)
        def send(amount):
            payload = json.dumps({"event": "payment.captured", "payload": {"payment": {"entity": {"order_id": "order_webhooktest", "id": "pay_webhooktest", "amount": amount, "currency": "INR"}}}})
            signature = hmac.new(b"webhook-test", payload.encode(), hashlib.sha256).hexdigest()
            return self.client.post("/api/v1/online-payments/webhook/", payload, content_type="application/json", HTTP_X_RAZORPAY_SIGNATURE=signature)
        self.assertEqual(send(1).status_code, 400)
        self.assertEqual(send(28900).status_code, 200)
        self.assertEqual(send(28900).status_code, 200)
        self.assertEqual(OrderEvent.objects.filter(order=order, status="pending").count(), 2)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.id}/status/", {"status": "cancelled"}).status_code, 400)
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.Status.PAID)

    def test_checkout_notifications_are_owned_and_retry_safe(self):
        key = str(uuid.uuid4())
        order_id = self.checkout(checkout_key=key).data["id"]
        self.client.post("/api/v1/cart/checkout/", {"address_id": self.address.pk, "checkout_key": key}, format="json")
        notices = Notification.objects.filter(event_key=f"order:{order_id}:pending")
        self.assertEqual(set(notices.values_list("user_id", flat=True)), {self.customer.pk, self.owner.pk})
        self.assertEqual(notices.count(), 2)
        self.assertTrue(all(row.metadata["order_id"] == order_id for row in notices))
        self.assertFalse(Notification.objects.filter(user=self.other).exists())

    def test_automatic_kitchen_courier_and_delivery_notifications(self):
        order = Order.objects.get(pk=self.checkout().data["id"])
        offline = User.objects.create_user("offline@example.com", "LongProductPass123", role="delivery", is_available=False)
        self.client.force_authenticate(self.owner)
        for state in ["confirmed", "preparing", "ready"]:
            self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": state}).status_code, 200)
            self.assertTrue(Notification.objects.filter(user=self.customer, event_key=f"order:{order.pk}:{state}").exists())
        available = Notification.objects.get(user=self.courier, kind="delivery")
        self.assertEqual(available.metadata, {"available_delivery": True})
        self.assertNotIn(self.customer.email, available.message)
        self.assertFalse(Notification.objects.filter(user=offline).exists())
        self.client.force_authenticate(self.courier)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/accept/").status_code, 200)
        for _ in range(2):
            self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/pickup/").status_code, 200)
        self.assertEqual(Notification.objects.filter(event_key=f"order:{order.pk}:out_for_delivery").count(), 3)
        before = Notification.objects.count()
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": "delivered", "delivery_code": "incorrect"}).status_code, 400)
        self.assertEqual(Notification.objects.count(), before)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": "delivered", "delivery_code": order.delivery_code}).status_code, 200)
        self.assertEqual(Notification.objects.filter(event_key=f"order:{order.pk}:delivered").count(), 3)
        self.assertEqual(Notification.objects.filter(event_key=f"payment:{order.pk}:paid").count(), 2)

    @override_settings(RAZORPAY_KEY_ID="test", RAZORPAY_KEY_SECRET="test")
    @patch("api.payments.gateway", return_value={"id": "order_notifytest"})
    def test_unpaid_checkout_is_not_sent_to_kitchen_and_capture_deduplicates(self, gateway):
        from .payments import record_captured
        order_id = self.checkout(payment_method="razorpay").data["id"]
        self.assertFalse(Notification.objects.filter(user=self.owner).exists())
        for _ in range(2):
            record_captured("order_notifytest", "pay_notifytest", 28900, "INR")
        self.assertEqual(Notification.objects.filter(user=self.owner, event_key=f"order:{order_id}:pending").count(), 1)
        self.assertEqual(Notification.objects.filter(event_key=f"payment:{order_id}:paid").count(), 2)

    def test_support_activity_notifies_both_sides_without_reply_body(self):
        admin = User.objects.create_user("inbox-admin@example.com", "LongProductPass123", role="admin")
        result = self.client.post("/api/v1/support/", {"category": "delivery", "subject": "Help", "message": "Private customer message"}, format="json")
        self.assertEqual(result.status_code, 201)
        ticket_id = result.data["id"]
        self.assertEqual(Notification.objects.filter(event_key=f"support:{ticket_id}:created").count(), 2)
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.post(f"/api/v1/support/{ticket_id}/reply/", {"message": "Private support reply"}).status_code, 200)
        notice = Notification.objects.get(user=self.customer, title="Support replied")
        self.assertEqual(notice.metadata["ticket_id"], ticket_id)
        self.assertNotIn("Private", notice.message)
        for _ in range(2):
            self.assertEqual(self.client.post(f"/api/v1/support/{ticket_id}/resolve/").status_code, 200)
        self.assertEqual(Notification.objects.filter(title="Support ticket resolved").count(), 2)
        self.assertFalse(Notification.objects.filter(user=self.other).exists())

    def test_signup_and_security_updates_are_automatic_and_noop_is_silent(self):
        admin = User.objects.create_user("approve-admin@example.com", "LongProductPass123", role="admin")
        self.client.force_authenticate(None)
        result = self.client.post("/api/v1/auth/register/", {"email": "new-partner@example.com", "password": "LongProductPass123", "role": "delivery"}, format="json")
        self.assertEqual(result.status_code, 202)
        self.assertTrue(Notification.objects.filter(user=admin, title="Partner approval needed").exists())
        self.client.force_authenticate(self.customer)
        for _ in range(2):
            self.assertEqual(self.client.patch("/api/v1/auth/me/", {"first_name": "Updated"}).status_code, 200)
        self.assertEqual(Notification.objects.filter(user=self.customer, title="Profile updated").count(), 1)
        count = Notification.objects.count()
        self.assertEqual(self.client.post("/api/v1/auth/change_password/", {"current_password": "incorrect", "new_password": "LongReplacementPass123"}).status_code, 400)
        self.assertEqual(Notification.objects.count(), count)

    def test_notification_insert_is_transactional_and_preserves_read_state(self):
        from django.db import transaction
        from .notifications import notify
        args = dict(event="same-event", title="Update", message="Test")
        with self.assertRaises(RuntimeError):
            with transaction.atomic():
                notify([self.customer.pk], **args)
                raise RuntimeError("Roll back activity")
        self.assertFalse(Notification.objects.exists())
        notify([self.customer.pk], **args)
        Notification.objects.update(is_read=True)
        notify([self.customer.pk], **args)
        self.assertEqual(Notification.objects.count(), 1)
        self.assertTrue(Notification.objects.get().is_read)

    def test_discovery_combines_filters_and_aggregates_only_matching_dishes(self):
        self.restaurant.average_rating = Decimal("4.6")
        self.restaurant.save()
        self.item.preparation_minutes = 20
        self.item.is_bestseller = True
        self.item.save()
        MenuItem.objects.create(restaurant=self.restaurant, category=self.category, name="Non veg cheap dish", price=10, preparation_minutes=5, is_vegetarian=False)
        MenuItem.objects.create(restaurant=self.restaurant, category=self.category, name="Slow meal", price=20, preparation_minutes=60, is_vegetarian=True)
        now = timezone.now()
        offer = Offer.objects.create(restaurant=self.restaurant, title="Kitchen special", starts_at=now-timezone.timedelta(days=1), ends_at=now+timezone.timedelta(days=1))
        path = "/api/v1/discovery/?vegetarian=true&budget=250&min_rating=4&max_prep=30&bestseller=true&offers=true"
        result = self.client.get(path)
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.data["item_count"], 1)
        self.assertEqual(result.data["restaurants"][0]["from_price"], Decimal("249"))
        self.assertEqual(result.data["restaurants"][0]["prep_minutes"], 20)
        self.assertEqual(result.data["restaurants"][0]["menu_count"], 1)
        offer.ends_at = now-timezone.timedelta(seconds=1)
        offer.save()
        self.assertEqual(self.client.get(path).data["restaurant_count"], 0)

    def test_nearby_distance_sort_radius_and_unmapped_exclusion(self):
        self.restaurant.latitude, self.restaurant.longitude = Decimal("28.600"), Decimal("77.200")
        self.restaurant.save()
        for index, latitude in enumerate([Decimal("28.610"), Decimal("29.000"), None]):
            owner = User.objects.create_user(f"geo{index}@example.com", "LongProductPass123", role="restaurant")
            restaurant = Restaurant.objects.create(owner=owner, name=f"Kitchen {index}", address="Street", city="Delhi", is_approved=True, latitude=latitude, longitude=Decimal("77.200") if latitude else None)
            MenuItem.objects.create(restaurant=restaurant, category=self.category, name="Meal", price=100)
        result = self.client.get("/api/v1/discovery/?latitude=28.600&longitude=77.200&radius_km=5&sort=distance")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.data["restaurant_count"], 2)
        self.assertEqual(result.data["item_count"], 2)
        self.assertEqual([r["distance_km"] for r in result.data["restaurants"]], [0.0, 1.1])
        self.assertEqual(result.data["restaurants"][0]["id"], self.restaurant.pk)

    def test_discovery_rejects_invalid_filters(self):
        for query in ["min_rating=6", "max_prep=0", "latitude=91&longitude=0", "latitude=NaN&longitude=0", "sort=distance", "radius_km=5", "latitude=0", "offers=invalid"]:
            with self.subTest(query=query):
                self.assertEqual(self.client.get(f"/api/v1/discovery/?{query}").status_code, 400)

    def test_profile_photo_upload_reencode_replacement_remove_and_ownership(self):
        from tempfile import TemporaryDirectory
        from django.core.files.uploadedfile import SimpleUploadedFile
        from PIL import Image
        def photo():
            data = io.BytesIO()
            Image.new("RGB", (120, 100), "navy").save(data, format="PNG")
            return SimpleUploadedFile("profile.png", data.getvalue(), content_type="image/png")
        with TemporaryDirectory() as directory, override_settings(MEDIA_ROOT=directory):
            result = self.client.patch("/api/v1/auth/me/", {"avatar": photo()}, format="multipart")
            self.assertEqual(result.status_code, 200)
            self.customer.refresh_from_db()
            first_name = self.customer.avatar.name
            storage = self.customer.avatar.storage
            self.assertTrue(first_name.endswith(".webp"))
            with self.customer.avatar.open("rb") as stream, Image.open(stream) as image:
                self.assertEqual(image.size, (512, 512))
                self.assertEqual(image.getexif(), {})
            self.assertEqual(self.client.get("/api/v1/auth/me/").data["avatar"], result.data["avatar"])
            with self.captureOnCommitCallbacks(execute=True):
                result = self.client.patch("/api/v1/auth/me/", {"avatar": photo()}, format="multipart")
            self.assertEqual(result.status_code, 200)
            self.assertFalse(storage.exists(first_name))
            self.customer.refresh_from_db()
            current_name = self.customer.avatar.name
            self.client.force_authenticate(self.other)
            self.assertEqual(self.client.patch(f"/api/v1/auth/me/?user={self.customer.pk}", {"avatar": None}, format="json").status_code, 200)
            self.customer.refresh_from_db()
            self.assertEqual(self.customer.avatar.name, current_name)
            self.client.force_authenticate(self.customer)
            with self.captureOnCommitCallbacks(execute=True):
                result = self.client.patch("/api/v1/auth/me/", {"avatar": None}, format="json")
            self.assertEqual(result.status_code, 200)
            self.assertIsNone(result.data["avatar"])
            self.assertFalse(storage.exists(current_name))

    def test_profile_photo_rejects_invalid_type_size_and_dimensions(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        from PIL import Image
        invalid = SimpleUploadedFile("photo.png", b"not an image", content_type="image/png")
        self.assertEqual(self.client.patch("/api/v1/auth/me/", {"avatar": invalid}, format="multipart").status_code, 400)
        for size, format in [((4097, 12), "PNG"), ((12, 12), "GIF"), ((12, 12), "PNG")]:
            data = io.BytesIO()
            Image.new("RGB", size, "navy").save(data, format=format)
            payload = data.getvalue() + (b"0" * (5 * 1024 * 1024) if size == (12, 12) and format == "PNG" else b"")
            photo = SimpleUploadedFile(f"photo.{format.lower()}", payload, content_type=f"image/{format.lower()}")
            self.assertEqual(self.client.patch("/api/v1/auth/me/", {"avatar": photo}, format="multipart").status_code, 400)
        self.assertFalse(Notification.objects.filter(user=self.customer).exists())

    def test_addon_variants_are_server_priced_and_order_snapshots_are_immutable(self):
        self.item.add_ons = [{"id": "roti", "name": "Extra roti", "price": "20.00", "is_available": True}]
        self.item.save()
        self.assertEqual(self.client.post("/api/v1/cart/items/", {"menu_item": self.item.pk, "quantity": 1}, format="json").status_code, 201)
        result = self.client.post("/api/v1/cart/items/", {"menu_item": self.item.pk, "quantity": 2, "addon_ids": ["roti"], "unit_price": "1", "add_ons": [{"price": "-999"}]}, format="json")
        self.assertEqual(result.status_code, 201)
        self.assertEqual(CartItem.objects.count(), 2)
        self.assertEqual(result.data["items"][1]["unit_price"], "269.00")
        order = self.client.post("/api/v1/cart/checkout/", {"address_id": self.address.pk}, format="json")
        self.assertEqual(order.status_code, 201)
        self.assertEqual(order.data["subtotal"], "787.00")
        self.assertEqual(order.data["delivery_fee"], "0.00")
        snapshot = OrderItem.objects.get(order_id=order.data["id"], quantity=2)
        self.assertEqual(snapshot.add_ons[0]["name"], "Extra roti")
        self.item.add_ons[0]["price"] = "30.00"
        self.item.save()
        snapshot.refresh_from_db()
        self.assertEqual(snapshot.unit_price, Decimal("269.00"))
        self.assertEqual(snapshot.add_ons[0]["price"], "20.00")
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.data['id']}/reorder/").status_code, 200)
        self.assertEqual(CartItem.objects.count(), 2)
        cart = self.client.get("/api/v1/cart/").data
        self.assertIn("279.00", [row["unit_price"] for row in cart["items"]])

    def test_removed_addons_block_checkout_but_cart_can_still_be_read_and_removed(self):
        self.item.add_ons = [{"id": "roti", "name": "Extra roti", "price": "20.00", "is_available": True}]
        self.item.save()
        result = self.client.post("/api/v1/cart/items/", {"menu_item": self.item.pk, "quantity": 1, "addon_ids": ["roti"]}, format="json")
        item_id = result.data["items"][0]["id"]
        self.item.add_ons = []
        self.item.save()
        self.assertEqual(self.client.get("/api/v1/cart/").status_code, 200)
        self.assertEqual(self.client.post("/api/v1/cart/checkout/", {"address_id": self.address.pk}, format="json").status_code, 400)
        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(self.client.delete(f"/api/v1/cart/items/{item_id}/").status_code, 200)

    def test_addon_ids_are_validated_and_repeated_configuration_merges(self):
        self.item.add_ons = [{"id": "roti", "name": "Extra roti", "price": "20.00", "is_available": True}]
        self.item.save()
        self.assertEqual(self.client.post("/api/v1/cart/items/", {"menu_item": self.item.pk, "quantity": 1, "addon_ids": ["invented"]}, format="json").status_code, 400)
        for ids in [["roti"], ["roti", "roti"]]:
            self.assertEqual(self.client.post("/api/v1/cart/items/", {"menu_item": self.item.pk, "quantity": 1, "addon_ids": ids}, format="json").status_code, 201)
        self.assertEqual(CartItem.objects.count(), 1)
        self.assertEqual(CartItem.objects.get().quantity, 2)

    def test_only_restaurant_owner_can_configure_valid_addons(self):
        addon = {"id": "roti", "name": "Extra roti", "price": "20.00", "is_available": True}
        self.assertEqual(self.client.patch(f"/api/v1/menu-items/{self.item.pk}/", {"add_ons": [addon]}, format="json").status_code, 403)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.patch(f"/api/v1/menu-items/{self.item.pk}/", {"add_ons": [addon]}, format="json").status_code, 200)
        self.assertEqual(self.client.patch(f"/api/v1/menu-items/{self.item.pk}/", {"add_ons": [addon, addon]}, format="json").status_code, 400)
        self.assertEqual(self.client.patch(f"/api/v1/menu-items/{self.item.pk}/", {"add_ons": [{**addon, "price": "-1"}]}, format="json").status_code, 400)
