"""Keep orders placed before delivery-code support deliverable after upgrading."""
import secrets

from django.db import migrations


def populate_delivery_codes(apps, schema_editor):
    Order = apps.get_model("api", "Order")
    orders = Order.objects.using(schema_editor.connection.alias)
    active = orders.filter(delivery_code="").exclude(status__in=["delivered", "cancelled"])
    for order_id in active.values_list("pk", flat=True).iterator():
        orders.filter(pk=order_id, delivery_code="").update(
            delivery_code=f"{secrets.randbelow(1_000_000):06d}"
        )


class Migration(migrations.Migration):
    dependencies = [("api", "0010_menu_addons_and_cart_variants")]
    operations = [migrations.RunPython(populate_delivery_codes, migrations.RunPython.noop)]
