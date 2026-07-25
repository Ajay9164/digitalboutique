# Application Architecture

## Overview

Tailor is a client-heavy, offline-first Next.js App Router PWA. All learner data stays in the browser (Dexie → IndexedDB). There is no required backend.

```
Browser
├── App Shell (header, nav, FAB, theme, install banner)
├── Feature routes (lazy heavy islands)
├── Zustand stores (UI + domain hydrate)
├── Dexie (tailor DB v7+)
└── Serwist service worker (production only)
```

## Routing

- `(app)` layout wraps Learn, Measurements, Studio, Drafts, Journal with `AppShell`
- Root `error.tsx` / `loading.tsx` + `(app)/error.tsx` for recovery
- `/~offline` precached for document navigations when offline

## Data flow

```
User action → feature component → Zustand action
  → Dexie write
  → optional learning ecosystem recordActivity / recordPracticeAttempt
  → Learn hub snapshot refresh (focus / hydrate)
```

## Performance islands

| Island | Strategy |
|--------|----------|
| R3F mannequin | `next/dynamic` `ssr: false` + skeleton |
| Konva draft board | dynamic + ssr false |
| Recharts | dynamic on Learn |
| Draft modes | dynamic per tab |
| jsPDF | dynamic `import()` on PDF export |

`experimental.optimizePackageImports` covers `lucide-react`, `recharts`, `@react-three/drei`, `framer-motion`.

## Resilience

- Route error boundaries
- `FeatureErrorBoundary` around WebGL / charts / camera / draft modes
- Camera permission UX with clear denied / unsupported / HTTPS states

## Theming

- CSS variables (teal atelier) in `globals.css`
- `glass-panel` utility for glassmorphism
- Reduced-motion CSS + Framer Motion guards
