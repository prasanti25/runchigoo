from rest_framework.test import APITestCase
from .models import Address, AdminAccessGrant, DeliveryAssignment, MenuItem, Notification, Order, Payment, Restaurant, User
from .notifications import notify, notify_order, notify_payment


class AdminShoppingTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin=User.objects.create_user("shopping-admin@example.test",role="admin")
        AdminAccessGrant.objects.create(user=cls.admin,full_access=False,scopes=[])
        cls.customer=User.objects.create_user("shopping-customer@example.test")
        cls.owner=User.objects.create_user("shopping-owner@example.test",role="restaurant")
        cls.rider=User.objects.create_user("shopping-rider@example.test",role="delivery")
        cls.restaurant=Restaurant.objects.create(owner=cls.owner,name="Shopping kitchen",city="Delhi",is_approved=True)
        cls.item=MenuItem.objects.create(restaurant=cls.restaurant,name="Meal",price=200,stock_quantity=30)
        cls.address=Address.objects.create(user=cls.admin,line1="Personal home",city="Delhi",state="Delhi",postal_code="110001")
        cls.other_address=Address.objects.create(user=cls.customer,line1="Other home",city="Delhi",state="Delhi",postal_code="110001")
        cls.foreign=Order.objects.create(customer=cls.customer,restaurant=cls.restaurant,delivery_address=cls.other_address,subtotal=200,total=240,delivery_fee=40)
        Payment.objects.create(order=cls.foreign,amount=240)

    def setUp(self):
        self.client.force_authenticate(self.admin)

    def place(self):
        added=self.client.post("/api/v1/cart/items/",{"menu_item":self.item.pk,"quantity":1})
        self.assertEqual(added.status_code,201,added.data)
        quote=self.client.post("/api/v1/cart/quote/",{"address_id":self.address.pk})
        self.assertEqual(quote.status_code,200,quote.data)
        response=self.client.post("/api/v1/cart/checkout/",{"address_id":self.address.pk,"quote_token":quote.data["quote_token"]})
        self.assertEqual(response.status_code,201,response.data)
        return Order.objects.get(pk=response.data["id"])

    def test_real_admin_checkout_personal_history_and_payment_options(self):
        row=self.place()
        history=self.client.get("/api/v1/orders/?view=mine")
        self.assertEqual([item["id"] for item in history.data["results"]],[row.pk])
        self.assertEqual(self.client.get("/api/v1/orders/").status_code,403)
        self.assertEqual(self.client.get(f"/api/v1/orders/{row.pk}/").status_code,200)
        self.assertEqual(self.client.get(f"/api/v1/orders/{self.foreign.pk}/?view=mine").status_code,404)
        self.assertEqual(self.client.get("/api/v1/online-payments/").status_code,200)
        self.assertEqual(self.client.get(f"/api/v1/insights/eta/?order={row.pk}").status_code,200)
        self.assertEqual(self.client.get(f"/api/v1/insights/eta/?order={self.foreign.pk}").status_code,403)
        self.assertEqual(self.client.get("/api/v1/insights/").status_code,403)
        addresses=self.client.get("/api/v1/addresses/").data["results"]
        self.assertEqual([item["id"] for item in addresses],[self.address.pk])

    def test_full_admin_personal_actions_cannot_touch_customer_orders(self):
        AdminAccessGrant.objects.filter(user=self.admin).update(full_access=True)
        row=self.place()
        self.assertEqual(self.client.get("/api/v1/orders/").data["count"],2)
        self.assertEqual(self.client.get("/api/v1/orders/?view=mine").data["count"],1)
        for action in ["cancel","reorder"]:
            self.assertEqual(self.client.post(f"/api/v1/orders/{self.foreign.pk}/{action}/",{"reason":"changed_mind"}).status_code,404)
        self.assertEqual(self.client.post(f"/api/v1/orders/{row.pk}/cancel/",{"reason":"changed_mind"}).status_code,200)
        self.assertEqual(self.client.post(f"/api/v1/orders/{row.pk}/reorder/",{}).status_code,200)

    def test_admin_does_not_become_kitchen_or_courier(self):
        row=self.place()
        AdminAccessGrant.objects.filter(user=self.admin).update(full_access=True)
        for action,body in [("status",{"status":"confirmed"}),("accept",{}),("pickup",{})]:
            self.assertEqual(self.client.post(f"/api/v1/orders/{row.pk}/{action}/",body).status_code,403)

    def test_admin_customer_rider_chat_and_review_are_owner_scoped(self):
        row=self.place()
        Order.objects.filter(pk=row.pk).update(status="assigned")
        DeliveryAssignment.objects.create(order=row,partner=self.rider)
        chat=self.client.get(f"/api/v1/delivery-chat/{row.pk}/")
        self.assertEqual(chat.status_code,200,chat.data)
        self.assertTrue(chat.data["can_send"])
        self.assertEqual(self.client.get(f"/api/v1/delivery-chat/{self.foreign.pk}/").status_code,404)
        Order.objects.filter(pk=row.pk).update(status="delivered")
        response=self.client.post("/api/v1/reviews/",{"order":row.pk,"rating":5,"comment":"My own meal"})
        self.assertEqual(response.status_code,201,response.data)
        self.assertEqual(self.client.post("/api/v1/reviews/",{"order":self.foreign.pk,"rating":1}).status_code,400)

    def test_personal_notifications_survive_delegated_scope_filter(self):
        row=self.place();notify_order(row);notify_payment(row)
        notify([self.admin.pk],event="foreign-review",title="Other order",message="Queue message",kind="order",metadata={"order_id":self.foreign.pk})
        entries=self.client.get("/api/v1/notifications/").data["results"]
        self.assertTrue(entries)
        self.assertTrue(all(entry["metadata"].get("personal_order") for entry in entries))
        self.assertTrue(any(entry["kind"] == "payment" for entry in entries))
        # Legacy unrelated alerts without new audience flags remain filtered.
        Notification.objects.create(user=self.admin,title="Legacy operations",message="Old queue",kind="order")
        self.assertNotIn("Legacy operations",[entry["title"] for entry in self.client.get("/api/v1/notifications/").data["results"]])

    def test_personal_support_available_without_team_scope(self):
        row=self.place()
        self.assertEqual(self.client.get("/api/v1/support/?view=mine").status_code,200)
        self.assertEqual(self.client.get("/api/v1/support/?view=team").status_code,403)
        response=self.client.post("/api/v1/support/",{"order":row.pk,"category":"delivery","subject":"Help with my own order","message":"Where is my food?"},format="json")
        self.assertEqual(response.status_code,201,response.data)
