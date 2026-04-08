import fs from "node:fs";
import path from "node:path";
import { writeJsonAtomic, readJsonFile } from "@/lib/contact";
import { withMutationLock } from "@/lib/json-mutation-lock";
import {
  crmInteractionsFile,
  crmLeadsFile,
  crmOpportunitiesFile,
  crmTasksFile,
  crmAutomationsFile,
  crmConversationsFile,
  crmQuotesFile,
} from "./paths";

function ensureFromSeed(filePath, seedPath, emptyFallback) {
  if (fs.existsSync(filePath)) return;
  if (fs.existsSync(seedPath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.copyFileSync(seedPath, filePath);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  writeJsonAtomic(filePath, emptyFallback);
}

function lockFor(filePath) {
  return path.join(path.dirname(filePath), `.crm-${path.basename(filePath)}.lock`);
}

function ensureInteractions() {
  ensureFromSeed(
    crmInteractionsFile,
    path.join(path.dirname(crmInteractionsFile), "crm-interactions.seed.json"),
    { interactions: [] },
  );
}

function ensureLeads() {
  ensureFromSeed(
    crmLeadsFile,
    path.join(path.dirname(crmLeadsFile), "crm-leads.seed.json"),
    { leads: [] },
  );
}

function ensureOpportunities() {
  ensureFromSeed(
    crmOpportunitiesFile,
    path.join(path.dirname(crmOpportunitiesFile), "crm-opportunities.seed.json"),
    { opportunities: [] },
  );
}

function ensureTasks() {
  ensureFromSeed(
    crmTasksFile,
    path.join(path.dirname(crmTasksFile), "crm-tasks.seed.json"),
    { tasks: [] },
  );
}

function ensureAutomations() {
  ensureFromSeed(
    crmAutomationsFile,
    path.join(path.dirname(crmAutomationsFile), "crm-automations.seed.json"),
    { rules: [] },
  );
}

function ensureConversations() {
  ensureFromSeed(
    crmConversationsFile,
    path.join(path.dirname(crmConversationsFile), "crm-conversations.seed.json"),
    { conversations: [], messages: [] },
  );
}

function ensureQuotes() {
  ensureFromSeed(
    crmQuotesFile,
    path.join(path.dirname(crmQuotesFile), "crm-quotes.seed.json"),
    { quotes: [] },
  );
}

export function readCrmInteractions() {
  ensureInteractions();
  return readJsonFile(crmInteractionsFile, { interactions: [] });
}

export function writeCrmInteractions(data) {
  writeJsonAtomic(crmInteractionsFile, data);
}

export function appendCrmInteraction(entry) {
  return withMutationLock(lockFor(crmInteractionsFile), () => {
    const log = readCrmInteractions();
    const interactions = Array.isArray(log.interactions) ? log.interactions : [];
    interactions.unshift(entry);
    writeCrmInteractions({ interactions: interactions.slice(0, 5000) });
    return entry;
  });
}

export function readCrmLeads() {
  ensureLeads();
  return readJsonFile(crmLeadsFile, { leads: [] });
}

export function writeCrmLeads(data) {
  writeJsonAtomic(crmLeadsFile, data);
}

export function readCrmOpportunities() {
  ensureOpportunities();
  return readJsonFile(crmOpportunitiesFile, { opportunities: [] });
}

export function writeCrmOpportunities(data) {
  writeJsonAtomic(crmOpportunitiesFile, data);
}

export function readCrmTasks() {
  ensureTasks();
  return readJsonFile(crmTasksFile, { tasks: [] });
}

export function writeCrmTasks(data) {
  writeJsonAtomic(crmTasksFile, data);
}

export function readCrmAutomations() {
  ensureAutomations();
  return readJsonFile(crmAutomationsFile, { rules: [] });
}

export function writeCrmAutomations(data) {
  writeJsonAtomic(crmAutomationsFile, data);
}

export function readCrmConversationsBundle() {
  ensureConversations();
  return readJsonFile(crmConversationsFile, { conversations: [], messages: [] });
}

export function writeCrmConversationsBundle(data) {
  writeJsonAtomic(crmConversationsFile, data);
}

export function readCrmQuotes() {
  ensureQuotes();
  return readJsonFile(crmQuotesFile, { quotes: [] });
}

export function writeCrmQuotes(data) {
  writeJsonAtomic(crmQuotesFile, data);
}
