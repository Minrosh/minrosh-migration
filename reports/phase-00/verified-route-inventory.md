# Verified public route inventory (Phase 00)

Machine-readable: [`verified-route-inventory.csv`](./verified-route-inventory.csv)  
Summary JSON: [`inventory-summary.json`](./inventory-summary.json)

**Sources:** git `main` App Router + `lib/public-indexable-routes.js` + `data/destinations.json` + `data/news.json` + live `https://minroshmigration.com.au/sitemap.xml` (fetched 22 Nov 2026, Australia/Brisbane).

## Counts

| Metric | Value |
| --- | ---: |
| Live sitemap URLs | 85 |
| Main sitemap source URLs | 84 |
| Inventory rows | 91 |
| Destination hubs | 4 |
| Destination sections (4×8) | 32 |
| News article slugs in `main` data | 8 |
| Admin UI routes | 18 |

## Live-only vs main sitemap source

| Path | Notes |
| --- | --- |
| `/book-information-session` | Production booking; missing from `main` |
| `/visa-services` | Live 200; overlapping hub |
| `/global-pathways` | Live 200; overlapping hub |

## Main sitemap source missing from live

| Path | Notes |
| --- | --- |
| `/book-consultation` | Live 308 → information session |
| `/immigration-news/migration-sri-lanka-australia-2026` | Present in `main` `data/news.json`; not live sitemap |

## Route types (inventory)

| Type | Examples |
| --- | --- |
| homepage | `/` |
| service | `/skilled-migration`, `/student-visa-australia`, `/popular-routes`, `/visa-services`, … |
| guide | `*-guide`, requirements pages |
| destination-hub / section | `/destinations/{slug}` (+ about, contact, education, faq, partner, skilled, student, updates) |
| conversion | `/contact`, `/book-*`, `/education-consultation` |
| tool | `/assessment`, `/tools`, planners |
| news | `/immigration-news`, articles |
| legal | privacy, disclaimer, terms, complaints, code-of-conduct |
| utility | thank-you, maintenance, unsubscribe, upload token |

## Admin routes (out of public sitemap; protected)

`/admin`, `/admin/login`, `/admin/leads`, `/admin/pipeline`, `/admin/customers`, `/admin/crm`, `/admin/crm-insights`, `/admin/inbox`, `/admin/quotes`, `/admin/invoices`, `/admin/tasks`, `/admin/automations`, `/admin/intelligence`, `/admin/news`, `/admin/success-stories`, `/admin/reports`, `/admin/audit`, `/admin/users`

## Redirects (do not add more in Phase 00)

Already in `main` `next.config.mjs`: www→apex, `/migration-from-sri-lanka`, `/partner-visa`, `/visitor-visa`.  
Live-only: `/book-consultation` → `/book-information-session`.
