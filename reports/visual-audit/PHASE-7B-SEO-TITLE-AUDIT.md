# Phase 7B — SEO title and metadata audit

Isolated candidate only. Production on port 3000 (pid 1875, started 12 October 2026) and staging on port 3001 (pid 1874) were left running. Nothing was deployed or merged.

## Result

The genuine title defect was duplicated branding. On the Phase 7A checkpoint, 21 document titles rendered as `… | MinRosh | MinRosh Migration` because destination metadata ended in the short brand and the root template appended `| MinRosh Migration`. About, the Australia partner title, and the contact title also carried the full brand in the middle of the string, so the template added it again.

The Phase 7B candidate removes that repetition and corrects a small set of education titles whose wording (`visa alignment`, `permit alignment`) was broader than the education-planning pages. Visa subclass numbers, destination names, study keywords, and news topics stay in the titles. Thirty-six titles remain longer than 60 characters on purpose. Sixty characters is an approximate display guideline. It is not a ranking or indexing requirement, and those titles were not cut to meet it.

ISS-004 is **verified fixed** for duplicated branding. The inventory is `reports/visual-audit/PHASE-7B-METADATA-INVENTORY.csv` (90 public responses).

## Candidate

| | |
| --- | --- |
| Before | Phase 7A checkpoint, build `77twwzIB6FZFnBcgaBAf3`, http://127.0.0.1:3124 |
| After | Phase 7B, build `8j6C9xBM3yqrH5Wtk4RSK`, http://127.0.0.1:3125 |
| Source | Branch `fix/phase-6b-critical-repairs` at `d8ad8d2`, with the 7B edits uncommitted |
| Release directory | `/home/minrosh/releases/qa-phase-7b-20261024` |

The server was started with a clean environment, `SKIP_ENV_VALIDATION=1`, and no production secrets. No public form was submitted.

## How titles are composed

`app/layout.js` uses the template `%s | MinRosh Migration`. `titleWithoutBrandSuffix()` in `lib/seo.js` removes a trailing `| MinRosh Migration` and a trailing `| MinRosh` before that template runs. A title that already starts with `MinRosh Migration |`, or that already contains `MinRosh Migration` before a further `|` clause, is emitted as `title.absolute` so the template cannot append the brand a second time. Open Graph and Twitter titles use the same resolved string.

The contact source title was `Contact MinRosh Migration Brisbane`. That string contains the brand and has no clause separator, so treating every mid-string brand as absolute would have frozen the ungrammatical `Contact MinRosh Migration Brisbane`. The source is now `Contact | Brisbane`, and the rendered title is `Contact | Brisbane | MinRosh Migration`.

## Inventory

The crawl covered the 85 sitemap URLs plus `/thank-you`, `/maintenance`, `/newsletter/unsubscribe`, `/book-consultation`, and `/upload/example-token`.

| Check | Result on the 7B candidate |
| --- | --- |
| Document titles | 89 unique titles across 89 HTTP 200 responses. The redirect has no document title. |
| Doubled brand | 0 titles contain `MinRosh | MinRosh` or `MinRosh Migration | MinRosh Migration`. |
| Titles changed | 33 |
| Titles still over 60 characters | 36, listed below and retained |
| Meta descriptions | Every HTTP 200 page has a description of at least 70 characters. Fourteen descriptions exceed 170 characters. They were left as written because they state the general-information boundary. |
| Canonical URLs | Indexable pages use `https://minroshmigration.com.au` plus the path. |
| Open Graph titles | Match the document title on every crawled page except `/upload/example-token`. |
| H1 | One H1 on every HTTP 200 page except the example upload token, which renders no H1 for an unrecognised token. |
| Internal labels | Header and footer labels stay short (`Popular routes`, `Skilled Migration`, `Information Finder`, `Lawyer vs Agent Guide`) and match the page topics. They were not rewritten. |

A few H1s are more specific than the title, or the reverse. `/popular-routes` titles the comparison set while the H1 reads “Categories enquirers compare most often”. `/global-pathways` titles the four destinations while the H1 reads “Destination strategy beyond the homepage quick view”. `/contact` titles the action and city while the H1 states the general-information and education-enquiry boundary. Those headings were left in place. Changing them would be a visible content edit, and the titles already carry the search topic.

## Classification of the long titles

The Phase 7A crawl measured **44** document titles over 60 characters. The release report’s figure of 46 came from the earlier Phase 6E pass. This audit classifies the measured 44, plus four shorter titles that had the same brand defect.

Fifteen of the 44 were **kept unchanged**. Twenty-nine were **improved**, almost all by removing the repeated `| MinRosh` while keeping the topic. The four additional shorter fixes are the contact title, the Australia FAQ, the Canada study-permit title, and the UK partner title.

