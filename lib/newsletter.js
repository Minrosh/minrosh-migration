import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getMailTransport, readJsonFile, writeJsonAtomic } from "./contact";
import { getBrochureAttachments } from "./brochure-path";
import { withMutationLock } from "./json-mutation-lock";

const newsletterFile =
  process.env.NEWSLETTER_FILE || path.join(process.cwd(), "data-newsletter.json");
const newsletterSeedFile = path.join(process.cwd(), "data", "newsletter.seed.json");

function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function publicSiteUrl() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://minroshmigration.com.au"
  ).replace(/\/+$/, "");
}

/**
 * Send newsletter welcome/thank-you email.
 * Does not throw; returns status object.
 */
export async function sendNewsletterWelcomeEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return { sent: false, reason: "invalid_email" };

  const transport = getMailTransport();
  if (!transport) return { sent: false, reason: "smtp_not_configured" };

  const smtpFrom = process.env.SMTP_FROM || "info@minroshmigration.com.au";
  const siteUrl = publicSiteUrl();
  const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe`;
  const brochureAttachments = getBrochureAttachments();
  const brochureBlock =
    brochureAttachments.length > 0
      ? `<p style="margin:0 0 18px;font-size:15px;line-height:1.65;">
                We have attached a short overview brochure about our migration and education services.
              </p>`
      : "";

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8f3f6;font-family:Segoe UI,Arial,sans-serif;color:#2b2230;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f3f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #eadce4;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#4a1d42,#8b3d6a);padding:20px 24px;color:#fffaf8;">
              <h1 style="margin:0;font-size:22px;line-height:1.25;">Welcome to MinRosh Migration Updates</h1>
              <p style="margin:8px 0 0;font-size:14px;line-height:1.5;opacity:0.95;">
                Thank you for registering for our newsletter.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 24px 18px;">
              <p style="margin:0 0 12px;font-size:15px;line-height:1.65;">
                Hi ${escapeHtmlText(normalized)},
              </p>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.65;">
                Thanks for subscribing to <strong>MinRosh Migration</strong> newsletter updates.
                We will send practical migration and visa news, policy updates, and useful guidance for
                skilled professionals, families, and students planning a move to Australia.
              </p>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.65;">
                If you no longer wish to receive updates, you can unsubscribe anytime from this link:
                <a href="${unsubscribeUrl}" style="color:#8b3d6a;font-weight:700;text-decoration:underline;">unsubscribe</a>.
              </p>
              ${brochureBlock}
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius:999px;background:#4a1d42;">
                    <a href="${siteUrl}" style="display:inline-block;padding:11px 18px;color:#fffaf8;text-decoration:none;font-size:14px;font-weight:700;">
                      Visit MinRosh Migration
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px;">
              <hr style="border:0;border-top:1px solid #efe4ea;margin:0 0 14px;" />
              <p style="margin:0 0 6px;font-size:14px;line-height:1.5;"><strong>Warm regards,</strong></p>
              <p style="margin:0;font-size:14px;line-height:1.55;">
                <strong>MinRosh Migration Team</strong><br />
                Email: <a href="mailto:info@minroshmigration.com.au" style="color:#8b3d6a;text-decoration:none;">info@minroshmigration.com.au</a><br />
                Phone: +61 478 100 542
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textLines = [
    "Welcome to MinRosh Migration Updates",
    "",
    `Hi ${normalized},`,
    "",
    "Thank you for registering for MinRosh Migration newsletter updates.",
    "We will send practical migration and visa news and guidance for skilled professionals, families, and students planning a move to Australia.",
  ];
  if (brochureAttachments.length > 0) {
    textLines.push("A short services brochure is attached to this email.");
  }
  textLines.push(
    "",
    `Unsubscribe anytime: ${unsubscribeUrl}`,
    "",
    "Warm regards,",
    "MinRosh Migration Team",
    "info@minroshmigration.com.au",
    "+61 478 100 542",
  );
  const text = textLines.join("\n");

  try {
    await withSmtpDeadline(
      transport.sendMail({
        from: smtpFrom,
        to: normalized,
        subject: "Thank you for registering with MinRosh Migration Newsletter",
        text,
        html,
        attachments: brochureAttachments,
      })
    );
    return { sent: true };
  } catch (err) {
    console.error("sendNewsletterWelcomeEmail:", err);
    return { sent: false, reason: "send_failed" };
  }
}

function newsletterLockPath() {
  return path.join(path.dirname(newsletterFile), ".newsletter-mutation.lock");
}

export function ensureNewsletterFile() {
  if (fs.existsSync(newsletterFile)) return;
  let seededEntries = [];
  try {
    seededEntries = JSON.parse(fs.readFileSync(newsletterSeedFile, "utf8"));
  } catch {
    seededEntries = [];
  }
  writeJsonAtomic(newsletterFile, seededEntries);
}

function migrateNewsletterRows(list) {
  let changed = false;
  const out = list.map((item) => {
    if (!item || typeof item !== "object") return item;
    const next = { ...item };
    if (!next.unsubscribeToken) {
      next.unsubscribeToken = randomUUID();
      changed = true;
    }
    if (!next.status) {
      next.status = "active";
      changed = true;
    }
    if (next.marketingConsent === undefined && next.status === "active") {
      next.marketingConsent = true;
      next.consentRecordedAt = next.consentRecordedAt || next.createdAt || new Date().toISOString();
      changed = true;
    }
    return next;
  });
  return { out, changed };
}

function loadNewsletterRows() {
  ensureNewsletterFile();
  const raw = readJsonFile(newsletterFile, []);
  const list = Array.isArray(raw) ? raw : [];
  return migrateNewsletterRows(list);
}

export function readNewsletterFile() {
  let { out, changed } = loadNewsletterRows();
  if (changed) {
    withMutationLock(newsletterLockPath(), () => {
      const again = loadNewsletterRows();
      if (again.changed) {
        writeJsonAtomic(newsletterFile, again.out);
      }
    });
    ({ out } = loadNewsletterRows());
  }
  return out;
}

/**
 * Emails that must not receive marketing-style broadcast (newsletter unsubscribed).
 */
export function isMarketingSuppressedEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  if (!e) return true;
  const list = readNewsletterFile();
  return list.some((item) => item.email === e && item.status === "unsubscribed");
}

/**
 * @param {string} token
 */
export function unsubscribeNewsletterByToken(token) {
  const t = String(token || "").trim();
  if (!t || t.length > 80) {
    return { ok: false, error: "Invalid token." };
  }
  return withMutationLock(newsletterLockPath(), () => {
    ensureNewsletterFile();
    const raw = readJsonFile(newsletterFile, []);
    const arr = Array.isArray(raw) ? raw : [];
    const { out: list } = migrateNewsletterRows(arr);
    const i = list.findIndex((x) => x && x.unsubscribeToken === t);
    if (i === -1) {
      return { ok: false, error: "Unknown or expired link." };
    }
    const row = list[i];
    if (row.status === "unsubscribed") {
      return { ok: true, already: true };
    }
    const next = [...list];
    next[i] = {
      ...row,
      status: "unsubscribed",
      unsubscribedAt: new Date().toISOString(),
    };
    writeJsonAtomic(newsletterFile, next);
    return { ok: true, already: false };
  });
}

/**
 * @param {string} email — validated email (lowercase trim)
 * @param {{ marketingConsent?: boolean }} opts
 */
export function saveNewsletterEntry(email, opts = {}) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    return { error: "Email is required." };
  }
  if (opts.marketingConsent !== true) {
    return { error: "Marketing consent is required to subscribe." };
  }

  return withMutationLock(newsletterLockPath(), () => {
    ensureNewsletterFile();
    const raw = readJsonFile(newsletterFile, []);
    const arr = Array.isArray(raw) ? raw : [];
    const { out: current, changed: migChanged } = migrateNewsletterRows(arr);
    if (migChanged) {
      writeJsonAtomic(newsletterFile, current);
    }

    const i = current.findIndex((item) => item.email === normalized);
    const now = new Date().toISOString();

    if (i >= 0) {
      const row = current[i];
      if (row.status === "unsubscribed") {
        const next = [...current];
        next[i] = {
          ...row,
          status: "active",
          marketingConsent: true,
          consentRecordedAt: now,
          resubscribedAt: now,
          unsubscribeToken: row.unsubscribeToken || randomUUID(),
        };
        writeJsonAtomic(newsletterFile, next);
        return { ok: true, exists: false, resubscribed: true };
      }
      return { ok: true, exists: true };
    }

    const entry = {
      email: normalized,
      createdAt: now,
      marketingConsent: true,
      consentRecordedAt: now,
      unsubscribeToken: randomUUID(),
      status: "active",
    };
    const next = [entry, ...current];
    writeJsonAtomic(newsletterFile, next);
    return { ok: true, exists: false };
  });
}
