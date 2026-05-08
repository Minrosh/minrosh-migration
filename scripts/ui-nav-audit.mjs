import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE_URL = (process.env.UI_AUDIT_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL: ${message}`);
}

/** @param {{ headers: Headers }} res */
function collectSetCookieLines(res) {
  const h = res.headers();
  if (typeof h.getSetCookie === "function") {
    return h.getSetCookie();
  }
  const raw = /** @type {{ raw?: () => Record<string, string[]> }} */ (res.headers).raw?.();
  if (raw && Array.isArray(raw["set-cookie"])) {
    return raw["set-cookie"];
  }
  const single = h.get("set-cookie");
  return single ? [single] : [];
}

/**
 * @param {string} line
 * @returns {{ name: string, value: string, httpOnly: boolean, secure: boolean, sameSite: "Strict" | "Lax" | "None" } | null}
 */
function parseSetCookieLine(line) {
  const parts = String(line || "").split(";").map((p) => p.trim());
  const nv = parts[0];
  if (!nv || !nv.includes("=")) return null;
  const eq = nv.indexOf("=");
  const name = nv.slice(0, eq).trim();
  const value = nv.slice(eq + 1).trim();
  if (!name) return null;
  let httpOnly = false;
  let secure = false;
  /** @type {"Strict" | "Lax" | "None"} */
  let sameSite = "Lax";
  for (let i = 1; i < parts.length; i++) {
    const low = parts[i].toLowerCase();
    if (low === "httponly") httpOnly = true;
    if (low === "secure") secure = true;
    if (low.startsWith("samesite=")) {
      const v = low.split("=")[1];
      if (v === "strict") sameSite = "Strict";
      else if (v === "none") sameSite = "None";
      else sameSite = "Lax";
    }
  }
  return { name, value, httpOnly, secure, sameSite };
}

/**
 * @param {string} baseUrl
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
async function loginAdminViaApi(baseUrl) {
  const password = String(process.env.UI_AUDIT_ADMIN_PASSWORD || "").trim();
  if (!password) {
    return { ok: false, error: "UI_AUDIT_ADMIN_PASSWORD is empty" };
  }
  const email = String(process.env.UI_AUDIT_ADMIN_EMAIL || "").trim();
  const totp = String(process.env.UI_AUDIT_ADMIN_TOTP || "").trim();
  const origin = new URL(baseUrl).origin;
  const body = /** @type {Record<string, string>} */ ({ password });
  if (email) body.email = email;
  if (totp) body.totp = totp;

  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Referer: `${origin}/admin/login`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error?.message || j?.message || JSON.stringify(j).slice(0, 200);
    } catch {
      detail = await res.text().catch(() => "");
    }
    return { ok: false, error: `POST /api/admin/login → ${res.status} ${detail}`.trim() };
  }

  const lines = collectSetCookieLines(res);
  const adminCookies = [];
  for (const line of lines) {
    const parsed = parseSetCookieLine(line);
    if (!parsed) continue;
    if (parsed.name !== "admin_session" && parsed.name !== "__Host-admin_session") continue;
    adminCookies.push({
      name: parsed.name,
      value: parsed.value,
      url: baseUrl,
      path: "/",
      httpOnly: parsed.httpOnly,
      secure: parsed.secure,
      sameSite: parsed.sameSite,
    });
  }

  if (adminCookies.length === 0) {
    return { ok: false, error: "Login succeeded but no admin_session cookie in Set-Cookie (check ADMIN_COOKIE_SECURE vs UI_AUDIT_BASE_URL)." };
  }

  return { ok: true, cookies: adminCookies };
}

/**
 * @param {import("@playwright/test").BrowserContext} context
 * @param {string} baseUrl
 * @returns {Promise<{ attempted: boolean, method?: string, error?: string }>}
 */
async function applyOptionalAdminSession(context, baseUrl) {
  const cookieValue = String(process.env.UI_AUDIT_ADMIN_COOKIE_VALUE || "").trim();
  const cookieNameOverride = String(process.env.UI_AUDIT_ADMIN_COOKIE_NAME || "").trim();
  const password = String(process.env.UI_AUDIT_ADMIN_PASSWORD || "").trim();

  if (cookieValue) {
    const isHttps = new URL(baseUrl).protocol === "https:";
    const name =
      cookieNameOverride ||
      (isHttps ? "__Host-admin_session" : "admin_session");
    await context.addCookies([
      {
        name,
        value: cookieValue,
        url: baseUrl,
        path: "/",
        httpOnly: true,
        secure: name.startsWith("__Host-") ? true : isHttps,
        sameSite: "Strict",
      },
    ]);
    return { attempted: true, method: "UI_AUDIT_ADMIN_COOKIE_VALUE" };
  }

  if (password) {
    const login = await loginAdminViaApi(baseUrl);
    if (!login.ok || !login.cookies) {
      return { attempted: true, error: login.error || "login failed" };
    }
    await context.addCookies(login.cookies);
    return { attempted: true, method: "UI_AUDIT_ADMIN_PASSWORD" };
  }

  return { attempted: false };
}

async function expectOk(page, path) {
  const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: "load" });
  const status = response?.status?.() ?? 0;
  if (!response || status >= 400) {
    fail(`${path} returned status ${status}`);
    return false;
  }
  return true;
}

async function run() {
  const storageStatePathRaw = String(process.env.UI_AUDIT_ADMIN_STORAGE_STATE || "").trim();
  let storageStatePath = "";
  if (storageStatePathRaw) {
    storageStatePath = path.isAbsolute(storageStatePathRaw)
      ? storageStatePathRaw
      : path.join(process.cwd(), storageStatePathRaw);
    if (!fs.existsSync(storageStatePath)) {
      fail(`UI_AUDIT_ADMIN_STORAGE_STATE file not found: ${storageStatePath}`);
      console.error(`\nUI nav audit failed with ${failures.length} issue(s).`);
      process.exit(1);
    }
  }

  const browser = await chromium.launch({ headless: true });
  const contextOptions = storageStatePath ? { storageState: storageStatePath } : {};
  const context = await browser.newContext(contextOptions);

  if (storageStatePath) {
    console.log(`UI nav audit: using Playwright storage state (${storageStatePath}).`);
  }

  const sessionApply = storageStatePath ? { attempted: false } : await applyOptionalAdminSession(context, BASE_URL);
  if (sessionApply.attempted && sessionApply.error) {
    fail(`Admin session bootstrap failed: ${sessionApply.error}`);
    await browser.close();
    console.error(`\nUI nav audit failed with ${failures.length} issue(s).`);
    process.exit(1);
  }
  if (sessionApply.method) {
    console.log(`UI nav audit: injected admin session via ${sessionApply.method}.`);
  }

  const page = await context.newPage();

  page.on("pageerror", (err) => fail(`Page error: ${err.message}`));
  page.on("response", (res) => {
    const url = res.url();
    if (!url.startsWith(BASE_URL)) return;
    if (url.includes("/_next/")) return;
    if (res.status() >= 500) fail(`Server error ${res.status()} at ${url}`);
  });

  const smokeRoutes = [
    "/",
    "/about",
    "/contact",
    "/faq",
    "/skilled-migration",
    "/student-visa-australia",
    "/partner-visa-australia",
    "/visitor-visas",
    "/destinations/australia",
    "/immigration-news",
    "/popular-routes",
    "/assessment",
    "/updates",
    "/admin",
    "/admin/crm",
    "/admin/customers",
    "/admin/invoices",
  ];

  for (const route of smokeRoutes) {
    await expectOk(page, route);
  }

  if (await expectOk(page, "/")) {
    try {
      await page.waitForLoadState("domcontentloaded");
      const startPathway = page.locator("#hero-cta-assessment");
      await startPathway.waitFor({ state: "visible", timeout: 25_000 });
      await page.evaluate(() => {
        const el = document.getElementById("hero-cta-assessment");
        if (!(el instanceof HTMLElement)) throw new Error("missing #hero-cta-assessment");
        el.click();
      });
      await page.waitForURL(/\/assessment/, { timeout: 15_000 });
      await page.getByText(/Smart Navigator|Visa Decision Engine/i).first().waitFor({ timeout: 12_000 });
    } catch (err) {
      fail(`Start your pathway flow failed: ${err.message}`);
    }
  }

  if (await expectOk(page, "/admin")) {
    const onLogin = new URL(page.url()).pathname === "/admin/login";
    const authConfigured = Boolean(
      storageStatePath ||
        String(process.env.UI_AUDIT_ADMIN_COOKIE_VALUE || "").trim() ||
        String(process.env.UI_AUDIT_ADMIN_PASSWORD || "").trim()
    );

    if (onLogin) {
      if (authConfigured) {
        fail(
          "Still on /admin/login after session injection — invalid cookie, wrong UI_AUDIT_ADMIN_COOKIE_NAME, expired storage state, or login rejected (e.g. missing UI_AUDIT_ADMIN_TOTP when ADMIN_TOTP_SECRET is set)."
        );
      } else {
        console.log(
          "Admin auth wall detected; skipping authenticated admin sidebar nav checks. Set UI_AUDIT_ADMIN_PASSWORD, UI_AUDIT_ADMIN_COOKIE_VALUE, or UI_AUDIT_ADMIN_STORAGE_STATE (see .env.example)."
        );
      }
      await browser.close();

      if (failures.length) {
        console.error(`\nUI nav audit failed with ${failures.length} issue(s).`);
        process.exit(1);
      }
      console.log("UI nav audit passed.");
      return;
    }

    const showAll = page.getByRole("button", { name: "Show all" }).first();
    if (await showAll.count()) {
      await showAll.click();
    }
    const adminLinks = [
      { href: "/admin/crm", path: "/admin/crm", label: "CRM" },
      { href: "/admin/customers", path: "/admin/customers", label: "Customers" },
      { href: "/admin/invoices", path: "/admin/invoices", label: "Invoices" },
    ];
    const adminAside = page.locator("aside").first();
    for (const link of adminLinks) {
      try {
        await adminAside.locator(`a[href="${link.href}"]`).first().click();
        await page.waitForURL((url) => url.pathname === link.path, { timeout: 12_000 });
      } catch (err) {
        fail(`Admin nav "${link.label}" → ${link.path} failed: ${err.message}`);
      }
    }
    console.log("UI nav audit: authenticated admin sidebar checks passed.");
  }

  await browser.close();

  if (failures.length) {
    console.error(`\nUI nav audit failed with ${failures.length} issue(s).`);
    process.exit(1);
  }
  console.log("UI nav audit passed.");
}

run().catch((err) => {
  console.error("UI nav audit crashed:", err);
  process.exit(1);
});
