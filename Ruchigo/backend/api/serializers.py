from django.contrib.auth import password_validation
from django.db import transaction
from django.db import models
from django.utils import timezone
import secrets
from datetime import timedelta
import io
import logging
from uuid import uuid4
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage, default_storage
from django.conf import settings
from PIL import Image, ImageOps
from rest_framework import serializers
from .models import *
from .notifications import notify, admin_ids, notify_order
from .menu_options import cart_addons, cart_unit_price, minimum_item_price
from .availability import accepting_orders, validate_hours
from .serviceability import delivery_quote, quote_fingerprint, verify_quote
from .cancellations import cancellation_details
from .admin_access import effective_scopes


def normalize_email(value):
    return (value or "").strip().lower()


def validate_unique_email(value, instance=None):
    email = normalize_email(value)
    queryset = User.objects.filter(email__iexact=email)
    if instance is not None:
        queryset = queryset.exclude(pk=instance.pk)
    if queryset.exists():
        raise serializers.ValidationError("A user with this email already exists.")
    return email

class UserSerializer(serializers.ModelSerializer):
    admin_scopes = serializers.SerializerMethodField()
    can_manage_admins = serializers.BooleanField(source="is_superuser", read_only=True)
    can_upload_photo = serializers.SerializerMethodField()

    def get_can_upload_photo(self, obj):
        return not (settings.SERVERLESS_RUNTIME and isinstance(default_storage, FileSystemStorage))

    def get_admin_scopes(self, obj):
        return effective_scopes(obj)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "avatar",
            "role",
            "email_verified",
            "is_available",
            "is_active",
            "created_at",
            "admin_scopes",
            "can_manage_admins",
            "can_upload_photo",
        ]
        read_only_fields = ["id", "email_verified", "role", "is_active", "created_at"]

    def validate_email(self, value):
        return validate_unique_email(value, self.instance)

    def validate_avatar(self, value):
        if value is None:
            return None
        if not self.get_can_upload_photo(self.instance):
            raise serializers.ValidationError("Photo uploads are temporarily unavailable. Your other profile details can still be updated.")
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Choose a photo smaller than 5 MB.")
        with Image.open(value) as original:
            if original.format not in ["JPEG", "PNG", "WEBP"]:
                raise serializers.ValidationError("Choose a JPG, PNG or WebP photo.")
            if original.width > 4096 or original.height > 4096:
                raise serializers.ValidationError("Photo dimensions must be 4096 × 4096 pixels or smaller.")
            # Strip location/EXIF metadata and re-encode, never serve the raw
            # upload. The profile shows the same centre crop as the preview.
            image = ImageOps.fit(ImageOps.exif_transpose(original).convert("RGB"), (512, 512), method=Image.Resampling.LANCZOS)
            output = io.BytesIO()
            image.save(output, "WEBP", quality=85)
        return ContentFile(output.getvalue(), name=f"{uuid4().hex}.webp")

    def update(self, instance, validated_data):
        previous_avatar = instance.avatar.name if "avatar" in validated_data and instance.avatar else None
        storage = instance.avatar.storage
        email_changed = (
            "email" in validated_data
            and validated_data["email"].casefold() != instance.email.casefold()
        )
        if "email" in validated_data:
            instance.username = validated_data["email"]
        if email_changed:
            instance.email_verified = False
        updated = super().update(instance, validated_data)
        if previous_avatar and previous_avatar != updated.avatar.name:
            def remove_old_photo():
                if not User.objects.filter(avatar=previous_avatar).exists():
                    try:
                        storage.delete(previous_avatar)
                    except OSError:
                        logging.getLogger(__name__).warning("Old profile photo cleanup failed")
            transaction.on_commit(remove_old_photo)
        return updated

class AdminUserSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=False)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ["password"]
        read_only_fields = ["id", "email_verified", "created_at"]

    def validate_password(self, value):
        password_validation.validate_password(value, self.instance)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError({"password": "This field is required."})
        user = User.objects.create_user(**validated_data, password=password)
        if user.role == User.Role.ADMIN:
            AdminAccessGrant.objects.create(user=user, scopes=[], full_access=False)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save(update_fields=["password"])
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "phone", "role"]
    def validate_role(self, value):
        if value not in [User.Role.CUSTOMER, User.Role.RESTAURANT, User.Role.DELIVERY]:
            raise serializers.ValidationError(
                "Only customer, restaurant, or delivery roles are allowed for registration. Admin role is not allowed."
            )
        return value
    def validate_email(self, value):
        return validate_unique_email(value)
    def validate_password(self, value):
        password_validation.validate_password(value)
        return value
    @transaction.atomic
    def create(self, data):
        role = data.get("role", User.Role.CUSTOMER)
        is_active = role == User.Role.CUSTOMER
        user = User.objects.create_user(is_active=is_active, **data)
        notify([user.pk], event=f"account:{user.pk}:registered", title="Welcome to RuchiGo",
               message="Your account is ready. Discover your next favourite meal." if is_active else "Your partner registration has been received and is awaiting approval.", kind="account")
        if not is_active:
            notify(admin_ids("partners"), event=f"account:{user.pk}:approval-request", title="Partner approval needed",
                   message=f"A new {user.get_role_display().lower()} account is waiting for review.", kind="account", metadata={"approval_role": role})
        return user

class RestaurantSerializer(serializers.ModelSerializer):
    accepting_orders = serializers.SerializerMethodField()
    def get_accepting_orders(self, restaurant):
        return accepting_orders(restaurant)
    def validate_opening_hours(self, value):
        return validate_hours(value)
    owner_id = serializers.PrimaryKeyRelatedField(
        source="owner",
        queryset=User.objects.filter(role=User.Role.RESTAURANT),
        write_only=True,
        required=False,
    )
    class Meta:
        model = Restaurant
        fields = [
            "id", "owner_id", "name", "description", "phone", "email", "address",
            "city", "latitude", "longitude", "image", "is_open", "is_approved",
            "average_rating", "created_at", "updated_at", "opening_hours", "accepting_orders",
        ]
        read_only_fields = ["is_approved", "average_rating", "created_at", "updated_at"]
    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated and not (user.is_superuser or user.role == User.Role.ADMIN) and "owner" in attrs:
            raise serializers.ValidationError({"owner_id": "Restaurant accounts cannot change ownership."})
        return attrs
class CategorySerializer(serializers.ModelSerializer):
    class Meta: model = Category; fields = "__all__"; read_only_fields = ["created_at", "updated_at"]

class AddOnSerializer(serializers.Serializer):
    id = serializers.RegexField(r"^[a-zA-Z0-9_-]{1,60}$")
    name = serializers.CharField(max_length=80, trim_whitespace=True)
    price = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=Decimal("0"), max_value=Decimal("10000"))
    is_available = serializers.BooleanField(default=True)
    group_id = serializers.RegexField(r"^[a-zA-Z0-9_-]{1,60}$", required=False, allow_blank=True)


class OptionGroupSerializer(serializers.Serializer):
    id = serializers.RegexField(r"^[a-zA-Z0-9_-]{1,60}$")
    name = serializers.CharField(max_length=60)
    min_select = serializers.IntegerField(min_value=0, max_value=12)
    max_select = serializers.IntegerField(min_value=1, max_value=12)
    def validate(self, attrs):
        if attrs["min_select"] > attrs["max_select"]:
            raise serializers.ValidationError("Minimum choices cannot exceed the maximum.")
        return attrs

