# Admin panel zone

**Owner:** `/admin`, `/admin/*`, `/api/admin/*`

## Physical layout

| Path | Purpose |
|------|---------|
| `app/admin/` | Next.js routes (do not move — URLs must stay) |
| `app/api/admin/` | Admin API routes |
| `features/admin-panel/components/` | **Canonical** admin UI (dashboard, CRM, shell, drawers) |
| `components/admin/` | Thin re-exports → `features/admin-panel/components/` (legacy import path) |
| `lib/admin/` | Auth, sessions, CRM stores, server helpers |
| `app/admin/admin.css` | Scoped admin styles (`.admin-root`) |

## Import rules

Prefer new imports from the feature folder:

```js
import { AdminShell } from "@/features/admin-panel/components/admin-shell";
```

Legacy path still works:

```js
import { AdminShell } from "@/components/admin/admin-shell";
```

Do **not** import admin components from public pages (except `PublicUploadForm` on `/upload/[token]`).

## Test after changes

- `/admin/login`
- `/admin` (dashboard must not freeze on loading)
- `/api/admin/health`
- `/api/admin/stats`
