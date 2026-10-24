# Phase 6A — baseline reconciliation

Audit only. No application code was edited. No branch was merged. No deploy ran. Production PM2 was not restarted. Uncommitted work was not overwritten.

## Exact release candidate

| Item | Value |
| --- | --- |
| Branch | `fix/shared-layout-remediation` |
| Commit | `0941a7643a72c4e6fc6cd00379c83aad8e29feda` |
| Parent | `1455a66a319e29fe968ca6d74e086cdebaf3c049` |
| Worktree | `/home/minrosh/minrosh-migration` |
| Git state | Dirty. 15 modified tracked files, 4 untracked groups. |
| Isolated build | `/home/minrosh/releases/qa-final-20261024` |
| Build id | `fgcXnrOiI-9D_Z4pkeSY8` |
| Server | `127.0.0.1:3120`, pid 188117, cwd `.../qa-final-20261024/.next/standalone` |
| What the server contains | The dirty tree at rsync time: Phase 2–4 edits plus the sitemap date change and `buildMetadata()` suffix strip. |
| What the server does not contain | The later edit to `e2e/public-visual-regression.spec.mjs` only. `app/sitemap.js`, `lib/seo.js`, and `app/globals.css` match the worktree. |

`0941a76` itself is one ops commit, “ops: harden compliance release after production cutover”. The October layout, hero, title, and sitemap fixes are **not committed**. They are the dirty working tree.

## Branches and worktrees

| Location | HEAD | State | Relation to the candidate |
| --- | --- | --- | --- |
| `/home/minrosh/minrosh-migration` | `0941a76` `fix/shared-layout-remediation` | Dirty, as above | This is the candidate. |
| `/home/minrosh/minrosh-design-refresh-worktree` | `3a0acf9` `design/premium-visual-refresh` | Clean | 13 commits ahead of `0941a76`. Merge-base is `0941a76`. It does **not** contain the uncommitted remediation. It does rewrite `app/globals.css` (+422/− in the committed diff), `app/home.css`, and `home-hero-premium.jsx`. Those commits also include `feature/registered-professional-referrals` history (`66c8af1`, facilitated professional visa services). |
| `/home/minrosh/minrosh-staging-no-marn` | `1455a66` detached | Clean | September staging. Parent of the remediation commit. No October fixes. Process on `127.0.0.1:3001`, pid 1874. |
| `/home/minrosh/releases/1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908` | `1455a66` detached | Dirty: `package.json`, `package-lock.json`, plus untracked ecosystem config files and `.OPERATIONAL_PATCHES.md` | Production checkout. `next-server` pid 1875, port 3000, cwd is this release’s `.next/standalone`. |
| `/home/minrosh/minrosh-referral-worktree` | `66c8af1` | Clean | Ancestor of the design branch, not of the dirty fixes. |
| `/home/minrosh/minrosh-migration-hotfix-mobile` | `1b18a9b` `develop` | 2 untracked paths | Unrelated. |
| `/home/minrosh/minrosh-migration-landing-isolated` | `3a0419b` | Clean | Unrelated. |

Leftover listeners, not production: port 3118 is `next dev` in this worktree (pid 179336). Port 3119 is a next server whose cwd is `/home/minrosh/minrosh-migration/.next/standalone (deleted)` (pid 176148). They were not stopped in this phase.

## Which completed fixes are in the candidate

Included as uncommitted files, and present in the isolated build:

- Phase 2 shared header, nav, footer, and mobile offset edits in `app/globals.css` and `app/home.css`.
- Phase 3 homepage hero and inner hero edits in `components/home/home-hero-premium.jsx`, `components/ui/page-hero-strip.jsx`, `components/content-page.js`, guide pages, and `components/contact-calm-visual.jsx`.
- Phase 4 / final QA: `lib/seo.js` brand-suffix strip, `/visa-services` on the sitemap, static sitemap entries without a fabricated `lastModified`.

Not included:

- ISS-001, ISS-007, ISS-008, ISS-009, ISS-011, ISS-012, ISS-014, ISS-015, ISS-016, ISS-018, ISS-019, ISS-020.
- The design-branch visual system (`3a0acf9`).
- Anything on staging or production beyond `1455a66`.

`design/premium-visual-refresh` is the wrong tree to continue on. Checking it out from this worktree would require moving the dirty remediation aside first. Merging it would collide on the same CSS and hero files and would bring referral-positioning commits that conflict with the no-MARN constraint.

