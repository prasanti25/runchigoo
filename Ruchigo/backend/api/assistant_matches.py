"""Explain an empty shortlist using catalog facts, never invented availability."""
import re
from django.db.models import Q

from .menu_options import minimum_item_price
from .product_views import eligible_items
from .recommendations import craving_terms
from .serviceability import city_query


def match_craving(items, query):
    included, excluded = craving_terms(query)
    # "chicken pizza" means pizza containing chicken, not pizza OR any chicken
    # dish. Explicit "chicken or paneer" remains an alternatives request.
    ingredients = [term for term in included if term in ("chicken", "paneer")]
    dishes = [term for term in included if term not in ingredients]
    if ingredients and dishes and not re.search(r"\b(?:chicken|paneer)\s+or\s|\bor\s+(?:chicken|paneer)\b", query, re.I):
        for ingredient in ingredients:
            items = items.filter(Q(name__icontains=ingredient) | Q(description__icontains=ingredient))
        included = dishes
    for terms, exclude in [(included, False), (excluded, True)]:
        if not terms:
            continue
        condition = Q()
        for term in terms:
            condition |= Q(name__icontains=term) | Q(category__name__icontains=term)
        items = items.exclude(condition) if exclude else items.filter(condition)
    return items


def empty_shortlist(filters):
    """Return explicit next steps; never widen the actual result set or profile."""
    query = filters.get("q", "")
    included, _ = craving_terms(query)
    food = " or ".join(included[:3]) if included else "that dish"
    city = filters.get("city", "")
    where = f" in {city}" if city else ""
    actions, links = [], []

    # Only offer another city if the same craving AND every other restriction
    # really match an open, approved, in-stock menu there.
    if city and included:
        other_filters = {key: value for key, value in filters.items() if key != "city"}
        elsewhere = match_craving(eligible_items(other_filters), query).exclude(city_query(city, "restaurant__city"))
        cities = list(elsewhere.order_by("restaurant__city").values_list("restaurant__city", flat=True).distinct()[:3])
        if cities:
            actions = [{"kind": "browse_city", "label": f"Browse {place} menu", "city": place, "message": query} for place in cities]
            return {"reply": f"I found {food} in {', '.join(cities)}, but you’re browsing {city}. Want to look at those menus? Browsing another city won’t change your delivery address or confirm delivery to it.", "actions": actions, "links": [], "no_match_reason": "city"}

    # A useful price explanation still respects city, dietary tags, stock,
    # opening hours and required paid choices. Do not raise the budget ourselves.
    if filters.get("budget") and included:
        without_budget = {key: value for key, value in filters.items() if key != "budget"}
        options = list(match_craving(eligible_items(without_budget), query).order_by("price", "id")[:100])
        prices = [minimum_item_price(item) for item in options]
        prices = [price for price in prices if price is not None]
        if prices:
            return {"reply": f"The available {food} options{where} start at ₹{min(prices):g} per dish, before extras and delivery. Your current budget is ₹{filters['budget']:g}. Try a higher budget or a different dish.", "actions": [], "links": [{"label": "Review saved preferences", "to": "/for-you?tab=taste"}], "no_match_reason": "budget"}

    restrictions = list(filters.get("dietary_tags", []))
    if filters.get("non_vegetarian"):
        restrictions.append("non-vegetarian")
    if filters.get("vegetarian") and not restrictions:
        restrictions.append("vegetarian")
    qualifier = f" with your {' / '.join(restrictions)} preference" if restrictions else ""
    reply = f"I couldn’t find {food} on the currently available menus{where}{qualifier}."
    if restrictions:
        links.append({"label": "Review dietary preferences", "to": "/for-you?tab=taste"})

    # Alternatives are invitations, not matches. The user must choose one before
    # it becomes their new request. Keep all existing location/diet/budget limits.
    available = eligible_items(filters)
    if any("chicken" in term for term in included):
        available = available.filter(name__icontains="chicken")
    alternatives = list(available.order_by("-is_bestseller", "id")[:2])
    if alternatives:
        reply += " You could try " + " or ".join(item.name for item in alternatives) + " instead."
        actions = [{"kind": "try_message", "label": f"Find {item.name}", "message": f"Show me {item.name} instead"} for item in alternatives]
    else:
        reply += " You can check the restaurants or review your preferences."
        links.append({"label": "Browse restaurants", "to": "/search"})
    return {"reply": reply, "actions": actions, "links": links, "no_match_reason": "current_menu"}
