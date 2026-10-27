# Eco-Simulink

An interactive, offline-capable web app that teaches Grade 7 students about energy flow in ecosystems: producers, consumers and decomposers, food chains and food webs, trophic levels, and ecological pyramids. Built for an undergraduate thesis project.

> **Status:** working prototype. All modules work end to end, online and offline: dashboard, five lessons, three drag-and-drop activities (with tap and keyboard alternatives), the Ecosystem Lab simulation, the Energy Pyramid explorer, the quiz, and the progress page. The visual design is an interim one until the researchers' mockups arrive, and all content is a draft pending their review. See [docs/requirements.md](docs/requirements.md) for the feature checklist and the open questions.

## Requirements

- Node.js 20.9 or newer (22 recommended)
- npm 10 or newer

## Getting started

```bash
npm ci
npm run dev        # http://localhost:3000 (service worker disabled in development)
```

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Development server |
| `npm run build` | Static export to `out/` and service worker generation |
| `npm start` | Serves `out/` locally to try offline mode (`npm run build` first) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Route type generation and TypeScript check |
| `npm test` | Unit tests (Vitest) |
| `node scripts/generate-icons.mjs` | Regenerates PWA icons from `assets/*.svg` |

## Trying offline mode locally

1. `npm run build && npm start`
2. Open the printed `http://localhost` URL and wait for **Saved for offline use** in the header.
3. In browser DevTools, set the network to *Offline* and reload. The app still loads.

Service workers only run on HTTPS or `localhost`.

## Deployment (Vercel)

1. Import the repository in Vercel. No environment variables are needed.
2. `vercel.json` already sets everything: the site is deployed as plain static files from `out/` (framework preset off), so the generated service worker is served. Do not switch the preset back to Next.js, or `sw.js` will be missing and offline mode will not work.
3. It also sets security headers and keeps `sw.js` uncached so updates reach students.

Any static host works: upload the contents of `out/` and serve it over HTTPS, with `sw.js` sent as `Cache-Control: no-cache`.

## Documentation

- [Requirements and feature checklist](docs/requirements.md)
- [Architecture](docs/architecture.md)

## Privacy

There are no accounts and no server. Progress is stored only in the browser on the student's device and is removed if the browser's site data is cleared.
