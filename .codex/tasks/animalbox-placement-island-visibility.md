# AnimalBox Placement Island Visibility Fix

## Goal

Make the placement screen keep the island, active cells, degu, and decor ghost visible while editing on phone-sized screens.

## Status

- completed: Measure current placement visibility and overlap.
- completed: Reduce and relocate editing controls so they do not hide the island.
- completed: Add/strengthen QA for island visibility, not only control overlap.
- completed: Publish/commit the stable result.

## Constraints

- Do not change save schema, economy, gacha odds, or placement rules.
- Keep the existing `?screen=placement` QA path.
- Preserve unrelated untracked task/research files.

## Evidence

- User feedback: the island is cut off and not visible enough during placement.
- Before measurement: `output/playwright/placement-island-visibility-before/metrics.json`.
- After measurement: `output/playwright/placement-island-visibility-after-r4/short-568.png`.
- Visual QA contact sheet: `output/playwright/visual-polish-audit/contact-sheet.png`.
- Cloudflare preview URL: `https://5e86b391.animalbox.pages.dev`.
- Production alias checked: `https://animalbox.pages.dev`.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run qa:ui:smoke`
- `npm run qa:placement`
- `npm run qa:ui`
- `ANIMALBOX_PRODUCTION_URL=http://127.0.0.1:5173 npm run qa:visual`
- `npm run build`
- `ANIMALBOX_LOCAL_URL=https://5e86b391.animalbox.pages.dev ANIMALBOX_PRODUCTION_URL=https://5e86b391.animalbox.pages.dev npm run qa:visual`
