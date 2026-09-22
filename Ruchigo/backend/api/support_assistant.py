"""Persisted, factual ticket assistance. No financial or order mutations."""
import re
from django.db import transaction
from rest_framework import serializers
from .ai_provider import structured_response
from .cancellations import cancellation_details
from .models import Order, Payment, SupportTicket, TicketMessage, User
from .notifications import notify


QUICK_TOPICS = {
    "status": "Where is my order?",
    "cancel": "Can I cancel this order?",
    "refund": "Check payment or refund",
    "food_quality": "There is a problem with the food",
    "missing": "An item is missing or incorrect",
    "review": "Rate my meal",
    "account": "Help with my account",
}


def quick_choices(order):
    if not order:
        return [{"topic": "account", "label": QUICK_TOPICS["account"]}]
    topics = ["status"]
    if cancellation_details(order)["allowed"]:
        topics.append("cancel")
    if order.status in [Order.Status.OUT, Order.Status.DELIVERED]:
        topics.extend(["food_quality", "missing"])
    topics.append("refund")
    if order.status == Order.Status.DELIVERED:
        topics.append("review")
    return [{"topic": topic, "label": "Check order details" if topic == "status" and order.status in [Order.Status.CANCELLED, Order.Status.DELIVERED] else QUICK_TOPICS[topic]} for topic in topics]


def quick_help(ticket_id, user, topic, client_id):
    """An explicit factual check, including while a human review stays queued."""
    visible = SupportTicket.objects.get(pk=ticket_id, user=user)
    with transaction.atomic():
        order = Order.objects.select_for_update().filter(pk=visible.order_id).first() if visible.order_id else None
        ticket = SupportTicket.objects.select_for_update().get(pk=visible.pk)
        message = ticket.messages.filter(author=user, client_id=client_id).first()
        if message and message.body != QUICK_TOPICS[topic]:
            raise serializers.ValidationError("This message key was already used for a different choice.")
        if message and TicketMessage.objects.filter(reply_to=message).exists():
            return ticket
        message = message or TicketMessage.objects.create(ticket=ticket, author=user, body=QUICK_TOPICS[topic], client_id=client_id)
        body, actions = answer(ticket, topic, order)
        reply = TicketMessage.objects.create(ticket=ticket, body=body, actions=actions, reply_to=message)
        # Checking facts must not cancel the customer's queued review or reopen
        # a resolved case. Financial/order changes use their dedicated workflows.
        ticket.save(update_fields=["updated_at"])
        notify([user.pk], event=f"support-help:{reply.pk}", title="An update in your conversation", message="Your order help is ready in this conversation.", kind="support", metadata={"ticket_id": ticket.pk, "order_id": ticket.order_id})
        return ticket


def classify(message):
    from .intelligence import support_topic
    if re.fullmatch(r"\s*(hi+|hey+|hello|namaste|hii|thanks|thank you)[!.\s]*", message, re.I):
        return "greeting"
    topic = support_topic(message)
    if topic:
        return topic
    if re.fullmatch(r"\s*(.)\1{3,}\s*", message) or len(message.strip()) < 4:
        return "general"
    clean = re.sub(r"[\w.+-]+@[\w.-]+|\b\d{4,}\b", "[redacted]", message[:500])
    choices = ["food_quality", "refund", "cancel", "payment", "missing", "allergy", "status", "account", "review", "general"]
    result = structured_response("Classify this English/Hindi/Hinglish support message into one topic. Do not answer it or perform actions. Use general if unclear.", {"message": clean}, {"type": "OBJECT", "properties": {"topic": {"type": "STRING", "enum": choices}}, "required": ["topic"]})
    return result.get("topic") if isinstance(result, dict) and result.get("topic") in choices else "general"


