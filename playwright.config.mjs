import { defineConfig, devices } from "@playwright/test";

const liveUrl = process.env.PLAYWRIGHT_LIVE_URL?.trim();
const baseURL = liveUrl || process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173";

/** Live/mobile-only runs hit production or staging; skip spawning local standalone. */
const webServer = liveUrl
  ? undefined
  : {
      // Build standalone output, then run from repo root to avoid cwd-dependent failures.
      command: "bash -lc 'npm run build && PORT=4173 HOSTNAME=127.0.0.1 node .next/standalone/server.js'",
      url: baseURL,
      /** Local dev: reuse an already-running server on :4173. CI: always start fresh. */
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    };

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(webServer ? { webServer } : {}),
});
