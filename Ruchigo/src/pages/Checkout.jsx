import Navbar from "../components/Navbar.jsx";
import {
  MapPin,
  Plus,
  Home,
  BriefcaseBusiness,
  Check,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { apiRequest } from "../lib/api.js";

export default function Checkout() {
  const {
    cartItems,
    itemTotal,
    deliveryFee,
    platformFee,
    discount,
    total,
  } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [instructions, setInstructions] =
    useState("");

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    apiRequest("/addresses/", { token })
      .then((data) => {
        const results = data.results || data;
        setAddresses(results);
        setSelectedAddress(results.find((address) => address.is_default)?.id || results[0]?.id || null);
      })
      .catch((error) => toast.error(error.message));
  }, [isAuthenticated, token]);

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error("Add and select a delivery address before placing your order.");
      navigate("/addresses");
      return;
    }
    setPlacingOrder(true);
    try {
      await apiRequest("/cart/checkout/", { token, method: "POST", body: { address_id: selectedAddress, payment_method: "cod", notes: instructions } });
      toast.success("Order placed successfully.");
      navigate("/orders", { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isAuthenticated) {
    toast.error("Please login to continue.");
    navigate("/login", { state: { from: { pathname: location.pathname } }, replace: true });
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">
        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-8">

            <p className="font-semibold text-orange-500">
              Almost there
            </p>

            <h1 className="mt-2 text-4xl font-bold text-gray-900">
              Checkout
            </h1>

            <p className="mt-3 text-gray-500">
              Confirm your delivery details and review your order.
            </p>

          </div>

          {/* Progress */}

          <div className="mb-10 flex items-center rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">

            <div className="flex flex-1 items-center">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                <Check size={19} />
              </div>

              <div className="ml-3">
                <p className="text-xs text-gray-400">
                  STEP 1
                </p>

                <p className="font-semibold text-gray-900">
                  Cart
                </p>
              </div>

            </div>

            <div className="h-[2px] flex-1 bg-orange-200" />

            <div className="flex flex-1 items-center justify-center">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                2
              </div>

              <div className="ml-3">
                <p className="text-xs text-orange-500">
                  STEP 2
                </p>

                <p className="font-semibold text-gray-900">
                  Checkout
                </p>
              </div>

            </div>

            <div className="h-[2px] flex-1 bg-gray-200" />

            <div className="flex flex-1 items-center justify-end">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-400">
                3
              </div>

              <div className="ml-3">
                <p className="text-xs text-gray-400">
                  STEP 3
                </p>

                <p className="font-semibold text-gray-500">
                  Payment
                </p>
              </div>

            </div>

          </div>

          <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">

            {/* Left Side */}

            <section className="space-y-7">
                            {/* Delivery Address */}

              <div className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                      Delivery Address
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Select where you want your food delivered.
                    </p>

                  </div>

                  <button onClick={() => navigate("/addresses")} className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 font-semibold text-orange-500 transition hover:bg-orange-100">

                    <Plus size={18} />

                    Add Address

                  </button>

                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-2">

                  {addresses.map((address) => (

                    <div
                      key={address.id}
                      onClick={() => setSelectedAddress(address.id)}
                      className={`relative cursor-pointer rounded-2xl border p-5 transition ${
                        selectedAddress === address.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >

                      {selectedAddress === address.id && (

                        <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">

                          <Check size={14} />

                        </div>

                      )}

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">

                        {address.label === "Home" ? (
                          <Home size={20} />
                        ) : (
                          <BriefcaseBusiness size={20} />
                        )}

                      </div>

                      <h3 className="mt-4 font-bold text-gray-900">
                        {address.label}
                      </h3>

                      <p className="mt-2 font-medium text-gray-700">
                        {address.line1}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {[address.line2, address.city, address.state, address.postal_code].filter(Boolean).join(", ")}
                      </p>

                      <p className="mt-3 text-sm text-gray-500">
                        Delivery address
                      </p>

                    </div>

                  ))}

                </div>

              </div>

              {/* Delivery Instructions */}

              <div className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">

                <div className="flex items-center gap-3">

                  <MapPin className="text-orange-500" />

                  <h2 className="text-2xl font-bold text-gray-900">
                    Delivery Instructions
                  </h2>

                </div>

                <textarea
                  rows={4}
                  value={instructions}
                  onChange={(e) =>
                    setInstructions(e.target.value)
                  }
                  placeholder="Example: Call me when you arrive, leave the order at the door..."
                  className="mt-6 w-full resize-none rounded-2xl border border-gray-200 p-5 text-gray-700 outline-none transition focus:border-orange-500"
                />

              </div>

            </section>

            {/* Order Summary */}

            <aside>
                            <div className="sticky top-28 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">

                <div className="flex items-center gap-3">

                  <ShoppingBag className="text-orange-500" />

                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Summary
                  </h2>

                </div>

                <p className="mt-2 text-sm text-gray-500">
                  {cartItems.length} Item(s) in your order
                </p>

                <div className="mt-6 space-y-5">

                  {cartItems.length === 0 ? (

                    <div className="py-8 text-center text-gray-500">
                      Your cart is empty.
                    </div>

                  ) : (

                    cartItems.map((item) => (

                      <div
                        key={item.id}
                        className="flex items-center gap-4"
                      >

                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-orange-100 text-3xl">
                          {item.image}
                        </div>

                        <div className="flex-1">

                          <p className="font-semibold text-gray-900">
                            {item.name}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {item.restaurant}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Qty : {item.quantity}
                          </p>

                        </div>

                        <p className="font-bold">
                          ₹{item.price * item.quantity}
                        </p>

                      </div>

                    ))

                  )}

                </div>

                <div className="my-6 border-t border-dashed border-gray-200" />

                <div className="space-y-4 text-sm text-gray-600">

                  <div className="flex justify-between">
                    <span>Item Total</span>
                    <span>₹{itemTotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span>₹{platformFee}</span>
                  </div>

                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- ₹{discount}</span>
                  </div>

                </div>

                <div className="my-6 border-t border-gray-200" />

                <div className="flex items-center justify-between">

                  <span className="text-lg font-bold text-gray-900">
                    Total
                  </span>

                  <span className="text-3xl font-bold text-gray-900">
                    ₹{total}
                  </span>

                </div>

                {discount > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    🎉 You saved ₹{discount} on this order
                  </p>
                )}

                <div className="mt-6 rounded-2xl bg-orange-50 p-4">

                  <p className="text-sm font-semibold text-orange-600">
                    Delivery Address
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {(() => { const address = addresses.find((item) => item.id === selectedAddress); return address ? [address.line1, address.line2, address.city, address.state, address.postal_code].filter(Boolean).join(", ") : "Select a delivery address"; })()}
                  </p>

                </div>

                {cartItems.length > 0 ? (

                  <button
                    type="button"
                    onClick={placeOrder}
                    disabled={placingOrder || !selectedAddress}
                    className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-orange-600"
                  >
                    {placingOrder ? "Placing order..." : "Place cash-on-delivery order"}
                    <ArrowRight size={20} />
                  </button>

                ) : (

                  <Link
                    to="/"
                    className="mt-7 flex w-full items-center justify-center rounded-2xl border-2 border-orange-500 px-6 py-4 font-semibold text-orange-500 transition hover:bg-orange-50"
                  >
                    Continue Shopping
                  </Link>

                )}

              </div>

            </aside>

          </div>

        </section>

      </main>

    </>

  );

}
