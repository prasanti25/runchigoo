from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Order
from api.payment_expiry import expire_unpaid_orders


class Command(BaseCommand):
    help = "Release expired unpaid reservations. Schedule every minute with --apply; default is dry-run."

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true")

    def handle(self, *args, **options):
        if not options["apply"]:
            count = Order.objects.filter(status=Order.Status.AWAITING_PAYMENT, payment_expires_at__lte=timezone.now()).count()
            self.stdout.write(f"{count} unpaid reservations are eligible to expire. No changes made.")
            return
        total = 0
        while True:
            count = expire_unpaid_orders()
            total += count
            if count < 100:
                break
        self.stdout.write(self.style.SUCCESS(f"Expired {total} unpaid reservations."))
