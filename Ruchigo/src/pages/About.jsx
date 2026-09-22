import { Link } from "react-router-dom";
import { ArrowRight, Bike, ShoppingBag, UtensilsCrossed } from "lucide-react";
import InfoLayout from "../components/product/InfoLayout.jsx";

export default function AboutPage() {
  return (
    <InfoLayout
      eyebrow="A LITTLE ABOUT RUCHIGO"
      title="Good food belongs in your everyday."
      description="A place to discover a new kitchen, revisit a favourite dish, and bring your next meal a little closer."
    >
      <section className="about-story">
        <div>
          <p className="eyebrow">FROM LOCAL KITCHENS, WITH LOVE</p>
          <h2>
            More than a menu.
            <br />
            Your next favourite.
          </h2>
          <p>
            RuchiGo brings restaurant discovery, ordering and delivery progress
            into one place. Explore dishes, see your total before checkout, and
            follow your meal from the kitchen to handover.
          </p>
          <Link className="btn primary" to="/search">
            Find something you’ll love <ArrowRight size={16} />
          </Link>
        </div>
        <img
          src="/food/biryani.webp"
          alt="A bowl of biryani with fresh herbs"
          width={720}
          height={720}
          loading="lazy"
        />
      </section>
      <div className="info-card-grid">
        {[
          [
            ShoppingBag,
            "For your everyday cravings",
            "Search the current menu, save dishes and reorder a favourite.",
            "/search",
            "Explore the menu",
          ],
          [
            UtensilsCrossed,
            "For the people behind the food",
            "Manage your restaurant profile, dishes, availability and incoming orders.",
            "/register",
            "Join as a restaurant",
          ],
          [
            Bike,
            "For the people on the move",
            "Accept requests, confirm kitchen pickup and complete the delivery.",
            "/register",
            "Join as a delivery partner",
          ],
        ].map(([Icon, title, copy, to, action]) => (
          <article className="info-card" key={title}>
            <Icon size={25} strokeWidth={1.5} />
            <h2>{title}</h2>
            <p>{copy}</p>
            <Link className="text-link" to={to}>
              {action}
              <ArrowRight size={15} />
            </Link>
          </article>
        ))}
      </div>
    </InfoLayout>
  );
}
