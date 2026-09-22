from django.core.cache import cache
from rest_framework.test import APITestCase
from .admin_access import AdminScopeMixin, effective_scopes
from .models import AdminAccessGrant, AuditLog, Notification, User
from .notifications import admin_ids
from .urls import router


class AdminAccessTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.root = User.objects.create_superuser("access-root@example.test")
        self.admin = User.objects.create_user("access-delegate@example.test", role="admin")
        self.customer = User.objects.create_user("access-customer@example.test")
        self.partner = User.objects.create_user("access-partner@example.test", role="delivery", is_active=False)
        self.grant = AdminAccessGrant.objects.create(user=self.admin, scopes=[])
        self.client.force_authenticate(self.admin)

    def scopes(self, values):
        self.grant.scopes = values
        self.grant.save()

    def test_every_router_viewset_has_scope_enforcement(self):
        for prefix, view, basename in router.registry:
            if prefix != "admin-access":
                self.assertTrue(issubclass(view, AdminScopeMixin), f"{basename} lacks scope enforcement")

    def test_empty_delegation_denies_operational_endpoints(self):
        for path in ["users", "restaurants", "categories", "menu-items", "orders", "payments", "analytics", "insights", "support", "audit-logs", "review-moderation", "coupons", "offers", "delivery-policy", "delivery-zones", "cancellation-policy", "refund-requests"]:
            self.assertEqual(self.client.get(f"/api/v1/{path}/").status_code, 403, path)
        for path in ["auth/me", "notifications", "notifications/summary"]:
            self.assertEqual(self.client.get(f"/api/v1/{path}/").status_code, 200, path)
        self.assertEqual(self.client.get("/api/v1/auth/me/").data["admin_scopes"], [])
        response = self.client.get("/api/v1/auth/me/")
        self.assertEqual(response["Cache-Control"], "private, no-store")
        self.assertIn("Authorization", response["Vary"])

    def test_support_cannot_approve_refunds_or_mutate_orders(self):
        self.scopes(["support"])
        for path in ["support", "orders"]:
            self.assertEqual(self.client.get(f"/api/v1/{path}/").status_code, 200)
        for path in ["refund-requests/1/review", "refund-requests/1/process", "orders/1/status", "order-operations/1/cancel", "users/1/block"]:
            self.assertEqual(self.client.post(f"/api/v1/{path}/", {}, format="json").status_code, 403, path)

    def test_order_operations_cancellation_needs_finance(self):
        self.scopes(["orders"])
        self.assertEqual(self.client.post("/api/v1/order-operations/999/cancel/", {}, format="json").status_code, 403)
        self.scopes(["orders", "finance"])
        # Scope now permits it, but nonexistent/invalid operation still fails.
        self.assertIn(self.client.post("/api/v1/order-operations/999/cancel/", {}, format="json").status_code, [400, 404])

    def test_partner_delegate_cannot_see_or_change_customers(self):
        self.scopes(["partners"])
        records = self.client.get("/api/v1/users/")
        self.assertEqual(records.status_code, 200)
        self.assertEqual([row["id"] for row in records.data["results"]], [self.partner.pk])
        self.assertEqual(self.client.get(f"/api/v1/users/{self.customer.pk}/").status_code, 404)
        self.assertEqual(self.client.post(f"/api/v1/users/{self.customer.pk}/approve/").status_code, 404)
        self.assertEqual(self.client.patch(f"/api/v1/users/{self.partner.pk}/", {"role": "admin"}).status_code, 403)
        summary = self.client.get("/api/v1/users/summary/")
        self.assertEqual(summary.status_code, 200)
        self.assertEqual(summary.data["total"], 1)

    def test_catalog_scope_does_not_approve_restaurants(self):
        self.scopes(["catalog"])
        self.assertEqual(self.client.get("/api/v1/menu-items/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/restaurants/").status_code, 200)
        self.assertEqual(self.client.post("/api/v1/restaurants/1/approve/").status_code, 403)

    def test_reports_does_not_grant_user_management(self):
        self.scopes(["reports"])
        self.assertEqual(self.client.get("/api/v1/analytics/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/insights/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/users/").status_code, 403)

    def test_only_superusers_manage_access_and_stale_changes_are_rejected(self):
        payload = {"full_access": False, "scopes": ["support"], "reason": "Support team assignment", "expected_revision": 1}
        url = f"/api/v1/admin-access/{self.admin.pk}/"
        self.assertEqual(self.client.get("/api/v1/admin-access/").status_code, 403)
        self.assertEqual(self.client.put(url, payload, format="json").status_code, 403)
        self.client.force_authenticate(self.root)
        response = self.client.put(url, payload, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["revision"], 2)
        self.assertEqual(self.client.put(url, payload, format="json").status_code, 409)
        self.assertEqual(AuditLog.objects.filter(action="admin.access_changed").count(), 1)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.get("/api/v1/support/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/users/").status_code, 403)

    def test_grant_validation_and_superuser_protection(self):
        self.client.force_authenticate(self.root)
        payload = {"full_access": False, "scopes": ["support"], "reason": "Reviewed", "expected_revision": 1}
        for change in [{"scopes": ["made-up"]}, {"reason": " "}, {"full_access": True}, {"expected_revision": -1}]:
            self.assertEqual(self.client.put(f"/api/v1/admin-access/{self.admin.pk}/", {**payload, **change}, format="json").status_code, 400)
        self.assertEqual(self.client.put(f"/api/v1/admin-access/{self.root.pk}/", payload, format="json").status_code, 400)
        self.assertEqual(effective_scopes(self.root), ["*"])

    def test_new_admins_and_promotions_start_without_permissions(self):
        self.client.force_authenticate(self.root)
        response = self.client.post("/api/v1/users/", {"email": "new-access@example.test", "password": "RandomTest-93452", "role": "admin"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["admin_scopes"], [])
        self.assertEqual(self.client.patch(f"/api/v1/users/{self.customer.pk}/", {"role": "admin"}, format="json").status_code, 200)
        self.customer.refresh_from_db()
        self.assertEqual(effective_scopes(self.customer), [])

    def test_existing_administrators_retain_explicitly_flagged_legacy_access(self):
        legacy = User.objects.create_user("legacy-access@example.test", role="admin")
        self.assertEqual(effective_scopes(legacy), ["*"])
        self.client.force_authenticate(self.root)
        response = self.client.get("/api/v1/admin-access/")
        record = next(row for row in response.data["administrators"] if row["id"] == legacy.pk)
        self.assertTrue(record["review_required"])
        self.assertEqual(record["revision"], 0)

    def test_revocation_filters_historical_inbox_and_future_notifications(self):
        self.scopes(["support"])
        visible = Notification.objects.create(user=self.admin, kind="support", title="Support", message="Support queue")
        hidden = Notification.objects.create(user=self.admin, kind="refund", title="Finance", message="Private finance note")
        Notification.objects.create(user=self.admin, kind="account", title="Partner", message="Approval", metadata={"approval_role": "delivery"})
        response = self.client.get("/api/v1/notifications/")
        self.assertEqual([row["id"] for row in response.data["results"]], [visible.pk])
        self.assertEqual(self.client.get(f"/api/v1/notifications/{hidden.pk}/").status_code, 404)
        self.assertEqual(self.client.get("/api/v1/notifications/summary/").data["unread_count"], 1)
        self.assertIn(self.admin.pk, admin_ids("support"))
        self.assertNotIn(self.admin.pk, admin_ids("finance"))

    def test_promotion_lookup_is_minimal_without_partner_management_access(self):
        self.scopes(["promotions"])
        from .models import Restaurant
        owner = User.objects.create_user("lookup-owner@example.test", role="restaurant")
        restaurant = Restaurant.objects.create(owner=owner, name="Lookup Kitchen", city="Delhi", address="Private kitchen", phone="1234567890")
        response = self.client.get("/api/v1/restaurants/lookup/?search=Lookup")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["results"], [{"id": restaurant.pk, "name": "Lookup Kitchen", "city": "Delhi"}])
        self.assertEqual(self.client.get("/api/v1/restaurants/").status_code, 403)
        self.assertEqual(self.client.post("/api/v1/categories/", {"name": "Hidden", "slug": "hidden"}, format="json").status_code, 403)
