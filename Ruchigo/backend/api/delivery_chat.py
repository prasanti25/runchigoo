"""Private, persisted customer/courier messages; no simulated presence/replies."""
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle

from .models import DeliveryAssignment, DeliveryMessage, Notification, Order, User
from .notifications import notify


class DeliveryChatThrottle(SimpleRateThrottle):
    scope = "delivery_chat"
    rate = "30/min"

    def get_cache_key(self, request, view):
        return f"delivery-chat:{request.user.pk}" if view.action == "send" else None


class MessageInput(serializers.Serializer):
    text = serializers.CharField(max_length=1000, trim_whitespace=True)
    client_id = serializers.UUIDField()


class ChatQuery(serializers.Serializer):
    before = serializers.IntegerField(min_value=1, required=False)


class MessageOutput(serializers.ModelSerializer):
    mine = serializers.SerializerMethodField()
    sender = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryMessage
        fields = ["id", "text", "mine", "sender", "created_at", "read_at", "client_id"]

    def get_mine(self, obj):
        return obj.author_id == self.context["request"].user.pk

    def get_sender(self, obj):
        return "Delivery partner" if obj.author_id == obj.partner_id else "Customer"


from .admin_access import AdminScopeMixin


class DeliveryChatViewSet(AdminScopeMixin, viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [DeliveryChatThrottle]

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response["Cache-Control"] = "private, no-store"
        return response

    def participants(self, pk, lock=False):
        pk = serializers.IntegerField(min_value=1).run_validation(pk)
        # Lock in the same order as delivery completion/reassignment.
        orders = Order.objects.all()
        if lock:
            orders = orders.select_for_update()
        user = self.request.user
        if user.role == User.Role.CUSTOMER:
            orders = orders.filter(customer=user)
        elif user.role == User.Role.DELIVERY:
            orders = orders.filter(delivery__partner=user)
        else:
            orders = orders.none()
        order = get_object_or_404(orders, pk=pk)
        assignments = DeliveryAssignment.objects.filter(order=order)
        if lock:
            assignments = assignments.select_for_update()
        assignment = assignments.first()
        return order, assignment

    def retrieve(self, request, pk=None):
        order, assignment = self.participants(pk)
        query = ChatQuery(data=request.query_params)
        query.is_valid(raise_exception=True)
        partner_id = assignment.partner_id if assignment else None
        messages = DeliveryMessage.objects.filter(order=order, partner_id=partner_id)
        unread = messages.exclude(author=request.user).filter(read_at__isnull=True).count()
        if "before" in query.validated_data:
            messages = messages.filter(pk__lt=query.validated_data["before"])
        rows = list(messages.order_by("-id")[:51])
        next_before = rows[49].pk if len(rows) > 50 else None
        rows = list(reversed(rows[:50]))
        return Response({
            "messages": MessageOutput(rows, many=True, context={"request": request}).data,
            "next_before": next_before, "unread": unread,
            "can_send": bool(partner_id and order.status in [Order.Status.ASSIGNED, Order.Status.OUT]),
            "status": order.status,
            "partner_assigned": bool(partner_id),
            "conversation_key": f"{order.pk}:{partner_id or 'unassigned'}",
        })

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def send(self, request, pk=None):
        data = MessageInput(data=request.data)
        data.is_valid(raise_exception=True)
        order, assignment = self.participants(pk, lock=True)
        if not assignment or not assignment.partner_id:
            return Response({"detail": "Messaging opens when a delivery partner is assigned."}, status=409)
        existing = DeliveryMessage.objects.filter(order=order, author=request.user, client_id=data.validated_data["client_id"]).first()
        if existing:
            if existing.text != data.validated_data["text"] or existing.partner_id != assignment.partner_id:
                return Response({"detail": "This message reference was already used. Start a new message."}, status=409)
            return Response(MessageOutput(existing, context={"request": request}).data)
        if order.status not in [Order.Status.ASSIGNED, Order.Status.OUT]:
            return Response({"detail": "This delivery conversation is now read-only. Contact support for order issues."}, status=409)
        message = DeliveryMessage.objects.create(order=order, author=request.user, partner_id=assignment.partner_id, **data.validated_data)
        recipient = assignment.partner_id if request.user.pk == order.customer_id else order.customer_id
        notify([recipient], event=f"delivery-message:{message.pk}", title="Message about your delivery",
               message="You have a new message in your delivery conversation.", kind="delivery_message",
               metadata={"order_id": order.pk, "delivery_chat": True, "message_id": message.pk})
        return Response(MessageOutput(message, context={"request": request}).data, status=201)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def read(self, request, pk=None):
        order, assignment = self.participants(pk, lock=True)
        last = serializers.IntegerField(min_value=1).run_validation(request.data.get("last_id"))
        if assignment and assignment.partner_id:
            messages = DeliveryMessage.objects.filter(order=order, partner_id=assignment.partner_id, pk__lte=last).exclude(author=request.user)
            ids = list(messages.filter(read_at__isnull=True).values_list("id", flat=True))
            messages.filter(read_at__isnull=True).update(read_at=timezone.now())
            if ids:
                Notification.objects.filter(user=request.user, event_key__in=[f"delivery-message:{pk}" for pk in ids]).update(is_read=True)
        return Response({"detail": "Messages marked as read."})
