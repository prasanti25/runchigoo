import uuid
from decimal import Decimal
from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, username=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True


class User(AbstractUser, TimestampedModel):
    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        RESTAURANT = "restaurant", "Restaurant"
        DELIVERY = "delivery", "Delivery"
        ADMIN = "admin", "Admin"
    username = models.CharField(max_length=254, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.CUSTOMER, db_index=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()


class Restaurant(TimestampedModel):
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="restaurant")
    name = models.CharField(max_length=150, db_index=True)
    description = models.TextField(blank=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100, db_index=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    image = models.ImageField(upload_to="restaurants/", blank=True, null=True)
    is_open = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False, db_index=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    class Meta:
        indexes = [models.Index(fields=["city", "is_approved"])]


class Category(TimestampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    is_active = models.BooleanField(default=True)


class MenuItem(TimestampedModel):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="menu_items")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="menu_items")
    name = models.CharField(max_length=150, db_index=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))])
    image = models.ImageField(upload_to="menu/", blank=True, null=True)
    is_vegetarian = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True, db_index=True)
    preparation_minutes = models.PositiveIntegerField(default=20)
    class Meta:
        indexes = [models.Index(fields=["restaurant", "is_available"]), models.Index(fields=["name"])]
        ordering = ["-created_at"]


class Address(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField(max_length=50, default="Home")
    line1 = models.CharField(max_length=255); line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100); state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20); latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_default = models.BooleanField(default=False)


class Cart(TimestampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.SET_NULL, null=True, blank=True)

class CartItem(TimestampedModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    class Meta:
        constraints = [models.UniqueConstraint(fields=["cart", "menu_item"], name="unique_cart_menu_item")]


class Wishlist(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlist_items")
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name="wishlisted_by")
    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "menu_item"], name="unique_wishlist_item")]


class Coupon(TimestampedModel):
    code = models.CharField(max_length=40, unique=True)
    description = models.CharField(max_length=255, blank=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    starts_at = models.DateTimeField(); ends_at = models.DateTimeField()
    usage_limit = models.PositiveIntegerField(null=True, blank=True); usage_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

class Offer(TimestampedModel):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, null=True, blank=True, related_name="offers")
    title = models.CharField(max_length=150); description = models.TextField(blank=True)
    starts_at = models.DateTimeField(); ends_at = models.DateTimeField(); is_active = models.BooleanField(default=True)


class Order(TimestampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"; CONFIRMED = "confirmed", "Confirmed"; PREPARING = "preparing", "Preparing"; READY = "ready", "Ready"; OUT = "out_for_delivery", "Out for delivery"; DELIVERED = "delivered", "Delivered"; CANCELLED = "cancelled", "Cancelled"
    number = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.PROTECT, related_name="orders")
    delivery_address = models.ForeignKey(Address, on_delete=models.PROTECT)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2); delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0); total = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    class Meta:
        indexes = [models.Index(fields=["customer", "status"]), models.Index(fields=["restaurant", "status"])]

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    name = models.CharField(max_length=150); unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(); total_price = models.DecimalField(max_digits=10, decimal_places=2)

class Payment(TimestampedModel):
    class Status(models.TextChoices): PENDING="pending", "Pending"; PAID="paid", "Paid"; FAILED="failed", "Failed"; REFUNDED="refunded", "Refunded"
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    method = models.CharField(max_length=30, default="cod"); status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    transaction_id = models.CharField(max_length=120, blank=True); amount = models.DecimalField(max_digits=10, decimal_places=2)

class DeliveryAssignment(TimestampedModel):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="delivery")
    partner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="deliveries")
    pickup_at = models.DateTimeField(null=True, blank=True); delivered_at = models.DateTimeField(null=True, blank=True)
    current_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True); current_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

class Notification(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=150); message = models.TextField(); kind = models.CharField(max_length=40, default="general")
    is_read = models.BooleanField(default=False); metadata = models.JSONField(default=dict, blank=True)

class Review(TimestampedModel):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="review")
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)

class OTP(TimestampedModel):
    class Purpose(models.TextChoices): VERIFY_EMAIL="verify_email", "Verify email"; RESET_PASSWORD="reset_password", "Reset password"
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="otps")
    code = models.CharField(max_length=6); purpose = models.CharField(max_length=20, choices=Purpose.choices)
    expires_at = models.DateTimeField(); used_at = models.DateTimeField(null=True, blank=True)
    def is_valid(self): return not self.used_at and self.expires_at > timezone.now()

class AnalyticsEvent(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    event = models.CharField(max_length=100, db_index=True); payload = models.JSONField(default=dict, blank=True)

class AuditLog(TimestampedModel):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=120); target = models.CharField(max_length=255); metadata = models.JSONField(default=dict, blank=True)
