from decimal import Decimal
import math
from django.conf import settings
from django.db import transaction
from django.db.models import Avg, Count, Exists, F, FloatField, Min, OuterRef, Q, Value
from django.db.models.functions import ACos, Cos, Greatest, Least, Radians, Sin
from django.utils import timezone
from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle

from .models import AuditLog, Category, MenuItem, Offer, Order, OrderItem, Restaurant, Review, SupportTicket, TicketMessage, User
from .serializers import MenuItemSerializer, RestaurantSerializer
from .recommendations import craving_terms, match_reasons, normalize_preferences, rank_items
from .notifications import notify, admin_ids


class RecommendationThrottle(SimpleRateThrottle):
    rate = "12/min"
    def get_cache_key(self, request, view):
        identity = f"user:{request.user.pk}" if request.user.is_authenticated else self.get_ident(request)
        return self.cache_format % {"scope": "recommendations", "ident": identity}


class DiscoveryQuery(serializers.Serializer):
    city = serializers.CharField(required=False, allow_blank=True, max_length=100)
    q = serializers.CharField(required=False, allow_blank=True, max_length=200)
    category = serializers.CharField(required=False, allow_blank=True, max_length=100)
    vegetarian = serializers.BooleanField(required=False)
    budget = serializers.DecimalField(required=False, max_digits=8, decimal_places=2, min_value=Decimal("1"))
    min_rating = serializers.DecimalField(required=False, max_digits=2, decimal_places=1, min_value=Decimal("0"), max_value=Decimal("5"))
    max_prep = serializers.IntegerField(required=False, min_value=1, max_value=180)
    offers = serializers.BooleanField(required=False)
    bestseller = serializers.BooleanField(required=False)
    latitude = serializers.FloatField(required=False, min_value=-90, max_value=90)
    longitude = serializers.FloatField(required=False, min_value=-180, max_value=180)
    radius_km = serializers.FloatField(required=False, min_value=1, max_value=50)
    sort = serializers.ChoiceField(required=False, choices=["recommended", "rating", "price", "fastest", "distance"])
    page = serializers.IntegerField(default=1, min_value=1, max_value=1000)

    def validate(self, attrs):
        for key in ("latitude", "longitude", "radius_km"):
            if key in attrs and not math.isfinite(attrs[key]):
                raise serializers.ValidationError({key: "Enter a finite number."})
        if ("latitude" in attrs) != ("longitude" in attrs) or ((attrs.get("radius_km") or attrs.get("sort") == "distance") and "latitude" not in attrs):
            raise serializers.ValidationError("Choose a location to find nearby restaurants.")
        return attrs


def distance_expression(filters, prefix=""):
    latitude = math.radians(filters["latitude"])
    longitude = math.radians(filters["longitude"])
    cosine = Sin(Value(latitude)) * Sin(Radians(F(f"{prefix}latitude"))) + Cos(Value(latitude)) * Cos(Radians(F(f"{prefix}latitude"))) * Cos(Radians(F(f"{prefix}longitude")) - Value(longitude))
    return Value(6371.0) * ACos(Least(Value(1.0), Greatest(Value(-1.0), cosine, output_field=FloatField()), output_field=FloatField()))


def eligible_items(filters):
    items = MenuItem.objects.select_related("restaurant", "category").filter(is_available=True, restaurant__is_open=True, restaurant__is_approved=True, restaurant__owner__is_active=True)
    if filters.get("city"):
        items = items.filter(restaurant__city__iexact=filters["city"])
    if filters.get("vegetarian"):
        items = items.filter(is_vegetarian=True)
    if filters.get("budget"):
        items = items.filter(price__lte=filters["budget"])
    if filters.get("category"):
        items = items.filter(Q(category__name__iexact=filters["category"]) | Q(category__slug__iexact=filters["category"]))
    if filters.get("min_rating"):
        items = items.filter(restaurant__average_rating__gte=filters["min_rating"])
    if filters.get("max_prep"):
        items = items.filter(preparation_minutes__lte=filters["max_prep"])
    if filters.get("bestseller"):
        items = items.filter(is_bestseller=True)
    if filters.get("offers"):
        now = timezone.now()
        items = items.filter(Exists(Offer.objects.filter(restaurant_id=OuterRef("restaurant_id"), is_active=True, starts_at__lte=now, ends_at__gt=now)))
    if "latitude" in filters:
        items = items.filter(restaurant__latitude__isnull=False, restaurant__longitude__isnull=False).annotate(distance_km=distance_expression(filters, "restaurant__"))
        if filters.get("radius_km"):
            items = items.filter(distance_km__lte=filters["radius_km"])
    return items


class DiscoveryViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        query = DiscoveryQuery(data=request.query_params)
        query.is_valid(raise_exception=True)
        filters = query.validated_data
        items = eligible_items(filters)
        if filters.get("q"):
            term = filters["q"]
            items = items.filter(Q(name__icontains=term) | Q(description__icontains=term) | Q(restaurant__name__icontains=term) | Q(category__name__icontains=term))
        # Card prices/preparation times must come from the matched dishes, not
        # cheaper/unavailable items elsewhere on the restaurant's menu.
        match = Q(menu_items__id__in=items.values("pk"))
        restaurants = Restaurant.objects.filter(pk__in=items.values("restaurant_id")).annotate(menu_count=Count("menu_items", filter=match), from_price=Min("menu_items__price", filter=match), prep_minutes=Min("menu_items__preparation_minutes", filter=match))
        if "latitude" in filters:
            restaurants = restaurants.annotate(distance_km=distance_expression(filters))
        ordering = {"rating": "-restaurant__average_rating", "price": "price", "fastest": "preparation_minutes", "distance": "distance_km"}.get(filters.get("sort"), "-is_bestseller")
        items = items.order_by(ordering, "id")
        restaurants = restaurants.order_by({"price": "from_price", "fastest": "prep_minutes", "distance": "distance_km"}.get(filters.get("sort"), "-average_rating"), "id")
        offset = (filters["page"] - 1) * 12
        restaurant_data = []
        for restaurant in restaurants[offset:offset + 12]:
            row = RestaurantSerializer(restaurant, context={"request": request}).data
            row.update(menu_count=restaurant.menu_count, from_price=restaurant.from_price, prep_minutes=restaurant.prep_minutes)
            if "latitude" in filters:
                row["distance_km"] = round(restaurant.distance_km, 1)
            restaurant_data.append(row)
        return Response({"restaurants": restaurant_data, "items": MenuItemSerializer(items[offset:offset + 12], many=True, context={"request": request}).data, "restaurant_count": restaurants.count(), "item_count": items.count(), "page": filters["page"], "cities": list(Restaurant.objects.filter(is_approved=True, is_open=True, owner__is_active=True).order_by("city").values_list("city", flat=True).distinct()), "categories": list(Category.objects.filter(is_active=True).values("id", "name", "slug"))})

    @action(detail=False, methods=["post"], throttle_classes=[RecommendationThrottle])
    def recommendations(self, request):
        query = DiscoveryQuery(data=request.data)
        query.is_valid(raise_exception=True)
        filters = normalize_preferences(query.validated_data)
        eligible = eligible_items(filters)
        included, excluded = craving_terms(filters.get("q", ""))
        def food_match(terms):
            matches = Q()
            for term in terms:
                matches |= Q(name__icontains=term) | Q(description__icontains=term) | Q(category__name__icontains=term)
            return matches
        if included:
            eligible = eligible.filter(food_match(included))
        if excluded:
            eligible = eligible.exclude(food_match(excluded))
        items = list(eligible.order_by("-is_bestseller", "id")[:40])
        history = set()
        if request.user.is_authenticated and request.user.role == User.Role.CUSTOMER:
            history = set(OrderItem.objects.filter(order__customer=request.user, order__status=Order.Status.DELIVERED).order_by("-order__created_at").values_list("menu_item_id", flat=True)[:100])
        preferences = {k: str(v) for k, v in filters.items() if k not in ["page", "latitude", "longitude"]}
        ranked, source, status = rank_items(items, preferences, history)
        by_id = {i.id: i for i in items}
        result = []
        for row in ranked:
            item = by_id[row["id"]]
            reasons = match_reasons(item, filters, history)
            result.append({**MenuItemSerializer(item, context={"request": request}).data, "reason": " · ".join(reasons), "match_reasons": reasons})
        return Response({"source": source, "status": status, "model": settings.GEMINI_MODEL if source == "gemini" else None, "preferences": preferences, "candidate_count": len(items), "items": result})

    @action(detail=False, methods=["get"], url_path="recommendation-status")
    def recommendation_status(self, request):
        configured = bool(settings.GEMINI_API_KEY)
        return Response({"configured": configured, "model": settings.GEMINI_MODEL if configured else None})


