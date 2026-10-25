# Phase 8C — External integration readiness and customer-journey certification

Isolated loopback test of the Phase 8B candidate after the public-message corrections in this phase. Production on port 3000 (pid 1875, started Monday 12 October 2026 19:42:31) and staging on port 3001 (pid 1874, started 19:42:30) were left running. No production credential was copied into the test process. No live mailbox, calendar, spreadsheet, Drive folder, or payment account was contacted. Nothing was merged or deployed.

## Result

**NO-GO** for the release requirement that every enabled customer-facing delivery path is verified.

Contact, booking, and newsletter application logic can be exercised against a local JSON sink. That proves validation, consent, spam controls, local storage, and the customer-facing wording. It does not prove delivery through Gmail/SMTP, Google Calendar, Google Sheets, or Google Drive.

Those four providers are configured on the current production process. Using them for a test would send real mail and create real calendar and CRM records. No sandbox account was available, so those deliveries stay **BLOCKED**.

Stripe and Supabase are absent from the production process. They are not enabled customer journeys. Personalised quiz results, the public AI assistant, the pathway funnel, authorised RMA mode, and the public document portal stay intentionally disabled.

## Candidate

| Item | Value |
| --- | --- |
| Source revision | `00a8c2d` on `fix/phase-6b-critical-repairs`, plus uncommitted Phase 8B and 8C edits. Not pushed. |
| Isolated build | `3vdwu65XKHx_6SiJ2m9T2` at `/home/minrosh/releases/qa-phase-8c-20261025/src` |
| Server | `http://127.0.0.1:3128`, stopped after the synthetic records were cleared |
| Process environment | `env -i` with `NODE_ENV=production`, `SKIP_ENV_VALIDATION=1`, `SITE_ENVIRONMENT=production`, `SUPABASE_DUAL_WRITE_ENQUIRIES=false`, and three local file paths |
| Secrets in that process | None. Names `SMTP_`, `STRIPE_`, `GOOGLE_`, and `SUPABASE_` were absent |
| Enquiry, newsletter, nurture files | `/home/minrosh/releases/qa-phase-8c-20261025/sink/` |
| Local CRM copy | standalone `data/` under the same release, emptied after the test |
| Addresses used | `@example.com` only |

A search after cleanup found no `phase8c-` address in the sink, the standalone data files, or the workspace `data/` directory. The isolated source tree still holds the seed JSON that was copied with the build. That seed was not the write target.

## Dependency matrix

State below is the live production process (pid 1875). Values were not read. “SET” means the name is present and non-empty. “ABSENT” means the name is not in the process environment.

