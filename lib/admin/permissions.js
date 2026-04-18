export const ADMIN_ROLES = ["owner", "manager", "sales", "support", "readonly"];

/** Session-only roles for multi-user admin (`data/admin-users.json`). */
export const ADMIN_ACCOUNT_ROLES = ["super", "admin"];

export function getAdminRole() {
  const r = String(process.env.ADMIN_ROLE || "owner").trim().toLowerCase();
  return ADMIN_ROLES.includes(r) ? r : "owner";
}

export function isSuperRole(role) {
  return String(role || "").trim().toLowerCase() === "super";
}

export function roleCanWrite(role = getAdminRole()) {
  const r = String(role || "").trim().toLowerCase();
  if (r === "super" || r === "admin") return true;
  if (r === "readonly") return false;
  return ADMIN_ROLES.includes(r);
}
