from django.core.management.base import BaseCommand
from rest_framework.exceptions import ValidationError
from api.models import RefundRequest
from api.refunds import submit_approved_refund


class Command(BaseCommand):
    help = "Recover explicitly policy-approved cancellation refunds. Dry-run unless --apply. Never retries uncertain processing requests."

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true")

    def handle(self, *args, **options):
        refunds = RefundRequest.objects.filter(automatic_cancellation=True, status="approved").order_by("created_at")
        if not options["apply"]:
            self.stdout.write(f"{refunds.count()} approved cancellation refunds awaiting submission. No changes made.")
            return
        submitted = 0
        for pk in list(refunds.values_list("pk", flat=True)[:100]):
            try:
                submit_approved_refund(pk)
                submitted += 1
            except ValidationError:
                self.stderr.write(f"Refund request {pk} remains for staff review.")
        self.stdout.write(f"Submitted {submitted} approved cancellation refund requests; processing is not a completion guarantee.")
