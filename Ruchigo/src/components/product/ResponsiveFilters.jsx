import { useState, useSyncExternalStore } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

const query = "(min-width: 768px)";
const subscribe = (callback) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};

export default function ResponsiveFilters({ title, active = false, children }) {
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  );
  const [expanded, setExpanded] = useState(false);
  return (
    <details className="admin-responsive-filters" open={desktop || expanded}>
      <summary
        onClick={(event) => {
          // Keep React as the single source of truth. Native toggle events arrive
          // asynchronously and can race a mobile-to-desktop resize.
          event.preventDefault();
          if (!desktop) setExpanded((value) => !value);
        }}
      >
        <SlidersHorizontal size={16} />
        <span>{title}</span>
        {active && <small>Applied</small>}
        <ChevronDown size={16} />
      </summary>
      {children}
    </details>
  );
}
