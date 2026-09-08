# Production release operational patches

Releases under `/home/minrosh/releases/<commit>-*/` are **not always byte-identical
to a clean `git archive` + build**. Emergency operational patches may be applied
to build output without a new Git commit.

Before comparing a running release to Git or rebuilding in place, read:

- `<release>/.OPERATIONAL_PATCHES.md` (if present)
- `/home/minrosh/incident-records/` for the related incident

## Active production release (cutover 2026-09-08)

| Field | Value |
| --- | --- |
| Path | `/home/minrosh/releases/1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908/` |
| Git commit | `1455a66a319e29fe968ca6d74e086cdebaf3c049` |
| BUILD_ID | `oSVNfoy1aP5XPl6oQwnv1` |
| Operational patches | **Yes** — robots.txt.body surgical fix (see incident record) |

The next controlled release should include the source fixes in
`docs/ops/ROBOTS-BUILD-AND-RUNTIME.md` so this patch is not required again.
