# Google Search Console: reindex after deploy

Google does **not** offer a reliable public “ping sitemap” URL anymore. Reindexing is **manual in Search Console** (or via the Search Console API with OAuth, not configured in this repo).

## Prerequisites

- Property verified for **https://minroshmigration.com.au** (URL-prefix or domain).
- You are signed in with an account that has **Owner** or **Full** user rights.

## 1. Sitemaps — submit or refresh

1. Open [Google Search Console](https://search.google.com/search-console).
2. Select the **minroshmigration.com.au** property.
3. Left menu: **Sitemaps**.
4. Under “Add a new sitemap”, enter: `sitemap.xml` (or the full URL below) and submit.  
   **Full URL:** `https://minroshmigration.com.au/sitemap.xml`
5. If it already exists, open the sitemap row and use **See page indexing** / resubmit as needed after major URL or content changes.

## 2. URL Inspection — request indexing (priority URLs)

Do this for high-traffic or recently changed pages (home, key hubs, new guides).

1. Top search bar: **URL Inspection**.
2. Enter the full URL (example: `https://minroshmigration.com.au/`).
3. Wait for the test result, then click **Request indexing** (quota applies; use for important URLs).

### Homepage after layout or header changes

Google may still show an older cached render snippet for `/` even when the live site is updated. After **material** changes to the home layout, sticky header, hero, or above-the-fold content, it is worth using **URL Inspection** on the homepage and clicking **Request indexing** once (optional; subject to Search Console quota). This does not guarantee immediate SERP updates, but it nudges recrawl of that URL.

### Priority URLs (Stage 0 / marketing indexability)

Use **URL Inspection** on these after major deploys or when Search Console flags coverage issues. Replace the host if you use a different production domain.

**Core funnels**

- `https://minroshmigration.com.au/`
- `https://minroshmigration.com.au/student-visa-australia`
- `https://minroshmigration.com.au/skilled-migration`
- `https://minroshmigration.com.au/partner-visa-australia`
- `https://minroshmigration.com.au/education-consultation`
- `https://minroshmigration.com.au/contact`
- `https://minroshmigration.com.au/book-consultation`
- `https://minroshmigration.com.au/assessment`

**Destination hubs**

- `https://minroshmigration.com.au/destinations/australia`
- `https://minroshmigration.com.au/destinations/canada`
- `https://minroshmigration.com.au/destinations/united-kingdom`
- `https://minroshmigration.com.au/destinations/new-zealand`

**Tools & news**

- `https://minroshmigration.com.au/tools`
- `https://minroshmigration.com.au/tools/student-country-cost-planner`
- `https://minroshmigration.com.au/tools/pr-pathway-explorer`
- `https://minroshmigration.com.au/immigration-news`

**High-intent guides**

- `https://minroshmigration.com.au/australia-visa-fees-and-costs-guide`
- `https://minroshmigration.com.au/australia-visa-document-checklist-guide`
- `https://minroshmigration.com.au/migration-sri-lanka-to-australia`

**Also consider after content launches**

- `https://minroshmigration.com.au/contact`
- `https://minroshmigration.com.au/updates`
- Any new `/immigration-news/{slug}` article URLs

### Stage 0 indexability audit (local / CI)

After routing, sitemap, or metadata changes, run the full URL audit against production (or staging) and review the Markdown + CSV before relying on GSC alone:

```bash
npm run audit:indexability
# or
INDEXABILITY_BASE_URL=https://minroshmigration.com.au npm run audit:indexability
```

Optional: merge a Search Console export for per-URL `gscReason` columns:

```bash
node scripts/indexability-audit.mjs --gsc-csv=./path/to/gsc-export.csv
```

Outputs (by default): `reports/indexability-audit-stage-0.md` (summary + flagged URL table).

## 3. After each deploy (automated check + manual GSC)

From the project root (or CI), verify that crawl endpoints respond:

```bash
npm run reindex:verify
```

### Live roadmap smoke (tools routes + homepage bundle age)

After deploying **latest `main`** (including PR #3 tool routes), confirm production matches the repo:

```bash
npm run verify:live-roadmap
# or staging:
SITE_URL=https://your-staging-host.example npm run verify:live-roadmap
```

Expect **HTTP 200** on `/tools/student-country-cost-planner` and `/tools/pr-pathway-explorer`, both segments present in `sitemap.xml`, and the homepage HTML **without** deprecated strings (`MinRosh Intelligence v3.4`, “The Island.”, fake “Live Activity” strip). Exit code **1** means production is still behind `main` or an older bundle is cached — resolve by redeploying (`bash scripts/update-server.sh` on the host per `scripts/deploy-ubuntu.sh` flow).

**Human gate — mobile (Stage 1):** Spot-check priority URLs at **320–768px** (`/`, `/tools`, `/student-visa-australia`, `/skilled-migration`, `/assessment`) for readable hero, nav, and CTAs after deploy.

Optional: point `reindex:verify` at staging.

```bash
SITE_URL=https://your-staging-host.example npm run reindex:verify
```

Then repeat **§1–§2** in Search Console for any **urgent** URLs that must be recrawled immediately.

## Deploy script

`scripts/deploy-ubuntu.sh` runs `npm run reindex:verify` after PM2 reload unless you set `SKIP_REINDEX_VERIFY=1`.

## Related code

- Sitemap: `app/sitemap.js` (ISR `revalidate` for periodic regeneration).
- Robots + host: `app/robots.js`.
- Verify script: `scripts/reindex-verify.mjs`.
