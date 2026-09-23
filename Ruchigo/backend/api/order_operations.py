"""Explicit staff exceptions, separate from a customer's cancellation rights."""
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .availability import restore_order_stock
from .models import AuditLog, Coupon, DeliveryAssignment, Order, OrderEvent, Payment, RefundRequest, SupportTicket, TicketMessage, User
from .notifications import admin_ids, notify, notify_order
from .permissions import IsAdmin
from .refunds import record_refund_update
from .serializers import OrderSerializer


class OperationInput(serializers.Serializer):
    expected_status = serializers.ChoiceField(choices=Order.Status.choices)
    note = serializers.CharField(max_length=1000, trim_whitespace=True)


class CancelInput(OperationInput):
    confirm_cancel = serializers.BooleanField()
    refund_amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0, required=False)
    ticket_id = serializers.IntegerField(min_value=1, required=False)

    def validate_confirm_cancel(self, value):
        if not value:
            raise serializers.ValidationError("Confirm cancellation explicitly.")
        return value


def require_active_fulfillment(order):
    if order.fulfillment_paused_at:
        raise serializers.ValidationError("This order is on hold while support reviews a fulfilment issue. It cannot be prepared, assigned, picked up or delivered until support resumes it.")


def operation_event(order, actor, action_name, message, ticket):
    event = AuditLog.objects.create(actor=actor, action=action_name, target=str(order.pk), metadata={"ticket_id": ticket.pk, "status": order.status})
    TicketMessage.objects.create(ticket=ticket, author=actor, body=message)
    SupportTicket.objects.filter(pk=ticket.pk).update(status=SupportTicket.Status.IN_PROGRESS, staff_requested_at=timezone.now(), updated_at=timezone.now())
    OrderEvent.objects.create(order=order, status=order.status, message=message[:255])
    partner = DeliveryAssignment.objects.filter(order=order).values_list("partner_id", flat=True).first()
    notify([order.customer_id, order.restaurant.owner_id, partner, *admin_ids("orders")], event=f"order-operation:{event.pk}",
           title="Order needs attention" if order.fulfillment_paused_at else "Order support update",
           message=message[:255], kind="order", metadata={"order_id": order.pk, "ticket_id": ticket.pk})


from .admin_access import AdminScopeMixin


