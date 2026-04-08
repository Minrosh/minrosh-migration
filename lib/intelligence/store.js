import fs from "node:fs";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";
import { withMutationLock } from "@/lib/json-mutation-lock";
import {
  intelligenceSourcesFile,
  intelligenceEventsFile,
  intelligenceDraftsFile,
  adminAlertsFile,
} from "@/lib/admin/paths";

function ensureFile(filePath, fallback) {
  if (fs.existsSync(filePath)) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  writeJsonAtomic(filePath, fallback);
}

function ensureStores() {
  ensureFile(intelligenceSourcesFile, { sources: [] });
  ensureFile(intelligenceEventsFile, { events: [] });
  ensureFile(intelligenceDraftsFile, { drafts: [] });
  ensureFile(adminAlertsFile, { alerts: [] });
}

function lockPath(name) {
  return path.join(path.dirname(intelligenceSourcesFile), `.intelligence-${name}.lock`);
}

export function readIntelligenceSources() {
  ensureStores();
  return readJsonFile(intelligenceSourcesFile, { sources: [] });
}

export function writeIntelligenceSources(payload) {
  ensureStores();
  writeJsonAtomic(intelligenceSourcesFile, payload);
}

export function readIntelligenceEvents() {
  ensureStores();
  return readJsonFile(intelligenceEventsFile, { events: [] });
}

export function writeIntelligenceEvents(payload) {
  ensureStores();
  writeJsonAtomic(intelligenceEventsFile, payload);
}

export function readIntelligenceDrafts() {
  ensureStores();
  return readJsonFile(intelligenceDraftsFile, { drafts: [] });
}

export function writeIntelligenceDrafts(payload) {
  ensureStores();
  writeJsonAtomic(intelligenceDraftsFile, payload);
}

export function readAdminAlerts() {
  ensureStores();
  return readJsonFile(adminAlertsFile, { alerts: [] });
}

export function writeAdminAlerts(payload) {
  ensureStores();
  writeJsonAtomic(adminAlertsFile, payload);
}

export function summarizeBody(text, max = 220) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
}

export function hashContent(input) {
  return createHash("sha256").update(String(input || ""), "utf8").digest("hex");
}

export function upsertSourceSnapshot({ sourceId, sourceName, url, contentHash, excerpt }) {
  return withMutationLock(lockPath("sources"), () => {
    const now = new Date().toISOString();
    const store = readIntelligenceSources();
    const list = Array.isArray(store.sources) ? store.sources : [];
    const idx = list.findIndex((item) => item.sourceId === sourceId);
    const previous = idx >= 0 ? list[idx] : null;
    const next = {
      sourceId,
      sourceName,
      url,
      contentHash,
      excerpt: summarizeBody(excerpt, 400),
      updatedAt: now,
      createdAt: previous?.createdAt || now,
    };
    if (idx >= 0) list[idx] = next;
    else list.unshift(next);
    writeIntelligenceSources({ sources: list.slice(0, 1000) });
    return { previous, next };
  });
}

export function appendIntelligenceEvent(event) {
  return withMutationLock(lockPath("events"), () => {
    const store = readIntelligenceEvents();
    const list = Array.isArray(store.events) ? store.events : [];
    const row = {
      id: event.id || `intel-event-${randomUUID()}`,
      createdAt: new Date().toISOString(),
      ...event,
    };
    list.unshift(row);
    writeIntelligenceEvents({ events: list.slice(0, 5000) });
    return row;
  });
}

export function createPendingDraft(payload) {
  return withMutationLock(lockPath("drafts"), () => {
    const now = new Date().toISOString();
    const store = readIntelligenceDrafts();
    const drafts = Array.isArray(store.drafts) ? store.drafts : [];
    const draft = {
      id: `intel-draft-${randomUUID()}`,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      country: payload.country,
      sourceId: payload.sourceId,
      sourceName: payload.sourceName,
      sourceUrl: payload.sourceUrl,
      sourcePublishedAt: payload.sourcePublishedAt || null,
      headline: payload.headline,
      summary: summarizeBody(payload.summary, 350),
      body: String(payload.body || "").trim(),
      seoTitle: payload.seoTitle || payload.headline,
      seoDescription: summarizeBody(payload.seoDescription || payload.summary, 180),
      faqSuggestions: Array.isArray(payload.faqSuggestions) ? payload.faqSuggestions : [],
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      grounding:
        payload.grounding && typeof payload.grounding === "object"
          ? {
              sourceUrl: String(payload.grounding.sourceUrl || payload.sourceUrl || ""),
              confidence: Number(payload.grounding.confidence || 0.7),
              contentHash: String(payload.grounding.contentHash || ""),
              excerpt: summarizeBody(payload.grounding.excerpt || payload.summary || "", 600),
              extractedAt: payload.grounding.extractedAt || now,
            }
          : null,
      moderationNote: "",
      publishedAt: null,
    };
    drafts.unshift(draft);
    writeIntelligenceDrafts({ drafts: drafts.slice(0, 2000) });
    return draft;
  });
}

export function updateDraftStatus({ id, status, moderationNote, edits }) {
  return withMutationLock(lockPath("drafts"), () => {
    const store = readIntelligenceDrafts();
    const drafts = Array.isArray(store.drafts) ? store.drafts : [];
    const idx = drafts.findIndex((d) => d.id === id);
    if (idx < 0) return null;
    const current = drafts[idx];
    const now = new Date().toISOString();
    const next = {
      ...current,
      ...(edits && typeof edits === "object" ? edits : {}),
      status: status || current.status,
      moderationNote: moderationNote !== undefined ? String(moderationNote || "") : current.moderationNote,
      updatedAt: now,
      publishedAt: status === "approved" ? now : current.publishedAt,
    };
    drafts[idx] = next;
    writeIntelligenceDrafts({ drafts });
    return next;
  });
}

export function pushAdminAlert(alert) {
  return withMutationLock(lockPath("alerts"), () => {
    const store = readAdminAlerts();
    const alerts = Array.isArray(store.alerts) ? store.alerts : [];
    const row = {
      id: alert.id || `admin-alert-${randomUUID()}`,
      type: alert.type || "info",
      title: alert.title || "New alert",
      message: summarizeBody(alert.message, 500),
      href: alert.href || "",
      createdAt: new Date().toISOString(),
      read: false,
    };
    alerts.unshift(row);
    writeAdminAlerts({ alerts: alerts.slice(0, 1000) });
    return row;
  });
}