### Kept unchanged, including those over 60 characters

Homepage, global pathways, the information-session booking title, the lawyer-versus-agent guide, the four destination hubs, and the seven news articles. The news titles match the article topics and place the year or the official theme first. The lawyer-versus-agent title was left exactly as published because that comparison is legally sensitive.

### Duplicated branding removed

Every `| MinRosh | MinRosh Migration` title. The About page is now the single absolute title `About MinRosh Migration | Information & Education Support` (57 characters). The Australia partner title no longer reads `MinRosh Migration Brisbane`.

### Redundant words removed

Australia FAQ dropped “common questions”. Destination about and contact titles dropped the repeated “MinRosh & … | migration guidance” and “Contact MinRosh |” prefixes. The destination name and the enquiry intent remain.

### Misleading wording corrected

These are title strings only. The page bodies were not rewritten, and no new visa outcome was claimed.

| Page | Before stem | After stem |
| --- | --- | --- |
| Australia education | courses & visa alignment | courses and study planning |
| Canada education | DLI & permit alignment | DLI and study permits |
| United Kingdom education | CAS & visa alignment | CAS and study planning |
| New Zealand education | courses & visas | courses and visas |

DLI, CAS, study permits, and visas stay in the titles because people search for those terms. “Alignment” was the word removed.

## Titles changed

| Path | Before | After | Decision |
| --- | ---: | ---: | --- |
| `/popular-routes` | 83 | 73 | remove redundant brand; destination names retained |
| `/contact` | 54 | 38 | fix duplicated branding and the ungrammatical brand-plus-city string |
| `/education-consultation` | 75 | 65 | remove redundant brand; service name retained |
| `/about` | 77 | 57 | fix duplicated branding |
| `/destinations/australia/skilled` | 84 | 74 | remove redundant brand; topic words retained |
| `/destinations/australia/partner` | 81 | 65 | remove redundant brand and the ungrammatical Migration Brisbane wording |
| `/destinations/australia/student` | 78 | 68 | remove redundant brand; topic words retained |
| `/destinations/australia/education` | 89 | 81 | remove redundant brand; replace visa alignment with study planning |
| `/destinations/australia/updates` | 77 | 67 | remove redundant brand; topic words retained |
| `/destinations/australia/faq` | 57 | 38 | remove redundant words |
| `/destinations/australia/about` | 72 | 62 | remove redundant words |
| `/destinations/australia/contact` | 71 | 53 | remove redundant words |
| `/destinations/new-zealand/skilled` | 75 | 65 | remove redundant brand; topic words retained |
| `/destinations/new-zealand/partner` | 64 | 54 | remove redundant brand; topic words retained |
| `/destinations/new-zealand/student` | 77 | 67 | remove redundant brand; topic words retained |
| `/destinations/new-zealand/education` | 82 | 74 | remove redundant brand; keep courses and visas |
| `/destinations/new-zealand/updates` | 72 | 62 | remove redundant brand; topic words retained |
| `/destinations/new-zealand/about` | 71 | 62 | remove redundant words |
| `/destinations/new-zealand/contact` | 62 | 44 | remove redundant words |
| `/destinations/canada/skilled` | 81 | 71 | remove redundant brand; topic words retained |
| `/destinations/canada/partner` | 65 | 55 | remove redundant brand; topic words retained |
| `/destinations/canada/student` | 58 | 48 | remove redundant brand; topic words retained |
| `/destinations/canada/education` | 84 | 73 | remove redundant brand; replace permit alignment with DLI and study permits |
| `/destinations/canada/updates` | 71 | 61 | remove redundant brand; topic words retained |
| `/destinations/canada/about` | 66 | 57 | remove redundant words |
| `/destinations/canada/contact` | 64 | 46 | remove redundant words |
| `/destinations/united-kingdom/skilled` | 80 | 70 | remove redundant brand; topic words retained |
| `/destinations/united-kingdom/partner` | 55 | 45 | remove redundant brand; topic words retained |
| `/destinations/united-kingdom/student` | 73 | 63 | remove redundant brand; topic words retained |
| `/destinations/united-kingdom/education` | 78 | 70 | remove redundant brand; replace visa alignment with CAS and study planning |
| `/destinations/united-kingdom/updates` | 74 | 64 | remove redundant brand; topic words retained |
| `/destinations/united-kingdom/about` | 74 | 65 | remove redundant words |
| `/destinations/united-kingdom/contact` | 65 | 47 | remove redundant words |

Full before-and-after strings are in the CSV columns `title_before` and `title_after`.

## Titles retained above 60 characters

