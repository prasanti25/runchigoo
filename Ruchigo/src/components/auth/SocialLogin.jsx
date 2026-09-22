import { motion } from "framer-motion";
import { Globe, Apple } from "lucide-react";
const providers = [
  {
    id: "google",
    name: "Google",
    icon: Globe,
    bg: "bg-white",
    text: "text-gray-700",
    border: "border-gray-300",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    icon: Globe,
    bg: "bg-blue-600",
    text: "text-white",
    border: "border-blue-600",
  },
  {
    id: "apple",
    name: "Apple",
    icon: Apple,
    bg: "bg-black",
    text: "text-white",
    border: "border-black",
  },
];

const SocialLogin = ({ onSocialLogin }) => {
  return (
    <div className="mt-6">
      {/* Divider */}
      <div className="flex items-center mb-6">
        <div className="flex-1 h-px bg-gray-300"></div>

        <span className="px-4 text-sm text-gray-500 font-medium">
          Or continue with
        </span>

        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {providers.map((provider) => {
          const Icon = provider.icon;

          return (
            <motion.button
              key={provider.id}
              whileHover={{
                scale: 1.03,
                y: -2,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="button"
              onClick={() => onSocialLogin?.(provider.id)}
              className={`
                ${provider.bg}
                ${provider.text}
                ${provider.border}

                border
                rounded-xl
                h-12

                flex
                items-center
                justify-center
                gap-2

                shadow-sm
                hover:shadow-lg
                transition-all
                duration-300
              `}
            >
              <Icon size={18} />

              <span className="font-medium">{provider.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SocialLogin;
