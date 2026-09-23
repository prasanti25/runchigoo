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
        email = self.normalize_email(email).lower()
        user = self.model(email=email, username=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
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
    opening_hours = models.JSONField(default=list, blank=True)
    scheduling_enabled = models.BooleanField(default=False)
    schedule_notice_minutes = models.PositiveIntegerField(default=60, validators=[MinValueValidator(15), MaxValueValidator(1440)])
    schedule_horizon_days = models.PositiveIntegerField(default=7, validators=[MinValueValidator(1), MaxValueValidator(14)])
    is_approved = models.BooleanField(default=False, db_index=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    class Meta:
        indexes = [models.Index(fields=["city", "is_approved"])]


class AdminAccessGrant(TimestampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="admin_access_grant")
    full_access = models.BooleanField(default=False)
    scopes = models.JSONField(default=list)
    revision = models.PositiveIntegerField(default=1)


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
    image_url = models.URLField(blank=True, max_length=500)
    is_bestseller = models.BooleanField(default=False)
    calories = models.PositiveIntegerField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    add_ons = models.JSONField(default=list, blank=True)
    option_groups = models.JSONField(default=list, blank=True)
    stock_quantity = models.PositiveIntegerField(null=True, blank=True)
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
    add_ons = models.JSONField(default=list, blank=True)
    configuration_key = models.CharField(max_length=64, blank=True, default="")
    class Meta:
        constraints = [models.UniqueConstraint(fields=["cart", "menu_item", "configuration_key"], name="unique_cart_item_configuration")]


class Wishlist(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlist_items")
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name="wishlisted_by")
    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "menu_item"], name="unique_wishlist_item")]


class Coupon(TimestampedModel):
    class Benefit(models.TextChoices):
        FOOD = "food", "Meal discount"
        DELIVERY = "free_delivery", "Free delivery"
        BOGO = "bogo", "Buy one, get one"
    class Campaign(models.TextChoices):
        STANDARD = "standard", "Everyday offer"
        FESTIVAL = "festival", "Festival campaign"
        NEW_CUSTOMER = "new_customer", "First-order campaign"
    benefit_type = models.CharField(max_length=20, choices=Benefit.choices, default=Benefit.FOOD)
    campaign_type = models.CharField(max_length=20, choices=Campaign.choices, default=Campaign.STANDARD)
    campaign_label = models.CharField(max_length=80, blank=True)
    bogo_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT, null=True, blank=True, related_name="bogo_coupons")
    max_free_items = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(20)])
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, null=True, blank=True, related_name="coupons")
    first_order_only = models.BooleanField(default=False)
    per_user_limit = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1)])
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal("0.01"))])
    code = models.CharField(max_length=40, unique=True)
    description = models.CharField(max_length=255, blank=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    starts_at = models.DateTimeField(); ends_at = models.DateTimeField()
    usage_limit = models.PositiveIntegerField(null=True, blank=True); usage_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

class Offer(TimestampedModel):
    coupon = models.ForeignKey(Coupon, on_delete=models.PROTECT, null=True, blank=True, related_name="offer_banners")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, null=True, blank=True, related_name="offers")
    title = models.CharField(max_length=150); description = models.TextField(blank=True)
    starts_at = models.DateTimeField(); ends_at = models.DateTimeField(); is_active = models.BooleanField(default=True)


