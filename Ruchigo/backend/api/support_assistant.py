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
    "not_paid": "No, I didn’t pay",
    "paid": "Yes, I made a payment",
    "paid_cash": "I paid cash",
    "unexpected_debit": "Money was debited online",
    "not_received": "My order hasn’t arrived",
    "food_arrived": "Yes, the food reached me",
    "thanks": "That answered my question",
}


def choice(topic, label=None):
    return {"topic": topic, "label": label or QUICK_TOPICS[topic]}


def payment_choices():
    return [choice("not_paid"), choice("paid_cash"), choice("unexpected_debit")]


def context_topics(ticket, message):
    previous = ticket.messages.filter(id__lt=message.pk).exclude(author_id=ticket.user_id).order_by("-id").first()
    return [action["topic"] for action in previous.actions if "topic" in action] if previous else []


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


def classify(message, previous_topics=()):
    from .intelligence import support_topic
    if re.fullmatch(r"\s*(thanks|thank you|that helped|that answered my question)[!.\s]*", message, re.I):
        return "thanks"
    if re.fullmatch(r"\s*(hi+|hey+|hello|namaste|hii)[!.\s]*", message, re.I):
        return "greeting"
    if re.search(r"\b(didn['’]?t pay|did not pay|haven['’]?t paid|not paid|no payment|paise nahi diye|payment nahi ki)\b", message, re.I):
        return "not_paid"
    if "not_paid" in previous_topics:
        if re.fullmatch(r"\s*(no|nope|nahi|nahin|nhi)[!.\s]*", message, re.I):
            return "not_paid"
        if re.fullmatch(r"\s*(yes|yeah|haan|ha|han)[!.\s]*", message, re.I):
            return "paid"
    if "food_arrived" in previous_topics:
        if re.fullmatch(r"\s*(yes|yeah|haan|ha|han)[!.\s]*", message, re.I):
            return "food_arrived"
        if re.fullmatch(r"\s*(no|nope|nahi|nahin|nhi)[!.\s]*", message, re.I):
            return "status"
    if re.search(r"\b(paid (in )?cash|cash (diya|paid)|cash payment)\b", message, re.I):
        return "paid_cash"
    if re.search(r"\b(money.*debited|debited.*(money|account)|paid (by |via )?(upi|card)|paise kat)\b", message, re.I):
        return "unexpected_debit"
    # "Refund not received" is a payment question, not a missing delivery.
    if re.search(r"\b(refund|money back)\b", message, re.I):
        return support_topic(message)
    if re.search(r"\b(not received|didn['’]?t (get|receive)|hasn['’]?t arrived|not delivered|nahi mila)\b", message, re.I):
        return "not_received"
    if re.search(r"\b(not helpful|not satisfied|not helping|same answer|bekar|useless)\b", message, re.I):
        return "clarify"
    topic = support_topic(message)
    if topic:
        return topic
    if re.fullmatch(r"\s*(.)\1{3,}\s*", message) or len(message.strip()) < 4:
        return "general"
    clean = re.sub(r"[\w.+-]+@[\w.-]+|\b\d{4,}\b", "[redacted]", message[:500])
    choices = ["food_quality", "refund", "cancel", "payment", "missing", "allergy", "status", "account", "review", "general", "not_paid", "paid", "paid_cash", "unexpected_debit", "not_received", "thanks", "clarify"]
    result = structured_response("Classify this English/Hindi/Hinglish support message into one topic. Do not answer it or perform actions. Use general if unclear.", {"message": clean}, {"type": "OBJECT", "properties": {"topic": {"type": "STRING", "enum": choices}}, "required": ["topic"]})
    return result.get("topic") if isinstance(result, dict) and result.get("topic") in choices else "general"


