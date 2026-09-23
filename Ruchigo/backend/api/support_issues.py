"""Confirmed issue intake in the existing conversation, never a refund payout."""
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers
from .models import AuditLog, Order, OrderItem, Payment, RefundRequest, SupportTicket, TicketMessage
from .notifications import admin_ids, notify


class IssueInput(serializers.Serializer):
    category = serializers.ChoiceField(choices=["food_quality", "missing_item", "wrong_item", "payment", "refund", "delivery"])
    message = serializers.CharField(min_length=5, max_length=1800, trim_whitespace=True)
    affected_item_ids = serializers.ListField(child=serializers.IntegerField(min_value=1), max_length=50, default=list)
    request_refund = serializers.BooleanField(default=False)
    client_id = serializers.UUIDField()


def report_issue(ticket_id, user, data):
    visible = SupportTicket.objects.get(pk=ticket_id, user=user)
    if not visible.order_id:
        raise serializers.ValidationError("Choose an order before reporting an order issue.")
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=visible.order_id, customer=user)
        ticket = SupportTicket.objects.select_for_update().get(pk=ticket_id, user=user)
        items = list(OrderItem.objects.filter(order=order, pk__in=set(data["affected_item_ids"])).order_by("id"))
        if len(items) != len(set(data["affected_item_ids"])):
            raise serializers.ValidationError("Choose dishes from this order only.")
        food_issue = data["category"] in {"food_quality", "missing_item", "wrong_item"}
        if food_issue and (not items or order.status not in {Order.Status.OUT, Order.Status.DELIVERED}):
            raise serializers.ValidationError("Select the affected dishes from a received order. If delivery status is wrong, report a delivery issue first.")
        details = [{"id": item.pk, "name": item.name, "quantity": item.quantity} for item in items]
        body = f"{data['category'].replace('_', ' ').title()}: {data['message']}"
        if items:
            body += "\nAffected dishes: " + ", ".join(f"{item.quantity} × {item.name}" for item in items)
        body += "\nRequested: " + ("refund review" if data["request_refund"] else "help with this issue")
        if len(body) > 3000:
            raise serializers.ValidationError("Please shorten the issue details.")
        existing = ticket.messages.filter(author=user, client_id=data["client_id"]).first()
        if existing:
            if existing.body != body:
                raise serializers.ValidationError("This message key was already used for different details.")
            return ticket
        refund = RefundRequest.objects.select_for_update().filter(ticket=ticket).first()
        if data["request_refund"] and not refund:
            payment = Payment.objects.select_for_update().filter(order=order).first()
            if not payment or payment.status != Payment.Status.PAID:
                raise serializers.ValidationError("No collected payment is available to refund. Report a payment mismatch instead.")
            if RefundRequest.objects.filter(order=order, status__in=["requested", "reviewing", "approved", "processing"]).exists():
                raise serializers.ValidationError("This order already has a refund review. Open its refund conversation before requesting another.")
            returned = RefundRequest.objects.filter(order=order, status="processed").aggregate(total=Sum("approved_amount"))["total"] or Decimal(0)
            if returned >= payment.amount:
                raise serializers.ValidationError("This payment is already fully refunded.")
            refund = RefundRequest.objects.create(ticket=ticket, order=order, requested_amount=payment.amount-returned)
        ticket.category = data["category"]
        ticket.affected_items = details or ticket.affected_items
        ticket.status = SupportTicket.Status.IN_PROGRESS
        ticket.staff_requested_at = ticket.staff_requested_at or timezone.now()
        ticket.save()
        message = TicketMessage.objects.create(ticket=ticket, author=user, body=body, client_id=data["client_id"])
        if refund:
            reply = "I’ve attached these details to the refund conversation. " + {
                "requested": "Your refund review is requested, not approved yet.",
                "reviewing": "Your refund is under review.",
                "approved": "Your refund is approved, but has not yet been confirmed as returned.",
                "processing": "Your refund is processing; provider confirmation is still pending.",
                "processed": "The recorded refund is already processed. These additional details do not start a second refund.",
                "rejected": "The earlier request was not approved; your additional details are now saved for review.",
                "failed": "The refund has a processing issue; your details are saved with it.",
            }[refund.status]
        else:
            reply = "I’ve saved these details on this conversation, linked to your order. "
            reply += "The payment needs verification before any refund can be confirmed." if data["category"] == "payment" else "Your reported issue is recorded; this hasn’t cancelled the order or approved a refund."
        TicketMessage.objects.create(ticket=ticket, body=reply, reply_to=message,
                                    actions=[{"topic": "refund" if refund or data["category"] == "payment" else "status", "label": "Check latest status"}])
        AuditLog.objects.create(actor=user, action="support.issue_submitted", target=str(ticket.pk), metadata={"category": data["category"], "order_id": order.pk, "refund_request_id": refund.pk if refund else None})
        notify([user.pk, *admin_ids()], event=f"support-issue:{message.pk}", title="Issue details received", message=f"Updated conversation #{ticket.pk}.", kind="support", metadata={"ticket_id": ticket.pk, "order_id": order.pk})
        return ticket
