import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  ChevronRight,
  Gift,
  LockKeyhole,
  Search,
  Tag,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { money, useRemote } from "../../lib/product.js";
import { couponTitle, couponBenefitTerms } from "../../lib/couponLabels.js";
import LoadingScreen from "../common/LoadingScreen.jsx";
import { ErrorNotice, Modal } from "./UI.jsx";
import "./CouponSavings.css";

function Progress({ current, target, label }) {
  const value = Math.min(
    100,
    Math.max(0, (Number(current) / Math.max(1, Number(target))) * 100),
  );
  return (
    <div
      className="savings-progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function CouponCard({ offer, selected, busy, onApply }) {
  return (
    <article
      className={`coupon-ticket ${offer.eligible ? "is-eligible" : "is-unavailable"}`}
      data-coupon={offer.code}
    >
      <div className="coupon-ticket-top">
        <span className="coupon-ticket-icon">
          <Tag size={21} strokeWidth={1.6} />
        </span>
        <div>
          <h3>{couponTitle(offer)}</h3>
          <p>{offer.restaurant_name || "On this restaurant’s menu"}</p>
        </div>
      </div>
      <div className="coupon-ticket-code">
        <strong>{offer.code}</strong>
        <button
          type="button"
          disabled={!offer.eligible || Boolean(busy) || selected}
          onClick={() => onApply(offer.code)}
          aria-label={`Apply ${offer.code}`}
        >
          {selected ? (
            <>
              <Check size={14} />
              Applied
            </>
          ) : busy === offer.code ? (
            "Applying…"
          ) : offer.eligible ? (
            "Apply"
          ) : (
            <>
              <LockKeyhole size={13} />
              Unavailable
            </>
          )}
        </button>
      </div>
      <p
        className={`coupon-ticket-reason ${offer.eligible ? "is-saving" : ""}`}
      >
        {offer.eligible
          ? `Save ${money(offer.discount)} on this bag`
          : offer.reason}
      </p>
      {offer.status === "minimum_spend" && (
        <p className="coupon-unlock-value">
          Unlock {money(offer.unlock_discount)} off at{" "}
          {money(offer.min_order_amount)} in food.
        </p>
      )}
      <details className="coupon-terms">
        <summary>Offer details</summary>
        <div>
          {offer.description && <p>{offer.description}</p>}
          <p>{couponBenefitTerms(offer)}</p>
          {offer.bogo_item && (
            <Link to={`/food-details/${offer.bogo_item}`} className="text-link">
              View {offer.bogo_item_name || "offer dish"}
            </Link>
          )}
          <ul>
            <li>
              Minimum food subtotal: {money(offer.min_order_amount)}. Add-ons
              count; delivery does not.
            </li>
            {offer.max_discount && (
              <li>Maximum discount: {money(offer.max_discount)}.</li>
            )}
            {offer.first_order_only && (
              <li>For your first non-cancelled order only.</li>
            )}
            {offer.per_user_limit && (
              <li>
                Up to {offer.per_user_limit} redemption
                {offer.per_user_limit === 1 ? "" : "s"} per customer.
              </li>
            )}
            {offer.status === "upcoming" && (
              <li>
                Starts{" "}
                {new Date(offer.starts_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                .
              </li>
            )}
            <li>
              Expires{" "}
              {new Date(offer.ends_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              .
            </li>
            <li>
              One coupon per order. Eligibility and the final saving are checked
              again at checkout.
            </li>
          </ul>
        </div>
      </details>
    </article>
  );
}

export default function CouponSavings({ addressId = null }) {
  const { token } = useAuth();
  const {
    cartItems,
    couponCode,
    couponSaving: discount,
    couponBenefit,
    couponChecking,
    applyCoupon,
    clearCoupon,
  } = useCart();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [celebration, setCelebration] = useState(null);
  const trigger = useRef(null);
  const bag = JSON.stringify(
    cartItems.map(({ id, quantity, price, addOns }) => [
      id,
      quantity,
      price,
      addOns,
    ]),
  );
  const bagVersion = Array.from(bag).reduce(
    (hash, letter) => ((hash * 31) ^ letter.charCodeAt(0)) >>> 0,
    0,
  );
  const params = new URLSearchParams({
    q: search,
    page: String(page),
    bag: String(bagVersion),
  });
  if (addressId) params.set("address_id", String(addressId));
  const savings = useRemote(
    cartItems.length ? `/cart/savings/?${params}` : null,
    token,
  );
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(input.trim());
      setPage(1);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [input]);
  const data = savings.data;
  const rows = data?.results || [];
  const eligible = rows.filter((row) => row.eligible);
  const unavailable = rows.filter((row) => !row.eligible);
  const delivery = data?.delivery;
  const deliveryWaived = Boolean(
    couponCode && !couponChecking && couponBenefit === "free_delivery",
  );
  const next = data?.next_coupon;
  const menu = `/restaurant/${cartItems[0]?.restaurantId}`;
  const close = () => {
    if (!busy) {
      setOpen(false);
      setInput("");
      setSearch("");
      setPage(1);
      setError("");
    }
  };
  const apply = async (code) => {
    if (busy || !code.trim()) return;
    setBusy(code.trim());
    setError("");
    try {
      const applied = await applyCoupon(code.trim());
      setOpen(false);
      setInput("");
      setSearch("");
      setPage(1);
      setCelebration({ code: applied.code, discount: applied.discount, bag });
      savings.reload();
    } catch (err) {
      setError(err.message);
      savings.reload();
    } finally {
      setBusy("");
    }
  };
  const celebrate =
    celebration && celebration.bag === bag && celebration.code === couponCode;
  return (
    <>
      <section className="savings-panel" aria-label="Offers and savings">
        <div className="savings-panel-heading">
          <span>
            <Tag size={18} />
            <h2>Offers & savings</h2>
          </span>
          <small>Made for your bag</small>
        </div>
        <div className={`savings-entry ${couponCode ? "has-coupon" : ""}`}>
          <span className="savings-entry-icon">
            {couponCode ? <Check size={20} /> : <Gift size={21} />}
          </span>
          <button
            type="button"
            ref={trigger}
            className="savings-entry-copy"
            onClick={() => {
              setOpen(true);
              savings.reload();
            }}
          >
            <strong>
              {couponCode
                ? `${couponCode} applied`
                : "Find a coupon for your meal"}
            </strong>
            <span>
              {couponChecking
                ? "Checking savings for your updated bag…"
                : couponCode
                  ? `You’re saving ${money(discount)}`
                  : "Browse offers or enter a code"}
            </span>
          </button>
          {couponCode ? (
            <button
              className="savings-remove"
              type="button"
              onClick={clearCoupon}
              aria-label={`Remove coupon ${couponCode}`}
            >
              <X size={17} />
            </button>
          ) : (
            <ChevronRight size={19} aria-hidden="true" />
          )}
        </div>
        {couponCode && (
          <button
            type="button"
            className="savings-change"
            onClick={() => {
              setOpen(true);
              savings.reload();
            }}
          >
            View other coupons <ArrowRight size={14} />
          </button>
        )}
        <ErrorNotice
          error={!open ? savings.error : ""}
          onRetry={savings.reload}
        />
        {delivery && (
          <div
            className={`savings-milestone ${deliveryWaived || delivery.status === "free" ? "is-complete" : ""}`}
          >
            <Bike size={22} strokeWidth={1.6} />
            <div>
              <strong>
                {deliveryWaived
                  ? "Free delivery with your coupon"
                  : delivery.status === "free"
                    ? delivery.is_estimate
                      ? "Your food subtotal qualifies for free delivery"
                      : "Free delivery unlocked"
                    : delivery.status === "progress"
                      ? `Add ${money(delivery.remaining)} more for free delivery`
                      : delivery.status === "standard"
                        ? "Delivery checked at checkout"
                        : "Check your delivery address"}
              </strong>
              <p>
                {deliveryWaived
                  ? `${couponCode} waives the fee for this address. Final eligibility is checked at checkout.`
                  : delivery.reason ||
                    (delivery.is_estimate
                      ? `Based on your ${delivery.address_label.toLowerCase()} address. Confirmed at checkout.`
                      : "For your selected address, before coupon savings.")}
              </p>
              {!deliveryWaived && delivery.status === "progress" && (
                <Progress
                  current={data.subtotal}
                  target={delivery.threshold}
                  label="Progress towards free delivery"
                />
              )}
            </div>
            {(deliveryWaived || delivery.status === "free") && (
              <Check size={17} />
            )}
          </div>
        )}
        {next && (!couponCode || Number(next.unlock_discount) > discount) && (
          <div className="savings-milestone coupon-milestone">
            <Tag size={20} strokeWidth={1.6} />
            <div>
              <strong>
                Add {money(next.amount_to_unlock)} more to unlock{" "}
                {money(next.unlock_discount)} off
              </strong>
              <p>
                {next.code} · on {money(next.min_order_amount)} in food
                {couponCode ? " · replaces your current coupon" : ""}
              </p>
              <Progress
                current={data.subtotal}
                target={next.min_order_amount}
                label={`Progress towards ${next.code}`}
              />
            </div>
          </div>
        )}
        {(delivery?.status === "progress" || next) && (
          <Link className="savings-add-more" to={menu}>
            Add something from this kitchen <ArrowRight size={15} />
          </Link>
        )}
      </section>
      {open &&
        createPortal(
          <Modal
            title="Coupons for your meal"
            className="coupon-drawer"
            onClose={close}
          >
            <p className="coupon-drawer-intro">
              A little more to enjoy. Find the right saving for your bag.
            </p>
            <form
              className="coupon-search"
              onSubmit={(event) => {
                event.preventDefault();
                void apply(input);
              }}
            >
              <Search size={19} />
              <input
                autoComplete="off"
                spellCheck="false"
                maxLength={80}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Search offers or enter a code"
                aria-label="Search coupons or enter code"
              />
              {input && (
                <button
                  type="button"
                  className="coupon-search-clear"
                  aria-label="Clear coupon search"
                  onClick={() => setInput("")}
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="submit"
                disabled={
                  Boolean(busy) || !input.trim() || input.trim().length > 40
                }
              >
                Apply code
              </button>
            </form>
            <ErrorNotice
              error={error || savings.error}
              onRetry={savings.reload}
            />
            <div className="coupon-drawer-scroll">
              {savings.loading || search !== input.trim() ? (
                <LoadingScreen inline message="Finding savings for your bag…" />
              ) : (
                <>
                  {!!eligible.length && (
                    <section aria-label="Available coupons">
                      <div className="coupon-section-heading">
                        <Check size={15} />
                        <h3>Ready to apply</h3>
                        <span>{eligible.length}</span>
                      </div>
                      {eligible.map((row) => (
                        <CouponCard
                          key={row.id}
                          offer={row}
                          selected={couponCode === row.code}
                          busy={busy}
                          onApply={apply}
                        />
                      ))}
                    </section>
                  )}
                  {!!unavailable.length && (
                    <section aria-label="Unavailable coupons">
                      <div className="coupon-section-heading">
                        <LockKeyhole size={15} />
                        <h3>Not available for this bag</h3>
                        <span>{unavailable.length}</span>
                      </div>
                      {unavailable.map((row) => (
                        <CouponCard
                          key={row.id}
                          offer={row}
                          selected={false}
                          busy={busy}
                          onApply={apply}
                        />
                      ))}
                    </section>
                  )}
                  {!rows.length && !savings.error && (
                    <div className="coupon-empty">
                      <Tag size={32} strokeWidth={1.3} />
                      <h3>
                        {search
                          ? "No matching coupons"
                          : "No coupons for this bag yet"}
                      </h3>
                      <p>
                        {search
                          ? "Try another code or search term. You can still check an exact code above."
                          : "You can still enjoy your meal. We’ll show current offers here when they’re available."}
                      </p>
                      {search && (
                        <button type="button" onClick={() => setInput("")}>
                          Show all coupons
                        </button>
                      )}
                    </div>
                  )}
                  {(data?.previous || data?.next) && (
                    <div className="coupon-pagination">
                      <button
                        type="button"
                        disabled={!data.previous}
                        onClick={() => setPage((value) => value - 1)}
                      >
                        <ArrowLeft size={15} />
                        Previous
                      </button>
                      <span>Page {page}</span>
                      <button
                        type="button"
                        disabled={!data.next}
                        onClick={() => setPage((value) => value + 1)}
                      >
                        Next
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <p className="coupon-drawer-footer">
              One coupon per order. Free-delivery eligibility is checked
              separately.
            </p>
          </Modal>,
          document.body,
        )}
      {celebrate &&
        createPortal(
          <Modal
            title="A little win for your meal"
            className="coupon-celebration"
            onClose={() => {
              setCelebration(null);
              trigger.current?.focus();
            }}
          >
            <div className="coupon-burst" aria-hidden="true">
              {Array.from({ length: 20 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    "--x": `${Math.cos((i * Math.PI) / 10) * (95 + (i % 3) * 20)}px`,
                    "--y": `${Math.sin((i * Math.PI) / 10) * (95 + (i % 3) * 20)}px`,
                    "--spin": `${i * 47}deg`,
                    "--delay": `${(i % 4) * 25}ms`,
                  }}
                />
              ))}
              <span>
                <Check size={38} strokeWidth={2.6} />
              </span>
            </div>
            <p className="coupon-celebration-eyebrow">COUPON APPLIED</p>
            <h3>You saved {money(celebration.discount)}!</h3>
            <p>
              {celebration.code} is on your bag.
              <br />
              Good food tastes even better with a little saving.
            </p>
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                setCelebration(null);
                trigger.current?.focus();
              }}
            >
              Nice, continue <ArrowRight size={16} />
            </button>
            <small>Your final bill is checked at checkout.</small>
          </Modal>,
          document.body,
        )}
    </>
  );
}
