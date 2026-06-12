# AnimalBox

Smartphone-first idle boxed-garden prototype starring degus.

This prototype is moving from full-screen mockups into separate ImageGen runtime parts: swappable island backgrounds, placeable decor, pixel degu sprite swapping, wardrobe overlays, UI currency icons, and a free earned-ticket Sky Gift machine. The current degu direction is the rounded side-view pixel style under `public/images/runtime/characters/pixel-degu/v5/`.

AnimalBox intentionally has no paid gacha. Any gift/capsule flow uses only earned in-game tickets or coins.

The active game loop is: tap the degu for coins and XP, collect idle coins, buy care upgrades, place decor for income, claim earned tickets from the ticket meter, open free Sky Gifts, then use rewards for background, color, and wardrobe customization.

Current unlock rules keep starter items available and lock the rest until free Sky Gift rewards are earned. Locked backgrounds, decor, colors, and wardrobe items remain visible as goals.

## Stack

- React + Vite + TypeScript
- 2D pixel sprite-swap prototype for the active degu preview
- Local-save idle progression, care upgrades, earned-ticket meter, decor income, and free-ticket gacha
- PixiJS + DragonBones remains only as an archived rigging proof-of-concept
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
- Pixel degu candidates: `public/images/runtime/characters/pixel-degu/v5/`
- UI icons and degu candidate: `public/images/runtime/ui/`
- Machine assets: `public/images/runtime/machines/`
- DragonBones prototype rig v2: `public/images/runtime/dragonbones/degu-v2/degu-v2_ske.json`, `degu-v2_tex.json`, and `degu-v2_tex.png`
- Provenance manifest: `assets/manifests/imagegen-runtime-assets.json`

The first large ImageGen expansion batch adds 24 runtime assets: 4 backgrounds, 8 decor items, 8 wardrobe overlays, and 4 UI icons. Batch 003 adds 8 more runtime items: 4 decor sprites and 4 wardrobe overlays. The project now tracks 64 ImageGen runtime assets in the provenance manifest.

The original mobile mockups remain under `public/images/mockups/` as visual references, not runtime UI.

## Product Docs

- Requirements: `docs/animalbox-avatar-garden-requirements.md`
- Technical design: `docs/animalbox-mobile-technical-design.md`
- Dress-up architecture research: `docs/animalbox-dressup-architecture-research.md`
- ImageGen asset plan: `docs/animalbox-imagegen-asset-plan.md`

## Deployment

Build output is `dist`.

```powershell
npm run build
npx wrangler pages deploy dist --project-name animalbox --branch main
```