def answer(ticket, topic, order):
    actions = []
    if order:
        actions.append({"label": "View order", "to": f"/tracking/{order.pk}"})
    else:
        actions.append({"label": "Choose an order", "to": "/orders"})
    if topic == "greeting":
        if order:
            return f"Hi! I’m here to help. I have your {order.restaurant.name} order here—it’s {order.get_status_display().lower()}. What would you like to sort out?", quick_choices(order)
        return "Hi! I’m here to help. Choose an order so I can check its details, or tell me what’s wrong with your account.", actions + [choice("account")]
    if topic == "thanks":
        return "Glad that helped. You can close this conversation if you’re all set, or ask me another question here.", [{"kind": "resolve", "label": "That helped, close chat"}, {"label": "Browse meals", "to": "/search"}]
    if topic == "clarify":
        return "Sorry, that didn’t answer what you needed. Let’s get to the right issue—choose what happened below, or describe it in your own words.", quick_choices(order)
    if topic == "not_paid" and order:
        payment = getattr(order, "payment", None)
        if payment and payment.status in [Payment.Status.PAID, Payment.Status.REFUNDED]:
            return "Thanks for clarifying. The payment record for this order shows a payment, so I shouldn’t dismiss it as unpaid. Let’s check its payment or refund status first.", [choice("refund"), {"kind": "issue", "category": "payment", "label": "Report a payment mismatch"}]
        if order.status == Order.Status.CANCELLED:
            return "Thanks for confirming. Since you didn’t pay and this order is cancelled, there’s no money to refund and nothing to pay for this cancelled order. Would you like to close this chat or choose another meal?", [{"kind": "resolve", "label": "That helped, close chat"}, {"label": "Find another meal", "to": "/search"}]
        return "Thanks for confirming. There’s no collected payment to refund right now. The order is still active; checking payment here does not cancel it. What would you like to do next?", [choice("status")] + ([choice("cancel")] if cancellation_details(order)["allowed"] else [])
    if topic == "paid" and order:
        return "Got it. How did you pay—cash, or an online payment such as UPI or card?", [choice("paid_cash"), choice("unexpected_debit")]
    if topic in ["paid_cash", "unexpected_debit"] and order:
        payment = getattr(order, "payment", None)
        if payment and payment.status in [Payment.Status.PAID, Payment.Status.REFUNDED]:
            return answer(ticket, "refund", order)
        method = "cash" if topic == "paid_cash" else "online payment"
        return f"Thanks for telling me. Your {method} isn’t recorded as collected for this order. Please add the amount, when you paid and how you paid below, so this mismatch stays attached to this conversation. Don’t share an OTP, UPI PIN or full card number. A refund can only be confirmed once the payment is verified.", [{"kind": "issue", "category": "payment", "label": "Add payment details"}, choice("not_paid", "I didn’t make a payment")]
    if topic == "not_received" and order:
        if order.status == Order.Status.DELIVERED:
            return "This order is marked delivered, but you’re saying it hasn’t arrived. Please check whether someone at your address or reception received it. If not, report it below so the delivery record can be checked.", [{"kind": "issue", "category": "delivery", "label": "Report order not received"}, choice("status", "Check delivery details")]
        return answer(ticket, "status", order)
    if topic == "food_arrived" and order:
        if order.status in [Order.Status.OUT, Order.Status.DELIVERED]:
            return answer(ticket, "food_quality", order)
        return "Thanks for confirming. The order hasn’t been marked delivered in the app, so the delivery record needs checking before a meal refund can be assessed. If the food seems spoiled, don’t eat it. Add what arrived and when below.", [{"kind": "issue", "category": "delivery", "label": "Report incorrect delivery status"}]
    if topic == "cancel" and order:
        state = cancellation_details(order)
        actions[0]["label"] = "Check cancellation" if state["allowed"] else "View order details"
        if state["allowed"]:
            return state["message"] + " You can review the cancellation here before confirming. Nothing has been cancelled yet.", [{"kind": "cancel", "label": "Review cancellation"}]
        if order.status == Order.Status.CANCELLED:
            return state["message"] + " Are you checking whether a payment needs to be returned?", [choice("refund"), {"kind": "resolve", "label": "That helped, close chat"}]
        return state["message"] + " I can still help with its current status or a payment question.", [choice("status"), choice("refund")]
    if topic == "status" and order:
        if order.fulfillment_paused_at:
            return "Your order is on hold because a fulfilment issue needs a support decision. Preparation and pickup cannot progress until the hold is lifted. Updates will appear here.", actions
        if order.scheduled_for and order.status in [Order.Status.PENDING, Order.Status.CONFIRMED]:
            from django.utils import timezone
            if order.scheduled_for > timezone.now():
                scheduled = timezone.localtime(order.scheduled_for).strftime("%d %b at %I:%M %p %Z")
                return f"This is a scheduled order. Preparation is scheduled to start on {scheduled}; that is not the delivery arrival time. " + ("The restaurant still needs to accept it." if order.status == Order.Status.PENDING else "The restaurant has accepted it. Cooking cannot start before that time."), actions
        facts = {
            "pending": "The restaurant hasn’t accepted your order yet. We’ll show the next update when the kitchen confirms it.",
            "confirmed": "The restaurant accepted your order. Cooking has not been marked as started yet.",
            "preparing": "The kitchen is preparing your food. Self-service cancellation is closed now. You can still report an issue here.",
            "ready": "Your meal is ready at the restaurant and waiting for pickup.",
            "assigned": "A delivery partner is assigned. Pickup has not been confirmed yet.",
            "out_for_delivery": "Pickup is confirmed and your food is on the way. Open tracking for the latest shared location.",
            "delivered": "This order is marked delivered. If it didn’t reach you, tell us here and request a team review.",
            "cancelled": "This order is cancelled, so there won’t be a delivery. Are you checking a payment or would you like to choose another meal?",
            "awaiting_payment": "Payment has not been confirmed, so this order has not reached the kitchen. If you were debited, tell us before trying another payment.",
        }
        if order.status == Order.Status.CANCELLED:
            actions = [choice("refund"), {"label": "Find another meal", "to": "/search"}]
        return facts.get(order.status, "Open the order to check the latest update."), actions
    if topic in ["food_quality", "missing"]:
        if order and order.status not in ["out_for_delivery", "delivered"]:
            return f"The app currently shows this order as {order.get_status_display().lower()}, not delivered. Has the food actually reached you? If food seems spoiled, don’t eat it.", [choice("food_arrived"), choice("status", "No, I’m still waiting")]
        body = "I’m sorry the meal wasn’t right. If it seems spoiled or unsafe, please don’t eat it. Which dishes were affected, and what did you notice?" if topic == "food_quality" else "Which items were missing or incorrect? Tell us the dish names and what you received so the team can review the order."
        if order:
            actions = [{"label": "Choose affected dishes", "kind": "issue", "category": "food_quality" if topic == "food_quality" else "missing_item"}]
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
            actions = [{"label": "View refund conversation", "to": f"/support?ticket={refund.ticket_id}"}] if refund.ticket_id != ticket.pk else [{"label": "View order", "to": f"/tracking/{order.pk}"}]
            if refund.ticket_id == ticket.pk:
                actions.append({"kind": "issue", "category": "refund", "label": "Report refund not received" if refund.status == "processed" else "Add details to this review"})
            return explanations[refund.status], actions
        payment = getattr(order, "payment", None)
        if payment and payment.status == Payment.Status.REFUNDED:
            return "The payment record is already marked refunded. If you haven’t received it, add the missing-refund details here so the payment record can be checked. This does not submit a second refund.", [{"kind": "issue", "category": "payment", "label": "Report refund not received"}]
        if not payment or payment.status != Payment.Status.PAID:
            if ticket.category == "payment" and ticket.staff_requested_at:
                return "This conversation is already open for a payment check. Your details stay attached here, but no collected payment has been confirmed yet. Verification is needed before a refund can be confirmed; you don’t need to submit the same details again.", [{"kind": "issue", "category": "payment", "label": "Add more payment details"}, choice("status", "Check order details")]
            method = "This was a cash-on-delivery order. " if payment and payment.method == "cod" else ""
            return method + "There is no confirmed payment recorded for this order to refund. Did you actually pay anything for this order?", payment_choices()
        if payment.method == "razorpay":
            body = "You can request a refund review. If approved, it goes to the original payment method—not another card, account or wallet. Would you like to describe the issue and review the request first?"
        else:
            body = "This order was paid in cash. A refund needs a team review and an approved cash-return process; it cannot be sent back through an online payment gateway."
        actions = [{"label": "Review refund request", "kind": "issue", "category": "refund"}]
        return body, actions
    if topic == "allergy":
        return "I can’t verify allergens or cross-contact in this kitchen. If food may be unsafe for you, don’t eat it. If you have a severe reaction or trouble breathing, seek urgent medical help. The support team can review the food issue separately.", actions
    if topic == "review" and order:
        return ("You can rate this meal right here. Your support-conversation feedback is separate." if order.status == "delivered" else "Meal ratings unlock after delivery. You can still tell us about an order issue here."), ([{"kind": "review", "label": "Rate meal"}] if order.status == "delivered" else actions)
    if topic == "account" or ticket.category == "privacy":
        profile = {"admin": "/admin-profile", "restaurant": "/restaurant-profile", "delivery": "/delivery-profile"}.get(ticket.user.role, "/profile")
        return "You can update your profile or saved addresses below, or use password recovery if you can’t sign in. Don’t share passwords, OTPs or payment details. For another account or privacy issue, tell me what you need changed.", [{"label": "Open profile", "to": profile}, {"label": "Saved addresses", "to": "/addresses"}, {"label": "Reset password", "to": "/forgot-password"}]
    return "Could you tell me a little more? Choose the issue below, or tell me what happened and what you’d like to get sorted.", quick_choices(order) + ([] if order else actions)


