import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, SlidersHorizontal, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { money, useDeliveryLocation, useRemote } from "../../lib/product.js";
import {
  ErrorNotice,
  FoodCard,
  RestaurantCard,
  SectionTitle,
  Skeleton,
} from "./UI.jsx";

export function PersonalizedFeed({ compact = false }) {
  const { token, role } = useAuth();
  const { city } = useDeliveryLocation();
  const feed = useRemote(
    !compact || (token && role === "customer")
      ? `/intelligence/feed/?city=${encodeURIComponent(city || "")}`
      : null,
    token,
  );
  const data = feed.data;
  if (compact && (!token || role !== "customer")) return null;
  return (
    <section className="personalized-feed">
      <SectionTitle
        title={
          data?.personalized
            ? "More your kind of food"
            : "Find your next favourite"
        }
        to="/for-you?tab=taste"
        action="Your preferences"
      />
      <ErrorNotice error={feed.error} onRetry={feed.reload} />
      {feed.loading && <Skeleton count={3} />}
      {data && (
        <>
          {!data.restaurants.length && (
            <div className="panel">
              <h3>No kitchens match these preferences yet.</h3>
              <p className="muted">
                Try another city or update your food preferences.
              </p>
              <Link to="/for-you?tab=taste" className="btn secondary">
                Edit preferences
              </Link>
            </div>
          )}
          <div className="restaurant-grid">
            {data.restaurants.slice(0, compact ? 3 : 6).map((restaurant) => (
              <div key={restaurant.id}>
                <RestaurantCard restaurant={restaurant} />
                <p className="personalized-reason">{restaurant.match_reason}</p>
              </div>
            ))}
          </div>
          {!compact && (
            <>
              {!!data.saved_restaurants.length && (
                <>
                  <SectionTitle title="Your saved restaurants" />
                  <div className="restaurant-grid">
                    {data.saved_restaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                      />
                    ))}
                  </div>
                </>
              )}
              {!!data.recent_restaurants.length && (
                <>
                  <div className="section-title">
                    <h2>Recently explored</h2>
                    <button
                      type="button"
                      className="text-button"
                      onClick={async () => {
                        try {
                          await apiRequest("/intelligence/visits/", {
                            token,
                            method: "DELETE",
                          });
                          feed.reload();
                        } catch (err) {
                          toast.error(err.message);
                        }
                      }}
                    >
                      Clear history
                    </button>
                  </div>
                  <div className="restaurant-grid">
                    {data.recent_restaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                      />
                    ))}
                  </div>
                </>
              )}
              {!!data.recent_items.length && (
                <>
                  <SectionTitle title="Enjoyed before" />
                  <div className="food-grid">
                    {data.recent_items.map((item) => (
                      <FoodCard key={item.id} item={item} />
                    ))}
                  </div>
                </>
              )}
              {!!data.coupons.length && (
                <>
                  <SectionTitle title="Savings to explore" />
                  <p className="muted">
                    Selected for your account. Minimum spend and restaurant
                    restrictions still apply at checkout.
                  </p>
                  <div className="personalized-offers">
                    {data.coupons.map((coupon) => (
                      <article className="personalized-coupon" key={coupon.id}>
                        <Tag size={22} />
                        <p className="eyebrow">{coupon.match_reason}</p>
                        <h3>
                          {coupon.discount_amount
                            ? `${money(coupon.discount_amount)} off`
                            : `${Number(coupon.discount_percent)}% off`}
                        </h3>
                        <p>{coupon.restaurant_name}</p>
                        <small>
                          Min. order {money(coupon.min_order_amount)}
                          {coupon.max_discount
                            ? ` · Up to ${money(coupon.max_discount)} off`
                            : ""}
                        </small>
                        <small>
                          Ends{" "}
                          {new Date(coupon.ends_at).toLocaleDateString("en-IN")}
                        </small>
                        <button
                          className="coupon-code"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(coupon.code);
                              toast.success(
                                "Coupon copied. Apply it in your cart.",
                              );
                            } catch {
                              toast.error(
                                `Use code ${coupon.code} in your cart.`,
                              );
                            }
                          }}
                          aria-label={`Copy coupon ${coupon.code}`}
                        >
                          {coupon.code}
                        </button>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

export function RestaurantAffinity({ restaurantId }) {
  const { token, role } = useAuth();
  const saved = useRemote(
    token && role === "customer" ? "/intelligence/saved/" : null,
    token,
  );
  const [busy, setBusy] = useState(false);
  const selected = saved.data?.restaurant_ids?.includes(Number(restaurantId));
  useEffect(() => {
    if (!token || role !== "customer") return;
    const controller = new AbortController();
    apiRequest("/intelligence/visits/", {
      token,
      method: "POST",
      body: { restaurant_id: restaurantId },
      signal: controller.signal,
    }).catch(() => {});
    return () => controller.abort();
  }, [restaurantId, token, role]);
  if (!token)
    return (
      <Link to="/login" className="btn secondary">
        <Heart size={16} /> Save restaurant
      </Link>
    );
  if (role !== "customer") return null;
  return (
    <div>
      <button
        className="btn secondary"
        type="button"
        disabled={busy || saved.loading || !!saved.error}
        aria-pressed={!!selected}
        onClick={async () => {
          setBusy(true);
          try {
            await apiRequest("/intelligence/saved/", {
              token,
              method: selected ? "DELETE" : "POST",
              body: { restaurant_id: restaurantId },
            });
            saved.reload();
            toast.success(
              selected ? "Restaurant removed from saved" : "Restaurant saved",
            );
          } catch (err) {
            toast.error(err.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Heart size={16} fill={selected ? "currentColor" : "none"} />
        {selected ? "Saved restaurant" : "Save restaurant"}
      </button>
      <ErrorNotice error={saved.error} onRetry={saved.reload} />
    </div>
  );
}

export function TastePreferences() {
  const { token, role } = useAuth();
  const preferences = useRemote(
    token && role === "customer" ? "/intelligence/preferences/" : null,
    token,
  );
  if (!token || role !== "customer")
    return (
      <div className="panel">
        <h2>Your taste, remembered.</h2>
        <p className="muted">
          Sign in as a customer to save your food preferences, favourite
          kitchens and browsing history.
        </p>
        <Link className="btn primary" to="/login">
          Sign in
        </Link>
      </div>
    );
  return (
    <>
      <ErrorNotice error={preferences.error} onRetry={preferences.reload} />
      {preferences.loading && <Skeleton count={1} />}
      {preferences.data && (
        <TasteForm
          key={`${token}:${JSON.stringify(preferences.data)}`}
          initial={preferences.data}
          token={token}
          reload={preferences.reload}
        />
      )}
    </>
  );
}

function TasteForm({ initial, token, reload }) {
  const [form, setForm] = useState(initial);
  const [cuisines, setCuisines] = useState(initial.cuisines.join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiRequest("/intelligence/preferences/", {
        token,
        method: "PATCH",
        body: {
          ...form,
          budget: form.budget ? Number(form.budget) : null,
          cuisines: cuisines
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        },
      });
      toast.success("Your food preferences are saved");
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="taste-form panel" onSubmit={submit}>
      <div className="section-title">
        <div>
          <p className="eyebrow">MADE MORE PERSONAL</p>
          <h2>Your food preferences</h2>
        </div>
        <SlidersHorizontal size={24} />
      </div>
      <p className="muted">
        Used for your personalised home feed and assistant. Quick-pick filters
        can be set separately.
      </p>
      <label className="check-label">
        <input
          type="checkbox"
          checked={form.vegetarian}
          onChange={(event) =>
            setForm({ ...form, vegetarian: event.target.checked })
          }
        />{" "}
        Vegetarian dishes only
      </label>
      <fieldset>
        <legend>Restaurant-labelled dietary options</legend>
        <div className="taste-tags">
          {["vegan", "jain"].map((tag) => (
            <label className="check-label" key={tag}>
              <input
                type="checkbox"
                checked={form.dietary_tags.includes(tag)}
                onChange={(event) =>
                  setForm({
                    ...form,
                    dietary_tags: event.target.checked
                      ? [...form.dietary_tags, tag]
                      : form.dietary_tags.filter((value) => value !== tag),
                  })
                }
              />
              {tag === "vegan" ? "Vegan" : "Jain"}
            </label>
          ))}
        </div>
        <small>
          Only dishes explicitly tagged by the restaurant are included. This
          does not guarantee ingredients or allergen safety.
        </small>
      </fieldset>
      <label>
        Usual budget per dish
        <input
          type="number"
          min="1"
          max="100000"
          placeholder="No limit"
          value={form.budget ?? ""}
          onChange={(event) => setForm({ ...form, budget: event.target.value })}
        />
        <small>Before extras, taxes and delivery.</small>
      </label>
      <label>
        Favourite cuisines or menu categories
        <input
          value={cuisines}
          maxLength={400}
          onChange={(event) => setCuisines(event.target.value)}
          placeholder="Indian, Pizza, South Indian"
        />
        <small>Separate up to eight preferences with commas.</small>
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          checked={form.use_order_history}
          onChange={(event) =>
            setForm({ ...form, use_order_history: event.target.checked })
          }
        />{" "}
        Use my delivered orders to personalise suggestions
      </label>
      <ErrorNotice error={error} />
      <div className="flex-row">
        <button className="btn primary" disabled={busy}>
          Save preferences
        </button>
        <button
          type="button"
          className="btn ghost"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await apiRequest("/intelligence/preferences/", {
                token,
                method: "DELETE",
              });
              toast.success(
                "Preferences and browsing history cleared. Saved restaurants are unchanged.",
              );
              reload();
            } catch (err) {
              setError(err.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Reset preferences & history
        </button>
      </div>
    </form>
  );
}
