from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import patch
from uuid import uuid4
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import Address, AdminAccessGrant, AuditLog, Cart, CartItem, DeliveryPolicy, MenuItem, Order, Payment, Restaurant, User


class CheckoutExtrasTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer=User.objects.create_user("extras-customer@example.test")
        cls.owner=User.objects.create_user("extras-owner@example.test",role="restaurant")
        cls.admin=User.objects.create_user("extras-admin@example.test",role="admin")
        cls.restaurant=Restaurant.objects.create(owner=cls.owner,name="Extras kitchen",city="Delhi",is_approved=True,opening_hours=[{"closed":False,"open":"00:00","close":"24:00"}]*7,scheduling_enabled=True)
        cls.item=MenuItem.objects.create(restaurant=cls.restaurant,name="Extras meal",price=100,stock_quantity=5)
        cls.address=Address.objects.create(user=cls.customer,line1="Test",city="Delhi",state="Delhi",postal_code="110001")
        cls.cart=Cart.objects.create(user=cls.customer,restaurant=cls.restaurant)
        CartItem.objects.create(cart=cls.cart,menu_item=cls.item,quantity=1)

    def setUp(self):
        self.client.force_authenticate(self.customer)

    def body(self, **changes):
        return {"address_id":self.address.pk,**changes}

    def quote(self, **changes):
        return self.client.post("/api/v1/cart/quote/",self.body(**changes),format="json")

    def checkout(self, **changes):
        quote=self.quote(**changes)
        self.assertEqual(quote.status_code,200,quote.data)
        body=self.body(quote_token=quote.data["quote_token"],checkout_key=str(uuid4()),**changes)
        response=self.client.post("/api/v1/cart/checkout/",body,format="json")
        self.assertEqual(response.status_code,201,response.data)
        return Order.objects.get(pk=response.data["id"]),body

    def test_schedule_persists_and_checkout_retry_does_not_double_reserve(self):
        scheduled=(timezone.now()+timedelta(hours=2)).isoformat()
        order,body=self.checkout(scheduled_for=scheduled)
        self.assertEqual(order.scheduled_for.isoformat(),scheduled)
        self.assertEqual(datetime.fromisoformat(order.delivery_quote["scheduled_for"]), datetime.fromisoformat(scheduled))
        self.assertEqual(order.total,140)
        retry=self.client.post("/api/v1/cart/checkout/",body,format="json")
        self.assertEqual(retry.data["id"],order.pk)
        self.item.refresh_from_db();self.assertEqual(self.item.stock_quantity,4)

    def test_early_preparation_blocked_then_due_order_can_progress(self):
        order,_=self.checkout(scheduled_for=(timezone.now()+timedelta(hours=2)).isoformat())
        self.client.force_authenticate(self.owner)
        path=f"/api/v1/orders/{order.pk}/status/"
        self.assertEqual(self.client.post(path,{"status":"confirmed"}).status_code,200)
        self.assertEqual(self.client.post(path,{"status":"preparing"}).status_code,400)
        Order.objects.filter(pk=order.pk).update(scheduled_for=timezone.now()-timedelta(seconds=1))
        self.assertEqual(self.client.post(path,{"status":"preparing"}).status_code,200)

    def test_scheduling_rejects_disabled_closed_too_soon_and_outside_horizon(self):
        for stamp in [timezone.now()+timedelta(minutes=5),timezone.now()+timedelta(days=15)]:
            self.assertEqual(self.quote(scheduled_for=stamp.isoformat()).status_code,400)
        scheduled=(timezone.now()+timedelta(hours=2)).isoformat()
        Restaurant.objects.filter(pk=self.restaurant.pk).update(scheduling_enabled=False)
        self.assertEqual(self.quote(scheduled_for=scheduled).status_code,400)
        Restaurant.objects.filter(pk=self.restaurant.pk).update(scheduling_enabled=True,opening_hours=[{"closed":True}]*7)
        self.assertEqual(self.quote(scheduled_for=scheduled).status_code,400)

    def test_changing_schedule_invalidates_signed_bill(self):
        stamp=(timezone.now()+timedelta(hours=2)).isoformat()
        quote=self.quote(scheduled_for=stamp)
        response=self.client.post("/api/v1/cart/checkout/",self.body(scheduled_for=(timezone.now()+timedelta(hours=3)).isoformat(),quote_token=quote.data["quote_token"]),format="json")
        self.assertEqual(response.status_code,400)
        self.assertFalse(Order.objects.exists())

    def test_scheduled_cancellation_releases_stock_once(self):
        order,_=self.checkout(scheduled_for=(timezone.now()+timedelta(hours=2)).isoformat())
        path=f"/api/v1/orders/{order.pk}/cancel/"
        self.assertEqual(self.client.post(path,{"reason":"changed_mind"}).status_code,200)
        self.client.post(path,{"reason":"changed_mind"})
        self.item.refresh_from_db();self.assertEqual(self.item.stock_quantity,5)

    def test_cash_tip_requires_policy_and_stays_outside_food_subtotal(self):
        self.assertEqual(self.quote(tip_amount="20").status_code,400)
        DeliveryPolicy.objects.filter(pk=1).update(cash_tips_enabled=True,max_cash_tip=100)
        order,_=self.checkout(tip_amount="20")
        self.assertEqual(order.subtotal,100)
        self.assertEqual(order.delivery_fee,40)
        self.assertEqual(order.tip_amount,20)
        self.assertEqual(order.total,160)
        self.assertEqual(Payment.objects.get(order=order).amount,160)

    @patch("api.payments.payment_enabled",return_value=True)
    def test_online_tip_negative_tip_and_over_limit_are_rejected(self, _):
        DeliveryPolicy.objects.filter(pk=1).update(cash_tips_enabled=True,max_cash_tip=100)
        for payload in [{"tip_amount":"-1"},{"tip_amount":"101"},{"tip_amount":"10","payment_method":"razorpay"}]:
            self.assertEqual(self.quote(**payload).status_code,400)

    def test_changed_tip_policy_and_amount_invalidate_bill(self):
        DeliveryPolicy.objects.filter(pk=1).update(cash_tips_enabled=True,max_cash_tip=100)
        quote=self.quote(tip_amount="20")
        self.assertEqual(self.client.post("/api/v1/cart/checkout/",self.body(tip_amount="30",quote_token=quote.data["quote_token"]),format="json").status_code,400)
        DeliveryPolicy.objects.filter(pk=1).update(revision=9)
        self.assertEqual(self.client.post("/api/v1/cart/checkout/",self.body(tip_amount="20",quote_token=quote.data["quote_token"]),format="json").status_code,400)

    def test_cash_tip_policy_requires_admin_scope_reason_and_current_revision(self):
        policy=DeliveryPolicy.objects.get(pk=1)
        body={"enabled":True,"maximum":"50","revision":policy.revision,"reason":"Approved local fixture cash handling"}
        self.assertEqual(self.client.post("/api/v1/checkout-options/configure/",body,format="json").status_code,403)
        self.client.force_authenticate(self.admin)
        AdminAccessGrant.objects.create(user=self.admin,full_access=False,scopes=[])
        self.assertEqual(self.client.post("/api/v1/checkout-options/configure/",body,format="json").status_code,403)
        AdminAccessGrant.objects.filter(user=self.admin).update(scopes=["policies"])
        self.assertEqual(self.client.post("/api/v1/checkout-options/configure/",{**body,"reason":""},format="json").status_code,400)
        self.assertEqual(self.client.post("/api/v1/checkout-options/configure/",body,format="json").status_code,200)
        self.assertEqual(self.client.post("/api/v1/checkout-options/configure/",body,format="json").status_code,409)
        self.assertEqual(AuditLog.objects.filter(action="checkout.cash_tips_configured").count(),1)

    def test_merchant_must_supply_hours_for_scheduling(self):
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.patch(f"/api/v1/restaurants/{self.restaurant.pk}/",{"scheduling_enabled":True,"opening_hours":[]},format="json").status_code,400)

    def test_schedule_and_tip_require_quote_and_cannot_change_after_checkout(self):
        stamp=(timezone.now()+timedelta(hours=2)).isoformat()
        self.assertEqual(self.client.post("/api/v1/cart/checkout/",self.body(scheduled_for=stamp),format="json").status_code,400)
        order,_=self.checkout(scheduled_for=stamp)
        self.client.patch(f"/api/v1/orders/{order.pk}/",{"scheduled_for":None,"tip_amount":"99"},format="json")
        order.refresh_from_db()
        self.assertIsNotNone(order.scheduled_for)
        self.assertEqual(order.tip_amount,Decimal(0))
