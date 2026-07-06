# Website CMS — Rollback Runbook

Use this when CMS content needs to be reverted quickly.

## Fastest: disable CMS on production

Set in Hostinger / production environment:

```bash
NEXT_PUBLIC_WEBSITE_CMS_ENABLED=false
```

Redeploy or restart the app. When public pages are wired, this instantly shows legacy hardcoded content again.

## Per-page: unpublish via admin API

In Website Manager, use **Restore published** from version history, or call:

```http
POST /api/admin/website/pages/about/rollback
Content-Type: application/json

{ "action": "unpublish" }
```

(requires admin session + `website:publish` permission)

## Clear all published CMS JSON (server CLI)

On the server, from the project root:

```bash
node scripts/website-cms-emergency-off.mjs
```

This clears `published` sections for all pages but **keeps drafts**.

## Restore corrupted JSON files

1. Stop writes (disable admin publish temporarily)
2. Restore from pre-deploy backup:
   - `data/website-pages.json`
   - `data/website-versions.json`
   - `data/website-compliance.json`
3. Restart app and verify `/admin/website`

## Git revert (code rollback)

If a CMS code deploy caused issues:

```bash
git revert <merge-commit-sha>
# redeploy previous build
```

## Verify after rollback

- [ ] Public homepage and key routes load (legacy content)
- [ ] `/admin/website` loads
- [ ] Contact form still works
- [ ] CRM / invoices unaffected
- [ ] `npm run build` passes before re-deploy

## Staging noindex

Staging should return:

```http
X-Robots-Tag: noindex, nofollow
```

when hostname is `staging.minroshmigration.com.au` or `STAGING_SITE=true`.

## Contacts

Document backup location and last known good version ID from **Version history** before any production CMS enablement.
