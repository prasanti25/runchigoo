import Navbar from "../components/Navbar.jsx";
import Recommendations from "../components/product/Recommendations.jsx";
import { useSearchParams } from "react-router-dom";
import FoodAssistant from "../components/product/FoodAssistant.jsx";
import MealFeed from "../components/product/MealFeed.jsx";
import {
  PersonalizedFeed,
  TastePreferences,
} from "../components/product/PersonalizedFeed.jsx";

export default function ForYou() {
  const [params, setParams] = useSearchParams();
  const tab = ["chat", "picks", "taste", "quick"].includes(params.get("tab"))
    ? params.get("tab")
    : "feed";
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className={`container ${tab === "feed" ? "feed-container" : ""}`}>
          <div className="page-heading">
            <p className="eyebrow">MADE FOR YOUR APPETITE</p>
            <h1>{tab === "feed" ? "Your feed." : "What are you craving?"}</h1>
            <p className="muted">
              Tell us what sounds good. Explore matching dishes, then open the
              restaurant’s menu to make your meal.
            </p>
          </div>
          <nav className="for-you-tabs" aria-label="Personalised food tools">
            {[
              ["feed", "Your feed"],
              ["quick", "Quick picks"],
              ["chat", "Ask RuchiGo"],
              ["picks", "Picked for you"],
              ["taste", "Your taste"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-current={tab === value ? "page" : undefined}
                className={tab === value ? "active" : ""}
                onClick={() => setParams({ tab: value })}
              >
                {label}
              </button>
            ))}
          </nav>
          {tab === "feed" && <MealFeed />}
          {tab === "quick" && <Recommendations />}
          {tab === "chat" && <FoodAssistant />}
          {tab === "picks" && <PersonalizedFeed />}
          {tab === "taste" && <TastePreferences />}
        </div>
      </main>
    </>
  );
}
