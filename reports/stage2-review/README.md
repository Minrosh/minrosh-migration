# Stage 2 homepage preview captures

Committed thumbnails:

- `home-mobile-390-tools-section.png` — planning tools band at 390px width  
- `home-mobile-390-client-feedback-section.png` — client feedback band at 390px width  

Full-length homepage screenshots (`*-fullpage.png`) are **gitignored** (large binaries). Regenerate locally after `npm run build`:

```bash
PORT=4174 HOSTNAME=127.0.0.1 node .next/standalone/server.js &
PREVIEW_URL=http://127.0.0.1:4174 node scripts/stage2-preview-screenshots.mjs
```

Stop the server when finished.
