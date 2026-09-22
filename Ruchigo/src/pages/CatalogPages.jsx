import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import {
  AddButton,
  CartDock,
  EmptyState,
  ErrorNotice,
  FoodImage,
  Rating,
  SectionTitle,
  Skeleton,
  VegMark,
} from "../components/product/UI.jsx";
import { dateTime, money, useRemote } from "../lib/product.js";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { RestaurantAffinity } from "../components/product/PersonalizedFeed.jsx";
import { RestaurantHours } from "../components/product/MenuConfiguration.jsx";
import OrderReview from "../components/product/OrderReview.jsx";

export function RestaurantPage() {
  const { id } = useParams();
  const { token, role } = useAuth();
  const [searchParams] = useSearchParams();
  const focusedDish = searchParams.get("dish");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [veg, setVeg] = useState(false);
  const [page, setPage] = useState(1);
  const restaurant = useRemote(`/restaurants/${id}/`);
  const categories = useRemote(`/categories/?restaurant=${id}`);
  const reviewable = useRemote(
    token && role === "customer"
      ? `/orders/?restaurant=${id}&status=delivered`
      : null,
    token,
  );
  const params = new URLSearchParams({ restaurant: id, search: query, page });
  if (category) params.set("category", category);
  if (veg) params.set("is_vegetarian", "true");
  const menu = useRemote(`/menu-items/?${params}`);
  const reviews = useRemote(`/restaurant-reviews/?restaurant=${id}`);
  useEffect(() => {
    if (focusedDish && menu.data)
      document
        .getElementById(`dish-${focusedDish}`)
        ?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [focusedDish, menu.data]);
  const change = (setter, value) => {
    setter(value);
    setPage(1);
  };
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/search">Explore</Link>
            <ArrowRight size={12} />
            <span>{restaurant.data?.name || "Restaurant"}</span>
          </div>
          <ErrorNotice error={restaurant.error} onRetry={restaurant.reload} />
          {restaurant.loading && <Skeleton count={2} />}
          {restaurant.data && (
            <>
              <section className="restaurant-hero">
                <div>
                  <span
                    className={`status-pill ${restaurant.data.accepting_orders === false ? "cancelled" : ""}`}
                  >
                    {restaurant.data.accepting_orders === false
                      ? "Currently closed"
                      : "Open for orders"}
                  </span>
                  <h1>{restaurant.data.name}</h1>
                  <p className="muted">{restaurant.data.description}</p>
                  <div className="restaurant-details">
                    <Rating value={restaurant.data.average_rating} />
                    <span>
                      <MapPin size={14} />
                      {restaurant.data.city}
                    </span>
                    <span>
                      <ShieldCheck size={14} />
                      Prepared fresh
                    </span>
                  </div>
                  <p className="muted mt-4">{restaurant.data.address}</p>
                  <RestaurantAffinity restaurantId={id} />
                  <RestaurantHours restaurant={restaurant.data} />
                </div>
                <FoodImage item={restaurant.data} eager restaurant />
              </section>
              <div className="menu-layout">
                <aside className="menu-categories" aria-label="Menu categories">
                  <button
                    className={!category ? "active" : ""}
                    onClick={() => change(setCategory, "")}
                  >
                    All dishes
                  </button>
                  {categories.data?.results.map((c) => (
                    <button
                      key={c.id}
                      className={category === String(c.id) ? "active" : ""}
                      onClick={() => change(setCategory, String(c.id))}
                    >
                      {c.name}
                    </button>
                  ))}
                </aside>
                <section>
                  <div className="section-title">
                    <h2>Made for your cravings</h2>
                    <label className="check-label">
                      <input
                        checked={veg}
                        type="checkbox"
                        onChange={(e) => change(setVeg, e.target.checked)}
                      />
                      Veg only
                    </label>
                  </div>
                  <div className="discovery-search">
                    <Search size={18} />
                    <input
                      placeholder="Search this menu"
                      aria-label="Search this menu"
                      value={query}
                      onChange={(e) => change(setQuery, e.target.value)}
                    />
                  </div>
                  <ErrorNotice error={menu.error} onRetry={menu.reload} />
                  {menu.loading ? (
                    <div className="mt-5">
                      <Skeleton count={2} />
                    </div>
                  ) : menu.data?.results.length ? (
                    <>
                      {menu.data.results.map((item) => (
                        <article
                          id={`dish-${item.id}`}
                          className={`menu-item ${String(item.id) === focusedDish ? "focused-dish" : ""}`}
                          key={item.id}
                        >
                          <div>
                            <div className="flex-row">
                              <VegMark veg={item.is_vegetarian} />
                              {item.is_bestseller && (
                                <span
                                  className="tiny"
                                  style={{ color: "#c38c3b" }}
                                >
                                  <Star size={12} />
                                  Bestseller
                                </span>
                              )}
                            </div>
                            <Link to={`/food-details/${item.id}`}>
                              <h3>{item.name}</h3>
                            </Link>
                            <strong className="text-sm">
                              {money(item.price)}
                            </strong>
                            <p>{item.description}</p>
                            <div className="tag-list">
                              <span>
                                {item.preparation_minutes} min preparation
                              </span>
                              {item.calories && (
                                <span>{item.calories} kcal</span>
                              )}
                            </div>
                          </div>
                          <div className="menu-item-image">
                            <Link to={`/food-details/${item.id}`}>
                              <FoodImage item={item} />
                            </Link>
                            <AddButton item={item} />
                          </div>
                        </article>
                      ))}
                      {menu.data.count > 20 && (
                        <div className="pagination">
                          <button
                            className="btn secondary"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                          >
                            Previous
                          </button>
                          <span>Page {page}</span>
                          <button
                            className="btn secondary"
                            disabled={!menu.data.next}
                            onClick={() => setPage(page + 1)}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    !menu.error && (
                      <EmptyState
                        title="Nothing on this menu matches"
                        description="Try a different category or search."
                      />
                    )
                  )}
                </section>
              </div>
              <section
                className="discovery-section restaurant-reviews"
                aria-label="Customer reviews"
              >
                <SectionTitle
                  title="From the people who’ve tried it"
                  description="Reviews from verified delivered orders."
                />
                {reviewable.data?.results?.[0] ? (
                  <OrderReview
                    order={reviewable.data.results[0]}
                    onSaved={() => {
                      reviewable.reload();
                      reviews.reload();
                      restaurant.reload();
                    }}
                  />
                ) : (
                  <p className="form-help">
                    Ratings unlock after your order is delivered.{" "}
                    <Link
                      className="text-link"
                      to={token ? "/orders" : "/login"}
                    >
                      {token ? "View your orders" : "Sign in to rate a meal"}
                    </Link>
                  </p>
                )}
                <ErrorNotice error={reviews.error} onRetry={reviews.reload} />
                {reviews.loading ? (
                  <div role="status" aria-label="Loading reviews">
                    <Skeleton count={2} />
                  </div>
                ) : reviews.data?.results.length ? (
                  <div className="restaurant-review-grid">
                    {reviews.data.results.map((r) => (
                      <article className="restaurant-review-card" key={r.id}>
                        <div className="flex-row between">
                          <strong>{r.name}</strong>
                          <Rating value={r.rating} />
                        </div>
                        <p className="review-comment">
                          {r.comment || "Rated their meal"}
                        </p>
                        <time className="tiny muted" dateTime={r.created_at}>
                          {dateTime(r.created_at)}
                        </time>
                      </article>
                    ))}
                  </div>
                ) : (
                  !reviews.error && (
                    <div className="restaurant-reviews-empty">
                      <Star size={22} aria-hidden="true" />
                      <div>
                        <h3>No reviews yet</h3>
                        <p>
                          Ordered here? Share your experience once your food
                          arrives.
                        </p>
                      </div>
                    </div>
                  )
                )}
              </section>
            </>
          )}
        </div>
        <CartDock />
      </main>
    </>
  );
}

export function FoodDetailPage() {
  const { id } = useParams();
  const { token, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const {
    data: item,
    loading,
    error,
    reload,
  } = useRemote(`/menu-items/${id}/`);
  const saved = useRemote(
    token && role === "customer" ? `/wishlist/?menu_item=${id}` : null,
    token,
  );
  const [saving, setSaving] = useState(false);
  const toggle = async () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: `/food-details/${id}` } },
      });
      return;
    }
    setSaving(true);
    try {
      const entry = saved.data?.results[0];
      if (entry)
        await apiRequest(`/wishlist/${entry.id}/`, { token, method: "DELETE" });
      else
        await apiRequest("/wishlist/", {
          token,
          method: "POST",
          body: { menu_item: id },
        });
      saved.reload();
      toast.success(
        entry ? "Removed from saved dishes" : "Saved for your next craving",
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className="container">
          <div className="breadcrumb">
            <Link
              to={item ? `/restaurant/${item.restaurant}` : "/search"}
              className="flex-row"
            >
              <ArrowLeft size={15} />
              Back to the menu
            </Link>
          </div>
          <ErrorNotice error={error} onRetry={reload} />
          {loading && <Skeleton count={2} />}
          {item && (
            <section className="detail-grid">
              <FoodImage className="detail-photo" item={item} eager />
              <div className="detail-content">
                <div className="flex-row between">
                  <span className="flex-row">
                    <VegMark veg={item.is_vegetarian} />
                    <span className="tiny muted">
                      {item.is_vegetarian ? "VEGETARIAN" : "NON VEGETARIAN"}
                    </span>
                  </span>
                  <button
                    className="icon-button"
                    onClick={toggle}
                    disabled={saving || saved.loading}
                    aria-label={
                      saved.data?.results.length ? "Unsave dish" : "Save dish"
                    }
                  >
                    <Heart
                      size={20}
                      fill={saved.data?.results.length ? "#e85e2b" : "none"}
                      color={
                        saved.data?.results.length ? "#e85e2b" : "currentColor"
                      }
                    />
                  </button>
                </div>
                <h1>{item.name}</h1>
                <Link
                  className="text-link"
                  to={`/restaurant/${item.restaurant}`}
                >
                  {item.restaurant_detail?.name}
                  <ArrowRight size={16} />
                </Link>
                <p className="muted">
                  {item.description || "Prepared fresh when you order."}
                </p>
                <div className="restaurant-details">
                  <Rating value={item.restaurant_detail?.average_rating} />
                  <span>
                    <Clock3 size={15} />
                    {item.preparation_minutes} min preparation
                  </span>
                </div>
                <div className="tag-list">
                  {item.tags?.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                  {item.calories && <span>{item.calories} kcal</span>}
                </div>
                <p className="detail-price">{money(item.price)}</p>
                <AddButton item={item} />
                <p className="form-help">
                  Have an allergy or a special request? Contact the restaurant
                  before ordering. Dietary details are provided by the
                  restaurant.
                </p>
              </div>
            </section>
          )}
        </div>
        <CartDock />
      </main>
    </>
  );
}
