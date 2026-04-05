/**
 * Optional structured stderr lines for log aggregators (enable with SECURITY_JSON_LOG=true).
 * Not a full monitoring product — pairs with external alerts on log patterns.
 */
export function logSecurityEvent(event, payload = {}) {
  if (process.env.SECURITY_JSON_LOG !== "true") return;
  try {
    console.log(
      JSON.stringify({
        t: new Date().toISOString(),
        event: String(event || "event").slice(0, 120),
        ...payload,
      })
    );
  } catch {
    /* ignore */
  }
}
