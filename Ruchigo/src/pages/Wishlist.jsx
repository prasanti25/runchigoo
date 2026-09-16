import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Search,
  ShoppingCart,
  Star,
  UtensilsCrossed,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { apiRequest } from "../lib/api.js";
import { fetchAllPages } from "../lib/collections.js";
import { applyImageFallback, getFoodFallback, resolveFoodImage } from "../lib/images.js";

function mapWishlistEntry(entry) {
  const item = entry.menu_item_detail || {};
  return {
    id: entry.id,
    menuItemId: entry.menu_item,
    name: item.name || "Menu item",
    restaurantId: item.restaurant,
    restaurant: item.restaurant_detail?.name || "Restaurant",
    price: Number(item.price || 0),
    rating: item.restaurant_detail?.average_rating || "New",
    category: item.category_name || "Menu",
    isVeg: item.is_vegetarian,
    isAvailable: item.is_available,
    image: resolveFoodImage(item.image, entry.menu_item),
  };
}

export default function Wishlist() {
  const [search, setSearch] = useState("");
  const [favouriteFoods, setFavouriteFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const [removingId, setRemovingId] = useState(null);
  const { token } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    let active = true;
    fetchAllPages("/wishlist/", { token })
      .then((entries) => {
        if (active) setFavouriteFoods(entries.map(mapWishlistEntry));
      })
      .catch((requestError) => {
        if (!active) return;
        setFavouriteFoods([]);
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [reloadVersion, token]);

  const retry = () => {
    setError("");
    setLoading(true);
    setReloadVersion((version) => version + 1);
  };

  const removeFood = async (id) => {
    setRemovingId(id);
    try {
      await apiRequest(`/wishlist/${id}/`, { token, method: "DELETE" });
      setFavouriteFoods((foods) => foods.filter((food) => food.id !== id));
      toast.success("Removed from wishlist.");
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setRemovingId(null);
    }
  };

  const filteredFoods = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return favouriteFoods;
    return favouriteFoods.filter((food) =>
      `${food.name} ${food.restaurant} ${food.category}`.toLowerCase().includes(query)
    );
  }, [favouriteFoods, search]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fffaf7]">
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <header className="overflow-hidden rounded-[32px] border border-orange-100 bg-gradient-to-br from-white via-white to-orange-50 p-6 shadow-sm sm:p-9">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                  <Heart size={14} className="fill-current" />
                  Saved for later
                </span>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">Your wishlist</h1>
                <p className="mt-3 max-w-2xl text-gray-500">Keep your favourite dishes together and add them to your cart whenever you are ready.</p>
              </div>
              <div className="flex w-fit items-center gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-3 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white"><Heart size={18} /></span>
                <span><strong className="block text-xl text-gray-900">{favouriteFoods.length}</strong><span className="text-xs font-semibold text-gray-500">saved {favouriteFoods.length === 1 ? "dish" : "dishes"}</span></span>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading wishlist">
              {[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-3xl border border-orange-100 bg-white shadow-sm" />)}
            </div>
          ) : error ? (
            <section className="mt-8 rounded-3xl border border-red-100 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500"><X size={30} /></div>
              <h2 className="mt-5 text-2xl font-bold text-gray-900">Couldn’t load your wishlist</h2>
              <p className="mx-auto mt-2 max-w-md text-gray-500">{error}</p>
              <button type="button" onClick={retry} className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">Try again</button>
            </section>
          ) : favouriteFoods.length === 0 ? (
            <section className="mt-8 grid overflow-hidden rounded-[32px] border border-orange-100 bg-white shadow-sm lg:grid-cols-[1fr_0.8fr]">
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-100">
                  <Heart size={30} />
                </div>
                <h2 className="mt-6 text-3xl font-black text-gray-900">Save the dishes you love</h2>
                <p className="mt-3 max-w-xl leading-7 text-gray-500">Your wishlist is ready. Open any dish and tap the heart to save it here for quick access later.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/search" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">
                    Explore dishes <ArrowRight size={18} />
                  </Link>
                  <Link to="/offers" className="inline-flex items-center rounded-xl border border-orange-200 px-6 py-3 font-semibold text-orange-600 transition hover:bg-orange-50">View offers</Link>
                </div>
              </div>
              <div className="flex min-h-64 items-center justify-center bg-gradient-to-br from-orange-50 to-rose-50 p-8">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-white shadow-xl shadow-orange-100 sm:h-52 sm:w-52">
                  <UtensilsCrossed size={76} className="text-orange-500" />
                  <span className="absolute -right-2 top-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg"><Heart size={25} className="fill-current" /></span>
                </div>
              </div>
            </section>
          ) : (
            <>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Saved dishes</h2>
                  <p className="mt-1 text-sm text-gray-500">Choose a favourite or search your collection.</p>
                </div>
                <label className="flex w-full items-center rounded-2xl border border-orange-100 bg-white px-4 shadow-sm focus-within:border-orange-400 sm:max-w-sm">
                  <Search size={19} className="text-gray-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search saved dishes" className="min-w-0 flex-1 bg-transparent px-3 py-3.5 outline-none" />
                  {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear wishlist search" className="rounded-lg p-1 text-gray-400 hover:bg-orange-50 hover:text-orange-500"><X size={18} /></button>}
                </label>
              </div>

              {filteredFoods.length ? (
                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFoods.map((food) => (
                    <article key={food.id} className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <Link to={`/food-details/${food.menuItemId}`} className="block h-48 overflow-hidden bg-orange-50">
                        <img src={food.image} onError={(event) => applyImageFallback(event, getFoodFallback(food.menuItemId))} alt={food.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      </Link>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-orange-500">{food.category}</p>
                            <Link to={`/food-details/${food.menuItemId}`} className="mt-1 block truncate text-xl font-bold text-gray-900 hover:text-orange-600">{food.name}</Link>
                            <p className="mt-1 truncate text-sm text-gray-500">{food.restaurant}</p>
                          </div>
                          <button type="button" onClick={() => void removeFood(food.id)} disabled={removingId === food.id} aria-label={`Remove ${food.name} from wishlist`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-50">
                            <Heart size={20} className="fill-current" />
                          </button>
                        </div>
                        <div className="mt-5 flex items-center justify-between">
                          <span className="text-2xl font-black text-gray-900">₹{food.price}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-sm font-bold text-green-700"><Star size={14} className="fill-current" />{food.rating}</span>
                        </div>
                        <button
                          type="button"
                          disabled={!food.isAvailable}
                          onClick={async () => {
                            try {
                              if (await addToCart(food)) toast.success("Added to cart.");
                            } catch (requestError) {
                              toast.error(requestError.message);
                            }
                          }}
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          <ShoppingCart size={18} />
                          {food.isAvailable ? "Add to cart" : "Currently unavailable"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-14 text-center">
                  <Search size={36} className="mx-auto text-orange-300" />
                  <h2 className="mt-4 text-xl font-bold text-gray-900">No saved dishes match “{search}”</h2>
                  <button type="button" onClick={() => setSearch("")} className="mt-5 font-semibold text-orange-600">Clear search</button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
