# Phase 8A — Release baseline

**Release recommendation remains NO-GO.**

The Phase 7B title reconciliation is now a local Git commit. That removes the uncommitted-source reason recorded in Phase 7E. Professional approval is still unrecorded, external mail, calendar, and payment delivery are still unverified, and the committed source has not been rebuilt into a new build ID. Nothing was pushed, merged, or deployed.

Production `minrosh-next` (pid 1875, started Mon Oct 12 19:42:31 2026) and staging `minrosh-staging` (pid 1874, started Mon Oct 12 19:42:30 2026) were still those processes after this phase. Production cwd remains `/home/minrosh/releases/1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908/.next/standalone`.

## Git baseline

| Item | Value |
| --- | --- |
| Branch | `fix/phase-6b-critical-repairs` |
| Upstream | None. This commit was not pushed. |
| Phase 6B–6E remediation | `8f69b9c3235c8343162d4da79a68e5eae27d3901` |
| Phase 7A report | `d8ad8d2f9fdce1d1c9e3bc8114b260fa1028b285` |
| Phase 8A checkpoint | `00a8c2d9fd487929300965201679323ecbad8902` |
| Parent of the checkpoint | `d8ad8d2f9fdce1d1c9e3bc8114b260fa1028b285` |
| Subject | `checkpoint: preserve the phase 7B title reconciliation` |
| Prior isolated build | `HlUV__DHBxpDuUhaRzd1k` at `/home/minrosh/releases/qa-phase-7e-20261024` |
| Stable production build used in rehearsal | `oSVNfoy1aP5XPl6oQwnv1` |

The operational freeze in the final QA report forbids an in-workspace production build and a deployment. It does not forbid a local checkpoint. Phase 8A asked for that checkpoint. The committed diff changes titles and title tests. It does not change regulatory sentences, credentials, or customer data. A secret scan of the diff found no API keys, passwords, or private keys.

### What each phase contributed

| Phase | Where it lives | Kind |
| --- | --- | --- |
| 7A remediation | `8f69b9c` | Application code, tests, and the 6B–6E audit record |
| 7A report | `d8ad8d2` | Documentation only |
| 7B title and metadata | `00a8c2d` | Application code and tests: `lib/seo.js`, `app/maintenance/page.js`, `data/seo-pages.json`, four destination section files, `tests/seo-title-and-sitemap.test.mjs` |
| 7B audit | `00a8c2d` | `PHASE-7B-SEO-TITLE-AUDIT.md`, `PHASE-7B-METADATA-INVENTORY.csv`, ISS-004 update in `issues.csv`, regenerated `reports/indexability-audit-stage-0.md` |
| 7C | `00a8c2d` | Documentation only. No application source changed in that phase |
| 7D | `00a8c2d` | Documentation only. No regulatory sentence was rewritten |
| 7E | `00a8c2d` | Documentation only. The NO-GO report is now in Git |

### Left outside the commit

| Path | Reason |
| --- | --- |
| `reports/visual-audit/screenshots/` | Generated evidence, 508MB. It remains in the working tree |
| `reports/seo-meta-audit.md` | Older untracked audit. It is not part of the candidate |
| `reports/visual-audit/PHASE-8A-RELEASE-BASELINE.md` | This review document, written after the commit |
| `reports/visual-audit/PHASE-8A-REMAINING-ISSUES.csv` | This review register, written after the commit |

Recovery of the pre-commit tree is at `/home/minrosh/backups/phase-8a-20261025/`. `working-tree.patch` is the full unstaged diff against `d8ad8d2`. `untracked-reports/` holds the 7B–7E documents as they stood before the commit. `phase7e-screenshot-inventory.txt` lists the Phase 7E captures. The screenshot files themselves were left in the working tree.

## Phase 7E NO-GO, re-read

Phase 7E refused release for three unmet gates:

1. The candidate depended on identified uncommitted files, so `HlUV__DHBxpDuUhaRzd1k` was not a Git revision.
2. Zero of 22 regulatory rows were Approved. REG-009, REG-010, and REG-020 still required correction.
3. Essential form delivery was unverified. Local JSON tests passed. SMTP, Google Calendar, Sheets, Supabase, and Stripe stayed blocked.

