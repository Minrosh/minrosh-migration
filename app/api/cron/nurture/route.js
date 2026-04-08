import { processNurtureQueue } from "@/lib/nurture-sequences";

function cronSecretFromRequest(request) {
  const header = String(request.headers.get("x-cron-secret") || "").trim();
  if (header) return header;
  const auth = String(request.headers.get("authorization") || "").trim();
  const m = /^Bearer\s+(\S+)/i.exec(auth);
  return m ? m[1].trim() : "";
}

function isAuthorized(request) {
  const secret = String(process.env.NURTURE_CRON_SECRET || "").trim();
  if (!secret) return false;
  if (process.env.NODE_ENV === "production" && secret.length < 16) {
    return false;
  }
  const got = cronSecretFromRequest(request);
  return Boolean(got && got === secret);
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const startedAt = new Date();
  const result = await processNurtureQueue({ now: startedAt });
  return Response.json({
    ok: Boolean(result?.ok),
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    ...result,
  });
}
