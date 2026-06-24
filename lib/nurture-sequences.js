import fs from "node:fs";
import path from "node:path";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { getMailTransport, readJsonFile, writeJsonAtomic } from "@/lib/contact";
import { getBrochureAttachments } from "@/lib/brochure-path";
import { isMarketingSuppressedEmail } from "@/lib/newsletter";
import { sendGmailApiEmail } from "@/lib/gmail-api";
import { derivePathwaySegment } from "@/lib/crm/lead-segmentation";
import { withSmtpDeadline } from "@/lib/smtp-timeout";

const nurtureFile = process.env.NURTURE_FILE || path.join(process.cwd(), "data", "nurture-queue.json");
const nurtureSeedFile = path.join(process.cwd(), "data", "nurture-queue.seed.json");

const DAY_MS = 24 * 60 * 60 * 1000;
const STEPS = [1, 7, 30];
const CLAIM_WINDOW_MS = 10 * 60 * 1000;

function lockPath() {
  return path.join(path.dirname(nurtureFile), ".nurture-mutation.lock");
}

function getSiteUrl() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://minroshmigration.com.au"
  ).replace(/\/+$/, "");
}

function ensureNurtureFile() {
  if (fs.existsSync(nurtureFile)) return;
  fs.mkdirSync(path.dirname(nurtureFile), { recursive: true });
  const seeded = readJsonFile(nurtureSeedFile, []);
  writeJsonAtomic(nurtureFile, Array.isArray(seeded) ? seeded : []);
}

function readQueue() {
  ensureNurtureFile();
  const list = readJsonFile(nurtureFile, []);
  return Array.isArray(list) ? list : [];
}

function pathwayTopic(pathwaySegment) {
  if (pathwaySegment === "student") return "student visa planning";
  if (pathwaySegment === "partner") return "partner visa evidence";
  if (pathwaySegment === "skilled") return "skilled migration readiness";
  if (pathwaySegment === "employer_sponsored") return "employer-sponsored pathways";
  return "migration planning";
}

function buildStepCopy(stepDay, firstName, pathwaySegment) {
  const site = getSiteUrl();
  const hello = firstName ? `Hi ${firstName},` : "Hi,";
  const topic = pathwayTopic(pathwaySegment);
  if (stepDay === 1) {
    return {
      subject: "Thank you for your enquiry - your MinRosh guide",
      text: [
        hello,
        "",
        "Thank you for contacting MinRosh Migration.",
        `We attached our brochure so you can review your ${topic} options before consultation.`,
        "",
        `Read latest updates: ${site}/updates`,
      ].join("\n"),
      html: `<p>${hello}</p><p>Thank you for contacting MinRosh Migration.</p><p>We attached our brochure so you can review your ${topic} options before consultation.</p><p><a href="${site}/updates">Read latest migration updates</a></p>`,
      attachBrochure: true,
    };
  }
  if (stepDay === 7) {
    return {
      subject: "Next steps to strengthen your migration profile",
      text: [
        hello,
        "",
        `Here is a practical checkpoint for your ${topic} pathway.`,
        "If your profile is ready, this can improve your planning confidence.",
        "",
        `Read more updates: ${site}/updates`,
      ].join("\n"),
      html: `<p>${hello}</p><p>Here is a practical checkpoint for your ${topic} pathway.</p><p>If your profile is ready, this can improve your planning confidence.</p><p><a href="${site}/updates">Read more migration updates</a></p>`,
      attachBrochure: false,
    };
  }
  return {
    subject: "New visa rules for 2026 - how they affect you",
    text: [
      hello,
      "",
      `Visa settings affecting ${topic} pathways are evolving.`,
      "Knowing what changed early helps you avoid delays and rework.",
      "",
      `See the latest update notes: ${site}/updates`,
    ].join("\n"),
    html: `<p>${hello}</p><p>Visa settings affecting ${topic} pathways are evolving.</p><p>Knowing what changed early helps you avoid delays and rework.</p><p><a href="${site}/updates">See the latest update notes</a></p>`,
    attachBrochure: false,
  };
}

function markDone(record, day, at) {
  const sent = Array.isArray(record.sentDays) ? record.sentDays : [];
  if (!sent.includes(day)) sent.push(day);
  const events = Array.isArray(record.events) ? record.events : [];
  events.push({ at, type: "sent", day });
  return { ...record, sentDays: sent, events: events.slice(-50) };
}

function markSuppressed(record, day, at) {
  const sent = Array.isArray(record.sentDays) ? record.sentDays : [];
  if (!sent.includes(day)) sent.push(day);
  const events = Array.isArray(record.events) ? record.events : [];
  events.push({ at, type: "suppressed", day });
  return { ...record, sentDays: sent, events: events.slice(-50) };
}

function markFailed(record, day, at, error) {
  const attempts = { ...(record.attemptsByDay || {}) };
  const current = Number(attempts[day] || 0) + 1;
  attempts[day] = current;
  const backoffMinutes = Math.min(120, 5 * 2 ** (current - 1));
  const retryAt = new Date(new Date(at).getTime() + backoffMinutes * 60 * 1000).toISOString();
  const events = Array.isArray(record.events) ? record.events : [];
  events.push({ at, type: "failed", day, attempt: current, retryAt, error: String(error || "send_failed").slice(0, 180) });
  return {
    ...record,
    attemptsByDay: attempts,
    nextAttemptAt: retryAt,
    lastError: String(error || "send_failed").slice(0, 300),
    events: events.slice(-50),
  };
}

function pendingDay(record, now) {
  const sentDays = Array.isArray(record.sentDays) ? record.sentDays : [];
  const createdAt = new Date(record.createdAt || Date.now());
  for (const day of STEPS) {
    if (sentDays.includes(day)) continue;
    const dueAt = new Date(createdAt.getTime() + day * DAY_MS);
    if (now >= dueAt) return day;
  }
  return null;
}

