# Phase 8D — Regulatory content corrections, human approval, and Cloudflare configuration

Documentation only. The Phase 7D approval register remains the source of truth for what is still awaiting a person. No public sentence was rewritten. No MARN, partner name, referral fee, or commission was added. The Cloudflare dashboard was not changed. The Content Security Policy was not widened. Nothing was merged or deployed.

## Result

**0 of 22 items are Approved.** No documented human approval was available, so no proposed wording was published.

| Status | Count | Rows |
| --- | --- | --- |
| Approved | 0 | None |
| Awaiting professional review | 17 | REG-001 to REG-008, REG-011 to REG-019 |
| Requiring correction | 3 | REG-009, REG-010, REG-020 |
| Non-blocking observations | 2 | REG-021, REG-022 |

Publication blockers that remain:

- `/complaints` still shows the starter-page introduction and the internal escalation sentence (REG-009, REG-010).
- `/referral-program` still uses “agents”, “accurate guidance”, “next-step pathways”, “conversion outcome”, and “target visa streams” (REG-011, REG-012). Any introducer benefit is still undescribed. This phase does not decide whether a fee disclosure is mandatory.
- Operational counts are still a live-production question (REG-020). The uncommitted candidate withholds them from anonymous callers. Production was not switched.
- Cloudflare still injects `beacon.min.js` on the proxied site unless an account owner disables automatic setup (REG-022). ISS-016 stays open.

## What was not implemented

Task 5 allows publication only of wording a professional has already approved. None of the 22 rows has that decision. `app/complaints/page.js`, `app/referral-program/page.js`, and the other public copy files were left as they were at the start of this phase. No isolated server was rebuilt. Unit and end-to-end tests were not re-run, because there is no approved content change to verify.

Phase 8B’s anonymous `GET /api/stats` change is already in the working tree from the previous phase. It was not reversed and it was not treated as approval of REG-020.

## Task 1 — Complaints page

Current page: `app/complaints/page.js`, public URL `/complaints`.

Current introduction:

> MinRosh Migration aims to handle concerns professionally, respectfully, and in a timely way. This starter page outlines a basic complaints pathway for website and service matters.

Current escalation:

> If a matter cannot be resolved directly, the final process should be aligned to your formal business complaint-handling procedure and any regulatory requirements that apply.

Those two sentences are draft instructions. The first tells the reader the page is unfinished. The second speaks to the business (“your formal … procedure”) and does not say who reviews an unresolved concern. The “How to raise a concern” and “How complaints are reviewed” sections are usable as far as they go, and they do not name a regulator or a response time.

The following text is **proposed only**. It is not on the website.

**Introduction**

MinRosh Migration considers concerns about this website and about the information and education support we provide. This page explains how to raise a concern and what we do with it.

**How to raise a concern**

Use the contact page or email the address published on that page. Include your name, a short description of what happened, the dates that matter, and the outcome you are seeking. Please do not send passports, identity documents, or visa-application documents with a complaint.

**How complaints are reviewed**

A MinRosh staff member will read the concern and the correspondence we already hold about it. We will reply with the outcome we can offer, or we will ask for any detail we still need. Before this section is published, the business must insert the acknowledgement time and the reply time it will actually meet. This draft does not invent those times.

**Escalation**

If you are not satisfied with the first reply, reply to that message and ask for a review. Before publication, the business must name the role that conducts that review. The review covers the same website or service concern. It is not a visa merits review, and it is not a complaint to the Office of the Migration Agents Registration Authority.

OMARA considers complaints about registered migration agents: https://www.mara.gov.au/complain/make-a-complaint. MinRosh states on this website that it is not a registered migration agent and is not regulated by OMARA. A concern about a registered migration agent engaged separately belongs with that agent and, if still unresolved, with OMARA.

OMARA’s own guidance says that a report about a person who is not registered and who is giving immigration assistance can be made to the Department of Home Affairs through Border Watch: https://portal.mara.gov.au/enquiry/knowledgebase/article/KA-01027/en-us. That sentence may be published only if counsel confirms it is the external path the business should point to. It must not be written as if OMARA regulates MinRosh.

