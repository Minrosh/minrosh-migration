# Phase 6D — Performance, SEO, integration and technical quality

Release candidate under review. This phase was measured on an isolated build and was not deployed or merged.

## Environment

| Item | Value |
| --- | --- |
| Candidate | `/home/minrosh/releases/qa-phase-6d-20261024` |
| Build ID | `k0tUGclUs32NqLfdiTybI` |
| Server | `http://127.0.0.1:3123`, `NODE_ENV=production`, `SKIP_ENV_VALIDATION=1`, `SITE_ENVIRONMENT=production` |
| Process environment | Started with a clean environment. No SMTP, Supabase, Stripe, Google, database, or secret variables were present in the server process. |
| Production and staging | `127.0.0.1:3000` (pid 1875) and `127.0.0.1:3001` (pid 1874) were left running and were not used for Lighthouse or form posts. |
| Lighthouse | 12.8.2 CLI, Headless Chrome 146, mobile form factor, 412×823 at 1.75×, simulated throttling (150 ms RTT, ~1.6 Mbps, 4× CPU). |
| Before traces | `reports/visual-audit/lighthouse/home-mobile.json` and `contact-mobile.json`, fetched 24 October 2026 against `127.0.0.1:3120`. Homepage benchmark index 2279. Contact benchmark index 2424.5. |
| After traces | `reports/visual-audit/lighthouse/phase6d-home-mobile.json` (benchmark index 2432, 11:28 UTC) and `phase6d-contact-mobile.json` (benchmark index 2424.5). |
| Unit tests | 20 files, 108 tests passed, including title, sitemap, CSP, and no-MARN checks. |

## 1. Homepage performance

### What the earlier trace showed

Mobile performance was **59**. LCP was **4.67 s**. Total blocking time was **1,212 ms**. FCP was **1.67 s**. CLS was **0**.

The LCP element was `h1#home-hero-heading` (“Explore Australian Migration Information with Greater Clarity”), not the Brisbane photograph. Phases: TTFB 454 ms (10%), load delay 0, load time 0, **render delay 4,214 ms (90%)**. Main-thread work was about 4.6 s, led by script evaluation (2,064 ms) and style and layout (1,018 ms). The largest script costs were the document, a 46 KB shared chunk (980 ms), and the framework chunk (727 ms). Image-format, font-display, and render-blocking-resource audits already scored as passing. No third-party summary was present on the local candidate.

Two application causes matched that trace:

- `body` used `animation: pageFade 0.6s ease both`, so the first frame stayed at opacity 0 until the animation could start.
- `UltraMaximumLayout` ignored `enableEffects={false}` and still loaded a framer-motion scroll effect on the homepage.

The hero `Image` also requested `priority` and `fetchPriority="high"` for a photograph that is not the LCP element, so it competed with the heading under mobile throttling.

### Changes

- Removed the body fade. Opacity is 1 as soon as CSS applies.
- The homepage now renders a plain container. The scroll-progress effect is no longer on the critical path.
- Below-fold homepage sections are server-rendered. The hero, quiz entry, journey, pathways, trust, and closing band no longer carry a client boundary they do not need. Tracking links remain small client islands.
- The hero image keeps `src="/images/hero-brisbane-river-cbd-hd.jpg"`, the same alt text, and the same crop. `priority` and `fetchPriority="high"` were removed. `next/image` still delivers a sized variant (828 px wide on a 390 px phone).
- Floating widgets wait for an idle callback (2.5 s timeout) before their bundle is requested.
- News eyebrow and date text were darkened to `#4c404d` after Lighthouse could see that copy. A trial of `content-visibility` on `.home-section` was removed after it made footer links look like overlapping tap targets and dropped the accessibility category.

### After, same laboratory method

| Metric | Before (`:3120`) | After (`:3123`) |
| --- | --- | --- |
| Performance | 59 | **95** |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 92 | 92 |
| LCP | 4.67 s | **2.72 s** |
| FCP | 1.67 s | 1.68 s |
| Total blocking time | 1,212 ms | **38 ms** |
| Speed index | 1.7 s | 1.68 s |
| CLS | 0 | 0.037 |
| LCP render delay | 4,214 ms (90%) | 2,258 ms (83%) |
| Script evaluation | 2,064 ms | 452 ms |
| Style and layout | 1,018 ms | 411 ms |

The performance goal of 80 is met. Total blocking time is inside the usual good band (under 200 ms). LCP moved from 4.7 s to 2.7 s and remains just outside the 2.5 s good line. The remaining time is local TTFB (about 458 ms) plus text render delay. The heading, news, and Brisbane photograph are still in the first document.

Rendered check on the candidate: at 390 px the H1 is 36 px, `rgb(31, 16, 32)`, 316 px from the top, and the header ends at 125 px. At 1440 px the H1 is 56 px and starts at 288 px, under a 104 px header. One H1, one `#main-content`, news heading present, document scroll width within the viewport. Body opacity is 1 and the fade animation name is `none`.

## 2. Contact page paint

The saved contact trace from `:3120` did record First Contentful Paint at **1.66 s** (score 0.93). The performance category is empty because **Largest Contentful Paint threw `NO_LCP`**. The requested and final URL are both `http://127.0.0.1:3120/contact`. This was a paint-metric failure on a page that loaded, caused by the same opacity-0 body animation, not a missing route or a navigation error.

After the fade was removed, contact mobile Lighthouse on `:3123` records:

| Metric | After |
| --- | --- |
| Performance | **92** |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 91 |
| FCP | 1.51 s |
| LCP | 3.15 s |
| Total blocking time | 70 ms |
| CLS | 0.067 |

