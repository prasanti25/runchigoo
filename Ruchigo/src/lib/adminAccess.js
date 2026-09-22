export function hasAdminScope(user, scope) {
  if (user?.role !== "admin") return false;
  if (user.can_manage_admins) return true;
  const scopes = user.admin_scopes || ["*"];
  return scopes.includes("*") || scopes.includes(scope);
}

const routeScopes = {
  "/admin-users": "people",
  "/admin-restaurants": "partners",
  "/admin-delivery-partners": "partners",
  "/admin-partner-accounts": "partners",
  "/admin-orders": "orders",
  "/admin-payments": "finance",
  "/admin-reports": "reports",
  "/admin-offers": "promotions",
  "/admin-catalog": "catalog",
  "/admin-reviews": "moderation",
  "/admin-activity": "audit",
  "/admin-delivery-zones": "policies",
  "/admin-order-policy": "policies",
  "/support": "support",
};

export function canOpenAdminRoute(user, path) {
  if (path === "/admin-access") return Boolean(user?.can_manage_admins);
  return !routeScopes[path] || hasAdminScope(user, routeScopes[path]);
}
