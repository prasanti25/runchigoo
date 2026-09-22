import { User, Bike, Store, ShieldCheck } from "lucide-react";
const roles = [
  { id: "customer", label: "Customer", icon: User },
  { id: "restaurant", label: "Restaurant", icon: Store },
  { id: "delivery", label: "Delivery", icon: Bike },
];
export default function RoleSelector({
  selectedRole,
  onSelectRole,
  availableRoles = roles,
  allowAdmin = false,
}) {
  const displayed = allowAdmin
    ? [...availableRoles, { id: "admin", label: "Admin", icon: ShieldCheck }]
    : availableRoles;
  return (
    <fieldset className="auth-roles">
      <legend>Continue as</legend>
      <div>
        {displayed.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={selectedRole === id}
            onClick={() => onSelectRole(id)}
            className={selectedRole === id ? "selected" : ""}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
