import { Link } from "react-router-dom";
import { ArrowRight, Clock3, MapPin, SlidersHorizontal } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useDeliveryLocation, useRemote } from "../../lib/product.js";
import { ErrorNotice, FoodCard, Skeleton } from "./UI.jsx";
import MealCarousel from "./MealCarousel.jsx";
import FoodAssistant from "./FoodAssistant.jsx";
import AssistantIcon from "../common/AssistantIcon.jsx";

export default function MealFeed() {
  const { token } = useAuth();
  const { city } = useDeliveryLocation();
  const feed = useRemote(
    `/intelligence/feed/?city=${encodeURIComponent(city || "")}`,
    token,
  );
  const dishes = feed.data?.items || [];
  const budget = dishes.filter(
    (item) => Number(item.minimum_price ?? item.price) <= 250,
  );
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date()),
  );
  const moment =
    hour < 11
      ? "A good morning starts with good food."
      : hour < 16
        ? "Make a little time for a great lunch."
        : hour < 19
          ? "A little something for your evening."
          : "Let’s make dinner a good one.";
  return (
    <div className="meal-feed">
      <div className="feed-desktop-layout">
        <div className="feed-primary">
          <div className="feed-moment">
            <span>
              <Clock3 size={15} />
              {new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "numeric",
                minute: "2-digit",
              }).format(new Date())}
            </span>
            <h2>{moment}</h2>
          </div>
          <div className="feed-location">
            <MapPin size={15} />
            <span>{city || "Explore available service cities"}</span>
            <Link to="/for-you?tab=taste">
              <SlidersHorizontal size={15} />
              Your taste
            </Link>
          </div>
          <ErrorNotice error={feed.error} onRetry={feed.reload} />
          {feed.loading ? (
            <Skeleton count={2} />
          ) : dishes.length ? (
            <MealCarousel
              key={dishes.map((dish) => dish.id).join(":")}
              items={dishes}
              variant="feed"
              label="Your meal inspiration"
            />
          ) : (
            !feed.error && (
              <section className="panel">
                <h3>No meals match just yet</h3>
                <p className="muted mt-3">
                  Try another city or adjust your saved preferences.
                </p>
                <Link className="btn secondary mt-3" to="/for-you?tab=taste">
                  Edit preferences
                </Link>
              </section>
            )
          )}
        </div>
        <aside className="feed-sidebar" aria-label="Find your next meal">
          <FoodAssistant feed />
          <Link to="/for-you?tab=taste" className="taste-invitation">
            <span className="feed-assistant-symbol">
              <AssistantIcon size={32} />
            </span>
            <div>
              <h2>More your kind of food.</h2>
              <p>Set your budget and food preferences.</p>
            </div>
            <ArrowRight size={22} />
          </Link>
        </aside>
      </div>
      {budget.length > 0 && (
        <section className="feed-meal-section">
          <div className="section-title">
            <h2>Good food. Under ₹250.</h2>
            <Link className="text-link" to="/search?budget=250&view=dishes">
              Explore
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="feed-food-rail">
            {budget.slice(0, 6).map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
          <p className="form-help">
            Dish prices, before extras and delivery. No offer is applied
            automatically.
          </p>
        </section>
      )}
    </div>
  );
}
