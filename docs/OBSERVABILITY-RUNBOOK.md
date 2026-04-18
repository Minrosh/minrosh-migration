# Observability and Error-Handling Runbook

## What was added

- Request correlation header `x-request-id` is now propagated from middleware to API responses.
- Standard API response envelope helpers are available in `lib/api/response.js`.
- Structured runtime logs are emitted via `lib/observability/logger.js`.
- Cron run telemetry is stored in `data/cron-runs.json` via `lib/observability/cron-telemetry.js`.

## Response envelope contract

- Success:
  - `{ ok: true, requestId, data }`
- Failure:
  - `{ ok: false, requestId, error: { code, message, details? } }`

Error code baseline:

- `AUTH_UNAUTHORIZED`
- `AUTH_FORBIDDEN`
- `VALIDATION_FAILED`
- `NOT_FOUND`
- `CONFLICT`
- `RATE_LIMITED`
- `UPSTREAM_ERROR`
- `INTERNAL_ERROR`

## Triage workflow

1. Capture `x-request-id` from failing API response.
2. Search PM2 logs for that request ID.
3. Check related audit events (many admin actions now include `requestId`).
4. For scheduled jobs, find matching `jobRunId` in `data/cron-runs.json`.
5. If upstream related, inspect `error.code` and route-specific telemetry event.

## Alert recommendations

Create alerts from structured logs:

- Repeated `AUTH_UNAUTHORIZED` failures on admin routes over short windows.
- `cron_run_failed` events for critical jobs:
  - intelligence scan
  - facebook publish
  - invoice recurring/reminders/sync
  - upload retention
- Sustained `UPSTREAM_ERROR` spikes for integrations.
- Any increase in webhook signature/auth failures.

## Operational toggles

- `OBS_JSON_LOG=true` to force structured observability logging.
- In production, observability logs are on by default unless `OBS_JSON_LOG=false`.
- `SECURITY_JSON_LOG=true` keeps dedicated security event logging enabled.

## Rollout notes

- Migrate remaining API routes incrementally to `apiOk` / `apiFail`.
- Avoid returning raw exception messages for unknown server errors.
- Always include `requestId` in `appendAudit(...)` context where available.
