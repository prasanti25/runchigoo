from datetime import timedelta
from decimal import Decimal

from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APITestCase

from .insights import midnight, operational_report
from .models import Address, AuditLog, DeliveryAssignment, Order, Payment, Restaurant, User


class DashboardTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.admin = User.objects.create_user("dashboard-admin@example.test", "LongPass-4928", role="admin")
        self.superuser = User.objects.create_superuser("dashboard-root@example.test", "LongPass-4928")
        self.owner = User.objects.create_user("dashboard-owner@example.test", "LongPass-4928", role="restaurant")
        self.customer = User.objects.create_user("dashboard-customer@example.test", "LongPass-4928")
        self.courier = User.objects.create_user("dashboard-courier@example.test", "LongPass-4928", role="delivery")
        self.restaurant = Restaurant.objects.create(owner=self.owner, name="Report kitchen", city="Delhi", address="Kitchen")
        self.address = Address.objects.create(user=self.customer, line1="Private street", city="Delhi", state="Delhi", postal_code="110001")
        self.client.force_authenticate(self.admin)

    def order(self, status="delivered", days=1, total="100.00"):
        order = Order.objects.create(customer=self.customer, restaurant=self.restaurant, delivery_address=self.address, status=status, subtotal=total, total=total)
        Order.objects.filter(pk=order.pk).update(created_at=midnight(timezone.localdate()-timedelta(days=days))+timedelta(hours=12))
        return order

    def test_date_range_and_previous_comparison(self):
        self.order(days=1)
        self.order(days=2, status="cancelled")
        self.order(days=3, total="50.00")
        end = timezone.localdate()-timedelta(days=1)
        start = end-timedelta(days=1)
        response = self.client.get(f"/api/v1/insights/?start={start}&end={end}")
        self.assertEqual(response.status_code, 200)
        report = response.data
        self.assertEqual(report["summary"]["orders"], 2)
        self.assertEqual(report["summary"]["cancelled"], 1)
        self.assertEqual(report["summary"]["cancellation_rate"], 50)
        self.assertEqual(report["comparison"]["change_percent"]["gross_order_value"], 100)
        self.assertEqual(len(report["daily"]), 2)
        self.assertEqual(sum(row["placed_orders"] for row in report["daily"]), 2)
        self.assertEqual(response["Cache-Control"], "private, no-store")

    def test_report_validation_and_today(self):
        today = timezone.localdate()
        for query in [f"start={today}", f"end={today}", "start=bad&end=bad", f"start={today}&end={today+timedelta(days=1)}", f"start={today-timedelta(days=90)}&end={today}", f"start={today}&end={today-timedelta(days=1)}"]:
            self.assertEqual(self.client.get(f"/api/v1/insights/?{query}").status_code, 400)
        self.order(days=0)
        response = self.client.get(f"/api/v1/insights/?start={today}&end={today}")
        self.assertEqual(response.data["summary"]["orders"], 1)
        self.assertIsNone(response.data["comparison"]["change_percent"]["orders"])

    def test_report_is_scoped_and_never_leaks_identity(self):
        self.order()
        other = User.objects.create_user("empty-kitchen@example.test", role="restaurant")
        self.client.force_authenticate(other)
        report = self.client.get("/api/v1/insights/")
        self.assertEqual(report.data["summary"]["orders"], 0)
        self.assertNotIn(self.customer.email, str(report.data))
        self.assertNotIn("risk_review", report.data)
        for person in [self.customer, self.courier]:
            self.client.force_authenticate(person)
            self.assertEqual(self.client.get("/api/v1/insights/").status_code, 403)

    def test_report_has_no_ten_thousand_order_truncation(self):
        records = [Order(customer=self.customer, restaurant=self.restaurant, delivery_address=self.address, status="delivered", subtotal=1, total=1) for _ in range(10001)]
        Order.objects.bulk_create(records, batch_size=300)
        yesterday = timezone.localdate()-timedelta(days=1)
        Order.objects.update(created_at=midnight(yesterday)+timedelta(hours=12))
        report = operational_report(Order.objects.all(), timezone.localdate(), yesterday, yesterday)
        self.assertEqual(report["summary"]["delivered"], 10001)
        self.assertEqual(Decimal(report["summary"]["gross_order_value"]), 10001)
        self.assertEqual(report["daily"][0]["orders"], 10001)
        self.assertFalse(report["truncated"])

    def test_timezone_day_boundaries(self):
        day = timezone.localdate()-timedelta(days=1)
        left, inside, right = self.order(), self.order(), self.order()
        Order.objects.filter(pk=left.pk).update(created_at=midnight(day)-timedelta(microseconds=1))
        Order.objects.filter(pk=inside.pk).update(created_at=midnight(day))
        Order.objects.filter(pk=right.pk).update(created_at=midnight(day+timedelta(days=1)))
        report = operational_report(Order.objects.all(), timezone.localdate(), day, day)
        self.assertEqual(report["summary"]["orders"], 1)

    def test_account_summary_search_pagination_match(self):
        User.objects.bulk_create([User(email=f"page-{i}@example.test", username=f"page-{i}@example.test", password="!", role="delivery", is_active=False) for i in range(30)])
        query = "search=page-&role=delivery&is_active=false"
        summary = self.client.get(f"/api/v1/users/summary/?{query}").data
        self.assertEqual(summary["total"], 30)
        self.assertEqual(summary["inactive"], 30)
        self.assertFalse(summary["can_manage_admins"])
        first = self.client.get(f"/api/v1/users/?{query}").data
        self.assertEqual(first["count"], 30)
        self.assertIsNotNone(first["next"])
        second = self.client.get(f"/api/v1/users/?{query}&page=2").data
        self.assertTrue(second["results"])
        self.assertFalse(set(row["id"] for row in first["results"]) & set(row["id"] for row in second["results"]))

    def test_admin_accounts_are_protected_across_all_mutations(self):
        other = User.objects.create_user("other-admin@example.test", "LongPass-4928", role="admin")
        for path, method, data in [(f"{other.pk}/", "patch", {"password": "ChangedPass-9988"}), (f"{other.pk}/block/", "post", {}), (f"{other.pk}/", "delete", {}), (f"{other.pk}/approve/", "post", {})]:
            self.assertEqual(getattr(self.client, method)(f"/api/v1/users/{path}", data, format="json").status_code, 400)
        other.is_active = False
        other.save()
        self.assertEqual(self.client.post(f"/api/v1/users/{other.pk}/unblock/").status_code, 400)
        self.assertEqual(AuditLog.objects.count(), 0)

    def test_superuser_cannot_demote_self(self):
        self.client.force_authenticate(self.superuser)
        response = self.client.patch(f"/api/v1/users/{self.superuser.pk}/", {"role": "customer"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_roles_with_history_cannot_be_reassigned(self):
        self.order()
        for person in [self.customer, self.owner]:
            self.assertEqual(self.client.patch(f"/api/v1/users/{person.pk}/", {"role": "delivery"}, format="json").status_code, 400)

    def test_active_work_prevents_access_loss(self):
        order = self.order(status="assigned")
        DeliveryAssignment.objects.create(order=order, partner=self.courier)
        for person in [self.customer, self.owner, self.courier]:
            self.assertEqual(self.client.post(f"/api/v1/users/{person.pk}/block/").status_code, 400)
            self.assertEqual(self.client.patch(f"/api/v1/users/{person.pk}/", {"is_active": False}, format="json").status_code, 400)
            person.refresh_from_db()
            self.assertTrue(person.is_active)
        order.refresh_from_db()
        self.assertEqual(order.status, "assigned")

    def test_audit_is_atomic_and_excludes_credentials(self):
        response = self.client.patch(f"/api/v1/users/{self.customer.pk}/", {"first_name": "Private Name", "password": "SecretChange-48291", "reason": "Requested profile correction"}, format="json")
        self.assertEqual(response.status_code, 200)
        entry = AuditLog.objects.get(action="account.updated")
        self.assertEqual(entry.metadata["reason"], "Requested profile correction")
        self.assertIn("password", entry.metadata["fields"])
        self.assertNotIn("SecretChange", str(entry.metadata))
        self.assertNotIn("Private Name", str(entry.metadata))
        response = self.client.post(f"/api/v1/users/{self.customer.pk}/block/", {"reason": "x"*501}, format="json")
        self.assertEqual(response.status_code, 400)
        self.customer.refresh_from_db()
        self.assertTrue(self.customer.is_active)
        self.assertEqual(AuditLog.objects.count(), 1)

    def test_block_restore_audit_and_nonadmin_denied(self):
        self.assertEqual(self.client.post(f"/api/v1/users/{self.customer.pk}/block/", {"reason": "Test restriction"}).status_code, 200)
        self.assertEqual(self.client.post(f"/api/v1/users/{self.customer.pk}/unblock/", {"reason": "Reviewed"}).status_code, 200)
        self.assertEqual(AuditLog.objects.filter(target=str(self.customer.pk)).count(), 2)
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get("/api/v1/users/summary/").status_code, 403)

    def test_order_queue_filters_and_summary_agree(self):
        first = self.order(status="pending", days=1)
        self.order(status="delivered", days=2)
        day = timezone.localdate()-timedelta(days=1)
        query = f"status=pending&placed_after={day}&placed_before={day}&search=Report"
        listing = self.client.get(f"/api/v1/orders/?{query}").data
        summary = self.client.get(f"/api/v1/orders/summary/?{query}").data
        self.assertEqual([row["id"] for row in listing["results"]], [first.pk])
        self.assertEqual(summary["total"], 1)
        self.assertEqual(summary["by_status"][0]["status"], "pending")
        self.assertEqual(self.client.get("/api/v1/orders/?placed_after=bad").status_code, 400)
        self.assertEqual(self.client.get(f"/api/v1/orders/?placed_after={day}&placed_before={day-timedelta(days=1)}").status_code, 400)

    def test_hold_filter_and_stale_stage_guard(self):
        order = self.order(status="preparing")
        Order.objects.filter(pk=order.pk).update(fulfillment_paused_at=timezone.now())
        self.assertEqual(self.client.get("/api/v1/orders/?on_hold=true").data["count"], 1)
        self.assertEqual(self.client.get("/api/v1/orders/?on_hold=false").data["count"], 0)
        result = self.client.post(f"/api/v1/orders/{order.pk}/status/", {"status": "confirmed", "expected_status": "pending"}, format="json")
        self.assertEqual(result.status_code, 409)
        order.refresh_from_db()
        self.assertEqual(order.status, "preparing")

    def test_payment_summary_is_filtered_and_role_scoped(self):
        for status, amount in [("paid", 100), ("failed", 200), ("paid", 300)]:
            order = self.order(total=str(amount))
            Payment.objects.create(order=order, amount=amount, status=status, method="cod")
        self.client.force_authenticate(self.owner)
        query = "status=paid&method=cod"
        listing = self.client.get(f"/api/v1/payments/?{query}").data
        summary = self.client.get(f"/api/v1/payments/summary/?{query}").data
        self.assertEqual(listing["count"], 2)
        self.assertEqual(summary["total"], 2)
        self.assertEqual(summary["by_status"][0]["amount"], Decimal(400))
        self.client.force_authenticate(self.courier)
        self.assertEqual(self.client.get("/api/v1/payments/summary/").data["total"], 0)

    def test_invalid_payment_date_ranges(self):
        day = timezone.localdate()
        for query in ["recorded_before=bad", f"recorded_after={day}&recorded_before={day-timedelta(days=1)}"]:
            self.assertEqual(self.client.get(f"/api/v1/payments/?{query}").status_code, 400)
