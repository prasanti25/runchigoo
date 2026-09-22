import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingScreen from "../components/common/LoadingScreen.jsx";
import CouponSavings from "../components/product/CouponSavings.jsx";
import AddressForm from "../components/product/AddressForm.jsx";
import {
  ArrowRight,
  Check,
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import {
  AddButton,
  EmptyState,
  ErrorNotice,
  FoodImage,
  VegMark,
} from "../components/product/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import {
  money,
  saveDeliveryLocation,
  useDeliveryLocation,
  useRemote,
} from "../lib/product.js";
import { deliveryLocationFromAddress } from "../lib/addressLocation.js";
import { apiRequest } from "../lib/api.js";
import { payForOrder } from "../lib/payments.js";

export function Bill({ children, quote, checking = false, checkout = false }) {
  const { itemTotal, discount: cartDiscount, cartItems } = useCart();
  const discount = quote ? Number(quote.discount) : cartDiscount;
  return (
    <aside className="panel sticky-summary">
      <h2>Bill details</h2>
      <div className="bill-line">
        <span>Items ({cartItems.reduce((n, i) => n + i.quantity, 0)})</span>
        <span>{money(quote?.subtotal ?? itemTotal)}</span>
      </div>
      <div className="bill-line">
        <span>Delivery fee</span>
        <span>
          {quote
            ? Number(quote.delivery_fee)
              ? money(quote.delivery_fee)
              : "FREE"
            : checking
              ? "Checking…"
              : "At checkout"}
        </span>
      </div>
      {discount > 0 && (
        <div className="bill-line">
          <span>Coupon saving</span>
          <span>−{money(discount)}</span>
        </div>
      )}
      <div className="bill-line bill-total">
        <span>{checkout ? "To pay" : "Food subtotal"}</span>
        <span>
          {quote
            ? money(quote.total)
            : checkout
              ? "—"
              : money(itemTotal - discount)}
        </span>
      </div>
      {discount > 0 && (
        <p className="saving-line">
          A little extra joy. You saved {money(discount)}!
        </p>
      )}
      {children}
      <div className="flex-row mt-5">
        <ShieldCheck size={18} style={{ color: "#84956c" }} />
        <p className="form-help" style={{ margin: 0 }}>
          {quote
            ? "Delivery checked for your selected address. No unlisted charges."
            : "Delivery availability and the final bill are checked at checkout."}
        </p>
      </div>
    </aside>
  );
}

