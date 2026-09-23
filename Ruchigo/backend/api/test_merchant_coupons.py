from django.utils import timezone
from rest_framework.test import APITestCase
from .models import AuditLog, Coupon, Restaurant, User


class MerchantCouponTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.owner = User.objects.create_user("coupon-owner@example.test", role="restaurant")
        cls.other = User.objects.create_user("coupon-other@example.test", role="restaurant")
        cls.customer = User.objects.create_user("coupon-customer@example.test")
        cls.restaurant = Restaurant.objects.create(owner=cls.owner, name="Coupon kitchen", city="Delhi", is_approved=True)
        cls.other_restaurant = Restaurant.objects.create(owner=cls.other, name="Other kitchen", city="Delhi", is_approved=True)

    def payload(self, **changes):
        now = timezone.now()
        return {"code":"KITCHEN20", "discount_amount":"20", "min_order_amount":"200", "starts_at":now.isoformat(), "ends_at":(now+timezone.timedelta(days=7)).isoformat(), **changes}

    def test_owned_coupon_creation_update_and_audit(self):
        self.client.force_authenticate(self.owner)
        result = self.client.post("/api/v1/coupons/", self.payload(),format="json")
        self.assertEqual(result.status_code,201,result.data)
        self.assertEqual(result.data["restaurant"],self.restaurant.pk)
        result = self.client.patch("/api/v1/coupons/KITCHEN20/", {"is_active":False},format="json")
        self.assertEqual(result.status_code,200)
        self.assertFalse(result.data["is_active"])
        self.assertEqual(AuditLog.objects.filter(actor=self.owner,action__startswith="coupon.").count(),2)

    def test_merchant_cannot_create_global_or_other_kitchen_coupon(self):
        self.client.force_authenticate(self.owner)
        for target in [None,self.other_restaurant.pk]:
            self.assertEqual(self.client.post("/api/v1/coupons/",self.payload(restaurant=target),format="json").status_code,400)
        self.assertFalse(Coupon.objects.exists())

    def test_other_merchant_cannot_list_update_or_delete_coupon(self):
        self.client.force_authenticate(self.owner)
        self.client.post("/api/v1/coupons/",self.payload(),format="json")
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get("/api/v1/coupons/").data["count"],0)
        self.assertEqual(self.client.patch("/api/v1/coupons/KITCHEN20/",{"is_active":False},format="json").status_code,404)
        self.assertEqual(self.client.delete("/api/v1/coupons/KITCHEN20/").status_code,404)

    def test_customers_get_public_eligible_feed_not_management(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.post("/api/v1/coupons/",self.payload(),format="json").status_code,403)
        self.assertEqual(self.client.get("/api/v1/coupons/available/").status_code,200)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/v1/coupons/available/").status_code,200)

    def test_unapproved_merchant_cannot_launch_coupon(self):
        Restaurant.objects.filter(pk=self.restaurant.pk).update(is_approved=False)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.post("/api/v1/coupons/",self.payload(),format="json").status_code,400)
