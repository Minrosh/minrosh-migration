import fs from "node:fs";
import path from "node:path";
import { isPathInsideRoot } from "@/lib/security/upload-validation";
import { storageUploadsDir } from "./paths";

export function getCustomerFolder(customer) {
  return customer.uploadFolder || customer.id;
}

export function getPrivateCustomerDir(customer) {
  return path.join(storageUploadsDir, getCustomerFolder(customer));
}

/**
 * Resolve a stored file under private storage only.
 * @param {{ uploadFolder?: string, id: string }} customer
 * @param {string} storedName
 * @returns {string | null} absolute path
 */
export function resolveCustomerFileAbsolute(customer, storedName) {
  const raw = String(storedName || "");
  if (!raw || /[/\\]|\.\./.test(raw)) return null;
  const safeName = path.basename(raw);
  if (!safeName || safeName !== raw) return null;
  const folder = getCustomerFolder(customer);

  const privatePath = path.join(storageUploadsDir, folder, safeName);
  if (!isPathInsideRoot(storageUploadsDir, privatePath)) return null;
  if (fs.existsSync(privatePath)) return privatePath;

  return null;
}

export function listCustomerFileNamesOnDisk(customer) {
  const folder = getCustomerFolder(customer);
  const dir = path.join(storageUploadsDir, folder);
  const names = new Set();
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  for (const n of fs.readdirSync(dir)) {
    if (n.startsWith(".")) continue;
    const p = path.join(dir, n);
    if (fs.statSync(p).isFile()) names.add(n);
  }
  return [...names];
}
