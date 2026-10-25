import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyAdminRequest = vi.fn();
const getFooterStats = vi.fn(() => ({
  enquiryCount: 3,
  newsletterCount: 4,
  updatesCount: 7,
}));

vi.mock("@/lib/admin/auth-route", () => ({
  verifyAdminRequest: (...args) => verifyAdminRequest(...args),
}));

vi.mock("../lib/site-stats.js", () => ({
  getFooterStats: (...args) => getFooterStats(...args),
}));

describe("GET /api/stats", () => {
  beforeEach(() => {
    verifyAdminRequest.mockReset();
    getFooterStats.mockClear();
  });

  it("hides operational counts from an anonymous request", async () => {
    verifyAdminRequest.mockResolvedValue(false);
    const { GET } = await import("../app/api/stats/route.js");
    const response = await GET(new Request("http://127.0.0.1/api/stats", { headers: { "x-forwarded-for": "203.0.113.80" } }));
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("AUTH_UNAUTHORIZED");
    expect(JSON.stringify(body)).not.toMatch(/enquiryCount|newsletterCount|updatesCount/);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(getFooterStats).not.toHaveBeenCalled();
  });

  it("returns operational counts only after an admin session is verified", async () => {
    verifyAdminRequest.mockResolvedValue(true);
    const { GET } = await import("../app/api/stats/route.js");
    const response = await GET(new Request("http://127.0.0.1/api/stats", { headers: { "x-forwarded-for": "203.0.113.81" } }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data).toEqual({ enquiryCount: 3, newsletterCount: 4, updatesCount: 7 });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(getFooterStats).toHaveBeenCalledOnce();
  });
});
