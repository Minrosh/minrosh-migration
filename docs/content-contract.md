# Content contract (public site + data)

This document lists **stable URLs** and **stable data sources** for the MinRosh Migration Next.js app. Treat changes here as SEO and ops risks unless you add redirects, migrations, and comms.

## Intentional URL redirects

Configured in [`next.config.mjs`](../next.config.mjs) under `redirects()`:

| From | To | Type |
|------|-----|------|
| `/migration-from-sri-lanka` | `/migration-sri-lanka-to-australia` | permanent (308) |

Any **new** public path rename must add a row here before removing the old route.

## Static marketing routes (sitemap + nav alignment)

These paths are listed in [`lib/public-indexable-routes.js`](../lib/public-indexable-routes.js) as `STATIC_SITEMAP_ROUTES` (includes `/tools` for the v1 feature slice). They should remain valid or be redirected.

- `/`
- `/skilled-migration`
- `/migration-sri-lanka-to-australia`
- `/partner-visa-australia`
- `/student-visa-australia`
- `/employer-sponsored-visas`
- `/visitor-visas`
- `/book-consultation`
- `/assessment`
- `/contact`
- `/education-consultation`
- `/about`
- `/faq`
- `/updates`
- `/privacy-policy`
- `/disclaimer`
- `/complaints`
- `/terms-of-use`
- `/code-of-conduct`
- `/partner-visa-australia-guide`
- `/student-visa-australia-requirements`
- `/skilled-migration-australia-points-guide`
- `/australia-visa-fees-and-costs-guide`
- `/australia-visa-processing-times-guide`
- `/australia-visa-document-checklist-guide`
- `/australia-vs-canada-migration-guide`
- `/tools` (novel features surface; see [`docs/feature-slice-v1.md`](feature-slice-v1.md))

## Dynamic destination routes

Derived from [`data/destinations.json`](../data/destinations.json) keys and [`lib/destination-nav.js`](../lib/destination-nav.js) section IDs:

- `/destinations/{slug}` for each hub slug (e.g. `australia`, `canada`, `new-zealand`, `united-kingdom`)
- `/destinations/{slug}/{section}` for each configured section id per slug

Section JSON may also live under [`data/destination-sections/`](../data/destination-sections/) depending on page implementation; do not delete or rename files there without updating loaders and internal links.

## Structured content files (do not corrupt)

| File / directory | Role |
|------------------|------|
| [`data/site.json`](../data/site.json) | Global copy, brand, hero, legal links — imported by many `app/**/page.js` files |
| [`data/destinations.json`](../data/destinations.json) | Destination hub copy and embedded sections |
| [`data/destination-sections/*.json`](../data/destination-sections/) | Optional per-destination section payloads |
| [`data/seo-pages.json`](../data/seo-pages.json) | SEO-related structured data where used |
| [`data/news.json`](../data/news.json) | News / updates content |
| [`app/sitemap.js`](../app/sitemap.js) | Sitemap uses `buildPublicSitemapRoutes` — keep in sync with real routes |

## Operational / admin data (runtime)

Under `data/` at runtime (often copied from `*.seed.json` on first boot):

- Customers, enquiries, invoices, audit log, CRM stores, nurture queue, success stories, etc.

Migrations should be **additive** (new keys/files) with backward-compatible readers. See [`lib/content/site-config.js`](../lib/content/site-config.js) for site JSON normalization.

## When you change something

1. Update this doc if you add/remove a **first-class** public route or redirect.
2. Update `STATIC_SITEMAP_ROUTES` / priorities in `lib/public-indexable-routes.js` if the URL should be indexed.
3. Run the [pre-release checklist](pre-release-checklist.md) before deploy.
