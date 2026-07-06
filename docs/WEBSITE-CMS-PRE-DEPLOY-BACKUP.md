# Website CMS — Pre-deploy backup checklist

Complete **before** merging `feature/website-cms` to `main` or deploying CMS code to production.

## 1. Git snapshot

- [ ] Tag current `main`: `git tag website-cms-pre-deploy-YYYY-MM-DD main`
- [ ] Push tag to origin
- [ ] Note merge commit SHA after merge

## 2. Data files

- [ ] Copy all `data/*.json` to secure backup location
- [ ] Priority: `website-pages.json`, `website-versions.json`, `website-navigation.json`, `website-footer.json`, `website-compliance.json`

## 3. Storage

- [ ] Copy `storage/uploads/` and `storage/website-media/`

## 4. Environment

- [ ] Secure copy of production `.env` (never commit)
- [ ] Confirm `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=false` for first production deploy

## Recovery

See [`WEBSITE-CMS-ROLLBACK-RUNBOOK.md`](./WEBSITE-CMS-ROLLBACK-RUNBOOK.md).
