import { serializeError } from "./error-serializer";

function sanitizeValue(value) {
  if (value == null) return value;
  if (typeof value === "string") return value.slice(0, 2000);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.slice(0, 25).map((item) => sanitizeValue(item));
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = sanitizeValue(v);
    return out;
  }
  return String(value).slice(0, 2000);
}

function write(level, event, context = {}) {
  const obsFlag = String(process.env.OBS_JSON_LOG || "").trim().toLowerCase();
  const enabled = obsFlag === "true" || (process.env.NODE_ENV === "production" && obsFlag !== "false");
  if (!enabled && level !== "error") return;
  const payload = {
    ts: new Date().toISOString(),
    level,
    event: String(event || "event").slice(0, 120),
    ...sanitizeValue(context),
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export const obsLogger = {
  info(event, context = {}) {
    write("info", event, context);
  },
  warn(event, context = {}) {
    write("warn", event, context);
  },
  error(event, context = {}) {
    const withError =
      context && context.error ? { ...context, error: serializeError(context.error) } : context;
    write("error", event, withError);
  },
};
