# AnimalBox Long Improvement Loop

## Objective

Improve AnimalBox as a mobile-first 2D box-garden/idler prototype, focusing on visual coherence, placement clarity, touch flow, game-loop guidance, and strict QA.

## Current Constraints

- The built-in Goal tracks the current autonomous improvement loop; this file is the persistent task ledger.
- Continue the pixel PNG replacement direction; do not return to DragonBones in this loop.
- GitHub push and Cloudflare Pages deploy are in scope after stable milestones.
- Stop before paid monetization, external database adoption, destructive cleanup, or a large character-design decision.
- Preserve unrelated untracked art/reference candidates unless directly needed.

## Priority Backlog

### P0 Visual Breakage

- [x] Verify local and Cloudflare mobile screens are nonblank and image assets decode before screenshots.
- [ ] Keep the island size stable across background/theme changes.
- [x] Prevent placement UI, bottom nav, and decor ghosts from appearing in the sky or under fixed controls.
- [ ] Keep degu/background/decor scale consistent enough that the garden reads as one pixel-art system.

### P1 UI And Touch Flow

- [x] Add a compact home guide so the player understands the next useful actions without a tutorial wall.
- [x] Make gift/gacha buttons resistant to rapid repeated taps during reveal animation.
- [x] Make placement status clearer: selected item, valid spot count, confirm state, undo/move affordance.
- [x] Keep lower menus reopen/close behavior predictable and avoid panel/nav interference.

### P2 Game-Loop Guidance

- [x] Surface the loop from tap coins -> care/level -> tickets -> gifts -> unlocks.
- [x] Show unlock progress for animals, poses, themes, floating items, and accessories.
- [x] Improve inventory/store/market affordances so locked/owned/tradeable states are understandable.
- [x] Add tests or QA coverage for any new progression routing.

### P3 Polish And Feedback

- [ ] Add useful micro-feedback for tap, placement, undo, level/ticket claim, and gift reveal states.
- [x] Stress-test filled island layouts and ugly inventory states.
- [ ] Consider more runtime assets only after layout and scale QA stays green.

## First Milestone

1. Audit the current `App.tsx`, CSS, game modules, and QA scripts for the quickest high-impact improvement.
2. Implement a small guide/quest rail for first-run comprehension.
3. Add gacha reveal tap locking or disabled-state feedback.
4. Improve placement selected-item and Undo affordances.
5. Extend existing QA scripts where the new behavior is cheap to assert.
6. Run narrow checks, then broaden to the full required gate set.

## Verification Plan

- `npm run typecheck`
- `npm test -- --run`
- `npm run qa:assets`
- `npm run qa:customization`
- `npm run qa:flow`
- `npm run qa:ui`
- `npm run qa:motion`
- `npm run qa:placement`
- `npm run qa:dense-placement`
- `npm run build`
- `npm run qa:visual`

## Progress Log

- in_progress: Created this long-session improvement ledger and started the first milestone.
- completed: Added a compact Home guide rail for Tap, Care, Decor, and Gift next actions.
- completed: Added a gacha reveal lock so gift buttons disable during the opening animation.
- completed: Improved placement clarity by showing selected decor name/footprint in the placement header and disabling Undo when there is no placed decor.
- completed: Added flow QA coverage for the Home guide rail and placement title, plus motion QA coverage for gacha reveal button locking and empty-placement Undo disabled state.
- completed: Tuned the Home progression panel bottom offset so the new guide does not collide with the degu, placed decor, or bottom nav across mobile QA viewports.
- completed: Local QA passed: `npm run typecheck`, `npm test -- --run`, `npm run qa:assets`, `npm run qa:customization`, `npm run qa:flow`, `npm run qa:ui`, `npm run qa:motion`, `npm run qa:placement`, `npm run qa:dense-placement`, `npm run build`, and `npm run qa:visual`.
- completed: Committed and pushed `4c187ac Improve guide flow and placement affordances` to GitHub `main`.
- completed: Deployed Cloudflare Pages at `https://d33bd139.animalbox.pages.dev`.
- completed: Live-smoked Cloudflare Pages: HTTP 200 for deployment and production URLs, `ANIMALBOX_PRODUCTION_URL=https://d33bd139.animalbox.pages.dev npm run qa:visual`, and `ANIMALBOX_QA_URL=https://d33bd139.animalbox.pages.dev npm run qa:flow`.
- completed: Added Storage Collection progress cards for themes, colors, poses, animals, decor, and items.
- completed: Added a local Market exchange that spends duplicate shards for earned tickets without adding paid monetization or an external database.
- completed: Updated QA coverage for Collection cards, Market offers, and the shard-to-ticket exchange.
- completed: Local QA passed for the second loop: `npm run typecheck`, `npm test -- --run`, `npm run qa:assets`, `npm run qa:customization`, `npm run qa:flow`, `npm run qa:ui`, `npm run qa:motion`, `npm run qa:placement`, `npm run qa:dense-placement` after a parallel-run retry, `npm run build`, and `npm run qa:visual`.
- completed: Short-screen Storage screenshot review moved Market above Collection so exchange cards are visible in the first viewport.
- note: In-app Browser smoke was attempted, but the Browser runtime path was unavailable in the current Node REPL; Playwright screenshots and QA scripts were used as the fallback rendered evidence.
- completed: Checked primary placement/touch references for the next placement direction: MDN/W3C Pointer Events for unified touch/mouse input, Apple/Android drag-and-drop docs for clear drag/drop affordances, and Unity Grid Snapping docs for visible configurable grid/snap behavior.
- completed: Committed and pushed `d42d953 Add collection progress and market exchange` to GitHub `main`.
- completed: Deployed Cloudflare Pages at `https://1cb71b22.animalbox.pages.dev`.
- completed: Live-smoked Cloudflare Pages: HTTP 200 for deployment and production URLs, `ANIMALBOX_PRODUCTION_URL=https://1cb71b22.animalbox.pages.dev npm run qa:visual`, and `ANIMALBOX_QA_URL=https://1cb71b22.animalbox.pages.dev npm run qa:flow`.
- completed: Checked current primary references for map/tile direction: Tiled JSON maps, Phaser Tilemap, PixiJS pointer events, MDN/W3C Pointer Events. Kept the React/Vite stack and adapted the data model instead of adding a runtime engine dependency.
- completed: Added a first-class 3-map model (`Sky Pasture`, `Clover Terrace`, `Moon Garden`) with level unlocks at Lv 1/3/6, while preserving legacy top-level `placedDecor` and `selectedBackgroundId` as the active-map mirror.
- completed: Changed placement from a 6x6 grid to a 12x8 dense grid, tightened scene safe bands and degu keepout, and tuned the placement sheet for short mobile screens.
- completed: Added Placement/Storage map switcher chips with locked-state affordances and QA coverage.
- completed: Strengthened dense placement QA from 8 decor to 16 decor across 7 backgrounds and 3 viewports.
- completed: Local QA passed for the map/tile loop: `npm run typecheck`, `npm test -- --run`, `npm run qa:assets`, `npm run qa:customization`, `npm run qa:flow`, `npm run qa:ui`, `npm run qa:motion`, `npm run qa:placement`, `npm run qa:dense-placement`, `npm run build`, and `npm run qa:visual`.
