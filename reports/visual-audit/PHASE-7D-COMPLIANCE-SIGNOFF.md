# Phase 7D — Regulatory content review and external configuration audit

Documentation only. No regulatory sentence was rewritten. No MARN, partner name, referral fee, or commission was added. The Cloudflare dashboard was not changed. Nothing was deployed or merged.

This register is not a legal determination and not a clearance to publish. The earlier internal copy note of 8 September 2026 says the same thing: the no-MARN wording was prepared for review and is not legal clearance. Every sensitive statement below is waiting for a person authorised to approve it. None is marked Approved.

## How items are classified

| Status | Count | Meaning in this phase |
| --- | ---: | --- |
| Approved | 0 | No professional sign-off was on file |
| Awaiting professional review | 17 | Wording is in use or proposed. Leave it until a reviewer accepts or replaces it |
| Requiring correction | 3 | The public text is unfinished or still exposes operational counts. The replacement still needs approval before it is typed into the site |
| Non-blocking observations | 2 | Evidence check and the Cloudflare beacon. They do not by themselves rewrite the migration disclosures |

The row-level record is `reports/visual-audit/PHASE-7D-APPROVAL-REGISTER.csv`.

## Part 1 — Public claims

The shared disclosure is consistent on the homepage, footer, disclaimer, contact acknowledgement, code-of-conduct page, education scope, and Official Information Finder. Those surfaces say MinRosh is an information and education support service, is not a registered migration agent or Australian legal practitioner, and does not provide immigration assistance. The registration strip links to the public Register of Migration Agents search page and does not name an agent.

No public page reviewed in this pass claims a MARN, promises visa approval, or prints a referral fee or commission.

Statements that still need a human reader, because they can be misunderstood:

- **Referral program** (`/referral-program`). The heading is “Referral program for agents, employers, and community leaders.” The opening sentence says introducers “support migrants with accurate guidance and clear next-step pathways.” Later lines name education consultants, employers, and community groups, and the page offers tracked links and “target visa streams.” The page does not say whether anyone is paid. That gap is for counsel. This phase does not add or delete a fee sentence.
- **Homepage destination heading.** “Destinations we help you reach” sits above copy that describes information hubs. The heading is broader than the paragraph.
- **Meet the team.** The eyebrow says “Trust and credentials.” The visible roles are Director and Founder & Director, plus information and education support. Structured data calls the wider group an “advisory support team.” No registration number is shown.
- **Skilled migration.** A section is titled “How MinRosh Migration can help.” The body then says the help is public information and is not an eligibility assessment or a visa application. A nearby bullet tells the reader to prepare police certificates, health examinations, and identity documents early.
- **Complaints.** The page calls itself a starter page, and the escalation section tells “you” to align the process with “your formal business complaint-handling procedure.” That is template language, not a finished public process.

Category pages, the booking page, and the education page repeat the general-information boundary. Public AI chat, the personalised quiz, and the pathway funnel stay off unless both `ENABLE_PUBLIC_AI_CHAT` and `NEXT_PUBLIC_ENABLE_PUBLIC_AI_CHAT` are true. `POST /api/quiz-results` returns 410.

## Part 2 — Approval register

Use the CSV. Proposed alternatives in that file are suggestions for the reviewer. They were not applied.

Items marked **Requiring correction**:

| ID | What is wrong | What this phase did |
| --- | --- | --- |
| REG-009 | Complaints intro says “This starter page” | Left the sentence in place |
| REG-010 | Escalation copy addresses the business instead of a reader | Left the sentence in place. No OMARA complaint path was invented |
| REG-020 | Operational counts are still public | See Part 4 |

## Part 3 — ISS-016 Cloudflare analytics

Confirmed on the live homepage, 24 October 2026.

The HTML includes a module script from `https://static.cloudflareinsights.com/beacon.min.js/...` with a `data-cf-beacon` attribute. The token in that attribute is not copied here. The response `content-security-policy` `script-src` is `'self'`, `'unsafe-inline'`, Google Tag Manager, Google Analytics, Google Maps, and hCaptcha. `static.cloudflareinsights.com` is not in that list. The response is served by Cloudflare (`Server: cloudflare`, a `CF-RAY` header).

`lib/csp/build-csp-header.js` does not mention that host. The beacon is not in the application source. The isolated candidate is not behind Cloudflare, so it does not inject the script.

**Authorised configuration change, not performed:**

1. Sign in to the Cloudflare account that controls `minroshmigration.com.au`.
2. Open **Analytics & logs → Web Analytics** (on some accounts the same injection is labelled under the zone’s Web Analytics / Browser Insights automatic setup).
3. Select the hostname `minroshmigration.com.au`.
4. Turn off automatic JavaScript injection, or remove this hostname from Web Analytics.
5. Leave the application Content Security Policy unchanged. Do not add `static.cloudflareinsights.com` to `script-src` in order to silence the console error.

After that change, reload the homepage and confirm the beacon script is gone and the console no longer reports a `script-src` violation. ISS-016 stays open until that check is done by someone allowed to change the dashboard.

## Part 4 — Trust and public information

| Item | Evidence |
| --- | --- |
| Testimonials and success stories | `lib/home-site-data.js` forces `successStories` to an empty list. No review or `AggregateRating` markup was found in the public components reviewed |
| Homepage figures | `data/site.json` `stats` are the labels “Public information”, “Official sources first”, and “Education support”. They are not enquiry totals |
| Named people | Meet the team names two directors and describes information and education duties. It does not attach a registration number |
| Footer count cards | Removed from `components/site-footer.jsx` in the candidate. Production HTML fetched in this audit still contains `site-footer__stats` and the text “Enquiry count”. That removal is not live |
| Public stats API | `GET /api/stats` on the candidate returned `enquiryCount` 3, `newsletterCount` 4, `updatesCount` 7. `robots.txt` allows `/api/stats`. A production call to the same path returned Cloudflare error 1010, so the live JSON body was not read |

REG-020 records the API and the still-live production footer as requiring correction. The route was not changed.

## Stop

Phase 7D stops for human review. A reviewer can mark each CSV row Approved, or replace the proposed wording, before any of it is published. Production and staging were not restarted.
