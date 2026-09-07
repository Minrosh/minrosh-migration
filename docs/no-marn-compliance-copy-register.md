# No-MARN Compliance Copy Register

Approved public copy used on branch `compliance/no-marn-update`. CMS fields live under `data/site.json` → `compliance` and related page content.

| Surface | Approved copy / notes |
| --- | --- |
| Brand short | Independent migration information and education support using publicly available sources. |
| Brand long | MinRosh Migration is an independent migration information and education support service. We make publicly available information easier to find and understand and can assist with education-course enquiries and general administrative support. We are not registered migration agents or Australian legal practitioners and do not provide immigration assistance or immigration legal advice. |
| Homepage SEO title | MinRosh Migration \| General Migration Information & Education Support |
| Homepage meta description | Explore general Australian migration information from publicly available sources and receive education-course enquiry support. MinRosh does not provide immigration assistance or legal advice. |
| Hero eyebrow | PUBLIC INFORMATION • CLEAR EXPLANATIONS |
| Hero heading | Explore Australian Migration Information with Greater Clarity |
| Hero body | We organise and explain publicly available information so you can better understand visa categories, official requirements and education options. We do not provide immigration assistance, legal advice or personalised visa recommendations. |
| Hero primary CTA | Explore General Information → `/assessment` |
| Hero secondary CTA | Education Course Enquiry → `/education-consultation` |
| Hero supporting note | For personal migration advice or help with a visa application, use a registered migration agent or Australian legal practitioner. |
| What MinRosh Provides | See `site.json` `about.body` / `about.points` |
| Service cards | General Migration Information; Official Source Navigation; Education Course Support (+ category information cards) |
| How it works | Choose topic → Review summary → Verify official source → Seek authorised advice if needed |
| About core | MinRosh was created to make complex, publicly available migration and education information easier to navigate… (see `app/about/page.js` + `site.json`) |
| Slogan retained | Unlock New Horizons for better tomorrow. |
| Services index | Information and Education Support (`/visa-services`) |
| Category banner | `compliance.categoryPageBanner` |
| Category footer | `compliance.categoryPageFooter` |
| Education page | Education Course Enquiry & Admissions Support |
| Contact intro | General information question or education-course enquiry; do not send passports / migration documents |
| Enquiry types | `general_information`, `education_enquiry` |
| Mandatory acknowledgement | `compliance.formAcknowledgementText` |
| Restricted enquiry response | `compliance.restrictedEnquiryMessage` |
| Footer important notice | General information + not RMA/lawyers + no immigration assistance (see `site-footer.jsx`) |
| Footer referral | Find a Registered Migration Agent (OMARA register search URL) |
| Disclaimer page | Full general-information disclaimer (`app/disclaimer/page.js`) |
| Information Finder intro | `compliance.aiInformationFinderNotice` |
| Information Finder results | Public information you may wish to read |
| Chatbot refusal | `compliance.chatbotRefusal` |
| Public AI Concierge | **Disabled by default** — not shown unless `ENABLE_PUBLIC_AI_CHAT` + `NEXT_PUBLIC_ENABLE_PUBLIC_AI_CHAT` |
| Destination Information Hub | Replaces Command Center; topic → official links; no confidence |
| Booking route | `/book-information-session` (legacy `/book-consultation` permanent redirect) |
| Booking appointment types | General Information Enquiry; Education Course and Admissions Enquiry |
| Mandatory acknowledgement | `compliance.formAcknowledgementText` (server-enforced) |
| Analytics events | `information_finder_started`, `information_topic_selected`, `official_link_opened`, `information_results_viewed` |
| 404 page | Heading “Page not found”; CTAs Return Home / Browse General Information / Education Course Enquiry |
| Tools hub | “General Information Tools” with scope disclaimer; no disabled personalised tool cards |
| Permanent Migration Information Explorer | `/tools/pr-pathway-explorer` — topic → official links only |

## Intentionally remaining “registered migration agent” wording

Referral / educational only (not self-claims): disclaimer, FAQ answers clarifying MinRosh is **not** an RMA, OMARA Code page as third-party information, lawyer-vs-agent educational guide, Information Finder “who can help” topic.

## Staging-only configuration (not production)

- `SITE_ENVIRONMENT=staging` enables noindex/nofollow meta, `X-Robots-Tag`, and `robots.txt` Disallow all.
- Private loopback staging: `127.0.0.1:3001`, isolated data dir, mail/payments/analytics unset.
- Production must leave `SITE_ENVIRONMENT` unset or `production`.

## Deliberately disabled functions

- Public AI chat, AI pathway funnel, personalised quiz results, public migration upload portal, Smart Navigator, destination confidence/route-strategy UI.

## Remaining items requiring external legal or privacy review

1. Historical CRM/quiz/AI-funnel/upload data retention and access (see historical-data inventory).
2. Any future re-enablement of public generative AI.
3. Admin CRM “client/customer” relationship language.
4. Testimonials / success stories with outcome-adjacent wording.
5. CMS rollback controls for pre-compliance copy.
6. Historical invoice descriptions and Google Sheet matter mirrors.
7. Remaining `public-needs-review` “client” hits in the terminology inventory.
8. Rotation of SMTP and Google credentials previously present on the old staging PM2 process (see technical report).

