# OPERATIONAL FREEZE — DO NOT BUILD OR UPDATE HERE

**Incident:** Production `minrosh-next` is a split/zombie runtime (deleted-inode standalone).

**Forbidden until cutover approval:**
- `npm run build` / `next build` in `/home/minrosh/minrosh-migration`
- `scripts/update-server.sh` / `deploy-server.sh` / `deploy-ubuntu.sh` against this tree
- Deleting or replacing `/home/minrosh/minrosh-migration/.next` or `.next/standalone`
- Restarting or stopping PM2 app `minrosh-next`
- Building into the live production path

**Allowed:** Read-only diagnostics; isolated builds under `/home/minrosh/releases/<commit>/` only.
**Staging:** Use `/home/minrosh/minrosh-staging-no-marn` + `/home/minrosh/minrosh-staging-runtime` only.

Incident record: `/home/minrosh/incident-records/prod-zombie-standalone-20260908/`
