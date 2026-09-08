# Robots: build-time vs runtime (post-cutover lesson)

## Incident root cause (2026-09-08)

The compliance release at commit `1455a66a…` was built in a shell that still had
`SITE_ENVIRONMENT=staging` exported from staging work.

`app/robots.js` was evaluated at **build time**. Next wrote a static
`.next/server/app/robots.txt.body` containing only:

```text
User-Agent: *
Disallow: /
```

Later, PM2 set `SITE_ENVIRONMENT=production` on the process, but the baked body
did not change. Operators surgically patched the body in the release output
(see `docs/ops/PRODUCTION-RELEASE-OPERATIONAL-PATCHES.md` and incident
`15-robots-surgical-patch-record.md`).

Homepage `robots` meta remained indexable because layout metadata evaluation
did not match the robots route bake in that build; do not rely on that
inconsistency — always build production releases with a clean env.

## Required behaviour

| `SITE_ENVIRONMENT` | `X-Robots-Tag` | Meta robots | `robots.txt` |
| --- | --- | --- | --- |
| `staging` | `noindex, nofollow` | noindex / nofollow | Disallow `/` |
| `production` (or unset) | (absent) | index / follow | Production allow + sitemap + host `https://minroshmigration.com.au` |

## Source mitigations (next release)

1. `export const dynamic = "force-dynamic"` on `app/robots.js` so request-time
   `SITE_ENVIRONMENT` controls the response even if a stale body exists.
2. `scripts/assert-release-build-env.mjs` — fail production release builds when
   `SITE_ENVIRONMENT=staging` (`RELEASE_TARGET=production` or `--production`).
3. `scripts/verify-robots-build-artifact.mjs` — after `next build`, reject a
   staging lockdown body when building for production.

## Production release build recipe

```bash
# From an isolated release directory — never /home/minrosh/minrosh-migration while live
env -u SITE_ENVIRONMENT \
  SITE_ENVIRONMENT=production \
  RELEASE_TARGET=production \
  ACKNOWLEDGE_SHARED_RISK=1 \
  npm run build
```

## Do not

- Build a production release with `SITE_ENVIRONMENT=staging` in the shell.
- Treat a release directory as immutable if an operational patch marker exists.
- Patch production build output again except as an emergency with a recorded patch.
