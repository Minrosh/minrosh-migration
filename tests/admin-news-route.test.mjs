import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/admin/auth-route", () => ({
  requireAdminWrite: vi.fn(async () => new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })),
  requireAdminRead: vi.fn(async () => new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })),
}));

describe("POST /api/admin/news", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns 401 without admin session", async () => {
    const { POST } = await import("../app/api/admin/news/route.js");
    const req = new Request("http://localhost/api/admin/news", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Test", slug: "test", body: "Body" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
