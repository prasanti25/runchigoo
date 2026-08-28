from django.contrib import admin
from .models import *

for model in [User, Restaurant, Category, MenuItem, Address, Cart, CartItem, Wishlist, Coupon, Offer, Order, OrderItem, Payment, DeliveryAssignment, Notification, Review, OTP, AnalyticsEvent, AuditLog]:
    admin.site.register(model)
