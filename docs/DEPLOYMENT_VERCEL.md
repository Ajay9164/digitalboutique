# Deploy Tailor to Vercel

> Do **not** deploy until local QA in [LOCAL_QA_CHECKLIST.md](LOCAL_QA_CHECKLIST.md) is complete.

## Prerequisites

- Repo connected to Vercel
- Node.js 20+ locally (`npm run build` already green)
- Local production smoke: `npm run build && npx next start -p 3001`

## Project settings

| Setting | Value |
|---------|--------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output | Default (no static export) |
| Install Command | `npm install` |
| Node | 20.x |

`npm run build` uses `next build --webpack` so **Serwist** emits `public/sw.js`. Do not switch production to Turbopack-only without re-validating the service worker.

## Headers

`vercel.json` already sets:

- `Permissions-Policy: camera=(self), microphone=()`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`

## Environment

No required secrets. Optional later: `NEXT_PUBLIC_APP_URL` for canonical URLs.

## HTTPS & camera

Vercel HTTPS enables Studio `getUserMedia`. Verify `/studio` on a real phone after deploy.

## Post-deploy PWA checklist

1. Manifest at `/manifest.webmanifest` — name, icons, `start_url` `/`, theme `#2F6F64`
2. Service Worker `sw.js` registered
3. Offline document fallback → `/~offline`
4. Install to home screen; splash uses `background_color` `#F7F9FB`
5. Smoke all routes: Learn, Measure, Studio, Drafts, Journal

## IndexedDB note

IndexedDB is **per origin**. Preview vs production domains do not share data.

## Rollback

Redeploy a previous deployment from the Vercel dashboard. Keep Dexie version chains additive ([INDEXEDDB.md](INDEXEDDB.md)).
