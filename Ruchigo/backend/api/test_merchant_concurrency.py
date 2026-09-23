from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from threading import Barrier
from unittest import skipUnless
from uuid import uuid4
from django.db import connection, connections
from django.test import TransactionTestCase
from django.utils import timezone
from rest_framework.test import APIClient
from .models import Address, CommissionPolicy, MerchantAccount, MerchantEntry, MerchantSettlement, Order, Payment, Restaurant, User
from .merchant_finance import sync_order_finance


@skipUnless(connection.vendor == "postgresql", "Requires PostgreSQL row locks")
class MerchantConcurrencyTests(TransactionTestCase):
    def setUp(self):
        customer=User.objects.create_user("merchant-race-customer@example.test")
        owner=User.objects.create_user("merchant-race-owner@example.test",role="restaurant")
        self.admin=User.objects.create_user("merchant-race-admin@example.test",role="admin")
        self.restaurant=Restaurant.objects.create(owner=owner,name="Merchant race",city="Delhi",is_approved=True)
        address=Address.objects.create(user=customer,line1="Fixture",city="Delhi",state="Delhi",postal_code="110001")
        self.order=Order.objects.create(customer=customer,restaurant=self.restaurant,delivery_address=address,subtotal=200,total=240,delivery_fee=40,status="delivered",commission_snapshot={"version":1,"revision":1,"percent":"10","merchant_sales":"200","platform_promotion":"0"})
        Payment.objects.create(order=self.order,amount=240,status="paid")
        CommissionPolicy.objects.create(pk=1,enabled=True,percent=10,settlement_recording_enabled=True)

    def race(self, fn, values):
        barrier=Barrier(2)
        def task(value):
            try:
                barrier.wait(timeout=10)
                return fn(value)
            finally:
                connections.close_all()
        with ThreadPoolExecutor(max_workers=2) as pool:
            return list(pool.map(task,values))

    def test_duplicate_accrual_callbacks(self):
        self.race(lambda _: sync_order_finance(self.order),[1,2])
        self.assertEqual(MerchantAccount.objects.get().balance,180)
        self.assertEqual(MerchantEntry.objects.count(),1)

    def test_two_orders_initialize_one_merchant_account(self):
        second=Order.objects.get(pk=self.order.pk);second.pk=None;second.number=uuid4();second.save()
        Payment.objects.create(order=second,amount=240,status="paid")
        self.race(sync_order_finance,[self.order,second])
        self.assertEqual(MerchantAccount.objects.get().balance,360)
        self.assertEqual(MerchantEntry.objects.count(),2)

    def settlement_body(self):
        return dict(amount="180",reference="BANK-RACE",client_id=str(uuid4()),paid_at=(timezone.now()-timedelta(minutes=1)).isoformat(),
                    note="Isolated external payment fixture",revision=MerchantAccount.objects.get().revision,confirmed_external_payment=True)

    def post(self, body):
        client=APIClient();client.force_authenticate(User.objects.get(pk=self.admin.pk))
        return client.post(f"/api/v1/merchant-finance/{self.restaurant.pk}/record-settlement/",body,format="json").status_code

    def test_duplicate_settlement_requests_debit_once(self):
        sync_order_finance(self.order);body=self.settlement_body()
        self.assertEqual(sorted(self.race(self.post,[body,body])),[200,201])
        self.assertEqual(MerchantAccount.objects.get().balance,0)
        self.assertEqual(MerchantSettlement.objects.count(),1)

    def test_competing_settlements_cannot_overdraw(self):
        sync_order_finance(self.order);body=self.settlement_body()
        other={**body,"client_id":str(uuid4()),"reference":"BANK-OTHER"}
        self.assertEqual(sorted(self.race(self.post,[body,other])),[201,409])
        self.assertEqual(MerchantAccount.objects.get().balance,0)
        self.assertEqual(MerchantSettlement.objects.count(),1)
