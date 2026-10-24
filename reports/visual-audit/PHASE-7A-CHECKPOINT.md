# Phase 7A — Remediation checkpoint

The Phase 6B–6E working tree is now a local commit on `fix/phase-6b-critical-repairs`. Production was not restarted, merged, or deployed. Phase 7B has not started.

## Preserved revision

| Item | Value |
| --- | --- |
| Branch | `fix/phase-6b-critical-repairs` |
| Previous HEAD | `0941a7643a72c4e6fc6cd00379c83aad8e29feda` |
| Checkpoint commit | `8f69b9c3235c8343162d4da79a68e5eae27d3901` |
| Commit subject | `checkpoint: preserve the phase 6B–6E public remediation` |
| Upstream | None. This commit was not pushed. |
| Parent | `0941a76` |

`0941a76` alone does not contain the remediation. Recovery of the fixes starts at `8f69b9c`.

## Backup and recovery

A copy was taken before the commit:

`/home/minrosh/backups/phase-7a-20261024/`

| Path | Contents |
| --- | --- |
| `HEAD.txt`, `BRANCH.txt`, `git-status.txt` | Provenance at backup time |
| `working-tree.patch` | Full unstaged diff against `0941a76` |
| `untracked.txt` | Untracked paths at backup time |
| `working-tree/` | Source, tests, and audit files, including the screenshot directory |

The backup excludes `node_modules`, `.next`, `.git`, `.env` files, enquiry and customer JSON, CRM mirrors, admin auth files, and upload storage. No credential file was found in the uncommitted tree. The secret scan of the diff found no API keys, passwords, or private keys.

Recovery without using the commit:

```bash
# application fixes that were uncommitted at backup time
git -C /home/minrosh/minrosh-migration apply /home/minrosh/backups/phase-7a-20261024/working-tree.patch
# untracked reports, screenshots, and tests
rsync -a /home/minrosh/backups/phase-7a-20261024/working-tree/reports/ /home/minrosh/minrosh-migration/reports/
rsync -a /home/minrosh/backups/phase-7a-20261024/working-tree/e2e/public-visual-regression.spec.mjs /home/minrosh/minrosh-migration/e2e/
rsync -a /home/minrosh/backups/phase-7a-20261024/working-tree/tests/seo-title-and-sitemap.test.mjs /home/minrosh/minrosh-migration/tests/
```

Recovery from Git, which is now the primary copy of the reviewed source:

```bash
git -C /home/minrosh/minrosh-migration checkout 8f69b9c3235c8343162d4da79a68e5eae27d3901
```

Screenshot files stay out of Git because the directory is about 500 MB. They remain in the backup and as untracked files in the working tree.

`reports/seo-meta-audit.md` was left untracked. It is an August 2026 scan that still describes the old “append the brand suffix” title rule. It is not part of the 6B–6E remediation. The backup contains it.

## Change manifest

79 files are in `8f69b9c`. The application portion is the 49 previously modified tracked files, plus `e2e/public-visual-regression.spec.mjs` and `tests/seo-title-and-sitemap.test.mjs`. Audit reports, the issue register, crawl JSON, and Lighthouse JSON are included. Screenshots are not.

The application changes cover:

- Fixed header offsets and scroll restoration, including fragment scrolling.
- Homepage hero kept on `/images/hero-brisbane-river-cbd-hd.jpg`, with the heading scale unchanged and the image no longer marked `priority`.
- Body fade removed. Homepage sections render on the server. Framer-motion scroll effects are not mounted from the homepage. Widgets wait for idle time.
- News renders in the initial HTML. The empty feedback carousel is gone.
- Assessment stays the Official Information Finder.
- 404 uses the public shell and the Brisbane photograph. Unsubscribe uses one brand suffix and `noindex`.
- Loading shells are status regions, not a second H1.
- `/visa-services` and `/global-pathways` are in the sitemap. Static sitemap entries still omit fabricated `lastModified` values.
- Brand-first titles stay absolute so the root template does not double the brand.
- Service worker install no longer calls `skipWaiting()`.
- Public footer no longer renders enquiry, newsletter, or update counts. Unused `.site-footer__stats` rules were removed after the Phase 6E measurement.

## Candidate identity

| | Previously tested (Phase 6E) | This checkpoint |
| --- | --- | --- |
| Directory | `/home/minrosh/releases/qa-phase-6d-20261024` | `/home/minrosh/releases/qa-phase-7a-20261024` |
| Source revision | Dirty tree on `0941a76` | `8f69b9c` |
| Build ID | `ylEu7v9rhXF8KidAH3F2T` | `77twwzIB6FZFnBcgaBAf3` |
| Server | `http://127.0.0.1:3123` | `http://127.0.0.1:3124` |
| Environment | `SITE_ENVIRONMENT=production`, `SKIP_ENV_VALIDATION=1`, no `.env` | Same |
| Sitemap | 85 URLs, includes `/visa-services` and `/global-pathways` | Same |
| Homepage title | One brand-first sentence | Same |
| Hero file in HTML | Brisbane JPEG | Brisbane JPEG |
| Footer counts in HTML | Absent | Absent |

The only application source difference from the Phase 6E tree is `app/globals.css`: the unused footer-stat rules were deleted. That changes the CSS bundle and therefore the build ID. Behaviour already measured in Phase 6E is otherwise the same source. `verify-robots-build-artifact` again skipped a missing `robots.txt.body`. Live `GET /robots.txt` on port 3124 is HTTP 200, allows `/`, and disallows `/admin`, `/api`, and `/upload`.

Checked on port 3124: assessment title is `Official Information Finder | MinRosh Migration` with one H1; unsubscribe title is `Unsubscribe | MinRosh Migration` with one H1; an unknown URL returns 404, `noindex`, and one H1.

## Validation on this build

| Command | Result |
| --- | --- |
| `npm run build` in `/home/minrosh/releases/qa-phase-7a-20261024` | Exit 0. Build `77twwzIB6FZFnBcgaBAf3`. |
| `npm run test:unit` | 20 files, 108 passed. |
| `npm run test:e2e` with `PLAYWRIGHT_LIVE_URL=http://127.0.0.1:3124`, workers 1 | 163 passed, including the public visual checks at 390, 768, and 1440. |
| `npm run test:nav` with `UI_AUDIT_BASE_URL=http://127.0.0.1:3124` and no admin credentials | Passed. Admin wall detected. Authenticated sidebar checks were not run. |
| `npm run routes:verify` with `SITE_URL=http://127.0.0.1:3124` | Home, sitemap, and robots.txt returned HTTP 200. |
| `npm run audit:indexability` with `INDEXABILITY_BASE_URL=http://127.0.0.1:3124` | Exit 0. 85 URLs, no parity mismatch. |

The contact-route unit test still logs `contact_supabase_dual_write_failed_pre_email` when the Supabase mirror is absent. That test passes. It did not send mail.

## Production

Unchanged.

| PM2 app | PID | Port | Directory |
| --- | --- | --- | --- |
| `minrosh-next` | 1875 | 3000 | `1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908` |
| `minrosh-staging` | 1874 | 3001 | `/home/minrosh/minrosh-staging-no-marn` |

The Phase 6E candidate on port 3123 was left running so it can still be compared with this checkpoint.

## Stop

This is a local checkpoint, not a release approval. The Phase 6E recommendation remains NO-GO until compliance sign-off, isolated form tests, and a reviewed cutover. Do not continue to Phase 7B from this report.
