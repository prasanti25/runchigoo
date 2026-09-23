from django.core.management.base import BaseCommand
from api.models import Order
from api.rewards import sync_order_rewards


class Command(BaseCommand):
    help = "Idempotently reconcile snapshotted order rewards; never capture or refund money."

    def add_arguments(self, parser):
        parser.add_argument("--after-id", type=int, default=0)
        parser.add_argument("--limit", type=int, default=1000)

    def handle(self, *args, **options):
        rows = Order.objects.exclude(reward_snapshot={}).filter(pk__gt=max(0, options["after_id"])).order_by("pk")[:max(1, min(10000, options["limit"]))]
        count, last = 0, options["after_id"]
        for order in rows:
            sync_order_rewards(order)
            count, last = count+1, order.pk
        self.stdout.write(f"Reconciled {count} orders. Continue with --after-id {last}.")
