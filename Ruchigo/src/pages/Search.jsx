import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  Leaf,
  MapPin,
  Timer,
  Star,
  Tag,
  Flame,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import VoiceInput from "../components/product/VoiceInput.jsx";
import { currentPosition } from "../lib/addressLocation.js";
import {
  EmptyState,
  ErrorNotice,
  FoodCard,
  RestaurantCard,
  Skeleton,
} from "../components/product/UI.jsx";
import {
  discoveryPath,
  saveDeliveryLocation,
  useDeliveryLocation,
  useRemote,
} from "../lib/product.js";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const location = useDeliveryLocation();
  const input = params.get("q") || "";
  const [query, setQuery] = useState(input);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const locationRequest = useRef(null);
  useEffect(() => () => locationRequest.current?.abort(), []);
  const nearby =
    Boolean(params.get("radius_km")) || params.get("sort") === "distance";
  const hasCoordinates =
    Number.isFinite(Number(location.latitude)) &&
    Number.isFinite(Number(location.longitude)) &&
    location.latitude != null &&
    location.longitude != null;
  const setInput = (value) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        value ? next.set("q", value) : next.delete("q");
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  useEffect(() => {
    const timer = setTimeout(() => setQuery(input), 300);
    return () => clearTimeout(timer);
  }, [input]);
  const filters = {
    city: nearby ? undefined : location.city,
    q: query,
    category: params.get("category"),
    vegetarian: params.get("vegetarian"),
    budget: params.get("budget"),
    min_rating: params.get("min_rating"),
    max_prep: params.get("max_prep"),
    offers: params.get("offers"),
    bestseller: params.get("bestseller"),
    ...(nearby && hasCoordinates
      ? {
          latitude: Number(location.latitude).toFixed(3),
          longitude: Number(location.longitude).toFixed(3),
          radius_km: params.get("radius_km") || 5,
        }
      : {}),
    sort: params.get("sort") || "recommended",
    page: params.get("page") || 1,
  };
  const { data, loading, error, reload } = useRemote(
    nearby && !hasCoordinates ? null : discoveryPath(filters),
  );
  const view = params.get("view") || "restaurants";
  const update = (key, value) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      value ? next.set(key, value) : next.delete(key);
      if (key !== "page") next.delete("page");
      return next;
    });
  const count = view === "dishes" ? data?.item_count : data?.restaurant_count;
  const toggle = (key, value = "true") =>
    update(key, params.get(key) === value ? "" : value);
  const chooseNearby = async () => {
    setLocationError("");
    const activate = () =>
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.set("radius_km", "5");
        next.set("sort", "distance");
        next.delete("page");
        return next;
      });
    if (hasCoordinates) {
      activate();
      return;
    }
    locationRequest.current?.abort();
    const controller = new AbortController();
    locationRequest.current = controller;
    setLocating(true);
    try {
      const position = await currentPosition({ signal: controller.signal });
      if (controller.signal.aborted) return;
      saveDeliveryLocation({
        ...location,
        latitude: Number(position.latitude.toFixed(3)),
        longitude: Number(position.longitude.toFixed(3)),
      });
      activate();
    } catch (error) {
      if (!controller.signal.aborted) setLocationError(error.message);
    } finally {
      if (!controller.signal.aborted) setLocating(false);
    }
  };
  const clearFilters = () =>
    setParams((current) => {
      const next = new URLSearchParams();
      for (const key of ["q", "view"])
        if (current.get(key)) next.set(key, current.get(key));
      return next;
    });
  const filterCount = [
    "vegetarian",
    "budget",
    "category",
    "min_rating",
    "max_prep",
    "offers",
    "bestseller",
    "radius_km",
  ].filter((key) => params.get(key)).length;
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className="container search-page">
          <div className="page-heading">
            <p className="eyebrow">FOLLOW YOUR CRAVINGS</p>
            <h1>Find your kind of delicious.</h1>
            <p className="muted">
              {location.city
                ? `Discover kitchens and dishes in ${location.city}.`
                : "Discover kitchens, favourites and something new."}
            </p>
          </div>
          <div className="discovery-search">
            <Search size={23} />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Search restaurants, dishes or cuisines"
              aria-label="Search restaurants, dishes or cuisines"
            />
            <VoiceInput onText={setInput} />
            {input && (
              <button
                className="icon-button"
                onClick={() => setInput("")}
                aria-label="Clear search"
              >
                <X size={19} />
              </button>
            )}
          </div>
          <div className="filter-bar">
            <span className="filter-label">
              <SlidersHorizontal size={17} />
              Filters{filterCount ? ` (${filterCount})` : ""}
            </span>
            <button
              className={`filter-chip ${nearby ? "selected" : ""}`}
              aria-pressed={nearby}
              disabled={locating}
              onClick={() => {
                if (!nearby || !hasCoordinates) chooseNearby();
                else
                  setParams((current) => {
                    const next = new URLSearchParams(current);
                    next.delete("radius_km");
                    if (next.get("sort") === "distance") next.delete("sort");
                    next.delete("page");
                    return next;
                  });
              }}
            >
              <MapPin size={14} />
              {locating ? "Locating…" : "Near me"}
            </button>
            <button
              className={`filter-chip ${params.get("max_prep") ? "selected" : ""}`}
              aria-pressed={Boolean(params.get("max_prep"))}
              onClick={() => toggle("max_prep", "30")}
            >
              <Timer size={14} />
              Fast prep · ≤30 min
            </button>
            <button
              className={`filter-chip ${params.get("min_rating") ? "selected" : ""}`}
              aria-pressed={Boolean(params.get("min_rating"))}
              onClick={() => toggle("min_rating", "4")}
            >
              <Star size={14} />
              Rating 4.0+
            </button>
            <button
              className={`filter-chip ${params.get("offers") === "true" ? "selected" : ""}`}
              aria-pressed={params.get("offers") === "true"}
              onClick={() => toggle("offers")}
            >
              <Tag size={14} />
              Restaurant offers
            </button>
            <button
              className={`filter-chip ${params.get("bestseller") === "true" ? "selected" : ""}`}
              aria-pressed={params.get("bestseller") === "true"}
              onClick={() => toggle("bestseller")}
            >
              <Flame size={14} />
              Bestsellers
            </button>
            <button
              className={`filter-chip ${params.get("vegetarian") === "true" ? "selected" : ""}`}
              aria-pressed={params.get("vegetarian") === "true"}
              onClick={() =>
                update("vegetarian", params.get("vegetarian") ? "" : "true")
              }
            >
              <Leaf size={14} aria-hidden="true" /> Veg dishes
            </button>
            <select
              aria-label="Budget filter"
              value={params.get("budget") || ""}
              onChange={(e) => update("budget", e.target.value)}
            >
              <option value="">Any budget</option>
              <option value="150">Up to ₹150 per dish</option>
              <option value="250">Up to ₹250 per dish</option>
              <option value="500">Up to ₹500 per dish</option>
            </select>
            <select
              aria-label="Cuisine filter"
              value={params.get("category") || ""}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="">All cuisines</option>
              {data?.categories.map((category) => (
                <option key={category.id}>{category.name}</option>
              ))}
            </select>
            <select
              aria-label="Sort results"
              value={filters.sort}
              onChange={(e) =>
                e.target.value === "distance"
                  ? chooseNearby()
                  : update("sort", e.target.value)
              }
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Top rated</option>
              <option value="price">Price: low to high</option>
              <option value="fastest">Quick preparation</option>
              <option value="distance">Nearest first</option>
            </select>
            {nearby && (
              <select
                aria-label="Nearby radius"
                value={params.get("radius_km") || "5"}
                onChange={(e) => update("radius_km", e.target.value)}
              >
                <option value="2">Within 2 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
              </select>
            )}
            {filterCount > 0 && (
              <button className="text-link" onClick={clearFilters}>
                Clear filters <X size={14} />
              </button>
            )}
          </div>
          <p className="discovery-filter-note">
            Combine filters to find your match. Budget is per dish; preparation
            time excludes delivery.
            {nearby &&
              " Distances are approximate straight-line distances; only kitchens with map locations appear."}
            {params.get("offers") === "true" &&
              " Restaurant offers have their own terms; discounts are confirmed at checkout."}
          </p>
          <ErrorNotice
            error={
              locationError ||
              (nearby && !hasCoordinates
                ? "Share your location using Near me, or clear filters to browse by city."
                : "")
            }
          />
          <div className="results-heading">
            <div className="segmented">
              <button
                className={view === "restaurants" ? "active" : ""}
                aria-pressed={view === "restaurants"}
                onClick={() => update("view", "restaurants")}
              >
                Restaurants
              </button>
              <button
                className={view === "dishes" ? "active" : ""}
                aria-pressed={view === "dishes"}
                onClick={() => update("view", "dishes")}
              >
                Dishes
              </button>
            </div>
            <span className="muted">
              {!loading && `${count || 0} ${view} to discover`}
            </span>
          </div>
          <ErrorNotice error={error} onRetry={reload} />
          {loading ? (
            <Skeleton count={8} />
          ) : count ? (
            <>
              <div
                className={view === "dishes" ? "food-grid" : "restaurant-grid"}
              >
                {view === "dishes"
                  ? data.items.map((item) => (
                      <FoodCard key={item.id} item={item} />
                    ))
                  : data.restaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                      />
                    ))}
              </div>
              {count > 12 && (
                <div className="pagination">
                  <button
                    className="btn secondary"
                    disabled={Number(filters.page) === 1}
                    onClick={() => update("page", Number(filters.page) - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {filters.page} of {Math.ceil(count / 12)}
                  </span>
                  <button
                    className="btn secondary"
                    disabled={Number(filters.page) * 12 >= count}
                    onClick={() => update("page", Number(filters.page) + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            !error && (
              <EmptyState
                title={
                  nearby
                    ? "No mapped kitchens match nearby"
                    : "No bites found this time"
                }
                description={
                  nearby
                    ? "Try a wider radius or clear filters to browse by city. Kitchens without a map location won’t appear here."
                    : "Try another dish, city or budget. Your next favourite is out there."
                }
                onRetry={() => {
                  setInput("");
                  setParams({});
                }}
              />
            )
          )}
        </div>
      </main>
    </>
  );
}
