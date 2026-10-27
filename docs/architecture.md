# Architecture

## Goals that drive the design

1. **Works offline after one visit.** Every page is static HTML/JS/CSS, so the whole app can be stored on the device.
2. **Learning logic is separate from the UI.** Answer checking, the simulation and scoring are plain TypeScript with unit tests. They can be inspected and reused for research without reading React code.
3. **No server and no personal data.** Progress lives in the browser's IndexedDB.

## Stack

| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | Next.js 16 (App Router) with `output: "export"` | Static files are easy to precache and host anywhere |
| Language | TypeScript, `strict` | Explicit contracts between layers |
| Styling | Tailwind CSS v4, tokens in `src/app/globals.css` | Nature palette in one place |
| Icons | lucide-react | Recognisable, accessible SVG icons |
| Storage | IndexedDB via `idb` | Durable, offline, larger than localStorage |
| Offline | Hand-written service worker generated at build time | No plugin lock-in; full control of cache versioning |
| Tests | Vitest, fake-indexeddb | Fast unit tests for all logic |

## Layers

```text
src/
├── app/                 Routes (pages) only: compose components, no business logic
├── components/          Presentational and interactive React components
│   ├── layout/          Header, connection/offline status
│   └── dashboard/       Dashboard sections
├── hooks/               React adapters over lib/ (online status, service worker, progress)
├── data/                Content: organisms, food chains, modules (to be reviewed by researchers)
├── types/               Domain types shared by all layers
└── lib/                 Framework-independent logic
    ├── ecology/         FoodWeb graph (validation, trophic levels), energy pyramid (10% rule)
    ├── activities/      Placement board state machine, answer evaluation, classification rounds
    ├── assessment/      Quiz questions, grading, quiz session
    ├── simulation/      Ecosystem model, simulation engine, scenarios
    ├── progress/        Points and achievement rules
    ├── storage/         ProgressRepository (IndexedDB + in-memory fallback)
    └── offline/         Service worker registration and update flow
scripts/                 Build-time tools (service worker generation, icons)
```

Dependencies only point downward: `app → components → hooks → lib → types`. `lib` never imports React.

## Activities

Every drag-and-drop activity uses one pure state machine (`lib/activities/placement-board.ts`). Dragging, tap-to-select then tap-to-place, and keyboard selection all call the same functions, so all input methods follow identical rules. Evaluators (`evaluation.ts`) return per-item feedback (`correct`, `incorrect`, `missing`) and a score; the UI turns that into icons, text and colour.

## Simulation model

A four-level food chain (plants → herbivores → carnivores → top predators) plus a detritus loop (dead matter → decomposers → nutrients that help plants grow). Equations are classic predator–prey forms:

- Plants grow in proportion to sunlight and nutrients, limited by crowding.
- Each consumer gains a fixed share (assimilation efficiency) of what it eats. The rest is lost as heat/life processes or becomes waste.
- Every animal group has natural deaths and crowding deaths, which keep the system stable.
- Dead organisms and waste become dead matter, which decomposers break down.
- Populations below a threshold count as locally extinct and do not return.

Integration uses fourth-order Runge–Kutta with a fixed step. The "balanced ecosystem" is the steady state under normal sunlight, which forms an upright pyramid. Each teaching scenario lists the outcome it teaches, and `scenarios.test.ts` checks the model really produces it. If parameters change, those tests catch any scenario that stops matching its explanation. The student-facing list of simplifications is `MODEL_ASSUMPTIONS`.

The energy pyramid visual uses `computeEnergyPyramid`, which applies a fixed transfer efficiency (10% by default) and labels it as a simplification.

## Offline design

- `npm run build` runs `next build`, then `scripts/generate-precache-manifest.mjs`. The script lists every exported file, hashes their contents into a build version, and writes `out/sw.js` from `scripts/sw-template.js`.
- **Install:** every file of the build goes into `eco-simulink-precache-<version>`.
- **Fetch:** build files are served cache-first (so all pages come from the same build); other same-origin GETs use the network with cache fallback; unknown pages offline get the not-found page.
- **Update:** a new build installs in the background. The header shows "New version ready"; the student chooses when to switch. Old caches are then deleted. IndexedDB (progress) is never touched.
- `sw.js` is served with `no-cache` so updates are detected promptly (`vercel.json`).
- Precache budget: 25 MB, enforced at build time.

## Data and privacy

- `ProgressRepository` stores lesson completions and attempt records (activity id, score, timestamps). No names or identifiers.
- Schema changes must be additive IndexedDB upgrades, so app updates never wipe progress.
- If IndexedDB is unavailable (some private-browsing modes) an in-memory repository is used and the dashboard warns that progress will not be kept.
- The browser is asked for persistent storage to reduce eviction on low-storage phones.

## Security

- No backend, no authentication, no external requests at runtime (fonts are self-hosted at build).
- `vercel.json` sets a strict Content-Security-Policy (`'self'` only; `'unsafe-inline'` scripts are required by Next.js static export), `X-Frame-Options: DENY`, `nosniff`, a referrer policy and a restrictive permissions policy.
- All student input that reaches logic (simulation controls, answers, stored records) is validated and clamped in `lib/`.