class Order(TimestampedModel):
    class Status(models.TextChoices):
        AWAITING_PAYMENT = "awaiting_payment", "Awaiting payment"
        ASSIGNED = "assigned", "Delivery partner assigned"
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
    checkout_key = models.UUIDField(null=True, blank=True, unique=True)
    delivery_code = models.CharField(max_length=6, blank=True)
    address_snapshot = models.JSONField(default=dict, blank=True)
    delivery_quote = models.JSONField(default=dict, blank=True)
    scheduled_for = models.DateTimeField(null=True, blank=True, db_index=True)
    tip_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    reward_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reward_snapshot = models.JSONField(default=dict, blank=True)
    commission_snapshot = models.JSONField(default=dict, blank=True)
    cancellation_policy_snapshot = models.JSONField(default=dict, blank=True)
    fulfillment_paused_at = models.DateTimeField(null=True, blank=True)
    fulfillment_issue = models.ForeignKey("SupportTicket", on_delete=models.PROTECT, null=True, blank=True, related_name="held_orders")
    payment_expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    class Meta:
        indexes = [models.Index(fields=["customer", "status"]), models.Index(fields=["restaurant", "status"]), models.Index(fields=["created_at"], name="order_created_report_idx"), models.Index(fields=["restaurant", "created_at"], name="order_kitchen_report_idx")]
        ordering = ["-created_at"]

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    name = models.CharField(max_length=150); unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(); total_price = models.DecimalField(max_digits=10, decimal_places=2)
    add_ons = models.JSONField(default=list, blank=True)
    stock_deducted = models.BooleanField(default=False)

class Payment(TimestampedModel):
    class Status(models.TextChoices): PENDING="pending", "Pending"; PAID="paid", "Paid"; FAILED="failed", "Failed"; REFUNDED="refunded", "Refunded"
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    method = models.CharField(max_length=30, default="cod"); status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    transaction_id = models.CharField(max_length=120, blank=True); amount = models.DecimalField(max_digits=10, decimal_places=2)
    provider_order_id = models.CharField(max_length=120, blank=True, db_index=True)
    reconciliation_required = models.BooleanField(default=False, db_index=True)

    class Meta:
        indexes = [models.Index(fields=["status", "created_at"], name="payment_status_recorded_idx")]


class DeliveryPolicy(TimestampedModel):
    """Singleton. Existing rates remain in use until an admin enables zones."""
    enabled = models.BooleanField(default=False)
    cash_tips_enabled = models.BooleanField(default=False)
    max_cash_tip = models.DecimalField(max_digits=8, decimal_places=2, default=500, validators=[MinValueValidator(1), MaxValueValidator(5000)])
    revision = models.PositiveIntegerField(default=1)


class RewardPolicy(TimestampedModel):
    """Promotional credits only. No deposits, withdrawals or cash-equivalent wallet."""
    enabled = models.BooleanField(default=False)
    revision = models.PositiveIntegerField(default=1)
    points_per_100 = models.PositiveIntegerField(default=0)
    point_value = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    redemption_percent = models.PositiveIntegerField(default=0)
    cashback_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    cashback_cap = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    referral_credit = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    referral_minimum = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    tiers = models.JSONField(default=list, blank=True)


class RewardAccount(TimestampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="reward_account")
    # Negative adjustment balances are possible when spent rewards are reversed.
    points = models.BigIntegerField(default=0)
    credits = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    qualifying_points = models.BigIntegerField(default=0)
    revision = models.PositiveIntegerField(default=1)
    referral_code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    referred_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True, blank=True, related_name="referred_reward_accounts")
    referral_order = models.OneToOneField(Order, on_delete=models.PROTECT, null=True, blank=True, related_name="referral_qualification")


class RewardEntry(models.Model):
    account = models.ForeignKey(RewardAccount, on_delete=models.PROTECT, related_name="entries")
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name="reward_entries")
    kind = models.CharField(max_length=20, choices=[("redeem", "Used at checkout"), ("restore", "Returned rewards"), ("earn", "Order rewards"), ("referral", "Referral reward")])
    points = models.BigIntegerField(default=0)
    credits = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    qualifying_points = models.BigIntegerField(default=0)
    event_key = models.CharField(max_length=160, unique=True)
    note = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
        indexes = [models.Index(fields=["account", "order", "kind"], name="reward_reconcile_idx")]


class CancellationPolicy(TimestampedModel):
    cutoff = models.CharField(max_length=20, choices=[("acceptance", "Before restaurant acceptance"), ("preparation", "Before cooking starts")], default="acceptance")
    allow_prepaid_refunds = models.BooleanField(default=False)
    revision = models.PositiveIntegerField(default=1)


