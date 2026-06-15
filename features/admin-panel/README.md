# Admin panel feature zone

Code for the private CRM workspace lives here as **logical aliases** to the App Router
and library paths below. Routes stay at `/admin` and `/api/admin/*` (Next.js App Router).

| Concern | Physical path |
|---------|----------------|
| Pages | `app/admin/` |
| API | `app/api/admin/` |
| UI components | `components/admin/` |
| Server logic | `lib/admin/` |

When editing admin-only behaviour, prefer these folders. See `docs/ADMIN_PUBLIC_SEPARATION.md`.
