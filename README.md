# Tailor

Premium offline-first Progressive Web App for atelier learning — measurements, fabric studio, drafting, journal, and a full learning ecosystem.

**Status:** production-ready for local verification. Deploy when your checklist passes (see docs).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production smoke:

```bash
npm run build
npm run start
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development (SW disabled) |
| `npm run build` | Production build + Serwist SW (`--webpack`) |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit + component + IndexedDB tests |
| `npm run test:watch` | Vitest watch mode |

## Documentation

| Doc | Description |
|-----|-------------|
| [Installation Guide](docs/INSTALLATION.md) | Prerequisites & setup |
| [Local Development Guide](docs/LOCAL_DEVELOPMENT.md) | Dev workflow & debugging |
| [Vercel Deployment Guide](docs/DEPLOYMENT_VERCEL.md) | Production deploy (when ready) |
| [Folder Structure](docs/FOLDER_STRUCTURE.md) | Source layout |
| [Application Architecture](docs/ARCHITECTURE.md) | Data flow & islands |
| [Feature Documentation](docs/FEATURES.md) | Per-route capabilities |
| [Local QA Checklist](docs/LOCAL_QA_CHECKLIST.md) | PWA, camera, drafts, 3D, a11y |
| [Guided Learning Mode](docs/GUIDED_LEARNING.md) | 8-stage academy journey |
| [IndexedDB](docs/INDEXEDDB.md) | Schema & migrations |
| [Accessibility](docs/ACCESSIBILITY.md) | WCAG / Lighthouse notes |

## Stack

Next.js 16 · TypeScript · Tailwind v4 · shadcn/ui · Framer Motion · Zustand · Dexie · Serwist · R3F · Konva · Recharts · RHF + Zod

## Routes

| Path | Feature |
|------|---------|
| `/` | Guided Learning Journey (academy) |
| `/journey` | Journey dashboard (alias) |
| `/journey/[stage]/[lesson]` | Lesson player |
| `/progress` | XP, streaks, achievements, charts |
| `/measurements` | 3D measurement lessons |
| `/studio` | Camera + pattern overlay |
| `/drafts` | Lesson / practice / drafting engine |
| `/journal` | Projects + backup |
| `/~offline` | Offline fallback |

## Quality gates (verified locally)

- `npm install` — OK  
- `npm run lint` — 0 errors  
- `npm test` — 14 passing  
- `npm run build` — OK (Serwist SW emitted)  
- Production `npm run start` — smoke-test routes below before deploy  

Product rules: [`.cursorrules`](.cursorrules)
