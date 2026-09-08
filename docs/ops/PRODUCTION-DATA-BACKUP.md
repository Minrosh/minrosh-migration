# Shared production-data backup

## Current state (2026-09-08)

| Item | Status |
| --- | --- |
| Canonical live data | `/home/minrosh/shared/production-data` |
| Included in `scripts/pre-upgrade.sh` archive? | **No** — that script archives the Git project tree under `minrosh-migration`, not `shared/production-data` |
| Incident immutable snapshots | Yes — under `/home/minrosh/incident-records/prod-zombie-standalone-20260908/data-snapshots/` (recovery evidence, not a standing backup schedule) |
| Upgrade backups dir | `/home/minrosh/minrosh-backups/upgrades/` (code/deps oriented) |

**Gap:** standing, scheduled, encrypted backups of `/home/minrosh/shared/production-data` are **not yet implemented**. Treat this as a priority ops follow-up.

## Recommended process (do not execute destructive tests from this doc alone)

### 1. Scope
- Include: entire `/home/minrosh/shared/production-data` tree + SHA-256 manifest
- Exclude: `.env`, keys, `.next`, `node_modules`, RC/staging/rollback data dirs
- Never back up secrets into the same tarball as customer JSON if avoidable; keep secrets separately

### 2. Encrypted backups
- `tar` + `age` or `gpg` symmetric/asymmetric encryption before any off-host copy
- Store encryption keys offline / in a password manager — not beside the ciphertext on the same host only

### 3. Retention
- Hourly (or 6-hourly) for 7 days
- Daily for 30 days
- Weekly for 90 days
- Keep one pre-cutover / pre-major-release freeze snapshot indefinitely with incident records

### 4. Restore testing
- Quarterly restore to a **scratch** directory (e.g. `/home/minrosh/shared/production-data.restore-test/`)
- Verify manifest + record counts; **do not** point production PM2 at the restore test dir
- No overwrite of live shared data during drills

### 5. Access control
- Directory mode `0750`, files `0640`, owner `minrosh:minrosh`
- Backup ciphertext `0600`; limit who can decrypt
- No world-readable copies under `/tmp` or release directories

### 6. Off-host copy
- After local encrypted archive, copy to a second machine / object storage with versioning
- Confirm checksum of ciphertext on arrival
- Do not use staging hosts as the only off-host copy

### 7. Recovery-point frequency
- Target RPO: **≤ 6 hours** for CRM/enquiry JSON under normal operations
- Before any future cutover: mandatory final snapshot (as performed 2026-09-08) regardless of schedule

## Suggested nightly command shape (example only — not enabled here)

```bash
# Example — enable only after operator review
# TS=$(date +%Y%m%dT%H%M%S%z)
# DEST=/home/minrosh/minrosh-backups/production-data/$TS
# mkdir -p "$DEST"
# rsync -a /home/minrosh/shared/production-data/ "$DEST/tree/"
# (cd "$DEST/tree" && find . -type f -print0 | sort -z | xargs -0 sha256sum) > "$DEST/MANIFEST.sha256"
# tar -C "$DEST" -czf - tree MANIFEST.sha256 | age -r <backup-recipient> > "$DEST/production-data.tar.gz.age"
```

## Related scripts to extend later
- `scripts/pre-upgrade.sh` — add optional `SHARED_DATA_DIR` archive step
- New `scripts/backup-production-data.sh` (recommended dedicated script)
