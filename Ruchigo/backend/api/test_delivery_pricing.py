from datetime import datetime, time, timedelta
from decimal import Decimal
from uuid import uuid4
from django.utils import timezone
from rest_framework.test import APITestCase
from .availability import accepting_filter, accepting_orders
from .delivery_pricing import applicable_fees
from .models import (Address, AdminAccessGrant, AuditLog, Cart, CartItem, Coupon, DeliveryPolicy,
                     DeliveryPricingRule, DeliveryZone, MenuItem, Order, Restaurant, ServiceCity, User)
from .serviceability import delivery_quote


class DeliveryPricingTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user=User.objects.create_user("prices-customer@example.test")
        cls.admin=User.objects.create_user("prices-admin@example.test",role="admin")
        cls.owner=User.objects.create_user("prices-owner@example.test",role="restaurant")
        cls.kitchen=Restaurant.objects.create(owner=cls.owner,name="Pricing kitchen",city="New Delhi",is_approved=True,latitude="28.600000",longitude="77.200000")
        cls.item=MenuItem.objects.create(restaurant=cls.kitchen,name="Meal",price=200)
        cls.address=Address.objects.create(user=cls.user,line1="Fixture",city="Delhi",state="Delhi",postal_code="110001",latitude="28.600000",longitude="77.200000")
        cls.zone=DeliveryZone.objects.create(name="Fixture zone",city="Delhi",is_active=True,latitude="28.600000",longitude="77.200000",radius_km=5,max_delivery_km=5,base_fee=20,free_delivery_above=500)
        DeliveryPolicy.objects.update_or_create(pk=1,defaults={"enabled":True})
        cls.cart=Cart.objects.create(user=cls.user,restaurant=cls.kitchen)
        CartItem.objects.create(cart=cls.cart,menu_item=cls.item,quantity=1)

    def setUp(self):
        self.client.force_authenticate(self.user)

    def rule(self, **data):
        return DeliveryPricingRule.objects.create(zone=self.zone,name="Temporary local demand",kind="surge",additional_fee=10,
            starts_at=timezone.now()-timedelta(hours=1),ends_at=timezone.now()+timedelta(hours=1),is_active=True,**data)

    def quote(self, **data):
        return self.client.post("/api/v1/cart/quote/",{"address_id":self.address.pk,**data},format="json")

    def test_fixed_surge_is_snapshotted_and_free_threshold_is_preserved(self):
        rule=self.rule()
        result=self.quote()
        self.assertEqual(Decimal(result.data["delivery_fee"]),30)
        self.assertEqual(result.data["price_adjustment"]["id"],rule.pk)
        self.assertEqual(Decimal(result.data["standard_delivery_fee"]),20)
        self.assertEqual(Decimal(delivery_quote(self.kitchen,self.address,Decimal(500))["delivery_fee"]),0)
        body={"address_id":self.address.pk,"quote_token":result.data["quote_token"],"checkout_key":str(uuid4())}
        created=self.client.post("/api/v1/cart/checkout/",body,format="json")
        self.assertEqual(created.status_code,201,created.data)
        self.assertEqual(Decimal(created.data["total"]),230)
        DeliveryPricingRule.objects.filter(pk=rule.pk).update(additional_fee=50,revision=2)
        order=Order.objects.get(pk=created.data["id"])
        self.assertEqual(order.total,230)
        self.assertEqual(order.delivery_quote["price_adjustment"]["revision"],1)

    def test_overlapping_rules_never_stack_and_lowest_final_zone_wins(self):
        first=self.rule()
        second=self.rule()
        DeliveryPricingRule.objects.filter(pk=second.pk).update(additional_fee=30)
        self.assertEqual(Decimal(self.quote().data["delivery_fee"]),50)
        other=DeliveryZone.objects.create(name="Other",city="Delhi",is_active=True,latitude="28.600000",longitude="77.200000",radius_km=5,max_delivery_km=5,base_fee=25)
        quote=self.quote().data
        self.assertEqual(quote["zone_id"],other.pk)
        self.assertNotIn("price_adjustment",quote)
        self.assertEqual(Decimal(quote["delivery_fee"]),25)

    def test_disabled_expired_future_and_standard_policy_do_not_surcharge(self):
        rule=self.rule()
        for changes in [{"is_active":False},{"is_active":True,"ends_at":timezone.now()-timedelta(seconds=1)},{"ends_at":timezone.now()+timedelta(days=1),"starts_at":timezone.now()+timedelta(hours=1)}]:
            DeliveryPricingRule.objects.filter(pk=rule.pk).update(**changes)
            self.assertEqual(Decimal(self.quote().data["delivery_fee"]),20)
        DeliveryPolicy.objects.filter(pk=1).update(enabled=False)
        self.assertEqual(Decimal(self.quote().data["delivery_fee"]),40)

    def test_peak_uses_india_weekdays_half_open_times_and_absolute_window(self):
        local=timezone.make_aware(datetime(2030,1,7,12,0))
        rule=DeliveryPricingRule.objects.create(zone=self.zone,name="Lunch",kind="peak",additional_fee=15,starts_at=local-timedelta(days=1),ends_at=local+timedelta(days=2),weekdays=[0],start_time=time(12),end_time=time(14),is_active=True)
        self.assertEqual(applicable_fees([self.zone.pk],local)[self.zone.pk]["id"],rule.pk)
        self.assertEqual(applicable_fees([self.zone.pk],local-timedelta(seconds=1)),{})
        self.assertEqual(applicable_fees([self.zone.pk],local+timedelta(hours=2)),{})
        self.assertEqual(applicable_fees([self.zone.pk],local+timedelta(days=1)),{})

    def test_fee_waiver_includes_surge_and_does_not_touch_food(self):
        self.rule()
        Coupon.objects.create(code="SURGEFREE",benefit_type="free_delivery",starts_at=timezone.now()-timedelta(days=1),ends_at=timezone.now()+timedelta(days=1))
        quote=self.quote(coupon_code="SURGEFREE")
        self.assertEqual(Decimal(quote.data["delivery_fee"]),0)
        self.assertEqual(Decimal(quote.data["delivery_discount"]),30)
        self.assertEqual(Decimal(quote.data["total"]),200)

    def test_rule_changes_and_expiry_invalidate_old_quote(self):
        rule=self.rule()
        quote=self.quote()
        body={"address_id":self.address.pk,"quote_token":quote.data["quote_token"]}
        DeliveryPricingRule.objects.filter(pk=rule.pk).update(ends_at=timezone.now()-timedelta(seconds=1))
        result=self.client.post("/api/v1/cart/checkout/",body,format="json")
        self.assertEqual(result.status_code,400)
        self.assertIn("quote_token",result.data)

    def test_admin_scope_validation_revision_and_audit(self):
        body={"zone":self.zone.pk,"name":"Approved demand window","kind":"surge","additional_fee":"20","starts_at":timezone.now().isoformat(),"ends_at":(timezone.now()+timedelta(hours=2)).isoformat(),"reason":"Approved isolated QA window"}
        self.assertEqual(self.client.post("/api/v1/delivery-pricing/",body,format="json").status_code,403)
        self.client.force_authenticate(self.admin)
        grant=AdminAccessGrant.objects.create(user=self.admin,scopes=[])
        self.assertEqual(self.client.get("/api/v1/delivery-pricing/").status_code,403)
        grant.scopes=["policies"];grant.save()
        self.assertEqual(self.client.post("/api/v1/delivery-pricing/",{**body,"ends_at":(timezone.now()+timedelta(days=2)).isoformat()},format="json").status_code,400)
        created=self.client.post("/api/v1/delivery-pricing/",body,format="json")
        self.assertEqual(created.status_code,201,created.data)
        self.assertFalse(created.data["is_active"])
        path=f"/api/v1/delivery-pricing/{created.data['id']}/"
        self.assertEqual(self.client.patch(path,{"is_active":True,"expected_revision":1},format="json").status_code,400)
        self.assertEqual(self.client.patch(path,{"is_active":True,"expected_revision":1,"reason":"Enable approved QA window"},format="json").status_code,200)
        self.assertEqual(self.client.patch(path,{"is_active":False,"expected_revision":1,"reason":"Stale version must not save"},format="json").status_code,400)
        self.assertEqual(AuditLog.objects.filter(action__startswith="delivery_pricing.").count(),2)
        self.assertEqual(self.client.delete(path).status_code,405)

    def test_city_pause_filters_alias_catalog_and_checkout_but_not_active_orders(self):
        quote=self.quote()
        created=self.client.post("/api/v1/cart/checkout/",{"address_id":self.address.pk,"quote_token":quote.data["quote_token"]},format="json")
        self.assertEqual(created.status_code,201,created.data)
        ServiceCity.objects.create(name="Delhi",is_active=False)
        self.assertFalse(accepting_orders(self.kitchen))
        self.assertFalse(Restaurant.objects.filter(accepting_filter()).exists())
        self.assertEqual(self.client.get("/api/v1/restaurants/").data["count"],0)
        self.assertEqual(self.client.get("/api/v1/menu-items/").data["count"],0)
        CartItem.objects.create(cart=self.cart,menu_item=self.item,quantity=1)
        self.assertEqual(self.quote().status_code,400)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.post(f"/api/v1/orders/{created.data['id']}/status/",{"status":"confirmed"}).status_code,200)
        ServiceCity.objects.update(is_active=True)
        self.assertTrue(accepting_orders(self.kitchen))

    def test_city_controls_preserve_data_require_reason_and_handle_alias_conflicts(self):
        self.client.force_authenticate(self.admin)
        AdminAccessGrant.objects.create(user=self.admin,scopes=["policies"])
        body={"name":"South Delhi","is_active":False,"reason":"Temporary city-wide pause"}
        created=self.client.post("/api/v1/service-cities/",body,format="json")
        self.assertEqual(created.status_code,201,created.data)
        self.assertEqual(created.data["name"],"Delhi")
        self.assertEqual(self.client.post("/api/v1/service-cities/",{**body,"name":"New Delhi"},format="json").status_code,400)
        path=f"/api/v1/service-cities/{created.data['id']}/"
        self.assertEqual(self.client.patch(path,{"is_active":True,"expected_revision":1},format="json").status_code,400)
        result=self.client.patch(path,{"is_active":True,"expected_revision":1,"reason":"City operations resumed safely"},format="json")
        self.assertEqual(result.status_code,200,result.data)
        self.assertEqual(self.client.patch(path,{"is_active":False,"expected_revision":1,"reason":"Stale update should be rejected"},format="json").status_code,400)
        self.assertEqual(self.client.delete(path).status_code,405)
        self.kitchen.refresh_from_db();self.assertTrue(self.kitchen.is_approved)
        self.assertEqual(AuditLog.objects.filter(action__startswith="service_city.").count(),2)

    def test_city_checks_are_batched_per_serialized_response_not_per_card(self):
        from .serializers import RestaurantSerializer
        kitchen=Restaurant.objects.select_related("owner").get(pk=self.kitchen.pk)
        with self.assertNumQueries(1):
            result=RestaurantSerializer([kitchen]*20,many=True).data
        self.assertTrue(result[0]["accepting_orders"])
        ServiceCity.objects.create(name="Delhi",is_active=False)
        with self.assertNumQueries(1):
            result=RestaurantSerializer([kitchen]*20,many=True).data
        self.assertFalse(result[0]["accepting_orders"])
