import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Asterisk,
  Check,
  Clock3,
  Search,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Recommendations from "../components/product/Recommendations.jsx";
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
          <section className="home-hero">
            <div className="hero-copy">
              <span className="hero-kicker">
                <span />A LITTLE JOY, DELIVERED.
              </span>
              <h1>
                Your cravings.
                <br />
                <em>Our favourite</em>
                <br />
                thing to deliver.
              </h1>
              <p>
                From the first bite to the last.
                <br />
                Discover food you’ll love, from kitchens around you.
              </p>
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
            <div className="hero-art">
              <div className="hero-orbit" />
              <img
                className="hero-food"
                src="/food/protein-bowl.webp"
                alt="A colourful freshly prepared meal"
                fetchPriority="high"
              />
              <span className="hero-note">
                <Sparkles size={18} />
                <span>
                  YOUR NEXT
                  <br />
                  <strong>favourite meal.</strong>
                </span>
              </span>
              <span className="hero-caption">
                <Clock3 size={18} />
                <span>
                  Fresh from the kitchen
                  <br />
                  <strong>to your happy place.</strong>
                </span>
              </span>
              <span className="hero-star" aria-hidden="true">
                <Asterisk size={86} strokeWidth={1.5} />
              </span>
              <span className="hero-label">GOOD FOOD. GOOD MOOD.</span>
            </div>
          </section>
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
          <section className="editorial-strip">
            <div>
              <span className="eyebrow">SMALL BUDGET. BIG CRAVINGS.</span>
              <h2>
                A good meal doesn’t
                <br />
                have to be a big deal.
              </h2>
              <Link to="/search?budget=250" className="btn dark">
                Explore meals under ₹250
                <ArrowRight size={17} />
              </Link>
            </div>
            <span className="editorial-number">
              ₹250<small>AND UNDER</small>
            </span>
            <span className="editorial-squiggle">✳</span>
          </section>
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
    </>
  );
}