| Characters | Path | Title |
| ---: | --- | --- |
| 86 | `/book-information-session` | Book Information Session \| General Information & Education Enquiry \| MinRosh Migration |
| 86 | `/immigration-news/skilled-migration-australia-points-2026` | Skilled migration points themes and invitation context (2026 note) \| MinRosh Migration |
| 83 | `/immigration-news/student-visa-australia-requirements-2026` | Student visa topics explained with official sources (2026 note) \| MinRosh Migration |
| 83 | `/immigration-news/canada-border-system-2026` | Canada border security and immigration-system integrity changes \| MinRosh Migration |
| 82 | `/immigration-news/partner-visa-australia-2026-guide` | Partner visa topics on official Home Affairs pages (2026 note) \| MinRosh Migration |
| 81 | `/destinations/australia/education` | Australia education consultation \| courses and study planning \| MinRosh Migration |
| 80 | `/immigration-news/nz-visa-fraud-partnerships-2025` | New Zealand joins international partners to fight visa fraud \| MinRosh Migration |
| 78 | `/immigration-news/canada-integrity-fraud-prevention-2026` | Canada immigration integrity and fraud-prevention measures \| MinRosh Migration |
| 75 | `/global-pathways` | Global Pathways \| Australia, Canada, UK and New Zealand \| MinRosh Migration |
| 74 | `/destinations/australia/skilled` | Australia skilled migration \| 189, 190, 491 categories \| MinRosh Migration |
| 74 | `/destinations/new-zealand/education` | New Zealand education consultation \| courses and visas \| MinRosh Migration |
| 73 | `/popular-routes` | Popular migration routes \| Australia, UK, NZ & Canada \| MinRosh Migration |
| 73 | `/destinations/canada/education` | Canada education consultation \| DLI and study permits \| MinRosh Migration |
| 71 | `/destinations/canada/skilled` | Canada skilled immigration overview \| IRCC planning \| MinRosh Migration |
| 70 | `/destinations/united-kingdom` | United Kingdom migration hub \| visas & immigration \| MinRosh Migration |
| 70 | `/destinations/united-kingdom/skilled` | UK Skilled Worker & work routes \| GOV.UK alignment \| MinRosh Migration |
| 70 | `/destinations/united-kingdom/education` | UK education consultation \| CAS and study planning \| MinRosh Migration |
| 69 | `/` | MinRosh Migration \| General Migration Information & Education Support |
| 69 | `/destinations/canada` | Canada migration hub \| IRCC entry & visa planning \| MinRosh Migration |
| 68 | `/destinations/australia/student` | Australia student visa guidance \| study pathways \| MinRosh Migration |
| 68 | `/immigration-news/uk-eta-travel-permission-2025` | UK ETA enforcement and travel permission updates \| MinRosh Migration |
| 67 | `/destinations/australia/updates` | Australia immigration updates \| policy tracking \| MinRosh Migration |
| 67 | `/destinations/new-zealand/student` | New Zealand student visa planning \| study in NZ \| MinRosh Migration |
| 65 | `/education-consultation` | Education Course Enquiry & Admissions Support \| MinRosh Migration |
| 65 | `/destinations/australia/partner` | Australia partner and family visas \| Brisbane \| MinRosh Migration |
| 65 | `/destinations/new-zealand/skilled` | New Zealand skilled work & residence pathways \| MinRosh Migration |
| 65 | `/destinations/united-kingdom/about` | United Kingdom pathways \| general information \| MinRosh Migration |
| 64 | `/destinations/united-kingdom/updates` | UK immigration updates \| Home Office changes \| MinRosh Migration |
| 63 | `/destinations/united-kingdom/student` | UK Student visa planning \| study in Britain \| MinRosh Migration |
| 62 | `/destinations/australia` | Australia migration hub \| visas & pathways \| MinRosh Migration |
| 62 | `/destinations/australia/about` | Australia migration information \| Brisbane \| MinRosh Migration |
| 62 | `/destinations/new-zealand/updates` | New Zealand immigration updates \| INZ news \| MinRosh Migration |
| 62 | `/destinations/new-zealand/about` | New Zealand pathways \| general information \| MinRosh Migration |
| 61 | `/immigration-lawyer-australia-vs-registered-migration-agent-guide` | Lawyer vs Migration Agent Australia Guide \| MinRosh Migration |
| 61 | `/destinations/new-zealand` | New Zealand migration hub \| visa planning \| MinRosh Migration |
| 61 | `/destinations/canada/updates` | Canada immigration updates \| IRCC changes \| MinRosh Migration |

Each of these puts the searchable topic before the brand. Cutting them to 60 characters would drop subclass numbers (189, 190, 491), authority names (IRCC, GOV.UK, INZ, Home Office), destination names, or the news subject. The brand remains a single trailing `| MinRosh Migration`, except the homepage, which leads with the brand.

## Technical SEO

