import { useState } from "react";
import Navbar from "../components/Navbar.jsx";

import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Gift,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

import toast from "react-hot-toast";
import { applyImageFallback, getFoodFallback, resolveFoodImage } from "../lib/images.js";

export default function Cart() {

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    itemTotal,
    deliveryFee,
    platformFee,
    discount,
    total,
    applyCoupon,
    clearCoupon,
    couponCode,
  } = useCart();

  const navigate = useNavigate();

  const location = useLocation();

  const { isAuthenticated } = useAuth();

  const [coupon, setCoupon] = useState(couponCode);

  const handleApplyCoupon = async () => {
    const normalizedCode = coupon.trim().toUpperCase();
    if (!normalizedCode) {
      toast.error("Enter a coupon code.");
      return;
    }
    try {
      await applyCoupon(normalizedCode);
      setCoupon(normalizedCode);
      toast.success("Coupon applied successfully.");
    } catch (error) {
      clearCoupon();
      toast.error(error.message);
    }
  };

  const runCartAction = async (action) => {
    try {
      await action();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCheckout = () => {

    if (!isAuthenticated) {

      toast.error(
        "Please login to continue."
      );

      navigate("/login", {
        state: {
          from: {
            pathname:
              location.pathname,
          },
        },
      });

      return;

    }

    navigate("/checkout");

  };

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fff8f5]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Heading */}

          <div className="mb-10">

            <p className="font-semibold text-orange-500">
              🍽 Your Delicious Order
            </p>

            <h1 className="mt-3 text-4xl font-bold text-gray-900 sm:text-5xl">
              Shopping Cart
            </h1>

            <p className="mt-4 text-lg text-gray-500">
              Review your selected
              food before checkout.
            </p>

          </div>

          <div className="grid min-w-0 gap-8 lg:grid-cols-[1.8fr_1fr]">
                        {/* Cart Items */}

            <section className="min-w-0">

              <div className="rounded-[32px] bg-white p-5 shadow-lg sm:p-8">

                <div className="flex items-center justify-between border-b pb-5">

                  <div className="flex items-center gap-3">

                    <ShoppingBag
                      className="text-orange-500"
                    />

                    <h2 className="text-2xl font-bold">
                      Your Cart
                    </h2>

                  </div>

                  <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">

                    {cartItems.length} Items

                  </span>

                </div>

                {cartItems.length === 0 ? (

                  <div className="py-20 text-center">

                    <ShoppingBag
                      size={80}
                      className="mx-auto text-orange-300"
                    />

                    <h2 className="mt-6 text-3xl font-bold">

                      Your Cart is Empty

                    </h2>

                    <p className="mt-4 text-gray-500">

                      Add delicious food to your cart.

                    </p>

                    <Link
                      to="/"
                      className="mt-8 inline-flex rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white hover:bg-orange-600"
                    >

                      Browse Restaurants

                    </Link>

                  </div>

                ) : (

                  <div className="divide-y">

                    {cartItems.map((item) => (

                      <div
                        key={item.id}
                        className="group flex flex-col gap-5 py-8 sm:flex-row sm:gap-6"
                      >

                        {/* Image */}

                        <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-3xl sm:h-36 sm:w-36">

                          <img
                            src={resolveFoodImage(item.image, item.menuItemId || item.id)}
                            onError={(event) => applyImageFallback(event, getFoodFallback(item.menuItemId || item.id))}
                            alt={item.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                          />

                        </div>

                        {/* Details */}

                        <div className="flex flex-1 flex-col justify-between">

                          <div>

                            <div className="flex items-start justify-between">

                              <div>

                                <h3 className="text-2xl font-bold">

                                  {item.name}

                                </h3>

                                <p className="mt-2 text-gray-500">

                                  {item.restaurant}

                                </p>

                              </div>

                            </div>

                          </div>

                          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                              <p className="text-2xl font-bold text-orange-600 sm:text-3xl">

                                ₹{item.price * item.quantity}

                              </p>

                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">

                              <button
                                onClick={() => runCartAction(() => decreaseQuantity(item.id))}
                                aria-label={`Decrease ${item.name} quantity`}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 hover:bg-orange-200"
                              >

                                <Minus size={18} />

                              </button>

                              <span className="text-xl font-bold">

                                {item.quantity}

                              </span>

                              <button
                                onClick={() => runCartAction(() => increaseQuantity(item.id))}
                                aria-label={`Increase ${item.name} quantity`}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                              >

                                <Plus size={18} />

                              </button>

                            </div>

                          </div>

                          <button
                            onClick={() => runCartAction(() => removeFromCart(item.id))}
                            className="mt-5 flex w-fit items-center gap-2 rounded-xl bg-red-50 px-4 py-2 font-semibold text-red-500 transition hover:bg-red-100"
                          >

                            <Trash2 size={18} />

                            Remove

                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </section>
                        {/* Order Summary */}

            <aside className="min-w-0">

              <div className="sticky top-28 rounded-[32px] bg-white p-5 shadow-lg sm:p-8">

                <h2 className="text-3xl font-bold text-gray-900">
                  Order Summary
                </h2>

                {/* Coupon */}

                <div className="mt-8">

                  <label className="mb-3 block font-semibold text-gray-700">
                    Coupon Code
                  </label>

                  <div className="flex min-w-0 overflow-hidden rounded-2xl border border-orange-200">

                    <div className="flex items-center px-4">

                      <Gift className="text-orange-500" />

                    </div>

                    <input
                      value={coupon}
                      onChange={(e) => {
                        setCoupon(e.target.value);
                        if (couponCode && e.target.value.trim().toUpperCase() !== couponCode) clearCoupon();
                      }}
                      placeholder="Enter coupon code"
                      className="min-w-0 flex-1 px-2 py-4 outline-none sm:px-4"
                    />

                    <button
                      onClick={handleApplyCoupon}
                      className="bg-orange-500 px-4 font-semibold text-white hover:bg-orange-600 sm:px-6"
                    >
                      Apply
                    </button>

                  </div>

                </div>

                {/* Delivery Info */}

                <div className="mt-8 rounded-2xl bg-orange-50 p-5">

                  <div className="flex items-center gap-3">

                    <Truck className="text-orange-500" />

                    <div>

                      <h3 className="font-bold">
                        Fast Delivery
                      </h3>

                      <p className="text-sm text-gray-500">
                      Delivery time depends on restaurant preparation and distance.
                      </p>

                    </div>

                  </div>

                </div>

                {/* Food Safety */}

                <div className="mt-5 rounded-2xl bg-green-50 p-5">

                  <div className="flex items-center gap-3">

                    <ShieldCheck className="text-green-600" />

                    <div>

                      <h3 className="font-bold">
                        Safe Packaging
                      </h3>

                      <p className="text-sm text-gray-500">
                        Contactless Delivery
                      </p>

                    </div>

                  </div>

                </div>

                {/* Bill Details */}

                <div className="mt-10 space-y-5">

                  <div className="flex justify-between">

                    <span>Item Total</span>

                    <span>
                      ₹{itemTotal}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span>Delivery Fee</span>

                    <span>
                      ₹{deliveryFee}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span>Platform Fee</span>

                    <span>
                      ₹{platformFee}
                    </span>

                  </div>

                  <div className="flex justify-between text-green-600">

                    <span>Discount</span>

                    <span>
                      - ₹{discount}
                    </span>

                  </div>

                </div>

                <div className="my-8 border-t border-dashed"></div>

                <div className="flex items-center justify-between">

                  <span className="text-2xl font-bold">
                    Total
                  </span>

                  <span className="text-4xl font-bold text-orange-600">
                    ₹{total}
                  </span>

                </div>

                <button
                  onClick={handleCheckout}
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 py-4 text-lg font-semibold text-white shadow-lg transition hover:scale-[1.02]"
                >

                  Proceed To Checkout

                  <ArrowRight size={20} />

                </button>

                <Link
                  to="/"
                  className="mt-5 flex w-full items-center justify-center rounded-2xl border-2 border-orange-500 py-4 font-semibold text-orange-500 transition hover:bg-orange-50"
                >

                  Continue Shopping

                </Link>

              </div>

            </aside>

          </div>

        </section>

      </main>

    </>

  );

}
