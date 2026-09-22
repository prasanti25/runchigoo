import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3 } from "lucide-react";
import { FoodImage, Rating, VegMark } from "./UI.jsx";
import { money } from "../../lib/product.js";

export default function MealCarousel({
  items,
  variant = "hero",
  label = "Meals to explore",
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const pointer = useRef(null);
  const swiped = useRef(false);
  const region = useRef(null);
  const count = Math.min(items.length, 5);
  const current = index % (count || 1);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(motion.matches);
    motion.addEventListener("change", change);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (region.current) observer.observe(region.current);
    return () => {
      motion.removeEventListener("change", change);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (count < 2 || paused || hovered || reduced || !visible) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((value) => (value + 1) % count);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [count, paused, hovered, reduced, visible]);
  const choose = (value) => {
    setIndex((value + count) % count);
    setPaused(true);
  };
  if (!count) return null;
  return (
    <section
      ref={region}
      className={`meal-carousel ${variant}`}
      aria-label={label}
      aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setPaused(true)}
    >
      <div
        className="meal-carousel-window"
        onPointerDown={(event) => {
          pointer.current = { x: event.clientX, y: event.clientY };
          swiped.current = false;
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
        onPointerUp={(event) => {
          if (!pointer.current) return;
          const dx = event.clientX - pointer.current.x,
            dy = event.clientY - pointer.current.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) && count > 1) {
            choose(current + (dx < 0 ? 1 : -1));
            swiped.current = true;
          }
          pointer.current = null;
        }}
        onClickCapture={(event) => {
          if (swiped.current) {
            event.preventDefault();
            swiped.current = false;
          }
        }}
      >
        <div
          className="meal-carousel-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {items.slice(0, count).map((item, position) => (
            <article
              key={item.id}
              className="meal-slide"
              aria-roledescription="slide"
              aria-label={`${position + 1} of ${count}: ${item.name}`}
              aria-hidden={current !== position}
              inert={current !== position}
            >
              <Link
                className="meal-slide-photo"
                to={`/restaurant/${item.restaurant}?dish=${item.id}`}
                draggable="false"
              >
                <FoodImage item={item} eager={position === 0} />
                <span className="meal-photo-label">
                  <VegMark veg={item.is_vegetarian} />
                  {item.is_vegetarian ? "Vegetarian" : "Non-vegetarian"}
                </span>
              </Link>
              <div className="meal-slide-info">
                <div className="meal-slide-restaurant">
                  <span>
                    {item.restaurant_detail?.name || item.category_name}
                  </span>
                  {Number(item.restaurant_detail?.average_rating) > 0 && (
                    <Rating value={item.restaurant_detail.average_rating} />
                  )}
                </div>
                <h2>
                  <Link to={`/restaurant/${item.restaurant}?dish=${item.id}`}>
                    {item.name}
                  </Link>
                </h2>
                {item.preparation_minutes > 0 && (
                  <p className="meal-prep">
                    <Clock3 size={14} />
                    {item.preparation_minutes} min kitchen prep
                  </p>
                )}
                <div className="meal-slide-action">
                  <div>
                    <strong>
                      {item.option_groups?.length ? "From " : ""}
                      {money(item.minimum_price ?? item.price)}
                    </strong>
                    <small>Per dish · extras & delivery additional</small>
                  </div>
                  <Link
                    className="btn dark"
                    to={`/restaurant/${item.restaurant}?dish=${item.id}`}
                  >
                    View meal
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      {count > 1 && (
        <div className="meal-carousel-controls">
          <div className="meal-carousel-dots">
            {items.slice(0, count).map((item, position) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show meal ${position + 1}: ${item.name}`}
                aria-pressed={current === position}
                onClick={() => choose(position)}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
