from rest_framework.permissions import BasePermission
from .models import User
class IsRole(BasePermission):
    roles = []
    def has_permission(self, request, view): return bool(request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.role in self.roles))
class IsRestaurant(IsRole): roles=[User.Role.RESTAURANT]
class IsDelivery(IsRole): roles=[User.Role.DELIVERY]
class IsAdmin(IsRole): roles=[User.Role.ADMIN]
class IsRestaurantOrAdmin(IsRole): roles=[User.Role.RESTAURANT, User.Role.ADMIN]
class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj): return request.user.is_superuser or getattr(obj, "user", getattr(obj, "customer", None)) == request.user
