from datetime import timedelta
import hashlib
import hmac
import json
from decimal import Decimal
from unittest.mock import patch
from uuid import uuid4

from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework import serializers
from rest_framework.test import APITestCase

from .models import (Address, AuditLog, Cart, Category, Coupon, DeliveryPolicy,
                     DeliveryZone, MenuItem, Order, OrderEvent, OrderItem, Payment,
                     RefundRequest, Restaurant, SupportTicket, User)
from .payment_expiry import expire_unpaid_orders
from .payments import record_captured
from .refunds import record_provider_refund


@override_settings(GEMINI_API_KEY="", RAZORPAY_KEY_ID="", RAZORPAY_KEY_SECRET="")
class CheckoutSupportTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user("checkout-support@test.example", "Test-pass-1424")
        self.other = User.objects.create_user("other-support@test.example", "Test-pass-1424")
        self.admin = User.objects.create_user("admin-support@test.example", "Test-pass-1424", role="admin")
        self.owner = User.objects.create_user("kitchen-support@test.example", "Test-pass-1424", role="restaurant")
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Support Kitchen", city="Delhi", address="Kitchen", is_approved=True, latitude="28.600000", longitude="77.200000")
        self.category = Category.objects.create(name="Meals", slug="support-meals")
        self.item = MenuItem.objects.create(restaurant=self.restaurant, category=self.category, name="Fresh thali", price="100.00", stock_quantity=5)
        self.address = Address.objects.create(user=self.customer, line1="Home", city="Delhi", state="Delhi", postal_code="110001", latitude="28.610000", longitude="77.200000")
        self.client.force_authenticate(self.customer)

    def add(self):
        response = self.client.post("/api/v1/cart/items/", {"menu_item": self.item.pk, "quantity": 1}, format="json")
        self.assertEqual(response.status_code, 201, response.data)

    def quote(self, **extra):
        return self.client.post("/api/v1/cart/quote/", {"address_id": self.address.pk, **extra}, format="json")

    def checkout(self, **extra):
        return self.client.post("/api/v1/cart/checkout/", {"address_id": self.address.pk, **extra}, format="json")

    def zone(self, **extra):
        return DeliveryZone.objects.create(name="Central", city="Delhi", is_active=True, latitude="28.600000", longitude="77.200000", radius_km=10, max_delivery_km=5, base_fee=20, per_km_fee=10, included_km=1, **extra)

    def enable(self):
        DeliveryPolicy.objects.update_or_create(pk=1, defaults={"enabled": True})

    def delivered_order(self, method="razorpay"):
        self.add()
        response = self.checkout()
        self.assertEqual(response.status_code, 201, response.data)
        order = Order.objects.get(pk=response.data["id"])
        order.status = Order.Status.DELIVERED
        order.save()
        payment = order.payment
        payment.status = Payment.Status.PAID
        payment.method = method
        payment.transaction_id = f"pay_test{order.pk}"
        payment.provider_order_id = f"order_test{order.pk}"
        payment.save()
        return order

    def ticket(self, order, **extra):
        return self.client.post("/api/v1/support/", {"order": order.pk, "category": "food_quality", "subject": "Food was spoiled", "message": "The thali smelled sour.", "affected_item_ids": [order.items.first().pk], "request_refund": True, **extra}, format="json")

    def approve(self, refund, amount=None):
        self.client.force_authenticate(self.admin)
        return self.client.post(f"/api/v1/refund-requests/{refund.pk}/review/", {"decision": "approved", "note": "Confirmed food-quality issue with the kitchen.", "amount": str(amount if amount is not None else refund.requested_amount)}, format="json")

    def entity(self, refund, status="processed"):
        return {"id": f"rfnd_test{refund.pk}", "payment_id": refund.order.payment.transaction_id, "currency": "INR", "amount": int(refund.approved_amount*100), "receipt": f"ruchigo_refund_{refund.pk}", "status": status}

    def test_menu_categories_are_scoped_to_actual_visible_dishes(self):
        Category.objects.create(name="Pizza", slug="empty-pizza")
        hidden = Category.objects.create(name="Hidden", slug="hidden-meal")
        MenuItem.objects.create(restaurant=self.restaurant, category=hidden, name="Unavailable", price=100, is_available=False)
        response = self.client.get(f"/api/v1/categories/?restaurant={self.restaurant.pk}")
        self.assertEqual([row["name"] for row in response.data["results"]], ["Meals"])
        self.restaurant.is_approved = False; self.restaurant.save()
        self.assertEqual(self.client.get(f"/api/v1/categories/?restaurant={self.restaurant.pk}").data["count"], 0)

    def test_cross_city_checkout_is_blocked_without_writing_order(self):
        self.add(); self.address.city = "Noida"; self.address.save()
        self.assertEqual(self.quote().status_code, 400)
        self.assertEqual(self.checkout().status_code, 400)
        self.assertEqual(Order.objects.count(), 0)
        self.item.refresh_from_db(); self.assertEqual(self.item.stock_quantity, 5)

    def test_standard_quote_and_city_alias_match_checkout(self):
        self.add(); self.address.city = " New Delhi "; self.address.save()
        quote = self.quote()
        self.assertEqual(quote.status_code, 200)
        self.assertEqual(Decimal(quote.data["total"]), 140)
        order = self.checkout(quote_token=quote.data["quote_token"])
        self.assertEqual(order.status_code, 201, order.data)
        self.assertEqual(Decimal(order.data["total"]), 140)

    def test_saved_south_delhi_address_quotes_and_checks_out_without_rewriting_it(self):
        self.address.city = "South Delhi"
        self.address.line2 = "Upper ground floor, street 24"
        self.address.latitude = None
        self.address.longitude = None
        self.address.save()
        self.add()
        quote = self.quote()
        self.assertEqual(quote.status_code, 200, quote.data)
        result = self.checkout(quote_token=quote.data["quote_token"])
        self.assertEqual(result.status_code, 201, result.data)
        self.assertEqual(Decimal(result.data["total"]), 140)
        self.address.refresh_from_db()
        self.assertEqual(self.address.city, "South Delhi")
        self.assertEqual(self.address.line2, "Upper ground floor, street 24")

    def test_delhi_district_aliases_match_without_accepting_neighbouring_cities(self):
        from .serviceability import canonical_city
        for name in ["Delhi", " SOUTH  DELHI ", "South-East Delhi", "North‑West Delhi", "Central Delhi", "NCT of Delhi", "National Capital Territory of Delhi"]:
            self.assertEqual(canonical_city(name), "delhi", name)
        for name in ["Noida", "Greater Noida", "Gurugram", "Faridabad", "Ghaziabad", "Delhi NCR", "South Delhi Road", "Not Delhi"]:
            self.assertNotEqual(canonical_city(name), "delhi", name)

    def test_district_alias_still_requires_pins_and_real_zone_distance(self):
        zone = self.zone(); self.enable(); self.add()
        self.address.city = "South Delhi"
        self.address.save()
        result = self.quote()
        self.assertEqual(result.status_code, 200, result.data)
        self.assertEqual(Decimal(result.data["delivery_fee"]), Decimal("21.12"))
        self.address.latitude = None; self.address.longitude = None; self.address.save()
        self.assertEqual(self.quote().status_code, 400)
        self.address.latitude = "28.610000"; self.address.longitude = "77.200000"; self.address.save()
        zone.radius_km = Decimal("0.10"); zone.save()
        self.assertEqual(self.quote().status_code, 400)
        zone.radius_km = 10; zone.max_delivery_km = Decimal("0.10"); zone.save()
        self.assertEqual(self.quote().status_code, 400)
        self.assertEqual(self.checkout().status_code, 400)
        self.assertEqual(Order.objects.count(), 0)

    def test_ncr_address_is_not_allowed_even_with_a_delhi_state_or_nearby_pin(self):
        self.add()
        for city in ["Noida", "Gurugram", "Faridabad", "Delhi NCR", "South Delhi Road"]:
            self.address.city = city
            self.address.save()
            self.assertEqual(self.quote().status_code, 400, city)
            self.assertEqual(self.checkout().status_code, 400, city)
        self.assertEqual(Order.objects.count(), 0)

    def test_discovery_matches_saved_district_city_without_widening_to_ncr(self):
        from .product_views import eligible_items
        result = self.client.get("/api/v1/discovery/?city=South%20Delhi")
        self.assertEqual(result.status_code, 200)
        self.assertEqual([row["id"] for row in result.data["restaurants"]], [self.restaurant.pk])
        self.assertEqual(list(eligible_items({"city": "South Delhi"}).values_list("pk", flat=True)), [self.item.pk])
        self.restaurant.city = "South Delhi"
        self.restaurant.save()
        self.assertEqual(self.client.get("/api/v1/discovery/?city=Delhi").data["restaurant_count"], 1)
        self.restaurant.city = "Noida"
        self.restaurant.save()
        self.assertEqual(self.client.get("/api/v1/discovery/?city=South%20Delhi").data["restaurant_count"], 0)

    def test_zone_distance_pricing_signed_quote_and_snapshot(self):
        self.zone(); self.enable(); self.add()
        quote = self.quote()
        self.assertEqual(quote.status_code, 200, quote.data)
        self.assertEqual(Decimal(quote.data["delivery_fee"]), Decimal("21.12"))
        self.assertEqual(quote.data["distance_basis"], "straight_line")
        self.assertEqual(self.checkout().status_code, 400)
        result = self.checkout(quote_token=quote.data["quote_token"])
        self.assertEqual(result.status_code, 201, result.data)
        self.assertEqual(result.data["delivery_quote"]["zone"], "Central")

    def test_zone_requires_pin_and_enforces_radius_and_trip_limit(self):
        zone = self.zone(); self.enable(); self.add()
        self.address.latitude = None; self.address.longitude = None; self.address.save()
        self.assertEqual(self.quote().status_code, 400)
        self.address.latitude = "28.610000"; self.address.longitude = "77.200000"; self.address.save()
        zone.radius_km = Decimal("0.10"); zone.save()
        self.assertEqual(self.quote().status_code, 400)
        zone.radius_km = 10; zone.max_delivery_km = Decimal("0.10"); zone.save()
        self.assertEqual(self.quote().status_code, 400)

    def test_minimum_order_free_delivery_and_overlapping_cheapest_zone(self):
        zone = self.zone(minimum_order=150); self.enable(); self.add()
        self.assertEqual(self.quote().status_code, 400)
        zone.minimum_order = 0; zone.free_delivery_above = 100; zone.save()
        self.assertEqual(Decimal(self.quote().data["delivery_fee"]), 0)
        zone.pk = None; zone.name = "Second"; zone.free_delivery_above = None; zone.base_fee = 10; zone.save()
        self.assertEqual(self.quote().data["zone"], "Central")

    def test_tampered_changed_and_other_user_quotes_fail(self):
        self.add(); quote = self.quote().data
        self.assertEqual(self.checkout(quote_token="forged").status_code, 400)
        self.item.price = 120; self.item.save()
        self.assertEqual(self.checkout(quote_token=quote["quote_token"]).status_code, 400)
        quote = self.quote().data
        self.address.line1 = "Different house"; self.address.save()
        self.assertEqual(self.checkout(quote_token=quote["quote_token"]).status_code, 400)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.quote().status_code, 400)

    def test_policy_revision_change_invalidates_quote(self):
        self.zone(); self.enable(); self.add(); quote = self.quote().data
        DeliveryPolicy.objects.filter(pk=1).update(revision=2)
        self.assertEqual(self.checkout(quote_token=quote["quote_token"]).status_code, 400)

    def test_admin_policy_controls_permissions_validation_and_audit(self):
        self.assertEqual(self.client.get("/api/v1/delivery-policy/").status_code, 403)
        self.assertEqual(self.client.post("/api/v1/delivery-zones/", {}, format="json").status_code, 403)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post("/api/v1/delivery-policy/configure/", {"enabled": True, "revision": 1}, format="json").status_code, 400)
        self.zone()
        self.assertEqual(self.client.post("/api/v1/delivery-policy/configure/", {"enabled": True, "revision": 1}, format="json").status_code, 200)
        self.assertEqual(self.client.post("/api/v1/delivery-policy/configure/", {"enabled": False, "revision": 1}, format="json").status_code, 409)
        self.assertTrue(AuditLog.objects.filter(action="delivery_policy.updated").exists())

    def test_address_coordinate_validation(self):
        self.assertEqual(self.client.patch(f"/api/v1/addresses/{self.address.pk}/", {"latitude": 91}, format="json").status_code, 400)
        self.assertEqual(self.client.patch(f"/api/v1/addresses/{self.address.pk}/", {"latitude": None}, format="json").status_code, 400)

    @override_settings(RAZORPAY_KEY_ID="test", RAZORPAY_KEY_SECRET="test")
    @patch("api.payments.gateway", return_value={"id": "order_expiry1"})
    def test_unpaid_expiry_restores_stock_and_coupon_exactly_once(self, gateway):
        coupon = Coupon.objects.create(code="EXPIRE", discount_amount=10, starts_at=timezone.now()-timedelta(days=1), ends_at=timezone.now()+timedelta(days=1))
        self.add()
        response = self.checkout(payment_method="razorpay", coupon_code="EXPIRE", checkout_key=str(uuid4()))
        self.assertEqual(response.status_code, 201, response.data)
        order = Order.objects.get(pk=response.data["id"])
        self.assertIsNotNone(order.payment_expires_at)
        Order.objects.filter(pk=order.pk).update(payment_expires_at=timezone.now()-timedelta(seconds=1))
        self.assertEqual(expire_unpaid_orders(), 1)
        self.assertEqual(expire_unpaid_orders(), 0)
        self.item.refresh_from_db(); coupon.refresh_from_db(); order.refresh_from_db()
        self.assertEqual(self.item.stock_quantity, 5)
        self.assertEqual(coupon.usage_count, 0)
        self.assertEqual(order.status, "cancelled")
        self.assertEqual(order.payment.status, "failed")

    def expired_order(self):
        self.add(); order = Order.objects.get(pk=self.checkout().data["id"])
        order.status = "awaiting_payment"; order.payment_expires_at = timezone.now()-timedelta(seconds=1); order.save()
        payment = order.payment; payment.method = "razorpay"; payment.provider_order_id = f"order_late{order.pk}"; payment.save()
        return order

    def test_late_capture_never_revives_order_and_opens_one_refund_case(self):
        order = self.expired_order()
        for _ in range(2):
            captured = record_captured(order.payment.provider_order_id, "pay_late", int(order.total*100), "INR")
            self.assertEqual(captured.status, "cancelled")
        self.item.refresh_from_db(); order.payment.refresh_from_db()
        self.assertEqual(self.item.stock_quantity, 5)
        self.assertTrue(order.payment.reconciliation_required)
        self.assertEqual(SupportTicket.objects.filter(order=order).count(), 1)
        self.assertEqual(RefundRequest.objects.filter(order=order).count(), 1)
        self.assertFalse(OrderEvent.objects.filter(order=order, status="pending", message__icontains="Payment confirmed").exists())

    def test_capture_before_deadline_keeps_reservation_and_releases_to_kitchen(self):
        order = self.expired_order()
        Order.objects.filter(pk=order.pk).update(payment_expires_at=timezone.now()+timedelta(minutes=2))
        captured = record_captured(order.payment.provider_order_id, "pay_early", int(order.total*100), "INR")
        self.assertEqual(captured.status, "pending")
        self.assertEqual(expire_unpaid_orders(), 0)
        self.item.refresh_from_db(); self.assertEqual(self.item.stock_quantity, 4)

    def test_food_complaint_creates_order_item_snapshot_and_refund_review(self):
        order = self.delivered_order()
        response = self.ticket(order)
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["affected_items"][0]["name"], "Fresh thali")
        self.assertEqual(response.data["refund_request"]["status"], "requested")
        self.assertTrue(response.data["messages"][1]["from_support"])
        self.assertEqual(self.ticket(order).status_code, 400)

    def test_support_without_refund_choice_never_requests_money(self):
        order = self.delivered_order()
        self.assertEqual(self.ticket(order, request_refund=False).status_code, 201)
        self.assertEqual(RefundRequest.objects.count(), 0)

    def test_complaint_cannot_link_another_customer_order_or_item(self):
        order = self.delivered_order()
        self.assertEqual(self.ticket(order, affected_item_ids=[999999]).status_code, 400)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.ticket(order).status_code, 400)

    def test_unpaid_order_refund_request_is_rejected_but_payment_help_is_available(self):
        order = self.delivered_order()
        Payment.objects.filter(order=order).update(status="pending")
        self.assertEqual(self.ticket(order).status_code, 400)
        self.assertEqual(self.ticket(order, category="payment", request_refund=False).status_code, 201)

    def test_customer_cannot_approve_and_admin_cannot_exceed_captured_amount(self):
        order = self.delivered_order(); self.ticket(order); refund = RefundRequest.objects.get(order=order)
        self.assertEqual(self.client.post(f"/api/v1/refund-requests/{refund.pk}/review/", {"decision": "approved"}).status_code, 403)
        self.assertEqual(self.approve(refund, order.total+1).status_code, 400)
        self.assertEqual(self.approve(refund, Decimal("0.50")).status_code, 400)
        self.assertEqual(self.approve(refund).status_code, 200)
        self.assertEqual(self.approve(refund).status_code, 400)

    def test_provider_not_configured_does_not_claim_processing(self):
        order = self.delivered_order(); self.ticket(order); refund = RefundRequest.objects.get(order=order); self.approve(refund)
        self.assertEqual(self.client.post(f"/api/v1/refund-requests/{refund.pk}/process/").status_code, 400)
        refund.refresh_from_db(); self.assertEqual(refund.status, "approved")

    @override_settings(RAZORPAY_KEY_ID="test", RAZORPAY_KEY_SECRET="test")
    @patch("api.refunds.gateway")
    def test_full_online_refund_uses_original_payment_and_verified_result(self, gateway):
        order = self.delivered_order(); self.ticket(order); refund = RefundRequest.objects.get(order=order); self.approve(refund); refund.refresh_from_db()
        # A direct response is correlated with the submitted request even if
        # the provider omits the optional receipt; later callbacks use its ID.
        gateway.return_value = {**self.entity(refund), "receipt": None}
        response = self.client.post(f"/api/v1/refund-requests/{refund.pk}/process/")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["status"], "processed")
        self.assertEqual(gateway.call_args.args[0], f"payments/{order.payment.transaction_id}/refund")
        self.assertNotIn("account", gateway.call_args.args[1])
        self.assertEqual(gateway.call_args.kwargs["refund_idempotency_key"], f"ruchigo-{order.number}-{refund.pk}")
        self.assertEqual(Payment.objects.get(order=order).status, "refunded")
        record_provider_refund(gateway.return_value)
        self.assertEqual(AuditLog.objects.filter(action="refund.processed").count(), 1)
        self.assertEqual(self.client.post(f"/api/v1/refund-requests/{refund.pk}/process/").status_code, 400)
        self.assertEqual(gateway.call_count, 1)
        record_captured(order.payment.provider_order_id, order.payment.transaction_id, int(order.total*100), "INR")
        self.assertEqual(Payment.objects.get(order=order).status, "refunded")

    @override_settings(RAZORPAY_KEY_ID="test", RAZORPAY_KEY_SECRET="test")
    @patch("api.refunds.gateway", side_effect=serializers.ValidationError("Timeout"))
    def test_unknown_provider_result_stays_pending_and_is_not_resubmitted(self, gateway):
        order = self.delivered_order(); self.ticket(order); refund = RefundRequest.objects.get(order=order); self.approve(refund)
        self.assertEqual(self.client.post(f"/api/v1/refund-requests/{refund.pk}/process/").status_code, 202)
        self.assertEqual(self.client.post(f"/api/v1/refund-requests/{refund.pk}/process/").status_code, 400)
        self.assertEqual(gateway.call_count, 1)
        refund.refresh_from_db(); self.assertEqual(refund.status, "processing")

    def test_partial_refund_keeps_payment_paid_and_rejects_mismatched_provider_data(self):
        order = self.delivered_order(); self.ticket(order); refund = RefundRequest.objects.get(order=order); self.approve(refund, 50)
        RefundRequest.objects.filter(pk=refund.pk).update(status="processing"); refund.refresh_from_db()
        entity = self.entity(refund)
        with self.assertRaises(serializers.ValidationError):
            record_provider_refund({**entity, "amount": entity["amount"]+1})
        with self.assertRaises(serializers.ValidationError):
            record_provider_refund({**entity, "payment_id": "pay_other"})
        with self.assertRaises(serializers.ValidationError):
            record_provider_refund({**entity, "currency": "USD"})
        record_provider_refund(entity)
        self.assertEqual(Payment.objects.get(order=order).status, "paid")

    @override_settings(RAZORPAY_KEY_ID="test", RAZORPAY_KEY_SECRET="test")
    @patch("api.refunds.gateway")
    def test_cash_refund_cannot_call_online_provider(self, gateway):
        order = self.delivered_order(method="cod"); self.ticket(order); refund = RefundRequest.objects.get(order=order); self.approve(refund)
        self.assertEqual(self.client.post(f"/api/v1/refund-requests/{refund.pk}/process/").status_code, 400)
        gateway.assert_not_called()

    def test_conversation_feedback_is_owned_resolved_validated_and_persisted(self):
        order = self.delivered_order(); response = self.ticket(order, request_refund=False); pk = response.data["id"]
        path = f"/api/v1/support/{pk}/feedback/"
        self.assertEqual(self.client.post(path, {"score": 5}).status_code, 400)
        self.client.post(f"/api/v1/support/{pk}/resolve/")
        self.assertEqual(self.client.post(path, {"score": 6}).status_code, 400)
        self.assertEqual(self.client.post(path, {"score": 5, "comment": "Helpful and clear"}).status_code, 200)
        ticket = SupportTicket.objects.get(pk=pk)
        self.assertEqual(ticket.feedback_score, 5); self.assertEqual(ticket.feedback_comment, "Helpful and clear")
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.post(path, {"score": 1}).status_code, 404)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post(path, {"score": 1}).status_code, 403)

    def test_spoiled_food_assistant_links_the_order_and_quality_topic(self):
        order = self.delivered_order()
        response = self.client.post("/api/v1/intelligence/assistant/", {"mode": "support", "order_id": order.pk, "message": "Food spoiled hai refund chahiye"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("don’t eat", response.data["reply"])
        self.assertIn(f"order={order.pk}", response.data["links"][0]["to"])
        self.assertIn("category=food_quality", response.data["links"][0]["to"])

    @override_settings(RAZORPAY_WEBHOOK_SECRET="local-webhook-test")
    def test_refund_webhook_requires_signature_and_is_idempotent(self):
        order = self.delivered_order(); self.ticket(order); refund = RefundRequest.objects.get(order=order); self.approve(refund)
        RefundRequest.objects.filter(pk=refund.pk).update(status="processing"); refund.refresh_from_db()
        body = json.dumps({"event": "refund.processed", "payload": {"refund": {"entity": self.entity(refund)}}})
        url = "/api/v1/online-payments/webhook/"
        self.client.force_authenticate(None)
        self.assertEqual(self.client.post(url, body, content_type="application/json").status_code, 400)
        signature = hmac.new(b"local-webhook-test", body.encode(), hashlib.sha256).hexdigest()
        for _ in range(2):
            self.assertEqual(self.client.post(url, body, content_type="application/json", HTTP_X_RAZORPAY_SIGNATURE=signature).status_code, 200)
        self.assertEqual(AuditLog.objects.filter(action="refund.processed").count(), 1)

    @override_settings(RAZORPAY_KEY_ID="test", RAZORPAY_KEY_SECRET="test")
    @patch("api.refunds.gateway")
    def test_timeout_reconciliation_reads_provider_without_sending_another_refund(self, gateway):
        order = self.delivered_order(); self.ticket(order); refund = RefundRequest.objects.get(order=order); self.approve(refund)
        RefundRequest.objects.filter(pk=refund.pk).update(status="processing"); refund.refresh_from_db()
        gateway.return_value = {"items": [self.entity(refund)]}
        response = self.client.post(f"/api/v1/refund-requests/{refund.pk}/reconcile/")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["status"], "processed")
        self.assertEqual(len(gateway.call_args.args), 1, "Read-only provider reconciliation")

    def test_zone_change_invalidates_existing_quote_and_free_threshold_is_before_discount(self):
        zone = self.zone(free_delivery_above=100); self.enable(); self.add()
        Coupon.objects.create(code="LESS", discount_amount=90, starts_at=timezone.now()-timedelta(days=1), ends_at=timezone.now()+timedelta(days=1))
        quote = self.quote(coupon_code="LESS").data
        self.assertEqual(Decimal(quote["total"]), 10)
        zone.free_delivery_above = 500; zone.save()
        self.assertEqual(self.checkout(quote_token=quote["quote_token"], coupon_code="LESS").status_code, 400)

    def test_refund_totals_include_partial_processed_amount_not_full_payment(self):
        order = self.delivered_order(); self.ticket(order); refund = RefundRequest.objects.get(order=order); self.approve(refund, 50)
        RefundRequest.objects.filter(pk=refund.pk).update(status="processing"); refund.refresh_from_db()
        record_provider_refund(self.entity(refund))
        response = self.client.get("/api/v1/analytics/")
        self.assertEqual(response.data["refunds"]["amount"], 50)

    def test_failed_refund_never_marks_payment_returned(self):
        order = self.delivered_order(); self.ticket(order); refund = RefundRequest.objects.get(order=order); self.approve(refund)
        RefundRequest.objects.filter(pk=refund.pk).update(status="processing"); refund.refresh_from_db()
        record_provider_refund(self.entity(refund, "failed"))
        self.assertEqual(Payment.objects.get(order=order).status, "paid")
        refund.refresh_from_db(); self.assertEqual(refund.status, "failed")
