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

**Suggested priority list (edit to match your launch):**

- `https://minroshmigration.com.au/`
- `https://minroshmigration.com.au/contact`
- `https://minroshmigration.com.au/destinations/australia`
- `https://minroshmigration.com.au/immigration-news` (and any new article URLs)

## 3. After each deploy (automated check + manual GSC)

From the project root (or CI), verify that crawl endpoints respond:

```bash
npm run reindex:verify
```

Optional: point at staging.

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