def answer(ticket, topic, order):
    actions = []
    if order:
        actions.append({"label": "View order", "to": f"/tracking/{order.pk}"})
    else:
        actions.append({"label": "Choose an order", "to": "/orders"})
    if topic == "greeting":
        return "Hi! I’m here to help. What would you like to check—your order, a payment, or a problem with your meal?", actions
    if topic == "cancel" and order:
        state = cancellation_details(order)
        actions[0]["label"] = "Check cancellation" if state["allowed"] else "View order details"
        return state["message"] + (" Open the order to review and confirm; this message has not cancelled anything." if state["allowed"] else " You can ask for a team review here if something is wrong."), actions
    if topic == "status" and order:
        if order.fulfillment_paused_at:
            return "Your order is on hold because a fulfilment issue needs a support decision. Preparation and pickup cannot progress until the hold is lifted. Updates will appear here.", actions
        facts = {
            "pending": "The restaurant hasn’t accepted your order yet. We’ll show the next update when the kitchen confirms it.",
            "confirmed": "The restaurant accepted your order. Cooking has not been marked as started yet.",
            "preparing": "The kitchen is preparing your food. Self-service cancellation is closed now. You can still report an issue here.",
            "ready": "Your meal is ready at the restaurant and waiting for pickup.",
            "assigned": "A delivery partner is assigned. Pickup has not been confirmed yet.",
            "out_for_delivery": "Pickup is confirmed and your food is on the way. Open tracking for the latest shared location.",
            "delivered": "This order is marked delivered. If it didn’t reach you, tell us here and request a team review.",
            "cancelled": "This order is cancelled. It will not progress to preparation or delivery. Any refund has its own separate status below.",
            "awaiting_payment": "Payment has not been confirmed, so this order has not reached the kitchen. If you were debited, tell us before trying another payment.",
        }
        return facts.get(order.status, "Open the order to check the latest update."), actions
    if topic in ["food_quality", "missing"]:
        if order and order.status not in ["out_for_delivery", "delivered"]:
            return f"The app currently shows this order as {order.get_status_display().lower()}, not delivered. Has the food actually reached you? Tell us if the status is wrong, or which earlier order this issue is about. If food seems spoiled, don’t eat it.", actions
        body = "I’m sorry the meal wasn’t right. If it seems spoiled or unsafe, please don’t eat it. Which dishes were affected, and what did you notice?" if topic == "food_quality" else "Which items were missing or incorrect? Tell us the dish names and what you received so the team can review the order."
        if order and not getattr(ticket, "refund_request", None):
            actions.append({"label": "Choose affected dishes", "to": f"/support?order={order.pk}&category={'food_quality' if topic == 'food_quality' else 'missing_item'}&compose=1"})
        return body, actions
    if topic in ["payment", "refund"] and order:
        refund = getattr(ticket, "refund_request", None) or order.refund_requests.order_by("-created_at").first()
        if refund:
            explanations = {
                "requested": "Your refund review is requested. It has not been approved yet.",
                "reviewing": "Your refund request is under review. No refund has been confirmed yet.",
                "approved": "Your refund is approved and awaiting submission to the payment provider. It is not marked returned yet.",
                "processing": "Your refund is processing. We’re waiting for the payment provider’s confirmation; don’t submit another request.",
                "processed": "Your refund was confirmed to the original payment method. Your bank or payment app determines when it appears.",
                "failed": "The refund needs a team review because processing failed. It is not marked returned.",
                "rejected": "This refund request was not approved. You can add information and ask the team to review the decision.",
            }
            actions.append({"label": "View refund conversation", "to": f"/support?ticket={refund.ticket_id}"})
            return explanations[refund.status], actions
        payment = getattr(order, "payment", None)
        if not payment or payment.status != Payment.Status.PAID:
            return "There is no confirmed payment recorded for this order to refund. If your bank shows a debit, describe what happened and request a team review. Please don’t share an OTP, UPI PIN or card details.", actions
        if payment.method == "razorpay":
            body = "You can request a refund review. If approved, it goes to the original payment method—not another card, account or wallet. Would you like to describe the issue and review the request first?"
        else:
            body = "This order was paid in cash. A refund needs a team review and an approved cash-return process; it cannot be sent back through an online payment gateway."
        actions.append({"label": "Review refund request", "to": f"/support?order={order.pk}&category=refund&compose=1"})
        return body, actions
    if topic == "allergy":
        return "I can’t verify allergens or cross-contact in this kitchen. If food may be unsafe for you, don’t eat it. If you have a severe reaction or trouble breathing, seek urgent medical help. The support team can review the food issue separately.", actions
    if topic == "review" and order:
        return ("You can rate this delivered meal from its order details. Your support-conversation feedback is separate." if order.status == "delivered" else "Meal ratings unlock after delivery. You can still tell us about an order issue here."), actions
    if topic == "account" or ticket.category == "privacy":
        return "Tell us which account or privacy issue needs attention. Don’t share passwords, OTPs or payment details. Account deletion, data requests and access problems need team review; this chat does not perform them automatically.", actions
    return "Could you tell me a little more? I can check your order status, explain cancellation or refunds, and help report a meal issue. Use Talk to the team if you need a support review.", actions


def respond(ticket_id, user, message_id):
    ticket = SupportTicket.objects.get(pk=ticket_id, user=user)
    message = ticket.messages.filter(pk=message_id, author=user).first()
    if not message:
        raise serializers.ValidationError("Choose your own message in this conversation.")
    if TicketMessage.objects.filter(reply_to=message).exists() or ticket.staff_requested_at or ticket.status == "resolved":
        return ticket
    topic = classify(message.body)  # No database locks held during a provider call.
    with transaction.atomic():
        order = Order.objects.select_for_update().filter(pk=ticket.order_id).first() if ticket.order_id else None
        ticket = SupportTicket.objects.select_for_update().get(pk=ticket.pk)
        if ticket.staff_requested_at or ticket.status == "resolved" or TicketMessage.objects.filter(reply_to=message).exists():
            return ticket
        latest = ticket.messages.filter(author=user).order_by("-id").first()
        if latest.pk != message.pk or ticket.messages.filter(id__gt=message.pk, author__role=User.Role.ADMIN).exclude(author=user).exists():
            return ticket
        body, actions = answer(ticket, topic, order)
        reply = TicketMessage.objects.create(ticket=ticket, body=body, actions=actions, reply_to=message)
        ticket.save(update_fields=["updated_at"])
        notify([user.pk], event=f"support-help:{reply.pk}", title="An update in your conversation", message="Your order help is ready in this conversation.", kind="support", metadata={"ticket_id": ticket.pk, "order_id": ticket.order_id})
        return ticket
