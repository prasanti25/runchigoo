from django.core.management.base import BaseCommand
from api.models import Order
from api.merchant_finance import sync_order_finance


class Command(BaseCommand):
    help = "Idempotently reconcile delivered orders with approved commission snapshots; never sends money."

    def handle(self, *args, **options):
        count = 0
        for order in Order.objects.filter(status="delivered").exclude(commission_snapshot={}).iterator(chunk_size=200):
            sync_order_finance(order)
            count += 1
        self.stdout.write(f"Reviewed {count} snapshotted delivered orders. No transfers initiated.")
