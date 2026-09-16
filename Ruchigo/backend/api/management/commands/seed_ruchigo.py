import os
from decimal import Decimal

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from api.models import Category, MenuItem, Offer, Restaurant, User


CATEGORIES = {
    "north-indian": "North Indian",
    "biryani": "Biryani",
    "pizza": "Pizza",
    "burgers": "Burgers",
    "healthy": "Healthy",
    "desserts": "Desserts",
    "drinks": "Drinks",
}

CATALOG = [
    (
        "owner.spice@ruchigo.online",
        "Spice Route Kitchen",
        "North Indian curries, tandoor favourites and wholesome thalis",
        "9999999901",
        "Connaught Place",
        "Delhi",
        "4.70",
        [
            ("Paneer Tikka Masala", "north-indian", "Creamy paneer cooked with aromatic spices", "289.00", True, 25),
            ("Royal Veg Thali", "north-indian", "Dal, seasonal sabzi, rice, breads and dessert", "249.00", True, 22),
            ("Chicken Biryani", "biryani", "Fragrant basmati rice with tender spiced chicken", "329.00", False, 30),
        ],
    ),
    (
        "owner.oven@ruchigo.online",
        "The Pizza Oven",
        "Hand-stretched pizzas baked fresh to order",
        "9999999902",
        "Sector 18",
        "Noida",
        "4.60",
        [
            ("Farmhouse Pizza", "pizza", "Capsicum, tomato, onion and mozzarella", "349.00", True, 24),
            ("Classic Margherita", "pizza", "Tomato, basil and mozzarella on a crisp crust", "279.00", True, 20),
            ("Smoky Chicken Pizza", "pizza", "Smoked chicken, peppers and house sauce", "399.00", False, 26),
        ],
    ),
    (
        "owner.grill@ruchigo.online",
        "Urban Grill House",
        "Juicy burgers, grilled platters and loaded sides",
        "9999999903",
        "Cyber Hub",
        "Gurugram",
        "4.50",
        [
            ("Crispy Veg Burger", "burgers", "Crispy vegetable patty with fresh slaw", "199.00", True, 18),
            ("Peri Peri Chicken Burger", "burgers", "Grilled chicken with peri peri sauce", "259.00", False, 20),
            ("Protein Grill Bowl", "healthy", "Grilled protein, greens and house dressing", "319.00", False, 22),
        ],
    ),
    (
        "owner.green@ruchigo.online",
        "Green Bowl Cafe",
        "Fresh salads, nourishing bowls and handcrafted desserts",
        "9999999904",
        "Hauz Khas Village",
        "Delhi",
        "4.80",
        [
            ("Garden Fresh Salad", "healthy", "Seasonal greens, seeds and citrus dressing", "229.00", True, 15),
            ("Berry Celebration Cake", "desserts", "Vanilla sponge layered with fresh berries", "449.00", True, 25),
            ("Cold Coffee", "drinks", "Chilled coffee blended smooth and creamy", "149.00", True, 10),
        ],
    ),
]


class Command(BaseCommand):
    help = "Create or refresh the idempotent RuchiGo starter catalog."

    def add_arguments(self, parser):
        parser.add_argument(
            "--allow-production",
            action="store_true",
            help="Allow the starter catalog to be loaded into a production database.",
        )

    def handle(self, *args, **options):
        if not settings.DEBUG and not options["allow_production"]:
            raise CommandError("Use --allow-production to seed a production database.")

        categories = {}
        for slug, name in CATEGORIES.items():
            categories[slug], _ = Category.objects.update_or_create(
                slug=slug,
                defaults={"name": name, "is_active": True},
            )

        seed_password = os.getenv("RUCHIGO_SEED_PASSWORD")
        restaurants = []
        item_count = 0
        for owner_email, name, description, phone, address, city, rating, items in CATALOG:
            owner, created = User.objects.get_or_create(
                email=owner_email,
                defaults={"username": owner_email, "role": User.Role.RESTAURANT},
            )
            owner.username = owner_email
            owner.role = User.Role.RESTAURANT
            owner.is_active = True
            if seed_password:
                owner.set_password(seed_password)
            elif created:
                owner.set_unusable_password()
            owner.save()

            restaurant, _ = Restaurant.objects.update_or_create(
                owner=owner,
                defaults={
                    "name": name,
                    "description": description,
                    "phone": phone,
                    "email": owner_email,
                    "address": address,
                    "city": city,
                    "is_open": True,
                    "is_approved": True,
                    "average_rating": Decimal(rating),
                },
            )
            restaurants.append(restaurant)

            for item_name, slug, item_description, price, vegetarian, minutes in items:
                MenuItem.objects.update_or_create(
                    restaurant=restaurant,
                    name=item_name,
                    defaults={
                        "category": categories[slug],
                        "description": item_description,
                        "price": Decimal(price),
                        "is_vegetarian": vegetarian,
                        "is_available": True,
                        "preparation_minutes": minutes,
                    },
                )
                item_count += 1

        now = timezone.now()
        offers = [
            (restaurants[0], "20% off on your first feast", "Use RUCHI20 on eligible orders."),
            (restaurants[1], "Free delivery favourites", "Free delivery on orders above ₹500."),
            (restaurants[3], "Healthy combo savings", "Save on selected bowls and drinks."),
        ]
        for restaurant, title, description in offers:
            Offer.objects.update_or_create(
                restaurant=restaurant,
                title=title,
                defaults={
                    "description": description,
                    "starts_at": now - timezone.timedelta(days=1),
                    "ends_at": now + timezone.timedelta(days=90),
                    "is_active": True,
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Starter catalog ready: {len(restaurants)} restaurants, "
                f"{item_count} menu items, {len(offers)} offers."
            )
        )
