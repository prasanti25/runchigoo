import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Clock3,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { money } from "../../lib/product.js";
import LoadingScreen from "../common/LoadingScreen.jsx";
import {
  getFoodFallback,
  getRestaurantFallback,
  optimizedFoodSource,
} from "../../lib/images.js";

export function FoodImage({
  item,
  className = "",
  eager = false,
  restaurant = false,
}) {
  const source = optimizedFoodSource(item);
  const matchingFallback = restaurant
    ? getRestaurantFallback(item)
    : getFoodFallback(item);
  return (
    <img
      className={className}
      src={source || matchingFallback}
      onError={(event) => {
        const suggested = matchingFallback;
        const fallback = event.currentTarget.src.endsWith(suggested)
          ? "/food/photo-unavailable.svg"
          : suggested;
        if (!event.currentTarget.src.endsWith(fallback)) {
          event.currentTarget.src = fallback;
          event.currentTarget.alt = `${item.name || "Food"} — illustrative photo`;
        }
      }}
      alt={`${item.name || "Food"}${source ? "" : " — illustrative photo"}`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
export function VegMark({ veg }) {
  return (
    <span
      className={`veg-mark ${veg ? "is-veg" : "is-nonveg"}`}
      aria-label={veg ? "Vegetarian" : "Non vegetarian"}
    >
      <i />
    </span>
  );
}
export function Rating({ value }) {
  return Number(value) > 0 ? (
    <span className="rating">
      <Star size={12} fill="currentColor" />
      {Number(value).toFixed(1)}
    </span>
  ) : (
    <span className="new-label">New</span>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  description,
  to,
  action = "View all",
}) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="muted">{description}</p>}
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {action}
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function EmptyState({
  title = "Nothing here yet",
  description,
  to,
  action = "Explore food",
  onRetry,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Search size={28} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {to && (
        <Link className="btn primary" to={to}>
          {action}
          <ArrowRight size={17} />
        </Link>
      )}
      {onRetry && (
        <button className="btn secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function Skeleton({ message = "Getting things ready…" }) {
  return <LoadingScreen inline message={message} />;
}
export function ErrorNotice({ error, onRetry }) {
  return error ? (
    <div className="error-notice" role="alert">
      <p>{error}</p>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  ) : null;
}

export function AddButton({ item }) {
  const unavailable =
    item.is_available === false ||
    item.orderable === false ||
    item.stock_quantity === 0 ||
    item.restaurant_detail?.accepting_orders === false;
  const { isAuthenticated, role } = useAuth();
  const { cartItems, addToCart, increaseQuantity, decreaseQuantity } =
    useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [customizing, setCustomizing] = useState(
    () =>
      new URLSearchParams(location.search).get("customise") === String(item.id),
  );
  const closeCustomization = () => {
    setCustomizing(false);
    const params = new URLSearchParams(location.search);
    if (params.get("customise") === String(item.id)) {
      for (const key of ["customise", "extra", "quantity"]) params.delete(key);
      navigate(
        {
          pathname: location.pathname,
          search: params.toString(),
          hash: location.hash,
        },
        { replace: true },
      );
    }
  };
  const cartItem = cartItems.find((i) =>
    item.cartItemId
      ? i.id === item.cartItemId
      : Number(i.menuItemId) === Number(item.id) && !i.addOns?.length,
  );
  const change = async (direction) => {
    // Guests can inspect restaurant extras and prices before signing in.
    if (item.add_ons?.length && !item.cartItemId) {
      setCustomizing(true);
      return;
    }
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: location.pathname } } });
      return;
    }
    if (role !== "customer") {
      toast.error("Sign in as a customer to order food.");
      return;
    }
    setBusy(true);
    try {
      if (!cartItem) await addToCart(item);
      else if (direction > 0) await increaseQuantity(cartItem.id);
      else await decreaseQuantity(cartItem.id);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };
  if (item.add_ons?.length && !item.cartItemId)
    return (
      <>
        <button
          className="add-button"
          aria-haspopup="dialog"
          aria-expanded={customizing}
          disabled={unavailable}
          onClick={() => change(1)}
        >
          ADD <Plus size={15} />
        </button>
        <button
          type="button"
          className="customize-button"
          aria-label={`Customise ${item.name}: ${item.add_ons.length} add-ons`}
          aria-haspopup="dialog"
          aria-expanded={customizing}
          disabled={unavailable}
          onClick={() => change(1)}
        >
          <span>Customise</span>
          <span>
            {item.add_ons.length} add-ons <ArrowRight size={12} />
          </span>
        </button>
        {customizing &&
          createPortal(
            <AddOnPicker item={item} onClose={closeCustomization} />,
            document.body,
          )}
      </>
    );
  return cartItem ? (
    <div className="quantity-control">
      <button
        disabled={busy}
        onClick={() => change(-1)}
        aria-label={`Remove one ${item.name}`}
      >
        <Minus size={15} />
      </button>
      <span aria-live="polite">{cartItem.quantity}</span>
      <button
        disabled={busy || unavailable || cartItem.quantity >= 99}
        onClick={() => change(1)}
        aria-label={`Add one ${item.name}`}
      >
        <Plus size={15} />
      </button>
    </div>
  ) : (
    <button
      className="add-button"
      disabled={busy || unavailable}
      onClick={() => change(1)}
    >
      {busy
        ? "Adding…"
        : item.stock_quantity === 0
          ? "Sold out"
          : item.restaurant_detail?.accepting_orders === false
            ? "Closed"
            : "ADD"}
      <Plus size={15} />
    </button>
  );
}

function AddOnPicker({ item, onClose }) {
  const { addToCart } = useCart();
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const restoring = params.get("customise") === String(item.id);
  const [selected, setSelected] = useState(() =>
    restoring
      ? item.add_ons
          .filter(
            (row) =>
              row.is_available && params.getAll("extra").includes(row.id),
          )
          .map((row) => row.id)
      : [],
  );
  const [quantity, setQuantity] = useState(() => {
    const restored = Number(params.get("quantity"));
    return restoring &&
      Number.isInteger(restored) &&
      restored >= 1 &&
      restored <= 99
      ? restored
      : 1;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const extrasPrice = (item.add_ons || [])
    .filter((row) => selected.includes(row.id))
    .reduce((sum, row) => sum + Number(row.price), 0);
  const total = (Number(item.price) + extrasPrice) * quantity;
  const extraOptions = item.add_ons.filter((row) => !row.group_id);
  const groups = [
    ...(item.option_groups || []),
    ...(extraOptions.length
      ? [{ id: "", name: "Make it a meal", min_select: 0, max_select: 12 }]
      : []),
  ];
  const countIn = (group) =>
    item.add_ons.filter(
      (row) => (row.group_id || "") === group.id && selected.includes(row.id),
    ).length;
  const complete = groups.every(
    (group) =>
      countIn(group) >= group.min_select && countIn(group) <= group.max_select,
  );
  return (
    <Modal
      title="Customise your meal"
      className="addon-modal"
      onClose={busy ? () => {} : onClose}
    >
      <form
        className="addon-picker"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!complete) {
            setError("Choose the required options before continuing.");
            return;
          }
          if (!isAuthenticated) {
            const returnParams = new URLSearchParams(location.search);
            returnParams.set("customise", String(item.id));
            returnParams.delete("extra");
            selected.forEach((id) => returnParams.append("extra", id));
            returnParams.set("quantity", String(quantity));
            navigate("/login", {
              state: {
                from: {
                  pathname: `${location.pathname}?${returnParams}${location.hash}`,
                },
              },
            });
            return;
          }
          if (role !== "customer") {
            setError("Sign in as a customer to order food.");
            return;
          }
          setBusy(true);
          setError("");
          try {
            if (await addToCart(item, quantity, selected)) {
              toast.success("Added to your cart");
              onClose();
            }
          } catch (err) {
            setError(err.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="addon-scroll-content">
          <div className="addon-dish">
            <FoodImage item={item} />
            <div>
              <span className="addon-kitchen">
                {item.restaurant_detail?.name}
              </span>
              <div className="addon-dish-title">
                <VegMark veg={item.is_vegetarian} />
                <h3>{item.name}</h3>
              </div>
              <strong>
                {money(item.price)} <span>base price</span>
              </strong>
            </div>
          </div>
          {groups.map((group) => (
            <fieldset className="addon-group" key={group.id}>
              <legend>{group.name}</legend>
              <div className="addon-group-meta">
                <span>
                  {group.min_select
                    ? `Required · choose ${group.min_select === group.max_select ? group.min_select : `${group.min_select}–${group.max_select}`}`
                    : group.id
                      ? `Optional · up to ${group.max_select}`
                      : "Optional · choose any"}
                </span>
                <span>{countIn(group)} selected</span>
              </div>
              <div className="addon-options">
                {item.add_ons
                  .filter((row) => (row.group_id || "") === group.id)
                  .map((row) => (
                    <label
                      className={`addon-option ${selected.includes(row.id) ? "selected" : ""} ${!row.is_available ? "unavailable" : ""}`}
                      key={row.id}
                    >
                      <span className="addon-option-copy">
                        <span>{row.name}</span>
                        <small>
                          {row.is_available
                            ? Number(row.price)
                              ? `+ ${money(row.price)}`
                              : "No extra charge"
                            : "Currently unavailable"}
                        </small>
                      </span>
                      <span className="addon-checkbox">
                        <input
                          aria-label={`${row.name}, ${Number(row.price) ? money(row.price) : "no extra charge"}${!row.is_available ? ", currently unavailable" : ""}`}
                          type={
                            group.min_select === 1 && group.max_select === 1
                              ? "radio"
                              : "checkbox"
                          }
                          name={`choice-${item.id}-${group.id || "extras"}`}
                          disabled={
                            !row.is_available ||
                            busy ||
                            (group.max_select > 1 &&
                              !selected.includes(row.id) &&
                              countIn(group) >= group.max_select)
                          }
                          checked={selected.includes(row.id)}
                          onChange={(event) =>
                            setSelected((current) =>
                              event.target.checked
                                ? [
                                    ...(group.max_select === 1
                                      ? current.filter(
                                          (id) =>
                                            !item.add_ons.some(
                                              (option) =>
                                                option.id === id &&
                                                (option.group_id || "") ===
                                                  group.id,
                                            ),
                                        )
                                      : current),
                                    row.id,
                                  ]
                                : current.filter((id) => id !== row.id),
                            )
                          }
                        />
                        <Check size={15} strokeWidth={3} aria-hidden="true" />
                      </span>
                    </label>
                  ))}
              </div>
            </fieldset>
          ))}
          <p className="addon-optional-note">
            {groups.some((group) => group.min_select)
              ? "Choose the required options. Extras are always up to you."
              : "Just the dish? Continue without selecting any extras."}
          </p>
        </div>
        <div className="addon-checkout">
          <ErrorNotice error={error} />
          <p className="addon-price-summary" aria-live="polite">
            <span>
              {selected.length
                ? `${selected.length} add-on${selected.length === 1 ? "" : "s"} selected`
                : "Your dish, just as it comes"}
            </span>
            <span>{money(Number(item.price) + extrasPrice)} each</span>
          </p>
          <div className="addon-checkout-actions">
            <div
              className="addon-quantity"
              role="group"
              aria-label="Dish quantity"
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={busy || quantity <= 1}
                onClick={() => setQuantity((current) => current - 1)}
              >
                <Minus size={17} />
              </button>
              <output aria-live="polite" aria-label="Quantity">
                {quantity}
              </output>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={
                  busy || quantity >= Math.min(99, item.stock_quantity ?? 99)
                }
                onClick={() => setQuantity((current) => current + 1)}
              >
                <Plus size={17} />
              </button>
            </div>
            <button
              className="addon-submit"
              disabled={
                busy ||
                !complete ||
                item.is_available === false ||
                item.stock_quantity === 0 ||
                item.restaurant_detail?.accepting_orders === false
              }
            >
              {busy ? (
                "Adding…"
              ) : (
                <>
                  <span>
                    {isAuthenticated
                      ? `Add ${quantity} item${quantity === 1 ? "" : "s"}`
                      : "Sign in to add"}
                  </span>
                  <span>·</span>
                  <strong>{money(total)}</strong>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function FoodCard({ item, reason }) {
  return (
    <article className="food-card">
      <Link to={`/food-details/${item.id}`} className="food-card-image">
        <FoodImage item={item} />
        {item.is_bestseller && <span className="image-badge">Bestseller</span>}
      </Link>
      <div className="food-card-body">
        <div className="flex-row between">
          <VegMark veg={item.is_vegetarian} />
          <span className="tiny muted">
            <Clock3 size={13} />
            {item.preparation_minutes} min prep
          </span>
        </div>
        <Link to={`/food-details/${item.id}`}>
          <h3>{item.name}</h3>
        </Link>
        <Link className="food-restaurant" to={`/restaurant/${item.restaurant}`}>
          {item.restaurant_detail?.name || item.category_name}
        </Link>
        {reason && <p className="recommendation-reason">{reason}</p>}
        <div className="flex-row between price-row">
          <strong>
            {item.option_groups?.length
              ? `From ${money(item.minimum_price ?? item.price)}`
              : money(item.price)}
          </strong>
          <Link
            className="add-button"
            to={`/restaurant/${item.restaurant}?dish=${item.id}`}
          >
            View menu <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="restaurant-card">
      <div className="restaurant-image">
        <FoodImage item={restaurant} restaurant />
        <div className="restaurant-image-shade" />
        {restaurant.from_price && (
          <span className="restaurant-price">
            Meals from {money(restaurant.from_price)}
          </span>
        )}
      </div>
      <div className="restaurant-card-body">
        <div className="flex-row between">
          <h3>{restaurant.name}</h3>
          <Rating value={restaurant.average_rating} />
        </div>
        <p>{restaurant.description || "Freshly prepared favourites"}</p>
        <div className="restaurant-meta">
          <span>{restaurant.city}</span>
          {restaurant.distance_km != null && (
            <span>{restaurant.distance_km.toFixed(1)} km away</span>
          )}
          {restaurant.prep_minutes && (
            <span>~{restaurant.prep_minutes} min prep</span>
          )}
        </div>
      </div>
    </Link>
  );
}
export function CartDock() {
  const { cartItems, itemTotal } = useCart();
  if (!cartItems.length) return null;
  return (
    <div className="cart-dock">
      <span>
        <ShoppingBag size={19} />
        <strong>
          {cartItems.reduce((n, i) => n + i.quantity, 0)} items ·{" "}
          {money(itemTotal)}
        </strong>
      </span>
      <Link to="/cart">
        View cart
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}

export function Modal({ title, onClose, children, className = "" }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key === "Tab") {
        const nodes = ref.current?.querySelectorAll(
          'button:not([disabled]), input, textarea, select, a[href], [tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        className={`modal-sheet ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="flex-row between">
          <h2>{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
