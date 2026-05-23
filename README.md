# MinRosh Migration Next.js Portal

MinRosh Migration is now a clean Next.js 15 App Router project with:

- a premium executive-style landing experience
- a multi-step visa quiz
- pathway and services sections
- success stories and contact capture
- a Gemini-powered assistant endpoint
- Nodemailer-powered internal and thank-you emails

## Stack

- Next.js 15 App Router
- React 19
- Nodemailer
- Local JSON-backed content

## Active project structure

- `app/`: routes, metadata, API handlers, and global styling
- `components/`: interactive UI such as the portal experience
- `data/`: active site content and updates
- `lib/`: shared quiz and contact logic
- `public/`: images, brochure, and static assets
- `scripts/`: local verification scripts

## Local development

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` before using email or chat features.

## Checks

```bash
npm run check
```

This runs the production build and the contact-save test.

Production dependency audit (transitive advisories only; not devDependencies):

```bash
npm run audit:production
```

As of 2026-05-23: **2 moderate** (`qs`, `ws` via googleapis and other transitive deps). `npm audit fix` may bump minors when upstream allows.

## Cleanup commands

After confirming the Next.js app is working, remove the old static-site files:

```bash
rm -f index.html server.mjs
rm -rf css js
```

PowerShell equivalent:

```powershell
Remove-Item index.html, server.mjs -Force
Remove-Item css, js -Recurse -Force
```

## Production deploy

On the server:

```bash
cd ~/minrosh-migration
git fetch origin
git reset --hard origin/main
npm install
npm run build
pm2 restart minrosh-next || pm2 start ecosystem.config.js
pm2 save
```

## PM2 startup

```bash
pm2 startup
pm2 save
```

Then run the `sudo` command PM2 prints and reboot once to verify.

## Important files

- `app/page.js`: homepage route
- `components/home-page-content.jsx`: homepage sections (quiz, pathways, services, stories) and hash navigation
- `components/site-shell.js`: global header, footer, and public page chrome
- `app/globals.css`: shared design system
- `app/api/contact/route.js`: contact endpoint
- `app/api/chat/route.js`: assistant endpoint
- `app/api/news/route.js`: updates endpoint
- `lib/contact.js`: enquiry persistence and email sending
- `data/site.json`: business content
- `data/news.json`: updates content

## Notes

- `data-enquiries.json` is runtime data and is intentionally ignored in Git.
- `ecosystem.config.js` is the production PM2 entrypoint.
- `next.config.mjs` is configured for a standalone production build and does not need legacy static-server settings.