class MenuItemSerializer(serializers.ModelSerializer):
    minimum_price = serializers.SerializerMethodField()
    orderable = serializers.SerializerMethodField()
    def get_minimum_price(self, item):
        price = minimum_item_price(item)
        return str(price) if price is not None else None
    def get_orderable(self, item):
        return item.is_available and item.stock_quantity != 0 and accepting_orders(item.restaurant) and minimum_item_price(item) is not None
    restaurant_detail = RestaurantSerializer(source="restaurant", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    restaurant_id = serializers.PrimaryKeyRelatedField(source="restaurant", queryset=Restaurant.objects.all(), write_only=True, required=False)
    class Meta: model = MenuItem; fields = "__all__"; read_only_fields = ["restaurant", "created_at", "updated_at"]
    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.user.is_authenticated and request.user.role == User.Role.RESTAURANT and "restaurant" in attrs:
            raise serializers.ValidationError({"restaurant_id": "Restaurant accounts cannot change item ownership."})
        groups = attrs.get("option_groups", getattr(self.instance, "option_groups", []))
        addons = attrs.get("add_ons", getattr(self.instance, "add_ons", []))
        group_ids = {group["id"] for group in groups}
        if any(row.get("group_id") and row["group_id"] not in group_ids for row in addons):
            raise serializers.ValidationError({"add_ons": "An option refers to a missing group. Reassign it or remove it."})
        for group in groups:
            if sum(row.get("group_id") == group["id"] for row in addons) < group["min_select"]:
                raise serializers.ValidationError({"option_groups": f"Add enough choices for {group['name']}."})
        return attrs
    def validate_stock_quantity(self, value):
        if value is not None and not 0 <= value <= 1000000:
            raise serializers.ValidationError("Stock must be 0–1,000,000 portions, or left blank for untracked stock.")
        return value
    def validate_option_groups(self, rows):
        if not isinstance(rows, list) or len(rows) > 4:
            raise serializers.ValidationError("Use up to four choice groups per dish.")
        serializer = OptionGroupSerializer(data=rows, many=True)
        serializer.is_valid(raise_exception=True)
        if len({row["id"] for row in serializer.validated_data}) != len(rows):
            raise serializers.ValidationError("Each group needs a unique ID.")
        return serializer.validated_data
    def validate_tags(self, tags):
        if not isinstance(tags, list) or len(tags) > 8 or any(not isinstance(tag, str) or len(tag) > 30 for tag in tags):
            raise serializers.ValidationError("Use up to eight short dietary tags.")
        return list(dict.fromkeys(tag.strip().lower() for tag in tags if tag.strip()))
    def validate_add_ons(self, rows):
        if not isinstance(rows, list) or len(rows) > 12:
            raise serializers.ValidationError("Use up to 12 options and add-ons per dish.")
        validated = AddOnSerializer(data=rows, many=True)
        validated.is_valid(raise_exception=True)
        if len({row["id"] for row in validated.validated_data}) != len(rows):
            raise serializers.ValidationError("Each add-on needs a unique ID.")
        return [{**row, "price": str(row["price"])} for row in validated.validated_data]
    def validate_preparation_minutes(self, value):
        if not 1 <= value <= 180:
            raise serializers.ValidationError("Preparation time must be 1–180 minutes.")
        return value
class AddressSerializer(serializers.ModelSerializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=Decimal("-90"), max_value=Decimal("90"), required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=Decimal("-180"), max_value=Decimal("180"), required=False, allow_null=True)
    def validate(self, attrs):
        lat = attrs.get("latitude", getattr(self.instance, "latitude", None))
        lng = attrs.get("longitude", getattr(self.instance, "longitude", None))
        if (lat is None) != (lng is None):
            raise serializers.ValidationError("Add both location coordinates or clear both.")
        return attrs
    class Meta: model = Address; fields = "__all__"; read_only_fields = ["user", "created_at", "updated_at"]
class CartItemSerializer(serializers.ModelSerializer):
    menu_item_detail = MenuItemSerializer(source="menu_item", read_only=True)
    add_ons = serializers.SerializerMethodField()
    unit_price = serializers.SerializerMethodField()
    def get_add_ons(self, item): return cart_addons(item)
    def get_unit_price(self, item): return str(cart_unit_price(item))
    class Meta: model = CartItem; fields = ["id", "menu_item", "menu_item_detail", "quantity", "add_ons", "unit_price", "created_at", "updated_at"]; read_only_fields = ["id", "created_at", "updated_at"]
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    class Meta: model = Cart; fields = ["id", "restaurant", "items", "created_at", "updated_at"]
class WishlistSerializer(serializers.ModelSerializer):
    menu_item_detail = MenuItemSerializer(source="menu_item", read_only=True)
    class Meta: model = Wishlist; fields = "__all__"; read_only_fields = ["user", "created_at", "updated_at"]
class CouponSerializer(serializers.ModelSerializer):
    class Meta: model = Coupon; fields = "__all__"; read_only_fields = ["usage_count", "created_at", "updated_at"]
    def validate(self, attrs):
        values = {
            "starts_at": getattr(self.instance, "starts_at", None),
            "ends_at": getattr(self.instance, "ends_at", None),
            "discount_amount": getattr(self.instance, "discount_amount", None),
            "discount_percent": getattr(self.instance, "discount_percent", None),
            **attrs,
        }
        if values["starts_at"] and values["ends_at"] and values["ends_at"] <= values["starts_at"]:
            raise serializers.ValidationError({"ends_at": "End time must be after the start time."})
        amount = values["discount_amount"] or Decimal("0")
        percent = values["discount_percent"] or Decimal("0")
        if amount < 0:
            raise serializers.ValidationError({"discount_amount": "Discount amount cannot be negative."})
        if amount <= 0 and percent <= 0:
            raise serializers.ValidationError("Provide a positive discount amount or percentage.")
        return attrs
class OfferSerializer(serializers.ModelSerializer):
    class Meta: model = Offer; fields = "__all__"; read_only_fields = ["created_at", "updated_at"]
    def validate(self, attrs):
        starts_at = attrs.get("starts_at", getattr(self.instance, "starts_at", None))
        ends_at = attrs.get("ends_at", getattr(self.instance, "ends_at", None))
        if starts_at and ends_at and ends_at <= starts_at:
            raise serializers.ValidationError({"ends_at": "End time must be after the start time."})
        return attrs
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta: model = OrderItem; exclude = ["stock_deducted"]
class PaymentSerializer(serializers.ModelSerializer):
    class Meta: model = Payment; fields = "__all__"; read_only_fields = ["order", "amount", "created_at", "updated_at"]
class DeliverySerializer(serializers.ModelSerializer):
    class Meta: model = DeliveryAssignment; fields = "__all__"; read_only_fields = ["order", "partner", "pickup_at", "delivered_at", "location_updated_at", "created_at", "updated_at"]
    def validate(self, attrs):
        if ("current_latitude" in attrs) != ("current_longitude" in attrs):
            raise serializers.ValidationError("Send latitude and longitude together.")
        if (attrs.get("current_latitude") is None) != (attrs.get("current_longitude") is None):
            raise serializers.ValidationError("Both coordinates must be set or cleared together.")
        return attrs
    def validate_current_latitude(self, value):
        if value is not None and not -90 <= value <= 90:
            raise serializers.ValidationError("Invalid latitude.")
        return value
    def validate_current_longitude(self, value):
        if value is not None and not -180 <= value <= 180:
            raise serializers.ValidationError("Invalid longitude.")
        return value

class OrderEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderEvent
        fields = ["id", "status", "message", "created_at"]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True); payment = PaymentSerializer(read_only=True); delivery = DeliverySerializer(read_only=True); restaurant_detail = RestaurantSerializer(source="restaurant", read_only=True); customer_detail = UserSerializer(source="customer", read_only=True); delivery_address_detail = AddressSerializer(source="delivery_address", read_only=True)
    delivery_code = serializers.SerializerMethodField()
    customer_detail = serializers.SerializerMethodField()
    delivery_address_detail = serializers.SerializerMethodField()
    events = OrderEventSerializer(many=True, read_only=True)
    review = serializers.SerializerMethodField()
    cancellation = serializers.SerializerMethodField()
    refunds = serializers.SerializerMethodField()
    def get_cancellation(self, order):
        return cancellation_details(order)
    def get_refunds(self, order):
        user = getattr(self.context.get("request"), "user", None)
        if not user or (user.pk != order.customer_id and not user.is_superuser and user.role != User.Role.ADMIN):
            return []
        from .refunds import RefundSerializer
        return RefundSerializer(order.refund_requests.all(), many=True).data
    def get_customer_detail(self, order):
        user = getattr(self.context.get("request"), "user", None)
        if user and (user.is_superuser or user.role == User.Role.ADMIN or user.pk == order.customer_id):
            return UserSerializer(order.customer).data
        return {"first_name": order.customer.first_name, "last_name": order.customer.last_name, "phone": order.customer.phone}
    def get_delivery_code(self, order):
        user = getattr(self.context.get("request"), "user", None)
        return order.delivery_code if user and user.id == order.customer_id else None
    def get_delivery_address_detail(self, order):
        return order.address_snapshot or AddressSerializer(order.delivery_address).data
    def get_review(self, order):
        review = getattr(order, "review", None)
        return {"id": review.id, "rating": review.rating, "comment": review.comment} if review else None
    class Meta: model = Order; fields = "__all__"; read_only_fields = ["customer", "restaurant", "number", "status", "subtotal", "delivery_fee", "discount", "total", "coupon", "created_at", "updated_at"]
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "user", "title", "message", "kind", "metadata", "is_read", "created_at", "updated_at"]
        read_only_fields = ["user", "title", "message", "kind", "metadata", "created_at", "updated_at"]
