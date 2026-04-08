import { runAccountingSync } from "@/lib/invoice/accounting-sync-service";

function authorized(request) {
  const expected = String(process.env.INVOICE_SYNC_CRON_SECRET || "").trim();
  if (!expected) return false;
  const got = String(request.headers.get("x-cron-secret") || new URL(request.url).searchParams.get("secret") || "").trim();
  return got && got === expected;
}

export async function GET(request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const provider = new URL(request.url).searchParams.get("provider") || "xero";
  return Response.json(runAccountingSync(provider));
}

export async function POST(request) {
  return GET(request);
}
