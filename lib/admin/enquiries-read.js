import { ensureEnquiriesFile, readJsonFile, getEnquiriesFilePath } from "../contact";

export function readEnquiriesList() {
  ensureEnquiriesFile();
  const raw = readJsonFile(getEnquiriesFilePath(), []);
  return Array.isArray(raw) ? raw : [];
}
