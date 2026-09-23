from django.test import override_settings
from rest_framework.test import APITestCase
from .models import AdminAccessGrant, AuditLog, Notification, Restaurant, User


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class AccountApprovalTests(APITestCase):
    password = "Approval-local-49285!"

    def setUp(self):
        self.admin = User.objects.create_superuser("approval-admin@example.test", self.password)

    def register(self, role):
        self.client.force_authenticate(user=None)
        response = self.client.post("/api/v1/auth/register/", {
            "email": f"new-{role}@example.test", "password": self.password,
            "first_name": "New", "last_name": "Partner", "role": role, "phone": "9999999999",
        }, format="json")
        self.assertEqual(response.status_code, 201 if role == "customer" else 202)
        return User.objects.get(pk=response.data["user"]["id"]), response

    def login(self, user):
        self.client.force_authenticate(user=None)
        return self.client.post("/api/v1/auth/login/", {
            "email": user.email, "password": self.password, "role": user.role,
        }, format="json")

    def action(self, user, action):
        self.client.force_authenticate(user=self.admin)
        return self.client.post(f"/api/v1/users/{user.pk}/{action}/", {"reason": "Reviewed test application"}, format="json")

    def test_both_partner_roles_register_approve_login_block_restore(self):
        for role in ["delivery", "restaurant"]:
            with self.subTest(role=role):
                user, response = self.register(role)
                self.assertNotIn("tokens", response.data)
                self.assertEqual(self.login(user).data["code"], "approval_pending")
                self.client.force_authenticate(user=self.admin)
                rows = self.client.get(f"/api/v1/users/?role={role}&access_status=pending").data
                self.assertEqual(rows["count"], 1)
                self.assertEqual(rows["results"][0]["access_status"], "pending")
                self.assertEqual(self.action(user, "unblock").status_code, 409)
                self.assertEqual(self.action(user, "approve").status_code, 200)
                self.assertEqual(self.action(user, "approve").status_code, 400)
                self.assertEqual(Notification.objects.filter(user=user, title="Account Approved").count(), 1)
                login = self.login(user)
                self.assertEqual(login.status_code, 200)
                self.assertEqual(login.data["user"]["role"], role)
                if role == "delivery":
                    self.assertFalse(login.data["user"]["is_available"])
                self.assertEqual(self.action(user, "block").status_code, 200)
                blocked = self.login(user)
                self.assertEqual(blocked.status_code, 403)
                self.assertEqual(blocked.data["code"], "account_blocked")
                self.assertEqual(self.action(user, "approve").status_code, 409)
                self.assertEqual(self.action(user, "unblock").status_code, 200)
                self.assertEqual(self.login(user).status_code, 200)
                self.assertEqual(AuditLog.objects.filter(target=str(user.pk), action="account.approved").count(), 1)

    def test_customer_does_not_need_approval_and_cannot_approve_partners(self):
        customer, response = self.register("customer")
        self.assertIn("tokens", response.data)
        self.assertEqual(self.login(customer).status_code, 200)
        rider, _ = self.register("delivery")
        self.client.force_authenticate(customer)
        self.assertEqual(self.client.post(f"/api/v1/users/{rider.pk}/approve/").status_code, 403)
        rider.refresh_from_db()
        self.assertFalse(rider.is_active)

    def test_admin_created_rider_starts_offline(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post("/api/v1/users/", {
            "email": "admin-created-rider@example.test", "password": self.password,
            "role": "delivery", "reason": "Administrator reviewed this partner",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["is_active"])
        self.assertFalse(response.data["is_available"])

    def test_partner_scope_only_sees_partners_and_can_approve(self):
        rider, _ = self.register("delivery")
        delegate = User.objects.create_user("approval-delegate@example.test", self.password, role="admin")
        AdminAccessGrant.objects.create(user=delegate, scopes=["partners"])
        self.client.force_authenticate(delegate)
        result = self.client.get("/api/v1/users/summary/?access_status=pending")
        self.assertEqual(result.data["total"], 1)
        self.assertEqual(result.data["pending"], 1)
        self.assertEqual(self.client.post(f"/api/v1/users/{rider.pk}/approve/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/users/summary/?access_status=pending").data["total"], 0)

    def test_account_approval_does_not_publish_restaurant_listing(self):
        owner, _ = self.register("restaurant")
        restaurant = Restaurant.objects.create(owner=owner, name="Unreviewed kitchen", city="Delhi")
        self.assertEqual(self.action(owner, "approve").status_code, 200)
        restaurant.refresh_from_db()
        self.assertFalse(restaurant.is_approved)
        self.assertEqual(self.client.post(f"/api/v1/restaurants/{restaurant.pk}/approve/").status_code, 200)
        restaurant.refresh_from_db()
        self.assertTrue(restaurant.is_approved)

    def test_legacy_blocked_account_not_mislabeled_pending(self):
        rider, _ = self.register("delivery")
        Notification.objects.create(user=rider, title="Account Blocked", message="Historical restriction", kind="account")
        self.assertEqual(self.login(rider).data["code"], "account_blocked")
        self.client.force_authenticate(self.admin)
        summary = self.client.get("/api/v1/users/summary/?role=delivery").data
        self.assertEqual(summary["pending"], 0)
        self.assertEqual(summary["blocked"], 1)
        self.assertEqual(self.action(rider, "approve").status_code, 409)

    def test_activation_patch_cannot_bypass_partner_approval(self):
        rider, _ = self.register("delivery")
        self.client.force_authenticate(self.admin)
        response = self.client.patch(f"/api/v1/users/{rider.pk}/", {"is_active": True}, format="json")
        self.assertEqual(response.status_code, 400)
        rider.refresh_from_db()
        self.assertFalse(rider.is_active)

    def test_pending_filters_paginate_and_summary_matches(self):
        User.objects.bulk_create([User(email=f"pending-{i}@example.test", username=f"pending-{i}@example.test", role="delivery", is_active=False) for i in range(25)])
        self.client.force_authenticate(self.admin)
        path = "/api/v1/users/?access_status=pending&role=delivery"
        first = self.client.get(path).data
        second = self.client.get(path + "&page=2").data
        self.assertEqual(first["count"], 25)
        self.assertEqual(len(second["results"]), 5)
        self.assertEqual(self.client.get("/api/v1/users/summary/?access_status=pending&role=delivery").data["pending"], 25)
        self.assertTrue(all(row["access_status"] == "pending" for row in first["results"]))

    def test_failed_audit_rolls_back_access_change(self):
        rider, _ = self.register("delivery")
        self.client.force_authenticate(self.admin)
        response = self.client.post(f"/api/v1/users/{rider.pk}/approve/", {"reason": "x" * 501}, format="json")
        self.assertEqual(response.status_code, 400)
        rider.refresh_from_db()
        self.assertFalse(rider.is_active)
        self.assertFalse(Notification.objects.filter(user=rider, title="Account Approved").exists())
