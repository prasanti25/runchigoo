import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
export default function PasswordInput({
  label = "Password",
  name = "password",
  value,
  onChange,
  placeholder = "Enter your password",
  error,
  required = false,
  disabled = false,
  autoComplete = "current-password",
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-field">
      <label htmlFor={name}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className={`auth-input ${error ? "invalid" : ""}`}>
        <LockKeyhole size={18} aria-hidden="true" />
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        <button
          type="button"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p className="auth-field-error" id={`${name}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
