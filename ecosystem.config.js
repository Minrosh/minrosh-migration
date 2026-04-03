const path = require("path");

/**
 * PM2 runs with cwd = .next/standalone so:
 * - public/uploads and data/*.json resolve next to server.js (matches copy-standalone-assets.mjs).
 * Set ADMIN_PASSWORD (and SMTP_*, OPENAI_API_KEY, etc.) before start, e.g.:
 *   export ADMIN_PASSWORD='...'
 *   pm2 restart ecosystem.config.js --update-env
 * Or inject via hosting panel / systemd Environment=.
 */
module.exports = {
  apps: [
    {
      name: "minrosh-next",
      cwd: path.join(__dirname, ".next", "standalone"),
      script: "server.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        // ADMIN_PASSWORD: "set-in-shell-or-hosting-panel",
        // ADMIN_SESSION_SECRET: "optional",
        // ADMIN_COOKIE_SECURE: "true",
      },
    },
  ],
};