## Route reconciliation

The initial audit’s 89 and the final QA’s 90 are the same inventory plus one redirect and a renamed 404 probe. They are not a missing page and not the Next.js build table.

| Set | Count | Composition |
| --- | ---: | --- |
| Original public audit | 89 | Live sitemap 83 + five app routes not in that sitemap + one 404 probe |
| Those five routes |  | `/visa-services`, `/global-pathways`, `/thank-you`, `/maintenance`, `/newsletter/unsubscribe` |
| Original 404 probe |  | `/this-route-should-404-audit` |
| Production sitemap now | 83 | Indexability audit, 24 Oct 2026. Missing `/visa-services` relative to the candidate list. |
| Candidate sitemap | 84 | The previous 83 plus `/visa-services`. Seven `<lastmod>` values, one per news item. Static routes have none. |
| Final QA measurements | 90 | 84 sitemap URLs + `/global-pathways`, `/thank-you`, `/maintenance`, `/newsletter/unsubscribe`, `/book-consultation`, `/this-route-should-404-qa` |

Arithmetic: start from 89, drop the old 404 slug, add the new 404 slug, add `/book-consultation` (308 to `/book-information-session`, absent from the first manifest). `/visa-services` stays in the set but moves from “not in sitemap” into the 84. Result: 90.

Non-indexable or non-canonical pages in that 90:

- `/thank-you`, `/maintenance`, `/newsletter/unsubscribe`: noindex in source.
- `/book-consultation`: not a document; 308.
- `/this-route-should-404-qa`: 404.
- `/global-pathways`: HTTP 200 with a canonical and still omitted from both sitemaps.

The Next.js build route table also lists admin, API, and `upload/[token]`. Those are not public marketing routes and were not part of the 89 or the 90.

News articles are inside both sitemap counts. `data/news.json` has 7 items with slugs. They are not an extra public-route system beyond the sitemap.

## E2E: 24 failures

Run: `PLAYWRIGHT_LIVE_URL=http://127.0.0.1:3120 npx playwright test --workers=1`. Result: 24 failed, 139 passed. Tests were not edited, skipped, or weakened in this phase. Detail is in `PHASE-6A-E2E-FAILURES.csv`.

| Class | Count | Meaning |
| --- | ---: | --- |
| Genuine application defect | 7 | Duplicate `#main-content` from the destination loading shell (4), and the visual-regression assertions (3) for a second visible H1 and the unsubscribe title. |
| Timing or environmental | 17 | `Execution context was destroyed` during `page.evaluate`, or a contact submit button detached before `scrollIntoViewIfNeeded`. The same paths passed at other widths. |
| Test expectation mismatch | 0 | The failing assertions match the audit standard (one main, one visible H1, one brand suffix). |
| Feature-flag mismatch | 0 inside these 24 | Separate from this run: `npm run test:nav` failed because it still waits for “Smart Navigator” or “Visa Decision Engine”. `/assessment` correctly shows “Official Information Finder”. That failure is a stale test name, not one of the 24. |
| Unverified | 0 | Every failure has a Playwright error string. The 17 timing failures are not verified as layout bugs. |

`npm run test:nav` is not a green signal. It was not “fixed” by changing the test.

## Outstanding P1 blockers

ISS-023, ISS-022 (partial), ISS-007, ISS-004 (partial), ISS-005 (partial), ISS-001 (open, not re-measured), ISS-011.

No P0 is on the register.

## Risks of continuing on the wrong branch

- Treating staging `1455a66` or production port 3000 as the October candidate will hide every uncommitted fix and reintroduce the original audit defects.
- Continuing on `design/premium-visual-refresh` will design against a different `globals.css` / hero and can pull in the registered-professional referral commits.
- Committing or deploying the dirty tree as-is still ships ISS-023 and ISS-011. The NO-GO stands.
- The production release directory is itself dirty (`package.json`, lockfile, untracked ecosystem files). Do not copy the QA `.next` onto it.

## Stop

No further remediation was started. Review these three files before any code change:

- `reports/visual-audit/PHASE-6A-BASELINE-RECONCILIATION.md`
- `reports/visual-audit/PHASE-6A-E2E-FAILURES.csv`
- `reports/visual-audit/PHASE-6A-OPEN-ISSUES.md`
