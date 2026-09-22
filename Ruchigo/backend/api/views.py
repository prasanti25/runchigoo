from datetime import timedelta
from decimal import Decimal
import secrets
from uuid import uuid4
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from django.db.models import Avg, Count, Exists, F, Max, OuterRef, Q, Sum
from django.db.models.deletion import ProtectedError
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import OpenApiParameter, extend_schema
from .models import *
from .permissions import IsAdmin, IsCustomer, IsDelivery, IsRestaurant, IsRestaurantOrAdmin
from .serializers import *
from .notifications import notify, admin_ids, notify_order, notify_payment
from .menu_options import selected_addons, configuration_key, cart_unit_price
from .availability import accepting_orders, check_cart_stock, restore_order_stock
from .serviceability import delivery_quote, quote_fingerprint, sign_quote
from .payment_expiry import expire_unpaid_orders
from .cancellations import CancellationInput, cancel_customer_order
from .order_operations import require_active_fulfillment
from .admin_access import AdminScopeMixin, effective_scopes
from .dashboard_filters import OrderDashboardFilter, PaymentDashboardFilter

def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}

def create_otp(user, purpose):
    code = f"{secrets.randbelow(1000000):06d}"
    OTP.objects.create(user=user, purpose=purpose, code=make_password(code), expires_at=timezone.now()+timedelta(minutes=10))
    send_mail("Your RuchiGo verification code", f"Your verification code is {code}. It expires in 10 minutes.", None, [user.email], fail_silently=False)
    return code

def valid_otp(user, code, purpose):
    otp = OTP.objects.filter(user=user, purpose=purpose, used_at__isnull=True).order_by("-created_at").first()
    return otp if otp and otp.is_valid() and check_password(code or "", otp.code) else None

