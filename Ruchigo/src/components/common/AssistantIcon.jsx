// A small, code-native dot mark for discovery. Not the RuchiGo brand logo.
export default function AssistantIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      className={`assistant-dot-icon ${className}`}
      fill="currentColor"
      aria-hidden="true"
    >
      {[
        [-2, 0],
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -2],
        [0, -1],
        [0, 0],
        [0, 1],
        [0, 2],
        [1, -1],
        [1, 0],
        [1, 1],
        [2, 0],
      ].map(([x, y]) => (
        <circle
          key={`${x}:${y}`}
          cx={14 + x * 4.5}
          cy={14 + y * 4.5}
          r={x === 0 && y === 0 ? 2 : 1.5}
        />
      ))}
    </svg>
  );
}
