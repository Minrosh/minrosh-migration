import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { obsLogger } from "@/lib/observability/logger";

/**
 * Postgres table `public.enquiries_mirror` (see supabase/migrations/20260414120000_enquiries_mirror.sql):
 * - `id` text primary key
 * - `payload` jsonb not null (full enquiry or quiz lead object)
 * - `created_at` timestamptz not null
 *
 * Dual-write runs when `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`) + `SUPABASE_SERVICE_ROLE_KEY`
 * are set, unless `SUPABASE_DUAL_WRITE_ENQUIRIES=false` explicitly disables it.
 */

function dualWriteExplicitlyDisabled() {
  return String(process.env.SUPABASE_DUAL_WRITE_ENQUIRIES || "").trim().toLowerCase() === "false";
}

/**
 * @param {{ id: string, payload: Record<string, unknown>, createdAt: string }} row
 * @returns {Promise<{ ok: boolean, skipped?: boolean, error?: string }>}
 */
export async function upsertEnquiriesMirrorRow(row) {
  if (dualWriteExplicitlyDisabled()) {
    return { ok: true, skipped: true };
  }
  const id = String(row.id || "").trim();
  if (!id) {
    obsLogger.warn("enquiries_mirror_skip", { reason: "missing_id" });
    return { ok: false, error: "missing_id" };
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    return { ok: false, error: "supabase_not_configured", skipped: true };
  }

  const createdAt = String(row.createdAt || new Date().toISOString()).trim();
  const { error } = await client.from("enquiries_mirror").upsert(
    {
      id,
      payload: row.payload,
      created_at: createdAt,
    },
    { onConflict: "id" }
  );

  if (error) {
    obsLogger.error("enquiries_mirror_upsert_failed", {
      mirrorId: id.slice(0, 80),
      code: error.code,
      message: String(error.message || "").slice(0, 500),
    });
    console.error("[enquiries_mirror] upsert failed", { id: id.slice(0, 40), message: error.message });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * @param {Record<string, unknown>} enquiry
 * @returns {Promise<{ ok: boolean, skipped?: boolean, error?: string }>}
 */
export async function dualWriteEnquiryToSupabase(enquiry) {
  const id = String(enquiry?.id || "").trim();
  const createdAt = String(enquiry?.createdAt || new Date().toISOString()).trim();
  return upsertEnquiriesMirrorRow({ id, payload: enquiry, createdAt });
}

/**
 * Quiz / points email notification backup (same mirror table, distinct id prefix).
 * @param {Record<string, unknown>} payload
 * @param {string} id e.g. QUIZ-<uuid>
 */
export async function dualWriteQuizLeadToSupabase(id, payload) {
  const createdAt = String(payload?.submittedAt || new Date().toISOString()).trim();
  return upsertEnquiriesMirrorRow({ id, payload, createdAt });
}
