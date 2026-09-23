export default function AnimatedMenuIcon({ open = false }) {
  return (
    <span
      className={`animated-menu-icon${open ? " is-open" : ""}`}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </span>
  );
}
