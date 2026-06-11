# AnimalBox Tech Stack Research Brief

## Question

AnimalBox should be a smartphone-first 2D idle garden game with degus, coin income, tap income, heavenly floating-island customization, placeable assets, dress-up, animation, and free in-game-currency gacha. Which OSS stack best supports a fast MVP and later growth?

## Bottom Line

Use React + Vite + TypeScript for the app shell and mobile UI, with Phaser 4 for the game canvas. Keep economy, gacha, placement, and wardrobe logic in plain TypeScript modules. Persist locally with Dexie when save data becomes larger than simple localStorage. Ship as a PWA first; add Capacitor only when native app distribution or device APIs are actually needed.

## Findings

- Phaser is the best initial game engine fit: it is an open-source HTML5 game framework with WebGL/Canvas rendering, TypeScript support, React/framework support, scenes, input, animations, tilemaps, particles, tweens, texture atlases, and official templates.
- Phaser 4 is appropriate for a greenfield project because the official React TypeScript template targets the modern React/Vite bridge. Keep Phaser 3.90 as a fallback if plugin/API compatibility becomes a concrete blocker.
- PixiJS is excellent for rendering and layered sprites; it is a strong fallback if AnimalBox becomes more of an interactive dollhouse/editor than a game. Its Container/Sprite model maps well to dress-up layers, but more gameplay scaffolding would be manual.
- Excalibur is friendly and TypeScript-first, but Phaser has broader official templates and more built-in game subsystems for this scope.
- Godot, Flutter Flame, Cocos Creator, and Defold are valid 2D options. They are better if native mobile or engine editor workflows dominate. For a fast Codex/web/PWA iteration loop, React + Phaser is lighter.
- For placement authoring, Tiled and LDtk are both valid. For a floating island with free object placement, start with a custom JSON placement model in-game; add Tiled/LDtk later for prebuilt island layouts if the authored maps get large.
- Avoid Spine for the first MVP unless a paid Spine workflow is intentionally chosen. DragonBonesJS is MIT but appears older; for v1, use sprite-sheet/tween animation and layered accessory sprites.
- Rive/Lottie can help with polished UI effects, but they are not the primary runtime for pixel-style animal sprites. Use Phaser tweens and sprite sheets first.
- Zustand is a good lightweight UI/game state bridge for React. Dexie is appropriate once save data has inventory, placed objects, gacha history, and multiple islands.
- Free gacha does not need a heavy OSS dependency. Implement weighted tables, stamp/guarantee counters, duplicate conversion, and local history in TypeScript. Use `crypto.getRandomValues()` for live browser randomness and seeded PRNG only for deterministic tests.
- OSS character creator projects such as hackrew are useful as design references for layered transparent PNG parts, render order, and optional color modes. Do not copy assets; reuse the architecture idea.

## Implications For This Task

- Repo name: GitHub repo can be `AnimalBox`; package/app id should be lower-case `animalbox`.
- Suggested scaffold: Vite React TS app, Phaser installed as a dependency, React overlay panels for shop/free-gacha/wardrobe/settings, Phaser scene for island, animals, coins, placement previews, drag/tap placement, and animation.
- Data model should be content-driven from day one: `animals`, `colorVariants`, `outfits`, `decorItems`, `gachaBanners`, `saveState`.
- Asset pipeline should store ImageGen prompt/provenance next to assets, then process into transparent PNG sprites/sheets before runtime use.
- Mobile UI should use bottom sheets, bottom nav, safe-area padding, large touch targets, and tap-select-then-place as the primary placement interaction.

## Risks / Unknowns

- Phaser 4 has newer API/migration surface. If early implementation hits repeated API breakage, switch to Phaser 3.90 rather than losing momentum.
- Paid gacha is out of scope. If real-money currency is ever reconsidered, platform policy and legal/regulatory review becomes a separate required pass.
- ImageGen assets need deterministic cleanup: runtime sprites should not depend on unsliced concept sheets.

## Sources

- Phaser repository and docs: https://github.com/phaserjs/phaser, https://docs.phaser.io/phaser/getting-started/project-templates
- Phaser React TypeScript template: https://github.com/phaserjs/template-react-ts
- PixiJS docs and Pixi React: https://pixijs.com/, https://github.com/pixijs/pixi-react
- Excalibur.js: https://excaliburjs.com/
- Godot docs: https://docs.godotengine.org/
- Flutter Flame docs: https://docs.flame-engine.org/
- Capacitor docs: https://capacitorjs.com/docs
- Vite PWA plugin docs: https://vite-pwa-org.netlify.app/
- LDtk: https://ldtk.io/
- Tiled: https://doc.mapeditor.org/en/stable/manual/introduction/, https://github.com/mapeditor/tiled
- DragonBonesJS: https://github.com/DragonBones/DragonBonesJS
- Dexie: https://dexie.org/
- Zustand: https://github.com/pmndrs/zustand
- Vitest: https://vitest.dev/
- seedrandom: https://github.com/davidbau/seedrandom
- MDN Crypto getRandomValues: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
- howler.js: https://howlerjs.com/
- hackrew: https://github.com/ksadov/hackrew