The contact LCP node is the introductory paragraph. Render delay is still 2.70 s (86%). At 390 px the contact H1 sits 71 px below the fixed header. The enquiry form is present and both acknowledgement checkboxes are unchecked.

## 3. Technical SEO

Checked on `http://127.0.0.1:3123`.

- Sitemap has **85** URLs. `/visa-services` and `/global-pathways` are included. `/global-pathways` is a real public content page with its own canonical (`https://minroshmigration.com.au/global-pathways`), `index, follow`, and a single brand suffix in the title. It stays in the sitemap.
- `/thank-you` is `noindex, follow` and is absent. `/maintenance` is `noindex, nofollow` and is absent. `/newsletter/unsubscribe` and `/upload` are absent. `/book-consultation` returns **308** to `/book-information-session` and is absent.
- Static sitemap entries omit `lastModified`. The seven `lastmod` values belong to immigration-news articles and use the dates stored on those articles (2025-11-17 through 2026-04-01). No “now” stamp was added.
- Homepage document title, Open Graph title, and Twitter title are all `MinRosh Migration | General Migration Information & Education Support`. The earlier Open Graph value appended a second ` | MinRosh Migration` because a brand-first title was treated as a stem. `buildMetadata()` now keeps a brand-first title as the social title as well as `title.absolute`.
- Other checked titles are a single suffix: contact, visa services, assessment, and the booking page.
- Canonicals point at `https://minroshmigration.com.au` plus the path. Robots on the public pages above are `index, follow`. `robots.txt` allows `/`, disallows `/admin`, `/api`, and `/upload`, and points at the production sitemap.
- Homepage JSON-LD parses as one `Organization` / `LocalBusiness` object.
- Lighthouse still scores the meta-description audit at 0 on the homepage and contact page, as it did on the earlier homepage trace, even though a description meta tag is in the HTML (homepage description is 191 characters). SEO category remains 92. Titles longer than 60 characters stay open under ISS-004.

## 4. Content Security Policy

The Cloudflare beacon (`static.cloudflareinsights.com`) is not referenced by application code. Public `script-src` remains `'self' 'unsafe-inline'` plus the existing Google Tag Manager, Google Analytics, Maps, and hCaptcha hosts. The response on the isolated server matches that policy and does not include the Cloudflare host.

The beacon is injected by Cloudflare in front of production. It is not required for the site’s own analytics path, and the local candidate does not load it. The policy was left unchanged. ISS-016 stays open: turn the injection off in the Cloudflare dashboard. Broadening `script-src` to silence the console warning was not done.

CSP unit tests passed.

## 5. Form tests — BLOCKED for a completed submission

There is no isolated CRM, mailbox, calendar, or payment sink for this candidate. Staging on `:3001` was not used, because that process may share live credentials. Production on `:3000` was not used.

What was safe to check on `:3123`:

- `GET /contact`, `/book-information-session`, and `/assessment` return 200.
- Contact and booking forms render. Required acknowledgement boxes are unchecked. Assessment is the Official Information Finder (topic select and official-link copy), not a CRM submission.
- `POST /api/contact` with synthetic identity `phase6d-synthetic@example.com` and `formAcknowledgementAccepted: false` returned **400** `VALIDATION_FAILED` (“Please confirm the acknowledgement before submitting.”). That address is not in the release enquiry files. The files’ timestamps match the build copy, not the probe.

A completed contact, consultation, or assessment submission was not sent. Completing one would need an authorised staging project with its own Supabase, SMTP, Google, and Stripe test credentials, and a process that cannot see production secrets. Until that exists, end-to-end form success stays **BLOCKED**.

## 6. Regulatory and trust content

Public copy was reread and was not rewritten. No MARN, partner-agent name, referral fee, or commission was added.

Still in force, and still for human sign-off under ISS-021:

- Footer and heroes say MinRosh provides general information and education support and does not provide immigration assistance.
- “Find a Registered Migration Agent” points at the public register.
- The code-of-conduct page describes OMARA standards for registered agents and says MinRosh is not an OMARA-regulated practice.
- Public tools say they do not assess eligibility or guarantee an outcome. The personalised navigator flag is hard-disabled. Public AI chat stays off unless `ENABLE_PUBLIC_AI_CHAT` / `NEXT_PUBLIC_ENABLE_PUBLIC_AI_CHAT` are set, and they were not set on this server.
- Footer operating counts stay removed.

Flagged for professional review, without a silent edit:

- `/referral-program` offers tracked introducer links for education consultants, employers, and community groups, and says referral source is stored on enquiries. It does not publish a fee or a commission. A reviewer should decide whether a public referral arrangement needs a clearer disclosure, and should authorise any partner identity before it is published.
- Contact and booking copy says a reply is usually within one business day. That is an operational claim for the reviewer to confirm.
- `components/smart-navigator.js` still contains eligibility wording. It is not the published assessment experience while the navigator flag is false.

## 7. Issue register

Updated `reports/visual-audit/issues.csv`.

| ID | Status after 6D |
| --- | --- |
| ISS-004 | Partial. Brand is no longer doubled on the homepage document or social title. Titles over 60 characters remain open. |
| ISS-016 | Open. CSP correctly blocks an unneeded Cloudflare beacon. Dashboard change is still required. |
| ISS-021 | Open. Wording unchanged. Referral-program disclosure is flagged for human review. |
| ISS-024 | Verified. Homepage lab performance 95, LCP 2.7 s, TBT 38 ms. |
| ISS-025 | Verified. Contact LCP is recorded. Performance 92. |

## Stop

No deploy, no merge, and no production form submission. Review this candidate on `127.0.0.1:3123` (build `k0tUGclUs32NqLfdiTybI`) before any release step.
