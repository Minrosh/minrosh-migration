# Destination Section Content Guide

Use this guide when editing country section content under `data/destination-sections/`.

## Required page keys

Each section page object (for example `skilled`, `partner`, `student`) should include:

- `metaTitle`
- `metaDescription`
- `eyebrow`
- `headline`
- `intro`
- `officialResources` (array of `{ label, href }`)
- `sections` (array)
- `faq` (array)
- `related` (array)

## Section block format

Each item inside `sections` should include:

- `title`
- `body`

Optional quality fields:

- `details` (array of extra paragraphs)
- `bullets` (array)
- `checklist` (array of practical steps)
- `warning` (short risk note)
- `officialResources` (official links specific to that section)

## Content standards

- Keep guidance factual and practical.
- Avoid promises or guaranteed outcomes.
- Prefer process clarity over marketing language.
- Link only to official government domains for `officialResources`.
- Use HTTPS links only.

## Validation and reports

- Run `npm run validate:destination-content` before commit.
- Run `npm run report:destination-sources` to refresh the official-source inventory report.
- Build now enforces destination-content validation automatically.