A consumer concern about a service may also sit with the fair-trading agency in the complainant’s state or territory, or with the ACCC where the Australian Consumer Law applies. Which body can take the complaint depends on the facts. Counsel should confirm any external body named on this page before publication.

**Why this draft is still blocked**

A director must confirm the contact channel, the two timeframes, and the review role. An Australian legal practitioner must confirm the external escalation paragraph. Until both decisions are recorded against REG-009 and REG-010, the live starter-page copy stays in place.

## Task 2 — Referral program

Current page: `app/referral-program/page.js`, public URL `/referral-program`.

Wording that can be read as regulated migration assistance, or as a visa-outcome service:

| Location | Current wording | Risk |
| --- | --- | --- |
| H1 | Referral program for agents, employers, and community leaders | “Agents” can be read as registered migration agents, and as MinRosh acting in that role |
| Hero | We partner with trusted introducers who support migrants with accurate guidance and clear next-step pathways. | “Accurate guidance” and “pathways” can be read as immigration advice by MinRosh or by the introducer |
| Attribution | Performance can be reviewed by pathway segment and conversion outcome | “Conversion outcome” can be read as a visa result |
| Closing paragraph | Send us your organisation details and target visa streams. | Invites partners to nominate visa streams for the people they introduce |
| Metadata keywords | `visa referral partner` | The phrase describes a visa referral, not an introduction to information and education support |

The page also says each partner receives `?ref=partner_name&ref_code=partner001`, that the source and code are stored on enquiries and CRM leads, and that the audience includes education consultants, employers, and community groups. Those later audience labels are narrower than the H1. No partner is named. No MARN is printed. No fee, commission, discount, or other benefit is stated.

**Fee disclosure**

This phase does not add, delete, or rewrite a fee sentence. No benefit is described, so there is nothing on the page to remove. If MinRosh or an introducer pays or receives any fee, commission, gift, or other benefit for an introduction, an Australian legal practitioner must determine whether that benefit has to be disclosed before the page is published. Provisions a reviewer should read include the Australian Consumer Law, Schedule 2 to the Competition and Consumer Act 2010 (Cth), sections 18 and 29, and Migration Act 1958 (Cth) sections 280, 281, and 285. This report does not decide that a disclosure is required, and it does not decide that silence is lawful.

**Proposed replacement, not published**

H1: Referral program for education consultants, employers, and community groups.

Hero: We work with education consultants, employers, and community groups who introduce people to MinRosh for general information and education-course support. A tracked link records that introduction. The link does not appoint MinRosh, or the person who shared the link, as a registered migration agent. It is not immigration assistance, visa advice, or a visa application.

Attribution bullet to replace the conversion sentence: We can report how many enquiries arrived from each link. Those reports count introductions. They are not visa outcomes.

Closing paragraph: Send us your organisation name and the information topics you want to introduce. We will send a tracked link and a short description of what MinRosh does and does not do.

Metadata description: Introduce people to MinRosh information and education support. A tracked link records the introduction. This page is not a visa-advice referral.

Metadata keywords: remove `visa referral partner`. Keep only terms that match information and education introductions, after the same reviewer approves the list.

The stored `ref` and `ref_code` behaviour can stay if the reviewer accepts that the page describes attribution and does not describe a paid referral. Partner identities and MARN numbers stay unpublished unless a named person authorises a specific publication.

## Task 3 — Register reconciliation

The row-by-row register is `reports/visual-audit/PHASE-8D-FINAL-APPROVAL-REGISTER.csv`. Every Phase 7D id is present once. Existing wording was checked against the current source files. Status was not moved to Approved.

Rows whose proposed text is “Retain the current wording” are waiting on a person to accept the denial of immigration assistance, not on a copy edit. The reason is the same for those rows: Migration Act 1958 (Cth) section 276 defines immigration assistance, including advising a visa applicant about an application and preparing or helping to prepare an application; section 280 restricts that assistance where the person is not a registered migration agent; section 283 restricts a false representation that a person is a registered migration agent. Confirm the in-force compilation at https://www.legislation.gov.au/C1958A00062/latest before treating any subsection as current. The public register search used by the site is https://www.mara.gov.au/search-the-register-of-migration-agents/.

