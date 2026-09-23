from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("api", "0022_dashboard_report_indexes")]
    operations = [
        migrations.AddField(model_name="restaurant", name="scheduling_enabled", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="restaurant", name="schedule_notice_minutes", field=models.PositiveIntegerField(default=60, validators=[MinValueValidator(15), MaxValueValidator(1440)])),
        migrations.AddField(model_name="restaurant", name="schedule_horizon_days", field=models.PositiveIntegerField(default=7, validators=[MinValueValidator(1), MaxValueValidator(14)])),
        migrations.AddField(model_name="order", name="scheduled_for", field=models.DateTimeField(blank=True, null=True, db_index=True)),
        migrations.AddField(model_name="order", name="tip_amount", field=models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])),
        migrations.AddField(model_name="deliverypolicy", name="cash_tips_enabled", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="deliverypolicy", name="max_cash_tip", field=models.DecimalField(max_digits=8, decimal_places=2, default=500, validators=[MinValueValidator(1), MaxValueValidator(5000)])),
    ]
