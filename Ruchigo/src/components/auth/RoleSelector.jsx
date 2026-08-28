import { motion } from "framer-motion";
import {
  User,
  Truck,
  UtensilsCrossed,
} from "lucide-react";

const roles = [
  {
    id: "customer",
    label: "Customer",
    icon: User,
    color: "from-orange-400 to-red-500",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: UtensilsCrossed,
    color: "from-amber-400 to-yellow-500",
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: Truck,
    color: "from-sky-400 to-indigo-500",
  },
];

const RoleSelector = ({
  selectedRole,
  onSelectRole,
  availableRoles = roles,
}) => {
  return (
    <div className="mb-6">
      <label className="block mb-3 text-sm font-semibold text-gray-700">
        Select Your Role
      </label>

      <div className="grid grid-cols-2 gap-4">
        {availableRoles.map((role) => {
          const Icon = role.icon;

          return (
            <motion.button
              key={role.id}
              type="button"
              whileHover={{
                scale: 1.05,
                y: -3,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() => onSelectRole(role.id)}
              className={`rounded-2xl border-2 p-4 transition-all duration-300

              ${
                selectedRole === role.id
                  ? "border-orange-500 bg-orange-50 shadow-lg"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              <div
                className={`w-14 h-14 mx-auto rounded-full bg-gradient-to-r ${role.color}
                flex items-center justify-center text-white shadow-md`}
              >
                <Icon size={26} />
              </div>

              <h3 className="mt-3 font-semibold text-gray-800">
                {role.label}
              </h3>

              {selectedRole === role.id && (
                <motion.div
                  layoutId="selectedRole"
                  className="mt-2 text-xs font-semibold text-orange-600"
                >
                  ✓ Selected
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
