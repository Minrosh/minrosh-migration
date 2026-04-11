import { createClient } from "@supabase/supabase-js";

/**
 * Public Supabase project URL (browser-safe; still only used on server here).
 * Prefer NEXT_PUBLIC_SUPABASE_URL so one value works for future client components.
 */
export function getSupabaseUrl() {
  return String(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
}

/**
 * Service role client for trusted server routes only. Never import this into client components.
 * @returns {import("@supabase/supabase-js").SupabaseClient | null}
 */
export function createSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
