import { money } from "./product.js";

export function couponTitle(coupon) {
  if (coupon.benefit_type === "free_delivery") return "Free delivery";
  if (coupon.benefit_type === "bogo") return "Buy one, get one free";
  if (Number(coupon.discount_amount) > 0)
    return `${money(Math.min(Number(coupon.discount_amount), Number(coupon.max_discount) || Infinity))} off your meal`;
  return `${Number(coupon.discount_percent)}% off${coupon.max_discount ? ` up to ${money(coupon.max_discount)}` : " your meal"}`;
}

export function couponBenefitTerms(coupon) {
  if (coupon.benefit_type === "free_delivery")
    return "Waives the delivery fee for a serviceable address. Food and any cash tip remain payable. Not needed when delivery is already free.";
  if (coupon.benefit_type === "bogo")
    return `Add two portions of ${coupon.bogo_item_name || "the selected dish"} for each free base portion, up to ${coupon.max_free_items || 1} per order. All extras and upgrades are charged. Both portions must be in your bag.`;
  return "Savings cannot exceed the food subtotal. Delivery and any cash tip are excluded.";
}
