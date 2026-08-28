from decimal import Decimal
from django.core.management.base import BaseCommand
from api.models import Category, MenuItem, Restaurant, User

class Command(BaseCommand):
    help = "Create safe local-development RuchiGo seed data."
    def handle(self, *args, **options):
        customer, _ = User.objects.get_or_create(email="customer@ruchigo.local", defaults={"role":"customer", "first_name":"Ruchi", "username":"customer@ruchigo.local"})
        customer.set_password("ChangeMe123!"); customer.save()
        owner, _ = User.objects.get_or_create(email="restaurant@ruchigo.local", defaults={"role":"restaurant", "first_name":"Kitchen", "username":"restaurant@ruchigo.local"})
        owner.set_password("ChangeMe123!"); owner.save()
        restaurant, _ = Restaurant.objects.get_or_create(owner=owner, defaults={"name":"RuchiGo Kitchen", "phone":"9999999999", "address":"MG Road", "city":"Delhi", "is_approved":True})
        category, _ = Category.objects.get_or_create(slug="north-indian", defaults={"name":"North Indian"})
        MenuItem.objects.get_or_create(restaurant=restaurant, category=category, name="Paneer Thali", defaults={"price":Decimal("249.00"), "is_vegetarian":True})
        self.stdout.write(self.style.SUCCESS("Seed data created. Development passwords: ChangeMe123!"))
