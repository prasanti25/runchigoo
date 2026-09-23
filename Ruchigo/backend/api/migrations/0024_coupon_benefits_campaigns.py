import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("api", "0023_scheduled_orders_cash_tips")]
    operations = [
        migrations.AddField(model_name="coupon", name="benefit_type", field=models.CharField(choices=[("food", "Meal discount"), ("free_delivery", "Free delivery"), ("bogo", "Buy one, get one")], default="food", max_length=20)),
        migrations.AddField(model_name="coupon", name="bogo_item", field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="bogo_coupons", to="api.menuitem")),
        migrations.AddField(model_name="coupon", name="campaign_label", field=models.CharField(blank=True, max_length=80)),
        migrations.AddField(model_name="coupon", name="campaign_type", field=models.CharField(choices=[("standard", "Everyday offer"), ("festival", "Festival campaign"), ("new_customer", "First-order campaign")], default="standard", max_length=20)),
        migrations.AddField(model_name="coupon", name="max_free_items", field=models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(20)])),
        migrations.AddField(model_name="offer", name="coupon", field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="offer_banners", to="api.coupon")),
    ]