| Feature | API route | Required provider | Required configuration | Actual state | Expected successful behaviour | Verification | Business impact if unavailable |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Contact enquiry | `POST /api/contact` from `/contact` | SMTP, then local JSON | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_SECURE`; `ENQUIRIES_FILE` | SMTP SET. Enquiry file SET | Enquiry stored, staff notified, visitor told the enquiry was received | Local validation and storage **PARTIAL**. SMTP delivery **BLOCKED** | Critical. Staff do not receive the enquiry email, and the visitor receives no confirmation mail |
| Information-session booking | same `POST /api/contact` from `/book-information-session` | Google Calendar plus the contact path | `GOOGLE_CALENDAR_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GOOGLE_WORKSPACE_DELEGATED_USER` | All SET | Slot checked, event created only when free, `consultationBooked` true only then | Slot rules and local save **PARTIAL**. Calendar create **BLOCKED** | Critical. A saved preference can be mistaken for a held appointment if the response overclaims |
| Sheets CRM | called from `POST /api/contact` after the local save | Google Sheets | `GOOGLE_SHEETS_CRM_SPREADSHEET_ID`, `GOOGLE_SHEETS_STATUS_SPREADSHEET_ID`, plus the service account | Both spreadsheet ids SET | Lead row appended. Failure is best-effort and does not block the enquiry | **BLOCKED** | High. The website still stores the enquiry locally, and the spreadsheet copy is missing |
| Drive lead folder | called from `POST /api/contact` | Google Drive | `GOOGLE_DRIVE_LEADS_PARENT_ID`, `GOOGLE_DRIVE_CUSTOMERS_PARENT_ID`, `GOOGLE_APPLICATION_CREDENTIALS` | All SET | Folder created for the lead | **BLOCKED** | High for document handling. The enquiry itself can still be stored locally |
| Newsletter | `POST /api/newsletter` | SMTP welcome mail, local JSON | SMTP names above. `NEWSLETTER_FILE` defaults to `data-newsletter.json` when unset | SMTP SET. `NEWSLETTER_FILE` ABSENT | Address saved once. Welcome mail sent when SMTP works. Duplicate returns already subscribed | Local save, consent, and duplicate handling **PARTIAL**. Welcome mail **BLOCKED** | Medium. The subscription is stored, and the welcome message is not sent |
| Card payment | `POST /api/payments/checkout`, and checkout after a slot when Stripe is on | Stripe | `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` (`stripeEnabled()` requires both) | Both ABSENT | Checkout session URL. No charge until the visitor pays | Disabled-state response verified. No payment call | Not a current customer path. Enabling it later needs a test-mode key |
| Supabase mirror | inside `POST /api/contact` before mail | Supabase | `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Dual-write also respects `SUPABASE_DUAL_WRITE_ENQUIRIES` | All ABSENT | Upsert to `enquiries_mirror` before email | Skipped because credentials are absent | Optional. Local JSON remains the store |
| Official Information Finder | `/assessment`. No personal-data POST | None | None | Enabled page. Quiz API stays off | Topic links to official sources. No eligibility result | **PASS** on the candidate HTML | Low. The page does not depend on an external account |
| hCaptcha | contact POST when required | hCaptcha | `REQUIRE_HCAPTCHA_ON_CONTACT=true` and the public site key | `REQUIRE_HCAPTCHA_ON_CONTACT` ABSENT. `NEXT_PUBLIC_ENABLE_HCAPTCHA` ABSENT | Widget and server check only when required | Not required, so not called | Optional. Honeypot and rate limit still run |
| SMS | not on the public contact form | Twilio | `TWILIO_ACCOUNT_SID` | ABSENT | Not part of the current public submit | Not applicable | None for the current form |
| Facebook page webhook | admin/cron paths | Meta | `FACEBOOK_PAGE_ACCESS_TOKEN`, `FACEBOOK_PAGE_ID` | Both EMPTY | Not a public enquiry path | Not applicable | None for the contact form |
| Personalised quiz, AI chat, pathway funnel, public upload portal, authorised RMA mode | `/api/quiz-results`, `/api/chat`, `/api/ai-funnel`, `/api/upload/[token]` | Intentionally off | `ENABLE_PERSONALISED_QUIZ_RESULTS`, `ENABLE_PUBLIC_AI_CHAT`, `NEXT_PUBLIC_ENABLE_PUBLIC_AI_CHAT`, `ENABLE_AI_PATHWAY_FUNNEL`, `ENABLE_PUBLIC_MIGRATION_MATTER_PORTAL`, `ENABLE_AUTHORISED_RMA_MODE` | Each value is the string `false` | 410 `FEATURE_DISABLED` | Confirmed 410. Flags were not turned on | Correct while restricted. Do not enable them to satisfy a test |

Critical enabled dependencies are SMTP notification, Google Calendar, Google Sheets CRM, and Google Drive. Stripe, Supabase, hCaptcha, Twilio, and Facebook are not active public dependencies on this process.

## Safe-testing boundary

The isolated server used synthetic `@example.com` addresses and empty JSON files. It did not read `/proc/1875` values into its environment.

A safe end-to-end delivery test still needs owner-supplied sandbox accounts that are separate from production:

1. A dedicated test mailbox and SMTP credentials that are not the live `SMTP_USER` / `SMTP_FROM` pair.
2. A Google Calendar that the test service account can write, and that is not `GOOGLE_CALENDAR_ID` from production.
3. A spreadsheet and a Drive parent folder created for the test, not the production CRM sheet or customer Drive.
4. If card payment is later enabled, Stripe test-mode keys only.
5. Those values supplied to an isolated process. Do not export the production environment into that process.