These gates were met in 7E and remain met: no open P0 or release-blocking P1 in `issues.csv`, 110 unit tests, 163 end-to-end tests, navigation, route verification, indexability, the sampled visual pass, the disposable rollback, and written cutover steps.

The source gate is now met at the Git layer by `00a8c2d`. It is not yet met at the build layer, because no isolated build has been run from that commit.

## Screenshot failure

The failed Phase 7E capture was a test procedure error.

The script clicked the mobile tab using the visible uppercase label `CONTACT` before hydration, then waited for a heading named `Latest immigration news`. That heading is not on the homepage. The timeout is in the saved shell log. A later run waited for hydration, used the accessible name `Contact`, opened `http://127.0.0.1:3128/contact`, and saved `reports/visual-audit/screenshots/phase7e/tab-contact-390.png` (69,446 bytes) with the H1 `General information or education-course enquiry`. The homepage news capture `home-news-390.png` (66,385 bytes) also exists. End-to-end visual regression passed at 390, 768, and 1440. This is not a website defect. Register row RB-012 is closed.

## Rollback evidence

Success was rechecked on 25 October 2026. It is not inferred from a stopped process. Disposable port 3129 served three successive processes. Production was not one of them.

| Step | Build | Home | Footer stats in HTML | Sitemap URLs | Robots | Hero JPEG | Contact |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Stable baseline | `oSVNfoy1aP5XPl6oQwnv1` | 200 | present | 83 | 200 | 200, 309309 bytes | 200 |
| Upgrade to the candidate | `HlUV__DHBxpDuUhaRzd1k` | 200 | absent | 85 | 200 | 200, 309309 bytes | 200, H1 present |
| Rollback to the stable copy | `oSVNfoy1aP5XPl6oQwnv1` | 200 | present | 83 | 200 | 200, 309309 bytes | 200 |

The disposable listener was then stopped. Port 3129 was closed. Pid 1875 and pid 1874 were unchanged. The rehearsal shows that a copy of the known stable release can replace the candidate and serve routes and the hero asset again. It does not show a switch of the live production process. That switch remains unapproved. Register row RB-010 is verified evidence, not an open defect.

## Remaining blockers

The full register is `reports/visual-audit/PHASE-8A-REMAINING-ISSUES.csv`.

| Order | ID | Class | What remains |
| --- | --- | --- | --- |
| 1 | RB-009 | Provenance | Rebuild from `00a8c2d` in an isolated directory and record the new build ID |
| 2 | RB-003 | Technical | Remove the second FAQPage block on `/skilled-migration` |
| 3 | RB-002 | Technical | Decide the upload-token canonical and Open Graph residual |
| 4 | RB-011 | Technical | Give the 404 page its own document title |
| 5 | RB-001 | Technical, after confirmation | Stop public operational counts from `/api/stats` and from the live footer |
| 6 | RB-005 | Human approval, then correction | Replace the complaints starter and template sentences |
| 7 | RB-006 | Human approval | Accept or replace the referral heading and introducer sentence. Do not invent a fee |
| 8 | RB-004 | Blocked external dependency | Verify SMTP, calendar, sheets, Supabase, and Stripe in a sandbox, or record that they stay disabled |
| 9 | RB-007 | Human approval | Mark the 22-row register. Zero rows are Approved |
| 10 | RB-008 | External configuration | Turn off the Cloudflare beacon injection, or record an exception. Leave CSP unchanged |

RB-010 and RB-012 do not require product changes.

## Still required before a GO recommendation

1. An isolated rebuild from `00a8c2d9fd487929300965201679323ecbad8902`.
2. Recorded professional approval of the Phase 7D register, including the complaints and referral rows.
3. A sandbox test or a written disable decision for mail, calendar, and payment.
4. The Cloudflare dashboard change, or an accepted exception.
5. Explicit production release approval. This baseline does not grant it.

Phase 8A stops here.
