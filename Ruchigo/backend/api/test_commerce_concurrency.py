"""Real PostgreSQL contention checks; SQLite cannot establish row-lock safety."""
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from unittest import skipUnless
from uuid import uuid4
from django.db import connection, connections
from django.test import TransactionTestCase
from django.utils import timezone
from rest_framework.test import APIClient
from .models import Address, Cart, CartItem, Coupon, MenuItem, Order, Restaurant, User


@skipUnless(connection.vendor == "postgresql", "Requires PostgreSQL row locks")
class CommerceConcurrencyTests(TransactionTestCase):
    def setUp(self):
        owner = User.objects.create_user("concurrency-owner@example.test",role="restaurant")
        restaurant = Restaurant.objects.create(owner=owner,name="Concurrent kitchen",city="Delhi",is_approved=True)
        self.item = MenuItem.objects.create(restaurant=restaurant,name="Meal",price=100,stock_quantity=10)
        self.coupon = Coupon.objects.create(code="CONCURRENT",restaurant=restaurant,benefit_type="bogo",bogo_item=self.item,usage_limit=1,starts_at=timezone.now()-timezone.timedelta(days=1),ends_at=timezone.now()+timezone.timedelta(days=1))
        self.checkouts = []
        for index in range(2):
            user = User.objects.create_user(f"concurrency-{index}@example.test")
            address = Address.objects.create(user=user,line1="Fixture",city="Delhi",state="Delhi",postal_code="110001")
            cart = Cart.objects.create(user=user,restaurant=restaurant)
            CartItem.objects.create(cart=cart,menu_item=self.item,quantity=2)
            client = APIClient();client.force_authenticate(user)
            body = {"address_id":address.pk,"coupon_code":self.coupon.code,"checkout_key":str(uuid4())}
            quote = client.post("/api/v1/cart/quote/",body,format="json")
            self.assertEqual(quote.status_code,200,quote.data)
            self.checkouts.append((user.pk,{**body,"quote_token":quote.data["quote_token"]}))

    def race(self):
        barrier = Barrier(2)
        def place(entry):
            try:
                pk,body = entry
                client=APIClient();client.force_authenticate(User.objects.get(pk=pk))
                barrier.wait(timeout=10)
                return client.post("/api/v1/cart/checkout/",body,format="json").status_code
            finally:
                connections.close_all()
        with ThreadPoolExecutor(max_workers=2) as pool:
            return sorted(pool.map(place,self.checkouts))

    def test_last_coupon_redemption_cannot_be_used_twice(self):
        self.assertEqual(self.race(),[201,400])
        self.assertEqual(Order.objects.count(),1)
        self.coupon.refresh_from_db();self.item.refresh_from_db()
        self.assertEqual(self.coupon.usage_count,1)
        self.assertEqual(self.item.stock_quantity,8)

    def test_bogo_cannot_oversell_last_portions(self):
        Coupon.objects.filter(pk=self.coupon.pk).update(usage_limit=None)
        MenuItem.objects.filter(pk=self.item.pk).update(stock_quantity=3)
        self.assertEqual(self.race(),[201,400])
        self.item.refresh_from_db()
        self.assertEqual(self.item.stock_quantity,1)
        self.assertEqual(Order.objects.count(),1)

    def test_duplicate_checkout_key_returns_same_order_and_reserves_once(self):
        self.checkouts[1]=self.checkouts[0]
        self.assertEqual(self.race(),[201,201])
        self.assertEqual(Order.objects.count(),1)
        self.coupon.refresh_from_db();self.item.refresh_from_db()
        self.assertEqual(self.coupon.usage_count,1)
        self.assertEqual(self.item.stock_quantity,8)
