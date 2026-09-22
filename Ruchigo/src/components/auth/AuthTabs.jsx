export default function AuthTabs({ activeTab = "login", onChange }) {
  return (
    <div className="auth-tabs" aria-label="Account access">
      {[
        ["login", "Sign in"],
        ["register", "Create account"],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={activeTab === value}
          className={activeTab === value ? "active" : ""}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
