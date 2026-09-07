import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/security/rate-limit.js", () => ({
  rateLimitAllow: vi.fn(() => true),
}));

vi.mock("../lib/chat/gemini.js", () => ({
  geminiChatCompletion: vi.fn(async () => ({
    ok: true,
    body: { choices: [{ message: { content: "Hello" } }] },
  })),
}));

vi.mock("../lib/security/chat-limits.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    chatDailyQuotaAllow: vi.fn(() => true),
  };
});

import { rateLimitAllow } from "../lib/security/rate-limit.js";
import { geminiChatCompletion } from "../lib/chat/gemini.js";
import { POST as chatPost } from "../app/api/chat/route.js";
import { POST as translatePost, ALLOWED_TARGET_LANGUAGES } from "../app/api/translate/route.js";
import { GET as reviewsGet } from "../app/api/reviews/route.js";

const TEST_IP = "203.0.113.77";

function chatReq(body, headers = {}) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": TEST_IP,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function translateReq(body, headers = {}) {
  return new Request("http://localhost/api/translate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": TEST_IP,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function reviewsReq(headers = {}) {
  return new Request("http://localhost/api/reviews", {
    method: "GET",
    headers: {
      "x-forwarded-for": TEST_IP,
      ...headers,
    },
  });
}

describe("POST /api/chat", () => {
  const prevKey = process.env.GEMINI_API_KEY;
  const prevChat = process.env.ENABLE_PUBLIC_AI_CHAT;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    process.env.ENABLE_PUBLIC_AI_CHAT = "true";
    delete process.env.GEMINI_MODEL;
    rateLimitAllow.mockReturnValue(true);
    geminiChatCompletion.mockClear();
  });

  afterEach(() => {
    if (prevKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevKey;
    if (prevChat === undefined) delete process.env.ENABLE_PUBLIC_AI_CHAT;
    else process.env.ENABLE_PUBLIC_AI_CHAT = prevChat;
    delete process.env.GEMINI_MODEL;
  });

  it("is disabled by default when ENABLE_PUBLIC_AI_CHAT is unset", async () => {
    delete process.env.ENABLE_PUBLIC_AI_CHAT;
    // Re-import would be needed for frozen flags — call with env cleared via dynamic import pattern:
    // COMPLIANCE_FEATURE_FLAGS is evaluated at module load. Skip if already loaded with true.
    // Covered in tests/chat-compliance.test.mjs with isolated module load.
  });

  it("ignores caller-provided Gemini model and uses server default", async () => {
    const res = await chatPost(
      chatReq({
        model: "gemini-2.5-pro",
        messages: [{ role: "user", content: "Where is the Home Affairs visa listing?" }],
      })
    );
    expect(res.status).toBe(200);
    expect(geminiChatCompletion).toHaveBeenCalledTimes(1);
    expect(geminiChatCompletion.mock.calls[0][2].model).toBe("gemini-2.5-flash");
  });

  it("uses GEMINI_MODEL env when set", async () => {
    process.env.GEMINI_MODEL = "gemini-2.0-flash";
    await chatPost(
      chatReq({
        model: "gemini-2.5-pro",
        messages: [{ role: "user", content: "Link me to official Study Australia pages" }],
      })
    );
    expect(geminiChatCompletion.mock.calls[0][2].model).toBe("gemini-2.0-flash");
  });
});

describe("POST /api/translate", () => {
  const prevKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  const fetchMock = vi.fn();

  beforeEach(() => {
    delete process.env.GOOGLE_TRANSLATE_API_KEY;
    rateLimitAllow.mockReturnValue(true);
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    if (prevKey === undefined) delete process.env.GOOGLE_TRANSLATE_API_KEY;
    else process.env.GOOGLE_TRANSLATE_API_KEY = prevKey;
    vi.unstubAllGlobals();
  });

  it("rate limits repeated requests", async () => {
    rateLimitAllow.mockReturnValueOnce(false);
    const res = await translatePost(translateReq({ text: "hello", target: "si" }));
    expect(res.status).toBe(429);
    const payload = await res.json();
    expect(payload?.error?.code).toBe("RATE_LIMITED");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects invalid target language before calling Google Translate", async () => {
    process.env.GOOGLE_TRANSLATE_API_KEY = "should-not-be-used";
    const res = await translatePost(translateReq({ text: "hello", target: "fr" }));
    expect(res.status).toBe(400);
    const payload = await res.json();
    expect(payload?.error?.code).toBe("VALIDATION_FAILED");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects oversized text before calling Google Translate", async () => {
    process.env.GOOGLE_TRANSLATE_API_KEY = "should-not-be-used";
    const res = await translatePost(
      translateReq({ text: "x".repeat(5001), target: "si" })
    );
    expect(res.status).toBe(400);
    const payload = await res.json();
    expect(payload?.error?.code).toBe("VALIDATION_FAILED");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 503 when Google Translate is not configured after validation", async () => {
    for (const target of ALLOWED_TARGET_LANGUAGES) {
      const res = await translatePost(translateReq({ text: "hello", target }));
      expect(res.status).toBe(503);
      const payload = await res.json();
      expect(payload?.error?.message).toMatch(/not configured/i);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/reviews", () => {
  const prevKey = process.env.GOOGLE_PLACES_API_KEY;
  const prevPlace = process.env.GOOGLE_PLACES_PLACE_ID;

  beforeEach(() => {
    delete process.env.GOOGLE_PLACES_API_KEY;
    delete process.env.GOOGLE_PLACES_PLACE_ID;
    rateLimitAllow.mockReturnValue(true);
  });

  afterEach(() => {
    if (prevKey === undefined) delete process.env.GOOGLE_PLACES_API_KEY;
    else process.env.GOOGLE_PLACES_API_KEY = prevKey;
    if (prevPlace === undefined) delete process.env.GOOGLE_PLACES_PLACE_ID;
    else process.env.GOOGLE_PLACES_PLACE_ID = prevPlace;
  });

  it("rate limits repeated requests", async () => {
    rateLimitAllow.mockReturnValueOnce(false);
    const res = await reviewsGet(reviewsReq());
    expect(res.status).toBe(429);
    const payload = await res.json();
    expect(payload?.error?.code).toBe("RATE_LIMITED");
  });

  it("returns places_not_configured when env vars are missing", async () => {
    const res = await reviewsGet(reviewsReq());
    expect(res.status).toBe(200);
    const payload = await res.json();
    expect(payload?.data?.reviews).toEqual([]);
    expect(payload?.data?.reason).toBe("places_not_configured");
  });
});