export function CartPage() {
  const { cartItems, loading, removeFromCart } = useCart();
  const [removing, setRemoving] = useState(null);
  const remove = async (id) => {
    setRemoving(id);
    try {
      await removeFromCart(id);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRemoving(null);
    }
  };
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className="container">
          <div className="page-heading">
            <p className="eyebrow">GOOD CHOICES. GREAT MEAL.</p>
            <h1>Your bag of happiness.</h1>
          </div>
          {loading && !cartItems.length ? (
            <LoadingScreen inline message="Getting your bag ready…" />
          ) : !cartItems.length ? (
            <EmptyState
              title="Your next meal starts here"
              description="Find something delicious and we’ll keep it here for you."
              to="/search"
            />
          ) : (
            <div className="two-column">
              <div>
                <section className="panel">
                  <div className="flex-row between">
                    <div>
                      <p className="eyebrow">FROM THE KITCHEN OF</p>
                      <h2>{cartItems[0]?.restaurant}</h2>
                    </div>
                    <Link
                      className="text-link"
                      to={`/restaurant/${cartItems[0]?.restaurantId}`}
                    >
                      Add more
                      <Plus size={15} />
                    </Link>
                  </div>
                  {cartItems.map((item) => (
                    <article key={item.id} className="list-row">
                      <FoodImage item={{ ...item, id: item.menuItemId }} />
                      <div className="grow">
                        <VegMark veg={item.isVeg} />
                        <h3>{item.name}</h3>
                        <p className="muted">{money(item.price)} each</p>
                        {item.addOns?.length > 0 && (
                          <p className="cart-addons">
                            {item.addOns
                              .map(
                                (row) =>
                                  `${row.name}${row.is_available === false ? " (unavailable — remove and choose again)" : ""}`,
                              )
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                      <div>
                        <AddButton
                          item={{
                            ...item,
                            id: item.menuItemId,
                            cartItemId: item.id,
                          }}
                        />
                        <p className="text-sm text-right mt-2">
                          {money(item.price * item.quantity)}
                        </p>
                      </div>
                      <button
                        className="icon-button"
                        aria-label={`Remove ${item.name}`}
                        disabled={removing === item.id}
                        onClick={() => remove(item.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </article>
                  ))}
                </section>
                <CouponSavings />
              </div>
              <Bill>
                <Link className="btn primary w-full mt-6" to="/checkout">
                  Continue to checkout
                  <ArrowRight size={17} />
                </Link>
              </Bill>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export { default as AddressForm } from "../components/product/AddressForm.jsx";

export function CheckoutPage() {
  const { token, user } = useAuth();
  const deliveryLocation = useDeliveryLocation();
  const { cartItems, couponCode, loadCart } = useCart();
  const navigate = useNavigate();
  const addresses = useRemote("/addresses/", token);
  const paymentOptions = useRemote("/online-payments/", token);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");
  const [contactless, setContactless] = useState(false);
  const [addAddress, setAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const key = useRef(crypto.randomUUID());
  const list = addresses.data?.results || [];
  const addressId =
    list.find((a) => a.id === deliveryLocation.address_id)?.id ||
    list.find((a) => a.is_default)?.id ||
    list[0]?.id;
  const [quoteState, setQuoteState] = useState({});
  const [quoteVersion, setQuoteVersion] = useState(0);
  const quoteKey = JSON.stringify({
    address: list.find((row) => row.id === addressId),
    items: cartItems,
    couponCode,
    quoteVersion,
  });
  useEffect(() => {
    if (!addressId || !cartItems.length) return;
    const controller = new AbortController();
    apiRequest("/cart/quote/", {
      token,
      method: "POST",
      signal: controller.signal,
      body: { address_id: addressId, coupon_code: couponCode },
    })
      .then((data) => setQuoteState({ key: quoteKey, data }))
      .catch((err) => {
        if (err.name !== "AbortError")
          setQuoteState({ key: quoteKey, error: err.message });
      });
    return () => controller.abort();
  }, [addressId, cartItems.length, couponCode, quoteKey, token]);
  const quote = quoteState.key === quoteKey ? quoteState.data : null;
  const quoteError = quoteState.key === quoteKey ? quoteState.error : "";
  const checkingQuote = Boolean(addressId && !quote && !quoteError);
  const place = async () => {
    if (!addressId) {
      setError("Choose a delivery address first.");
      return;
    }
    if (!quote) return;
    setBusy(true);
    setError("");
    try {
      const order = await apiRequest("/cart/checkout/", {
        token,
        method: "POST",
        body: {
          address_id: addressId,
          coupon_code: couponCode,
          payment_method: paymentMethod,
          notes: `${contactless ? "Contactless delivery requested. " : ""}${notes}`,
          checkout_key: key.current,
          quote_token: quote.quote_token,
        },
      });
      if (order.status === "awaiting_payment") {
        try {
          await payForOrder(order, {
            token,
            keyId: paymentOptions.data?.key_id,
            user,
          });
          toast.success("Payment confirmed. Your order is with the kitchen!");
        } catch (paymentError) {
          toast.error(paymentError.message);
        }
      } else toast.success("Your order is on its way to the kitchen!");
      await loadCart();
      navigate(`/tracking/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      if (err.data?.quote_token) setQuoteVersion((value) => value + 1);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className="container">
          <div className="page-heading">
            <div className="checkout-steps">
              <Link to="/cart">YOUR BAG</Link>
              <ArrowRight size={12} />
              <span className="active">CHECKOUT</span>
              <ArrowRight size={12} />
              <span>ENJOY YOUR MEAL</span>
            </div>
            <h1>One step closer to delicious.</h1>
          </div>
          {!cartItems.length && !busy ? (
            <EmptyState
              title="Your bag is empty"
              description="Add a meal before checking out."
              to="/search"
            />
          ) : (
            <div className="two-column">
              <div>
                <section className="panel">
                  <div className="flex-row between">
                    <h2>
                      <MapPin size={20} className="inline mr-2" />
                      Delivery address
                    </h2>
                    <button
                      className="text-link"
                      onClick={() => setAddAddress(true)}
                    >
                      <Plus size={16} />
                      Add new
                    </button>
                  </div>
                  <ErrorNotice
                    error={addresses.error}
                    onRetry={addresses.reload}
                  />
                  {addresses.loading && (
                    <LoadingScreen inline message="Loading your addresses…" />
                  )}
                  {list.map((address) => (
                    <div key={address.id}>
                      <label
                        className={`address-option ${addressId === address.id ? "selected" : ""}`}
                        key={address.id}
                      >
                        <span>
                          <input
                            type="radio"
                            name="delivery-address"
                            checked={addressId === address.id}
                            onChange={() => {
                              saveDeliveryLocation(
                                deliveryLocationFromAddress(address),
                              );
                            }}
                          />
                          {address.label}
                          {address.is_default && (
                            <span className="tiny muted">DEFAULT</span>
                          )}
                        </span>
                        <p>
                          {[
                            address.line1,
                            address.line2,
                            address.city,
                            address.state,
                            address.postal_code,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </label>
                      <button
                        className="text-link"
                        onClick={() => setEditingAddress(address)}
                      >
                        Edit {address.label.toLowerCase()} address
                        {address.latitude == null ? " / add pin" : ""}
                      </button>
                    </div>
                  ))}
                  {!addresses.loading && !list.length && (
                    <button
                      className="btn secondary w-full mt-5"
                      onClick={() => setAddAddress(true)}
                    >
                      Add your first delivery address
                    </button>
                  )}
                </section>
                <section className="panel">
                  <h2>Make it your kind of delivery</h2>
                  <label className="field mt-5">
                    <span>Instructions for your delivery partner</span>
                    <textarea
                      maxLength={850}
                      placeholder="Gate number, doorbell, directions…"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </label>
                  <label className="check-label mt-5">
                    <input
                      type="checkbox"
                      checked={contactless}
                      onChange={(event) => setContactless(event.target.checked)}
                    />
                    Leave at the door — contactless delivery
                  </label>
                </section>
                <section className="panel">
                  <h2>Payment method</h2>
                  <label
                    className={`address-option ${paymentMethod === "cod" ? "selected" : ""}`}
                  >
                    <span>
                      <input
                        type="radio"
                        name="payment-method"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                      Cash on delivery
                    </span>
                    <p>Pay your delivery partner when your meal arrives.</p>
                  </label>
                  {paymentOptions.data?.online_available && (
                    <label
                      className={`address-option ${paymentMethod === "razorpay" ? "selected" : ""}`}
                    >
                      <span>
                        <input
                          type="radio"
                          name="payment-method"
                          checked={paymentMethod === "razorpay"}
                          onChange={() => setPaymentMethod("razorpay")}
                        />
                        UPI, cards & net banking
                      </span>
                      <p>Pay securely through Razorpay.</p>
                    </label>
                  )}
                </section>
                <CouponSavings addressId={addressId} />
                <ErrorNotice error={error} />
              </div>
              <Bill quote={quote} checking={checkingQuote} checkout>
                <div className="checkout-serviceability" aria-live="polite">
                  {checkingQuote && (
                    <p className="muted">Checking delivery to your address…</p>
                  )}
                  {quote && (
                    <p>
                      <Check size={16} /> Delivery available
                      {quote.zone ? ` · ${quote.zone}` : ""}
                    </p>
                  )}
                  <ErrorNotice
                    error={quoteError}
                    onRetry={() => setQuoteVersion((value) => value + 1)}
                  />
                </div>
                <button
                  className="btn primary w-full mt-6"
                  disabled={busy || !addressId || !quote}
                  onClick={place}
                >
                  {busy ? "Placing your order…" : "Place order"}
                  <ArrowRight size={17} />
                </button>
                <p className="form-help">
                  {quote?.cancellation_policy?.cutoff === "preparation"
                    ? "Cancellation closes when cooking starts."
                    : "Cancellation closes when the restaurant accepts."}{" "}
                  {quote?.cancellation_policy?.allow_prepaid_refunds
                    ? "Eligible prepaid cancellations receive a full refund to the original payment method."
                    : "Prepaid cancellations require support review."}
                </p>
              </Bill>
            </div>
          )}
        </div>
      </main>
      {addAddress && (
        <AddressForm
          onClose={() => setAddAddress(false)}
          onSaved={() => {
            addresses.reload();
          }}
        />
      )}
      {editingAddress && (
        <AddressForm
          initial={editingAddress}
          onClose={() => setEditingAddress(null)}
          onSaved={() => addresses.reload()}
        />
      )}
    </>
  );
}