class DeliveryZone(TimestampedModel):
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100, db_index=True)
    is_active = models.BooleanField(default=False)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, validators=[MinValueValidator(-90), MaxValueValidator(90)])
    longitude = models.DecimalField(max_digits=9, decimal_places=6, validators=[MinValueValidator(-180), MaxValueValidator(180)])
    radius_km = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(Decimal("0.10")), MaxValueValidator(100)])
    max_delivery_km = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(Decimal("0.10")), MaxValueValidator(100)])
    base_fee = models.DecimalField(max_digits=7, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(10000)])
    per_km_fee = models.DecimalField(max_digits=7, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(1000)])
    included_km = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    free_delivery_above = models.DecimalField(max_digits=9, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    minimum_order = models.DecimalField(max_digits=9, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    class Meta:
        ordering = ["city", "id"]
        constraints = [models.UniqueConstraint(fields=["city", "name"], name="unique_delivery_zone_name")]

class DeliveryPricingRule(TimestampedModel):
    zone = models.ForeignKey(DeliveryZone, on_delete=models.PROTECT, related_name="pricing_rules")
    name = models.CharField(max_length=80)
    kind = models.CharField(max_length=10, choices=[("surge", "Temporary demand fee"), ("peak", "Scheduled peak fee")])
    additional_fee = models.DecimalField(max_digits=7, decimal_places=2, validators=[MinValueValidator(Decimal("0.01")), MaxValueValidator(500)])
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    weekdays = models.JSONField(default=list, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    revision = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["-created_at"]


class ServiceCity(TimestampedModel):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    revision = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["name"]


class DeliveryAssignment(TimestampedModel):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="delivery")
    partner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="deliveries")
    pickup_at = models.DateTimeField(null=True, blank=True); delivered_at = models.DateTimeField(null=True, blank=True)
    current_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True); current_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_updated_at = models.DateTimeField(null=True, blank=True)

class Notification(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=150); message = models.TextField(); kind = models.CharField(max_length=40, default="general")
    is_read = models.BooleanField(default=False); metadata = models.JSONField(default=dict, blank=True)
    event_key = models.CharField(max_length=160, null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["user", "is_read"], name="notification_user_unread_idx")]
        constraints = [models.UniqueConstraint(fields=["user", "event_key"], name="notification_user_event_unique")]


class DeliveryMessage(TimestampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="delivery_messages")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="sent_delivery_messages")
    # Snapshot the recipient partnership. A replacement courier must not read
    # messages exchanged with the previous courier.
    partner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="delivery_conversations")
    text = models.CharField(max_length=1000)
    client_id = models.UUIDField()
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["id"]
        constraints = [models.UniqueConstraint(fields=["order", "author", "client_id"], name="delivery_message_retry_unique")]
        indexes = [models.Index(fields=["order", "partner", "id"], name="delivery_message_thread_idx")]

class Review(TimestampedModel):
    is_visible = models.BooleanField(default=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="review")
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)

class OTP(TimestampedModel):
    class Purpose(models.TextChoices): VERIFY_EMAIL="verify_email", "Verify email"; RESET_PASSWORD="reset_password", "Reset password"
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="otps")
    # Store Django's salted password hash, never the six-digit plaintext code.
    code = models.CharField(max_length=128); purpose = models.CharField(max_length=20, choices=Purpose.choices)
    expires_at = models.DateTimeField(); used_at = models.DateTimeField(null=True, blank=True)
    def is_valid(self): return not self.used_at and self.expires_at > timezone.now()

class AnalyticsEvent(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    event = models.CharField(max_length=100, db_index=True); payload = models.JSONField(default=dict, blank=True)

class AuditLog(TimestampedModel):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=120); target = models.CharField(max_length=255); metadata = models.JSONField(default=dict, blank=True)


class OrderEvent(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="events")
    status = models.CharField(max_length=20)
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]


class SupportTicket(TimestampedModel):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In progress"
        RESOLVED = "resolved", "Resolved"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="support_tickets")
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=30, choices=[(x, x.replace("_", " ").title()) for x in ["missing_item", "wrong_item", "food_quality", "delivery", "payment", "refund", "account", "privacy", "other"]])
    subject = models.CharField(max_length=150)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    affected_items = models.JSONField(default=list, blank=True)
    feedback_score = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    feedback_comment = models.CharField(max_length=1000, blank=True)
    feedback_at = models.DateTimeField(null=True, blank=True)
    staff_requested_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]


