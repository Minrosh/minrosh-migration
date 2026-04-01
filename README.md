# MinRosh Migration Next.js Portal

This project is the Next.js version of the MinRosh Migration website. It combines:

- a premium landing experience
- a 2026-style preliminary points calculator
- PR pathway guidance
- WhatsApp lead capture
- contact form saving to disk
- automated thank-you/internal email support with Nodemailer
- an AI chat endpoint backed by OpenAI

## Tech stack

- Next.js App Router
- React 19
- Nodemailer
- Local JSON-backed content and enquiry storage

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in the values you need.

3. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production checks

Run both the production build and the contact-save test:

```bash
npm run check
```

## Production deploy on your server

1. Pull the latest code from GitHub.
2. Install packages.
3. Build the app.
4. Restart PM2.

```bash
git pull origin main
npm install
npm run build
pm2 restart minrosh-next || pm2 start ecosystem.config.js
pm2 save
```

## PM2 startup after reboot

```bash
pm2 startup
pm2 save
```

Then run the command PM2 prints with `sudo`, and reboot once to verify.

## Recommended GitHub workflow

On your coding machine:

```bash
git add .
git commit -m "Describe the update"
git push origin main
```

On your Ubuntu server:

```bash
git pull origin main
npm install
npm run build
pm2 restart minrosh-next
pm2 save
```

If your server is connected to GitHub through an auto-deploy flow, the pull step can be replaced by that deployment hook.

## Important files

- `app/page.js`: homepage entry
- `components/portal-page.js`: main interactive UI
- `app/globals.css`: shared design system and layout
- `app/api/contact/route.js`: contact submission API
- `app/api/chat/route.js`: AI assistant endpoint
- `lib/contact.js`: enquiry saving and email logic
- `data/site.json`: shared site content

## Notes

- `index.html`, `server.mjs`, `css/`, and `js/` are legacy files from the older static version and are no longer the active runtime path.
- Enquiries are saved to `data-enquiries.json` unless overridden with `ENQUIRIES_FILE`.
