import fs from "node:fs";

function sleepBusy(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

/**
 * Serialize mutations to a single JSON-backed file (enquiries, newsletter, audit, etc.)
 * to reduce corruption risk when two requests write at once. For high traffic, move to a database.
 */
export function withMutationLock(lockPath, fn) {
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
  throw new Error("Could not acquire file mutation lock");
}
