export const ADMIN_ROLES = ["owner", "manager", "sales", "support", "readonly"];

export function getAdminRole() {
  const r = String(process.env.ADMIN_ROLE || "owner").trim().toLowerCase();
  return ADMIN_ROLES.includes(r) ? r : "owner";
}

export function roleCanWrite(role = getAdminRole()) {
  return role !== "readonly";
}
