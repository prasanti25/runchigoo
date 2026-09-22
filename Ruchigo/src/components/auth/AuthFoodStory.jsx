import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

const photos = [
  {
    src: "/food/biryani.webp",
    name: "biryani",
    caption: "Comfort in every bite.",
  },
  {
    src: "/food/pizza.webp",
    name: "pizza",
    caption: "For your pizza kind of day.",
  },
  {
    src: "/food/burger.webp",
    name: "burger",
    caption: "Big cravings. Happy moments.",
  },
  {
    src: "/food/veg-thali.webp",
    name: "vegetarian thali",
    caption: "A little taste of home.",
  },
];

export default function AuthFoodStory() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const panel = useRef(null);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(motion.matches);
    motion.addEventListener("change", change);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(panel.current);
    return () => {
      motion.removeEventListener("change", change);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (paused || hovered || reduced || !visible) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((value) => (value + 1) % photos.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [paused, hovered, reduced, visible]);
  return (
    <aside
      ref={panel}
      className="auth-visual auth-food-story"
      aria-label="A little RuchiGo inspiration"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setPaused(true)}
    >
      <div className="auth-visual-copy">
        <span className="auth-editorial-label">GOOD FOOD STARTS HERE</span>
        <h2>
          Every craving
          <br />
          has a <em>home.</em>
        </h2>
        <p>
          Discover your next favourite.
          <br />
          Fresh from a kitchen near you.
        </p>
      </div>
      <div className="auth-photo-sequence">
        {photos.map((photo, position) => (
          <img
            key={photo.src}
            src={photo.src}
            alt={position === index ? `A freshly served ${photo.name}` : ""}
            aria-hidden={position !== index}
            className={position === index ? "active" : ""}
            fetchPriority={position === 0 ? "high" : "low"}
            decoding="async"
          />
        ))}
      </div>
      <div className="auth-photo-caption">
        <span>
          <MapPin size={16} />
          {photos[index].caption}
        </span>
        <div className="auth-photo-dots" aria-label="Food photos">
          {photos.map((photo, position) => (
            <button
              key={photo.src}
              type="button"
              aria-label={`Show ${photo.name} photo`}
              aria-pressed={index === position}
              onClick={() => {
                setIndex(position);
                setPaused(true);
              }}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