class TicketMessageSerializer(serializers.ModelSerializer):
    from_support = serializers.SerializerMethodField()
    def get_from_support(self, obj):
        return bool(obj.author and obj.author.role == User.Role.ADMIN)
    class Meta:
        model = TicketMessage
        fields = ["id", "body", "from_support", "created_at"]


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    message = serializers.CharField(write_only=True, max_length=3000, required=False, trim_whitespace=True)
    class Meta:
        model = SupportTicket
        fields = ["id", "order", "category", "subject", "status", "message", "messages", "created_at", "updated_at"]
        read_only_fields = ["status", "created_at", "updated_at"]
    def validate_order(self, order):
        if order and order.customer_id != self.context["request"].user.id:
            raise serializers.ValidationError("Choose one of your own orders.")
        return order
    def validate(self, attrs):
        if not self.instance and not attrs.get("message"):
            raise serializers.ValidationError({"message": "Tell us what happened."})
        return attrs
    @transaction.atomic
    def create(self, data):
        message = data.pop("message")
        ticket = SupportTicket.objects.create(user=self.context["request"].user, **data)
        TicketMessage.objects.create(ticket=ticket, author=ticket.user, body=message)
        metadata = {"ticket_id": ticket.pk}
        notify([ticket.user_id], event=f"support:{ticket.pk}:created", title="Support request received", message=f"Your ticket #{ticket.pk} is open. Follow the conversation in Help & support.", kind="support", metadata=metadata)
        notify(admin_ids(), event=f"support:{ticket.pk}:created", title="New support request", message=f"Ticket #{ticket.pk} needs a response.", kind="support", metadata=metadata)
        return ticket


class SupportViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]
    def get_queryset(self):
        qs = SupportTicket.objects.prefetch_related("messages__author")
        return qs if self.request.user.role == User.Role.ADMIN else qs.filter(user=self.request.user)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def reply(self, request, pk=None):
        ticket = SupportTicket.objects.select_for_update().get(pk=self.get_object().pk)
        field = serializers.CharField(max_length=3000, trim_whitespace=True)
        body = field.run_validation(request.data.get("message"))
        reply = TicketMessage.objects.create(ticket=ticket, author=request.user, body=body)
        ticket._prefetched_objects_cache = {}
        if ticket.status == SupportTicket.Status.RESOLVED:
            ticket.status = SupportTicket.Status.OPEN
        ticket.save()
        is_staff = request.user.role == User.Role.ADMIN
        recipients = [ticket.user_id] if is_staff else admin_ids()
        notify(recipients, event=f"support-reply:{reply.pk}", title="Support replied" if is_staff else "New reply on a support ticket", message=f"You have a reply on ticket #{ticket.id}.", kind="support", metadata={"ticket_id": ticket.id})
        return Response(self.get_serializer(ticket).data)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def resolve(self, request, pk=None):
        ticket = SupportTicket.objects.select_for_update().get(pk=self.get_object().pk)
        if ticket.status == SupportTicket.Status.RESOLVED:
            return Response(self.get_serializer(ticket).data)
        ticket.status = SupportTicket.Status.RESOLVED
        ticket.save()
        event = AuditLog.objects.create(actor=request.user, action="support.resolved", target=str(ticket.id))
        notify([ticket.user_id, *admin_ids()], event=f"support-resolved:{event.pk}", title="Support ticket resolved", message=f"Ticket #{ticket.id} was marked resolved. Reply to reopen if you still need help.", kind="support", metadata={"ticket_id": ticket.id})
        return Response(self.get_serializer(ticket).data)


class PublicReviewViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    def list(self, request):
        restaurant_id = serializers.IntegerField(min_value=1).run_validation(request.query_params.get("restaurant"))
        reviews = Review.objects.filter(restaurant__is_approved=True, restaurant_id=restaurant_id, is_visible=True).select_related("customer").order_by("-created_at")[:30]
        return Response({"results": [{"id": r.id, "name": r.customer.first_name or "Customer", "rating": r.rating, "comment": r.comment, "created_at": r.created_at} for r in reviews]})
