# Website CMS — Live deploy checklist (two-step)

**Do not enable CMS on production until owner sign-off and backup are complete.**

## Step 1 — Deploy code with CMS flag OFF

- [ ] Pre-deploy backup completed
- [ ] Staging QA passed (`reports/website-cms-staging-qa-report.md`)
- [ ] Owner written approval
- [ ] Deploy with **`NEXT_PUBLIC_WEBSITE_CMS_ENABLED=false`**
- [ ] Smoke test key routes + contact form

## Step 2 — Enable CMS flag (separate action)

- [ ] Owner reviewed staging CMS publish per page
- [ ] Homepage: desktop + mobile comparison + `ownerApprovalConfirmed: true`
- [ ] Set `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true` on production
- [ ] Re-smoke test; toggle flag off if issues

## Emergency off

Set `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=false` and redeploy, or run `node scripts/website-cms-emergency-off.mjs`.

**Documentation only — no automated production deploy from this repo task.**
