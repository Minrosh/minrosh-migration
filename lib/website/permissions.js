import { getAdminRole, isSuperRole, roleCanWrite } from "@/lib/admin/permissions";

/** Website Manager permission flags (Sprint 2). */
export const WEBSITE_PERMS = {
  READ: "website:read",
  WRITE: "website:write",
  PUBLISH: "website:publish",
};

function normalizeRole(role) {
  return String(role || getAdminRole()).trim().toLowerCase();
}

/** Any authenticated admin session may view Website Manager. */
export function websiteCanRead(role) {
  const r = normalizeRole(role);
  if (r === "super" || r === "admin") return true;
  if (r === "readonly" || r === "sales" || r === "support") return true;
  return roleCanWrite(r) || ["owner", "manager"].includes(r);
}

/** Save draft, edit blocks, upload media. */
export function websiteCanWrite(role) {
  const r = normalizeRole(role);
  if (isSuperRole(r) || r === "admin") return true;
  if (r === "readonly" || r === "sales" || r === "support") return false;
  return roleCanWrite(r);
}

/** Copy draft → published (staging/admin; public still unwired in Sprint 2). */
export function websiteCanPublish(role) {
  const r = normalizeRole(role);
  if (isSuperRole(r) || r === "admin" || r === "owner") return true;
  if (r === "readonly" || r === "sales" || r === "support") return false;
  return r === "manager";
}

export function websitePermissionsForRole(role) {
  return {
    read: websiteCanRead(role),
    write: websiteCanWrite(role),
    publish: websiteCanPublish(role),
  };
}
