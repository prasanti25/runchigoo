from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

router = DefaultRouter()
router.register("auth", AuthViewSet, basename="auth")
router.register("restaurants", RestaurantViewSet)
router.register("categories", CategoryViewSet)
router.register("menu-items", MenuItemViewSet)
router.register("addresses", AddressViewSet, basename="address")
router.register("cart", CartViewSet, basename="cart")
router.register("wishlist", WishlistViewSet, basename="wishlist")
router.register("orders", OrderViewSet, basename="order")
router.register("payments", PaymentViewSet, basename="payment")
router.register("users", UserManagementViewSet, basename="user-management")
router.register("coupons", CouponViewSet)
router.register("offers", OfferViewSet)
router.register("deliveries", DeliveryViewSet, basename="delivery")
router.register("notifications", NotificationViewSet, basename="notification")
router.register("reviews", ReviewViewSet, basename="review")
router.register("analytics", AnalyticsViewSet, basename="analytics")
urlpatterns = [path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"), path("", include(router.urls))]
