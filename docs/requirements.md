# Requirements and Feature Checklist

Phase 1 output (requirement analysis). Source: the AI agent master prompt and project context supplied on 2026-10-27. **The researchers' mockups and detailed project brief have not been supplied yet**; when they arrive they become the source of truth and this checklist will be reconciled against them.

> **Update (prototype):** every module below now has a working screen built on an interim design by the development team. Content is draft; items marked ❓ still need researcher input before they are final.

Status key: ✅ done in this repository · 🟡 core logic done, UI pending · ⬜ not started · ❓ blocked on information

## 1. Platform and delivery

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| P-1 | Opens from a shareable HTTPS URL in a modern browser | 🟡 | Vercel project set up; preview deploys work. Public URL goes live when the prototype is merged to `main` |
| P-2 | Works on phones, tablets, laptops, desktops; no horizontal overflow | ✅ | Every page checked at 393 px (Pixel 5) and 1280 px |
| P-3 | Works offline after first load (PWA) | ✅ | Service worker precaches every build file; every page and the simulation verified offline in Chromium. Still to check on a real phone |
| P-4 | Shows online/offline status | ✅ | Header badge |
| P-5 | Shows whether the app is saved for offline use | ✅ | "Saved for offline use" badge |
| P-6 | Update detection and cache versioning without erasing progress | ✅ | Content-hashed cache per build; student accepts update; IndexedDB untouched |
| P-7 | Graceful handling of unavailable network requests | ✅ | Offline fallback page and 503 text response |
| P-8 | First-use instructions explaining offline limits | ✅ | Dashboard section "How to use the app without internet" |
| P-9 | No accounts, no backend, no PII | ✅ | All data stays on the device |

## 2. Module A: Learning dashboard

| ID | Requirement | Status |
|----|-------------|--------|
| A-1 | Welcome screen | ✅ (wording/design pending mockups) |
| A-2 | Module navigation | ✅ cards and header menu link to every module |
| A-3 | Completion indicators, progress, achievements | ✅ live from IndexedDB |
| A-4 | Instructions for using the app | ✅ offline guide; each activity explains drag, tap and keyboard use |
| A-5 | Offline availability indicator | ✅ |

## 3. Module B: Lessons

| ID | Lesson | Status |
|----|--------|--------|
| B-1 | Understanding ecosystems (living/nonliving, terrestrial/aquatic examples) | ✅ draft text ❓ needs content source and sign-off (Q-2, Q-14) |
| B-2 | Producers, consumers (primary/secondary/tertiary), decomposers | ✅ draft ❓ |
| B-3 | Food chains and food webs; arrows show energy direction | ✅ draft ❓ (includes a food web diagram) |
| B-4 | Energy flow and the 10% rule (as a simplified model) | ✅ draft ❓ (states that 10% is an approximation) |
| B-5 | Pyramids of numbers, biomass and energy | ✅ draft ❓ (mentions inverted pyramids) |
| B-6 | Mark lesson complete and store it | ✅ |

## 4. Module C: Drag-and-drop activities

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| C-1 | Build a food chain: draggable cards, drop zones, check, reset, score, feedback | ✅ | Sun is a fixed start, not a card |
| C-2 | Organise the food pyramid by trophic level, with explanations | ✅ | Decomposer slot beside the pyramid |
| C-3 | Classify organisms (producer → tertiary consumer, decomposer), randomised | ✅ | Each round names its chain |
| C-4 | Touch-friendly drag plus tap-to-select / tap-to-place and keyboard alternatives | ✅ | Mouse and touch drag (with edge auto-scroll), tap and keyboard verified |
| C-5 | Correctness shown with icons/text, not colour alone | ✅ | |
| C-6 | Attempts and scores saved | ✅ | |

## 5. Module D: Ecosystem simulation

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| D-1 | Sunlight, plants, herbivores, carnivores, top predators, decomposers | ✅ | `lib/simulation/model.ts` |
| D-2 | Scenarios: fewer plants, more herbivores, predators disappear, limited sunlight | ✅ | Plus "decomposers disappear"; each outcome is unit-tested |
| D-3 | Visual population changes and explanations | ✅ | Prediction step, live bars and line chart, per-group result and explanation |
| D-4 | Energy-flow visualisation decreasing by level | ✅ | Ecosystem Lab and the Energy Pyramid explorer |
| D-5 | Assumptions stated clearly | ✅ | Shown on the simulation page |

