from decimal import Decimal
from uuid import uuid4
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import Address, AdminAccessGrant, AuditLog, Cart, CartItem, Coupon, MenuItem, Offer, Order, Restaurant, User


class CouponBenefitTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user("benefits-customer@example.test")
        self.owner = User.objects.create_user("benefits-owner@example.test", role="restaurant")
        self.admin = User.objects.create_user("benefits-admin@example.test", role="admin")
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Benefit kitchen", city="Delhi", is_approved=True)
        self.item = MenuItem.objects.create(restaurant=self.restaurant, name="Meal", price=100, stock_quantity=12,
            add_ons=[{"id":"extra","name":"Extra portion","price":"20.00"}])
        self.address = Address.objects.create(user=self.customer, line1="Doorstep", city="Delhi", state="Delhi", postal_code="110001", is_default=True)
        self.cart = Cart.objects.create(user=self.customer, restaurant=self.restaurant)
        self.row = CartItem.objects.create(cart=self.cart, menu_item=self.item, quantity=2)
        self.client.force_authenticate(self.customer)

    def coupon(self, code="PAIR", **changes):
        return Coupon.objects.create(**{"code":code,"restaurant":self.restaurant,"benefit_type":"bogo","bogo_item":self.item,
            "starts_at":timezone.now()-timezone.timedelta(days=1),"ends_at":timezone.now()+timezone.timedelta(days=7),**changes})

    def validate(self, code, **extra):
        return self.client.post("/api/v1/cart/validate-coupon/", {"code":code,**extra}, format="json")

    def quote(self, code):
        return self.client.post("/api/v1/cart/quote/", {"address_id":self.address.pk,"coupon_code":code}, format="json")

    def checkout(self, code, **extra):
        quote = self.quote(code)
        self.assertEqual(quote.status_code,200,quote.data)
        body = {"address_id":self.address.pk,"coupon_code":code,"quote_token":quote.data["quote_token"],"checkout_key":str(uuid4()),**extra}
        response = self.client.post("/api/v1/cart/checkout/",body,format="json")
        self.assertEqual(response.status_code,201,response.data)
        return response, body

    def test_bogo_list_apply_quote_checkout_share_price_and_reserve_both_portions(self):
        coupon = self.coupon()
        listing = self.client.get("/api/v1/cart/savings/").data
        self.assertEqual(listing["available_count"],1)
        self.assertEqual(listing["results"][0]["bogo_item_name"],"Meal")
        self.assertEqual(Decimal(listing["results"][0]["discount"]),100)
        self.assertEqual(self.validate(coupon.code).data["discount"],100)
        self.assertEqual(self.quote(coupon.code).data["discount"],100)
        response, body = self.checkout(coupon.code)
        self.assertEqual(Decimal(response.data["total"]),140)
        self.assertEqual(response.data["items"][0]["quantity"],2)
        self.assertEqual(response.data["delivery_quote"]["coupon_snapshot"]["benefit_type"],"bogo")
        self.client.post("/api/v1/cart/checkout/",body,format="json")
        coupon.refresh_from_db(); self.item.refresh_from_db()
        self.assertEqual(coupon.usage_count,1)
        self.assertEqual(self.item.stock_quantity,10)

    def test_bogo_does_not_give_away_addons(self):
        coupon = self.coupon()
        self.row.delete()
        added = self.client.post("/api/v1/cart/items/",{"menu_item":self.item.pk,"quantity":2,"addon_ids":["extra"]},format="json")
        self.assertEqual(added.status_code,201,added.data)
        quote = self.quote(coupon.code)
        self.assertEqual(quote.data["subtotal"],240)
        self.assertEqual(quote.data["discount"],100)
        self.assertEqual(quote.data["total"],180)

    def test_bogo_requires_matching_pair_and_limits_free_portions(self):
        coupon = self.coupon(max_free_items=2)
        for quantity, expected in [(1,None),(2,100),(3,100),(4,200),(6,200)]:
            CartItem.objects.filter(pk=self.row.pk).update(quantity=quantity)
            response = self.validate(coupon.code)
            self.assertEqual(response.status_code,400 if expected is None else 200)
            if expected is not None:
                self.assertEqual(response.data["discount"],expected)
        other = MenuItem.objects.create(restaurant=self.restaurant,name="Not the offer dish",price=50)
        CartItem.objects.filter(pk=self.row.pk).update(menu_item=other)
        self.assertEqual(self.validate(coupon.code).status_code,400)

    def test_bogo_stock_check_and_cancellation_release_all_portions_once(self):
        coupon = self.coupon()
        MenuItem.objects.filter(pk=self.item.pk).update(stock_quantity=1)
        self.assertEqual(self.quote(coupon.code).status_code,400)
        MenuItem.objects.filter(pk=self.item.pk).update(stock_quantity=12)
        response,_ = self.checkout(coupon.code)
        for _ in range(2):
            self.client.post(f"/api/v1/orders/{response.data['id']}/cancel/",{"reason":"changed_mind"})
        self.item.refresh_from_db(); self.assertEqual(self.item.stock_quantity,12)

    def test_free_delivery_is_fee_only_and_requires_quote(self):
        coupon = self.coupon("DELIVER",benefit_type="free_delivery",bogo_item=None)
        applied = self.validate(coupon.code)
        self.assertEqual(applied.data["discount"],40)
        self.assertEqual(applied.data["food_discount"],0)
        self.assertEqual(applied.data["food_total"],200)
        self.assertEqual(self.client.post("/api/v1/cart/checkout/",{"address_id":self.address.pk,"coupon_code":coupon.code},format="json").status_code,400)
        response,_ = self.checkout(coupon.code)
        self.assertEqual(Decimal(response.data["total"]),200)
        self.assertEqual(Decimal(response.data["discount"]),0)
        self.assertEqual(Decimal(response.data["delivery_fee"]),0)
        self.assertEqual(Decimal(response.data["delivery_quote"]["delivery_discount"]),40)

    def test_free_delivery_never_bypasses_address_or_city_scope(self):
        coupon = self.coupon("DELIVER",benefit_type="free_delivery",bogo_item=None)
        Address.objects.filter(pk=self.address.pk).update(city="Noida")
        self.assertEqual(self.validate(coupon.code).status_code,400)
        self.assertEqual(self.quote(coupon.code).status_code,400)
        other = User.objects.create_user("benefits-other@example.test")
        foreign = Address.objects.create(user=other,line1="Other address",city="Delhi",state="Delhi",postal_code="110001")
        self.assertEqual(self.validate(coupon.code,address_id=foreign.pk).status_code,400)
        self.address.delete()
        self.assertEqual(self.validate(coupon.code).status_code,400)

    def test_already_free_delivery_does_not_consume_a_coupon(self):
        coupon = self.coupon("DELIVER",benefit_type="free_delivery",bogo_item=None)
        CartItem.objects.filter(pk=self.row.pk).update(quantity=5)
        self.assertEqual(self.validate(coupon.code).status_code,400)
        self.assertEqual(self.client.get("/api/v1/cart/savings/").data["results"][0]["status"],"already_free")
        coupon.refresh_from_db(); self.assertEqual(coupon.usage_count,0)

    def test_no_spend_prompt_for_fee_already_free_at_minimum(self):
        self.coupon("DELIVER",benefit_type="free_delivery",bogo_item=None,min_order_amount=500)
        result = self.client.get("/api/v1/cart/savings/").data
        self.assertEqual(result["results"][0]["status"],"already_free_at_minimum")
        self.assertIsNone(result["next_coupon"])

    def test_edited_or_exhausted_coupon_invalidates_existing_quote(self):
        coupon = self.coupon()
        quote = self.quote(coupon.code)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.patch(f"/api/v1/coupons/{coupon.code}/",{"description":"Revised campaign"},format="json").status_code,200)
        self.client.force_authenticate(self.customer)
        body = {"address_id":self.address.pk,"coupon_code":coupon.code,"quote_token":quote.data["quote_token"]}
        self.assertEqual(self.client.post("/api/v1/cart/checkout/",body,format="json").status_code,400)
        Coupon.objects.filter(pk=coupon.pk).update(usage_limit=1,usage_count=1)
        self.assertEqual(self.validate(coupon.code).status_code,400)
        self.assertFalse(Order.objects.exists())

    def payload(self, **extra):
        return {"code":"NEW","benefit_type":"bogo","bogo_item":self.item.pk,"starts_at":timezone.now().isoformat(),"ends_at":(timezone.now()+timezone.timedelta(days=1)).isoformat(),**extra}

    def test_merchant_creates_owned_bogo_but_not_platform_fee_waiver(self):
        self.client.force_authenticate(self.owner)
        response = self.client.post("/api/v1/coupons/",self.payload(),format="json")
        self.assertEqual(response.status_code,201,response.data)
        self.assertEqual(response.data["restaurant"],self.restaurant.pk)
        self.assertEqual(self.client.post("/api/v1/coupons/",self.payload(code="FREE",benefit_type="free_delivery",bogo_item=None),format="json").status_code,400)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post("/api/v1/coupons/",self.payload(code="FREE",benefit_type="free_delivery",bogo_item=None),format="json").status_code,201)

    def test_bogo_cannot_reference_another_restaurants_dish(self):
        owner = User.objects.create_user("foreign-benefit@example.test",role="restaurant")
        kitchen = Restaurant.objects.create(owner=owner,name="Foreign",city="Delhi",is_approved=True)
        dish = MenuItem.objects.create(restaurant=kitchen,name="Foreign meal",price=100)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.post("/api/v1/coupons/",self.payload(bogo_item=dish.pk),format="json").status_code,400)

    def test_ambiguous_discount_negative_minimum_invalid_count_rejected(self):
        self.client.force_authenticate(self.owner)
        for extra in [{"discount_amount":20},{"discount_percent":10},{"max_discount":10},{"max_free_items":0},{"max_free_items":21},{"min_order_amount":-1}]:
            self.assertEqual(self.client.post("/api/v1/coupons/",self.payload(**extra),format="json").status_code,400)

    def test_campaign_and_case_insensitive_code_rules(self):
        self.client.force_authenticate(self.owner)
        result = self.client.post("/api/v1/coupons/",self.payload(code="welcome",campaign_type="new_customer",first_order_only=False),format="json")
        self.assertEqual(result.status_code,201,result.data)
        self.assertEqual(result.data["code"],"WELCOME")
        self.assertTrue(result.data["first_order_only"])
        self.assertEqual(self.client.post("/api/v1/coupons/",self.payload(code="Welcome"),format="json").status_code,400)

    def test_offer_links_coupon_with_same_scope_and_date_window(self):
        coupon = self.coupon()
        self.client.force_authenticate(self.owner)
        payload = {"title":"Two for tonight","coupon_code":coupon.code,"starts_at":timezone.now().isoformat(),"ends_at":(timezone.now()+timezone.timedelta(days=1)).isoformat()}
        result = self.client.post("/api/v1/offers/",payload,format="json")
        self.assertEqual(result.status_code,201,result.data)
        self.assertEqual(result.data["coupon_code"],coupon.code)
        self.assertTrue(AuditLog.objects.filter(action="offer.created").exists())
        self.assertEqual(self.client.delete(f"/api/v1/coupons/{coupon.code}/").status_code,400)
        self.assertEqual(self.client.post("/api/v1/offers/",{**payload,"ends_at":(timezone.now()+timezone.timedelta(days=10)).isoformat()},format="json").status_code,400)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/v1/offers/").data["count"],1)
        Coupon.objects.filter(pk=coupon.pk).update(is_active=False)
        self.assertEqual(self.client.get("/api/v1/offers/").data["count"],0)

    def test_linked_offer_rejects_cross_kitchen_coupon(self):
        coupon = self.coupon("PLATFORM",restaurant=None,benefit_type="food",bogo_item=None,discount_amount=20)
        self.client.force_authenticate(self.owner)
        result = self.client.post("/api/v1/offers/",{"title":"Wrong scope","coupon_code":coupon.code,"starts_at":timezone.now().isoformat(),"ends_at":(timezone.now()+timezone.timedelta(days=1)).isoformat()},format="json")
        self.assertEqual(result.status_code,400)
        self.assertFalse(Offer.objects.exists())

    def test_coupon_updates_cannot_break_linked_banner_window(self):
        coupon = self.coupon()
        Offer.objects.create(restaurant=self.restaurant,coupon=coupon,title="Linked",starts_at=coupon.starts_at,ends_at=coupon.ends_at)
        self.client.force_authenticate(self.owner)
        response = self.client.patch(f"/api/v1/coupons/{coupon.code}/",{"ends_at":(timezone.now()+timezone.timedelta(days=1)).isoformat()},format="json")
        self.assertEqual(response.status_code,400)

    def test_bogo_dish_removal_is_a_recoverable_error(self):
        self.coupon()
        self.client.force_authenticate(self.owner)
        response = self.client.delete(f"/api/v1/menu-items/{self.item.pk}/")
        self.assertEqual(response.status_code,400)
        self.assertTrue(MenuItem.objects.filter(pk=self.item.pk).exists())

    def test_promotions_delegate_gets_minimal_dish_lookup_not_catalog_access(self):
        AdminAccessGrant.objects.create(user=self.admin,full_access=False,scopes=["promotions"])
        self.client.force_authenticate(self.admin)
        response = self.client.get("/api/v1/menu-items/lookup/",{"search":"Meal","restaurant":self.restaurant.pk})
        self.assertEqual(response.status_code,200,response.data)
        self.assertEqual(set(response.data["results"][0]),{"id","name","price","restaurant"})
        self.assertEqual(self.client.patch(f"/api/v1/menu-items/{self.item.pk}/",{"price":1},format="json").status_code,403)
