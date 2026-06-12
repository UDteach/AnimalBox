# UI Position 5-Loop QA

## Goal

Tighten AnimalBox mobile UI placement, size ratios, and missing user-facing controls through five measured visual QA loops.

## Acceptance

- Measure all main screens: home, placement, wardrobe, gacha, storage.
- Check mobile viewports including narrow and short screens.
- Detect overlap with bottom navigation, clipped panels, text overflow, missing tap targets, and degu/background size ratio drift.
- Add low-risk missing controls found from UI inventory.
- Pass unit, build, asset, customization, placement, and UI layout QA.
- Deploy to Cloudflare Pages and verify the live URL.

## Loop Log

- completed: Loop 1 - baseline full-screen UI coordinate audit found 483 failures across short/phone/large viewports.
- completed: Loop 2 - layout fixes reduced failures to zero after the `loop-2d-layout-fixes` pass.
- completed: Loop 3 - implemented missing visible controls: Settings opens Storage, placement rotation persists, Wardrobe Apply returns home, Gacha history uses labels, Storage presets can clear.
- completed: Loop 4 - strict mobile/background regression passed `loop-4d-zero-warning-static` with 140 scenarios and zero warnings; dynamic animation/overlap QA passed 14 scenarios.
- completed: Loop 5 - final full QA passed; ready for commit, push, and Cloudflare deploy.

## QA Artifacts

- `output/playwright/ui-layout-audit/loop-1-baseline/report.json`
- `output/playwright/ui-layout-audit/loop-2d-layout-fixes/report.json`
- `output/playwright/ui-layout-audit/loop-4d-zero-warning-static/report.json`
- `output/playwright/ui-layout-audit/loop-5-final-after-scene-safe/report.json`
- `output/playwright/interaction-motion-qa/report.json`
- `output/playwright/placement-fit-qa/metrics.json`

## Final QA

- passed: `npm test -- --run` - 45 tests.
- passed: `npm run qa:assets` - 64 runtime assets, 44 alpha checked.
- passed: `npm run qa:customization` - settings, rotate, wardrobe apply, gacha history, storage clear.
- passed: `npm run qa:ui` with `ANIMALBOX_QA_LOOP=loop-5-final-after-scene-safe` - 140 scenarios, zero warnings.
- passed: `npm run qa:motion` - 14 animation/overlap scenarios.
- passed: `npm run qa:placement` - 21 placement fit scenarios.
- passed: `npm run build`.
