# Eco-Simulink

An interactive, offline-capable web app that teaches Grade 7 students about energy flow in ecosystems: producers, consumers and decomposers, food chains and food webs, trophic levels, and ecological pyramids. Built for an undergraduate thesis project.

> **Status:** foundation stage. The learning logic (food web, simulation, activity and quiz engines, local progress) and the offline app shell are in place and tested. Lesson, activity, simulation and quiz screens will be built from the researchers' mockups. See [docs/requirements.md](docs/requirements.md) for the feature checklist and the open questions.

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

1. Import the repository in Vercel. The framework preset is detected as Next.js; no environment variables are needed.
2. Build command `npm run build`, output directory `out`.
3. `vercel.json` sets security headers and keeps `sw.js` uncached so updates reach students.

Any static host works: upload the contents of `out/` and serve it over HTTPS, with `sw.js` sent as `Cache-Control: no-cache`.

## Documentation

- [Requirements and feature checklist](docs/requirements.md)
- [Architecture](docs/architecture.md)

## Privacy

There are no accounts and no server. Progress is stored only in the browser on the student's device and is removed if the browser's site data is cleared.
