# Phase 7C — Safe staging integration and form verification

Isolated loopback test only. Production on port 3000 (pid 1875, started 12 October 2026) and staging on port 3001 (pid 1874) were left running. No production credential was copied. No live CRM, mailbox, calendar, or payment account was contacted. Nothing was deployed or merged.

## Result

The contact, booking, acknowledgement, and newsletter flows can be exercised against a local JSON sink. That sink proves the application stores a synthetic enquiry and returns the correct validation and success responses. It does not prove that production email, Google Calendar, Google Sheets, Supabase, or Stripe work.

Real delivery remains **BLOCKED** until a separate sandbox is approved for SMTP, calendar, sheets, and payments. The Official Information Finder is enabled and does not submit personal data. Personalised quiz results, the public AI assistant, and the pathway funnel stay disabled.

## Test environment

| Item | Value |
| --- | --- |
| Application | Phase 7B candidate, build `8j6C9xBM3yqrH5Wtk4RSK` |
| Server | http://127.0.0.1:3126, stopped after cleanup |
| Process environment | `env -i` with `SITE_ENVIRONMENT=staging`, `SKIP_ENV_VALIDATION=1`, `SUPABASE_DUAL_WRITE_ENQUIRIES=false` |
| Secrets present | None. The process environment listed only path, port, site mode, and the three local file paths |
| Enquiry file | `/home/minrosh/releases/qa-phase-7c-20261024/sink/enquiries.json` |
| Newsletter file | same directory, `newsletter.json` |
| Nurture file | same directory, `nurture-queue.json` |
| Local CRM copy | empty `customers.json` and `crm-leads.json` inside the 7C standalone `data/` directory |
| Phase 7B data | Left unchanged (3 existing example.com seed enquiries, 7 seed customers) |

`robots.txt` on this server was `Disallow: /` because `SITE_ENVIRONMENT=staging`.

Every address used was `@example.com`. After the checks, those JSON stores were rewritten to empty arrays or empty collections. A search of the cleared files found no `example.com` address. Production and the 7B candidate files were not modified.

## Dependency map

| Journey | Public entry | API | What a successful production run would touch | What this test used |
| --- | --- | --- | --- | --- |
| Contact enquiry | `/contact` | `POST /api/contact` | Local `ENQUIRIES_FILE`, local CRM JSON, nurture queue, then Supabase `enquiries_mirror` if configured, then SMTP | Local JSON only |
| Information-session booking | `/book-information-session` (same form, consultation mode) | same `POST /api/contact` with date, time, and booking type | Above, plus Google Calendar free/busy and event insert, plus Stripe Checkout when both Stripe secrets exist | Local JSON only. Calendar and Stripe were absent |
| Acknowledgement and privacy | Checkboxes on the same form | `formAcknowledgementAccepted` is required by the server. `privacyPolicyAccepted` is required by the browser. The server requires privacy only when `REQUIRE_PRIVACY_CONSENT_ON_CONTACT=true` | Stored on the enquiry as `privacyConsentLog` | Both paths tested |
| Official Information Finder | `/assessment` | None for the topic picker. `POST /api/quiz-results` exists and returns 410 | No CRM write | Browser topic selection only |
| Newsletter | Footer form | `POST /api/newsletter` | Local `NEWSLETTER_FILE`, then a welcome email when SMTP exists | Local JSON only. Welcome email was not sent |
| Payment | Reached only after a booked slot when Stripe is configured, or `POST /api/payments/checkout` | Stripe Checkout Sessions API | Not called |

Also confirmed disabled, so they were not given credentials:

- `POST /api/quiz-results` — 410, personalised results pending authorised review
- `POST /api/ai-funnel` — 410
- `POST /api/chat` — 410
- hCaptcha — `NEXT_PUBLIC_ENABLE_HCAPTCHA` is not on in this build, and `REQUIRE_HCAPTCHA_ON_CONTACT` was unset. The widget did not render and the server did not call hCaptcha

Spam controls that did run: honeypot fields `company`, `website`, and `url`; in-memory rate limit of 10 contact posts per 15 minutes per client address; newsletter consent required before save.

## Workflows tested

These are application-and-local-file tests. They are not staging tests of Gmail, Google, Supabase, or Stripe.

### Contact validation

| Case | HTTP | Response |
| --- | --- | --- |
| Empty body | 400 | `VALIDATION_FAILED` — first name, email, and enquiry are required |
| `not-an-email` | 400 | Please enter a valid email address |
| Acknowledgement omitted | 400 | Please confirm the acknowledgement before submitting |
| Honeypot `company` filled | 400 | Invalid request |
| Weekday 09:00 slot | 400 | Monday–Friday sessions are 7:00 pm to 10:00 pm Brisbane time |
| Eleventh contact post from one address | 429 | Too many requests |

### Contact saved locally

`phase7c-contact@example.com` with acknowledgement and privacy accepted returned **200**. `internalSent` and `thankYouSent` were false. The warning was “Enquiry saved, but SMTP is not configured yet.” The record was in the isolated enquiry file with `privacyConsentLog.clientConfirmed: true`. A local CRM lead and a nurture-queue row were created. No mail was sent.

A second post with the same email also returned **200** and created a second enquiry and a second lead. Contact does not reject a duplicate email.

### Browser, desktop 1440

On `/contact`:

- An invalid email showed “Please enter a valid email address.” The email field was marked invalid in the accessibility tree.
- Both consent checkboxes could be selected from the keyboard-focused control.
- A complete synthetic enquiry showed the button “Sending your enquiry...” and then “Enquiry saved, but SMTP is not configured yet.”
- `window.minroshTrack` recorded `contact_form_submit_attempt` and `contact_form_submitted`. No Google tag was loaded, because this build has no measurement id. The events are in-page only.

