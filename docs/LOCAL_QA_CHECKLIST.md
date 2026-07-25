# Local QA Checklist

Run against **`npm run build && npm run start`** for PWA items. Feature UX can also be checked in `npm run dev` (except Service Worker).

## Environment gates

- [ ] `npm install`
- [ ] `npm run lint` (0 errors)
- [ ] `npm test` (all green)
- [ ] `npm run build`
- [ ] `npm run start` — open `/`, `/measurements`, `/studio`, `/drafts`, `/journal`, `/~offline`, `/manifest.webmanifest`

## PWA

- [ ] Manifest valid (`/manifest.webmanifest`): `start_url` `/`, icons 192/512, theme `#2F6F64`, background `#F7F9FB`
- [ ] Icons load; Apple touch icon present
- [ ] Production: Service Worker registers (`sw.js`)
- [ ] Offline: DevTools → Network → Offline → navigate; `/~offline` or cached shell loads
- [ ] Cached assets load after revisit
- [ ] Install banner / browser install prompt (Chromium, engagement heuristics)
- [ ] Standalone splash uses `background_color` / `theme_color`

## IndexedDB (Journal)

- [ ] Create project
- [ ] Update project
- [ ] Delete project
- [ ] Search + filters
- [ ] Export backup JSON
- [ ] Import merge
- [ ] Import replace (confirm dialog)
- [ ] Refresh page — data remains
- [ ] Close browser, reopen — data remains
- [ ] Offline — create/read still works

Automated coverage: `src/features/journal/lib/backup.test.ts`

## Camera / Studio

- [ ] Enable camera (permission prompt)
- [ ] Denied state messaging + retry
- [ ] Rear / front flip
- [ ] Freeze + save
- [ ] Pattern overlay visible
- [ ] Scale / rotation / opacity
- [ ] Grid + alignment tools

## Draft board (Engine)

- [ ] Drawing updates from measurements
- [ ] Zoom / pan
- [ ] Undo / redo
- [ ] Export PNG
- [ ] Export PDF
- [ ] Labels readable
- [ ] Resize viewport — board remains usable

## 3D Measurements

- [ ] Orbit / rotate / zoom / pan
- [ ] Body region highlight on select
- [ ] Learning panel updates
- [ ] Acceptable FPS on mid-range devices

## Responsive

Check at **320, 375, 390, 414, 768, 1024, 1280, 1440** px:

- [ ] No horizontal overflow
- [ ] Nav + FAB clear content
- [ ] Cards stack / grid appropriately
- [ ] Forms usable on small screens

## Accessibility

- [ ] Skip link → main
- [ ] Keyboard tab through controls
- [ ] Visible focus rings
- [ ] ARIA on tabs / progress / dialogs
- [ ] Contrast OK in light + dark
- [ ] `prefers-reduced-motion` reduces motion

## Performance (spot check)

- [ ] Learn charts load after skeleton
- [ ] Mannequin / Konva deferred (no huge initial JS block)
- [ ] Lighthouse mobile ≥ 95 target on production build (measure and record)