Until those exist, delivery tests stay **BLOCKED**. `scripts/test-smtp.mjs` contains a grouped password-shaped example in its help text. The value is not repeated here. If that example was ever a live app password, rotate it in the provider console and remove it from the script.

## Workflow classification

| Workflow | Class | Evidence |
| --- | --- | --- |
| Contact validation, consent, honeypot, rate limit, local save, browser success text | **PARTIAL** | Exercised on the isolated sink. Mail, Sheets, and Drive delivery not exercised |
| Contact SMTP notification | **BLOCKED** | Production SMTP is configured. No sandbox mailbox |
| Booking slot rules and “not a confirmed appointment” wording | **PARTIAL** | Weekday 09:00 rejected. Tuesday 19:00 saved with `consultationBooked: false` |
| Google Calendar event creation | **BLOCKED** | Production calendar is configured. No sandbox calendar |
| Newsletter local subscribe, consent, duplicate | **PARTIAL** | Local JSON only. Welcome mail not sent |
| Newsletter welcome email | **BLOCKED** | Same SMTP limit as contact |
| Sheets CRM and Drive folders | **BLOCKED** | Production ids are set. No isolated spreadsheet or folder |
| Official Information Finder | **PASS** | Page renders “Official Information Finder” and states that it does not assess eligibility. No personal data is posted |
| Stripe checkout | **NOT APPLICABLE** | Both Stripe secrets are absent. Disabled response verified. No charge was created |
| Supabase dual-write | **NOT APPLICABLE** | Credentials absent. Dual-write skipped |
| Quiz results, AI chat, AI funnel, public upload portal, authorised RMA mode | **NOT APPLICABLE** | Flags are `false`. POST returned 410. Flags were left false |
| hCaptcha, Twilio, Facebook page | **NOT APPLICABLE** | Not configured for the public form |

No workflow in this pass is **FAIL**. The release requirement for external delivery of the enabled contact, booking, Sheets, and Drive paths remains **BLOCKED**, which is the NO-GO.

## Contact

Browser on `http://127.0.0.1:3128/contact`, then the API on the same build.

| Check | Result |
| --- | --- |
| Required fields | Empty body returns 400, “First name, email, and your enquiry are required.” |
| Email | `not-an-email` returns 400, “Please enter a valid email address.” |
| Acknowledgement | Omitted acknowledgement returns 400, “Please confirm the acknowledgement before submitting.” |
| Privacy | The browser requires the privacy checkbox before submit. The server requires `privacyPolicyAccepted` only when `REQUIRE_PRIVACY_CONSENT_ON_CONTACT=true`, which is unset in production |
| Honeypot | `company` filled returns 400, “Invalid request.” |
| Rate limit | Ten empty posts from one address returned 400. The eleventh and twelfth returned 429 |
| Duplicate email | A second contact with the same address is accepted and stored as a second enquiry. Newsletter dedupe does not apply here |
| Browser submit | Synthetic `phase8c-browser@example.com`. Button changed to “Sending your enquiry...”. Status then read “Your enquiry has been received. We will reply using the contact details you provided.” |
| Delivery failure wording | With SMTP absent, the public warning does not name SMTP. The server log event is `contact_mail_not_configured` with the enquiry id |
| Local CRM | The browser enquiry created one local CRM lead in the isolated standalone `data/` directory |

The form displays `warning` and maps `MAIL_DELIVERY_FAILED` to “We could not send your enquiry by email right now…”. `processingSummaryNote` returns an empty string, so sheet and drive status are not appended to the success line. A 503 from a later mail or Supabase failure can still include `error.details.reason` in the JSON. The form does not render `details`. That reason belongs in the server log; leaving it in the public JSON is a residual disclosure for anyone reading the response body.

Mobile: the contact form switches to a stepper at `max-width: 720px` (`components/contact-lead-form.js`). End-to-end coverage on this server included `/contact` in the mobile layout project and the 390px public visual regression. The Cursor browser session used for the typed submit stayed on the desktop form; the device-metrics override did not change that panel’s layout.

