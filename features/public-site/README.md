# Public website feature zone

Visitor-facing marketing site, service/country pages, blog, Smart Navigator, and contact flows.

| Concern | Physical path |
|---------|----------------|
| Pages | `app/` (except `app/admin/`, `app/api/admin/`) |
| Marketing components | `components/home/`, `components/site-*`, etc. |
| Public APIs | `app/api/contact/`, `app/api/quiz-results/`, etc. |
| Static assets | `public/` |

Do not import admin components into public pages. See `docs/ADMIN_PUBLIC_SEPARATION.md`.
