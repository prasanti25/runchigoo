import logo from "../../assets/images/ruchigo-logo.jpeg";
import { motion } from "framer-motion";

const Logo = ({
  className = "h-14 w-auto",
  showText = true,
  animate = true,
  type = "full",
  textClassName = "",
}) => {
  const shouldShowText = type === "icon" ? false : showText || type === "full";

  const content = (
    <div className="flex items-center gap-3">
      <img
        src={logo}
        alt="RuchiGo Logo"
        className={`${className} object-contain drop-shadow-lg`}
      />

      {shouldShowText && (
        <div className="leading-tight">
          <h1
            className={`text-xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text sm:text-2xl ${textClassName}`}
          >
            RuchiGo
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-500 sm:text-xs">
            Food Delivery
          </p>
        </div>
      )}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ scale: 1.03 }}
      className="inline-flex items-center"
    >
      {content}
    </motion.div>
  );
};

export default Logo;