class RefundRequest(TimestampedModel):
    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        REVIEWING = "reviewing", "Under review"
        APPROVED = "approved", "Approved, awaiting payment processing"
        PROCESSING = "processing", "Processing"
        PROCESSED = "processed", "Refund processed"
        REJECTED = "rejected", "Not approved"
        FAILED = "failed", "Processing failed"
    ticket = models.OneToOneField(SupportTicket, on_delete=models.PROTECT, related_name="refund_request")
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name="refund_requests")
    requested_amount = models.DecimalField(max_digits=10, decimal_places=2)
    approved_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.REQUESTED, db_index=True)
    decision_note = models.CharField(max_length=1000, blank=True)
    provider_refund_id = models.CharField(max_length=120, unique=True, null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    automatic_cancellation = models.BooleanField(default=False, db_index=True)


class TicketMessage(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    body = models.TextField(max_length=3000)
    reply_to = models.OneToOneField("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="assistance_reply")
    client_id = models.UUIDField(null=True, blank=True)
    actions = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]
        constraints = [models.UniqueConstraint(fields=["ticket", "author", "client_id"], name="unique_ticket_client_message")]


class TasteProfile(TimestampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="taste_profile")
    vegetarian = models.BooleanField(default=False)
    dietary_tags = models.JSONField(default=list, blank=True)
    budget = models.PositiveIntegerField(null=True, blank=True)
    cuisines = models.JSONField(default=list, blank=True)
    use_order_history = models.BooleanField(default=True)


class RestaurantVisit(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    visited_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "restaurant"], name="unique_restaurant_visit")]
        ordering = ["-visited_at"]


class SavedRestaurant(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "restaurant"], name="unique_saved_restaurant")]


class CommissionPolicy(TimestampedModel):
    enabled = models.BooleanField(default=False)
    percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    settlement_recording_enabled = models.BooleanField(default=False)
    revision = models.PositiveIntegerField(default=1)


class MerchantAccount(TimestampedModel):
    restaurant = models.OneToOneField(Restaurant, on_delete=models.PROTECT, related_name="merchant_account")
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    revision = models.PositiveIntegerField(default=1)


class MerchantSettlement(models.Model):
    account = models.ForeignKey(MerchantAccount, on_delete=models.PROTECT, related_name="settlements")
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    reference = models.CharField(max_length=120, unique=True)
    client_id = models.UUIDField(unique=True)
    paid_at = models.DateTimeField()
    note = models.CharField(max_length=500)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    reversed_at = models.DateTimeField(null=True, blank=True)
    reversal_note = models.CharField(max_length=500, blank=True)

    class Meta:
        ordering = ["-id"]
        constraints = [models.CheckConstraint(condition=models.Q(amount__gt=0), name="merchant_settlement_positive")]


class MerchantEntry(models.Model):
    """Service-owned append-only ledger. No API to edit or delete entries."""
    account = models.ForeignKey(MerchantAccount, on_delete=models.PROTECT, related_name="entries")
    order = models.ForeignKey(Order, on_delete=models.PROTECT, null=True, blank=True, related_name="merchant_entries")
    settlement = models.ForeignKey(MerchantSettlement, on_delete=models.PROTECT, null=True, blank=True)
    kind = models.CharField(max_length=20, choices=[("accrual", "Order accrual / refund adjustment"), ("settlement", "External payment recorded"), ("correction", "Settlement record corrected")])
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    merchant_sales = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    commission = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    platform_promotion = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    delivery_collected = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tip_collected = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    payment_collected = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    rounding_adjustment = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    event_key = models.CharField(max_length=120, unique=True)
    note = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
        indexes = [models.Index(fields=["account", "order", "kind"], name="merchant_reconcile_idx")]
        constraints = [models.UniqueConstraint(fields=["settlement", "kind"], name="merchant_settlement_entry_once")]
