# AnimalBox Long Improvement Loop

## Objective

Improve AnimalBox as a mobile-first 2D box-garden/idler prototype, focusing on visual coherence, placement clarity, touch flow, game-loop guidance, and strict QA.

## Current Constraints

- The built-in Goal is occupied by an old blocked DragonBones task, so this file is the active long-session ledger.
- Continue the pixel PNG replacement direction; do not return to DragonBones in this loop.
- GitHub push and Cloudflare Pages deploy are in scope after stable milestones.
- Stop before paid monetization, external database adoption, destructive cleanup, or a large character-design decision.
- Preserve unrelated untracked art/reference candidates unless directly needed.

## Priority Backlog

### P0 Visual Breakage

- [ ] Verify local and Cloudflare mobile screens are nonblank and image assets decode before screenshots.
- [ ] Keep the island size stable across background/theme changes.
- [ ] Prevent placement UI, bottom nav, and decor ghosts from appearing in the sky or under fixed controls.
- [ ] Keep degu/background/decor scale consistent enough that the garden reads as one pixel-art system.

### P1 UI And Touch Flow

- [x] Add a compact home guide so the player understands the next useful actions without a tutorial wall.
- [x] Make gift/gacha buttons resistant to rapid repeated taps during reveal animation.
- [x] Make placement status clearer: selected item, valid spot count, confirm state, undo/move affordance.
- [ ] Keep lower menus reopen/close behavior predictable and avoid panel/nav interference.

### P2 Game-Loop Guidance

- [ ] Surface the loop from tap coins -> care/level -> tickets -> gifts -> unlocks.
- [ ] Show unlock progress for animals, poses, themes, floating items, and accessories.
- [ ] Improve inventory/store/market affordances so locked/owned/tradeable states are understandable.
- [ ] Add tests or QA coverage for any new progression routing.

### P3 Polish And Feedback

- [ ] Add useful micro-feedback for tap, placement, undo, level/ticket claim, and gift reveal states.
- [ ] Stress-test filled island layouts and ugly inventory states.
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
- in_progress: Commit, push, deploy, and live-smoke Cloudflare Pages.
