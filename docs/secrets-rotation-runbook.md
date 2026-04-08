# Secrets Rotation Runbook

## Scope
- Google service account credentials (`GOOGLE_APPLICATION_CREDENTIALS`)
- SMTP app password (`SMTP_PASS`)
- Cron and webhook secrets (`NURTURE_CRON_SECRET`, `GOOGLE_FORM_WEBHOOK_SECRET`)
- Admin session signing secret (`ADMIN_SESSION_SECRET`)

## Baseline Controls
- Keep service-account JSON outside git under `.secrets/`.
- Enforce restrictive permissions:
  - `chmod 700 .secrets`
  - `chmod 600 .secrets/*.json`
- Never paste raw secrets into issue trackers or commit messages.

## Rotation Procedure

### 1) Google service account key
1. Create a new JSON key in Google Cloud for the active service account.
2. Upload to server as a new file, e.g. `.secrets/minrosh-site-robot-2026-04.json`.
3. Update `.env`:
   - `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/new-file.json`
4. Reload app with env refresh:
   - `pm2 delete minrosh-next && pm2 start ecosystem.config.js && pm2 save`
5. Run admin integrations test and verify Calendar/Sheets/Drive pass.
6. Revoke old key in Google Cloud.

### 2) SMTP password
1. Generate a new SMTP app password in mail provider.
2. Update `.env` `SMTP_PASS`.
3. Reload PM2 (`delete/start/save`) and run a test contact submission.

### 3) Cron + webhook secrets
1. Generate long random values (at least 32 chars).
2. Update `.env`:
   - `NURTURE_CRON_SECRET=...`
   - `GOOGLE_FORM_WEBHOOK_SECRET=...`
3. Update external callers:
   - Cron trigger header `x-cron-secret` or bearer token
   - Google Form webhook sender `x-webhook-secret`
4. Reload PM2 and run one authenticated call to each endpoint.

### 4) Admin session secret
1. Generate a long random value and set `ADMIN_SESSION_SECRET` in `.env`.
2. Reload PM2.
3. Re-login in admin panel and verify authenticated endpoints.

## Post-rotation Verification
- `GET /` returns `200`.
- Admin Integrations page shows required values configured and probes pass.
- Sample contact submission is saved.
- `POST /api/cron/nurture` with secret returns run stats.
- `POST /api/webhooks/google-form` with secret writes/updates one enquiry.

## Rollback
- Revert `.env` to last known-good values.
- Reload PM2 (`delete/start/save`).
- Confirm admin integrations and sample flows recover.