## Booking

The only schedule in the repository is `lib/consultation-slot-policy.js`. Its comment marks Australia/Brisbane hours as authoritative:

- Monday–Friday, 19:00–22:00, last start 21:30, 30-minute sessions.
- Saturday–Sunday, 09:00–22:00, last start 21:30.
- Start must be at least 24 hours ahead unless `CONSULTATION_MIN_LEAD_HOURS` overrides it. Production was not given a different value in this test. The isolated process used the 24-hour default.

That matches the earlier observation: a weekday morning slot is rejected, and a Tuesday 7:00 pm slot is inside the window.

On build `3vdwu65XKHx_6SiJ2m9T2`:

- Tuesday 27 October 2026 at 09:00 Australia/Brisbane returned 400: “Monday–Friday consultations are available between 7:00 pm and 10:00 pm Brisbane time (AEST), in 30-minute slots.”
- Tuesday 27 October 2026 at 19:00 returned 200. `consultationBooked` was false. `slotAvailable` was true. `internalSent` was false. The warning was “Your enquiry has been received. We will reply using the contact details you provided. A calendar appointment has not been confirmed.”
- The public JSON did not contain “smtp” or “not configured”.

`consultationBooked` is set from `calendarResult.created`. With no calendar credentials, creation returns `google_calendar_not_configured` and the public copy says the time is saved and is not a confirmed appointment. No calendar event was created.

Unit coverage in `tests/consultation-slot-policy.test.mjs` still accepts a weekday 7:00 pm, rejects a weekday time before 7:00 pm, enforces the 24-hour lead, accepts 21:30 as the last weekday start, rejects a 22:00 start, accepts Saturday 09:00 when it is far enough ahead, and rejects Saturday 08:30.

## Other enabled features

Newsletter, on the same isolated server before the final rebuild and again in the route source: a bad email returns 400; missing marketing consent returns 400; a new address returns 200 with `exists: false`, `emailSent: false`, and “Your subscription is saved. A welcome email has not been sent yet.”; a repeat returns “This email is already subscribed.” The welcome-mail reason is logged and is not returned on the public body.

Checkout on the final build, amount 100 cents, returned 503: “Card payment is not available. No payment has been taken.” The body does not say Stripe is not configured. The log event is `checkout_provider_not_configured`. No Stripe request was made.

`POST /api/quiz-results`, `POST /api/chat`, and `POST /api/ai-funnel` each returned 410 `FEATURE_DISABLED` with a message pointing to the Official Information Finder or the contact form.

`/assessment` on this build contains “Official Information Finder” and states that the tool does not assess eligibility.

## Regression

| Check | Result |
| --- | --- |
| `npm run test:unit` | 22 files, 115 tests passed |
| `PLAYWRIGHT_LIVE_URL=http://127.0.0.1:3128 npm run test:e2e` | 163 passed in 52.7s |
| Production pid 1875 and staging pid 1874 | Same start times after the suite |
| Ports 3000 and 3001 | Still listening after 3128 was stopped |

`routes:verify` and `audit:indexability` were not re-run in this phase. Phase 8B already ran them against the candidate before these message-only API edits. This phase did not change page metadata, sitemap, or robots.

## Release recommendation

**NO-GO** for releasing on the strength of external delivery. Contact notification, calendar booking, Sheets CRM, and Drive folder creation are enabled in production and remain unverified. Local behaviour for those journeys is **PARTIAL**.

Stripe, Supabase, hCaptcha, and the restricted AI and eligibility features are not reasons to block on their own: they are absent or intentionally disabled, and they were not switched on.

Uncommitted work remains on `fix/phase-6b-critical-repairs` at `00a8c2d`, including the Phase 8B privacy and metadata edits and the Phase 8C public-message edits in `app/api/contact/route.js`, `app/api/newsletter/route.js`, and `app/api/payments/checkout/route.js`. This phase did not create a commit, did not push, and did not merge.

Stop for review.
