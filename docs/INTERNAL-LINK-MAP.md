# Internal Link Map (Content-Safe SEO Pass)

## Goal
Strengthen crawl paths and conversion journeys without removing any existing links.

## Core Flow
- Immigration news articles -> service pages -> `/assessment` / `/book-consultation`
- Updates hub guides -> related service pages -> conversion pages
- Service pages -> official sources + related service pages + conversion pages

## Implemented links
- Marketing pages share the same accent and display-serif rhythm as the homepage via `.marketing-visual-ref` in `app/globals.css` (wrappers on About, Contact, Book consultation, Immigration news article).
- `app/immigration-news/[slug]/page.js`
  - Added "Next pages for practical action" links to:
    - `/assessment`
    - `/book-consultation`
    - `/skilled-migration`
    - `/partner-visa-australia`
    - `/student-visa-australia`

## Recommended next links
- From each guide page:
  - Add one contextual link to the most relevant service page.
  - Add one conversion CTA to `/assessment` or `/book-consultation`.
- From each service page:
  - Keep links to official Home Affairs sources.
  - Link to 2-3 related internal service/guide pages.

## Safety rules
- Do not remove existing internal links.
- Keep links in crawlable HTML.
- Avoid generic "click here"; use descriptive anchor text.
