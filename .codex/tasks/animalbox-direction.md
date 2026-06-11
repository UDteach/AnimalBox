# AnimalBox Direction Ledger

## Current Goal

Decide the initial direction for AnimalBox: a smartphone-first 2D idle boxed-garden game centered on degus, coins, tapping, floating-island customization, placeable assets, dress-up, animation, free in-game-currency gacha, and ImageGen-based art.

## Locked Direction

- Repository name: `AnimalBox`; package/app slug: `animalbox`.
- Target shape: portrait smartphone-first web/PWA game, with desktop treated as a preview/debug layout.
- Monetization: no paid gacha. Gacha uses only earned in-game coins/tickets.
- Core loop: idle coin income, tap coin bursts, spend coins on island upgrades, decor placement, degu color/outfit unlocks, and free gacha pulls.
- Setting: heavenly floating island garden with grass/pasture patches, clouds, soft gold accents, and swappable terrain/decor.
- Main animal: degu first, with real-ish color variants such as agouti, blue-gray, sandy, cream/white patch.
- Visual production: all initial art comes from ImageGen, then gets processed into runtime PNG sprites, sprite sheets, terrain tiles, decor icons, and UI assets with prompt/provenance records.

## Recommended Stack

- App shell: React + Vite + TypeScript.
- Game canvas: Phaser, embedded under React with a small bridge for state/events.
- UI panels: React for coin bar, shop, gacha, wardrobe, inventory, placement menu, settings.
- State: plain TypeScript domain modules plus Zustand for UI/game bridge.
- Save data: localStorage for first prototype; Dexie/IndexedDB once inventory, placement data, and gacha history expand.
- Mobile delivery: PWA first; add Capacitor later only if native store packaging, notifications, haptics, or app-store distribution become necessary.
- Tests: Vitest for economy, gacha, save migration, and placement rules.

## MVP Feature Slice

- Island screen with animated sky/floating island background.
- One degu actor with idle/walk/tap-reaction animations and 3-4 color variants.
- Coin system: offline-ish idle tick, visible coin counter, tap-to-earn with coin pop animation.
- Placement mode: drag or tap-place a small set of decor assets onto allowed island slots/grid cells.
- Wardrobe: apply one accessory layer such as hat/cape/ribbon.
- Gacha: coin/ticket-based banner that unlocks decor/outfits/color variants; duplicates convert to a small in-game shard currency.
- Mobile UX: bottom nav, large tap targets, safe-area-aware bottom controls, one-thumb-friendly primary actions, modal sheets instead of desktop dialogs.

## Open Follow-Up

- Decide whether the first playable prototype should prioritize placement editing or gacha/wardrobe.
- Verify Phaser 4 vs Phaser 3.90 before scaffold if implementation starts.
- If real-money currency is ever reconsidered, treat it as a new product decision and run a separate policy/legal pass first.
