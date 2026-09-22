from decimal import Decimal
from django.test import SimpleTestCase
from django.test import RequestFactory
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from .models import *

class SpaRoutingTests(SimpleTestCase):
    def test_spa_routes_return_frontend_index(self):
        response = self.client.get("/admin-users/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "<div id=\"root\">")

    def test_spa_asset_lookup_blocks_path_traversal(self):
        from config.urls import spa_index_view
        response = spa_index_view(RequestFactory().get("/"), "../backend/.env")
        self.assertEqual(response.status_code, 404)

    def test_missing_spa_asset_is_not_replaced_with_html(self):
        response = self.client.get("/assets/does-not-exist.js")
        self.assertEqual(response.status_code, 404)


class ApiFlowTests(APITestCase):
    def setUp(self):
        self.customer=User.objects.create_user("customer@example.com", "StrongPass123", role="customer")
        self.owner=User.objects.create_user("restaurant@example.com", "StrongPass123", role="restaurant")
        self.restaurant=Restaurant.objects.create(owner=self.owner,name="Ruchi Kitchen",phone="9999999999",address="Main Street",city="Delhi",is_approved=True)
        self.category=Category.objects.create(name="Meals",slug="meals")
        self.item=MenuItem.objects.create(restaurant=self.restaurant,category=self.category,name="Thali",price=Decimal("199.00"))
        self.address=Address.objects.create(user=self.customer,line1="1 Main Street",city="Delhi",state="Delhi",postal_code="110001")
    def authenticate(self, user): self.client.force_authenticate(user=user)
    def test_register_and_login(self):
        r=self.client.post("/api/v1/auth/register/", {"email":"new@example.com","password":"StrongPass123","role":"customer"}, format="json")
        self.assertEqual(r.status_code,status.HTTP_201_CREATED); self.assertIn("access",r.data["tokens"])
        r=self.client.post("/api/v1/auth/login/", {"email":"new@example.com","password":"StrongPass123","role":"customer"}, format="json")
        self.assertEqual(r.status_code,status.HTTP_200_OK)
        r=self.client.post("/api/v1/auth/register/", {"email":"admin@example.com","password":"StrongPass123","role":"admin"}, format="json")
        self.assertEqual(r.status_code,status.HTTP_400_BAD_REQUEST)

    def test_restaurant_registration_requires_admin_approval(self):
        registration_response = self.client.post(
            "/api/v1/auth/register/",
            {"email": "pending@example.com", "password": "StrongPass123", "role": "restaurant"},
            format="json"
        )
        self.assertEqual(registration_response.status_code, status.HTTP_202_ACCEPTED)
        self.assertNotIn("tokens", registration_response.data)
        self.assertEqual(registration_response.data["detail"], "Registration successful. Your account is pending admin approval.")

        pending_user = User.objects.get(email="pending@example.com")
        self.assertFalse(pending_user.is_active)
        self.assertEqual(pending_user.role, User.Role.RESTAURANT)

        login_response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "pending@example.com", "password": "StrongPass123", "role": "restaurant"},
            format="json"
        )
        self.assertEqual(login_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("pending admin approval", login_response.data["detail"].lower())

        admin = User.objects.create_superuser("admin2@example.com", "StrongPass123")
        self.authenticate(admin)
        approve_response = self.client.post(f"/api/v1/users/{pending_user.id}/approve/", format="json")
        self.assertEqual(approve_response.status_code, status.HTTP_200_OK)

        pending_user.refresh_from_db()
        self.assertTrue(pending_user.is_active)
        self.assertTrue(
            Notification.objects.filter(user=pending_user, title="Account Approved").exists()
        )

        self.client.force_authenticate(user=None)
        login_response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "pending@example.com", "password": "StrongPass123", "role": "restaurant"},
            format="json"
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", login_response.data)
        self.assertEqual(login_response.data["user"]["role"], "restaurant")

    def test_admin_can_create_user(self):
        admin = User.objects.create_superuser("admin3@example.com", "StrongPass123")
        self.authenticate(admin)

        response = self.client.post(
            "/api/v1/users/",
            {
                "email": "created@example.com",
                "password": "StrongPass123",
                "first_name": "Created",
                "last_name": "User",
                "phone": "9876543210",
                "role": "delivery",
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], "created@example.com")
        self.assertEqual(response.data["role"], "delivery")

        created_user = User.objects.get(email="created@example.com")
        self.assertTrue(created_user.check_password("StrongPass123"))
        self.assertEqual(created_user.role, User.Role.DELIVERY)

    def test_admin_can_update_user(self):
        admin = User.objects.create_superuser("admin4@example.com", "StrongPass123")
        user = User.objects.create_user("update@example.com", "StrongPass123", role="customer", first_name="Old", last_name="Name", phone="1234567890")
        self.authenticate(admin)

        response = self.client.patch(
            f"/api/v1/users/{user.id}/",
            {"first_name": "New", "last_name": "Name", "phone": "0987654321", "role": "restaurant", "is_active": False},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "New")
        self.assertEqual(response.data["last_name"], "Name")
        self.assertEqual(response.data["phone"], "0987654321")
        self.assertEqual(response.data["role"], "restaurant")
        self.assertFalse(response.data["is_active"])

        user.refresh_from_db()
        self.assertEqual(user.first_name, "New")
        self.assertEqual(user.phone, "0987654321")
        self.assertEqual(user.role, User.Role.RESTAURANT)
        self.assertFalse(user.is_active)

    def test_admin_cannot_delete_customer_with_order_history(self):
        Order.objects.create(
            customer=self.customer,
            restaurant=self.restaurant,
            delivery_address=self.address,
            subtotal=Decimal("199.00"),
            delivery_fee=Decimal("40.00"),
            discount=Decimal("0.00"),
            total=Decimal("239.00"),
        )
        admin = User.objects.create_superuser("delete-guard-admin@example.com", "StrongPass123")
        self.authenticate(admin)

        response = self.client.delete(f"/api/v1/users/{self.customer.id}/")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(User.objects.filter(pk=self.customer.id).exists())

    def test_password_reset_uses_single_use_otp(self):
        self.client.post("/api/v1/auth/forgot_password/", {"email":self.customer.email}, format="json")
        otp=OTP.objects.get(user=self.customer, purpose=OTP.Purpose.RESET_PASSWORD)
        self.assertNotEqual(otp.code, "000000")
        # The stored hash must not accept a guessed plaintext code.
        r=self.client.post("/api/v1/auth/reset_password/", {"email":self.customer.email,"code":"000000","password":"AnotherStrongPass123"}, format="json")
        self.assertEqual(r.status_code,status.HTTP_400_BAD_REQUEST)
    def test_cart_checkout(self):
        self.authenticate(self.customer)
        r=self.client.post("/api/v1/cart/items/", {"menu_item":self.item.id,"quantity":2}, format="json")
        self.assertEqual(r.status_code,status.HTTP_201_CREATED)
        r=self.client.post("/api/v1/cart/checkout/", {"address_id":self.address.id,"payment_method":"cod"}, format="json")
        self.assertEqual(r.status_code,status.HTTP_201_CREATED); self.assertEqual(Order.objects.count(),1); self.assertEqual(Order.objects.first().total,Decimal("438.00"))
        cart = Cart.objects.get(user=self.customer)
        self.assertIsNone(cart.restaurant)

        other_owner=User.objects.create_user("second-restaurant@example.com","StrongPass123",role="restaurant")
        other_restaurant=Restaurant.objects.create(owner=other_owner,name="Second Kitchen",phone="9999999998",address="Second Street",city="Delhi",is_approved=True)
        other_item=MenuItem.objects.create(restaurant=other_restaurant,category=self.category,name="Dosa",price=Decimal("99.00"))
        r=self.client.post("/api/v1/cart/items/", {"menu_item":other_item.id,"quantity":1}, format="json")
        self.assertEqual(r.status_code,status.HTTP_201_CREATED)

    def test_checkout_rejects_unconfigured_online_payment_methods(self):
        self.authenticate(self.customer)
        self.client.post("/api/v1/cart/items/", {"menu_item":self.item.id,"quantity":1}, format="json")
        response=self.client.post("/api/v1/cart/checkout/", {"address_id":self.address.id,"payment_method":"card"}, format="json")
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(),0)

    def test_cart_rejects_invalid_quantities(self):
        self.authenticate(self.customer)
        for quantity in (0, -1, 100, "not-a-number"):
            response = self.client.post(
                "/api/v1/cart/items/",
                {"menu_item": self.item.id, "quantity": quantity},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_coupon_usage_limit_is_enforced(self):
        coupon = Coupon.objects.create(
            code="LIMITED50",
            discount_amount=Decimal("50.00"),
            min_order_amount=Decimal("100.00"),
            starts_at=timezone.now() - timezone.timedelta(days=1),
            ends_at=timezone.now() + timezone.timedelta(days=1),
            usage_limit=1,
            usage_count=1,
        )
        self.authenticate(self.customer)
        self.client.post("/api/v1/cart/items/", {"menu_item":self.item.id,"quantity":1}, format="json")
        response = self.client.post("/api/v1/cart/validate-coupon/", {"code": coupon.code}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_public_menu_and_protected_addresses(self):
        self.assertEqual(self.client.get("/api/v1/menu-items/").status_code,status.HTTP_200_OK)
        self.assertEqual(self.client.get("/api/v1/addresses/").status_code,status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get("/api/v1/orders/").status_code,status.HTTP_401_UNAUTHORIZED)

    def test_public_menu_hides_unavailable_and_unapproved_items(self):
        self.item.is_available = False
        self.item.save(update_fields=["is_available"])
        pending_owner = User.objects.create_user("pending-menu@example.com", "StrongPass123", role="restaurant")
        pending_restaurant = Restaurant.objects.create(owner=pending_owner, name="Hidden Kitchen", phone="9999999998", address="Hidden Street", city="Delhi", is_approved=False)
        MenuItem.objects.create(restaurant=pending_restaurant, category=self.category, name="Hidden meal", price=Decimal("120.00"))

        response = self.client.get("/api/v1/menu-items/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

        self.authenticate(self.owner)
        response = self.client.get("/api/v1/menu-items/")
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.item.id)

    def test_public_offers_only_show_current_approved_offers(self):
        now=timezone.now()
        Offer.objects.create(title="Live",starts_at=now-timezone.timedelta(hours=1),ends_at=now+timezone.timedelta(hours=1),is_active=True)
        Offer.objects.create(title="Expired",starts_at=now-timezone.timedelta(days=2),ends_at=now-timezone.timedelta(days=1),is_active=True)
        pending_owner=User.objects.create_user("pending-offer@example.com","StrongPass123",role="restaurant")
        pending_restaurant=Restaurant.objects.create(owner=pending_owner,name="Pending Kitchen",phone="9999999998",address="Hidden Street",city="Delhi",is_approved=False)
        Offer.objects.create(restaurant=pending_restaurant,title="Hidden",starts_at=now-timezone.timedelta(hours=1),ends_at=now+timezone.timedelta(hours=1),is_active=True)
        response=self.client.get("/api/v1/offers/")
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        self.assertEqual(response.data["count"],1)
        self.assertEqual(response.data["results"][0]["title"],"Live")

    def test_analytics_requires_admin_and_returns_live_totals(self):
        self.authenticate(self.customer)
        self.assertEqual(self.client.get("/api/v1/analytics/").status_code,status.HTTP_403_FORBIDDEN)
        admin=User.objects.create_superuser("analytics-admin@example.com","StrongPass123")
        self.authenticate(admin)
        response=self.client.get("/api/v1/analytics/")
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        self.assertEqual(response.data["restaurants"]["total"],1)
        self.assertIn("recent_orders",response.data)
    def test_restaurant_cannot_edit_other_menu(self):
        other=User.objects.create_user("other@example.com","StrongPass123",role="restaurant")
        self.authenticate(other)
        r=self.client.patch(f"/api/v1/menu-items/{self.item.id}/", {"name":"Nope"}, format="json")
        self.assertEqual(r.status_code,status.HTTP_404_NOT_FOUND)

    def test_delivery_can_accept_and_view_available_orders(self):
        order=Order.objects.create(
            customer=self.customer,
            restaurant=self.restaurant,
            delivery_address=self.address,
            subtotal=Decimal("199.00"),
            delivery_fee=Decimal("40.00"),
            discount=Decimal("0.00"),
            total=Decimal("239.00"),
            status=Order.Status.READY,
        )
        delivery_user=User.objects.create_user("courier@example.com","StrongPass123",role="delivery")
        self.authenticate(delivery_user)

        r=self.client.get("/api/v1/orders/available/", format="json")
        self.assertEqual(r.status_code,status.HTTP_200_OK)
        self.assertEqual(len(r.data["results"]),1)
        self.assertEqual(r.data["results"][0]["id"], order.id)

        r=self.client.post(f"/api/v1/orders/{order.id}/accept/", format="json")
        self.assertEqual(r.status_code,status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.ASSIGNED)
        self.assertIsNotNone(order.delivery)
        self.assertIsNone(order.delivery.pickup_at)
        self.assertEqual(order.delivery.partner, delivery_user)

    def test_restaurant_restricted_status_transitions(self):
        order=Order.objects.create(
            customer=self.customer,
            restaurant=self.restaurant,
            delivery_address=self.address,
            subtotal=Decimal("199.00"),
            delivery_fee=40,
            discount=0,
            total=Decimal("239.00"),
            status=Order.Status.PENDING,
        )
        self.authenticate(self.owner)

        r=self.client.post(f"/api/v1/orders/{order.id}/status/", {"status":"confirmed"}, format="json")
        self.assertEqual(r.status_code,status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.CONFIRMED)

        r=self.client.post(f"/api/v1/orders/{order.id}/status/", {"status":"preparing"}, format="json")
        self.assertEqual(r.status_code,status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PREPARING)

        r=self.client.post(f"/api/v1/orders/{order.id}/status/", {"status":"ready"}, format="json")
        self.assertEqual(r.status_code,status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.READY)

        r=self.client.post(f"/api/v1/orders/{order.id}/status/", {"status":"delivered"}, format="json")
        self.assertEqual(r.status_code,status.HTTP_403_FORBIDDEN)

    def test_restaurant_cannot_skip_order_states(self):
        order=Order.objects.create(customer=self.customer,restaurant=self.restaurant,delivery_address=self.address,subtotal=Decimal("199.00"),delivery_fee=40,discount=0,total=Decimal("239.00"))
        self.authenticate(self.owner)
        response=self.client.post(f"/api/v1/orders/{order.id}/status/", {"status":"ready"}, format="json")
        self.assertEqual(response.status_code,status.HTTP_403_FORBIDDEN)
        order.refresh_from_db()
        self.assertEqual(order.status,Order.Status.PENDING)

    def test_delivery_completion_records_time_and_cod_payment(self):
        order=Order.objects.create(customer=self.customer,restaurant=self.restaurant,delivery_address=self.address,subtotal=Decimal("199.00"),delivery_fee=40,discount=0,total=Decimal("239.00"),status=Order.Status.OUT)
        payment=Payment.objects.create(order=order,method="cod",amount=order.total)
        courier=User.objects.create_user("delivery-complete@example.com","StrongPass123",role="delivery")
        assignment=DeliveryAssignment.objects.create(order=order,partner=courier,pickup_at=timezone.now())
        self.authenticate(courier)
        response=self.client.post(f"/api/v1/orders/{order.id}/status/", {"status":"delivered"}, format="json")
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        assignment.refresh_from_db(); payment.refresh_from_db()
        self.assertIsNotNone(assignment.delivered_at)
        self.assertEqual(payment.status,Payment.Status.PAID)

    def test_review_must_match_customer_and_delivered_order(self):
        order=Order.objects.create(customer=self.customer,restaurant=self.restaurant,delivery_address=self.address,subtotal=Decimal("199.00"),delivery_fee=40,discount=0,total=Decimal("239.00"),status=Order.Status.PENDING)
        self.authenticate(self.customer)
        response=self.client.post("/api/v1/reviews/", {"order":order.id,"rating":5,"comment":"Great"}, format="json")
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        order.status=Order.Status.DELIVERED; order.save(update_fields=["status"])
        response=self.client.post("/api/v1/reviews/", {"order":order.id,"rating":5,"comment":"Great"}, format="json")
        self.assertEqual(response.status_code,status.HTTP_201_CREATED)
        self.assertEqual(response.data["restaurant"],self.restaurant.id)

    def test_email_registration_is_case_insensitive(self):
        response=self.client.post("/api/v1/auth/register/", {"email":"CUSTOMER@example.com","password":"StrongPass123","role":"customer"}, format="json")
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)

    def test_authenticated_user_can_change_password(self):
        self.authenticate(self.customer)
        response=self.client.post("/api/v1/auth/change_password/", {"current_password":"wrong","new_password":"AnotherStrongPass123"}, format="json")
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        response=self.client.post("/api/v1/auth/change_password/", {"current_password":"StrongPass123","new_password":"AnotherStrongPass123"}, format="json")
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertTrue(self.customer.check_password("AnotherStrongPass123"))

        response=self.client.post("/api/v1/auth/change_password/", {"current_password":"AnotherStrongPass123","new_password":"password"}, format="json")
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)

    def test_profile_cannot_change_account_state_and_email_change_is_unverified(self):
        self.customer.email_verified = True
        self.customer.save(update_fields=["email_verified"])
        self.authenticate(self.customer)
        response=self.client.patch("/api/v1/auth/me/", {"email":"changed@example.com","is_active":False,"role":"admin"}, format="json")
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.email,"changed@example.com")
        self.assertEqual(self.customer.username,"changed@example.com")
        self.assertFalse(self.customer.email_verified)
        self.assertTrue(self.customer.is_active)
        self.assertEqual(self.customer.role,User.Role.CUSTOMER)

    def test_restaurant_cannot_transfer_ownership(self):
        other=User.objects.create_user("other-owner@example.com","StrongPass123",role="restaurant")
        self.authenticate(self.owner)
        response=self.client.patch(f"/api/v1/restaurants/{self.restaurant.id}/", {"owner_id":other.id}, format="json")
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.owner,self.owner)

    def test_non_superuser_admin_cannot_promote_users_or_block_self(self):
        admin=User.objects.create_user("staff-admin@example.com","StrongPass123",role="admin",is_staff=True)
        target=User.objects.create_user("promotion-target@example.com","StrongPass123",role="customer")
        self.authenticate(admin)
        response=self.client.patch(f"/api/v1/users/{target.id}/", {"role":"admin"}, format="json")
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        target.refresh_from_db()
        self.assertEqual(target.role,User.Role.CUSTOMER)
        response=self.client.post(f"/api/v1/users/{admin.id}/block/", format="json")
        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        admin.refresh_from_db()
        self.assertTrue(admin.is_active)

    def test_notifications_are_user_owned_and_content_is_immutable(self):
        notification=Notification.objects.create(user=self.customer,title="Order update",message="Original",kind="order")
        self.authenticate(self.customer)
        response=self.client.post("/api/v1/notifications/", {"title":"Forged","message":"Forged"}, format="json")
        self.assertEqual(response.status_code,status.HTTP_405_METHOD_NOT_ALLOWED)
        response=self.client.patch(f"/api/v1/notifications/{notification.id}/", {"title":"Forged","message":"Forged","is_read":True}, format="json")
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        notification.refresh_from_db()
        self.assertEqual(notification.title,"Order update")
        self.assertEqual(notification.message,"Original")
        self.assertTrue(notification.is_read)

    def test_only_one_default_address_is_kept(self):
        self.authenticate(self.customer)
        first=self.client.post("/api/v1/addresses/", {"label":"Office","line1":"2 Main Street","city":"Delhi","state":"Delhi","postal_code":"110002","is_default":True}, format="json")
        self.assertEqual(first.status_code,status.HTTP_201_CREATED)
        second=self.client.post("/api/v1/addresses/", {"label":"Parents","line1":"3 Main Street","city":"Delhi","state":"Delhi","postal_code":"110003","is_default":True}, format="json")
        self.assertEqual(second.status_code,status.HTTP_201_CREATED)
        self.assertEqual(Address.objects.filter(user=self.customer,is_default=True).count(),1)
        self.assertTrue(Address.objects.get(pk=second.data["id"]).is_default)
        response=self.client.patch(f"/api/v1/addresses/{second.data['id']}/", {"is_default":False}, format="json")
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        self.assertEqual(Address.objects.filter(user=self.customer,is_default=True).count(),1)

    def test_notification_summary_counts_all_pages_and_only_current_account(self):
        Notification.objects.bulk_create([Notification(user=self.customer, title=f"Update {i}", message="Test") for i in range(25)])
        Notification.objects.create(user=self.customer, title="Already read", message="Test", is_read=True)
        Notification.objects.create(user=self.owner, title="Other account", message="Private")
        self.authenticate(self.customer)
        response = self.client.get("/api/v1/notifications/summary/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["unread_count"], 25)
        self.assertEqual(len(response.data["latest"]), 5)
        self.assertTrue(all(row["user"] == self.customer.pk for row in response.data["latest"]))
        self.assertEqual(response.data["latest_id"], Notification.objects.filter(user=self.customer).latest("id").pk)
        self.assertEqual(len(self.client.get("/api/v1/notifications/").data["results"]), 20)

    def test_mark_all_notifications_read_is_owned_idempotent_and_preserves_content(self):
        own = Notification.objects.create(user=self.customer, title="Order update", message="Original", kind="order")
        other = Notification.objects.create(user=self.owner, title="Private", message="Other account")
        self.authenticate(self.customer)
        response = self.client.patch("/api/v1/notifications/mark-all-read/?user=" + str(self.owner.pk), {"title": "Forged"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"updated": 1, "unread_count": 0})
        self.assertEqual(self.client.patch("/api/v1/notifications/mark-all-read/").data["updated"], 0)
        own.refresh_from_db(); other.refresh_from_db()
        self.assertTrue(own.is_read)
        self.assertEqual(own.title, "Order update")
        self.assertFalse(other.is_read)
        self.assertEqual(self.client.patch(f"/api/v1/notifications/{other.id}/", {"is_read": True}, format="json").status_code, 404)

    def test_notification_summary_and_mark_all_require_authentication(self):
        self.assertEqual(self.client.get("/api/v1/notifications/summary/").status_code, 401)
        self.assertEqual(self.client.patch("/api/v1/notifications/mark-all-read/").status_code, 401)

    def test_each_partner_role_has_an_isolated_notification_inbox(self):
        for role in ["admin", "restaurant", "delivery"]:
            user = User.objects.create_user(f"inbox-{role}@example.com", "StrongPass123", role=role)
            Notification.objects.create(user=user, title="Account update", message="Test")
            self.authenticate(user)
            self.assertEqual(self.client.get("/api/v1/notifications/summary/").data["unread_count"], 1)
            self.assertEqual(self.client.patch("/api/v1/notifications/mark-all-read/").data["updated"], 1)