class ReviewSerializer(serializers.ModelSerializer):
    comment = serializers.CharField(max_length=2000, allow_blank=True, required=False)
    class Meta: model = Review; fields = "__all__"; read_only_fields = ["customer", "restaurant", "created_at", "updated_at", "is_visible"]
    def validate_order(self, order):
        request = self.context["request"]
        if self.instance and order.pk != self.instance.order_id:
            raise serializers.ValidationError("A review cannot be moved to another order.")
        if order.customer_id != request.user.id:
            raise serializers.ValidationError("You can only review your own order.")
        if order.status != Order.Status.DELIVERED:
            raise serializers.ValidationError("Only delivered orders can be reviewed.")
        if Review.objects.filter(order=order).exclude(pk=getattr(self.instance, "pk", None)).exists():
            raise serializers.ValidationError("This order has already been reviewed.")
        return order
class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta: model = AnalyticsEvent; fields = "__all__"; read_only_fields = ["user", "created_at", "updated_at"]


class CartItemMutationSerializer(serializers.Serializer):
    menu_item = serializers.PrimaryKeyRelatedField(queryset=MenuItem.objects.all(), required=False)
    quantity = serializers.IntegerField(min_value=1, max_value=99)
    addon_ids = serializers.ListField(child=serializers.RegexField(r"^[a-zA-Z0-9_-]{1,60}$"), max_length=12, default=list)


class CouponCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=40, trim_whitespace=True)


def applicable_coupon(code, subtotal, *, lock=False, user=None, restaurant=None):
    from .coupon_savings import coupon_discount, coupon_status
    queryset = Coupon.objects.filter(code__iexact=(code or "").strip())
    if lock:
        queryset = queryset.select_for_update()
    coupon = queryset.first()
    if not coupon:
        raise serializers.ValidationError({"coupon_code": "We couldn’t find that coupon. Check the code and try again."})
    eligibility = coupon_status(coupon, subtotal, user=user, restaurant=restaurant)
    if not eligibility["eligible"]:
        raise serializers.ValidationError({"coupon_code": eligibility["reason"]})
    return coupon, coupon_discount(coupon, subtotal)

class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all(), source="address")
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    # Online orders remain hidden from kitchen queues until capture is verified.
    payment_method = serializers.ChoiceField(choices=["cod", "razorpay"], default="cod")
    notes = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    checkout_key = serializers.UUIDField(required=False)
    quote_token = serializers.CharField(required=False, max_length=500)
    def validate_payment_method(self, value):
        from .payments import payment_enabled
        if value == "razorpay" and not payment_enabled():
            raise serializers.ValidationError("Online payments are not available. Choose cash on delivery.")
        return value
    def validate_address(self, address):
        if address.user != self.context["request"].user: raise serializers.ValidationError("Choose one of your addresses.")
        return address
    @transaction.atomic
    def create(self, data):
        user = self.context["request"].user
        User.objects.select_for_update().get(pk=user.pk)
        if data.get("checkout_key"):
            existing = Order.objects.filter(checkout_key=data["checkout_key"]).first()
            if existing:
                if existing.customer_id != user.id:
                    raise serializers.ValidationError("Use a new checkout request.")
                return existing
        cart, _ = Cart.objects.select_for_update().get_or_create(user=user)
        items = list(cart.items.select_for_update().order_by("menu_item_id", "id"))
        if not items: raise serializers.ValidationError({"cart": "Cart is empty."})
        locked_menu = {item.pk: item for item in MenuItem.objects.select_for_update().filter(pk__in=[row.menu_item_id for row in items]).order_by("pk")}
        for item in items:
            item.menu_item = locked_menu[item.menu_item_id]
        restaurant = Restaurant.objects.select_related("owner").get(pk=items[0].menu_item.restaurant_id)
        if any(i.menu_item.restaurant_id != restaurant.id for i in items): raise serializers.ValidationError({"cart": "Items must belong to one restaurant."})
        if not accepting_orders(restaurant):
            raise serializers.ValidationError({"cart": "This restaurant is not accepting orders."})
        if any(not item.menu_item.is_available for item in items):
            raise serializers.ValidationError({"cart": "One or more menu items are no longer available."})
        quantities = {}
        for item in items:
            quantities[item.menu_item_id] = quantities.get(item.menu_item_id, 0) + item.quantity
        for pk, quantity in quantities.items():
            menu_item = locked_menu[pk]
            if menu_item.stock_quantity is not None and quantity > menu_item.stock_quantity:
                raise serializers.ValidationError({"cart": f"Only {menu_item.stock_quantity} portions of {menu_item.name} are left. Update your cart."})
        subtotal = sum((cart_unit_price(i, strict=True) * i.quantity for i in items), Decimal("0")); discount = Decimal("0"); coupon = None
        if data.get("coupon_code"):
            coupon, discount = applicable_coupon(data["coupon_code"], subtotal, lock=True, user=user, restaurant=restaurant)
        discount = discount.quantize(Decimal("0.01"))
        quote = delivery_quote(restaurant, data["address"], subtotal)
        if data.get("quote_token"):
            verify_quote(data["quote_token"], quote_fingerprint(user, data["address"], items, quote, coupon.code if coupon else "", subtotal, discount))
        elif DeliveryPolicy.objects.filter(pk=1, enabled=True).exists():
            raise serializers.ValidationError({"quote_token": "Review your delivery quote before placing the order."})
        fee = Decimal(quote["delivery_fee"])
        cancellation_snapshot = quote["cancellation_policy"]
        order = Order.objects.create(customer=user, restaurant=restaurant, delivery_address=data["address"], coupon=coupon, subtotal=subtotal, delivery_fee=fee, discount=discount, total=subtotal + fee - discount, notes=data.get("notes", ""), checkout_key=data.get("checkout_key"), delivery_code=f"{secrets.randbelow(1000000):06d}", address_snapshot=dict(AddressSerializer(data["address"]).data), delivery_quote=quote)
        OrderItem.objects.bulk_create([OrderItem(order=order, menu_item=i.menu_item, name=i.menu_item.name, unit_price=cart_unit_price(i, strict=True), quantity=i.quantity, total_price=cart_unit_price(i, strict=True)*i.quantity, add_ons=cart_addons(i, strict=True), stock_deducted=i.menu_item.stock_quantity is not None) for i in items])
        order.cancellation_policy_snapshot = cancellation_snapshot
        order.save(update_fields=["cancellation_policy_snapshot"])
        for pk, quantity in quantities.items():
            if locked_menu[pk].stock_quantity is not None:
                MenuItem.objects.filter(pk=pk).update(stock_quantity=models.F("stock_quantity")-quantity)
        AuditLog.objects.create(actor=user, action="inventory.order_reserved", target=str(order.id), metadata={"quantities": {str(pk): qty for pk, qty in quantities.items() if locked_menu[pk].stock_quantity is not None}})
        payment = Payment.objects.create(order=order, method=data["payment_method"], amount=order.total)
        if data["payment_method"] == "razorpay":
            from .payments import create_payment_order
            order.status = Order.Status.AWAITING_PAYMENT
            order.payment_expires_at = timezone.now() + timedelta(minutes=15)
            order.save(update_fields=["status", "payment_expires_at"])
            create_payment_order(payment)
        if coupon:
            Coupon.objects.filter(pk=coupon.pk).update(usage_count=models.F("usage_count") + 1)
        cart.items.all().delete()
        cart.restaurant = None
        cart.save(update_fields=["restaurant", "updated_at"])
        notify_order(order)
        OrderEvent.objects.create(order=order, status=order.status, message="Waiting for payment." if order.status == Order.Status.AWAITING_PAYMENT else "Order placed. Waiting for the restaurant to accept.")
        return order
