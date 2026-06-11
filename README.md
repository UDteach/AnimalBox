# AnimalBox

Smartphone-first idle boxed-garden prototype starring degus.

This prototype is moving from full-screen mockups into separate ImageGen runtime parts: swappable island backgrounds, placeable decor, wardrobe overlays, UI currency icons, and a free earned-ticket Sky Gift machine. The current degu is only a candidate placeholder until the final character direction is selected.

AnimalBox intentionally has no paid gacha. Any gift/capsule flow uses only earned in-game tickets or coins.

## Stack

- React + Vite + TypeScript
- Vitest for economy, gacha, storage, and placement logic
- ImageGen-generated runtime backgrounds, decor, wardrobe, machine, and UI assets
- Cloudflare Pages static deployment

## Commands

```powershell
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
```

## Runtime Assets

- Background themes: `public/images/runtime/backgrounds/`
- Decor: `public/images/runtime/decor/`
- Wardrobe parts: `public/images/runtime/wardrobe/`
- UI icons and degu candidate: `public/images/runtime/ui/`
- Machine assets: `public/images/runtime/machines/`
- Provenance manifest: `assets/manifests/imagegen-runtime-assets.json`

The original mobile mockups remain under `public/images/mockups/` as visual references, not runtime UI.

## Product Docs

- Requirements: `docs/animalbox-avatar-garden-requirements.md`
- Technical design: `docs/animalbox-mobile-technical-design.md`
- ImageGen asset plan: `docs/animalbox-imagegen-asset-plan.md`

## Deployment

Build output is `dist`.

```powershell
npm run build
npx wrangler pages deploy dist --project-name animalbox --branch main
```
