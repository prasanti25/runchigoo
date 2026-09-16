import { useEffect, useMemo, useState } from "react";
import { Search, Star, Clock3, ShoppingCart, SlidersHorizontal, X, UtensilsCrossed } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import { applyImageFallback, getFoodFallback, resolveFoodImage } from "../lib/images.js";
import toast from "react-hot-toast";

const filterChips = [
  "Veg",
  "Non Veg",
  "Biryani",
  "Pizza",
  "Burgers",
  "Chinese",
  "South Indian",
  "Desserts",
  "Drinks",
];

const recentSearches = ["Biryani", "Paneer", "Pizza", "Fries", "Coffee"];
const popularSearches = ["Chicken Biryani", "Butter Chicken", "Burger", "Momos", "Ice Cream"];

export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState(() => location.state?.query || "");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [foods, setFoods] = useState([]);
  const [recent, setRecent] = useState(() => {
    if (typeof window === "undefined") {
      return recentSearches;
    }

    try {
      const stored = window.localStorage.getItem("ruchigo-recent-searches");
      const parsed = stored ? JSON.parse(stored) : recentSearches;
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string").slice(0, 5) : recentSearches;
    } catch {
      return recentSearches;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem("ruchigo-recent-searches", JSON.stringify(recent));
    } catch {
      // Ignore storage write issues in restricted environments.
    }
  }, [recent]);

  useEffect(() => {
    apiRequest("/menu-items/").then((data) => {
      const results = data.results || data;
      setFoods(results.map((item) => ({
        id: item.id,
        restaurantId: item.restaurant,
        restaurant: item.restaurant_detail?.name || "Restaurant",
        category: item.category_name || "Menu",
        name: item.name,
        description: item.description,
        price: Number(item.price),
        rating: item.restaurant_detail?.average_rating || "New",
        isVeg: item.is_vegetarian,
        deliveryTime: `${item.preparation_minutes} min`,
        image: resolveFoodImage(item.image, item.id),
        imageAlt: item.name,
      })));
    }).catch(() => toast.error("Unable to load the menu right now."));
  }, []);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return foods
      .filter((item) => item.name.toLowerCase().includes(normalizedQuery) || item.restaurant.toLowerCase().includes(normalizedQuery))
      .slice(0, 5)
      .map((item) => item.name);
  }, [foods, query]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return foods.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.restaurant.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        selectedFilter === "All" ||
        item.category.toLowerCase() === selectedFilter.toLowerCase() ||
        item.name.toLowerCase().includes(selectedFilter.toLowerCase()) ||
        item.restaurant.toLowerCase().includes(selectedFilter.toLowerCase()) ||
        (selectedFilter === "Burgers" && item.category.toLowerCase() === "burger") ||
        (selectedFilter === "Non Veg" && !item.isVeg) ||
        (selectedFilter === "Veg" && item.isVeg);

      return matchesQuery && matchesFilter;
    });
  }, [foods, query, selectedFilter]);

  const handleSearch = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setRecent((prev) => [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 5));
  };

  const clearSearch = () => {
    setQuery("");
    setSelectedFilter("All");
  };

  return (
    <main className="min-h-screen bg-[#fff8f5] text-gray-900">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-orange-100 shadow-[0_20px_80px_-40px_rgba(255,107,53,0.7)]">
          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-orange-500">
                <Search size={18} />
                Discover food near you
              </div>

              <div className="rounded-3xl border border-orange-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3 rounded-2xl bg-[#fffaf7] px-3 py-3">
                  <Search className="text-orange-500" size={20} />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && handleSearch(query)}
                    placeholder="Search for biryani, pizza, burgers, desserts..."
                    className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-400 sm:text-base"
                  />
                  {query && (
                    <button onClick={clearSearch} className="rounded-full bg-orange-100 p-1 text-orange-500">
                      <X size={16} />
                    </button>
                  )}
                </div>

                {suggestions.length > 0 && (
                  <div className="mt-3 space-y-2 rounded-2xl bg-orange-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Suggestions</p>
                    {suggestions.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleSearch(item)}
                        className="block w-full rounded-xl bg-white px-3 py-2 text-left text-sm text-gray-700 shadow-sm transition hover:text-orange-500"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedFilter("All")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedFilter === "All" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500"}`}
                >
                  All
                </button>
                {filterChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedFilter(chip)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedFilter === chip ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500"}`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-white/90 p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <SlidersHorizontal size={18} className="text-orange-500" />
                Quick picks
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Popular Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Recent Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-500"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Top food picks</h2>
              <p className="text-sm text-gray-500">Fresh, fast and super delicious.</p>
            </div>
            <div className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-orange-500 shadow-sm">
              {results.length} result{results.length === 1 ? "" : "s"}
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map((item) => (
                <article
                  key={item.id}
                  className="group relative overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-[0_18px_60px_-35px_rgba(255,107,53,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-30px_rgba(255,107,53,0.55)]"
                >
                  <Link
                    to={`/food-details/${item.id}`}
                    aria-label={`View ${item.name}`}
                    className="absolute inset-0 z-10 rounded-[28px] focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image}
                      onError={(event) => applyImageFallback(event, getFoodFallback(item.id))}
                      alt={item.imageAlt}
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${item.isVeg ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                      {item.isVeg ? "Veg" : "Non Veg"}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{item.restaurant}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-sm font-bold text-green-600">
                        <Star size={14} fill="currentColor" />
                        {item.rating}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock3 size={14} />
                        {item.deliveryTime}
                      </span>
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">{item.category}</span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Starting at</p>
                        <p className="text-lg font-bold text-orange-500">₹{item.price}</p>
                      </div>

                      <button
                        onClick={async () => {
                          try {
                            if (await addToCart(item)) toast.success("Added to cart.");
                          } catch (error) {
                            toast.error(error.message);
                            if (!isAuthenticated) navigate("/login", { state: { from: { pathname: "/search" } } });
                          }
                        }}
                        className="relative z-20 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:scale-[1.02]"
                      >
                        <ShoppingCart size={16} />
                        Add to cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[32px] border border-dashed border-orange-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <UtensilsCrossed size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">No Food Found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">Try a different keyword, clear the filter, or browse one of the popular searches above.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
