"""Money/reward contention must be exercised with PostgreSQL row locks."""
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from unittest import skipUnless
from uuid import uuid4
from django.db import connection, connections
from django.db.models import Sum
from django.test import TransactionTestCase
from rest_framework.test import APIClient
from .models import Address, Cart, CartItem, MenuItem, Order, Payment, Restaurant, RewardAccount, RewardEntry, RewardPolicy, User
from .rewards import sync_order_rewards


@skipUnless(connection.vendor == "postgresql", "Requires PostgreSQL row locks")
class RewardConcurrencyTests(TransactionTestCase):
    def setUp(self):
        owner=User.objects.create_user("reward-race-owner@example.test",role="restaurant")
        self.user=User.objects.create_user("reward-race-customer@example.test")
        friend=User.objects.create_user("reward-race-friend@example.test")
        kitchen=Restaurant.objects.create(owner=owner,name="Reward race",city="Delhi",is_approved=True)
        self.item=MenuItem.objects.create(restaurant=kitchen,name="Meal",price=200,stock_quantity=10)
        self.address=Address.objects.create(user=self.user,line1="Fixture",city="Delhi",state="Delhi",postal_code="110001")
        self.cart=Cart.objects.create(user=self.user,restaurant=kitchen)
        self.friend=RewardAccount.objects.create(user=friend)
        self.account=RewardAccount.objects.create(user=self.user,referred_by=friend)
        RewardPolicy.objects.create(pk=1,enabled=True,points_per_100=10,point_value="0.50",redemption_percent=50,cashback_percent=10,cashback_cap=50,referral_credit=30,referral_minimum=100)
        self.client=APIClient();self.client.force_authenticate(self.user)

    def place(self):
        CartItem.objects.create(cart=self.cart,menu_item=self.item,quantity=1)
        body={"address_id":self.address.pk,"checkout_key":str(uuid4())}
        quote=self.client.post("/api/v1/cart/quote/",body,format="json")
        response=self.client.post("/api/v1/cart/checkout/",{**body,"quote_token":quote.data["quote_token"]},format="json")
        self.assertEqual(response.status_code,201,response.data)
        return Order.objects.get(pk=response.data["id"])

    def run_race(self, fn, inputs):
        barrier=Barrier(2)
        def task(value):
            try:
                barrier.wait(timeout=10)
                return fn(value)
            finally:
                connections.close_all()
        with ThreadPoolExecutor(max_workers=2) as pool:
            return list(pool.map(task,inputs))

    def delivered_state(self, order):
        Order.objects.filter(pk=order.pk).update(status="delivered")
        Payment.objects.filter(order=order).update(status="paid")

    def test_concurrent_delivery_callbacks_earn_and_refer_once(self):
        order=self.place();self.delivered_state(order)
        self.run_race(lambda pk: sync_order_rewards(Order.objects.get(pk=pk)),[order.pk,order.pk])
        self.account.refresh_from_db();self.friend.refresh_from_db()
        self.assertEqual((self.account.points,self.account.credits,self.friend.credits),(20,50,30))
        self.assertEqual(RewardEntry.objects.count(),3)

    def test_two_qualifying_deliveries_cannot_grant_two_referral_bonuses(self):
        first,second=self.place(),self.place()
        self.delivered_state(first);self.delivered_state(second)
        self.run_race(lambda pk: sync_order_rewards(Order.objects.get(pk=pk)),[first.pk,second.pk])
        self.account.refresh_from_db();self.friend.refresh_from_db()
        self.assertEqual((self.account.points,self.account.credits,self.friend.credits),(40,70,30))
        self.assertEqual(RewardEntry.objects.filter(kind="referral").count(),2)
        self.assertIn(self.account.referral_order_id,[first.pk,second.pk])

    def test_duplicate_checkout_does_not_debit_twice(self):
        first=self.place();self.delivered_state(first);sync_order_rewards(first)
        CartItem.objects.create(cart=self.cart,menu_item=self.item,quantity=1)
        body={"address_id":self.address.pk,"checkout_key":str(uuid4()),"reward_points":10,"reward_credits":"10"}
        quote=self.client.post("/api/v1/cart/quote/",body,format="json")
        body["quote_token"]=quote.data["quote_token"]
        def checkout(_):
            client=APIClient();client.force_authenticate(User.objects.get(pk=self.user.pk))
            return client.post("/api/v1/cart/checkout/",body,format="json").status_code
        self.assertEqual(self.run_race(checkout,[1,2]),[201,201])
        self.account.refresh_from_db()
        self.assertEqual((self.account.points,self.account.credits),(10,40))
        self.assertEqual(RewardEntry.objects.filter(kind="redeem").count(),1)
        balances=self.account.entries.aggregate(points=Sum("points"),credits=Sum("credits"))
        self.assertEqual((self.account.points,self.account.credits),(balances["points"],balances["credits"]))
