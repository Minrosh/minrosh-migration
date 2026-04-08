import { runRecurringBilling } from "@/lib/invoice/recurring-service";

function authorized(request) {
  const expected = String(process.env.INVOICE_RECURRING_CRON_SECRET || "").trim();
  if (!expected) return false;
  const got = String(request.headers.get("x-cron-secret") || new URL(request.url).searchParams.get("secret") || "").trim();
  return got && got === expected;
}

export async function GET(request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(runRecurringBilling(new Date()));
}

export async function POST(request) {
  return GET(request);
}