The saved browser enquiry was `phase7c-browser@example.com`.

### Browser, mobile 390

The form switches to a three-step layout. The fixed “Information Finder” bar overlapped the Continue button until the button was scrolled into the middle of the screen. After that scroll, Continue was clickable. Empty required fields use the browser’s native required check and move focus to First name. This overlap is a mobile usability note. It did not block the desktop submission.

### Booking

A Tuesday 27 October 2026, 19:00 Brisbane, 30-minute phone request passed slot validation and returned **200**. `consultationBooked` was false. `slotAvailable` was true because a missing Google client is treated as “not checked,” not as a busy slot. The preferred date and time were stored on the enquiry. No calendar event was created.

When SMTP is also missing, the response warning is the SMTP sentence. The calendar-not-configured sentence is not shown on that path. The enquiry is still saved.

### Acknowledgement and privacy

The server rejects a missing acknowledgement. The browser also requires the privacy checkbox before it will post. With `REQUIRE_PRIVACY_CONSENT_ON_CONTACT` unset, a direct API post that accepts the acknowledgement and omits privacy still returns **200** and stores `clientConfirmed: false`. That flag is off in this candidate. Turning it on is a production configuration choice, not something this phase changed.

A message that asked about personal eligibility and chance of approval returned **200** with outcome `referred_to_authorised_professional`. It was stored and was not turned into a CRM lead or a nurture email. No eligibility answer was generated.

### Official Information Finder

`/assessment` H1 is “Official Information Finder.” Choosing “Student visas and study information” rendered public links, including the Department of Home Affairs student visa page and Study Australia, plus the on-site student information page. No name, email, or score was submitted. `POST /api/quiz-results` remains 410.

### Newsletter

| Case | HTTP | Result |
| --- | --- | --- |
| Invalid email | 400 | Please enter a valid email address |
| Consent false | 400 | Marketing consent is required |
| Honeypot filled | 400 | Invalid request |
| First subscribe | 200 | Row saved, `emailSent: false`, reason `smtp_not_configured` |
| Same email again | 200 | `exists: true`, message “This email is already subscribed.” No second welcome attempt |

The footer Subscribe button stays disabled until an email is entered and the marketing checkbox is checked. A browser subscription for `phase7c-footer@example.com` reached the local file with status `active`. The user-facing success copy still says the person will receive updates. In this environment no email was sent. On production that sentence is only true when SMTP succeeds.

### Payment

`POST /api/payments/checkout` with a synthetic amount returned **503** “Stripe is not configured.” No request was made to Stripe. The booking success payload had no `checkoutUrl`.

## Cleanup

Synthetic rows were removed from the 7C sink and from the 7C copy of `customers.json`, `crm-leads.json`, `crm-tasks.json`, `nurture-queue.json`, and `audit-log.json`. The 7C server was then stopped. The 7B server on port 3125 was left up for the regression run. Production and the existing staging process were not restarted.

## Regression

| Check | Result |
| --- | --- |
| Unit tests | 20 files, 110 passed. The contact dual-write test still logs `contact_supabase_dual_write_failed_pre_email` and passes. That test uses a mock, not this sink. |
| End-to-end against the 7B server on port 3125 | 163 passed |
| Isolated production-mode build | Passed. New build id `qGlHgXTdNg3oIYceZ_odp` in `/home/minrosh/releases/qa-phase-7c-build-20261024`. It was not started, and it did not replace the 7B server |
| Application source | Unchanged in this phase |

## Remaining blocked integrations

| Integration | Status | Why |
| --- | --- | --- |
| SMTP enquiry mail and thank-you mail | BLOCKED | No SMTP host, user, or password in the test process. A 200 with `internalSent: false` is a local save, not a delivered email |
| Newsletter welcome mail | BLOCKED | Same SMTP gap. The subscription row is local |
| Google Calendar booking | BLOCKED | No service account. `consultationBooked` stayed false |
| Google Sheets CRM and Google Drive lead folder | BLOCKED | No credentials. The route skips them |
| Supabase enquiry mirror | BLOCKED | No URL or service-role key, and dual-write was explicitly false. A skipped mirror is not a database write |
| Stripe checkout and webhook | BLOCKED | No secret key and no webhook secret. No charge was created |
| hCaptcha | Not configured | Flags off. Cannot be called without a site key and secret |
| Personalised quiz, AI chat, AI funnel | Disabled by compliance flags | 410. Left disabled |

## Production release risks

- A release that ships without SMTP will tell the enquirer the enquiry was saved and will not send the team an email. Confirm SMTP on the production process before cutover. Do not treat this local 200 as that confirmation.
- A booking can be stored while `consultationBooked` is false. The team would need to confirm the time manually. Calendar credentials are still required for an automatic appointment.
- Stripe is off, so the booking page cannot take payment. That is safe for this test and means paid booking is not release-ready.
- The server honours the first `X-Forwarded-For` address for the contact rate limit. Behind Cloudflare that header is set by the proxy. The Node port should stay unreachable from the public internet, as it is today on loopback for this candidate and on the existing production bind.
- Privacy consent is enforced in the browser and stored when the browser sends it. The server-side `REQUIRE_PRIVACY_CONSENT_ON_CONTACT` switch is off, so a crafted API request can store an enquiry with `clientConfirmed: false`.
- Duplicate contact emails are accepted. Newsletter duplicates are recognised.
- ISS-016 and ISS-021 remain open. This phase does not approve a production release.

## Stop

Safe local integration testing was established for validation, consent, local storage, and the disabled personalised tools. Safe testing of the external mail, calendar, CRM, and payment providers was not, because those credentials are production secrets and were not copied. Phase 7C stops here for review.