**Sitemap.** `https://minroshmigration.com.au/sitemap.xml` on the candidate returns 85 URLs. That set is `STATIC_SITEMAP_ROUTES` plus destination hubs and sections, including `/visa-services` and `/global-pathways`. Static entries still omit `lastModified`. News entries use the article `updatedAt` or `date` when one exists.

**Intentionally absent from the sitemap.**

| URL | Response | Why it stays out |
| --- | --- | --- |
| `/thank-you` | 200, `noindex, follow` | Post-enquiry utility |
| `/maintenance` | 200, `noindex, nofollow` | Temporary holding page |
| `/newsletter/unsubscribe` | 200, `noindex, nofollow` | Token utility |
| `/upload` and `/upload/example-token` | 200, `noindex`; robots also `Disallow: /upload` | Private document upload |
| `/book-consultation` | 308 to `/book-information-session` | The booking URL is the sitemap entry |
| `/admin`, `/api` | Disallowed | Private and machine endpoints |

**Robots.** Production rules on the candidate: GPTBot and CCBot `Disallow: /`. All other agents `Allow: /`, plus `Allow: /api/reviews` and `Allow: /api/stats`, and `Disallow: /admin`, `/api`, `/upload`. Sitemap and host are `https://minroshmigration.com.au`. Staging still emits `Disallow: /` when `SITE_ENVIRONMENT` is staging. The candidate was built with `SITE_ENVIRONMENT=production`.

**Redirects.** `/book-consultation` returns 308 to `/book-information-session`. The canonical of the destination is the booking page.

**Maintenance Open Graph.** The holding page now uses `buildMetadata`, so its Open Graph title is `Upgrading for a better experience | MinRosh Migration` and matches the document title. It remains `noindex, nofollow` and out of the sitemap.

**Structured data.** The homepage emits Organization and LocalBusiness. Service and booking pages add BreadcrumbList. `/skilled-migration` also emits FAQPage, and the crawl saw that FAQPage block twice. That duplication was already present and was not changed in this phase. It is recorded here for a later content review. No review snippet or legal claim was added.

**Upload token, residual.** `/upload/example-token` keeps the title `Upload documents | MinRosh Migration` and `noindex`. Its Open Graph title, description, and canonical still inherit the homepage, and an unrecognised token renders no H1. It stays out of the sitemap. The upload flow was not redesigned in this pass.

**Indexability audit.** `INDEXABILITY_BASE_URL=http://127.0.0.1:3125 npm run audit:indexability` exited 0. It rewrote `reports/indexability-audit-stage-0.md`: 85 URLs, no heuristic attention rows, robots and sitemap HTTP 200. That file is a regenerated local audit, not a production Search Console export.

## Tests

| Check | Result |
| --- | --- |
| Unit (`npm run test:unit`) | 20 files, 110 tests passed. The contact dual-write test still logs `contact_supabase_dual_write_failed_pre_email` and passes. |
| SEO title unit file | 8 tests passed, including the short `| MinRosh` strip and the About absolute title. |
| End-to-end (`PLAYWRIGHT_LIVE_URL=http://127.0.0.1:3125`) | 163 passed. The public visual checks at 390, 768, and 1440 found no doubled brand and one visible H1 on the sitemap routes. |
| `routes:verify` against port 3125 | `/`, `/sitemap.xml`, and `/robots.txt` returned HTTP 200. |
| Indexability audit | Exit 0, 85 URLs, no attention rows. |
| Isolated build | `8j6C9xBM3yqrH5Wtk4RSK`. `verify-robots-build-artifact` skipped the missing Next 15 `robots.txt.body` file. The live `/robots.txt` response above is the evidence. |

An earlier end-to-end run on build `YtiZknNjJCpwcUo6ow1k-` also passed 163 tests. That build was replaced after the contact title was corrected, and the figures in this report are from the final build.

## Files touched

- `lib/seo.js` — strip a trailing `| MinRosh`, and keep a complete brand-bearing title absolute when it already has a clause separator.

- `tests/seo-title-and-sitemap.test.mjs` — cover the short suffix and the About absolute title.

- `data/destination-sections/{australia,canada,new-zealand,united-kingdom}.json` — title strings only.

- `data/seo-pages.json` — contact title `Contact | Brisbane`.

- `app/maintenance/page.js` — metadata through `buildMetadata`, still noindex.

- `reports/visual-audit/issues.csv` — ISS-004.

- `reports/indexability-audit-stage-0.md` — regenerated against port 3125.

## Stop

Phase 7B is ready for review. The edits are uncommitted. Production and staging were not restarted, and this phase does not approve a release. ISS-016 (Cloudflare beacon and CSP) and ISS-021 (human compliance sign-off) remain open. Isolated form submission remains blocked because the candidate has no CRM, mail, or payment credentials.
