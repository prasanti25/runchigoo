from decimal import Decimal
from datetime import timedelta
from uuid import uuid4
from django.db import transaction
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import (Address, AdminAccessGrant, AuditLog, Cart, CartItem, Coupon, DeliveryAssignment,
                     MenuItem, Order, Payment, RefundRequest, Restaurant, RewardAccount, RewardEntry,
                     RewardPolicy, SupportTicket, User)
from .rewards import account_summary, policy_data, sync_order_rewards
from .refunds import record_provider_refund
from .payment_expiry import expire_locked_order


class RewardTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = User.objects.create_user("rewards@example.test")
        cls.friend = User.objects.create_user("rewards-friend@example.test")
        cls.owner = User.objects.create_user("rewards-kitchen@example.test", role="restaurant")
        cls.admin = User.objects.create_user("rewards-admin@example.test", role="admin")
        cls.restaurant = Restaurant.objects.create(owner=cls.owner, name="Rewards kitchen", city="Delhi", is_approved=True)
        cls.item = MenuItem.objects.create(restaurant=cls.restaurant, name="Meal", price=200, stock_quantity=100)
        cls.address = Address.objects.create(user=cls.customer, line1="Fixture", city="Delhi", state="Delhi", postal_code="110001")
        cls.cart = Cart.objects.create(user=cls.customer, restaurant=cls.restaurant)
        cls.policy = RewardPolicy.objects.create(pk=1, enabled=True, points_per_100=10, point_value="0.50", redemption_percent=50,
            cashback_percent=10, cashback_cap=50, referral_credit=30, referral_minimum=100,
            tiers=[{"name":"Member", "points":0}, {"name":"Regular", "points":20}])
        cls.account = RewardAccount.objects.create(user=cls.customer)
        cls.friend_account = RewardAccount.objects.create(user=cls.friend)

    def setUp(self):
        self.client.force_authenticate(self.customer)
        CartItem.objects.create(cart=self.cart, menu_item=self.item, quantity=1)

    def quote(self, **kwargs):
        response = self.client.post("/api/v1/cart/quote/", {"address_id":self.address.pk, **kwargs}, format="json")
        return response

    def checkout(self, **kwargs):
        quote = self.quote(**kwargs)
        self.assertEqual(quote.status_code, 200, quote.data)
        body = {"address_id":self.address.pk, "quote_token":quote.data["quote_token"], "checkout_key":str(uuid4()), **kwargs}
        response = self.client.post("/api/v1/cart/checkout/", body, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        return Order.objects.get(pk=response.data["id"]), body

    def delivered(self, order):
        Order.objects.filter(pk=order.pk).update(status="delivered")
        Payment.objects.filter(order=order).update(status="paid")
        sync_order_rewards(order)

    def seed(self):
        order, _ = self.checkout()
        self.delivered(order)
        CartItem.objects.create(cart=self.cart, menu_item=self.item, quantity=1)
        return order

    def refund(self, order, amount):
        Payment.objects.filter(order=order).update(method="razorpay", transaction_id=f"pay_{order.pk}")
        ticket = SupportTicket.objects.create(user=self.customer, order=order, category="refund", subject="Fixture")
        refund = RefundRequest.objects.create(order=order, ticket=ticket, requested_amount=amount, approved_amount=amount, status="processing")
        payload = {"id":f"rfnd_{refund.pk}", "payment_id":f"pay_{order.pk}", "currency":"INR", "amount":int(Decimal(amount)*100), "status":"processed"}
        record_provider_refund(payload, expected_refund_id=refund.pk)
        return refund, payload

    def test_earn_only_after_collected_delivery_and_reconcile_idempotently(self):
        order, _ = self.checkout()
        sync_order_rewards(order)
        self.assertFalse(RewardEntry.objects.exists())
        Order.objects.filter(pk=order.pk).update(status="delivered")
        sync_order_rewards(order)
        self.assertFalse(RewardEntry.objects.exists())
        self.delivered(order)
        sync_order_rewards(order)
        self.account.refresh_from_db()
        self.assertEqual((self.account.points, self.account.credits), (20, 20))
        self.assertEqual(RewardEntry.objects.count(), 1)
        self.assertEqual(account_summary(self.customer)["tier"], "Regular")

    def test_checkout_debit_retry_and_customer_cancel_return_once(self):
        self.seed()
        order, body = self.checkout(reward_points=10, reward_credits="10.00")
        self.assertEqual((order.reward_discount, order.total, order.payment.amount), (15, 225, 225))
        retry = self.client.post("/api/v1/cart/checkout/", body, format="json")
        self.assertEqual(retry.data["id"], order.pk)
        self.account.refresh_from_db()
        self.assertEqual((self.account.points, self.account.credits), (10,10))
        self.assertEqual(self.client.post(f"/api/v1/orders/{order.pk}/cancel/", {"reason":"changed_mind"}).status_code, 200)
        sync_order_rewards(order)
        self.account.refresh_from_db()
        self.assertEqual((self.account.points, self.account.credits), (20,20))
        self.assertEqual(RewardEntry.objects.filter(order=order, kind="restore").count(), 1)

    def test_merchant_cancel_after_preparing_restores_rewards_not_food(self):
        self.seed()
        order, _ = self.checkout(reward_points=10)
        Order.objects.filter(pk=order.pk).update(status="preparing")
        self.client.force_authenticate(self.owner)
        response = self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status":"cancelled"})
        self.assertEqual(response.status_code, 200, response.data)
        self.account.refresh_from_db(); self.item.refresh_from_db()
        self.assertEqual(self.account.points,20)
        self.assertEqual(self.item.stock_quantity,98)

    def test_expired_online_checkout_restores_even_if_program_disabled(self):
        self.seed()
        order, _ = self.checkout(reward_points=10, reward_credits=5)
        Order.objects.filter(pk=order.pk).update(status="awaiting_payment", payment_expires_at=timezone.now()-timedelta(seconds=1))
        RewardPolicy.objects.filter(pk=1).update(enabled=False)
        order.refresh_from_db()
        with transaction.atomic():
            self.assertTrue(expire_locked_order(order, order.payment))
        sync_order_rewards(order)
        self.account.refresh_from_db()
        self.assertEqual((self.account.points,self.account.credits),(20,20))

    def test_redeeming_cannot_touch_delivery_tips_or_exceed_coupon_net_cap(self):
        self.seed()
        coupon = Coupon.objects.create(code="REWARDNET", discount_amount=180, starts_at=timezone.now()-timedelta(days=1),ends_at=timezone.now()+timedelta(days=1))
        self.assertEqual(self.quote(coupon_code=coupon.code,reward_credits=11).status_code,400)
        order, _ = self.checkout(coupon_code=coupon.code,reward_credits=10)
        self.assertEqual((order.discount,order.reward_discount,order.delivery_fee,order.total),(180,10,40,50))

    def test_invalid_amounts_balances_disabled_program_and_unquoted_checkout(self):
        for body in [{"reward_points":-1},{"reward_points":1.5},{"reward_points":1},{"reward_credits":"NaN"},{"reward_credits":1}]:
            self.assertEqual(self.quote(**body).status_code,400)
        self.assertEqual(self.client.post("/api/v1/cart/checkout/",{"address_id":self.address.pk},format="json").status_code,400)
        RewardPolicy.objects.filter(pk=1).update(enabled=False)
        self.assertEqual(self.quote(reward_points=1).status_code,400)
        self.assertEqual(self.quote().status_code,200)

    def test_quote_invalidated_on_policy_balance_or_requested_amount_change(self):
        self.seed()
        quote = self.quote(reward_points=10)
        body = {"address_id":self.address.pk,"reward_points":11,"quote_token":quote.data["quote_token"]}
        self.assertEqual(self.client.post("/api/v1/cart/checkout/",body,format="json").status_code,400)
        body["reward_points"]=10
        RewardAccount.objects.filter(pk=self.account.pk).update(revision=20)
        self.assertEqual(self.client.post("/api/v1/cart/checkout/",body,format="json").status_code,400)
        quote = self.quote(reward_points=10);body["quote_token"]=quote.data["quote_token"]
        RewardPolicy.objects.filter(pk=1).update(revision=5)
        self.assertEqual(self.client.post("/api/v1/cart/checkout/",body,format="json").status_code,400)

    def test_refund_adjusts_only_on_confirmation_and_webhook_retry_is_safe(self):
        order = self.seed()
        ticket = SupportTicket.objects.create(user=self.customer,order=order,category="refund",subject="Pending")
        RefundRequest.objects.create(order=order,ticket=ticket,requested_amount=120,approved_amount=120,status="approved")
        sync_order_rewards(order)
        self.account.refresh_from_db();self.assertEqual(self.account.points,20)
        refund,payload=self.refund(order,120)
        self.account.refresh_from_db();self.assertEqual((self.account.points,self.account.credits),(10,10))
        count=RewardEntry.objects.count()
        record_provider_refund(payload,expected_refund_id=refund.pk)
        sync_order_rewards(order)
        self.assertEqual(RewardEntry.objects.count(),count)

    def test_partial_refund_restores_proportional_redemption_then_full_refund(self):
        self.seed()
        order,_=self.checkout(reward_points=10,reward_credits=10)
        self.delivered(order)
        self.refund(order,Decimal("112.50"))
        restore=RewardEntry.objects.filter(order=order,kind="restore").first()
        self.assertEqual((restore.points,restore.credits),(5,5))
        self.refund(order,Decimal("112.50"))
        self.account.refresh_from_db()
        self.assertEqual((self.account.points,self.account.credits),(20,20))

    def test_spent_rewards_clawback_can_leave_adjustment_not_fake_money(self):
        first=self.seed()
        self.checkout(reward_points=20,reward_credits=20)
        self.refund(first,240)
        summary=account_summary(self.customer)
        self.assertTrue(summary["adjustment_due"])
        self.assertEqual((summary["points"],Decimal(summary["credits"])),(-20,-20))

    def test_referral_first_qualifying_order_only_and_refund_reverses_both(self):
        response=self.client.post("/api/v1/rewards/referral/",{"code":str(self.friend_account.referral_code)},format="json")
        self.assertEqual(response.status_code,200,response.data)
        order=self.seed()
        self.friend_account.refresh_from_db();self.account.refresh_from_db()
        self.assertEqual((self.friend_account.credits,self.account.credits),(30,50))
        self.client.force_authenticate(self.friend)
        history=self.client.get("/api/v1/rewards/history/").data["results"]
        self.assertIsNone(history[0]["order"])
        self.client.force_authenticate(self.customer)
        second,_=self.checkout();self.delivered(second)
        self.assertEqual(RewardEntry.objects.filter(kind="referral").count(),2)
        self.refund(order,240)
        self.friend_account.refresh_from_db();self.assertEqual(self.friend_account.credits,0)
        sync_order_rewards(second)
        self.friend_account.refresh_from_db();self.assertEqual(self.friend_account.credits,0)

    def test_referral_no_self_cycles_changes_or_claims_after_order(self):
        self.assertEqual(self.client.post("/api/v1/rewards/referral/",{"code":str(self.account.referral_code)},format="json").status_code,400)
        body={"code":str(self.friend_account.referral_code)}
        self.assertEqual(self.client.post("/api/v1/rewards/referral/",body,format="json").status_code,200)
        self.assertEqual(self.client.post("/api/v1/rewards/referral/",body,format="json").status_code,200)
        self.client.force_authenticate(self.friend)
        self.assertEqual(self.client.post("/api/v1/rewards/referral/",{"code":str(self.account.referral_code)},format="json").status_code,400)
        self.client.force_authenticate(self.customer)
        self.checkout()
        self.assertEqual(self.client.post("/api/v1/rewards/referral/",body,format="json").status_code,400)

    def test_scope_ownership_no_balance_write_and_paginated_history(self):
        self.seed()
        self.client.force_authenticate(self.friend)
        self.assertEqual(self.client.get("/api/v1/rewards/history/").data["count"],0)
        self.assertEqual(self.client.patch("/api/v1/rewards/",{"credits":999}).status_code,405)
        self.assertEqual(self.client.get("/api/v1/reward-policy/").status_code,403)
        self.client.force_authenticate(self.admin)
        AdminAccessGrant.objects.create(user=self.admin,scopes=[])
        self.assertEqual(self.client.get("/api/v1/rewards/").status_code,200)
        self.assertEqual(self.client.get("/api/v1/reward-policy/").status_code,403)

    def test_policy_validation_revision_audit_and_default_disabled(self):
        self.client.force_authenticate(self.admin)
        AdminAccessGrant.objects.create(user=self.admin,scopes=["policies"])
        body={**policy_data(),"reason":"Approved isolated test policy"}
        self.assertEqual(self.client.post("/api/v1/reward-policy/configure/",{**body,"tiers":[{"name":"One","points":10},{"name":"Two","points":5}]},format="json").status_code,400)
        self.assertEqual(self.client.post("/api/v1/reward-policy/configure/",body,format="json").status_code,200)
        self.assertEqual(self.client.post("/api/v1/reward-policy/configure/",body,format="json").status_code,409)
        self.assertEqual(AuditLog.objects.filter(action="rewards.policy_configured").count(),1)
        self.assertFalse(RewardPolicy().enabled)

    def test_existing_orders_never_gain_rewards_retroactively(self):
        RewardPolicy.objects.filter(pk=1).update(enabled=False)
        order,_=self.checkout()
        RewardPolicy.objects.filter(pk=1).update(enabled=True)
        self.delivered(order)
        self.assertFalse(RewardEntry.objects.exists())

    def test_actual_delivery_endpoint_earns_after_cod_collection(self):
        order,_=self.checkout()
        rider=User.objects.create_user("reward-rider@example.test",role="delivery")
        DeliveryAssignment.objects.create(order=order,partner=rider,pickup_at=timezone.now())
        Order.objects.filter(pk=order.pk).update(status="out_for_delivery")
        self.client.force_authenticate(rider)
        response=self.client.post(f"/api/v1/orders/{order.pk}/status/",{"status":"delivered","delivery_code":order.delivery_code})
        self.assertEqual(response.status_code,200,response.data)
        self.account.refresh_from_db();self.assertEqual(self.account.points,20)