class AuthViewSet(AdminScopeMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        payload = {"user": UserSerializer(user).data}
        if user.is_active:
            payload["tokens"] = tokens_for(user)
            return Response(payload, status=status.HTTP_201_CREATED)
        return Response(
            {
                **payload,
                "detail": "Registration successful. Your account is pending admin approval.",
            },
            status=status.HTTP_202_ACCEPTED,
        )
    @action(detail=False, methods=["post"])
    def login(self, request):
        from django.contrib.auth import authenticate
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "")
        user = authenticate(request, username=email, password=password)
        if not user:
            pending_user = User.objects.filter(email__iexact=email).first()
            if pending_user and pending_user.check_password(password):
                if not pending_user.is_active:
                    return Response({"detail": "Account pending admin approval."}, status=status.HTTP_403_FORBIDDEN)
                user = authenticate(request, username=pending_user.username, password=password)
        if not user:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({"detail": "Account pending admin approval."}, status=status.HTTP_403_FORBIDDEN)
        requested_role = request.data.get("role")
        if requested_role and user.role != requested_role:
            return Response({"detail": "Account role does not match."}, status=status.HTTP_403_FORBIDDEN)
        unread_notifications = Notification.objects.filter(user=user, is_read=False)
        return Response({
            "user": UserSerializer(user).data,
            "tokens": tokens_for(user),
            "unread_notifications_count": unread_notifications.count(),
            "unread_notifications": NotificationSerializer(unread_notifications.order_by("-id")[:5], many=True).data,
        })
    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        try:
            RefreshToken(request.data.get("refresh")).blacklist()
        except Exception:
            return Response({"detail": "A valid refresh token is required."}, status=400)
        return Response(status=status.HTTP_204_NO_CONTENT)
    @action(detail=False, methods=["get", "patch"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def me(self, request):
        if request.method == "PATCH":
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            changed = any(getattr(request.user, key) != value for key, value in serializer.validated_data.items() if key != "is_available")
            serializer.save()
            if changed:
                notify([request.user.pk], event=f"profile:{uuid4()}", title="Profile updated", message="Your account details were updated. If this wasn’t you, contact support.", kind="account")
        return Response(UserSerializer(request.user).data)
    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def change_password(self, request):
        current_password = request.data.get("current_password", "")
        new_password = request.data.get("new_password", "")
        if not request.user.check_password(current_password):
            return Response({"current_password": ["Current password is incorrect."]}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(new_password, str):
            return Response({"new_password": ["Enter a valid password."]}, status=status.HTTP_400_BAD_REQUEST)
        from django.contrib.auth import password_validation
        try:
            password_validation.validate_password(new_password, request.user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"new_password": exc.messages}) from exc
        request.user.set_password(new_password)
        request.user.save(update_fields=["password"])
        notify([request.user.pk], event=f"password:{uuid4()}", title="Password changed", message="Your password was changed. If this wasn’t you, reset your password and contact support.", kind="account")
        return Response({"detail": "Password changed successfully."})
    @action(detail=False, methods=["post"])
    def forgot_password(self, request):
        user = User.objects.filter(email__iexact=request.data.get("email", "")).first()
        if user:
            OTP.objects.filter(user=user, purpose=OTP.Purpose.RESET_PASSWORD, used_at__isnull=True).update(used_at=timezone.now())
            create_otp(user, OTP.Purpose.RESET_PASSWORD)
        return Response({"detail": "If the account exists, a reset code has been sent."})
    @action(detail=False, methods=["post"])
    @transaction.atomic
    def reset_password(self, request):
        email, code, password = request.data.get("email"), request.data.get("code"), request.data.get("password")
        if not isinstance(password, str): return Response({"detail": "A valid password is required."}, status=400)
        user = User.objects.filter(email__iexact=email).first()
        otp = valid_otp(user, code, OTP.Purpose.RESET_PASSWORD) if user else None
        if not otp: return Response({"detail": "Invalid or expired code."}, status=400)
        from django.contrib.auth import password_validation
        try:
            password_validation.validate_password(password, otp.user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": exc.messages}) from exc
        user = otp.user; user.set_password(password); user.save(); otp.used_at=timezone.now(); otp.save(update_fields=["used_at"])
        notify([user.pk], event=f"password-reset:{otp.pk}", title="Password reset", message="Your password was reset successfully. Contact support if you didn’t make this change.", kind="account")
        return Response({"detail": "Password reset successfully."})
    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def request_email_verification(self, request):
        create_otp(request.user, OTP.Purpose.VERIFY_EMAIL)
        return Response({"detail": "Verification code sent."})
    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def verify_email(self, request):
        otp = valid_otp(request.user, request.data.get("code"), OTP.Purpose.VERIFY_EMAIL)
        if not otp: return Response({"detail": "Invalid or expired code."}, status=400)
        request.user.email_verified=True; request.user.save(update_fields=["email_verified"]); otp.used_at=timezone.now(); otp.save(update_fields=["used_at"])
        notify([request.user.pk], event=f"email-verified:{otp.pk}", title="Email verified", message="Your account email is now verified.", kind="account")
        return Response({"detail": "Email verified."})

class RestaurantViewSet(AdminScopeMixin, viewsets.ModelViewSet):
    queryset = Restaurant.objects.select_related("owner").order_by("-created_at"); serializer_class = RestaurantSerializer; filterset_fields=["city", "is_open", "is_approved"]; search_fields=["name", "description", "city"]; ordering_fields=["created_at", "average_rating", "name"]
    @transaction.atomic
    def perform_create(self, serializer):
        if self.request.user.is_superuser or self.request.user.role == User.Role.ADMIN:
            if "owner" not in serializer.validated_data:
                raise serializers.ValidationError({"owner_id": "Choose a restaurant owner."})
            restaurant = serializer.save()
        else:
            restaurant = serializer.save(owner=self.request.user)
        notify(admin_ids("partners"), event=f"restaurant:{restaurant.pk}:submitted", title="Restaurant listing to review", message=f"{restaurant.name} has submitted a restaurant profile.", kind="account", metadata={"restaurant_approval": True})
    def get_permissions(self):
        if self.action in ["approve", "lookup"]:
            return [IsAdmin()]
        return [permissions.AllowAny()] if self.action in ["list", "retrieve"] else [IsRestaurantOrAdmin()]
    def get_queryset(self):
        qs=super().get_queryset()
        if self.action in ["list", "retrieve"]:
            user = self.request.user
            if user.is_authenticated and (user.is_superuser or user.role == User.Role.ADMIN):
                return qs
            if user.is_authenticated and user.role == User.Role.RESTAURANT:
                return qs.filter(owner=user)
            return qs.filter(is_approved=True, owner__is_active=True)
        return qs if self.request.user.is_superuser or self.request.user.role == User.Role.ADMIN else qs.filter(owner=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    @transaction.atomic
    def approve(self, request, pk=None):
        restaurant = self.get_object()
        restaurant.is_approved = True
        restaurant.save(update_fields=["is_approved", "updated_at"])
        AuditLog.objects.create(actor=request.user, action="restaurant.approved", target=str(restaurant.id))
        notify([restaurant.owner_id], event=f"restaurant:{restaurant.pk}:approved", title="Restaurant approved", message=f"{restaurant.name} is approved. Check your menu and availability before taking orders.", kind="account")
        return Response(self.get_serializer(restaurant).data)

    @action(detail=False, methods=["get"], permission_classes=[IsAdmin])
    def lookup(self, request):
        rows = self.paginate_queryset(self.filter_queryset(Restaurant.objects.all().order_by("name", "id")))
        return self.get_paginated_response([{"id": row.pk, "name": row.name, "city": row.city} for row in rows])

class CategoryViewSet(AdminScopeMixin, viewsets.ModelViewSet):
    queryset=Category.objects.order_by("name"); serializer_class=CategorySerializer; lookup_field="slug"; search_fields=["name"]
    def get_permissions(self): return [permissions.AllowAny()] if self.action in ["list", "retrieve"] else [IsAdmin()]
    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if self.request.query_params.get("restaurant"):
            restaurant_id = serializers.IntegerField(min_value=1).run_validation(self.request.query_params["restaurant"])
            match = Q(menu_items__restaurant_id=restaurant_id, menu_items__restaurant__is_approved=True, menu_items__restaurant__owner__is_active=True, menu_items__is_available=True)
            qs = qs.annotate(item_count=Count("menu_items", filter=match)).filter(item_count__gt=0, is_active=True)
        return qs if user.is_authenticated and (user.is_superuser or user.role == User.Role.ADMIN) else qs.filter(is_active=True)
class MenuItemViewSet(AdminScopeMixin, viewsets.ModelViewSet):
    queryset=MenuItem.objects.select_related("restaurant", "restaurant__owner", "category").all(); serializer_class=MenuItemSerializer; filterset_fields=["restaurant", "category", "is_available", "is_vegetarian"]; search_fields=["name", "description"]; ordering_fields=["price", "created_at", "name"]
    def get_permissions(self): return [permissions.AllowAny()] if self.action in ["list", "retrieve"] else [IsRestaurantOrAdmin()]
    @transaction.atomic
    def perform_update(self, serializer):
        locked = MenuItem.objects.select_for_update().get(pk=serializer.instance.pk)
        before = locked.stock_quantity
        serializer = self.get_serializer(locked, data=serializer.initial_data, partial=serializer.partial)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        if "stock_quantity" in serializer.validated_data:
            AuditLog.objects.create(actor=self.request.user, action="inventory.stock_set", target=str(item.pk), metadata={"before": before, "after": item.stock_quantity})
    def perform_create(self, serializer):
        if self.request.user.is_superuser or self.request.user.role == User.Role.ADMIN:
            if "restaurant" not in serializer.validated_data:
                raise serializers.ValidationError({"restaurant_id": "Choose a restaurant."})
            serializer.save()
        else:
            try:
                restaurant = self.request.user.restaurant
            except Restaurant.DoesNotExist as exc:
                raise serializers.ValidationError({"restaurant": "Create your restaurant profile first."}) from exc
            serializer.save(restaurant=restaurant)
    def get_queryset(self):
        qs=super().get_queryset()
        user = self.request.user
        if user.is_authenticated and (user.is_superuser or user.role == User.Role.ADMIN):
            return qs
        if user.is_authenticated and user.role == User.Role.RESTAURANT:
            return qs.filter(restaurant__owner=user)
        return qs.filter(is_available=True, restaurant__is_approved=True, restaurant__owner__is_active=True)

class OwnedViewSet(AdminScopeMixin, viewsets.ModelViewSet):
    permission_classes=[permissions.IsAuthenticated]
    owner_field="user"
    def get_queryset(self): return self.queryset.filter(**{self.owner_field:self.request.user})
    def perform_create(self, serializer): serializer.save(**{self.owner_field:self.request.user})
class AddressViewSet(OwnedViewSet):
    queryset=Address.objects.order_by("-is_default", "-created_at"); serializer_class=AddressSerializer; permission_classes=[IsCustomer]
    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user
        make_default = serializer.validated_data.get("is_default", False) or not Address.objects.filter(user=user, is_default=True).exists()
        if make_default:
            Address.objects.filter(user=user, is_default=True).update(is_default=False)
        serializer.save(user=user, is_default=make_default)
    @transaction.atomic
    def perform_update(self, serializer):
        if serializer.validated_data.get("is_default"):
            Address.objects.filter(user=self.request.user, is_default=True).exclude(pk=serializer.instance.pk).update(is_default=False)
        requested_default = serializer.validated_data.get("is_default")
        if serializer.instance.is_default and requested_default is False:
            replacement = Address.objects.filter(user=self.request.user).exclude(pk=serializer.instance.pk).order_by("-created_at").first()
            if replacement:
                replacement.is_default = True
                replacement.save(update_fields=["is_default", "updated_at"])
            else:
                serializer.validated_data["is_default"] = True
        serializer.save()
    @transaction.atomic
    def perform_destroy(self, instance):
        was_default = instance.is_default
        user = instance.user
        try:
            instance.delete()
        except ProtectedError:
            raise serializers.ValidationError("This address is linked to an order. You can edit it or add a new address; past order addresses stay unchanged.")
        if was_default:
            replacement = Address.objects.filter(user=user).order_by("-created_at").first()
            if replacement:
                replacement.is_default = True
                replacement.save(update_fields=["is_default", "updated_at"])

class WishlistViewSet(OwnedViewSet):
    filterset_fields = ["menu_item"]
    queryset=Wishlist.objects.select_related("menu_item", "menu_item__restaurant").order_by("-created_at"); serializer_class=WishlistSerializer; permission_classes=[IsCustomer]
    def perform_create(self, serializer):
        menu_item = serializer.validated_data["menu_item"]
        if not menu_item.is_available or not menu_item.restaurant.is_approved or not menu_item.restaurant.is_open:
            raise serializers.ValidationError({"menu_item": "This menu item is not available."})
        if Wishlist.objects.filter(user=self.request.user, menu_item=menu_item).exists():
            raise serializers.ValidationError({"menu_item": "This item is already in your wishlist."})
        serializer.save(user=self.request.user)

class NotificationViewSet(OwnedViewSet):
    filterset_fields = ["is_read", "kind"]
    queryset=Notification.objects.order_by("-created_at"); serializer_class=NotificationSerializer
    http_method_names=["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role == User.Role.ADMIN:
            scopes = effective_scopes(self.request.user)
            if "*" not in scopes:
                for scope, kinds in [("support", ["support"]), ("finance", ["refund", "payment"]), ("orders", ["order", "delivery"])]:
                    if scope not in scopes:
                        qs = qs.exclude(kind__in=kinds)
                if "partners" not in scopes:
                    qs = qs.exclude(Q(metadata__has_key="approval_role") | Q(metadata__has_key="restaurant_approval"))
        return qs

    @action(detail=False, methods=["get"])
    def summary(self, request):
        queryset = self.get_queryset()
        summary = queryset.aggregate(unread_count=Count("pk", filter=Q(is_read=False)), latest_id=Max("id"))
        summary["latest_id"] = summary["latest_id"] or 0
        summary["latest"] = NotificationSerializer(queryset.filter(is_read=False).order_by("-id")[:5], many=True).data
        return Response(summary)

    @action(detail=False, methods=["patch"], url_path="mark-all-read")
    def mark_all_read(self, request):
        # Always account-scoped, including for administrators. Ignore list filters:
        # this explicitly marks the whole current account's inbox, not one page.
        changed = self.get_queryset().filter(is_read=False).update(is_read=True, updated_at=timezone.now())
        return Response({"updated": changed, "unread_count": self.get_queryset().filter(is_read=False).count()})
class ReviewViewSet(OwnedViewSet):
    queryset=Review.objects.select_related("restaurant", "order").order_by("-created_at"); serializer_class=ReviewSerializer; owner_field="customer"; permission_classes=[IsCustomer]
    @transaction.atomic
    def perform_create(self, serializer):
        order = Order.objects.select_for_update().get(pk=serializer.validated_data["order"].pk)
        if Review.objects.filter(order=order).exists():
            raise serializers.ValidationError({"order": "This order has already been reviewed. You can edit your review."})
        Restaurant.objects.select_for_update().get(pk=order.restaurant_id)
        review = serializer.save(customer=self.request.user, restaurant=serializer.validated_data["order"].restaurant)
        self.update_rating(review.restaurant)
        notify([review.restaurant.owner_id], event=f"review:{review.pk}:created", title="New customer review", message=f"A customer left a {review.rating}-star review for {review.restaurant.name}.", kind="review", metadata={"restaurant_id": review.restaurant_id})
    @transaction.atomic
    def perform_update(self, serializer):
        Restaurant.objects.select_for_update().get(pk=serializer.instance.restaurant_id)
        review = serializer.save(restaurant=serializer.validated_data.get("order", serializer.instance.order).restaurant)
        self.update_rating(review.restaurant)
    @transaction.atomic
    def perform_destroy(self, instance):
        Restaurant.objects.select_for_update().get(pk=instance.restaurant_id)
        restaurant = instance.restaurant
        instance.delete()
        self.update_rating(restaurant)
    def update_rating(self, restaurant):
        Restaurant.objects.filter(pk=restaurant.pk).update(average_rating=Review.objects.filter(restaurant=restaurant, is_visible=True).aggregate(value=Avg("rating"))["value"] or 0)

class CartViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes=[IsCustomer]
    serializer_class=CartSerializer
    def list(self, request):
        cart,_=Cart.objects.get_or_create(user=request.user); return Response(CartSerializer(cart).data)
    @action(detail=False, methods=["post"])
    @transaction.atomic
    def items(self, request):
        payload = CartItemMutationSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        menu = payload.validated_data.get("menu_item")
        if not menu or not menu.is_available or not accepting_orders(menu.restaurant):
            return Response({"detail":"Menu item unavailable."}, status=400)
        quantity = payload.validated_data["quantity"]
        addons = selected_addons(menu, payload.validated_data["addon_ids"])
        cart,_=Cart.objects.select_for_update().get_or_create(user=request.user)
        if cart.restaurant and cart.restaurant_id != menu.restaurant_id: return Response({"detail":"Cart can contain one restaurant only."}, status=400)
        check_cart_stock(cart, menu, quantity)
        cart.restaurant=menu.restaurant; cart.save(); item,created=CartItem.objects.get_or_create(cart=cart, menu_item=menu, configuration_key=configuration_key(addons), defaults={"quantity":quantity, "add_ons": addons})
        if not created: item.quantity=min(item.quantity+quantity,99); item.save(update_fields=["quantity", "updated_at"])
        return Response(CartSerializer(cart).data, status=201)
    @extend_schema(parameters=[OpenApiParameter("item_id", int, OpenApiParameter.PATH)])
    @action(detail=False, methods=["patch", "delete"], url_path="items/(?P<item_id>[0-9]+)")
    @transaction.atomic
    def item(self, request, item_id=None):
        cart,_=Cart.objects.select_for_update().get_or_create(user=request.user); item=CartItem.objects.select_for_update().filter(cart=cart, pk=item_id).first()
        if not item: return Response({"detail":"Not found."}, status=404)
        if request.method=="DELETE": item.delete()
        else:
            payload = CartItemMutationSerializer(data=request.data)
            payload.fields.pop("menu_item")
            payload.is_valid(raise_exception=True)
            check_cart_stock(cart, item.menu_item, payload.validated_data["quantity"], excluding=item.pk)
            item.quantity=payload.validated_data["quantity"]
            item.save(update_fields=["quantity", "updated_at"])
        if not cart.items.exists(): cart.restaurant=None; cart.save(update_fields=["restaurant"])
        return Response(CartSerializer(cart).data)
    @action(detail=False, methods=["post"], url_path="validate-coupon")
    def validate_coupon(self, request):
        payload = CouponCodeSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = list(cart.items.select_related("menu_item"))
        if not items:
            raise serializers.ValidationError({"cart": "Cart is empty."})
        subtotal = sum((cart_unit_price(item, strict=True) * item.quantity for item in items), Decimal("0"))
        coupon, discount = applicable_coupon(payload.validated_data["code"], subtotal, user=request.user, restaurant=cart.restaurant)
        fee = Decimal("40.00") if subtotal < Decimal("500.00") else Decimal("0")
        return Response({"code": coupon.code, "subtotal": subtotal, "delivery_fee": fee, "discount": discount, "total": subtotal + fee - discount, "delivery_estimate_only": True})
    @action(detail=False, methods=["post"])
    def quote(self, request):
        payload = CheckoutSerializer(data=request.data, context={"request": request})
        payload.is_valid(raise_exception=True)
        address = payload.validated_data["address"]
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = list(cart.items.select_related("menu_item").order_by("menu_item_id", "id"))
        if not items:
            raise serializers.ValidationError({"cart": "Cart is empty."})
        restaurant = items[0].menu_item.restaurant
        if not accepting_orders(restaurant) or any(not item.menu_item.is_available or item.menu_item.restaurant_id != restaurant.pk for item in items):
            raise serializers.ValidationError({"cart": "This meal is not available right now. Please update your bag."})
        quantities = {}
        for item in items:
            quantities[item.menu_item_id] = quantities.get(item.menu_item_id, 0) + item.quantity
            if item.menu_item.stock_quantity is not None and quantities[item.menu_item_id] > item.menu_item.stock_quantity:
                raise serializers.ValidationError({"cart": f"Not enough portions of {item.menu_item.name} are available. Update your bag."})
        subtotal = sum((cart_unit_price(item, strict=True) * item.quantity for item in items), Decimal("0"))
        coupon, discount = None, Decimal("0")
        if payload.validated_data.get("coupon_code"):
            coupon, discount = applicable_coupon(payload.validated_data["coupon_code"], subtotal, user=request.user, restaurant=restaurant)
        discount = discount.quantize(Decimal("0.01"))
        quote = delivery_quote(restaurant, address, subtotal)
        fingerprint = quote_fingerprint(request.user, address, items, quote, coupon.code if coupon else "", subtotal, discount)
        return Response({**quote, "serviceable": True, "subtotal": subtotal, "discount": discount,
                         "total": subtotal + Decimal(quote["delivery_fee"]) - discount, "quote_token": sign_quote(fingerprint), "valid_for_seconds": 600})
    @action(detail=False, methods=["post"])
    def checkout(self, request):
        cart = Cart.objects.filter(user=request.user).first()
        if cart and cart.restaurant_id:
            expire_unpaid_orders(restaurant_id=cart.restaurant_id)
        s=CheckoutSerializer(data=request.data, context={"request":request}); s.is_valid(raise_exception=True); return Response(OrderSerializer(s.save(), context={"request": request}).data, status=201)

class OrderViewSet(AdminScopeMixin, viewsets.ReadOnlyModelViewSet):
    queryset=Order.objects.none(); serializer_class=OrderSerializer; permission_classes=[permissions.IsAuthenticated]
    filterset_class = OrderDashboardFilter
    search_fields = ["number", "restaurant__name"]
    ordering_fields = ["created_at", "total"]
    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False): return Order.objects.none()
        if self.request.user.role == User.Role.CUSTOMER and self.action in ["list", "retrieve"]:
            expire_unpaid_orders(customer_id=self.request.user.pk)
        user=self.request.user; qs=Order.objects.select_related("restaurant", "customer", "delivery_address", "payment", "delivery", "review").prefetch_related("items", "events", "refund_requests").order_by("-created_at")
        if user.is_superuser or user.role==User.Role.ADMIN: return qs
        if user.role==User.Role.RESTAURANT: return qs.filter(restaurant__owner=user).exclude(status=Order.Status.AWAITING_PAYMENT)
        if user.role==User.Role.DELIVERY:
            if self.action == "accept":
                return qs.filter(status=Order.Status.READY, delivery__isnull=True)
            qs = qs.filter(delivery__partner=user)
            return qs.filter(status__in=[Order.Status.ASSIGNED, Order.Status.OUT]) if self.request.query_params.get("active") == "true" else qs
        return qs.filter(customer=user)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        orders = self.filter_queryset(self.get_queryset())
        return Response({
            "total": orders.count(),
            "by_status": list(orders.order_by().values("status").annotate(count=Count("id"), value=Sum("total"))),
        })

    @action(detail=False, methods=["get"], permission_classes=[IsDelivery])
    def available(self, request):
        qs = Order.objects.filter(status=Order.Status.READY, delivery__isnull=True, fulfillment_paused_at__isnull=True).select_related("restaurant", "customer").prefetch_related("items").order_by("created_at")
        page = self.paginate_queryset(qs)
        # Unassigned couriers need the pickup and destination area, not a
        # customer's identity, exact address, payment identifiers or delivery code.
        def preview(order):
            return {
                "id": order.id, "number": order.number, "total": order.total,
                "restaurant_detail": RestaurantSerializer(order.restaurant, context={"request": request}).data,
                "delivery_address_detail": {"city": order.address_snapshot.get("city", ""), "line1": "Full address shared after assignment"},
                "items": [{"name": item.name, "quantity": item.quantity} for item in order.items.all()],
            }
        if page is not None:
            return self.get_paginated_response([preview(order) for order in page])
        return Response([preview(order) for order in qs])

    @action(detail=True, methods=["post"], permission_classes=[IsDelivery])
    @transaction.atomic
    def accept(self, request, pk=None):
        if not request.user.is_available:
            return Response({"detail": "Go online before accepting a delivery."}, status=400)
        # Lock only the order row. PostgreSQL rejects SELECT FOR UPDATE when a
        # nullable reverse one-to-one relation creates an outer join.
        order = Order.objects.select_for_update().filter(pk=pk, status=Order.Status.READY).first()
        if not order or DeliveryAssignment.objects.filter(order=order).exists():
            return Response({"detail": "Order is no longer available for pickup."}, status=409)
        require_active_fulfillment(order)
        try:
            DeliveryAssignment.objects.create(order=order, partner=request.user)
        except IntegrityError:
            return Response({"detail": "Order is already assigned."}, status=409)
        order.status = Order.Status.ASSIGNED
        order.save(update_fields=["status", "updated_at"])
        OrderEvent.objects.create(order=order, status=order.status, message="A delivery partner accepted your order.")
        AuditLog.objects.create(actor=request.user, action="delivery.assigned", target=str(order.id))
        notify_order(order)
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"], permission_classes=[IsDelivery])
    @transaction.atomic
    def pickup(self, request, pk=None):
        visible = self.get_object()
        order = Order.objects.select_for_update().get(pk=visible.pk)
        require_active_fulfillment(order)
        assignment = DeliveryAssignment.objects.select_for_update().filter(order=order, partner=request.user).first()
        if not assignment:
            raise serializers.ValidationError("This delivery is not assigned to you.")
        if order.status == Order.Status.OUT and assignment.pickup_at:
            return Response(self.get_serializer(order).data)
        if order.status != Order.Status.ASSIGNED:
            raise serializers.ValidationError("Only an assigned delivery can be picked up.")
        assignment.pickup_at = timezone.now()
        assignment.save(update_fields=["pickup_at", "updated_at"])
        order.status = Order.Status.OUT
        order.save(update_fields=["status", "updated_at"])
        OrderEvent.objects.create(order=order, status=order.status, message="Your food was picked up and is on the way.")
        AuditLog.objects.create(actor=request.user, action="delivery.picked_up", target=str(order.id))
        notify_order(order)
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=["post"], permission_classes=[IsCustomer])
    def cancel(self, request, pk=None):
        visible = self.get_object()
        payload = CancellationInput(data=request.data)
        payload.is_valid(raise_exception=True)
        order, refund_id = cancel_customer_order(visible.pk, request.user, payload.validated_data)
        if refund_id:
            from .refunds import submit_approved_refund
            try:
                submit_approved_refund(refund_id)
            except serializers.ValidationError:
                # Cancellation is committed. The approved financial obligation
                # remains visible/recoverable if the provider is unavailable.
                pass
        order.refresh_from_db()
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=["post"], permission_classes=[IsCustomer])
    @transaction.atomic
    def reorder(self, request, pk=None):
        order = self.get_object()
        cart, _ = Cart.objects.select_for_update().get_or_create(user=request.user)
        if cart.items.exists():
            raise serializers.ValidationError("Please clear your current cart before reordering.")
        items = list(order.items.select_related("menu_item", "menu_item__restaurant"))
        if not items or any(not i.menu_item.is_available or not accepting_orders(i.menu_item.restaurant) for i in items):
            raise serializers.ValidationError("Some items are unavailable. Open the restaurant to choose a fresh meal.")
        for item in items:
            check_cart_stock(cart, item.menu_item, min(item.quantity, 99))
            addons = selected_addons(item.menu_item, [row["id"] for row in item.add_ons])
            CartItem.objects.create(cart=cart, menu_item=item.menu_item, quantity=min(item.quantity, 99), add_ons=addons, configuration_key=configuration_key(addons))
        cart.restaurant = order.restaurant
        cart.save()
        return Response(CartSerializer(cart).data)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def status(self, request, pk=None):
        visible_order = self.get_object()
        order = Order.objects.select_for_update().get(pk=visible_order.pk)
        if "expected_status" in request.data and request.data["expected_status"] != order.status:
            return Response({"detail": "This order's status changed. Refresh before making another update."}, status=409)
        new = request.data.get("status")
        if new == order.status:
            return Response(self.get_serializer(order).data)
        require_active_fulfillment(order)
        if order.status in [Order.Status.CANCELLED, Order.Status.DELIVERED]:
            raise serializers.ValidationError("Completed or cancelled orders cannot be reopened.")
        if order.status == Order.Status.AWAITING_PAYMENT:
            raise serializers.ValidationError("This order is waiting for verified payment.")
        lifecycle = [Order.Status.AWAITING_PAYMENT, Order.Status.PENDING, Order.Status.CONFIRMED,
                     Order.Status.PREPARING, Order.Status.READY, Order.Status.ASSIGNED,
                     Order.Status.OUT, Order.Status.DELIVERED]
        if new in lifecycle and lifecycle.index(new) < lifecycle.index(order.status):
            # Even staff cannot rewind cooking and reopen a self-cancellation
            # window or return consumed inventory through a second transition.
            raise serializers.ValidationError("Order progress cannot move backwards. Use order support to record an exception.")
        transitions = {
            User.Role.RESTAURANT: {
                Order.Status.PENDING: {Order.Status.CONFIRMED, Order.Status.CANCELLED},
                Order.Status.CONFIRMED: {Order.Status.PREPARING, Order.Status.CANCELLED},
                Order.Status.PREPARING: {Order.Status.READY, Order.Status.CANCELLED},
            },
            User.Role.DELIVERY: {Order.Status.OUT: {Order.Status.DELIVERED}},
        }
        if request.user.is_superuser or request.user.role == User.Role.ADMIN:
            allowed = {choice for choice, _ in Order.Status.choices}
        else:
            allowed = transitions.get(request.user.role, {}).get(order.status, set())
        if new not in allowed:
            return Response({"detail": "Status transition not allowed."}, status=403)
        if new == Order.Status.CANCELLED and Payment.objects.filter(order=order, method="razorpay", status=Payment.Status.PAID).exists():
            raise serializers.ValidationError("Prepaid cancellation requires a confirmed refund. Contact platform support.")
        if request.user.role == User.Role.DELIVERY:
            try:
                if order.delivery.partner != request.user:
                    return Response({"detail": "You are not assigned to this delivery."}, status=403)
            except Order.delivery.RelatedObjectDoesNotExist:
                return Response({"detail": "You are not assigned to this delivery."}, status=403)
            if new == Order.Status.DELIVERED and order.delivery_code:
                attempt_key = f"delivery-code:{order.id}:{request.user.id}"
                attempts = cache.get(attempt_key, 0)
                if attempts >= 5:
                    raise serializers.ValidationError("Too many incorrect codes. Contact support or try again in 10 minutes.")
                if not secrets.compare_digest(str(request.data.get("delivery_code", "")), order.delivery_code):
                    cache.set(attempt_key, attempts + 1, 600)
                    raise serializers.ValidationError("Ask the customer for the correct six-digit delivery code.")
                cache.delete(attempt_key)
        previous_status = order.status
        order.status = new; order.save(update_fields=["status", "updated_at"])
        OrderEvent.objects.create(order=order, status=new, message=f"Order {order.get_status_display().lower()}.")
        AuditLog.objects.create(actor=request.user, action=f"order.{new}", target=str(order.id))
        if new == Order.Status.CANCELLED:
            if order.coupon_id:
                Coupon.objects.filter(pk=order.coupon_id, usage_count__gt=0).update(usage_count=F("usage_count")-1)
            if previous_status in [Order.Status.PENDING, Order.Status.CONFIRMED]:
                restore_order_stock(order)
            else:
                # Food already in preparation is consumed inventory, not a
                # fresh portion available to sell again after cancellation.
                order.items.filter(stock_deducted=True).update(stock_deducted=False)
            Payment.objects.filter(order=order, status=Payment.Status.PENDING).update(status=Payment.Status.FAILED)
        if new == Order.Status.DELIVERED:
            DeliveryAssignment.objects.filter(order=order).update(delivered_at=timezone.now())
            if hasattr(order, "payment") and order.payment.method == "cod":
                order.payment.status = Payment.Status.PAID
                order.payment.save(update_fields=["status", "updated_at"])
                notify_payment(order)
        notify_order(order)
        return Response(OrderSerializer(order).data)

class PaymentViewSet(AdminScopeMixin, viewsets.ReadOnlyModelViewSet):
    queryset=Payment.objects.none(); serializer_class=PaymentSerializer; permission_classes=[permissions.IsAuthenticated]
    filterset_class = PaymentDashboardFilter
    ordering_fields = ["created_at", "amount"]
    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False): return Payment.objects.none()
        user=self.request.user; qs=Payment.objects.select_related("order", "order__restaurant").order_by("-created_at")
        if user.is_superuser or user.role==User.Role.ADMIN: return qs
        if user.role==User.Role.RESTAURANT: return qs.filter(order__restaurant__owner=user)
        return qs.filter(order__customer=user)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        payments = self.filter_queryset(self.get_queryset())
        return Response({"total": payments.count(), "by_status": list(payments.order_by().values("status").annotate(count=Count("id"), amount=Sum("amount")).order_by("status")), "needs_review": payments.filter(reconciliation_required=True).count()})

class UserManagementViewSet(AdminScopeMixin, viewsets.ModelViewSet):
    queryset=User.objects.all().order_by("-created_at", "-id")
    serializer_class=AdminUserSerializer
    permission_classes=[IsAdmin]
    filterset_fields=["role", "is_active"]
    search_fields=["email", "first_name", "last_name", "phone"]

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    def get_queryset(self):
        qs = super().get_queryset()
        scopes = effective_scopes(self.request.user)
        if ("*" not in scopes and "people" not in scopes) or self.request.query_params.get("partner_only") == "true":
            qs = qs.filter(role__in=[User.Role.RESTAURANT, User.Role.DELIVERY])
        return qs.select_for_update() if self.request.method not in permissions.SAFE_METHODS else qs

    @action(detail=False, methods=["get"])
    def summary(self, request):
        users = self.filter_queryset(self.get_queryset())
        return Response({"total": users.count(), "active": users.filter(is_active=True).count(),
                         "inactive": users.filter(is_active=False).count(),
                         "by_role": list(users.order_by().values("role").annotate(count=Count("id")).order_by("role")),
                         "can_manage_admins": request.user.is_superuser})

    def check_target(self, user):
        if (user.is_superuser or user.role == User.Role.ADMIN) and not self.request.user.is_superuser:
            raise serializers.ValidationError({"detail": "Only a superuser can change an administrator account."})

    def check_active_work(self, user):
        active = Order.objects.exclude(status__in=[Order.Status.CANCELLED, Order.Status.DELIVERED])
        if active.filter(Q(customer=user) | Q(restaurant__owner=user) | Q(delivery__partner=user)).exists():
            raise serializers.ValidationError({"detail": "Resolve this account's active orders before changing its role or blocking access."})

    def audit_change(self, user, action_name, metadata=None):
        reason = serializers.CharField(max_length=500, required=False, allow_blank=True).run_validation(self.request.data.get("reason", ""))
        AuditLog.objects.create(actor=self.request.user, action=action_name, target=str(user.pk),
                                metadata={**(metadata or {}), "reason": reason})

    @transaction.atomic
    def perform_create(self, serializer):
        if serializer.validated_data.get("role") == User.Role.ADMIN and not self.request.user.is_superuser:
            raise serializers.ValidationError({"role": "Only a superuser can create an administrator."})
        user = serializer.save()
        self.audit_change(user, "account.created", {"role": user.role})

    @transaction.atomic
    def perform_update(self, serializer):
        serializer.instance = User.objects.select_for_update().get(pk=serializer.instance.pk)
        self.check_target(serializer.instance)
        if serializer.validated_data.get("role") == User.Role.ADMIN and not self.request.user.is_superuser:
            raise serializers.ValidationError({"role": "Only a superuser can grant administrator access."})
        if serializer.instance == self.request.user and serializer.validated_data.get("is_active") is False:
            raise serializers.ValidationError({"is_active": "You cannot deactivate your own account."})
        changed_role = serializer.validated_data.get("role", serializer.instance.role) != serializer.instance.role
        if changed_role:
            if serializer.instance == self.request.user or serializer.instance.is_superuser:
                raise serializers.ValidationError({"role": "This administrator's role cannot be changed here."})
            if Restaurant.objects.filter(owner=serializer.instance).exists() or DeliveryAssignment.objects.filter(partner=serializer.instance).exists() or Order.objects.filter(customer=serializer.instance).exists():
                raise serializers.ValidationError({"role": "This account has marketplace history. Keep its role and create a separate account for another role."})
        if changed_role or (serializer.instance.is_active and serializer.validated_data.get("is_active") is False):
            self.check_active_work(serializer.instance)
        fields = sorted(serializer.validated_data)
        previous_role, previous_active = serializer.instance.role, serializer.instance.is_active
        user = serializer.save()
        if changed_role and user.role == User.Role.ADMIN:
            AdminAccessGrant.objects.update_or_create(user=user, defaults={"full_access": False, "scopes": []})
        self.audit_change(user, "account.updated", {"fields": fields, "previous_role": previous_role, "role": user.role, "previous_active": previous_active, "active": user.is_active})

    @transaction.atomic
    def perform_destroy(self, instance):
        instance = User.objects.select_for_update().get(pk=instance.pk)
        self.check_target(instance)
        if instance.is_superuser or instance == self.request.user:
            raise serializers.ValidationError({"detail": "This administrator account cannot be deleted here."})
        if Order.objects.filter(customer=instance).exists():
            raise serializers.ValidationError({"detail": "Customers with order history cannot be deleted. Block the account instead."})
        if Restaurant.objects.filter(owner=instance, orders__isnull=False).exists():
            raise serializers.ValidationError({"detail": "Restaurant owners with order history cannot be deleted. Block the account instead."})
        if DeliveryAssignment.objects.filter(partner=instance, order__status__in=[Order.Status.ASSIGNED, Order.Status.OUT]).exists():
            raise serializers.ValidationError({"detail": "A delivery partner with an active delivery cannot be deleted."})
        if DeliveryMessage.objects.filter(Q(author=instance) | Q(partner=instance)).exists():
            raise serializers.ValidationError({"detail": "This account has delivery conversation history. Block access instead of deleting it."})
        self.audit_change(instance, "account.deleted", {"role": instance.role})
        instance.delete()

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    @transaction.atomic
    def approve(self, request, pk=None):
        user = self.get_object()
        if user.role not in [User.Role.RESTAURANT, User.Role.DELIVERY]:
            return Response({"detail": "Only restaurant and delivery accounts require approval."}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_active:
            return Response({"detail": "User is already active."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = True
        user.save(update_fields=["is_active"])
        self.audit_change(user, "account.approved", {"role": user.role})
        Notification.objects.create(
            user=user,
            title="Account Approved",
            message=(
                "Your restaurant account has been approved and is now active." if user.role == User.Role.RESTAURANT else
                "Your delivery partner account has been approved and is now active."
            ),
            kind="account",
        )
        first_name = user.first_name or "there"
        approval_subject = f"{first_name}, your RuchiGo account is approved"
        frontend_login_url = settings.FRONTEND_URL.split(",")[0].strip().rstrip("/") + "/login"
        support_url = settings.FRONTEND_URL.split(",")[0].strip().rstrip("/") + "/support"
        approval_message = (
            f"Congratulations {first_name}! Your restaurant account has been approved and is now active. You can log in at {frontend_login_url} and start managing orders. If you need assistance, visit {support_url}."
            if user.role == User.Role.RESTAURANT
            else f"Congratulations {first_name}! Your delivery partner account has been approved and is now active. You can log in at {frontend_login_url} and start accepting deliveries. If you need assistance, visit {support_url}."
        )
        approval_html_message = (
            f"<p>Congratulations!</p><p>Your {'restaurant' if user.role == User.Role.RESTAURANT else 'delivery partner'} account has been approved and is now active.</p><p><a href=\"{frontend_login_url}\" style=\"color:#f97316; font-weight:bold;\">Click here to log in</a></p><p>If you need help, <a href=\"{support_url}\" style=\"color:#f97316;\">visit our support page</a>.</p><p>Thank you for choosing RuchiGo.</p>"
        )
        if user.email:
            send_mail(
                approval_subject,
                approval_message,
                None,
                [user.email],
                html_message=approval_html_message,
                fail_silently=True,
            )
        if user.role == User.Role.RESTAURANT:
            restaurant = Restaurant.objects.filter(owner=user).first()
            if restaurant and not restaurant.is_approved:
                restaurant.is_approved = True
                restaurant.save(update_fields=["is_approved"])
        return Response({"detail": "User approved successfully."})

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    @transaction.atomic
    def block(self, request, pk=None):
        user = self.get_object()
        self.check_target(user)
        if user == request.user:
            return Response({"detail": "You cannot block your own account."}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_superuser:
            return Response({"detail": "Cannot block a superuser."}, status=status.HTTP_400_BAD_REQUEST)
        if not user.is_active:
            return Response({"detail": "User is already inactive."}, status=status.HTTP_400_BAD_REQUEST)
        self.check_active_work(user)
        user.is_active = False
        user.save(update_fields=["is_active"])
        self.audit_change(user, "account.blocked")
        Notification.objects.create(
            user=user,
            title="Account Blocked",
            message="Your account has been blocked by the administrator.",
            kind="account",
        )
        return Response({"detail": "User blocked successfully."})

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    @transaction.atomic
    def unblock(self, request, pk=None):
        user = self.get_object()
        self.check_target(user)
        if user.is_active:
            return Response({"detail": "User is already active."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = True
        user.save(update_fields=["is_active"])
        self.audit_change(user, "account.restored")
        Notification.objects.create(
            user=user,
            title="Account Restored",
            message="Your account has been restored by the administrator.",
            kind="account",
        )
        return Response({"detail": "User restored successfully."})

class CouponViewSet(AdminScopeMixin, viewsets.ModelViewSet):
    queryset=Coupon.objects.order_by("-created_at"); serializer_class=CouponSerializer; permission_classes=[IsAdmin]; lookup_field="code"

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def available(self, request):
        now = timezone.now()
        coupons = self.get_queryset().select_related("restaurant").filter(
            is_active=True, starts_at__lte=now, ends_at__gt=now,
        ).filter(Q(usage_limit__isnull=True) | Q(usage_count__lt=F("usage_limit"))).filter(
            Q(restaurant__isnull=True) | Q(restaurant__is_approved=True, restaurant__is_open=True, restaurant__owner__is_active=True)
        )
        if request.user.is_authenticated:
            history = Order.objects.filter(customer=request.user).exclude(status=Order.Status.CANCELLED)
            if history.exists():
                coupons = coupons.filter(first_order_only=False)
            used = history.filter(coupon_id=OuterRef("pk")).values("coupon_id").annotate(uses=Count("id")).filter(uses__gte=OuterRef("per_user_limit"))
            coupons = coupons.annotate(at_limit=Exists(used)).filter(at_limit=False)
        page = self.paginate_queryset(coupons)
        data = [{
            "id": coupon.id, "code": coupon.code, "description": coupon.description,
            "restaurant": coupon.restaurant_id, "restaurant_name": coupon.restaurant.name if coupon.restaurant else None,
            "discount_percent": coupon.discount_percent, "discount_amount": coupon.discount_amount,
            "min_order_amount": coupon.min_order_amount, "max_discount": coupon.max_discount,
            "first_order_only": coupon.first_order_only, "per_user_limit": coupon.per_user_limit,
            "ends_at": coupon.ends_at,
        } for coupon in (page if page is not None else coupons)]
        return self.get_paginated_response(data) if page is not None else Response(data)
class OfferViewSet(AdminScopeMixin, viewsets.ModelViewSet):
    queryset=Offer.objects.order_by("-created_at"); serializer_class=OfferSerializer
    def get_permissions(self):
        return [permissions.AllowAny()] if self.action in ["list", "retrieve"] else [IsRestaurantOrAdmin()]
    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated and (user.is_superuser or user.role == User.Role.ADMIN):
            return qs
        if user.is_authenticated and user.role == User.Role.RESTAURANT:
            return qs.filter(restaurant__owner=user)
        now = timezone.now()
        return qs.filter(is_active=True, starts_at__lte=now, ends_at__gt=now).filter(
            Q(restaurant__isnull=True) | Q(restaurant__is_approved=True, restaurant__is_open=True)
        )
    def perform_create(self, serializer):
        if self.request.user.is_superuser or self.request.user.role == User.Role.ADMIN:
            if "restaurant" not in serializer.validated_data:
                raise serializers.ValidationError({"restaurant": "Choose a restaurant."})
            serializer.save()
        else:
            serializer.save(restaurant=self.request.user.restaurant)
    def perform_update(self, serializer):
        if self.request.user.is_superuser or self.request.user.role == User.Role.ADMIN:
            serializer.save()
        else:
            serializer.save(restaurant=self.request.user.restaurant)
class DeliveryViewSet(AdminScopeMixin, viewsets.ModelViewSet):
    queryset=DeliveryAssignment.objects.select_related("order").order_by("-created_at"); serializer_class=DeliverySerializer; permission_classes=[IsDelivery]
    http_method_names=["get", "patch", "head", "options"]
    def get_queryset(self): return super().get_queryset().filter(partner=self.request.user)
    @transaction.atomic
    def perform_update(self, serializer):
        order = Order.objects.select_for_update().get(pk=serializer.instance.order_id)
        if order.status not in [Order.Status.ASSIGNED, Order.Status.OUT]:
            raise serializers.ValidationError("Location updates are only allowed during an active delivery.")
        if "current_latitude" in serializer.validated_data:
            serializer.save(location_updated_at=timezone.now() if serializer.validated_data["current_latitude"] is not None else None)
        else:
            serializer.save()
class AnalyticsViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes=[IsAdmin]; serializer_class=AnalyticsEventSerializer
    def list(self, request):
        return Response({
            "users": User.objects.values("role").annotate(count=Count("id")).order_by("role"),
            "active_users": User.objects.filter(is_active=True).count(),
            "orders": Order.objects.values("status").annotate(count=Count("id"), revenue=Sum("total")).order_by("status"),
            "restaurants": {
                "total": Restaurant.objects.count(),
                "approved": Restaurant.objects.filter(is_approved=True).count(),
                "open": Restaurant.objects.filter(is_approved=True, is_open=True).count(),
            },
            "payments": Payment.objects.values("status").annotate(count=Count("id"), amount=Sum("amount")).order_by("status"),
            "refunds": RefundRequest.objects.filter(status=RefundRequest.Status.PROCESSED).aggregate(count=Count("id"), amount=Sum("approved_amount")),
            "recent_orders": OrderSerializer(
                Order.objects.select_related("restaurant", "customer").prefetch_related("items")[:5],
                many=True,
                context={"request": request},
            ).data,
        })
