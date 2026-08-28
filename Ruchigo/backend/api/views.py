from datetime import timedelta
import secrets
from django.conf import settings
from django.db.models import Avg, Count, Sum
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import OpenApiParameter, extend_schema
from .models import *
from .permissions import IsAdmin, IsDelivery, IsRestaurant, IsRestaurantOrAdmin
from .serializers import *

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

class AuthViewSet(viewsets.GenericViewSet):
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
            "unread_notifications": NotificationSerializer(unread_notifications, many=True).data,
        })
    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        try:
            RefreshToken(request.data.get("refresh")).blacklist()
        except Exception:
            return Response({"detail": "A valid refresh token is required."}, status=400)
        return Response(status=status.HTTP_204_NO_CONTENT)
    @action(detail=False, methods=["get", "patch"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        if request.method == "PATCH":
            serializer = UserSerializer(request.user, data=request.data, partial=True); serializer.is_valid(raise_exception=True); serializer.save()
        return Response(UserSerializer(request.user).data)
    @action(detail=False, methods=["post"])
    def forgot_password(self, request):
        user = User.objects.filter(email__iexact=request.data.get("email", "")).first()
        if user:
            OTP.objects.filter(user=user, purpose=OTP.Purpose.RESET_PASSWORD, used_at__isnull=True).update(used_at=timezone.now())
            create_otp(user, OTP.Purpose.RESET_PASSWORD)
        return Response({"detail": "If the account exists, a reset code has been sent."})
    @action(detail=False, methods=["post"])
    def reset_password(self, request):
        email, code, password = request.data.get("email"), request.data.get("code"), request.data.get("password")
        if not isinstance(password, str): return Response({"detail": "A valid password is required."}, status=400)
        user = User.objects.filter(email__iexact=email).first()
        otp = valid_otp(user, code, OTP.Purpose.RESET_PASSWORD) if user else None
        if not otp: return Response({"detail": "Invalid or expired code."}, status=400)
        from django.contrib.auth import password_validation
        password_validation.validate_password(password, otp.user)
        user = otp.user; user.set_password(password); user.save(); otp.used_at=timezone.now(); otp.save(update_fields=["used_at"])
        return Response({"detail": "Password reset successfully."})
    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def request_email_verification(self, request):
        create_otp(request.user, OTP.Purpose.VERIFY_EMAIL)
        return Response({"detail": "Verification code sent."})
    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def verify_email(self, request):
        otp = valid_otp(request.user, request.data.get("code"), OTP.Purpose.VERIFY_EMAIL)
        if not otp: return Response({"detail": "Invalid or expired code."}, status=400)
        request.user.email_verified=True; request.user.save(update_fields=["email_verified"]); otp.used_at=timezone.now(); otp.save(update_fields=["used_at"])
        return Response({"detail": "Email verified."})

class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.select_related("owner").all(); serializer_class = RestaurantSerializer; filterset_fields=["city", "is_open", "is_approved"]; search_fields=["name", "description", "city"]; ordering_fields=["created_at", "average_rating", "name"]
    def perform_create(self, serializer): serializer.save(owner=self.request.user)
    def get_permissions(self): return [permissions.AllowAny()] if self.action in ["list", "retrieve"] else [IsRestaurantOrAdmin()]
    def get_queryset(self):
        qs=super().get_queryset()
        if self.action in ["list", "retrieve"]: return qs.filter(is_approved=True)
        return qs if self.request.user.is_superuser or self.request.user.role == User.Role.ADMIN else qs.filter(owner=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset=Category.objects.all(); serializer_class=CategorySerializer; lookup_field="slug"; search_fields=["name"]
    def get_permissions(self): return [permissions.AllowAny()] if self.action in ["list", "retrieve"] else [IsAdmin()]
class MenuItemViewSet(viewsets.ModelViewSet):
    queryset=MenuItem.objects.select_related("restaurant", "category").all(); serializer_class=MenuItemSerializer; filterset_fields=["restaurant", "category", "is_available", "is_vegetarian"]; search_fields=["name", "description"]; ordering_fields=["price", "created_at", "name"]
    def get_permissions(self): return [permissions.AllowAny()] if self.action in ["list", "retrieve"] else [IsRestaurantOrAdmin()]
    def perform_create(self, serializer): serializer.save(restaurant=self.request.user.restaurant)
    def get_queryset(self):
        qs=super().get_queryset()
        return qs if self.action in ["list", "retrieve"] or self.request.user.is_superuser else qs.filter(restaurant__owner=self.request.user)

class OwnedViewSet(viewsets.ModelViewSet):
    permission_classes=[permissions.IsAuthenticated]
    owner_field="user"
    def get_queryset(self): return self.queryset.filter(**{self.owner_field:self.request.user})
    def perform_create(self, serializer): serializer.save(**{self.owner_field:self.request.user})
class AddressViewSet(OwnedViewSet): queryset=Address.objects.all(); serializer_class=AddressSerializer
class WishlistViewSet(OwnedViewSet): queryset=Wishlist.objects.select_related("menu_item"); serializer_class=WishlistSerializer
class NotificationViewSet(OwnedViewSet): queryset=Notification.objects.all(); serializer_class=NotificationSerializer
class ReviewViewSet(OwnedViewSet): queryset=Review.objects.select_related("restaurant"); serializer_class=ReviewSerializer; owner_field="customer"

class CartViewSet(viewsets.ViewSet):
    permission_classes=[permissions.IsAuthenticated]
    serializer_class=CartSerializer
    def list(self, request):
        cart,_=Cart.objects.get_or_create(user=request.user); return Response(CartSerializer(cart).data)
    @action(detail=False, methods=["post"])
    def items(self, request):
        cart,_=Cart.objects.get_or_create(user=request.user); menu=MenuItem.objects.filter(pk=request.data.get("menu_item"), is_available=True).first()
        if not menu: return Response({"detail":"Menu item unavailable."}, status=400)
        if cart.restaurant and cart.restaurant_id != menu.restaurant_id: return Response({"detail":"Cart can contain one restaurant only."}, status=400)
        cart.restaurant=menu.restaurant; cart.save(); item,created=CartItem.objects.get_or_create(cart=cart, menu_item=menu, defaults={"quantity":request.data.get("quantity",1)})
        if not created: item.quantity=min(item.quantity+int(request.data.get("quantity",1)),99); item.save()
        return Response(CartSerializer(cart).data, status=201)
    @extend_schema(parameters=[OpenApiParameter("item_id", int, OpenApiParameter.PATH)])
    @action(detail=False, methods=["patch", "delete"], url_path="items/(?P<item_id>[0-9]+)")
    def item(self, request, item_id=None):
        cart,_=Cart.objects.get_or_create(user=request.user); item=CartItem.objects.filter(cart=cart, pk=item_id).first()
        if not item: return Response({"detail":"Not found."}, status=404)
        if request.method=="DELETE": item.delete()
        else: item.quantity=max(1,min(int(request.data.get("quantity",1)),99)); item.save()
        if not cart.items.exists(): cart.restaurant=None; cart.save(update_fields=["restaurant"])
        return Response(CartSerializer(cart).data)
    @action(detail=False, methods=["post"])
    def checkout(self, request):
        s=CheckoutSerializer(data=request.data, context={"request":request}); s.is_valid(raise_exception=True); return Response(OrderSerializer(s.save()).data, status=201)

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Order.objects.none(); serializer_class=OrderSerializer; filterset_fields=["status", "restaurant"]
    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False): return Order.objects.none()
        user=self.request.user; qs=Order.objects.select_related("restaurant", "customer").prefetch_related("items")
        if user.is_superuser or user.role==User.Role.ADMIN: return qs
        if user.role==User.Role.RESTAURANT: return qs.filter(restaurant__owner=user)
        if user.role==User.Role.DELIVERY:
            if self.action == "accept":
                return qs.filter(status=Order.Status.READY, delivery__isnull=True)
            return qs.filter(delivery__partner=user)
        return qs.filter(customer=user)

    @action(detail=False, methods=["get"], permission_classes=[IsDelivery])
    def available(self, request):
        qs = Order.objects.filter(status=Order.Status.READY, delivery__isnull=True).select_related("restaurant", "customer").prefetch_related("items")
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(OrderSerializer(page, many=True).data)
        return Response(OrderSerializer(qs, many=True).data)

    @action(detail=True, methods=["post"], permission_classes=[IsDelivery])
    def accept(self, request, pk=None):
        order = self.get_object()
        if order.status != Order.Status.READY:
            return Response({"detail": "Order is not ready for pickup."}, status=400)
        try:
            if order.delivery is not None:
                return Response({"detail": "Order is already assigned."}, status=400)
        except Order.delivery.RelatedObjectDoesNotExist:
            pass
        DeliveryAssignment.objects.create(order=order, partner=request.user, pickup_at=timezone.now())
        order.status = Order.Status.OUT
        order.save(update_fields=["status", "updated_at"])
        Notification.objects.create(user=order.customer, title="Order update", message=f"Order {order.number} is out for delivery.", kind="order")
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"])
    def status(self, request, pk=None):
        order = self.get_object(); new = request.data.get("status")
        allowed = {User.Role.RESTAURANT: {"confirmed", "preparing", "ready", "cancelled"}, User.Role.DELIVERY: {"out_for_delivery", "delivered"}, User.Role.ADMIN: {x for x,_ in Order.Status.choices}}
        if request.user.role not in allowed or new not in allowed[request.user.role]:
            return Response({"detail": "Status transition not allowed."}, status=403)
        if request.user.role == User.Role.DELIVERY:
            try:
                if order.delivery.partner != request.user:
                    return Response({"detail": "You are not assigned to this delivery."}, status=403)
            except Order.delivery.RelatedObjectDoesNotExist:
                return Response({"detail": "You are not assigned to this delivery."}, status=403)
        order.status = new; order.save(update_fields=["status", "updated_at"])
        Notification.objects.create(user=order.customer, title="Order update", message=f"Order {order.number} is {order.get_status_display()}.", kind="order")
        return Response(OrderSerializer(order).data)

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Payment.objects.none(); serializer_class=PaymentSerializer; permission_classes=[permissions.IsAuthenticated]
    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False): return Payment.objects.none()
        user=self.request.user; qs=Payment.objects.select_related("order", "order__restaurant")
        if user.is_superuser or user.role==User.Role.ADMIN: return qs
        if user.role==User.Role.RESTAURANT: return qs.filter(order__restaurant__owner=user)
        return qs.filter(order__customer=user)

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset=User.objects.all().order_by("-created_at")
    serializer_class=AdminUserSerializer
    permission_classes=[IsAdmin]

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        user = self.get_object()
        if user.role == User.Role.CUSTOMER:
            return Response({"detail": "Only restaurant and delivery accounts require approval."}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_active:
            return Response({"detail": "User is already active."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = True
        user.save(update_fields=["is_active"])
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
    def block(self, request, pk=None):
        user = self.get_object()
        if user.is_superuser:
            return Response({"detail": "Cannot block a superuser."}, status=status.HTTP_400_BAD_REQUEST)
        if not user.is_active:
            return Response({"detail": "User is already inactive."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = False
        user.save(update_fields=["is_active"])
        Notification.objects.create(
            user=user,
            title="Account Blocked",
            message="Your account has been blocked by the administrator.",
            kind="account",
        )
        return Response({"detail": "User blocked successfully."})

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def unblock(self, request, pk=None):
        user = self.get_object()
        if user.is_active:
            return Response({"detail": "User is already active."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = True
        user.save(update_fields=["is_active"])
        Notification.objects.create(
            user=user,
            title="Account Restored",
            message="Your account has been restored by the administrator.",
            kind="account",
        )
        return Response({"detail": "User restored successfully."})

class CouponViewSet(viewsets.ModelViewSet):
    queryset=Coupon.objects.all(); serializer_class=CouponSerializer; permission_classes=[IsAdmin]; lookup_field="code"
class OfferViewSet(viewsets.ModelViewSet):
    queryset=Offer.objects.all(); serializer_class=OfferSerializer; permission_classes=[IsRestaurant]
    def get_queryset(self): return super().get_queryset() if self.request.user.is_superuser else super().get_queryset().filter(restaurant__owner=self.request.user)
    def perform_create(self, serializer): serializer.save(restaurant=self.request.user.restaurant)
class DeliveryViewSet(viewsets.ModelViewSet):
    queryset=DeliveryAssignment.objects.select_related("order"); serializer_class=DeliverySerializer; permission_classes=[IsDelivery]
    def get_queryset(self): return super().get_queryset().filter(partner=self.request.user)
class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes=[IsAdmin]; serializer_class=AnalyticsEventSerializer
    def list(self, request):
        return Response({"users":User.objects.values("role").annotate(count=Count("id")), "orders":Order.objects.values("status").annotate(count=Count("id"), revenue=Sum("total")), "restaurants":Restaurant.objects.filter(is_approved=True).count()})
