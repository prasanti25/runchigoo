from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("api", "0013_menu_choices_stock_and_hours")]
    operations = [
        migrations.AddField(
            model_name="deliveryassignment",
            name="location_updated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