## 6. Module E: Assessment

| ID | Requirement | Status |
|----|-------------|--------|
| E-1 | Multiple choice, true/false, identification | ✅ |
| E-2 | Randomised order, immediate feedback with explanation | ✅ |
| E-3 | Score, results summary, retry | ✅ links to lessons to review |
| E-4 | Question bank | ✅ 20 draft questions, 10 per quiz ❓ needs researcher review (Q-7) |

## 7. Module F: Progress

| ID | Requirement | Status |
|----|-------------|--------|
| F-1 | Completed lessons/activities, quiz scores, points, attempts, achievements | ✅ |
| F-2 | Available offline and after refresh | ✅ IndexedDB, verified by tests |
| F-3 | Progress page | ✅ includes CSV download and erase |

## 8. Cross-cutting

| ID | Requirement | Status |
|----|-------------|--------|
| X-1 | Nature palette, rounded friendly UI, subtle motion, reduced-motion support | ✅ interim design until mockups arrive |
| X-2 | Keyboard access, screen-reader labels, readable sizes, 44 px touch targets | 🟡 built in; no formal WCAG audit yet (Q-12) |
| X-3 | Scientific accuracy review | ❓ needs researcher sign-off |
| X-4 | Unit tests for logic; CI runs lint, typecheck, tests, build | ✅ |
| X-5 | Deployment, documentation, QA checklist | 🟡 README and Vercel config done; production goes live on merge |

## 9. Content and accuracy issues found in the brief

1. **The example food chain has five organisms but the pyramid activity has four levels.** In Sun → Grass → Grasshopper → Frog → Snake → Eagle, the eagle is a *quaternary* consumer (fifth trophic level). Either the pyramid gets a fifth level, or the chain activity uses a four-organism chain. The code supports both.
2. **The Sun is an energy source, not an organism or trophic level.** The food-chain activity will show the Sun as a fixed starting point rather than a draggable card, unless the researchers prefer otherwise.
3. **Trophic level depends on the chain.** An eagle eating a mouse is a secondary consumer; eating a snake, it is tertiary or quaternary. Classification questions therefore name the chain.
4. **Decomposers are not a pyramid level.** They are shown beside the pyramid.
5. **The 10% rule is an approximation** (real transfer is roughly 5–20%). Lessons should say so.
6. **Pyramids of numbers and biomass can be inverted** (one tree feeding many insects; some aquatic biomass pyramids). Only the energy pyramid is always upright. Lesson 5 should mention this or deliberately limit itself to upright examples.
7. **Earthworms are detritivores**, often grouped with decomposers at Grade 7 level. Confirm the classification the curriculum expects.

## 10. Information needed from the researchers

| # | Question | Why it matters |
|---|----------|----------------|
| Q-1 | Mockups and the detailed project brief | Source of truth for screens, layout and flow |
| Q-2 | Curriculum and learning competencies to follow (for example DepEd codes) and the academic references to cite | Lesson scope, wording and citations; we will not invent any |
| Q-3 | Language: English only, Filipino, or both | Content and UI copy |
| Q-4 | Ecosystems and organisms to feature (generic grassland/pond, or local ones such as rice fields, mangroves, coral reefs) | Organism catalogue and illustrations |
| Q-5 | Pyramid depth: four levels, or five with a quaternary consumer (see issue 1) | Activities 1 and 2 |
| Q-6 | Research design: pre-test/post-test, exportable results (CSV), a teacher/researcher view, anonymous student codes | Adds separate modules; affects data model |
| Q-7 | Quiz questions: supplied by the researchers, or drafted by us for review? How many, and what passing score? | Assessment module |
| Q-8 | Illustrations: supplied artwork, or should we produce simple SVG illustrations? Licensing requirements? | Visual design and offline size |
| Q-9 | Points and badges scheme (current draft: 10 per lesson, up to 10 per activity from best score, 75% quiz pass) | Progress module |
| Q-10 | Custom domain, or the default `vercel.app` address? (Hosting is Vercel, free tier) | Public URL |
| Q-11 | Target devices: oldest phones/browsers to support; are devices shared between students? | Shared devices would need simple local profiles (nickname only) |
| Q-12 | Accessibility target (WCAG 2.1 AA assumed) | Acceptance criteria |
| Q-13 | Sound or narration? | Assets and offline size |
| Q-14 | Who writes and approves lesson text? | Accuracy sign-off |
