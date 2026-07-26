# Local Development Guide

## Start the app

```bash
npm run dev
```

Default URL: `http://localhost:3000`

Service worker is **disabled in development** (`@serwist/next` `disable` + `register: false` when `NODE_ENV === "development"`) so Turbopack hot reload never drives precaching. Test PWA install / offline on a **production** build (`npm run build && npm run start`). Production SW uses `cleanupOutdatedCaches` and soft-fails missing precache URLs so a single 404 cannot abort install.

## Project conventions

- App Router pages live under `src/app`
- Feature UI under `src/features/<domain>`
- Shared shell under `src/components`
- IndexedDB schema in `src/lib/db/index.ts`
- Read Next.js docs in `node_modules/next/dist/docs/` before changing framework APIs
- Follow `.cursorrules` for premium / a11y / offline quality

## Common tasks

| Task | How |
|------|-----|
| Clear local data | DevTools → Application → IndexedDB → delete `tailor` |
| Unregister SW | Application → Service Workers → Unregister (after prod tests) |
| Theme | Header sun/moon toggle (`next-themes`) |
| Typecheck | Covered by `npm run build` / IDE |

## Debugging hydration

- Theme uses `suppressHydrationWarning` on `<html>` and `useMounted` on the toggle — expected.
- Prefer client components for IndexedDB / camera / WebGL / Konva.
- Avoid reading `window` during SSR; use effects or `useSyncExternalStore`.

## LAN testing on a phone

```bash
npx next dev -H 0.0.0.0 -p 3000
```

Open `http://<your-lan-ip>:3000`. Camera may be blocked on non-HTTPS LAN origins — use a tunnel (e.g. Cloudflare Tunnel) or production HTTPS for full Studio QA.

## Production parity locally

```bash
npm run build
npm run start
```

Then run the [Local QA Checklist](LOCAL_QA_CHECKLIST.md).
