import { motion } from "framer-motion";

const AuthInput = ({
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
}) => {
  return (
    <div className="mb-5">
      {/* Label */}
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-semibold text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      {/* Input Container */}
      <motion.div
        whileFocus={{ scale: 1.01 }}
        className={`flex items-center rounded-xl border transition-all duration-300 bg-white

        ${
          error
            ? "border-red-400"
            : "border-gray-300 focus-within:border-orange-500"
        }

        focus-within:ring-4
        focus-within:ring-orange-100`}
      >
        {Icon && (
          <div className="px-4 text-orange-500">
            <Icon size={20} />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          {...inputProps}
          className="w-full py-3 pr-4 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
        />
      </motion.div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default AuthInput;
