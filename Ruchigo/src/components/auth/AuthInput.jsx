export default function AuthInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  required = false,
  disabled = false,
  autoComplete = "off",
  ...inputProps
}) {
  return (
    <div className="auth-field">
      <label htmlFor={name}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className={`auth-input ${error ? "invalid" : ""}`}>
        {Icon && <Icon size={18} aria-hidden="true" />}
        <input
          {...inputProps}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>
      {error && (
        <p className="auth-field-error" id={`${name}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
