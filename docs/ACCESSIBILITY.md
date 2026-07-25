# Accessibility & Lighthouse targets

Target: **Lighthouse 95+** for Performance, Accessibility, Best Practices, and PWA on mobile.

## Built-in practices

- Skip link to `#main-content`
- Semantic landmarks, `aria-*` on tabs/progress
- Focusable controls; no `maximumScale` lock (WCAG 1.4.4)
- `prefers-reduced-motion` CSS + Framer Motion guards
- Meaningful empty / error / permission states
- Color tokens with teal primary on light/dark backgrounds

## Performance levers

- Code-split Three / Konva / Recharts / draft modes / jsPDF
- `experimental.optimizePackageImports`
- Route-level skeletons
- Serwist runtime caching + offline fallback
- AVIF/WebP configured for `next/image` (static assets)

## How to measure

1. `npm run build && npm start`
2. Chrome DevTools → Lighthouse → Mobile
3. Test Learn, Measurements, Studio (after granting camera), Drafts, Journal
4. Re-run with CPU 4× slowdown for a realistic mobile floor

## Known trade-offs

- First paint of 3D/WebGL and Konva is intentionally deferred; skeletons cover the wait.
- Studio photos as data URLs increase IndexedDB size — prune unused captures for best quota health.
