from decimal import Decimal
from datetime import timedelta
from uuid import uuid4
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import (Address, AdminAccessGrant, AuditLog, Cart, CartItem, CommissionPolicy, Coupon,
                     MerchantAccount, MerchantEntry, MerchantSettlement, MenuItem, Order, Payment,
                     RefundRequest, Restaurant, SupportTicket, User)
from .merchant_finance import commission_snapshot, sync_order_finance, totals
from .refunds import record_provider_refund
from .serializers import OrderSerializer


class MerchantFinanceTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = User.objects.create_user("finance-customer@example.test")
        cls.owner = User.objects.create_user("finance-owner@example.test", role="restaurant")
        cls.other_owner = User.objects.create_user("finance-other@example.test", role="restaurant")
        cls.admin = User.objects.create_user("finance-admin@example.test", role="admin")
        cls.restaurant = Restaurant.objects.create(owner=cls.owner, name="Finance kitchen", city="Delhi", is_approved=True)
        cls.item = MenuItem.objects.create(restaurant=cls.restaurant, name="Meal", price=200, stock_quantity=100)
        cls.address = Address.objects.create(user=cls.customer, line1="Fixture", city="Delhi", state="Delhi", postal_code="110001")
        cls.policy = CommissionPolicy.objects.create(pk=1, enabled=True, percent=10, settlement_recording_enabled=True)

    def order(self, **changes):
        values = dict(customer=self.customer, restaurant=self.restaurant, delivery_address=self.address,
            subtotal=200, delivery_fee=40, total=240, status="delivered",
            commission_snapshot=commission_snapshot(Decimal(200), Decimal(0), Decimal(0), None))
        values.update(changes)
        row = Order.objects.create(**values)
        Payment.objects.create(order=row, amount=row.total, status="paid")
        return row

    def refund(self, order, amount):
        Payment.objects.filter(order=order).update(method="razorpay", transaction_id=f"pay_{order.pk}")
        ticket = SupportTicket.objects.create(user=self.customer, order=order, category="refund", subject="Fixture")
        row = RefundRequest.objects.create(order=order, ticket=ticket, requested_amount=amount, approved_amount=amount, status="processing")
        entity = {"id":f"rfnd_{row.pk}", "payment_id":f"pay_{order.pk}", "currency":"INR", "amount":int(Decimal(amount)*100), "status":"processed"}
        record_provider_refund(entity, expected_refund_id=row.pk)
        return row, entity

    def settle(self, **changes):
        account = MerchantAccount.objects.get(restaurant=self.restaurant)
        body = dict(amount="100.00", reference="BANK-1234", client_id=str(uuid4()),
            paid_at=(timezone.now()-timedelta(minutes=1)).isoformat(), note="Verified external payment", revision=account.revision,
            confirmed_external_payment=True)
        body.update(changes)
        self.client.force_authenticate(self.admin)
        return self.client.post(f"/api/v1/merchant-finance/{self.restaurant.pk}/record-settlement/", body, format="json"), body

    def test_disabled_default_no_legacy_backfill(self):
        CommissionPolicy.objects.all().delete()
        self.assertEqual(commission_snapshot(200,0,0,None), {})
        row = self.order(commission_snapshot={})
        sync_order_finance(row)
        self.assertFalse(MerchantEntry.objects.exists())
        self.client.force_authenticate(self.admin)
        response = self.client.get("/api/v1/commission-policy/")
        self.assertFalse(response.data["enabled"])
        self.assertFalse(CommissionPolicy.objects.exists())

    def test_delivery_collection_idempotency_and_policy_snapshot(self):
        row = self.order(status="preparing")
        sync_order_finance(row)
        self.assertFalse(MerchantEntry.objects.exists())
        Order.objects.filter(pk=row.pk).update(status="delivered")
        Payment.objects.filter(order=row).update(status="pending")
        sync_order_finance(row)
        self.assertFalse(MerchantEntry.objects.exists())
        Payment.objects.filter(order=row).update(status="paid")
        CommissionPolicy.objects.filter(pk=1).update(enabled=False, percent=80)
        sync_order_finance(row); sync_order_finance(row)
        account = MerchantAccount.objects.get(restaurant=self.restaurant)
        self.assertEqual(account.balance,180)
        self.assertEqual(MerchantEntry.objects.count(),1)
        self.assertEqual(account.entries.get().commission,20)

    def test_platform_and_merchant_coupon_funding(self):
        coupon = Coupon.objects.create(code="FINANCE", restaurant=self.restaurant, discount_amount=30,
            starts_at=timezone.now(), ends_at=timezone.now()+timedelta(days=1))
        for merchant in [True,False]:
            coupon.restaurant = self.restaurant if merchant else None
            snapshot = commission_snapshot(Decimal(200),Decimal(30),Decimal(20),coupon)
            row = self.order(discount=30,reward_discount=20,total=190,commission_snapshot=snapshot)
            sync_order_finance(row)
            entry = MerchantEntry.objects.get(order=row)
            self.assertEqual(entry.merchant_sales,170 if merchant else 200)
            self.assertEqual(entry.platform_promotion,20 if merchant else 50)
            self.assertEqual(entry.rounding_adjustment,0)

    def test_partial_and_full_confirmed_refunds_reduce_once(self):
        row = self.order()
        sync_order_finance(row)
        refund, entity = self.refund(row,60)
        record_provider_refund(entity,expected_refund_id=refund.pk)
        sums = totals(MerchantEntry.objects.filter(order=row))
        self.assertEqual((sums["amount"],sums["commission"],sums["delivery_collected"],sums["payment_collected"]),(135,15,30,180))
        self.refund(row,180)
        sync_order_finance(row)
        self.assertTrue(all(value == 0 for value in totals(MerchantEntry.objects.filter(order=row)).values()))
        self.assertEqual(MerchantEntry.objects.count(),3)

    def test_refund_after_settlement_negative_adjustment_not_bank_debit(self):
        row = self.order(); sync_order_finance(row)
        response, _ = self.settle(amount="180")
        self.assertEqual(response.status_code,201,response.data)
        self.refund(row,240)
        self.assertEqual(MerchantAccount.objects.get().balance,-180)
        self.assertEqual(MerchantSettlement.objects.count(),1)

    def test_pending_refund_and_flag_only_do_not_invent_refunds(self):
        row = self.order(); sync_order_finance(row)
        ticket=SupportTicket.objects.create(user=self.customer,order=row,subject="Pending")
        RefundRequest.objects.create(ticket=ticket,order=row,requested_amount=120,approved_amount=120,status="approved")
        sync_order_finance(row)
        Payment.objects.filter(order=row).update(status="refunded")
        sync_order_finance(row)
        self.assertEqual(MerchantAccount.objects.get().balance,180)

    def test_zero_cash_platform_funded_meal_and_rounding(self):
        row=self.order(total=0,delivery_fee=0,reward_discount=200,commission_snapshot=commission_snapshot(Decimal(200),Decimal(0),Decimal(200),None))
        sync_order_finance(row)
        self.assertEqual(MerchantAccount.objects.get().balance,180)
        row=self.order(subtotal=Decimal("199.99"),tip_amount=Decimal("3.11"),total=Decimal("243.10"),
            commission_snapshot=commission_snapshot(Decimal("199.99"),Decimal(0),Decimal(0),None))
        sync_order_finance(row); self.refund(row,"1.01")
        values=totals(MerchantEntry.objects.filter(order=row))
        self.assertEqual(values["payment_collected"]+values["platform_promotion"],values["merchant_sales"]+values["delivery_collected"]+values["tip_collected"]+values["rounding_adjustment"])

    def test_checkout_snapshots_hidden_from_customer_and_unchanged_bill(self):
        cart=Cart.objects.create(user=self.customer,restaurant=self.restaurant)
        CartItem.objects.create(cart=cart,menu_item=self.item)
        self.client.force_authenticate(self.customer)
        response=self.client.post("/api/v1/cart/checkout/",{"address_id":self.address.pk},format="json")
        self.assertEqual(response.status_code,201,response.data)
        self.assertNotIn("commission_snapshot",response.data)
        row=Order.objects.get(pk=response.data["id"])
        self.assertEqual(row.total,240)
        self.assertEqual(Decimal(row.commission_snapshot["percent"]),10)
        self.assertNotIn("commission_snapshot",OrderSerializer(row).data)

    def test_owner_customer_and_delegated_admin_access(self):
        row=self.order();sync_order_finance(row)
        endpoint=f"/api/v1/merchant-finance/{self.restaurant.pk}/"
        for user,status in [(self.owner,200),(self.other_owner,404),(self.customer,403)]:
            self.client.force_authenticate(user)
            self.assertEqual(self.client.get(endpoint).status_code,status)
        self.client.force_authenticate(self.other_owner)
        self.assertEqual(self.client.get("/api/v1/merchant-finance/").data["count"],0)
        AdminAccessGrant.objects.create(user=self.admin,full_access=False,scopes=["policies"])
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.get(endpoint).status_code,403)
        AdminAccessGrant.objects.filter(user=self.admin).update(scopes=["finance"])
        self.assertEqual(self.client.get(endpoint).status_code,200)
        self.assertEqual(self.client.post("/api/v1/commission-policy/configure/",{}).status_code,403)

    def test_policy_requires_approval_reason_revision_and_both_scopes(self):
        self.client.force_authenticate(self.admin)
        body=dict(enabled=True,percent=15,settlement_recording_enabled=True,revision=1,reason="Approved fixture convention",funding_approved=False)
        self.assertEqual(self.client.post("/api/v1/commission-policy/configure/",body).status_code,400)
        body["funding_approved"]=True
        self.assertEqual(self.client.post("/api/v1/commission-policy/configure/",body).status_code,200)
        self.assertEqual(self.client.post("/api/v1/commission-policy/configure/",body).status_code,409)
        self.assertTrue(AuditLog.objects.filter(action="finance.policy_configured").exists())

    def test_settlement_idempotency_revision_amount_reference_and_correction(self):
        row=self.order();sync_order_finance(row)
        endpoint=f"/api/v1/merchant-finance/{self.restaurant.pk}/"
        response,body=self.settle()
        self.assertEqual(response.status_code,201,response.data)
        self.assertEqual(self.client.post(endpoint+"record-settlement/",body,format="json").status_code,200)
        self.assertEqual(MerchantAccount.objects.get().balance,80)
        conflict={**body,"amount":"90"}
        self.assertEqual(self.client.post(endpoint+"record-settlement/",conflict,format="json").status_code,409)
        invalid,_=self.settle(amount=81,reference="BANK-5678")
        self.assertEqual(invalid.status_code,400)
        stale,_=self.settle(revision=1,reference="BANK-5678",amount=1)
        self.assertEqual(stale.status_code,409)
        duplicate,_=self.settle(reference="bank-1234",amount=1)
        self.assertEqual(duplicate.status_code,400)
        correction=dict(settlement_id=response.data["id"],revision=MerchantAccount.objects.get().revision,note="Corrected wrong bank reference")
        self.assertEqual(self.client.post(endpoint+"correct-settlement/",correction).status_code,200)
        self.assertEqual(self.client.post(endpoint+"correct-settlement/",correction).status_code,200)
        self.assertEqual(MerchantAccount.objects.get().balance,180)
        self.assertEqual(MerchantEntry.objects.filter(kind="correction").count(),1)

    def test_settlement_confirmation_future_disabled_and_owner_write(self):
        row=self.order();sync_order_finance(row)
        for changes in [{"confirmed_external_payment":False},{"paid_at":(timezone.now()+timedelta(days=1)).isoformat()},{"amount":0}]:
            response,_=self.settle(**changes)
            self.assertEqual(response.status_code,400)
        CommissionPolicy.objects.filter(pk=1).update(settlement_recording_enabled=False)
        response,body=self.settle()
        self.assertEqual(response.status_code,400)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.post(f"/api/v1/merchant-finance/{self.restaurant.pk}/record-settlement/",body,format="json").status_code,403)

    def test_unaccounted_legacy_and_reconciliation_coverage(self):
        legacy=self.order(commission_snapshot={}); sync_order_finance(legacy)
        review=self.order();Payment.objects.filter(order=review).update(reconciliation_required=True);sync_order_finance(review)
        live=self.order();sync_order_finance(live)
        self.client.force_authenticate(self.owner)
        response=self.client.get(f"/api/v1/merchant-finance/{self.restaurant.pk}/")
        self.assertEqual((response.data["covered_orders"],response.data["unaccounted_orders"]),(1,2))
        self.assertEqual(Decimal(response.data["balance"]),180)

    def test_no_generic_ledger_mutation_routes(self):
        self.client.force_authenticate(self.admin)
        endpoint=f"/api/v1/merchant-finance/{self.restaurant.pk}/"
        self.assertEqual(self.client.patch(endpoint,{"balance":500}).status_code,405)
        self.assertEqual(self.client.delete(endpoint).status_code,405)
