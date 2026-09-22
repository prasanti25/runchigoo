import { Loader2, ArrowRight } from "lucide-react";
export default function AuthButton({
  children,
  type = "button",
  onClick,
  loading = false,
  disabled = false,
  fullWidth = true,
  variant = "primary",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`btn auth-submit ${variant === "success" ? "dark" : variant} ${fullWidth ? "w-full" : ""}`}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Please wait…
        </>
      ) : (
        <>
          {children}
          <ArrowRight size={17} />
        </>
      )}
    </button>
  );
}
