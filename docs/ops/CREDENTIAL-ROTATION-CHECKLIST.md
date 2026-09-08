# Administrator credential rotation checklist (PENDING)

**Do not paste secret values into chat, Git, tickets, or this file.**  
**Do not rotate during an active cutover.** Handle each rotation as a separate
production environment update.

Status after 2026-09-08 compliance cutover: **all items below remain PENDING**.

| # | Credential | Where to rotate | Where production must receive the new value later | Notes |
| --- | --- | --- | --- | --- |
| 1 | SMTP password | Mail provider (mailbox / SMTP relay control panel) | Production runtime env loaded by PM2 for `minrosh-next` — currently `/home/minrosh/releases/1455a66a…-20260908/.env.production.runtime` keys `SMTP_PASS` (and related `SMTP_*`). Apply via a controlled env update + process reload **when approved**, never commit the value. | Rotate after confirming no freeze; test with `npm run test:smtp` against a throwaway recipient only if policy allows. |
| 2 | Google service-account key / JSON | Google Cloud Console → IAM → service account → keys (create new, disable old) | Path referenced by `GOOGLE_APPLICATION_CREDENTIALS` / private-key env fields in the same production runtime env. File must live **outside Git** (e.g. under `/home/minrosh/shared/secrets/` with `0600`). | Keep old key until new key verified; then disable. |
| 3 | Google Form webhook secret | Google Apps Script / Form webhook configuration that shares the HMAC/secret with the site | Production env key `GOOGLE_FORM_WEBHOOK_SECRET` on `minrosh-next`. Update form side and app env in the same maintenance window. | Mismatch causes webhook 401s. |
| 4 | Google Maps key restriction review | Google Cloud Console → APIs & Services → Credentials → Maps key | Browser key is `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (public by design). Restrict by HTTP referrer to `https://minroshmigration.com.au/*` and `http://127.0.0.1:3000/*` for admin diagnostics only if required. | Review is restriction hardening, not necessarily a new key. |

## Safe procedure (summary)

1. Generate/rotate the credential in the provider UI.
2. Store the new value only in the server-side secrets location / `.env.production.runtime` (mode `0600`).
3. Do **not** put secrets in `ecosystem.production.config.js` checked into Git, incident markdown, or chat.
4. Reload/restart `minrosh-next` only in an approved maintenance window (separate from this hardening task).
5. Verify the dependent feature; retain the previous secret until verification succeeds.
6. Tick the row above when done (date + operator initials only — no secret material).

## Related

- Feature flags that must stay disabled are unrelated to these credentials and must remain off (`ENABLE_PUBLIC_AI_CHAT`, pathway funnel, personalised quiz, matter portal, RMA mode, website CMS).