function clearClaim(record) {
  return {
    ...record,
    lockToken: undefined,
    lockedUntil: undefined,
  };
}

export function enqueueNurtureLead(contact) {
  const email = String(contact?.email || "").trim().toLowerCase();
  if (!email) return { queued: false, reason: "missing_email" };
  return withMutationLock(lockPath(), () => {
    const list = readQueue();
    if (list.some((r) => r?.enquiryId === contact.id || r?.email === email)) {
      return { queued: false, reason: "already_exists" };
    }
    const now = new Date().toISOString();
    const row = {
      id: `nurture-${contact.id || Date.now()}`,
      enquiryId: String(contact.id || ""),
      email,
      firstName: String(contact.firstName || "").trim(),
      source: String(contact.source || "contact_form").trim() || "contact_form",
      preferredCountry: String(contact.preferredCountry || "").trim(),
      pathwaySegment: derivePathwaySegment({ mainNeed: contact.mainNeed }),
      mainNeed: String(contact.mainNeed || "").trim(),
      createdAt: now,
      sentDays: [],
      attemptsByDay: {},
      events: [{ at: now, type: "enqueued" }],
    };
    writeJsonAtomic(nurtureFile, [row, ...list]);
    return { queued: true, id: row.id };
  });
}

async function deliverEmail({ to, subject, text, html, attachBrochure }) {
  if (String(process.env.NURTURE_USE_GMAIL_API || "true").toLowerCase() !== "false") {
    try {
      const sent = await sendGmailApiEmail({
        to,
        subject,
        text,
        html,
        includeBrochure: attachBrochure,
      });
      if (sent.sent) return true;
    } catch {
      /* fallback to SMTP */
    }
  }
  const transport = getMailTransport();
  if (!transport) return false;
  try {
    await withSmtpDeadline(
      transport.sendMail({
        from: process.env.SMTP_FROM || "info@minroshmigration.com.au",
        to,
        subject,
        text,
        html,
        attachments: attachBrochure ? getBrochureAttachments() : [],
      })
    );
    return true;
  } catch (err) {
    console.error("nurture deliverEmail SMTP:", err);
    return false;
  }
}

export async function processNurtureQueue({ now = new Date() } = {}) {
  const limit = Math.max(1, Number(process.env.NURTURE_MAX_PER_RUN || 40));
  const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let queue = [];
  const claimToken = `${runId}-claim`;
  const claimedIds = new Set();
  const claimedDays = new Map();
  const nowIso = now.toISOString();
  const lockUntilIso = new Date(now.getTime() + CLAIM_WINDOW_MS).toISOString();
  withMutationLock(lockPath(), () => {
    queue = readQueue();
    let claimed = 0;
    const claimedQueue = queue.map((record) => {
      if (claimed >= limit) return record;
      const email = String(record?.email || "").trim().toLowerCase();
      if (!email) return record;
      const lockActive = record?.lockedUntil && new Date(record.lockedUntil).getTime() > now.getTime();
      if (lockActive) return record;
      const retryAt = record?.nextAttemptAt ? new Date(record.nextAttemptAt) : null;
      if (retryAt && now < retryAt) return record;
      const day = pendingDay(record, now);
      if (!day) return record;
      claimed += 1;
      claimedIds.add(record.id);
      claimedDays.set(record.id, day);
      return {
        ...record,
        lockToken: claimToken,
        lockedUntil: lockUntilIso,
        events: [...(Array.isArray(record.events) ? record.events : []), { at: nowIso, type: "claimed", day, runId }].slice(-50),
      };
    });
    writeJsonAtomic(nurtureFile, claimedQueue);
    queue = claimedQueue;
  });
  let processed = 0;
  let sent = 0;
  let suppressed = 0;
  let failed = 0;
  const claimedOutcomes = new Map();

  for (const record of queue) {
    if (!claimedIds.has(record.id)) {
      continue;
    }
    const email = String(record?.email || "").trim().toLowerCase();
    if (!email) {
      claimedOutcomes.set(record.id, clearClaim(record));
      continue;
    }
    const day = claimedDays.get(record.id);
    let cur = record;
    if (!day) {
      claimedOutcomes.set(record.id, clearClaim(record));
      continue;
    }
    processed += 1;
    if (isMarketingSuppressedEmail(email)) {
      suppressed += 1;
      cur = markSuppressed(cur, day, nowIso);
      cur = clearClaim(cur);
      claimedOutcomes.set(record.id, cur);
      continue;
    }
    const copy = buildStepCopy(day, cur.firstName, cur.pathwaySegment || "general");
    try {
      const ok = await deliverEmail({
        to: email,
        subject: copy.subject,
        text: copy.text,
        html: copy.html,
        attachBrochure: copy.attachBrochure,
      });
      if (ok) {
        sent += 1;
        cur = markDone(cur, day, nowIso);
      } else {
        failed += 1;
        cur = markFailed(cur, day, nowIso, "mail_provider_unavailable");
      }
    } catch (error) {
      failed += 1;
      cur = markFailed(cur, day, nowIso, error?.message || "send_failed");
    }
    cur = clearClaim(cur);
    claimedOutcomes.set(record.id, cur);
  }

  withMutationLock(lockPath(), () => {
    const latest = readQueue();
    const merged = latest.map((record) => {
      if (!claimedIds.has(record.id)) return record;
      if (record.lockToken !== claimToken) return record;
      return claimedOutcomes.get(record.id) || clearClaim(record);
    });
    writeJsonAtomic(nurtureFile, merged);
  });

  return { ok: true, runId, total: queue.length, claimed: claimedIds.size, processed, sent, suppressed, failed };
}
