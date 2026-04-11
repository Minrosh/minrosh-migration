import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { createSupabaseAdminClient, getSupabaseUrl } from "@/lib/supabase/server";

/**
 * Connectivity probe against Supabase Postgres (table minrosh_db_ping).
 * Apply migration: supabase/migrations/20260212120000_minrosh_db_ping.sql
 */
export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const url = getSupabaseUrl();
  const hasKey = Boolean(String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim());
  if (!url || !hasKey) {
    return Response.json({
      ok: false,
      configured: false,
      detail: "Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY",
    });
  }
  const client = createSupabaseAdminClient();
  if (!client) {
    return Response.json({ ok: false, configured: false, detail: "Could not create Supabase client" });
  }
  const { data, error } = await client.from("minrosh_db_ping").select("id,updated_at").eq("id", 1).maybeSingle();
  if (error) {
    return Response.json({
      ok: false,
      configured: true,
      detail: error.message,
      hint: "Create table minrosh_db_ping via supabase/migrations/20260212120000_minrosh_db_ping.sql",
    });
  }
  return Response.json({
    ok: true,
    configured: true,
    row: data || null,
  });
}
