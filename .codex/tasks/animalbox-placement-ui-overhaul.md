# AnimalBox Placement UI Overhaul

## Goal

Replace the current cramped placement UI with a production-feeling mobile edit workbench, verify it visually on iPhone-sized screens, deploy to Cloudflare, then commit and push the intended changes.

## Status

- completed: External reference pass and attached iPhone screenshot review.
- completed: PlacementPanel structure/CSS overhaul.
- completed: Local Playwright/iOS-style screenshot review and QA.
- completed: Cloudflare redeploy and public URL verification.
- completed: Commit and push intended scope.

## Design Direction

- Keep the island/canvas visually primary.
- Convert the lower sheet into an edit workbench: selected decor inspector, movement pad, big Place action, compact map shelf, compact item shelf, secondary tools.
- Keep D-pad visible on Pro Max without a giant floating panel.
- Do not change save schema, economy, gacha, or placement rules.

## Evidence

- User-provided iPhone Safari screenshot: `/tmp/codex-remote-attachments/019ec590-155f-7de3-974a-0c010b1bd785/3456CE6F-31E8-4B2B-B36A-6FF84BC18D62/1-写真1.jpg`.
- Research brief: `.research/placement-ui-overhaul/brief.md`.
- Local visual contact sheet: `output/playwright/visual-polish-audit/contact-sheet.png`.
- Local placement screenshots: `output/playwright/placement-ui-overhaul-local-r4/iphone-pro-max-430x932__placement.png`, `output/playwright/placement-ui-overhaul-local-r4/short-320x568__placement.png`.
- Cloudflare preview URL: `https://d9a5747b.animalbox.pages.dev`.
- Production alias checked: `https://animalbox.pages.dev`.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run qa:ui:smoke`
- `npm run qa:placement`
- `npm run qa:ui`
- `ANIMALBOX_PRODUCTION_URL=http://127.0.0.1:5173 npm run qa:visual`
- `npm run build`
- `ANIMALBOX_LOCAL_URL=https://d9a5747b.animalbox.pages.dev ANIMALBOX_PRODUCTION_URL=https://d9a5747b.animalbox.pages.dev npm run qa:visual`
