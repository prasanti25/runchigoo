from django.contrib.auth import password_validation
from django.db import transaction
from django.db import models
from django.utils import timezone
from rest_framework import serializers
from .models import *


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
        ]
        read_only_fields = ["id", "email_verified", "role", "is_active", "created_at"]

    def validate_email(self, value):
        return validate_unique_email(value, self.instance)

    def update(self, instance, validated_data):
        email_changed = (
            "email" in validated_data
            and validated_data["email"].casefold() != instance.email.casefold()
        )
        if "email" in validated_data:
            instance.username = validated_data["email"]
        if email_changed:
            instance.email_verified = False
        return super().update(instance, validated_data)

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
        return User.objects.create_user(**validated_data, password=password)

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
    def create(self, data):
        role = data.get("role", User.Role.CUSTOMER)
        is_active = role == User.Role.CUSTOMER
        return User.objects.create_user(is_active=is_active, **data)

class RestaurantSerializer(serializers.ModelSerializer):
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
            "average_rating", "created_at", "updated_at",
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
class MenuItemSerializer(serializers.ModelSerializer):
    restaurant_detail = RestaurantSerializer(source="restaurant", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    restaurant_id = serializers.PrimaryKeyRelatedField(source="restaurant", queryset=Restaurant.objects.all(), write_only=True, required=False)
    class Meta: model = MenuItem; fields = "__all__"; read_only_fields = ["restaurant", "created_at", "updated_at"]
    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.user.is_authenticated and request.user.role == User.Role.RESTAURANT and "restaurant" in attrs:
            raise serializers.ValidationError({"restaurant_id": "Restaurant accounts cannot change item ownership."})
        return attrs
class AddressSerializer(serializers.ModelSerializer):
    class Meta: model = Address; fields = "__all__"; read_only_fields = ["user", "created_at", "updated_at"]
class CartItemSerializer(serializers.ModelSerializer):
    menu_item_detail = MenuItemSerializer(source="menu_item", read_only=True)
    class Meta: model = CartItem; fields = ["id", "menu_item", "menu_item_detail", "quantity", "created_at", "updated_at"]; read_only_fields = ["id", "created_at", "updated_at"]
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
    class Meta: model = OrderItem; fields = "__all__"
class PaymentSerializer(serializers.ModelSerializer):
    class Meta: model = Payment; fields = "__all__"; read_only_fields = ["order", "amount", "created_at", "updated_at"]
class DeliverySerializer(serializers.ModelSerializer):
    class Meta: model = DeliveryAssignment; fields = "__all__"; read_only_fields = ["order", "partner", "pickup_at", "delivered_at", "created_at", "updated_at"]
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True); payment = PaymentSerializer(read_only=True); delivery = DeliverySerializer(read_only=True); restaurant_detail = RestaurantSerializer(source="restaurant", read_only=True); customer_detail = UserSerializer(source="customer", read_only=True); delivery_address_detail = AddressSerializer(source="delivery_address", read_only=True)
    class Meta: model = Order; fields = "__all__"; read_only_fields = ["customer", "restaurant", "number", "status", "subtotal", "delivery_fee", "discount", "total", "coupon", "created_at", "updated_at"]
class NotificationSerializer(serializers.ModelSerializer):
    class Meta: model = Notification; fields = "__all__"; read_only_fields = ["user", "title", "message", "kind", "metadata", "created_at", "updated_at"]
class ReviewSerializer(serializers.ModelSerializer):
    class Meta: model = Review; fields = "__all__"; read_only_fields = ["customer", "restaurant", "created_at", "updated_at"]
    def validate_order(self, order):
        request = self.context["request"]
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


class CouponCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=40, trim_whitespace=True)


def applicable_coupon(code, subtotal, *, lock=False):
    now = timezone.now()
    queryset = Coupon.objects.filter(
        code__iexact=(code or "").strip(),
        is_active=True,
        starts_at__lte=now,
        ends_at__gt=now,
    )
    if lock:
        queryset = queryset.select_for_update()
    coupon = queryset.first()
    if not coupon or subtotal < coupon.min_order_amount:
        raise serializers.ValidationError({"coupon_code": "Coupon is invalid or not applicable."})
    if coupon.usage_limit is not None and coupon.usage_count >= coupon.usage_limit:
        raise serializers.ValidationError({"coupon_code": "This coupon has reached its usage limit."})

    amount = coupon.discount_amount or Decimal("0")
    percent = coupon.discount_percent or Decimal("0")
    if amount <= 0 and percent <= 0:
        raise serializers.ValidationError({"coupon_code": "Coupon has no valid discount."})
    discount = amount if amount > 0 else subtotal * percent / Decimal("100")
    return coupon, min(discount, subtotal)

class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all(), source="address")
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    # Card/UPI must not create an order until a payment provider confirms payment.
    payment_method = serializers.ChoiceField(choices=["cod"], default="cod")
    notes = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    def validate_address(self, address):
        if address.user != self.context["request"].user: raise serializers.ValidationError("Choose one of your addresses.")
        return address
    @transaction.atomic
    def create(self, data):
        user = self.context["request"].user
        cart, _ = Cart.objects.select_for_update().get_or_create(user=user)
        items = list(cart.items.select_for_update().select_related("menu_item", "menu_item__restaurant"))
        if not items: raise serializers.ValidationError({"cart": "Cart is empty."})
        restaurant = items[0].menu_item.restaurant
        if any(i.menu_item.restaurant_id != restaurant.id for i in items): raise serializers.ValidationError({"cart": "Items must belong to one restaurant."})
        if not restaurant.is_approved or not restaurant.is_open:
            raise serializers.ValidationError({"cart": "This restaurant is not accepting orders."})
        if any(not item.menu_item.is_available for item in items):
            raise serializers.ValidationError({"cart": "One or more menu items are no longer available."})
        subtotal = sum((i.menu_item.price * i.quantity for i in items), Decimal("0")); discount = Decimal("0"); coupon = None
        if data.get("coupon_code"):
            coupon, discount = applicable_coupon(data["coupon_code"], subtotal, lock=True)
        fee = Decimal("40.00") if subtotal < Decimal("500.00") else Decimal("0")
        order = Order.objects.create(customer=user, restaurant=restaurant, delivery_address=data["address"], coupon=coupon, subtotal=subtotal, delivery_fee=fee, discount=discount, total=subtotal + fee - discount, notes=data.get("notes", ""))
        OrderItem.objects.bulk_create([OrderItem(order=order, menu_item=i.menu_item, name=i.menu_item.name, unit_price=i.menu_item.price, quantity=i.quantity, total_price=i.menu_item.price*i.quantity) for i in items])
        Payment.objects.create(order=order, method=data["payment_method"], amount=order.total)
        if coupon:
            Coupon.objects.filter(pk=coupon.pk).update(usage_count=models.F("usage_count") + 1)
        cart.items.all().delete()
        cart.restaurant = None
        cart.save(update_fields=["restaurant", "updated_at"])
        Notification.objects.create(user=user, title="Order placed", message=f"Your order {order.number} was placed.", kind="order")
        return order
