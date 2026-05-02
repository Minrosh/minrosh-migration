import { defineConfig, devices } from "@playwright/test";

const liveUrl = process.env.PLAYWRIGHT_LIVE_URL?.trim();
/** CI uses a dedicated port so parallel dev servers on 4173 do not block e2e. Override with E2E_PORT. */
const defaultPort = process.env.CI ? "4177" : "4173";
const port = process.env.E2E_PORT || defaultPort;
const localBase = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`;
const baseURL = liveUrl || localBase;

/** Live/mobile-only runs hit production or staging; skip spawning local standalone. */
const webServer = liveUrl
  ? undefined
  : {
      command: `bash -lc 'npm run build && PORT=${port} HOSTNAME=127.0.0.1 node .next/standalone/server.js'`,
      url: baseURL,
      /** Non-CI: reuse an already-running server on the chosen port. CI: always start fresh on ${port}. */
      reuseExistingServer: !process.env.CI,
      /** Standalone production build + boot can exceed 2m on slower disks / cold cache. */
      timeout: 300_000,
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
