import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "../common/Logo";

const floatingIcons = [
  { icon: "🍕", label: "Pizza" },
  { icon: "🍔", label: "Burger" },
  { icon: "🥗", label: "Healthy" },
  { icon: "☕", label: "Coffee" },
];

const AuthLayout = ({
  children,
  title = "Welcome to RuchiGo",
  subtitle = "Fresh Food Delivered Fast",
}) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,107,53,0.16),_transparent_25%),linear-gradient(135deg,_#fff8f5_0%,_#ffffff_45%,_#fff1e8_100%)] text-gray-900">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {floatingIcons.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-full border border-white/70 bg-white/75 px-3 py-2 text-xl shadow-lg backdrop-blur-md"
              style={{
                top: `${12 + index * 18}%`,
                left: `${6 + index * 20}%`,
              }}
            >
              {item.icon}
            </motion.div>
          ))}
        </div>

        <div className="grid w-full max-w-6xl items-stretch overflow-hidden rounded-[32px] border border-orange-100 bg-white/75 shadow-[0_30px_120px_-50px_rgba(255,107,53,0.8)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden min-h-[680px] overflow-hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200"
              alt="Chef preparing delicious food"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

            <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <Link to="/" aria-label="Go to RuchiGo home" className="inline-flex rounded-xl focus:outline-none focus:ring-2 focus:ring-white">
                  <Logo showText />
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <h1 className="text-5xl font-extrabold leading-tight">Delicious Food,<br />Delivered To Your Door.</h1>
                <p className="mt-5 max-w-md text-lg text-orange-100">Discover restaurants near you and enjoy fast delivery with RuchiGo.</p>
              </motion.div>

              <motion.div className="grid grid-cols-3 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold">500+</h2>
                  <p className="text-sm text-orange-100">Restaurants</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold">50K+</h2>
                  <p className="text-sm text-orange-100">Customers</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold">4.9★</h2>
                  <p className="text-sm text-orange-100">Ratings</p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-lg rounded-[28px] border border-orange-100 bg-white/85 p-6 shadow-2xl shadow-orange-100 backdrop-blur-xl sm:p-8"
            >
              <div className="mb-6 flex justify-center lg:hidden">
                <Link to="/" aria-label="Go to RuchiGo home" className="inline-flex rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <Logo showText={false} className="h-14 w-auto" />
                </Link>
              </div>

              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200">
                  <span className="text-2xl">🍽️</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h2>
                <p className="mt-2 text-sm text-gray-500 sm:text-base">{subtitle}</p>
              </div>

              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
