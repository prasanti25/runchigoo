import { motion } from "framer-motion";

const AuthTabs = ({
  activeTab = "login",
  onChange,
}) => {
  return (
    <div className="relative flex w-full rounded-2xl bg-orange-100 p-1 mb-6">
      {/* Animated Background */}
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 30,
        }}
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-lg ${
          activeTab === "login"
            ? "left-1"
            : "left-[calc(50%+2px)]"
        }`}
      />

      {/* Login Tab */}
      <button
        type="button"
        onClick={() => onChange("login")}
        className={`relative z-10 flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
          activeTab === "login"
            ? "text-white"
            : "text-gray-700 hover:text-orange-600"
        }`}
      >
        Login
      </button>

      {/* Register Tab */}
      <button
        type="button"
        onClick={() => onChange("register")}
        className={`relative z-10 flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
          activeTab === "register"
            ? "text-white"
            : "text-gray-700 hover:text-orange-600"
        }`}
      >
        Register
      </button>
    </div>
  );
};

export default AuthTabs;