from django.contrib.auth import password_validation
from django.db import transaction
from django.db import models
from django.utils import timezone
from rest_framework import serializers
from .models import *

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
        read_only_fields = ["id", "email_verified", "role", "created_at"]

class AdminUserSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ["password"]
        read_only_fields = ["id", "email_verified", "created_at"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(**validated_data, password=password)

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
    def create(self, data):
        password_validation.validate_password(data["password"])
        role = data.get("role", User.Role.CUSTOMER)
        is_active = role == User.Role.CUSTOMER
        return User.objects.create_user(is_active=is_active, **data)

class RestaurantSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    class Meta: model = Restaurant; fields = "__all__"; read_only_fields = ["owner", "is_approved", "average_rating", "created_at", "updated_at"]
class CategorySerializer(serializers.ModelSerializer):
    class Meta: model = Category; fields = "__all__"; read_only_fields = ["created_at", "updated_at"]
class MenuItemSerializer(serializers.ModelSerializer):
    restaurant_detail = RestaurantSerializer(source="restaurant", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    class Meta: model = MenuItem; fields = "__all__"; read_only_fields = ["restaurant", "created_at", "updated_at"]
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
class OfferSerializer(serializers.ModelSerializer):
    class Meta: model = Offer; fields = "__all__"; read_only_fields = ["created_at", "updated_at"]
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta: model = OrderItem; fields = "__all__"
class PaymentSerializer(serializers.ModelSerializer):
    class Meta: model = Payment; fields = "__all__"; read_only_fields = ["order", "amount", "created_at", "updated_at"]
class DeliverySerializer(serializers.ModelSerializer):
    class Meta: model = DeliveryAssignment; fields = "__all__"; read_only_fields = ["order", "created_at", "updated_at"]
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True); payment = PaymentSerializer(read_only=True); delivery = DeliverySerializer(read_only=True); restaurant_detail = RestaurantSerializer(source="restaurant", read_only=True); customer_detail = UserSerializer(source="customer", read_only=True); delivery_address_detail = AddressSerializer(source="delivery_address", read_only=True)
    class Meta: model = Order; fields = "__all__"; read_only_fields = ["customer", "restaurant", "number", "status", "subtotal", "delivery_fee", "discount", "total", "coupon", "created_at", "updated_at"]
class NotificationSerializer(serializers.ModelSerializer):
    class Meta: model = Notification; fields = "__all__"; read_only_fields = ["user", "created_at", "updated_at"]
class ReviewSerializer(serializers.ModelSerializer):
    class Meta: model = Review; fields = "__all__"; read_only_fields = ["customer", "restaurant", "created_at", "updated_at"]
class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta: model = AnalyticsEvent; fields = "__all__"; read_only_fields = ["user", "created_at", "updated_at"]

class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all(), source="address")
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(choices=["cod", "card", "upi"], default="cod")
    notes = serializers.CharField(required=False, allow_blank=True)
    def validate_address(self, address):
        if address.user != self.context["request"].user: raise serializers.ValidationError("Choose one of your addresses.")
        return address
    @transaction.atomic
    def create(self, data):
        user = self.context["request"].user; cart, _ = Cart.objects.get_or_create(user=user)
        items = list(cart.items.select_related("menu_item", "menu_item__restaurant"))
        if not items: raise serializers.ValidationError({"cart": "Cart is empty."})
        restaurant = items[0].menu_item.restaurant
        if any(i.menu_item.restaurant_id != restaurant.id for i in items): raise serializers.ValidationError({"cart": "Items must belong to one restaurant."})
        subtotal = sum((i.menu_item.price * i.quantity for i in items), Decimal("0")); discount = Decimal("0"); coupon = None
        if data.get("coupon_code"):
            coupon = Coupon.objects.filter(code__iexact=data["coupon_code"], is_active=True, starts_at__lte=timezone.now(), ends_at__gt=timezone.now()).first()
            if not coupon or subtotal < coupon.min_order_amount: raise serializers.ValidationError({"coupon_code": "Coupon is invalid or not applicable."})
            discount = coupon.discount_amount or (subtotal * coupon.discount_percent / 100)
            discount = min(discount, subtotal); Coupon.objects.filter(pk=coupon.pk).update(usage_count=models.F("usage_count") + 1)
        fee = Decimal("40.00") if subtotal < Decimal("500.00") else Decimal("0")
        order = Order.objects.create(customer=user, restaurant=restaurant, delivery_address=data["address"], coupon=coupon, subtotal=subtotal, delivery_fee=fee, discount=discount, total=subtotal + fee - discount, notes=data.get("notes", ""))
        OrderItem.objects.bulk_create([OrderItem(order=order, menu_item=i.menu_item, name=i.menu_item.name, unit_price=i.menu_item.price, quantity=i.quantity, total_price=i.menu_item.price*i.quantity) for i in items])
        Payment.objects.create(order=order, method=data["payment_method"], amount=order.total)
        cart.items.all().delete(); Notification.objects.create(user=user, title="Order placed", message=f"Your order {order.number} was placed.", kind="order")
        return order
