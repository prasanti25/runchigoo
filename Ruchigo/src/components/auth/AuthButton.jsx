import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const AuthButton = ({
  children,
  type = "button",
  onClick,
  loading = false,
  disabled = false,
  fullWidth = true,
  variant = "primary",
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white hover:shadow-orange-300",

    secondary:
      "bg-white border border-orange-400 text-orange-600 hover:bg-orange-50",

    danger:
      "bg-red-500 text-white hover:bg-red-600",

    success:
      "bg-green-500 text-white hover:bg-green-600",
  };

  return (
    <motion.button
      whileHover={{
        scale: loading || disabled ? 1 : 1.02,
      }}
      whileTap={{
        scale: loading || disabled ? 1 : 0.97,
      }}
      transition={{
        duration: 0.2,
      }}
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}

        h-12
        rounded-xl
        font-semibold
        shadow-lg
        transition-all
        duration-300
        flex
        items-center
        justify-center
        gap-2

        ${
          loading || disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer"
        }
      `}
    >
      {loading ? (
        <>
          <Loader2
            size={20}
            className="animate-spin"
          />
          Please wait...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default AuthButton; 