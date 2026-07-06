import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: vi.fn(() => null),
}));

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  dualWriteEnquiryToSupabase,
  isSupabaseEnquiriesDualWriteConfigured,
  upsertEnquiriesMirrorRow,
} from "@/lib/supabase/enquiries-dual-write";

const ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ENV };
  vi.clearAllMocks();
});

describe("enquiries dual-write", () => {
  it("skips gracefully when Supabase is not configured", async () => {
    createSupabaseAdminClient.mockReturnValue(null);
    const result = await upsertEnquiriesMirrorRow({
      id: "ENQ-1",
      payload: { id: "ENQ-1", message: "hello" },
      createdAt: new Date().toISOString(),
    });
    expect(result).toEqual({ ok: true, skipped: true, reason: "supabase_not_configured" });
    expect(isSupabaseEnquiriesDualWriteConfigured()).toBe(false);
  });

  it("dualWriteEnquiryToSupabase does not block when Supabase is not configured", async () => {
    createSupabaseAdminClient.mockReturnValue(null);
    const result = await dualWriteEnquiryToSupabase({
      id: "ENQ-2",
      createdAt: new Date().toISOString(),
      message: "consultation test",
    });
    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
  });

  it("returns failure when configured client upsert fails", async () => {
    const upsert = vi.fn(async () => ({ error: { code: "23505", message: "duplicate key" } }));
    createSupabaseAdminClient.mockReturnValue({
      from: () => ({ upsert }),
    });
    const result = await upsertEnquiriesMirrorRow({
      id: "ENQ-3",
      payload: { id: "ENQ-3" },
      createdAt: new Date().toISOString(),
    });
    expect(result.ok).toBe(false);
    expect(result.skipped).toBeUndefined();
    expect(result.error).toMatch(/duplicate/i);
  });

  it("honours SUPABASE_DUAL_WRITE_ENQUIRIES=false", async () => {
    process.env.SUPABASE_DUAL_WRITE_ENQUIRIES = "false";
    const result = await upsertEnquiriesMirrorRow({
      id: "ENQ-4",
      payload: { id: "ENQ-4" },
      createdAt: new Date().toISOString(),
    });
    expect(result).toEqual({ ok: true, skipped: true });
    expect(createSupabaseAdminClient).not.toHaveBeenCalled();
  });
});
