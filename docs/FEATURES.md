# Feature Documentation

## Learning Journey (`/` · `/journey`)

Guided Tailor Academy — 8 sequential stages from foundations to a complete blouse project.

- Dashboard: current lesson, progress %, completed lessons, next recommended, practice score, recent activity, badges, ETA, Continue Learning
- Modes: Beginner / Intermediate / Advanced + Free explore
- Voice-ready narration (opt-in)
- Soft guide banners on Measure / Studio / Drafts / Journal
- See [GUIDED_LEARNING.md](GUIDED_LEARNING.md)

## Progress hub (`/progress`)

- Skill progress meters, learning %, daily streak
- Achievements, timeline, completed lessons, practice history
- Recharts (lazy-loaded) weekly XP + practice scores
- Premium onboarding + milestone celebrations
- Data: Dexie `learningProfile`, `learningActivity`, `achievements`, `practiceHistory`

## Measurements (`/measurements`)

- Interactive R3F mannequin with orbit / zoom / pan
- Region tap → learning card (technique, tip, illustration)
- Unit toggle in/cm; progress persisted in `learning`
- Records activity into the Learn ecosystem

## Studio (`/studio`)

- Camera permission on user gesture (not auto-start)
- Rear / front flip, freeze frame, save to IndexedDB
- Pattern library overlays with scale, rotate, opacity
- Alignment grid, measurement ruler, snap controls
- Photos stored as JPEG data URLs in `studioPhotos`

## Drafts (`/drafts`)

| Mode | Capability |
|------|------------|
| Lesson | Animated SVG construction steps |
| Practice | Randomized formula quiz |
| Engine | RHF+Zod chart → auto-calcs → Konva board |

Engine board: zoom, pan, grid, snap, undo/redo, PNG/PDF (lazy jsPDF), print layout. Modes are code-split.

## Journal (`/journal`)

- Create / edit / delete projects
- Search, sort, pattern / fabric / draft filters
- Full-screen viewer
- Export JSON backup; **Import merge** or **Import replace**
- Persistence via Dexie `projects` (survives refresh / restart / offline)

## Shared product shell

- Glass bottom nav + header theme toggle
- Skip link, page transitions, skeletons, feature error boundaries
- PWA install banner when `beforeinstallprompt` fires
- Offline page `/~offline` precached by Serwist
