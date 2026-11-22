# Phase 00 — Route reconciliation

Produced because kickoff `ROUTE_RECONCILIATION.md` was not mounted. This is the **verified** reconciliation for this audit.

## Decision framework (Phase 00 — document only)

| Status | Meaning |
| --- | --- |
| KEEP | Exists and should remain until a later approved phase says otherwise |
| KEEP-LIVE-CANONICAL | Live URL is source of truth; `main` differs |
| OVERLAP | Multiple URLs cover similar intent — do not delete yet |
| UTILITY | Not for marketing index |
| MISSING-ON-MAIN | Required for parity with live; exists on compliance branch |

## Core conversion & tools

| Path | Status | Notes |
| --- | --- | --- |
| `/` | KEEP | Live info/education positioning |
| `/contact` | KEEP | Lead intake |
| `/book-information-session` | KEEP-LIVE-CANONICAL / MISSING-ON-MAIN | Production booking |
| `/book-consultation` | KEEP as redirect target only on live; page still on `main` | Do not invent new redirects in Phase 00 |
| `/assessment` | KEEP | Information Finder on live |
| `/education-consultation` | KEEP | Education enquiry |
| `/tools` | KEEP | |
| `/tools/student-country-cost-planner` | KEEP | |
| `/tools/pr-pathway-explorer` | KEEP | |

## Service & hub overlap cluster

| Path | Status |
| --- | --- |
| `/popular-routes` | KEEP / OVERLAP |
| `/global-pathways` | KEEP / OVERLAP (live sitemap) |
| `/visa-services` | KEEP / OVERLAP (live sitemap) |
| `/skilled-migration` | KEEP |
| `/student-visa-australia` | KEEP |
| `/partner-visa-australia` | KEEP |
| `/employer-sponsored-visas` | KEEP |
| `/visitor-visas` | KEEP |
| `/australian-visas-official-sources` | KEEP |
| `/migration-sri-lanka-to-australia` | KEEP |
| `/migration-for-healthcare-workers-australia` | KEEP |
| `/student-migration-over-25-australia` | KEEP |

## Guides

All `*-guide` and requirements pages on live sitemap: **KEEP**. Treat as SEO assets; later phases may tighten internal links only.

## Destinations

All 4 hubs × 8 sections: **KEEP**. Flag destination `about` / `contact` / `faq` as **OVERLAP** with global pages (thin-content risk), not deletion candidates in Phase 00.

## News

Live articles: **KEEP**.  
`/immigration-news/migration-sri-lanka-australia-2026`: present on `main` data, absent live sitemap — **reconcile in content phase** (do not delete here).

## Legal & trust

`/privacy-policy`, `/disclaimer`, `/terms-of-use`, `/complaints`, `/code-of-conduct`, `/about`, `/faq`, `/meet-the-team`, `/referral-program`, `/updates`: **KEEP**. Compliance wording is human-gated (ISS-021).

## Utility

| Path | Status |
| --- | --- |
| `/thank-you` | UTILITY / noindex |
| `/maintenance` | UTILITY |
| `/newsletter/unsubscribe` | UTILITY / noindex |
| `/upload/[token]` | UTILITY / auth-ish token |

## Admin / API

All `/admin/*` and `/api/admin/*`: **KEEP untouched** by public redesign phases unless explicitly tasked.

## Kit checklist mapping

`PAGE_CHECKLIST_FROM_KIT.csv` was missing — no kit-row ↔ URL matrix could be completed. When the CSV arrives, map each row’s `path` column to this inventory’s `path` and mark gaps only.
