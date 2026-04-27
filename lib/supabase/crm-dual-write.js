import { createSupabaseAdminClient } from "@/lib/supabase/server";

function flagCustomers() {
  return String(process.env.SUPABASE_DUAL_WRITE_CUSTOMERS || "").toLowerCase() === "true";
}

function flagInvoices() {
  return String(process.env.SUPABASE_DUAL_WRITE_INVOICES || "").toLowerCase() === "true";
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * After JSON write: upsert each customer row (Phase 1 dual-write).
 * @param {{ customers?: unknown[] }} data
 */
export async function dualWriteCustomersStoreToSupabase(data) {
  if (!flagCustomers()) return { ok: true, skipped: true };
  const list = Array.isArray(data?.customers) ? data.customers : [];
  const client = createSupabaseAdminClient();
  if (!client) return { ok: false, error: "supabase_not_configured" };
  if (list.length === 0) {
    return { ok: true, count: 0 };
  }
  const t = nowIso();
  const rows = list
    .filter((c) => c && typeof c === "object" && String(c.id || "").trim())
    .map((c) => ({
      id: String(c.id).trim(),
      payload: c,
      updated_at: t,
    }));
  if (rows.length === 0) return { ok: true, count: 0 };
  const { error } = await client.from("customers_mirror").upsert(rows, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };
  return { ok: true, count: rows.length };
}

/**
 * After JSON write: upsert each invoice row (Phase 1 dual-write).
 * @param {{ invoices?: unknown[] }} data
 */
export async function dualWriteInvoicesStoreToSupabase(data) {
  if (!flagInvoices()) return { ok: true, skipped: true };
  const list = Array.isArray(data?.invoices) ? data.invoices : [];
  const client = createSupabaseAdminClient();
  if (!client) return { ok: false, error: "supabase_not_configured" };
  if (list.length === 0) {
    return { ok: true, count: 0 };
  }
  const t = nowIso();
  const rows = list
    .filter((inv) => inv && typeof inv === "object" && String(inv.id || "").trim())
    .map((inv) => ({
      id: String(inv.id).trim(),
      payload: inv,
      updated_at: t,
    }));
  if (rows.length === 0) return { ok: true, count: 0 };
  const { error } = await client.from("invoices_mirror").upsert(rows, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };
  return { ok: true, count: rows.length };
}

/**
 * Best-effort remove mirror row when customer deleted from JSON (optional hygiene).
 * @param {string} customerId
 */
export async function dualDeleteCustomerMirrorRow(customerId) {
  if (!flagCustomers()) return { ok: true, skipped: true };
  const id = String(customerId || "").trim();
  if (!id) return { ok: false, error: "missing_id" };
  const client = createSupabaseAdminClient();
  if (!client) return { ok: false, error: "supabase_not_configured" };
  const { error } = await client.from("customers_mirror").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
