import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Clock3, Search, Star, Wallet } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Recommendations from "../components/product/Recommendations.jsx";
import { PersonalizedFeed } from "../components/product/PersonalizedFeed.jsx";
import VoiceInput from "../components/product/VoiceInput.jsx";
import MealCarousel from "../components/product/MealCarousel.jsx";
import RecentMealReview from "../components/product/RecentMealReview.jsx";
import {
  EmptyState,
  ErrorNotice,
  FoodCard,
  RestaurantCard,
  SectionTitle,
  Skeleton,
} from "../components/product/UI.jsx";
import {
  discoveryPath,
  useDeliveryLocation,
  useRemote,
} from "../lib/product.js";
import { categoryPhoto, getFoodFallback } from "../lib/images.js";

export default function Home() {
  const navigate = useNavigate();
  const location = useDeliveryLocation();
  const [query, setQuery] = useState("");
  const { data, loading, error, reload } = useRemote(
    discoveryPath({ city: location.city }),
  );
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className="container">
          <section className="home-hero product-home-hero">
            <div className="hero-copy">
              <span className="hero-kicker">
                <span />A LITTLE JOY, DELIVERED.
              </span>
              <h1>
                Great food.
                <br />
                <em>Your kind of mood.</em>
              </h1>
              <p>Find your next favourite, from kitchens around you.</p>
              <form
                className="hero-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                }}
              >
                <Search size={20} />
                <input
                  aria-label="Search food or restaurants"
                  placeholder="What are you craving today?"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <VoiceInput onText={setQuery} />
                <button type="submit" aria-label="Search">
                  <ArrowRight size={21} />
                </button>
              </form>
              <div className="hero-benefits">
                <span>
                  <Check size={14} />
                  Freshly prepared
                </span>
                <span>
                  <Check size={14} />
                  Local favourites
                </span>
                <span>
                  <Check size={14} />
                  Made for you
                </span>
              </div>
            </div>
            <div className="home-meal-showcase">
              {data?.items?.length ? (
                <MealCarousel
                  key={data.items
                    .slice(0, 5)
                    .map((item) => item.id)
                    .join(":")}
                  items={data.items}
                  label="Featured meals"
                />
              ) : loading ? (
                <div className="hero-meal-skeleton" role="status">
                  <Skeleton message="Finding something delicious…" />
                </div>
              ) : (
                <Link to="/search" className="hero-meal-empty">
                  Explore available kitchens
                  <ArrowRight size={20} />
                </Link>
              )}
            </div>
          </section>
          <PersonalizedFeed compact />
          <section className="category-section">
            <SectionTitle
              title="What’s on your mind?"
              to="/search"
              action="Explore the menu"
            />
            <div className="category-rail">
              {(data?.categories || []).slice(0, 10).map((category) => (
                <Link
                  to={`/search?category=${encodeURIComponent(category.name)}`}
                  className="category-card"
                  key={category.id}
                >
                  <span className="category-photo">
                    <img
                      src={categoryPhoto(category.name)}
                      alt=""
                      width={320}
                      height={320}
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        const fallback = getFoodFallback({
                          name: category.name,
                        });
                        if (!event.currentTarget.src.endsWith(fallback))
                          event.currentTarget.src = fallback;
                      }}
                    />
                  </span>
                  <strong>{category.name}</strong>
                </Link>
              ))}
              {loading && <p className="muted">Finding your favourites…</p>}
            </div>
          </section>
          <section className="discovery-section">
            <SectionTitle
              eyebrow="YOUR NEIGHBOURHOOD, ON A PLATE"
              title={
                location.city
                  ? `Great food in ${location.city}`
                  : "Kitchens worth discovering"
              }
              to="/search"
            />
            <ErrorNotice error={error} onRetry={reload} />
            {loading ? (
              <Skeleton />
            ) : data?.restaurants.length ? (
              <div className="restaurant-grid">
                {data.restaurants.slice(0, 4).map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              !error && (
                <EmptyState
                  title="Something delicious is on its way"
                  description="Choose another city to discover available restaurants."
                  to="/search"
                />
              )
            )}
          </section>
          <nav className="meal-shortcuts" aria-label="Find food your way">
            <Link to="/search?budget=250">
              <Wallet size={22} />
              <div>
                <strong>Easy on the pocket</strong>
                <span>Dishes under ₹250</span>
              </div>
              <ArrowRight size={17} />
            </Link>
            <Link to="/search?max_prep=30">
              <Clock3 size={22} />
              <div>
                <strong>Short on time?</strong>
                <span>Kitchens with quick prep</span>
              </div>
              <ArrowRight size={17} />
            </Link>
            <Link to="/search?min_rating=4&sort=rating">
              <Star size={22} />
              <div>
                <strong>Loved by diners</strong>
                <span>Rated 4.0 and above</span>
              </div>
              <ArrowRight size={17} />
            </Link>
          </nav>
          <Recommendations />
          <section className="discovery-section">
            <SectionTitle
              eyebrow="PICK A PLATE, MAKE YOUR DAY"
              title="A little of everything you love"
              to="/search?view=dishes"
            />
            {loading ? (
              <Skeleton />
            ) : (
              <div className="food-grid">
                {data?.items.slice(0, 8).map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
          <section className="join-banner">
            <div>
              <p className="eyebrow">GOOD FOOD BRINGS US TOGETHER</p>
              <h2>Your kitchen. Our community.</h2>
              <p>
                Bring your restaurant to RuchiGo, or deliver smiles around your
                city.
              </p>
            </div>
            <Link to="/register" className="btn secondary">
              Become a partner
              <ArrowRight size={17} />
            </Link>
          </section>
        </div>
      </main>
      <RecentMealReview />
    </>
  );
}
