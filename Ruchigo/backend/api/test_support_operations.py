from decimal import Decimal
from unittest.mock import patch
from uuid import uuid4

from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase
from .models import Address, AdminAccessGrant, AuditLog, DeliveryAssignment, MenuItem, Notification, Order, OrderItem, Payment, RefundRequest, Restaurant, SupportTicket, TicketMessage, User


@override_settings(GEMINI_API_KEY="", RAZORPAY_KEY_ID="", RAZORPAY_KEY_SECRET="")
class SupportOperationsTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user("support-customer@test.example", "Support-test-2026")
        self.other = User.objects.create_user("support-other@test.example", "Support-test-2026")
        self.owner = User.objects.create_user("support-owner@test.example", "Support-test-2026", role="restaurant")
        self.admin = User.objects.create_user("support-admin@test.example", "Support-test-2026", role="admin")
        self.rider = User.objects.create_user("support-rider@test.example", "Support-test-2026", role="delivery", is_available=True)
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Support Kitchen", city="Delhi", address="Kitchen", is_approved=True)
        self.item = MenuItem.objects.create(restaurant=self.restaurant, name="Test meal", price=100, stock_quantity=9)
        self.address = Address.objects.create(user=self.customer, line1="Home", city="Delhi", state="Delhi", postal_code="110001")
        self.client.force_authenticate(self.customer)

    def order(self, status="pending", paid=False, method=None):
        order = Order.objects.create(customer=self.customer, restaurant=self.restaurant, delivery_address=self.address, subtotal=100, delivery_fee=40, total=140, status=status)
        OrderItem.objects.create(order=order, menu_item=self.item, name=self.item.name, quantity=1, unit_price=100, total_price=100, stock_deducted=True)
        Payment.objects.create(order=order, amount=140, method=method or ("razorpay" if paid else "cod"), status="paid" if paid else "pending", transaction_id="pay_support" if paid else "")
        return order

    def ticket(self, order=None, body="hi"):
        ticket = SupportTicket.objects.create(user=self.customer, order=order, category="other", subject="Local support check")
        message = TicketMessage.objects.create(ticket=ticket, author=self.customer, body=body)
        return ticket, message

    def respond(self, ticket, message):
        return self.client.post(f"/api/v1/support/{ticket.pk}/respond/", {"message_id": message.pk})

    def operation(self, order, action="issue", **body):
        return self.client.post(f"/api/v1/order-operations/{order.pk}/{action}/", {"expected_status": order.status, "note": "The kitchen cannot fulfil this fixture order.", **body}, format="json")

    def test_greeting_receives_a_persisted_response_with_one_notification(self):
        ticket, message = self.ticket(self.order())
        for _ in range(2):
            response = self.respond(ticket, message)
            self.assertEqual(response.status_code, 200, response.data)
        reply = TicketMessage.objects.get(reply_to=message)
        self.assertIn("Hi!", reply.body)
        self.assertTrue(response.data["messages"][-1]["from_support"])
        self.assertEqual(Notification.objects.filter(event_key=f"support-help:{reply.pk}").count(), 1)

    def test_only_owned_ticket_and_owned_message_can_request_assistance(self):
        ticket, message = self.ticket()
        other_ticket = SupportTicket.objects.create(user=self.other, category="other", subject="Other")
        other_message = TicketMessage.objects.create(ticket=other_ticket, author=self.other, body="hi")
        self.assertEqual(self.respond(ticket, other_message).status_code, 400)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.respond(ticket, message).status_code, 404)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.respond(ticket, message).status_code, 403)

    def test_cooking_cancel_message_never_cancels_or_releases_stock(self):
        order = self.order("preparing")
        ticket, message = self.ticket(order, "cancel my order")
        response = self.respond(ticket, message)
        self.assertIn("already being prepared", response.data["messages"][-1]["body"])
        order.refresh_from_db(); self.item.refresh_from_db()
        self.assertEqual(order.status, "preparing")
        self.assertEqual(self.item.stock_quantity, 9)
        self.assertFalse(RefundRequest.objects.exists())

    def test_pre_delivery_quality_complaint_checks_status_mismatch(self):
        for status in ["pending", "confirmed", "preparing", "cancelled"]:
            ticket, message = self.ticket(self.order(status), "the food is spoiled")
            response = self.respond(ticket, message)
            self.assertIn("Has the food actually reached you?", response.data["messages"][-1]["body"])
        self.assertFalse(RefundRequest.objects.exists())

    def test_delivered_food_complaint_offers_real_affected_item_flow(self):
        order = self.order("delivered", paid=True)
        ticket, message = self.ticket(order, "food is spoiled")
        response = self.respond(ticket, message)
        reply = response.data["messages"][-1]
        self.assertIn("don’t eat", reply["body"])
        self.assertEqual(reply["actions"][-1]["kind"], "issue")
        self.assertEqual(reply["actions"][-1]["category"], "food_quality")
        self.assertFalse(RefundRequest.objects.exists())

    def test_refund_guidance_uses_actual_ledger_state_and_original_destination(self):
        order = self.order("delivered", paid=True)
        ticket, message = self.ticket(order, "refund my payment")
        result = self.respond(ticket, message)
        self.assertIn("original payment method", result.data["messages"][-1]["body"])
        self.assertEqual(RefundRequest.objects.count(), 0)
        refund = RefundRequest.objects.create(order=order, ticket=ticket, requested_amount=140, approved_amount=100, status="processing")
        newer = TicketMessage.objects.create(ticket=ticket, author=self.customer, body="refund status")
        response = self.respond(ticket, newer)
        self.assertIn("processing", response.data["messages"][-1]["body"])
        refund.refresh_from_db(); self.assertEqual(refund.status, "processing")

    def test_unpaid_refund_guidance_does_not_claim_capture_or_refund(self):
        ticket, message = self.ticket(self.order("cancelled"), "refund please")
        response = self.respond(ticket, message)
        self.assertIn("no confirmed payment", response.data["messages"][-1]["body"])

    @patch("api.support_assistant.structured_response")
    def test_classifier_only_gets_redacted_text_and_cannot_supply_an_answer(self, provider):
        provider.return_value = {"topic": "status", "reply": "Refund approved!", "to": "https://bad.example"}
        order = self.order("preparing")
        ticket, message = self.ticket(order, "bhai kidhar hai user@example.com 9988776655")
        response = self.respond(ticket, message)
        context = provider.call_args.args[1]
        self.assertEqual(list(context), ["message"])
        self.assertNotIn("user@example.com", context["message"])
        self.assertNotIn("9988776655", context["message"])
        self.assertNotIn("Refund approved", response.data["messages"][-1]["body"])
        self.assertIn("preparing", response.data["messages"][-1]["body"])

    @patch("api.support_assistant.structured_response", return_value=None)
    def test_provider_unavailable_has_useful_persisted_fallback(self, provider):
        ticket, message = self.ticket(body="Something unusual happened")
        self.assertEqual(self.respond(ticket, message).status_code, 200)
        self.assertIn("tell me a little more", TicketMessage.objects.get(reply_to=message).body)

    def test_customer_message_key_prevents_duplicate_replies_and_mismatched_retry(self):
        ticket, _ = self.ticket()
        path = f"/api/v1/support/{ticket.pk}/reply/"
        body = {"message": "Where is my order?", "client_id": str(uuid4())}
        self.assertEqual(self.client.post(path, body).status_code, 200)
        self.assertEqual(self.client.post(path, body).status_code, 200)
        self.assertEqual(self.client.post(path, {**body, "message": "Different text"}).status_code, 400)
        self.assertEqual(ticket.messages.filter(client_id=body["client_id"]).count(), 1)

    def test_stale_customer_message_cannot_generate_an_out_of_order_answer(self):
        ticket, message = self.ticket()
        TicketMessage.objects.create(ticket=ticket, author=self.customer, body="Where is my order?")
        self.assertEqual(self.respond(ticket, message).status_code, 200)
        self.assertFalse(TicketMessage.objects.filter(reply_to=message).exists())

    def test_team_handoff_is_idempotent_and_order_help_remains_available(self):
        ticket, message = self.ticket()
        path = f"/api/v1/support/{ticket.pk}/handoff/"
        self.assertEqual(self.client.post(path).status_code, 200)
        self.assertEqual(self.client.post(path).status_code, 200)
        self.respond(ticket, message)
        self.assertTrue(TicketMessage.objects.filter(reply_to=message).exists())
        self.assertEqual(AuditLog.objects.filter(action="support.team_requested").count(), 1)
        ticket.refresh_from_db(); self.assertTrue(ticket.staff_requested_at)

    def test_cancelled_cod_refund_conversation_has_contextual_choices_and_closure(self):
        order = self.order("cancelled")
        Payment.objects.filter(order=order).update(status="failed")
        ticket, _ = self.ticket(order)
        self.client.post(f"/api/v1/support/{ticket.pk}/handoff/")
        self.client.post(f"/api/v1/support/{ticket.pk}/resolve/")
        # Mirrors the reported case: a formerly resolved/queued ticket reopens.
        result = self.client.post(f"/api/v1/support/{ticket.pk}/reply/", {"message": "i would like to ask for refund"})
        message = ticket.messages.get(pk=result.data["messages"][-1]["id"])
        result = self.respond(ticket, message)
        self.assertIn("cash-on-delivery", result.data["messages"][-1]["body"])
        self.assertEqual([a["topic"] for a in result.data["messages"][-1]["actions"]], ["not_paid", "paid_cash", "unexpected_debit"])
        result = self.client.post(f"/api/v1/support/{ticket.pk}/reply/", {"message": "no"})
        message = ticket.messages.get(pk=result.data["messages"][-1]["id"])
        result = self.respond(ticket, message)
        self.assertIn("no money to refund", result.data["messages"][-1]["body"])
        self.assertEqual(result.data["messages"][-1]["actions"][0]["kind"], "resolve")
        self.assertEqual(self.client.post(f"/api/v1/support/{ticket.pk}/resolve/").status_code, 200)
        self.assertEqual(self.client.post(f"/api/v1/support/{ticket.pk}/feedback/", {"score": 5}).status_code, 200)
        self.assertFalse(RefundRequest.objects.exists())
        order.refresh_from_db(); self.assertEqual(order.status, "cancelled")
        self.assertEqual(order.payment.status, "failed")

    def test_yes_to_payment_question_asks_method_instead_of_inventing_payment(self):
        ticket, message = self.ticket(self.order("cancelled"), "refund please")
        self.respond(ticket, message)
        message = TicketMessage.objects.create(ticket=ticket, author=self.customer, body="haan")
        result = self.respond(ticket, message)
        self.assertIn("How did you pay", result.data["messages"][-1]["body"])
        self.assertFalse(RefundRequest.objects.exists())

    def test_not_paid_reply_cannot_overrule_a_confirmed_ledger_payment(self):
        ticket, message = self.ticket(self.order("cancelled", paid=True), "I did not pay")
        result = self.respond(ticket, message)
        self.assertIn("shows a payment", result.data["messages"][-1]["body"])
        self.assertNotIn("no money to refund", result.data["messages"][-1]["body"])

    def report_issue(self, ticket, **changes):
        return self.client.post(f"/api/v1/support/{ticket.pk}/report-issue/", {
            "category": "payment", "message": "I paid cash but the payment is not recorded.",
            "client_id": str(uuid4()), **changes,
        }, format="json")

    def test_unrecorded_payment_issue_stays_in_same_ticket_without_a_payout(self):
        order = self.order("cancelled")
        ticket, _ = self.ticket(order)
        key = str(uuid4())
        for _ in range(2):
            result = self.report_issue(ticket, client_id=key)
            self.assertEqual(result.status_code, 200, result.data)
        self.assertEqual(SupportTicket.objects.count(), 1)
        self.assertEqual(ticket.messages.count(), 3)
        self.assertIn("needs verification", result.data["messages"][-1]["body"])
        self.assertFalse(RefundRequest.objects.exists())
        self.assertEqual(AuditLog.objects.filter(action="support.issue_submitted").count(), 1)
        self.assertEqual(self.report_issue(ticket, client_id=key, message="Changed payment story").status_code, 400)
        self.assertEqual(self.report_issue(ticket, request_refund=True).status_code, 400)

    def test_paid_meal_issue_creates_one_refund_review_and_preserves_details(self):
        order = self.order("delivered", paid=True)
        ticket, _ = self.ticket(order)
        body = {"client_id": str(uuid4()), "category": "food_quality", "message": "The meal smelled sour and was not eaten.", "affected_item_ids": [order.items.first().pk], "request_refund": True}
        for _ in range(2):
            result = self.report_issue(ticket, **body)
            self.assertEqual(result.status_code, 200, result.data)
        self.assertEqual(SupportTicket.objects.count(), 1)
        self.assertEqual(RefundRequest.objects.count(), 1)
        self.assertEqual(result.data["refund_request"]["status"], "requested")
        self.assertEqual(result.data["affected_items"][0]["name"], self.item.name)
        self.assertEqual(order.payment.status, "paid")

    def test_issue_intake_checks_owner_items_and_delivery_state(self):
        order = self.order("preparing")
        ticket, _ = self.ticket(order)
        self.assertEqual(self.report_issue(ticket, affected_item_ids=[999999]).status_code, 400)
        self.assertEqual(self.report_issue(ticket, category="food_quality", affected_item_ids=[order.items.first().pk]).status_code, 400)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.report_issue(ticket).status_code, 403)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.report_issue(ticket).status_code, 404)

    def test_cancel_and_rating_answers_offer_owned_inline_actions(self):
        for status, topic, expected_kind in [("pending", "cancel", "cancel"), ("delivered", "review", "review")]:
            ticket, message = self.ticket(self.order(status), topic)
            result = self.respond(ticket, message)
            self.assertEqual(result.data["messages"][-1]["actions"][0]["kind"], expected_kind)

    def test_received_food_followup_checks_delivery_mismatch(self):
        ticket, message = self.ticket(self.order("preparing"), "food is spoiled")
        self.respond(ticket, message)
        message = TicketMessage.objects.create(ticket=ticket, author=self.customer, body="yes")
        result = self.respond(ticket, message)
        self.assertIn("delivery record needs checking", result.data["messages"][-1]["body"])
        self.assertEqual(result.data["messages"][-1]["actions"][0]["category"], "delivery")

    @patch("api.support_assistant.structured_response", return_value=None)
    def test_staff_question_resets_previous_automated_yes_no_context(self, provider):
        ticket, message = self.ticket(self.order("cancelled"), "refund please")
        self.respond(ticket, message)
        TicketMessage.objects.create(ticket=ticket, author=self.admin, body="Is there anything else you need?")
        message = TicketMessage.objects.create(ticket=ticket, author=self.customer, body="no")
        result = self.respond(ticket, message)
        self.assertNotIn("Since you didn’t pay", result.data["messages"][-1]["body"])

    def test_legacy_refunded_payment_is_not_presented_as_unpaid(self):
        order = self.order("cancelled")
        Payment.objects.filter(order=order).update(status="refunded")
        ticket, message = self.ticket(order, "refund status")
        result = self.respond(ticket, message)
        self.assertIn("already marked refunded", result.data["messages"][-1]["body"])
        self.assertFalse(RefundRequest.objects.exists())

    def test_refund_not_received_does_not_become_a_missing_delivery(self):
        order = self.order("delivered", paid=True)
        ticket, message = self.ticket(order, "I have not received my refund")
        refund = RefundRequest.objects.create(order=order, ticket=ticket, requested_amount=140, approved_amount=140, status="processed")
        result = self.respond(ticket, message)
        reply = result.data["messages"][-1]
        self.assertIn("original payment method", reply["body"])
        self.assertEqual(reply["actions"][-1]["category"], "refund")
        self.assertEqual(reply["actions"][-1]["label"], "Report refund not received")
        result = self.report_issue(ticket, category="refund", message="The refund is still not in my bank account.")
        self.assertEqual(result.status_code, 200, result.data)
        refund.refresh_from_db()
        self.assertEqual(refund.status, "processed")
        self.assertEqual(RefundRequest.objects.count(), 1)

    def test_rejected_refund_can_receive_details_without_new_approval(self):
        order = self.order("delivered", paid=True)
        ticket, message = self.ticket(order, "refund was rejected")
        refund = RefundRequest.objects.create(order=order, ticket=ticket, requested_amount=140, status="rejected")
        result = self.respond(ticket, message)
        self.assertEqual(result.data["messages"][-1]["actions"][-1]["kind"], "issue")
        result = self.report_issue(ticket, category="refund", message="Please check again; one of the dishes was missing.")
        self.assertEqual(result.status_code, 200, result.data)
        refund.refresh_from_db()
        self.assertEqual(refund.status, "rejected")
        self.assertEqual(RefundRequest.objects.count(), 1)

    def test_food_issue_can_add_affected_dishes_to_existing_review(self):
        order = self.order("delivered", paid=True)
        ticket, message = self.ticket(order, "food is spoiled")
        RefundRequest.objects.create(order=order, ticket=ticket, requested_amount=140)
        result = self.respond(ticket, message)
        self.assertEqual(result.data["messages"][-1]["actions"][-1]["category"], "food_quality")

    def test_payment_followup_does_not_ask_for_reported_details_again(self):
        ticket, _ = self.ticket(self.order("cancelled"))
        self.assertEqual(self.report_issue(ticket).status_code, 200)
        message = TicketMessage.objects.create(ticket=ticket, author=self.customer, body="refund status")
        result = self.respond(ticket, message)
        self.assertIn("already open for a payment check", result.data["messages"][-1]["body"])
        self.assertNotIn("Did you actually pay", result.data["messages"][-1]["body"])
        self.assertFalse(RefundRequest.objects.exists())

    def test_admin_shopper_is_requester_and_gets_real_replies(self):
        order = self.order("cancelled")
        order.customer = self.admin
        order.save()
        self.client.force_authenticate(self.admin)
        result = self.client.post("/api/v1/support/", {"order": order.pk, "category": "other", "subject": "My order", "message": "hi"})
        self.assertEqual(result.status_code, 201, result.data)
        self.assertTrue(result.data["viewer_is_requester"])
        ticket = SupportTicket.objects.get(pk=result.data["id"])
        reply = self.client.post(f"/api/v1/support/{ticket.pk}/reply/", {"message": "cancel my order"})
        self.assertFalse(reply.data["messages"][-1]["from_support"])
        self.assertIsNone(reply.data["staff_requested_at"])
        message = ticket.messages.order_by("id").last()
        response = self.respond(ticket, message)
        self.assertIn("already cancelled", response.data["messages"][-1]["body"])
        self.assertNotIn("cancel", [c["topic"] for c in response.data["quick_choices"]])

    def test_queued_quick_help_is_explicit_persisted_and_preserves_review(self):
        ticket, _ = self.ticket(self.order("cancelled"))
        self.client.post(f"/api/v1/support/{ticket.pk}/handoff/")
        ticket.refresh_from_db()
        queued_at = ticket.staff_requested_at
        body = {"topic": "refund", "client_id": str(uuid4())}
        for _ in range(2):
            result = self.client.post(f"/api/v1/support/{ticket.pk}/quick-help/", body)
            self.assertEqual(result.status_code, 200, result.data)
        message = ticket.messages.get(client_id=body["client_id"])
        reply = TicketMessage.objects.get(reply_to=message)
        self.assertIn("no confirmed payment", reply.body)
        ticket.refresh_from_db()
        self.assertEqual(ticket.staff_requested_at, queued_at)
        self.assertEqual(ticket.status, "in_progress")
        self.assertEqual(Notification.objects.filter(event_key=f"support-help:{reply.pk}").count(), 1)
        self.assertFalse(RefundRequest.objects.exists())
        self.client.force_authenticate(self.admin)
        result = self.client.get(f"/api/v1/support/{ticket.pk}/")
        self.assertFalse(result.data["viewer_is_requester"])
        self.assertEqual(result.data["quick_choices"], [])
        self.assertEqual(self.client.post(f"/api/v1/support/{ticket.pk}/quick-help/", body).status_code, 403)

    def test_quick_help_validates_topic_message_key_and_cross_ticket_access(self):
        ticket, _ = self.ticket(self.order("preparing"))
        path = f"/api/v1/support/{ticket.pk}/quick-help/"
        body = {"topic": "status", "client_id": str(uuid4())}
        self.assertEqual(self.client.post(path, body).status_code, 200)
        self.assertEqual(self.client.post(path, {**body, "topic": "cancel"}).status_code, 400)
        self.assertEqual(self.client.post(path, {**body, "topic": "approve_refund"}).status_code, 400)
        self.assertEqual(self.client.post(path, {"topic": "status"}).status_code, 400)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.post(path, body).status_code, 404)

    def test_choices_follow_actual_kitchen_and_delivery_state(self):
        for stage in ["preparing", "cancelled", "delivered"]:
            ticket, _ = self.ticket(self.order(stage))
            result = self.client.get(f"/api/v1/support/{ticket.pk}/")
            choices = {choice["topic"] for choice in result.data["quick_choices"]}
            self.assertNotIn("cancel", choices)
            self.assertEqual("food_quality" in choices, stage == "delivered")
            self.assertEqual("review" in choices, stage == "delivered")

    def test_delegated_admin_can_use_own_help_but_not_other_tickets(self):
        other_ticket, _ = self.ticket()
        AdminAccessGrant.objects.create(user=self.admin, full_access=False, scopes=["catalog"])
        self.client.force_authenticate(self.admin)
        result = self.client.post("/api/v1/support/", {"category": "other", "subject": "Account help", "message": "hi"})
        self.assertEqual(result.status_code, 201)
        own_id = result.data["id"]
        listing = self.client.get("/api/v1/support/?view=mine")
        self.assertEqual([row["id"] for row in listing.data["results"]], [own_id])
        self.assertEqual(self.client.get(f"/api/v1/support/{own_id}/").status_code, 200)
        self.assertEqual(self.client.get(f"/api/v1/support/{other_ticket.pk}/?view=mine").status_code, 403)
        self.assertEqual(self.client.get("/api/v1/support/?view=team").status_code, 403)

    def test_admin_and_superuser_cannot_act_as_kitchen_or_courier(self):
        for elevated in [False, True]:
            self.admin.is_superuser = elevated
            self.admin.is_available = True
            self.admin.save()
            self.client.force_authenticate(self.admin)
            order = self.order("ready")
            for stage in ["confirmed", "preparing", "ready", "delivered", "cancelled"]:
                self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": stage}).status_code, 403)
            for action in ["accept", "pickup"]:
                self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/{action}/").status_code, 403)
            self.assertEqual(self.client.get("/api/v1/orders/available/").status_code, 403)
            order.refresh_from_db()
            self.assertEqual(order.status, "ready")
            self.assertFalse(DeliveryAssignment.objects.filter(order=order).exists())

    def test_kitchen_to_courier_lifecycle_needs_no_admin(self):
        order = self.order()
        order.delivery_code = "741852"
        order.save()
        self.client.force_authenticate(self.owner)
        for stage in ["confirmed", "preparing", "ready"]:
            result = self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": stage, "expected_status": order.status})
            self.assertEqual(result.status_code, 200, result.data)
            order.refresh_from_db()
        self.client.force_authenticate(self.rider)
        for action in ["accept", "pickup"]:
            self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/{action}/").status_code, 200)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": "delivered", "delivery_code": "000000"}).status_code, 400)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": "delivered", "delivery_code": "741852"}).status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.status, "delivered")
        self.assertEqual(order.payment.status, "paid")
        self.assertFalse(AuditLog.objects.filter(actor=self.admin).exists())

    def test_elevated_partner_cannot_change_another_partners_order(self):
        stranger = User.objects.create_user("other-kitchen@test.example", "test-password", role="restaurant", is_superuser=True)
        order = self.order()
        self.client.force_authenticate(stranger)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": "confirmed"}).status_code, 404)
        stranger.role = "delivery"
        stranger.save()
        order.status = "out_for_delivery"
        order.save()
        DeliveryAssignment.objects.create(order=order, partner=self.rider)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": "delivered"}).status_code, 404)

    def test_staff_reply_takes_over_without_bot_interruption(self):
        ticket, message = self.ticket()
        self.client.force_authenticate(self.admin)
        self.client.post(f"/api/v1/support/{ticket.pk}/reply/", {"message": "I am reviewing this case."})
        self.client.force_authenticate(self.customer)
        self.respond(ticket, message)
        self.assertFalse(TicketMessage.objects.filter(reply_to=message).exists())

    def test_kitchen_hold_is_owned_and_blocks_customer_cancel_and_progress(self):
        order = self.order()
        self.assertEqual(self.operation(order).status_code, 403)
        self.client.force_authenticate(self.owner)
        result = self.operation(order)
        self.assertEqual(result.status_code, 200, result.data)
        self.assertTrue(result.data["fulfillment_paused_at"])
        self.assertEqual(self.operation(order).data["fulfillment_issue"], result.data["fulfillment_issue"])
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": "confirmed"}).status_code, 400)
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/cancel/").status_code, 400)
        self.assertEqual(self.client.post(f"/api/v1/support/{result.data['fulfillment_issue']}/resolve/").status_code, 400)

    def test_hold_removes_ready_order_from_dispatch_and_blocks_direct_accept(self):
        order = self.order("ready")
        self.client.force_authenticate(self.owner); self.operation(order)
        self.client.force_authenticate(self.rider)
        self.assertEqual(self.client.get("/api/v1/orders/available/").data["count"], 0)
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/accept/").status_code, 400)
        self.assertFalse(DeliveryAssignment.objects.exists())

    def test_hold_prevents_pickup_and_delivery(self):
        for status in ["assigned", "out_for_delivery"]:
            order = self.order(status)
            DeliveryAssignment.objects.create(order=order, partner=self.rider)
            self.client.force_authenticate(self.admin); self.operation(order)
            self.client.force_authenticate(self.rider)
            path = "pickup" if status == "assigned" else "status"
            self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/{path}/", {"status": "delivered"}).status_code, 400)

    def test_only_admin_resumes_and_stage_is_preserved(self):
        order = self.order("preparing")
        self.client.force_authenticate(self.owner); self.operation(order)
        self.assertEqual(self.operation(order, "resume").status_code, 403)
        self.client.force_authenticate(self.admin)
        result = self.operation(order, "resume")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.data["status"], "preparing")
        self.assertIsNone(result.data["fulfillment_paused_at"])

    def test_staff_cancellation_approves_original_method_obligation_without_sending_money(self):
        order = self.order("preparing", paid=True)
        self.client.force_authenticate(self.owner); self.operation(order)
        self.client.force_authenticate(self.admin)
        result = self.operation(order, "cancel", confirm_cancel=True, refund_amount="140.00")
        self.assertEqual(result.status_code, 200, result.data)
        self.assertEqual(result.data["status"], "cancelled")
        refund = RefundRequest.objects.get(order=order)
        self.assertEqual(refund.status, "approved")
        self.assertEqual(refund.approved_amount, Decimal("140"))
        self.assertFalse(refund.automatic_cancellation)
        self.assertEqual(Payment.objects.get(order=order).status, "paid")
        self.item.refresh_from_db(); self.assertEqual(self.item.stock_quantity, 9)
        self.assertEqual(self.operation(order, "cancel", confirm_cancel=True, refund_amount="140").status_code, 400)
        self.assertEqual(RefundRequest.objects.count(), 1)

    def test_full_refund_approval_can_use_the_same_requested_support_review(self):
        order = self.order(paid=True)
        ticket, _ = self.ticket(order)
        refund = RefundRequest.objects.create(order=order, ticket=ticket, requested_amount=140)
        self.client.force_authenticate(self.admin)
        result = self.operation(order, "cancel", confirm_cancel=True, refund_amount="140", ticket_id=ticket.pk)
        self.assertEqual(result.status_code, 200, result.data)
        refund.refresh_from_db(); self.assertEqual(refund.status, "approved")
        self.assertEqual(RefundRequest.objects.count(), 1)

    def test_staff_cancellation_requires_exact_amount_confirmation_and_fresh_stage(self):
        order = self.order(paid=True)
        self.client.force_authenticate(self.admin)
        for changes in [{"confirm_cancel": False, "refund_amount": "140"}, {"confirm_cancel": True, "refund_amount": "10"}, {"confirm_cancel": True, "refund_amount": "140", "expected_status": "preparing"}]:
            self.assertEqual(self.operation(order, "cancel", **changes).status_code, 400)
        order.refresh_from_db(); self.assertEqual(order.status, "pending")
        self.assertFalse(RefundRequest.objects.exists())

    def test_refund_conflict_or_cash_capture_cannot_be_silently_refunded(self):
        order = self.order(paid=True)
        ticket, _ = self.ticket(order)
        RefundRequest.objects.create(order=order, ticket=ticket, requested_amount=140, approved_amount=20, status="processing")
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.operation(order, "cancel", confirm_cancel=True, refund_amount="140").status_code, 400)
        cash = self.order(paid=True, method="cod")
        self.assertEqual(self.operation(cash, "cancel", confirm_cancel=True, refund_amount="140").status_code, 400)

    def test_support_cancellation_releases_uncooked_inventory_only_once(self):
        order = self.order()
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.operation(order, "cancel", confirm_cancel=True).status_code, 200)
        self.assertEqual(self.operation(order, "cancel", confirm_cancel=True).status_code, 400)
        self.item.refresh_from_db(); self.assertEqual(self.item.stock_quantity, 10)

    def test_other_kitchen_and_terminal_orders_cannot_use_operations(self):
        stranger = User.objects.create_user("support-stranger@test.example", "Support-test-2026", role="restaurant")
        order = self.order()
        self.client.force_authenticate(stranger)
        self.assertEqual(self.operation(order).status_code, 404)
        self.client.force_authenticate(self.admin)
        for status in ["delivered", "cancelled", "awaiting_payment"]:
            self.assertEqual(self.operation(self.order(status)).status_code, 400)
