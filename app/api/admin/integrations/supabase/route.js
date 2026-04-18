import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { apiOk, requestContextFromRequest } from "@/lib/api/response";
import { createSupabaseAdminClient, getSupabaseUrl } from "@/lib/supabase/server";

/**
 * Connectivity probe against Supabase Postgres (table minrosh_db_ping).
 * Apply migration: supabase/migrations/20260212120000_minrosh_db_ping.sql
 */
export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const url = getSupabaseUrl();
  const hasKey = Boolean(String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim());
  if (!url || !hasKey) {
    return apiOk({
      ok: false,
      configured: false,
      detail: "Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY",
    }, context);
  }
  const client = createSupabaseAdminClient();
  if (!client) {
    return apiOk({ ok: false, configured: false, detail: "Could not create Supabase client" }, context);
  }
  const { data, error } = await client.from("minrosh_db_ping").select("id,updated_at").eq("id", 1).maybeSingle();
  if (error) {
    return apiOk({
      ok: false,
      configured: true,
      detail: error.message,
      hint: "Create table minrosh_db_ping via supabase/migrations/20260212120000_minrosh_db_ping.sql",
    }, context);
  }
  return apiOk({
    ok: true,
    configured: true,
    row: data || null,
  }, context);
}
