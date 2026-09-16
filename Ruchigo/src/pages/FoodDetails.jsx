import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";

import {
  Star,
  Clock,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Bike,
  Flame,
  ShieldCheck,
} from "lucide-react";

import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

import { foodData } from "../data/foodData";

import toast from "react-hot-toast";
import { apiRequest } from "../lib/api.js";
import { applyImageFallback, getFoodFallback, resolveFoodImage } from "../lib/images.js";

export default function FoodDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();

  const { isAuthenticated, token } = useAuth();

  const [quantity, setQuantity] = useState(1);

  const [liked, setLiked] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);

  const [food, setFood] = useState(foodData.find((item) => item.id === Number(id)) || foodData[0]);
  const [allFoods, setAllFoods] = useState(foodData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([apiRequest(`/menu-items/${id}/`), apiRequest("/menu-items/"), token ? apiRequest("/wishlist/", { token }) : Promise.resolve(null)])
      .then(([item, data, wishlistData]) => {
        setFood({ id: item.id, restaurantId: item.restaurant, restaurant: item.restaurant_detail?.name || "Restaurant", category: item.category_name || "Menu", name: item.name, description: item.description, price: Number(item.price), rating: item.restaurant_detail?.average_rating || "New", isVeg: item.is_vegetarian, deliveryTime: `${item.preparation_minutes} min`, image: resolveFoodImage(item.image, item.id), imageAlt: item.name });
        setAllFoods((data.results || data).map((entry) => ({ id: entry.id, restaurantId: entry.restaurant, restaurant: entry.restaurant_detail?.name || "Restaurant", name: entry.name, description: entry.description, price: Number(entry.price), image: resolveFoodImage(entry.image, entry.id), imageAlt: entry.name, category: entry.category_name || "Menu", isVeg: entry.is_vegetarian, rating: entry.restaurant_detail?.average_rating || "New" })));
        const wishlistEntry = wishlistData ? (wishlistData.results || wishlistData).find((entry) => entry.menu_item === item.id) : null;
        setWishlistId(wishlistEntry?.id || null);
        setLiked(Boolean(wishlistEntry));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  const recommendedFoods = allFoods.filter(
    (item) =>
      item.restaurantId === food.restaurantId &&
      item.id !== food.id
  );

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue.");

      navigate("/login", {
        state: {
          from: {
            pathname: `/food-details/${id}`,
          },
        },
      });

      return;
    }

    try {
      if (!(await addToCart(food, quantity))) return;
    } catch (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Added to cart successfully 🎉");

    navigate("/cart");
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue.");
      navigate("/login", { state: { from: { pathname: `/food-details/${id}` } } });
      return;
    }
    try {
      if (!(await addToCart(food, quantity))) return;
      navigate("/checkout");
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save favourites.");
      navigate("/login", { state: { from: { pathname: `/food-details/${id}` } } });
      return;
    }
    try {
      if (wishlistId) {
        await apiRequest(`/wishlist/${wishlistId}/`, { token, method: "DELETE" });
        setWishlistId(null);
        setLiked(false);
        toast.success("Removed from wishlist.");
      } else {
        const entry = await apiRequest("/wishlist/", { token, method: "POST", body: { menu_item: food.id } });
        setWishlistId(entry.id);
        setLiked(true);
        toast.success("Added to wishlist.");
      }
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };

  if (loading) return <><Navbar /><main className="min-h-screen bg-[#fff8f5] p-10 text-center">Loading menu item…</main></>;
  if (error) return <><Navbar /><main className="min-h-screen bg-[#fff8f5] p-10 text-center text-red-600">{error}</main></>;

  const totalPrice = food.price * quantity;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fff8f5]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          <div className="grid gap-12 lg:grid-cols-2">

            {/* LEFT */}

            <div className="relative overflow-hidden rounded-[36px] bg-white p-4 shadow-xl">

              <button
                onClick={toggleWishlist}
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                className="absolute right-8 top-8 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110"
              >
                <Heart
                  size={22}
                  fill={liked ? "red" : "none"}
                  color={liked ? "red" : "#ff6b35"}
                />
              </button>

              <img
                src={food.image}
                onError={(event) => applyImageFallback(event, getFoodFallback(food.id))}
                alt={food.imageAlt}
                className="h-[520px] w-full rounded-3xl object-cover transition duration-500 hover:scale-105"
              />

            </div>

            {/* RIGHT */}

            <div className="flex flex-col justify-center">

              <p className="font-semibold text-orange-500">
                {food.restaurant}
              </p>

              <h1 className="mt-3 text-5xl font-bold text-gray-900">
                {food.name}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-4">

                <span className="flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 font-semibold text-white">
                  <Star
                    size={15}
                    fill="currentColor"
                  />
                  {food.rating}
                </span>

                <span className="flex items-center gap-2 text-gray-500">
                  <Clock size={18} />
                  {food.deliveryTime}
                </span>

                <span className="rounded-full bg-orange-100 px-4 py-2 font-semibold text-orange-600">
                  {food.category}
                </span>

              </div>

              <p className="mt-8 text-lg leading-8 text-gray-600">
                {food.description}
              </p>

              {/* Price */}

              <div className="mt-8 flex items-center gap-4">

                <span className="text-5xl font-bold text-orange-600">
                  ₹{totalPrice}
                </span>

              </div>

              {/* Quantity */}

              <div className="mt-10 flex items-center justify-between rounded-3xl bg-white p-5 shadow">

                <div>

                  <p className="text-sm text-gray-500">
                    Quantity
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    Select Quantity
                  </p>

                </div>

                <div className="flex items-center gap-5">

                  <button
                    onClick={() =>
                      quantity > 1 &&
                      setQuantity(quantity - 1)
                    }
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 transition hover:bg-orange-200"
                  >
                    <Minus size={20} />
                  </button>

                  <span className="text-2xl font-bold">
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity((current) => Math.min(current + 1, 99))}
                    disabled={quantity >= 99}
                    aria-label="Increase quantity"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600"
                  >
                    <Plus size={20} />
                  </button>

                </div>

              </div>

              {/* Delivery Info */}

              <div className="mt-8 grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl bg-white p-5 shadow">

                  <Bike
                    size={28}
                    className="text-orange-500"
                  />

                  <h3 className="mt-3 font-bold">
                    Fast Delivery
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Delivered in {food.deliveryTime}
                  </p>

                </div>

                <div className="rounded-2xl bg-white p-5 shadow">

                  <Flame
                    size={28}
                    className="text-red-500"
                  />

                  <h3 className="mt-3 font-bold">
                    Freshly Cooked
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Prepared after your order.
                  </p>

                </div>

                <div className="rounded-2xl bg-white p-5 shadow">

                  <ShieldCheck
                    size={28}
                    className="text-green-500"
                  />

                  <h3 className="mt-3 font-bold">
                    Safe Food
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    100% Quality Checked
                  </p>

                </div>

              </div>

              {/* Buttons */}

              <div className="mt-10 flex gap-4">

                <button
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:scale-105"
                >
                  <ShoppingCart size={22} />

                  Add To Cart

                </button>

                <button
                  onClick={handleBuyNow}
                  className="rounded-2xl bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-green-700"
                >
                  Buy Now
                </button>

              </div>

            </div>

          </div>
                    {/* Ingredients */}

          <section className="mt-16 rounded-3xl bg-white p-8 shadow-lg">

            <h2 className="text-3xl font-bold text-gray-900">
              Ingredients
            </h2>

            <div className="mt-6 flex flex-wrap gap-3">

              {[
                "🍗 Chicken",
                "🍚 Basmati Rice",
                "🌿 Mint",
                "🧅 Onion",
                "🧄 Garlic",
                "🌶️ Indian Spices",
                "🧈 Butter",
                "🥛 Yogurt",
              ].map((ingredient) => (

                <span
                  key={ingredient}
                  className="rounded-full bg-orange-50 px-5 py-3 font-medium text-orange-600"
                >
                  {ingredient}
                </span>

              ))}

            </div>

          </section>

          {/* Customer Reviews */}

          <section className="mt-16">

            <h2 className="text-3xl font-bold text-gray-900">
              Customer Reviews
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2">

              <div className="rounded-3xl bg-white p-6 shadow">

                <div className="flex items-center gap-2">

                  ⭐⭐⭐⭐⭐

                  <span className="font-bold">
                    4.9
                  </span>

                </div>

                <p className="mt-4 text-gray-600">
                  One of the best biryanis I have ever eaten.
                  Very delicious and fresh.
                </p>

                <h4 className="mt-5 font-semibold">
                  — Rahul
                </h4>

              </div>

              <div className="rounded-3xl bg-white p-6 shadow">

                <div className="flex items-center gap-2">

                  ⭐⭐⭐⭐⭐

                  <span className="font-bold">
                    5.0
                  </span>

                </div>

                <p className="mt-4 text-gray-600">
                  Fast delivery and amazing taste.
                  Definitely ordering again.
                </p>

                <h4 className="mt-5 font-semibold">
                  — Sneha
                </h4>

              </div>

            </div>

          </section>

          {/* You May Also Like */}

          <section className="py-16">

            <h2 className="text-3xl font-bold text-gray-900">
              You May Also Like
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-3">

              {recommendedFoods.map((item) => (

                <div
                  key={item.id}
                  onClick={() =>
                    navigate(`/food-details/${item.id}`)
                  }
                  className="group cursor-pointer overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
                >

                  <div className="relative overflow-hidden">

                    <img
                      src={item.image}
                      onError={(event) => applyImageFallback(event, getFoodFallback(item.id))}
                      alt={item.imageAlt}
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
                    />

                  </div>

                  <div className="p-6">

                    <div className="flex items-start justify-between">

                      <div>

                        <h3 className="text-xl font-bold">
                          {item.name}
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                          {item.restaurant}
                        </p>

                      </div>

                      <span className="flex items-center gap-1 rounded-lg bg-green-500 px-2 py-1 text-sm font-semibold text-white">

                        <Star
                          size={13}
                          fill="currentColor"
                        />

                        {item.rating}

                      </span>

                    </div>

                    <p className="mt-4 line-clamp-2 text-sm text-gray-500">
                      {item.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between">

                      <p className="text-2xl font-bold text-orange-600">
                        ₹{item.price}
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void addToCart(item).then((added) => { if (added) toast.success("Added to cart."); }).catch((requestError) => toast.error(requestError.message));
                        }}
                        className="rounded-xl bg-orange-500 px-5 py-2 font-semibold text-white transition hover:bg-orange-600"
                      >
                        Add
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </section>

        </section>

      </main>

    </>

  );

}
