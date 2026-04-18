import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Phase 1 (dual-write): upsert enquiry into Supabase after successful JSON save.
 * Enable with SUPABASE_DUAL_WRITE_ENQUIRIES=true and service role + URL configured.
 * @param {Record<string, unknown>} enquiry
 * @returns {Promise<{ ok: boolean, skipped?: boolean, error?: string }>}
 */
export async function dualWriteEnquiryToSupabase(enquiry) {
  if (String(process.env.SUPABASE_DUAL_WRITE_ENQUIRIES || "").toLowerCase() !== "true") {
    return { ok: true, skipped: true };
  }
  const id = String(enquiry?.id || "").trim();
  if (!id) return { ok: false, error: "missing_id" };

  const client = createSupabaseAdminClient();
  if (!client) {
    return { ok: false, error: "supabase_not_configured" };
  }

  const createdAt = String(enquiry?.createdAt || new Date().toISOString()).trim();
  const { error } = await client.from("enquiries_mirror").upsert(
    {
      id,
      payload: enquiry,
      created_at: createdAt,
    },
    { onConflict: "id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
