import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const expectedDataSeeds = [
  "data/invoice-templates.seed.json",
  "data/invoice-recurring-rules.seed.json",
  "data/invoice-reminder-rules.seed.json",
  "data/invoice-time-entries.seed.json",
  "data/invoice-expenses.seed.json",
  "data/invoice-pos.seed.json",
  "data/invoice-grns.seed.json",
  "data/invoice-payments.seed.json",
  "data/invoice-bank-details.seed.json",
  "data/invoice-fx-rates.seed.json",
  "data/invoice-sync-jobs.seed.json",
];

for (const rel of expectedDataSeeds) {
  const p = path.join(root, rel);
  assert.equal(fs.existsSync(p), true, `${rel} should exist`);
  const raw = fs.readFileSync(p, "utf8");
  JSON.parse(raw);
}

const expectedRoutes = [
  "app/api/admin/invoice-templates/route.js",
  "app/api/admin/invoice-recurring/route.js",
  "app/api/admin/invoice-reminders/route.js",
  "app/api/admin/invoice-validation/route.js",
  "app/api/admin/invoice-reports/summary/route.js",
  "app/api/admin/invoice-sync/route.js",
  "app/api/admin/invoice-tracking/route.js",
  "app/api/portal/invoices/route.js",
  "app/api/portal/payment-method/route.js",
  "app/api/portal/profile/route.js",
  "app/api/cron/invoice-recurring/route.js",
  "app/api/cron/invoice-reminders/route.js",
  "app/api/cron/invoice-sync/route.js",
];

for (const rel of expectedRoutes) {
  assert.equal(fs.existsSync(path.join(root, rel)), true, `${rel} should exist`);
}

console.log("invoice platform structure smoke test passed");