class OrderOperationsViewSet(AdminScopeMixin, viewsets.GenericViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        if user.is_superuser or user.role == User.Role.ADMIN:
            return Order.objects.all()
        if user.role == User.Role.RESTAURANT:
            return Order.objects.filter(restaurant__owner=user)
        return Order.objects.none()

    def locked_order(self, data):
        visible = self.get_object()
        order = Order.objects.select_for_update().get(pk=visible.pk)
        if order.status in [Order.Status.CANCELLED, Order.Status.DELIVERED, Order.Status.AWAITING_PAYMENT]:
            raise serializers.ValidationError("Only active, kitchen-visible orders can use this operation. Delivered issues belong in refund review.")
        if data["expected_status"] != order.status:
            raise serializers.ValidationError("The order has progressed. Reload its latest status before confirming this action.")
        return order

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def issue(self, request, pk=None):
        if request.user.role not in [User.Role.ADMIN, User.Role.RESTAURANT] and not request.user.is_superuser:
            raise PermissionDenied("Only the kitchen or support can report a fulfilment hold.")
        payload = OperationInput(data=request.data)
        payload.is_valid(raise_exception=True)
        order = self.locked_order(payload.validated_data)
        if request.user.role == User.Role.RESTAURANT and order.status == Order.Status.OUT:
            raise serializers.ValidationError("This meal has left your kitchen. Contact platform support for a delivery issue.")
        if order.fulfillment_paused_at:
            return Response(self.get_serializer(order).data)
        ticket = SupportTicket.objects.create(user=order.customer, order=order, category="other", subject="Fulfilment issue reported by the kitchen" if request.user.role == User.Role.RESTAURANT else "Order paused by support")
        order.fulfillment_paused_at = timezone.now()
        order.fulfillment_issue = ticket
        order.save(update_fields=["fulfillment_paused_at", "fulfillment_issue", "updated_at"])
        operation_event(order, request.user, "order.fulfillment_paused", f"This order is on hold for a support review. {payload.validated_data['note']}", ticket)
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    @transaction.atomic
    def resume(self, request, pk=None):
        payload = OperationInput(data=request.data)
        payload.is_valid(raise_exception=True)
        order = self.locked_order(payload.validated_data)
        if not order.fulfillment_paused_at:
            raise serializers.ValidationError("This order is not on hold.")
        order.fulfillment_paused_at = None
        order.save(update_fields=["fulfillment_paused_at", "updated_at"])
        operation_event(order, request.user, "order.fulfillment_resumed", f"Support has resumed this order. {payload.validated_data['note']}", order.fulfillment_issue)
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    @transaction.atomic
    def cancel(self, request, pk=None):
        payload = CancelInput(data=request.data)
        payload.is_valid(raise_exception=True)
        data = payload.validated_data
        order = self.locked_order(data)
        payment = Payment.objects.select_for_update().filter(order=order).first()
        ticket_id = data.get("ticket_id") or order.fulfillment_issue_id
        ticket = SupportTicket.objects.filter(pk=ticket_id, order=order, user=order.customer).first() if ticket_id else None
        if ticket_id and not ticket:
            raise serializers.ValidationError("Choose the support conversation belonging to this order.")
        refund = RefundRequest.objects.filter(ticket=ticket).first() if ticket else None
        paid = payment and payment.status == Payment.Status.PAID
        if paid:
            if payment.method != "razorpay" or not payment.transaction_id or payment.amount < 1:
                raise serializers.ValidationError("This captured payment requires a separately approved cash/payment reconciliation procedure. It cannot be reversed here.")
            if data.get("refund_amount") != payment.amount:
                raise serializers.ValidationError("Staff cancellation requires explicit approval of the full captured amount to the original payment method.")
            other = order.refund_requests.exclude(status=RefundRequest.Status.REJECTED)
            if refund:
                other = other.exclude(pk=refund.pk)
                if refund.status not in [RefundRequest.Status.REQUESTED, RefundRequest.Status.REVIEWING, RefundRequest.Status.APPROVED]:
                    raise serializers.ValidationError("This conversation already has a final or submitted refund decision. Reconcile it before cancelling.")
                if refund.status == RefundRequest.Status.APPROVED and refund.approved_amount != payment.amount:
                    raise serializers.ValidationError("An existing partial approval cannot be silently expanded. Review the payment with support.")
            if other.exists():
                raise serializers.ValidationError("Another refund review already reserves this payment. Continue in that conversation before cancelling.")
        elif data.get("refund_amount", 0) != 0:
            raise serializers.ValidationError("No new captured online amount is available to approve here.")
        if not ticket:
            ticket = SupportTicket.objects.create(user=order.customer, order=order, category="refund" if paid else "other", subject="Order cancelled by support")
        previous = order.status
        order.status = Order.Status.CANCELLED
        order.fulfillment_paused_at = None
        order.fulfillment_issue = ticket
        order.save(update_fields=["status", "fulfillment_paused_at", "fulfillment_issue", "updated_at"])
        if previous in [Order.Status.PENDING, Order.Status.CONFIRMED]:
            restore_order_stock(order)
        else:
            order.items.filter(stock_deducted=True).update(stock_deducted=False)
        if order.coupon_id:
            Coupon.objects.filter(pk=order.coupon_id, usage_count__gt=0).update(usage_count=F("usage_count")-1)
        if payment and payment.status == Payment.Status.PENDING:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status", "updated_at"])
        if paid:
            if refund is None:
                refund = RefundRequest(ticket=ticket, order=order)
            refund.requested_amount = payment.amount
            refund.approved_amount = payment.amount
            refund.status = RefundRequest.Status.APPROVED
            refund.decision_note = data["note"]
            refund.save()
            record_refund_update(refund, f"Support cancelled this order and approved ₹{payment.amount:.2f} back to the original payment method. Refund submission and provider confirmation are still pending.", request.user)
        operation_event(order, request.user, "order.support_cancelled", f"Support cancelled this order. {data['note']}", ticket)
        from .rewards import sync_order_rewards
        sync_order_rewards(order)
        notify_order(order)
        return Response(self.get_serializer(order).data)
