# Public website zone

**Owner:** All visitor-facing routes except `/admin/*`

## Physical layout

| Path | Purpose |
|------|---------|
| `app/` | Public route files (homepage, contact, destinations, guides, etc.) |
| `features/public-site/components/` | Public-only components (e.g. widget gate) |
| `components/home/` | Homepage sections |
| `components/site-*` | Header, footer, shell |
| `components/immigration-news/` | News hub UI |
| `components/tools/` | Public calculators |
| `components/seo/` | SEO helpers |
| `public/` | Static assets, `sw.js`, scripts |

## Import rules

```js
import { PublicSiteWidgetsGate } from "@/features/public-site/components/public-site-widgets-gate";
// or legacy:
import { PublicSiteWidgetsGate } from "@/components/public-site-widgets-gate";
```

Public marketing widgets are gated in `app/layout.js` so they **do not mount on `/admin`**.

## Test after changes

- `/` homepage
- `/contact`
- `/assessment`
- `/destinations/australia`
- `/skilled-migration` (sample service page)
- Mobile menu / header
