# Post-cutover production monitoring (24h)

Non-blocking checks for the isolated compliance release after the 2026-09-08 cutover.

## Escalate immediately if

- PM2 `minrosh-next` restart count increases
- Referenced `/_next/static` assets return non-200
- Writes appear outside `/home/minrosh/shared/production-data` (especially under release dirs, RC data, or live-tree `data/`)
- AI / personalised / portal / RMA / CMS flags become enabled
- Pre-compliance homepage title/metadata reappears (“Migration Agent Brisbane”, public MARN claims)
- Elevated HTTP 5xx on homepage or contact/booking routes

## Check script

```bash
node /home/minrosh/minrosh-migration/scripts/post-cutover-monitor.mjs
```

Appends redacted JSON lines to:

`/home/minrosh/incident-records/prod-zombie-standalone-20260908/16-monitor-24h.jsonl`

Escalations append to:

`.../16-monitor-ESCALATIONS.jsonl`

## Cadence

Every **15 minutes** for **24 hours** via local agent loop (no production restart).
