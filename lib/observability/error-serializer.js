export function serializeError(error) {
  if (!error) return { message: "unknown_error" };
  if (typeof error === "string") return { message: error.slice(0, 400) };
  const e = /** @type {{ name?: string, message?: string, stack?: string, code?: string }} */ (error);
  return {
    name: String(e.name || "Error").slice(0, 120),
    message: String(e.message || "unknown_error").slice(0, 400),
    code: e.code ? String(e.code).slice(0, 120) : undefined,
    stack: e.stack ? String(e.stack).slice(0, 4000) : undefined,
  };
}
