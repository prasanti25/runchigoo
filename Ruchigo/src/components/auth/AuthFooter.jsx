import { Link } from "react-router-dom";
import { Heart, ShieldCheck, Lock } from "lucide-react";
import { motion } from "framer-motion";

const AuthFooter = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-8"
    >
      {/* Security Features */}
      <div className="grid grid-cols-3 gap-4 text-center mb-6">

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <ShieldCheck className="text-orange-500" size={20} />
          </div>

          <span className="text-xs mt-2 text-gray-600">
            Secure
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Lock className="text-orange-500" size={20} />
          </div>

          <span className="text-xs mt-2 text-gray-600">
            Encrypted
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Heart className="text-orange-500" size={20} />
          </div>

          <span className="text-xs mt-2 text-gray-600">
            Trusted
          </span>
        </div>

      </div>

      {/* Links */}
      <div className="flex justify-center gap-6 text-sm text-gray-500 mb-5">

        <Link
          to="/privacy"
          className="hover:text-orange-500 transition"
        >
          Privacy
        </Link>

        <Link
          to="/terms"
          className="hover:text-orange-500 transition"
        >
          Terms
        </Link>

        <Link
          to="/support"
          className="hover:text-orange-500 transition"
        >
          Support
        </Link>

      </div>

      {/* Copyright */}
      <p className="text-center text-xs text-gray-400">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-orange-500">
          RuchiGo
        </span>

        {" "}• Crafted with{" "}

        <Heart
          size={12}
          className="inline text-red-500 fill-red-500"
        />

        {" "}for food lovers.
      </p>
    </motion.div>
  );
};

export default AuthFooter;