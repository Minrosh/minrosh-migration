import fs from "node:fs";
import path from "node:path";
import { invoicesFile } from "./paths";

const lockPath = path.join(path.dirname(invoicesFile), ".invoice-mutation.lock");

function sleepBusy(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

/**
 * Serialize invoice JSON mutations (flat file) to reduce duplicate invoice numbers under concurrency.
 */
export function withInvoiceMutationLock(fn) {
  const maxAttempts = 250;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const fd = fs.openSync(lockPath, "wx");
      try {
        return fn();
      } finally {
        fs.closeSync(fd);
        try {
          fs.unlinkSync(lockPath);
        } catch {
          /* ignore */
        }
      }
    } catch (e) {
      if (e && e.code !== "EEXIST") throw e;
      sleepBusy(12 + Math.floor(Math.random() * 20));
    }
  }
  throw new Error("Could not acquire invoice lock");
}
