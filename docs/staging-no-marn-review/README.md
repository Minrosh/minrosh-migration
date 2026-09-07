# Staging no-MARN review notes

Private staging for commit review on branch `compliance/no-marn-update`.

## Staging-only configuration

| Setting | Value |
| --- | --- |
| Bind | `127.0.0.1:3001` (loopback only) |
| PM2 app | `minrosh-staging` |
| Worktree / build root | `/home/minrosh/minrosh-staging-no-marn` |
| Runtime data | `/home/minrosh/minrosh-staging-runtime/data-staging` (seed JSON only) |
| Env file | `/home/minrosh/minrosh-staging-runtime/.env.staging.private` |
| `SITE_ENVIRONMENT` | `staging` → noindex / robots Disallow |
| Feature flags | all compliance ENABLE_* flags `false` |
| Mail / Stripe / GA / Google CRM | unset |
| Public hostname | `https://staging.minroshmigration.com.au` Cloudflare 404 (not serving this deploy) |

Production `minrosh-next` on `:3000` must not be restarted from this workflow.

## Screenshots

Desktop and mobile captures from the private staging host are stored in this folder (`desktop-*.png`, `mobile-*.png`).

## Issues resolved in staging review follow-up

See parent docs (`no-marn-compliance-audit.md`, technical report, copy register) and commit `compliance: resolve staging review findings`.

## Administrator actions

Credential rotation checklist (names only) is recorded in `docs/no-marn-compliance-technical-report.md` under **Credential exposure response**.
