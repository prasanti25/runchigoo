import Navbar from "../components/Navbar.jsx";
import {
  Heart,
  Star,
  MapPin,
  Search,
  ShoppingCart,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { apiRequest } from "../lib/api.js";
import { applyImageFallback, getFoodFallback, resolveFoodImage } from "../lib/images.js";
import toast from "react-hot-toast";

const favouriteRestaurants = [];

export default function Wishlist() {

  const [search, setSearch] = useState("");
  const [favouriteFoods, setFavouriteFoods] = useState([]);
  const { token } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    apiRequest("/wishlist/", { token }).then((data) => setFavouriteFoods((data.results || data).map((entry) => ({ id: entry.id, menuItemId: entry.menu_item, name: entry.menu_item_detail?.name || "Menu item", restaurant: entry.menu_item_detail?.restaurant_detail?.name || "Restaurant", price: Number(entry.menu_item_detail?.price || 0), rating: entry.menu_item_detail?.restaurant_detail?.average_rating || "New", image: resolveFoodImage(entry.menu_item_detail?.image, entry.menu_item) })))).catch((error) => { setFavouriteFoods([]); toast.error(error.message); });
  }, [token]);

  const removeFood = async (id) => {
    try { await apiRequest(`/wishlist/${id}/`, { token, method: "DELETE" }); setFavouriteFoods((foods) => foods.filter((food) => food.id !== id)); toast.success("Removed from wishlist."); }
    catch (error) { toast.error(error.message); }
  };

  const filteredRestaurants =
    favouriteRestaurants.filter((restaurant) =>
      restaurant.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const filteredFoods =
    favouriteFoods.filter((food) =>
      food.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-8">

            <p className="font-semibold text-orange-500">
              My Collection
            </p>

            <h1 className="mt-2 text-4xl font-bold text-gray-900">
              Wishlist
            </h1>

            <p className="mt-3 text-gray-500">
              Your favourite restaurants and delicious foods.
            </p>

          </div>

          {/* Search */}

          <div className="relative mb-10">

            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search favourites..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-2xl border border-orange-100 bg-white py-4 pl-14 pr-5 shadow-sm outline-none focus:border-orange-500"
            />

          </div>

          {/* Favourite Restaurants */}

          <div className="mb-12">

            <h2 className="text-3xl font-bold text-gray-900">
              Favourite Restaurants
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
                              {filteredRestaurants.map((restaurant) => (

                <div
                  key={restaurant.id}
                  className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  <div className="flex items-center gap-5">

                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 text-5xl">
                      {restaurant.image}
                    </div>

                    <div className="flex-1">

                      <h3 className="text-2xl font-bold text-gray-900">
                        {restaurant.name}
                      </h3>

                      <p className="mt-2 text-gray-500">
                        {restaurant.cuisine}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">

                        <span className="flex items-center gap-1">

                          <Star
                            size={16}
                            className="fill-yellow-400 text-yellow-400"
                          />

                          {restaurant.rating}

                        </span>

                        <span className="flex items-center gap-1">

                          <MapPin size={16} />

                          {restaurant.location}

                        </span>

                      </div>

                    </div>

                    <button className="rounded-full bg-red-50 p-3 text-red-500 transition hover:bg-red-500 hover:text-white">

                      <Heart
                        size={22}
                        className="fill-current"
                      />

                    </button>

                  </div>

                  <div className="mt-6 flex gap-4">

                    <Link
                      to="/restaurant"
                      className="flex-1 rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
                    >
                      View Restaurant
                    </Link>

                    <button className="rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-500 transition hover:bg-red-500 hover:text-white">
                      Remove
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* Favourite Foods */}

          <div>

            <div className="mb-8 flex items-center justify-between">

              <h2 className="text-3xl font-bold text-gray-900">
                Favourite Foods
              </h2>

              <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-500">
                {filteredFoods.length} Items
              </span>

            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {filteredFoods.map((food) => (

                <div
                  key={food.id}
                  className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  <div className="h-44 overflow-hidden bg-orange-100">
                    <img src={food.image} onError={(event) => applyImageFallback(event, getFoodFallback(food.menuItemId || food.id))} alt={food.name} className="h-full w-full object-cover" />
                  </div>

                  <div className="p-6">

                    <div className="flex items-start justify-between">

                      <div>

                        <h3 className="text-xl font-bold text-gray-900">
                          {food.name}
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                          {food.restaurant}
                        </p>

                      </div>

                      <button onClick={() => removeFood(food.id)} className="text-red-500">

                        <Heart
                          size={22}
                          className="fill-current"
                        />

                      </button>

                    </div>

                    <div className="mt-5 flex items-center justify-between">

                      <span className="text-2xl font-bold text-orange-500">
                        ₹{food.price}
                      </span>

                      <div className="flex items-center gap-1">

                        <Star
                          size={16}
                          className="fill-yellow-400 text-yellow-400"
                        />

                        <span className="font-semibold">
                          {food.rating}
                        </span>

                      </div>

                    </div>

                    <div className="mt-6 flex gap-3">

                      <button onClick={async () => { try { await addToCart({ id: food.menuItemId || food.id }); toast.success("Added to cart."); } catch (error) { toast.error(error.message); } }} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600">

                        <ShoppingCart size={18} />

                        Add to Cart

                      </button>

                      <button onClick={() => removeFood(food.id)} className="rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-500 transition hover:bg-red-500 hover:text-white">
                        Remove
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>
                    {/* Empty State */}

          {filteredRestaurants.length === 0 &&
            filteredFoods.length === 0 && (

              <div className="mt-16 rounded-3xl border border-dashed border-orange-200 bg-white py-20 text-center shadow-sm">

                <Heart
                  size={70}
                  className="mx-auto text-red-300"
                />

                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  Your Wishlist is Empty
                </h2>

                <p className="mt-4 text-gray-500">
                  Start adding your favourite restaurants and foods to see them here.
                </p>

                <Link
                  to="/"
                  className="mt-8 inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-4 font-semibold text-white transition hover:bg-orange-600"
                >
                  Explore Restaurants
                </Link>

              </div>

            )}

        </section>

      </main>

    </>

  );

}
