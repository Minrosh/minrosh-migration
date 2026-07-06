# Website CMS — Owner Guide

Plain-language guide for editing MinRosh website wording from the admin panel.

## Where to go

1. Log in at `/admin/login`
2. Open **Website Manager** in the left sidebar
3. Choose a page → **Edit draft**

## Edit a page

- Use **+ Hero** or **+ Text** to add content blocks
- Change headings, paragraphs, button text, and links in the form fields
- Do **not** paste HTML — only plain text is allowed
- Use the **Block preview** panel on the right to check layout

## Save draft

- Click **Save draft**
- Changes are stored in `data/website-pages.json`
- With CMS flag **off** on production, visitors still see legacy content

## Preview

- Click **Preview** or visit `/admin/website/preview/about` (use the page slug)
- Preview shows **draft** content — not visible to the public until publish + CMS flag on

## Publish

- Click **Publish** after saving a draft
- Copies draft to **published** JSON and records **version history**
- Public pages update only when `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true` on that environment

## Homepage (special rules)

- The **hero always stays the legacy homepage hero** — CMS hero blocks on `/` are ignored
- Production homepage publish requires **owner approval** and owner/super role
- Complete desktop + mobile visual comparison before publishing homepage to production

## Rollback

1. Open **Version history** on the page editor
2. Click **Restore to draft** to load an old version into your draft (review before publishing again)
3. Click **Restore published** only if you need to revert the published JSON snapshot

## SEO fields

- Fill **SEO title** and **SEO description** in the SEO panel
- Use the **Search preview** box to see an approximate Google snippet
- SEO on the live site applies only after CMS pages are connected and published

## Compliance (MARN & disclaimers)

- Go to **Website Manager → Compliance**
- Toggle **Show MARN publicly** only when appropriate
- Default MARN text: “Available on request”

## Media library

- Go to **Website Manager → Media**
- Upload JPEG, PNG, or WebP (max 5MB)
- **Alt text is required** for accessibility

## What not to touch

- CRM, Leads, Invoices, Quotes, Users, Intelligence pipelines
- Do not edit code or CSS from this panel
- **Homepage hero** is protected — CMS only changes bands below the hero
- Do not enable `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true` on production without owner sign-off

## Need help?

If a page looks wrong after publish, use **Restore to draft** from version history or ask your developer to set `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=false` (instant fallback when pages are wired).
