# Website CMS — Test Stabilisation Report

**Branch:** `feature/website-cms`  
**Date:** 2026-06-28  
**Scope:** Fix parallel Vitest races on `data/website-pages.json` before Sprint 3e. No public route changes. No production deploy.

---

## Problem

Multiple CMS fallback and store tests backed up, mutated, and restored `data/website-pages.json` (and `website-versions.json`) in place. Under Vitest parallel workers this caused:

- Temporary corrupt or empty JSON mid-write
- Flaky publish failures (`Cannot publish: draft has no sections`)
- Intermittent `npm run build` failures (`Unexpected end of JSON input`)

---

## Fix

### 1. Isolated test data directory (`WEBSITE_CMS_TEST_DATA_DIR`)

Added `lib/website/cms-data-paths.js` with runtime path helpers:

- `getWebsitePagesFile()` / `getWebsiteVersionsFile()` — return real `data/*.json` in app/runtime, or temp files when `WEBSITE_CMS_TEST_DATA_DIR` is set.

`pages-store.js` and `version-store.js` now call these helpers on every read/write instead of static imports from `lib/admin/paths.js`.

### 2. Vitest setup (per worker)

Added `tests/setup/website-cms-test-setup.mjs`:

- Sets `WEBSITE_CMS_TEST_DATA_DIR` to `/tmp/minrosh-website-cms-tests/<worker-id>/`
- Resets pages + versions from seed files in `beforeEach`

Configured as a dedicated Vitest project (`website-cms`) so non-CMS unit tests are unaffected.

### 3. Test refactors

Removed all backup/restore logic from:

- `tests/website-cms-about-fallback.test.mjs`
- `tests/website-cms-contact-fallback.test.mjs`
- `tests/website-cms-student-visa-fallback.test.mjs`
- `tests/website-cms-skilled-migration-fallback.test.mjs`
- `tests/website-cms-pages-store.test.mjs`
- `tests/website-cms-publish.test.mjs`

Corrupt-JSON tests now write to the isolated temp file via `getWebsitePagesFile()`.

### 4. Production data untouched

`data/website-pages.json` and `data/website-versions.json` are initialised from seeds and are **never written by CMS tests** during Vitest runs.

---

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass |
| CMS tests (parallel) | **18/18 pass** |
| Full unit suite | **74/74 pass** |
| `data/website-pages.json` valid after tests | Yes (`schemaVersion: 1`, `pages: []`) |

---

## CI note

**Sequential CMS test runs are not required.** Isolation via `WEBSITE_CMS_TEST_DATA_DIR` allows default Vitest parallelism. CI continues to run `npm run test:unit` unchanged.

If adding new CMS store tests, import nothing that mutates `data/website-*.json` directly — rely on the `website-cms` Vitest project setup or set `WEBSITE_CMS_TEST_DATA_DIR` explicitly.

---

## Out of scope (unchanged)

- `/post-study-visa-australia` — not connected
- Homepage — not connected
- Production deploy — none
- `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true` on production — not enabled
