"""Retain explicit conversation constraints even when interpretation times out.

Gemini handles unfamiliar phrasing. Named foods, dietary restrictions and budgets
from the customer's own turns cannot be replaced by a broader generated query.
This is request-scoped; it does not edit a saved taste profile or place an order.
"""
import re
from .recommendations import craving_terms, diet_constraint, explicit_budget


def relevant_clause(text):
    # A complaint about a wrong result is not a request for that wrong dish.
    parts = re.split(r"\b(?:i (?:said|asked for|meant)|actually i want|instead i want)\b", text, flags=re.I)
    return parts[-1].strip() if len(parts) > 1 and parts[-1].strip() else text


def conversation_query(history, message, interpreted_query=None):
    foods, exclusions, diet, budget, tags = [], [], None, None, []
    food_join = " "
    current = relevant_clause(message)
    included_now, excluded_now = craving_terms(current)
    is_refinement = bool(diet_constraint(current) or explicit_budget(current) or excluded_now or re.search(r"\b(?:vegan|jain|same|more options|cheaper|those|these)\b", current, re.I))
    # Do not interpret arbitrary gibberish as a request to repeat the last meal.
    if not included_now and not is_refinement:
        return interpreted_query or message
    for raw in [*history, message]:
        text = relevant_clause(raw)
        included, excluded = craving_terms(text)
        if included:
            foods = included
            food_join = " or " if re.search(r"\bor\b", text, re.I) else " "
            exclusions = [term for term in exclusions if term not in included]
        exclusions = list(dict.fromkeys([*exclusions, *excluded]))
        foods = [term for term in foods if term not in excluded]
        choice = diet_constraint(text)
        if choice:
            diet = choice
        amount = explicit_budget(text)
        if amount:
            budget = amount
        for tag in ("vegan", "jain"):
            if re.search(rf"\b{tag}\b", text, re.I):
                if re.search(rf"\b(?:not|no|without)\s+{tag}\b", text, re.I):
                    tags = [existing for existing in tags if existing != tag]
                elif tag not in tags:
                    tags.append(tag)
    if not foods and interpreted_query:
        foods = craving_terms(interpreted_query)[0]
    # For an unknown dish, keep its text instead of silently replacing it with
    # the whole menu. Gemini's ranking layer can then abstain or ask a question.
    base = food_join.join(foods) if foods else (interpreted_query or current)
    qualifiers = []
    if diet in ("vegetarian", "non_vegetarian"):
        qualifiers.append("non-vegetarian" if diet == "non_vegetarian" else "vegetarian")
    qualifiers.extend(tags)
    if budget:
        qualifiers.append(f"under {budget:g}")
    qualifiers.extend(f"without {term}" for term in exclusions)
    return " ".join([base, *qualifiers])[:200]
