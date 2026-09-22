from uuid import uuid4
from django.core.cache import cache
from rest_framework.test import APITestCase
from .models import Address, DeliveryAssignment, DeliveryMessage, Notification, Order, Restaurant, User


class DeliveryChatTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user("chat-customer@example.test")
        self.other = User.objects.create_user("chat-other@example.test")
        self.courier = User.objects.create_user("chat-courier@example.test", role="delivery")
        self.replacement = User.objects.create_user("chat-replacement@example.test", role="delivery")
        self.owner = User.objects.create_user("chat-owner@example.test", role="restaurant")
        self.admin = User.objects.create_user("chat-admin@example.test", role="admin")
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Chat kitchen", city="Delhi", address="Kitchen")
        self.address = Address.objects.create(user=self.customer, line1="Private street", city="Delhi", state="Delhi", postal_code="110001")
        self.order = Order.objects.create(customer=self.customer, restaurant=self.restaurant, delivery_address=self.address, status="assigned", subtotal=100, total=100)
        self.assignment = DeliveryAssignment.objects.create(order=self.order, partner=self.courier)
        self.url = f"/api/v1/delivery-chat/{self.order.pk}/"
        self.client.force_authenticate(self.customer)

    def send(self, text="Meet at the main gate", client_id=None):
        return self.client.post(self.url+"send/", {"text": text, "client_id": client_id or str(uuid4())}, format="json")

    def test_persisted_exchange_and_read_receipts(self):
        sent = self.send()
        self.assertEqual(sent.status_code, 201)
        self.assertTrue(sent.data["mine"])
        self.assertIsNone(sent.data["read_at"])
        notification = Notification.objects.get(user=self.courier)
        self.assertNotIn("main gate", notification.message)
        self.assertEqual(notification.metadata["order_id"], self.order.pk)
        self.client.force_authenticate(self.courier)
        response = self.client.get(self.url)
        self.assertEqual(response.data["unread"], 1)
        self.assertFalse(response.data["messages"][0]["mine"])
        self.assertNotIn("email", str(response.data))
        self.assertEqual(response["Cache-Control"], "private, no-store")
        self.assertEqual(self.client.post(self.url+"read/", {"last_id": sent.data["id"]}).status_code, 200)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
        self.assertEqual(self.client.get(self.url).data["unread"], 0)
        self.assertEqual(self.send("I will meet you there").status_code, 201)
        self.client.force_authenticate(self.customer)
        response = self.client.get(self.url).data
        self.assertEqual(len(response["messages"]), 2)
        self.assertIsNotNone(response["messages"][0]["read_at"])

    def test_unrelated_users_staff_and_guests_cannot_access(self):
        self.send()
        for user in [self.other, self.replacement, self.owner, self.admin, None]:
            self.client.force_authenticate(user)
            expected = 401 if user is None else 404
            self.assertEqual(self.client.get(self.url).status_code, expected)
            self.assertEqual(self.send().status_code, expected)
            self.assertEqual(self.client.post(self.url+"read/", {"last_id": 999}).status_code, expected)

    def test_retry_safe_messages_and_notification_deduplication(self):
        key = str(uuid4())
        first = self.send(client_id=key)
        retry = self.send(client_id=key)
        self.assertEqual(retry.status_code, 200)
        self.assertEqual(retry.data["id"], first.data["id"])
        self.assertEqual(self.send("different", key).status_code, 409)
        self.assertEqual(DeliveryMessage.objects.count(), 1)
        self.assertEqual(Notification.objects.count(), 1)

    def test_stage_rules_cannot_be_bypassed(self):
        for state in ["pending", "confirmed", "preparing", "ready", "awaiting_payment", "cancelled", "delivered"]:
            self.order.status = state
            self.order.save()
            self.assertFalse(self.client.get(self.url).data["can_send"])
            self.assertEqual(self.send().status_code, 409)
        self.assertEqual(DeliveryMessage.objects.count(), 0)

    def test_terminal_history_is_retained_and_retry_works(self):
        key = str(uuid4())
        self.send(client_id=key)
        self.order.status = "delivered"
        self.order.save()
        self.assertEqual(len(self.client.get(self.url).data["messages"]), 1)
        self.assertEqual(self.send(client_id=key).status_code, 200)
        self.assertEqual(self.send().status_code, 409)

    def test_reassignment_does_not_expose_previous_conversation(self):
        key = str(uuid4())
        self.send(client_id=key)
        self.assignment.partner = self.replacement
        self.assignment.save()
        self.client.force_authenticate(self.replacement)
        self.assertEqual(self.client.get(self.url).data["messages"], [])
        self.client.force_authenticate(self.courier)
        self.assertEqual(self.client.get(self.url).status_code, 404)
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.send(client_id=key).status_code, 409)
        self.assertEqual(self.send("New pickup instructions").status_code, 201)

    def test_message_validation(self):
        for text in ["", "  ", "a"*1001]:
            self.assertEqual(self.send(text).status_code, 400)
        self.assertEqual(self.send(client_id="invalid").status_code, 400)
        self.assertEqual(self.client.get(self.url+"?before=bad").status_code, 400)
        self.assertEqual(self.client.get(self.url+"?before=-1").status_code, 400)
        self.assertEqual(self.client.post(self.url+"read/", {}).status_code, 400)

    def test_message_pagination_is_chronological_and_bounded(self):
        DeliveryMessage.objects.bulk_create([DeliveryMessage(order=self.order, author=self.customer, partner=self.courier, text=str(i), client_id=uuid4()) for i in range(65)])
        page = self.client.get(self.url).data
        self.assertEqual(len(page["messages"]), 50)
        self.assertEqual(page["messages"][0]["text"], "15")
        earlier = self.client.get(self.url+f"?before={page['next_before']}").data
        self.assertEqual(len(earlier["messages"]), 15)
        self.assertIsNone(earlier["next_before"])
        self.assertEqual(earlier["messages"][-1]["text"], "14")

    def test_unassigned_customer_gets_closed_state(self):
        self.assignment.delete()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["partner_assigned"])
        self.assertFalse(response.data["can_send"])
        self.assertEqual(self.send().status_code, 409)

    def test_messages_never_advance_orders_or_payments(self):
        self.send("Cancel and refund this order")
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "assigned")
