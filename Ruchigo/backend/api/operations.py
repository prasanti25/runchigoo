"""Read-only operations history and explicitly audited review moderation."""
from django.db import transaction
from django.db.models import Avg
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import AuditLog, Restaurant, Review
from .permissions import IsAdmin


class AuditSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", read_only=True, default=None)

    class Meta:
        model = AuditLog
        fields = ["id", "actor_email", "action", "target", "metadata", "created_at"]


class AuditViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class = AuditSerializer
    queryset = AuditLog.objects.select_related("actor").order_by("-created_at", "-id")
    search_fields = ["action", "target", "actor__email"]
    filterset_fields = ["action"]


class ModeratedReviewSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source="restaurant.name", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "order", "restaurant", "restaurant_name", "rating", "comment", "is_visible", "created_at"]


class ModerationInput(serializers.Serializer):
    is_visible = serializers.BooleanField()
    reason = serializers.CharField(max_length=500, trim_whitespace=True, allow_blank=False)


class ReviewModerationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class = ModeratedReviewSerializer
    queryset = Review.objects.select_related("restaurant").order_by("-created_at", "-id")
    filterset_fields = ["is_visible", "restaurant"]
    search_fields = ["comment", "restaurant__name"]

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def visibility(self, request, pk=None):
        data = ModerationInput(data=request.data)
        data.is_valid(raise_exception=True)
        review = Review.objects.select_for_update().get(pk=self.get_object().pk)
        visible = data.validated_data["is_visible"]
        if review.is_visible != visible:
            review.is_visible = visible
            review.save(update_fields=["is_visible", "updated_at"])
            rating = Review.objects.filter(restaurant_id=review.restaurant_id, is_visible=True).aggregate(value=Avg("rating"))["value"] or 0
            Restaurant.objects.filter(pk=review.restaurant_id).update(average_rating=rating)
            AuditLog.objects.create(
                actor=request.user, action="review.published" if visible else "review.hidden", target=str(review.pk),
                metadata={"reason": data.validated_data["reason"], "restaurant": review.restaurant_id},
            )
        return Response(self.get_serializer(review).data)
