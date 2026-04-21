import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";
import { getBrochureAttachments } from "@/lib/brochure-path";
import { isMarketingSuppressedEmail } from "@/lib/newsletter";
import { sendGmailApiEmail } from "@/lib/gmail-api";

const nurtureFile = process.env.NURTURE_FILE || path.join(process.cwd(), "data", "nurture-queue.json");
const nurtureSeedFile = path.join(process.cwd(), "data", "nurture-queue.seed.json");

const DAY_MS = 24 * 60 * 60 * 1000;
const STEPS = [0, 1, 3];
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

function getMailTransport() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpHost || !smtpUser || !smtpPass) return null;
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass.replace(/\s+/g, "") },
  });
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

function buildStepCopy(stepDay, firstName) {
  const site = getSiteUrl();
  const hello = firstName ? `Hi ${firstName},` : "Hi,";
  if (stepDay === 0) {
    return {
      subject: "Thanks for your enquiry - here is your next step",
      text: [
        hello,
        "",
        "Thanks for contacting MinRosh Migration.",
        "Start with our Free Assessment to get a practical pathway direction before consultation.",
        "",
        `Start Free Assessment: ${site}/assessment`,
        `Book Consultation: ${site}/book-consultation`,
      ].join("\n"),
      html: `<p>${hello}</p><p>Thanks for contacting MinRosh Migration.</p><p>Start with our Free Assessment to get a practical pathway direction before consultation.</p><p><a href="${site}/assessment">Start Free Assessment</a><br /><a href="${site}/book-consultation">Book Consultation</a></p>`,
      attachBrochure: true,
    };
  }
  if (stepDay === 1) {
    return {
      subject: "Quick follow-up: do you want pathway clarity first?",
      text: [
        hello,
        "",
        "If your case has multiple visa options, a short strategy sequence usually avoids costly delays.",
        "Use Free Assessment first, then book consultation if your timeline is urgent.",
        "",
        `Free Assessment: ${site}/assessment`,
        `Consultation booking: ${site}/book-consultation`,
      ].join("\n"),
      html: `<p>${hello}</p><p>If your case has multiple visa options, a short strategy sequence usually avoids costly delays.</p><p>Use Free Assessment first, then book consultation if your timeline is urgent.</p><p><a href="${site}/assessment">Free Assessment</a><br /><a href="${site}/book-consultation">Consultation booking</a></p>`,
      attachBrochure: false,
    };
  }
  return {
    subject: "Final follow-up: ready for your next migration step?",
    text: [
      hello,
      "",
      "This is a final follow-up from MinRosh Migration.",
      "If you are still planning your pathway, we can help you move from uncertainty to a clear action plan.",
      "",
      `Start Free Assessment: ${site}/assessment`,
      `Book Consultation: ${site}/book-consultation`,
    ].join("\n"),
    html: `<p>${hello}</p><p>This is a final follow-up from MinRosh Migration.</p><p>If you are still planning your pathway, we can help you move from uncertainty to a clear action plan.</p><p><a href="${site}/assessment">Start Free Assessment</a><br /><a href="${site}/book-consultation">Book Consultation</a></p>`,
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
  await transport.sendMail({
    from: process.env.SMTP_FROM || "info@minroshmigration.com.au",
    to,
    subject,
    text,
    html,
    attachments: attachBrochure ? getBrochureAttachments() : [],
  });
  return true;
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
    const copy = buildStepCopy(day, cur.firstName);
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
