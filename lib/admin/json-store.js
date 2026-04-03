import fs from "node:fs";
import path from "node:path";
import { writeJsonAtomic, readJsonFile } from "../contact";
import {
  auditFile,
  auditSeed,
  customersFile,
  customersSeed,
  invoicesFile,
  invoicesSeed,
  successStoriesAdminFile,
  successStoriesSeed,
  uploadsDir,
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

export function ensureCustomersFile() {
  ensureFromSeed(customersFile, customersSeed, { customers: [] });
}

export function ensureInvoicesFile() {
  ensureFromSeed(invoicesFile, invoicesSeed, { invoices: [] });
}

export function ensureAuditFile() {
  ensureFromSeed(auditFile, auditSeed, { entries: [] });
}

export function ensureSuccessStoriesFile() {
  ensureFromSeed(successStoriesAdminFile, successStoriesSeed, { stories: [] });
}

export function ensureUploadsDir() {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export function readCustomers() {
  ensureCustomersFile();
  return readJsonFile(customersFile, { customers: [] });
}

export function writeCustomers(data) {
  writeJsonAtomic(customersFile, data);
}

export function readInvoices() {
  ensureInvoicesFile();
  return readJsonFile(invoicesFile, { invoices: [] });
}

export function writeInvoices(data) {
  writeJsonAtomic(invoicesFile, data);
}

export function readAudit() {
  ensureAuditFile();
  return readJsonFile(auditFile, { entries: [] });
}

export function writeAudit(data) {
  writeJsonAtomic(auditFile, data);
}

export function readAdminSuccessStories() {
  ensureSuccessStoriesFile();
  return readJsonFile(successStoriesAdminFile, { stories: [] });
}

export function writeAdminSuccessStories(data) {
  writeJsonAtomic(successStoriesAdminFile, data);
}