def respond(ticket_id, user, message_id):
    ticket = SupportTicket.objects.get(pk=ticket_id, user=user)
    message = ticket.messages.filter(pk=message_id, author=user).first()
    if not message:
        raise serializers.ValidationError("Choose your own message in this conversation.")
    if TicketMessage.objects.filter(reply_to=message).exists() or ticket.status == "resolved":
        return ticket
    topic = classify(message.body, context_topics(ticket, message))  # No database locks held during a provider call.
    with transaction.atomic():
        order = Order.objects.select_for_update().filter(pk=ticket.order_id).first() if ticket.order_id else None
        ticket = SupportTicket.objects.select_for_update().get(pk=ticket.pk)
        if ticket.status == "resolved" or TicketMessage.objects.filter(reply_to=message).exists():
            return ticket
        latest = ticket.messages.filter(author=user).order_by("-id").first()
        if latest.pk != message.pk or ticket.messages.filter(id__gt=message.pk, author__role=User.Role.ADMIN).exclude(author=user).exists():
            return ticket
        body, actions = answer(ticket, topic, order)
        reply = TicketMessage.objects.create(ticket=ticket, body=body, actions=actions, reply_to=message)
        ticket.save(update_fields=["updated_at"])
        notify([user.pk], event=f"support-help:{reply.pk}", title="An update in your conversation", message="Your order help is ready in this conversation.", kind="support", metadata={"ticket_id": ticket.pk, "order_id": ticket.order_id})
        return ticket
