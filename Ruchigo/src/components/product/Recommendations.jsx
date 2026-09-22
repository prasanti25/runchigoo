import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { useDeliveryLocation } from "../../lib/product.js";
import { EmptyState, ErrorNotice, FoodCard, Skeleton } from "./UI.jsx";

const preferenceKey = (value) =>
  JSON.stringify([
    value.q,
    value.city,
    value.vegetarian,
    String(value.budget || ""),
    String(value.max_prep || ""),
  ]);

export default function Recommendations() {
  const { token } = useAuth();
  const { city } = useDeliveryLocation();
  const [query, setQuery] = useState("");
  const [vegetarian, setVegetarian] = useState(false);
  const [budget, setBudget] = useState("");
  const [maxPrep, setMaxPrep] = useState("");
  const activeRequest = useRef(null);
  useEffect(() => () => activeRequest.current?.abort(), []);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const currentPreferences = {
    q: query.trim(),
    city: city || "",
    vegetarian,
    ...(budget ? { budget } : {}),
    ...(maxPrep ? { max_prep: maxPrep } : {}),
  };
  const changed =
    result && result.request !== preferenceKey(currentPreferences);
  const recommend = async (event, preset) => {
    event.preventDefault();
    const preferences = preset
      ? { ...currentPreferences, ...preset }
      : { ...currentPreferences };
    for (const key of ["budget", "max_prep"])
      if (!preferences[key]) delete preferences[key];
    if (preset) {
      setQuery(preferences.q);
      setVegetarian(preferences.vegetarian);
      setBudget(preferences.budget || "");
      setMaxPrep(preferences.max_prep || "");
    }
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await apiRequest("/discovery/recommendations/", {
        token,
        method: "POST",
        body: preferences,
        signal: controller.signal,
      });
      if (!controller.signal.aborted)
        setResult({ ...response, request: preferenceKey(preferences) });
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };
  return (
    <section className="recommendations-section" id="your-picks">
      <div className="ai-panel" aria-busy={busy}>
        <div className="ai-copy">
          <span className="ai-label">
            <Sparkles size={15} />
            YOUR NEXT GOOD MEAL
          </span>
          <h2>
            Less scrolling.
            <br />
            <em>More your kind of food.</em>
          </h2>
          <p>
            Your craving, your budget, and dishes from open restaurants. Every
            pick explains why it fits.
          </p>
          <p className="recommendation-location">
            <MapPin size={14} />
            {city || "All service cities"}
          </p>
        </div>
        <form onSubmit={recommend} className="ai-form">
          <label htmlFor="craving">What sounds good?</label>
          <div className="ai-input">
            <input
              id="craving"
              maxLength={200}
              disabled={busy}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Something spicy, comforting and filling…"
            />
          </div>
          <div className="ai-options">
            <label className="check-label">
              <input
                type="checkbox"
                checked={vegetarian}
                disabled={busy}
                onChange={(e) => setVegetarian(e.target.checked)}
              />
              Vegetarian only
            </label>
            <select
              aria-label="Meal budget"
              value={budget}
              disabled={busy}
              onChange={(e) => setBudget(e.target.value)}
            >
              <option value="">Any budget</option>
              <option value="150">Up to ₹150 / dish</option>
              <option value="250">Up to ₹250 / dish</option>
              <option value="500">Up to ₹500 / dish</option>
            </select>
          </div>
          <div className="ai-preparation">
            <Clock3 size={15} />
            <select
              aria-label="Preparation time"
              disabled={busy}
              value={maxPrep}
              onChange={(event) => setMaxPrep(event.target.value)}
            >
              <option value="">Any preparation time</option>
              <option value="20">Ready in up to 20 min</option>
              <option value="30">Ready in up to 30 min</option>
            </select>
          </div>
          <button
            className="btn primary ai-find-button"
            disabled={busy}
            aria-label="Find my food"
            type="submit"
          >
            {busy ? "Finding your matches…" : "Find my food"}
            <ArrowRight size={17} />
          </button>
          <div className="craving-presets" aria-label="Try a craving">
            {[
              [
                "Veg under ₹250",
                {
                  q: "A comforting vegetarian meal",
                  vegetarian: true,
                  budget: "250",
                  max_prep: "",
                },
              ],
              [
                "Pizza night",
                { q: "Pizza", vegetarian: false, budget: "500", max_prep: "" },
              ],
              [
                "Coffee break",
                {
                  q: "Cold coffee",
                  vegetarian: false,
                  budget: "150",
                  max_prep: "20",
                },
              ],
            ].map(([label, preset]) => (
              <button
                type="button"
                disabled={busy}
                key={label}
                onClick={(event) => recommend(event, preset)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="recommendation-fine-print">
            Budget is per dish, before extras and delivery. Preparation time is
            not delivery ETA. Confirm allergies with the restaurant.
          </p>
          <p className="ai-hint">
            Your food preferences help personalise these picks. Don’t include
            personal details.{" "}
            <Link to="/privacy#ai" className="underline">
              How recommendations use data
            </Link>
            .
          </p>
        </form>
      </div>
      <ErrorNotice
        error={error}
        onRetry={() => recommend({ preventDefault() {} })}
      />
      {busy && (
        <div
          className="mt-6"
          role="status"
          aria-label="Finding matching dishes"
        >
          <Skeleton count={3} />
        </div>
      )}
      {!busy && changed && (
        <div className="recommendation-stale" role="status">
          Preferences changed. Select “Find my food” to update your picks.
        </div>
      )}
      {!busy && result && !changed && (
        <div className="mt-6">
          {result.items.length ? (
            <>
              <p className="eyebrow mb-4">
                {result.source === "gemini"
                  ? "AI PICKS FOR YOUR CRAVING"
                  : "PICKS FROM THE CURRENT MENU"}
              </p>
              <div className="recommendation-result-note" role="status">
                <strong>
                  {result.items.length}{" "}
                  {result.items.length === 1 ? "match" : "matches"} from open
                  restaurants
                </strong>
                <span>
                  {result.source === "gemini"
                    ? "Chosen around your craving, budget and available dishes."
                    : result.status === "not_configured"
                      ? "Matched to your craving and menu filters."
                      : "Personalised ranking is temporarily unavailable. Showing menu matches instead."}
                </span>
                {result.preferences?.budget && (
                  <span>
                    Applied budget: up to ₹{result.preferences.budget} per dish
                    {result.preferences.vegetarian === "True"
                      ? " · Vegetarian only"
                      : ""}
                  </span>
                )}
              </div>
              <div className="food-grid">
                {result.items.map((item) => (
                  <FoodCard key={item.id} item={item} reason={item.reason} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title={
                result.status === "needs_clarification"
                  ? "What would you like to eat?"
                  : "Let’s try another craving"
              }
              description={
                result.status === "needs_clarification"
                  ? "We couldn’t understand that craving. Try “veg thali under ₹250”, “something spicy”, or pick a suggestion above."
                  : `No matching dishes${city ? ` in ${city}` : ""} within these preferences. Try another craving, budget or delivery city.`
              }
            />
          )}
        </div>
      )}
    </section>
  );
}
