import { runIntelligenceScan } from "@/lib/intelligence/scan";

function cronSecretFromRequest(request) {
  const header = String(request.headers.get("x-cron-secret") || "").trim();
  if (header) return header;
  const auth = String(request.headers.get("authorization") || "").trim();
  const m = /^Bearer\s+(\S+)/i.exec(auth);
  return m ? m[1].trim() : "";
}

function isAuthorized(request) {
  const secret = String(process.env.INTELLIGENCE_CRON_SECRET || "").trim();
  if (!secret) return false;
  if (process.env.NODE_ENV === "production" && secret.length < 16) return false;
  return cronSecretFromRequest(request) === secret;
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const startedAt = new Date();
  const result = await runIntelligenceScan({ actor: "cron" });
  return Response.json({
    ...result,
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
  });
}
