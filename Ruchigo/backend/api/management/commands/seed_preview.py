import os
from pathlib import Path
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from api.models import Address, Coupon, MenuItem, User


class Command(BaseCommand):
    help = "Populate an explicitly selected development database for product previews."

    def handle(self, *args, **options):
        password = os.getenv("RUCHIGO_SEED_PASSWORD")
        if not settings.DEBUG or not os.getenv("DJANGO_SQLITE_PATH") or not password:
            raise CommandError("Preview seed requires DEBUG, DJANGO_SQLITE_PATH and RUCHIGO_SEED_PASSWORD.")
        database = settings.DATABASES["default"]
        if database["ENGINE"] != "django.db.backends.sqlite3" or Path(database["NAME"]).resolve() != Path(os.environ["DJANGO_SQLITE_PATH"]).resolve():
            raise CommandError("Refusing to seed: the active database is not the explicitly selected preview SQLite database.")
        call_command("seed_ruchigo")
        for role in ("customer", "delivery", "admin"):
            email = f"preview.{role}@ruchigo.test"
            user, _ = User.objects.get_or_create(email=email, defaults={"username": email, "role": role})
            user.set_password(password)
            user.first_name = {"customer": "Aarav", "delivery": "Ravi", "admin": "RuchiGo"}[role]
            user.is_active = True
            user.is_staff = role == "admin"
            user.is_superuser = role == "admin"
            user.save()
            if role == "customer":
                Address.objects.get_or_create(user=user, label="Home", defaults={"line1": "24, Central Market", "city": "Delhi", "state": "Delhi", "postal_code": "110001", "is_default": True})
        now = timezone.now()
        Coupon.objects.update_or_create(code="RUCHI20", defaults={"description": "20% off orders of ₹199 or more", "discount_percent": 20, "min_order_amount": 199, "starts_at": now, "ends_at": now + timezone.timedelta(days=30), "is_active": True})
        MenuItem.objects.filter(name__in=["Royal Veg Thali", "Farmhouse Pizza", "Garden Fresh Salad", "Crispy Veg Burger"]).update(is_bestseller=True)
        MenuItem.objects.filter(category__slug="healthy").update(tags=["fresh", "healthy"])
        # Illustrative options for the isolated preview catalog, never live
        # merchant claims. Real partners configure their own optional extras.
        MenuItem.objects.filter(name="Royal Veg Thali", restaurant__owner__email="owner.spice@ruchigo.online", add_ons=[]).update(add_ons=[
            {"id": "extra-roti", "name": "Extra roti", "price": "20.00", "is_available": True},
            {"id": "extra-raita", "name": "Extra raita", "price": "35.00", "is_available": True},
        ])
        self.stdout.write(self.style.SUCCESS("Development preview accounts and catalog are ready."))
