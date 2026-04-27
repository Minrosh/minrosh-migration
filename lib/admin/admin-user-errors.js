export class AdminUserError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AdminUserError";
    this.code = String(code || "ADMIN_USER_ERROR");
  }
}

export function adminUserError(code, message) {
  return new AdminUserError(code, message);
}
