# Installation Guide

## Prerequisites

- **Node.js** 20.x or newer (LTS recommended)
- **npm** 10+ (ships with Node)
- A modern Chromium / Safari / Firefox browser
- For Studio camera: **HTTPS or localhost**, and a device webcam

## Install

```bash
cd Tailor
npm install
```

If peer dependency warnings appear, the repo uses `.npmrc` with `legacy-peer-deps=true` for known React ecosystem peers. Prefer fixing peers over forcing when upgrading packages.

## Verify install

```bash
npm run lint
npm test
npm run build
```

All three should succeed before you rely on the app for QA.

## Optional global tools

Not required for Tailor itself:

- Git (version control)
- Vercel CLI (`npm i -g vercel`) — only when you choose to deploy

## Platform notes

| Platform | Notes |
|----------|--------|
| Windows | Use PowerShell or cmd; prefer `npm run …` scripts |
| macOS / Linux | Standard bash/zsh |
| Mobile device testing | Use the same LAN IP with `next dev -H 0.0.0.0` (see Local Development) — camera still needs secure context |
