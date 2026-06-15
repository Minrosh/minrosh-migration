# Shared feature zone

Cross-cutting code used by **both** the public website and admin panel. Changes here require testing both surfaces.

| Concern | Physical path |
|---------|----------------|
| Root layout / middleware | `app/layout.js`, `middleware.js` |
| UI primitives | `components/ui/` |
| API helpers | `lib/api/` |
| Security / CSP | `lib/csp/`, `lib/security/` |
| Contact pipeline | `lib/contact.js` |

Run `npm run check:sync` before merging shared changes.
