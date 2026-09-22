from decimal import Decimal
from datetime import timedelta
from io import StringIO
from unittest.mock import patch

from django.core.cache import cache
from django.core.management import call_command
from django.test import override_settings
from django.utils import timezone
from rest_framework import serializers
from rest_framework.test import APITestCase

from .models import Address, AuditLog, CancellationPolicy, Coupon, MenuItem, Order, OrderItem, Payment, RefundRequest, Restaurant, SupportTicket, User
from .payments import record_captured


@override_settings(RAZORPAY_KEY_ID="", RAZORPAY_KEY_SECRET="", GEMINI_API_KEY="")
class CancellationTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user("cancel-customer@test.example", "Cancellation-Test-1292")
        self.other = User.objects.create_user("cancel-other@test.example", "Cancellation-Test-1292")
        self.owner = User.objects.create_user("cancel-owner@test.example", "Cancellation-Test-1292", role="restaurant")
        self.admin = User.objects.create_user("cancel-admin@test.example", "Cancellation-Test-1292", role="admin")
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Cancellation Kitchen", city="Delhi", address="Kitchen", is_approved=True)
        self.item = MenuItem.objects.create(restaurant=self.restaurant, name="Test meal", price=100, stock_quantity=9)
        self.address = Address.objects.create(user=self.customer, line1="Home", city="Delhi", state="Delhi", postal_code="110001")
        self.client.force_authenticate(self.customer)

    def order(self, status="pending", cutoff="acceptance", paid=False, enabled=False, method=None):
        order = Order.objects.create(customer=self.customer, restaurant=self.restaurant, delivery_address=self.address, subtotal=100, total=140, delivery_fee=40, status=status,
                                     cancellation_policy_snapshot={"cutoff": cutoff, "allow_prepaid_refunds": enabled, "revision": 1})
        OrderItem.objects.create(order=order, menu_item=self.item, name=self.item.name, unit_price=100, quantity=1, total_price=100, stock_deducted=True)
        Payment.objects.create(order=order, method=method or ("razorpay" if paid else "cod"), amount=140, status="paid" if paid else "pending", transaction_id="pay_cancellation" if paid else "", provider_order_id=f"order_cancel{order.pk}")
        return order

    def cancel(self, order, **body):
        return self.client.post(f"/api/v1/orders/{order.pk}/cancel/", {"reason": "changed_mind", **body}, format="json")

    def details(self, order):
        return self.client.get(f"/api/v1/orders/{order.pk}/").data["cancellation"]

    def test_pending_cash_cancel_restores_stock_and_records_reason(self):
        order = self.order()
        self.assertTrue(self.details(order)["allowed"])
        response = self.cancel(order, reason="wrong_address", note="Wrong saved address selected.")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["status"], "cancelled")
        self.assertEqual(response.data["payment"]["status"], "failed")
        self.item.refresh_from_db(); self.assertEqual(self.item.stock_quantity, 10)
        self.assertEqual(AuditLog.objects.get(action="order.customer_cancelled").metadata["reason"], "wrong_address")
        self.assertEqual(self.cancel(order).status_code, 400)
        self.item.refresh_from_db(); self.assertEqual(self.item.stock_quantity, 10)

    def test_unpaid_checkout_can_be_cancelled_and_late_capture_is_not_restarted(self):
        order = self.order(status="awaiting_payment", method="razorpay")
        self.assertEqual(self.cancel(order).status_code, 200)
        result = record_captured(order.payment.provider_order_id, "pay_aftercancel", 14000, "INR")
        self.assertEqual(result.status, "cancelled")
        self.assertEqual(RefundRequest.objects.get(order=order).status, "requested")
        self.assertTrue(Payment.objects.get(order=order).reconciliation_required)

    def test_default_cutoff_closes_at_acceptance(self):
        order = self.order(status="confirmed")
        self.assertFalse(self.details(order)["allowed"])
        self.assertEqual(self.cancel(order).status_code, 400)

    def test_preparation_cutoff_allows_accepted_but_not_cooking(self):
        order = self.order(status="confirmed", cutoff="preparation")
        self.assertTrue(self.details(order)["allowed"])
        self.assertEqual(self.cancel(order).status_code, 200)

    def test_all_post_cooking_and_terminal_states_block_self_cancel(self):
        for status in ["preparing", "ready", "assigned", "out_for_delivery", "delivered", "cancelled"]:
            with self.subTest(status=status):
                order = self.order(status=status, cutoff="preparation", paid=True, enabled=True)
                self.assertFalse(self.details(order)["allowed"])
                self.assertEqual(self.cancel(order).status_code, 400)
                order.refresh_from_db(); self.assertEqual(order.status, status)
        self.assertFalse(RefundRequest.objects.exists())

    def test_old_page_cannot_cancel_after_kitchen_starts_cooking(self):
        order = self.order(status="confirmed", cutoff="preparation")
        self.assertTrue(self.details(order)["allowed"])
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": "preparing"}).status_code, 200)
        self.client.force_authenticate(self.customer)
        response = self.cancel(order)
        self.assertEqual(response.status_code, 400)
        self.assertIn("prepared", str(response.data))
        self.item.refresh_from_db(); self.assertEqual(self.item.stock_quantity, 9)

    def test_cancellation_is_customer_owned(self):
        order = self.order()
        self.client.force_authenticate(self.other)
        self.assertEqual(self.cancel(order).status_code, 404)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.cancel(order).status_code, 403)

    def test_prepaid_requires_explicit_policy_authorization(self):
        order = self.order(paid=True)
        self.assertFalse(self.details(order)["allowed"])
        self.assertEqual(self.cancel(order).status_code, 400)
        self.assertEqual(RefundRequest.objects.count(), 0)

    def test_provider_unavailable_keeps_cancellation_and_approved_obligation(self):
        order = self.order(paid=True, enabled=True)
        self.assertEqual(Decimal(self.details(order)["refund_amount"]), 140)
        response = self.cancel(order)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["status"], "cancelled")
        self.assertEqual(response.data["refunds"][0]["status"], "approved")
        refund = RefundRequest.objects.get(order=order)
        self.assertTrue(refund.automatic_cancellation)
        self.assertEqual(refund.approved_amount, 140)

    @override_settings(RAZORPAY_KEY_ID="test", RAZORPAY_KEY_SECRET="test")
    @patch("api.refunds.gateway")
    def test_authorized_prepaid_cancellation_submits_full_original_method_refund(self, gateway):
        order = self.order(paid=True, enabled=True)
        gateway.return_value = {"id": "rfnd_cancel", "payment_id": "pay_cancellation", "amount": 14000, "currency": "INR", "status": "processed"}
        response = self.cancel(order)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["payment"]["status"], "refunded")
        self.assertEqual(response.data["refunds"][0]["status"], "processed")
        self.assertEqual(gateway.call_args.args[0], "payments/pay_cancellation/refund")
        self.assertEqual(self.cancel(order).status_code, 400)
        self.assertEqual(gateway.call_count, 1)

    @override_settings(RAZORPAY_KEY_ID="test", RAZORPAY_KEY_SECRET="test")
    @patch("api.refunds.gateway", side_effect=serializers.ValidationError("Timeout"))
    def test_unknown_refund_response_does_not_roll_back_cancellation(self, gateway):
        order = self.order(paid=True, enabled=True)
        response = self.cancel(order)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "cancelled")
        self.assertEqual(response.data["refunds"][0]["status"], "processing")
        self.assertEqual(self.cancel(order).status_code, 400)
        self.assertEqual(gateway.call_count, 1)

    def test_policy_changes_do_not_rewrite_existing_order_rights(self):
        order = self.order(status="confirmed", cutoff="preparation")
        CancellationPolicy.objects.update_or_create(pk=1, defaults={"cutoff": "acceptance", "allow_prepaid_refunds": False, "revision": 2})
        self.assertEqual(self.cancel(order).status_code, 200)

    def test_quote_binds_policy_and_checkout_saves_snapshot(self):
        self.client.post("/api/v1/cart/items/", {"menu_item": self.item.pk, "quantity": 1})
        quote = self.client.post("/api/v1/cart/quote/", {"address_id": self.address.pk}).data
        CancellationPolicy.objects.update_or_create(pk=1, defaults={"cutoff": "preparation", "allow_prepaid_refunds": True, "revision": 2})
        self.assertEqual(self.client.post("/api/v1/cart/checkout/", {"address_id": self.address.pk, "quote_token": quote["quote_token"]}).status_code, 400)
        quote = self.client.post("/api/v1/cart/quote/", {"address_id": self.address.pk}).data
        response = self.client.post("/api/v1/cart/checkout/", {"address_id": self.address.pk, "quote_token": quote["quote_token"]})
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["cancellation_policy_snapshot"]["cutoff"], "preparation")

    def test_reason_and_policy_settings_are_validated_and_admin_only(self):
        order = self.order()
        self.assertEqual(self.cancel(order, reason="not_valid").status_code, 400)
        self.assertEqual(self.cancel(order, reason="other", note="").status_code, 400)
        path = "/api/v1/cancellation-policy/configure/"
        self.assertEqual(self.client.post(path, {}).status_code, 403)
        self.client.force_authenticate(self.admin)
        body = {"cutoff": "preparation", "allow_prepaid_refunds": True, "revision": 1}
        self.assertEqual(self.client.post(path, body, format="json").status_code, 200)
        self.assertEqual(self.client.post(path, body, format="json").status_code, 409)
        self.assertTrue(AuditLog.objects.filter(action="cancellation_policy.updated").exists())

    def test_coupon_reservation_released_once_for_customer_or_kitchen_cancellation(self):
        for actor in [self.customer, self.owner]:
            with self.subTest(actor=actor.role):
                coupon = Coupon.objects.create(code=f"CANCEL-{actor.pk}", discount_amount=10, usage_count=1,
                                               starts_at=timezone.now()-timedelta(days=1), ends_at=timezone.now()+timedelta(days=1))
                order = self.order()
                order.coupon = coupon
                order.save()
                self.client.force_authenticate(actor)
                path = f"/api/v1/orders/{order.pk}/{'cancel' if actor == self.customer else 'status'}/"
                body = {} if actor == self.customer else {"status": "cancelled"}
                self.assertEqual(self.client.post(path, body).status_code, 200)
                self.client.post(path, body)
                coupon.refresh_from_db()
                self.assertEqual(coupon.usage_count, 0)

    def test_cancellation_wins_before_kitchen_transition_without_double_release(self):
        order = self.order()
        self.assertEqual(self.cancel(order).status_code, 200)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": "confirmed"}).status_code, 400)
        order.refresh_from_db()
        self.item.refresh_from_db()
        self.assertEqual(order.status, "cancelled")
        self.assertEqual(self.item.stock_quantity, 10)

    def test_admin_cannot_rewind_progress_and_reopen_cancellation(self):
        self.client.force_authenticate(self.admin)
        for status in ["confirmed", "preparing", "ready", "assigned", "out_for_delivery"]:
            with self.subTest(status=status):
                order = self.order(status=status)
                for new in ["pending", "awaiting_payment"]:
                    self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": new}).status_code, 400)
                order.refresh_from_db()
                self.assertEqual(order.status, status)
                self.assertFalse(self.details(order)["allowed"])
        self.item.refresh_from_db()
        self.assertEqual(self.item.stock_quantity, 9)

    def test_old_orders_do_not_inherit_new_prepaid_or_cutoff_rights(self):
        order = self.order(status="confirmed")
        order.cancellation_policy_snapshot = {}
        order.save()
        CancellationPolicy.objects.create(pk=1, cutoff="preparation", allow_prepaid_refunds=True)
        self.assertFalse(self.details(order)["allowed"])
        self.assertEqual(self.cancel(order).status_code, 400)

    @patch("api.refunds.gateway")
    def test_recovery_is_dry_by_default_and_never_resubmits_uncertain_refunds(self, gateway):
        order = self.order(paid=True, enabled=True)
        self.assertEqual(self.cancel(order).status_code, 200)
        refund = RefundRequest.objects.get(order=order)
        self.assertEqual(refund.status, "approved")
        with override_settings(RAZORPAY_KEY_ID="test", RAZORPAY_KEY_SECRET="test"):
            call_command("process_cancellation_refunds", stdout=StringIO())
            gateway.assert_not_called()
            gateway.side_effect = serializers.ValidationError("Unknown provider result")
            call_command("process_cancellation_refunds", apply=True, stdout=StringIO())
            call_command("process_cancellation_refunds", apply=True, stdout=StringIO())
        self.assertEqual(gateway.call_count, 1)
        refund.refresh_from_db()
        self.assertEqual(refund.status, "processing")

    def test_existing_refund_review_cannot_create_another_automatic_obligation(self):
        order = self.order(paid=True, enabled=True)
        ticket = SupportTicket.objects.create(user=self.customer, order=order, category="payment", subject="Payment review")
        RefundRequest.objects.create(order=order, ticket=ticket, requested_amount=140)
        self.assertFalse(self.details(order)["allowed"])
        self.assertEqual(self.cancel(order).status_code, 400)
        self.assertEqual(RefundRequest.objects.count(), 1)
        order.refresh_from_db()
        self.assertEqual(order.status, "pending")

    def test_support_cancellation_reply_uses_owned_order_state_without_acting(self):
        for status in ["pending", "preparing"]:
            with self.subTest(status=status):
                order = self.order(status=status)
                response = self.client.post("/api/v1/intelligence/assistant/", {"mode": "support", "message": "cancel my order", "order_id": order.pk}, format="json")
                self.assertEqual(response.status_code, 200, response.data)
                self.assertIn(self.details(order)["message"], response.data["reply"])
                self.assertEqual(response.data["links"][0]["to"], f"/tracking/{order.pk}")
                order.refresh_from_db()
                self.assertEqual(order.status, status)
        self.assertFalse(RefundRequest.objects.exists())
