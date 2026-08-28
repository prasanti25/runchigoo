import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock3,
  Flame,
  MapPin,
  Search,
  ShoppingBag,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";

const categoryCards = [
  { name: "Biryani", tag: "Spicy & aromatic", icon: Flame },
  { name: "Pizza", tag: "Cheesy comfort", icon: ShoppingBag },
  { name: "Burgers", tag: "Fast and juicy", icon: ShoppingBag },
  { name: "Desserts", tag: "Sweet cravings", icon: Star },
  { name: "Healthy", tag: "Light bites", icon: TrendingUp },
  { name: "Drinks", tag: "Refresh & relax", icon: Wallet },
];

const offerCards = [
  "Flat 50% off on your first order",
  "Free delivery on orders above ₹199",
  "Combo saver: Biryani + Dessert",
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [trendingRestaurants, setTrendingRestaurants] = useState([]);
  const [featuredDishes, setFeaturedDishes] = useState([]);

  useEffect(() => {
    apiRequest("/restaurants/").then((data) => setTrendingRestaurants((data.results || data).slice(0, 3).map((restaurant) => ({ id: restaurant.id, name: restaurant.name, cuisine: restaurant.description || restaurant.city, rating: restaurant.average_rating || "New", time: "30-40 min", image: restaurant.image || "/favicon.svg", offer: "FREE DELIVERY" }))));
    apiRequest("/menu-items/").then((data) => setFeaturedDishes((data.results || data).slice(0, 4).map((item) => ({ id: item.id, name: item.name, restaurant: item.restaurant_detail?.name || "Restaurant", price: Number(item.price), deliveryTime: `${item.preparation_minutes} min`, image: item.image || "/favicon.svg" }))));
  }, []);

  const statCards = [
    { label: "Happy Customers", value: "25k+" },
    { label: "Restaurants", value: "120+" },
    { label: "On-time Orders", value: "98%" },
  ];

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    navigate("/search", { state: { query: trimmedQuery } });
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fffaf7] text-gray-900">
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-[34px] bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 px-5 py-8 text-white shadow-[0_24px_90px_-30px_rgba(255,107,53,0.9)] sm:px-8 lg:px-10 lg:py-12"
          >
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-orange-50 backdrop-blur">
                  <Flame size={16} />
                  Fresh food, delivered fast
                </p>

                <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Savor every bite with RuchiGo.
                </h1>

                <p className="mt-4 max-w-2xl text-base text-orange-50 sm:text-lg">
                  Discover trending restaurants, crave-worthy dishes, and a premium delivery experience designed for everyday comfort.
                </p>

                <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col gap-3 rounded-[24px] bg-white/15 p-3 backdrop-blur md:flex-row md:items-center">
                  <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <Search className="text-orange-500" size={20} />
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search restaurants, cuisines or dishes"
                      className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-orange-600 transition hover:bg-orange-50"
                  >
                    Search Now
                  </button>
                </form>

                <div className="mt-6 flex flex-wrap gap-3">
                  {!isAuthenticated ? (
                    <>
                      <Link to="/login" className="rounded-2xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Login</Link>
                      <Link to="/register" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50">Register</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/profile" className="rounded-2xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">My Profile</Link>
                      <button onClick={() => logout()} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50">Logout</button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {statCards.map((stat) => (
                  <div key={stat.label} className="rounded-[24px] border border-white/20 bg-white/15 p-5 backdrop-blur-lg">
                    <p className="text-3xl font-black">{stat.value}</p>
                    <p className="mt-2 text-sm text-orange-50">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <section className="py-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Offers</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Hot deals for food lovers</h2>
              </div>
              <Link to="/search" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500">
                Explore all
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {offerCards.map((offer) => (
                <div key={offer} className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-orange-600">Special offer</p>
                  <p className="mt-2 text-lg font-bold text-gray-900">{offer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Browse</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">What are you craving?</h2>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {categoryCards.map((category) => {
                const Icon = category.icon;

                return (
                  <button
                    key={category.name}
                    onClick={() => navigate("/search", { state: { query: category.name } })}
                    className="rounded-[24px] border border-orange-100 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <Icon size={22} />
                    </div>
                    <p className="mt-4 text-base font-bold text-gray-900">{category.name}</p>
                    <p className="mt-1 text-sm text-gray-500">{category.tag}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="py-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Trending</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Trending restaurants</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {trendingRestaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  to={`/restaurant/${restaurant.id}`}
                  className="group overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-60 overflow-hidden">
                    <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-orange-600">{restaurant.offer}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{restaurant.cuisine}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-sm font-bold text-green-700">
                        <Star size={14} fill="currentColor" />
                        {restaurant.rating}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                      <Clock3 size={14} />
                      {restaurant.time}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="py-4 pb-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Featured</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Featured dishes</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {featuredDishes.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-[26px] border border-orange-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-48 overflow-hidden">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">Popular</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">₹{item.price}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{item.restaurant}</p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={14} />
                      {item.deliveryTime}
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
