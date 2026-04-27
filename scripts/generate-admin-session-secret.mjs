#!/usr/bin/env node
/**
 * Print a strong random value suitable for ADMIN_SESSION_SECRET.
 * Copy into .env on each environment (never commit .env).
 *
 *   node scripts/generate-admin-session-secret.mjs
 */
import { randomBytes } from "node:crypto";

const secret = randomBytes(48).toString("base64url");
process.stdout.write(`${secret}\n`);