REG-014 and REG-015 still concern “Trust and credentials” and the structured-data phrase “advisory support team” on `/meet-the-team`. The visible H1 remains “Meet the people behind MinRosh information support”. No registration number was added.

REG-017 remains with counsel. The bullet about police certificates, health examinations, and identity documents can be read as help preparing a visa application. It was not deleted or expanded.

REG-020 note, still **Requiring correction** and not Approved:

- Candidate source `app/api/stats/route.js` returns 401 `AUTH_UNAUTHORIZED` to an anonymous caller and does not return `enquiryCount`, `newsletterCount`, or `updatesCount`.
- `app/robots.js` no longer lists `/api/stats` as allowed.
- The candidate footer does not render those counts.
- That change is uncommitted Phase 8B work. Production pid 1875 was not restarted and was not switched to this source.
- A director still needs to confirm that these operational counts are not a disclosure the business must keep public. Until that confirmation is recorded, the row stays unapproved.

REG-021 remains a non-blocking observation. `lib/home-site-data.js` still forces `successStories` to an empty list. No testimonial, star rating, or MARN was added.

## Task 4 — Cloudflare Web Analytics

Phase 7D recorded that the live homepage HTML includes a module script from `https://static.cloudflareinsights.com/beacon.min.js` with a `data-cf-beacon` attribute, and that the response `content-security-policy` `script-src` does not include that host. The beacon token is not copied here. `lib/csp/build-csp-header.js` still allows only `https://www.googletagmanager.com`, `https://www.google-analytics.com`, `https://maps.googleapis.com`, `https://maps.gstatic.com`, and `https://js.hcaptcha.com`, plus `'self'` and `'unsafe-inline'` on public pages. `static.cloudflareinsights.com` is not in that list.

Cloudflare’s current Web Analytics getting-started page says that a site proxied through Cloudflare uses automatic setup by default, and that **Manage site** can change that setup. The documented Disable option is: “The JS Snippet will not be injected and has been disabled.” Source: https://developers.cloudflare.com/web-analytics/get-started/ (section “Sites proxied through Cloudflare”), read 25 October 2026.

The same product’s FAQ tells site owners who want the beacon to add `https://static.cloudflareinsights.com/beacon.min.js` to `script-src`. Source: https://developers.cloudflare.com/web-analytics/faq/ (section “What do I need to add to my Content Security Policy (CSP)?”). That change is not the fix for this site. It would widen `script-src` to silence the console warning. ISS-016 stays open on that basis.

**Owner steps, not performed**

1. Sign in to the Cloudflare account that controls the zone for `minroshmigration.com.au`.
2. Open **Web Analytics**. The documented dashboard entry is the “Go to Web analytics” link on https://developers.cloudflare.com/web-analytics/get-started/. On some account layouts this sits under **Analytics & logs**.
3. Select the site card for `minroshmigration.com.au`.
4. Select **Manage site**.
5. Set automatic setup to **Disable**. Use the option whose description is that the JS snippet will not be injected and has been disabled. Do not choose “Enable with JS Snippet installation”.
6. Save or update the site.
7. Leave the application Content Security Policy unchanged. Do not add `static.cloudflareinsights.com` to `script-src`.
8. Reload `https://minroshmigration.com.au/` and confirm the HTML no longer contains `static.cloudflareinsights.com/beacon.min.js`, and that the browser console no longer reports a `script-src` block for that host.

If the account still shows an older **Advanced options** control labelled “Disable automatic setup”, that control has the same purpose for this hostname. Prefer the current **Disable** choice on **Manage site** when both are visible. This phase did not sign in, and it did not change the zone.

## Approver

Each content row needs a recorded decision from a director of MinRosh, who can confirm what the business actually does, and from an Australian legal practitioner reviewing Migration Act Part 3 and the consumer-law provisions cited above. REG-022 needs the Cloudflare account owner. A decision is recorded only when that person marks the CSV row Approved, or supplies replacement text. This phase did not mark any row Approved.

## Stop

Stop for review. Do not merge or deploy from this phase.
