# AnimalBox Mobile Technical Design

## Product Direction

AnimalBox is a smartphone-first portrait 2D idle garden game. The first version is free-to-play without paid gacha. Players earn coins passively and by tapping degus, then spend earned coins/tickets on island decor, degu colors, outfits, and free gacha banners.

The product target is closer to a cozy avatar garden app than a pure idle clicker. Background themes, island decor, wardrobe parts, and companion state should be separate runtime assets so the player can customize the scene over time.

## Recommended Stack

- Runtime: React + Vite + TypeScript.
- Current rig spike: PixiJS 8 + `pixi-dragonbones-runtime` 8 in the wardrobe screen to validate bone-following outfits.
- Game/UI split: React renders top/bottom HUD, bottom sheets, wardrobe, inventory, settings, and gacha screens. The animal/island renderer can be PixiJS + DragonBones if the spike holds up, or Phaser if broader scene/game primitives become more important.
- Mobile delivery: PWA first with `vite-plugin-pwa`; add Capacitor later only for app-store packaging, haptics, notifications, or native share features.
- State: plain TypeScript domain modules for economy/gacha/placement; Zustand for React-to-game state bridge.
- Persistence: localStorage only for a tiny prototype; Dexie/IndexedDB for real save data, inventory, placement records, gacha history, and migrations.
- Assets: ImageGen sources, local cleanup, sprite atlas packing, then DragonBones/Pixi or Phaser atlas import. Use Free Texture Packer or a local max-rects packer for early atlas generation.
- Testing: Vitest for gacha weights, pity/stamp behavior, duplicate conversion, placement overlap, offline income, save migration, and deterministic seeded simulations.

## Renderer Direction

The original plan favored Phaser because it has scene, input, depth sorting, atlas, and animation primitives. The DragonBones spike tests a narrower but important question first: whether AnimalBox can make wardrobe items follow a degu rig naturally in a web/PWA build.

Phaser remains a good option for broader island gameplay:

- `Container` for one degu actor composed from layered sprites.
- `Layer` and depth sorting for placed objects on the island.
- frame animations for degu idle/walk/tap reactions.
- unified pointer input for touch and mouse.
- `ScaleManager` for portrait canvas scaling.
- texture atlas and spritesheet support for mobile draw-call control.

PixiJS + DragonBones is the better near-term candidate for the avatar renderer if the wardrobe workflow matters more than general game-scene features. Avoid depending on niche plugins until the first playable prototype is stable.

## Dress-Up Implementation

Use rig or layered composition, not pre-rendered combinations. The current wardrobe prototype uses PixiJS + DragonBones rig v2 with separated body/head/ear/tail/paw/foot parts and DragonBones-style `ske/tex` JSON files. The Phaser container contract below remains the fallback/general game-scene shape if the project moves away from DragonBones.

`DeguActor` is a Phaser `Container` with fixed child order:

1. `shadow`
2. `backAccessory`
3. `body`
4. `bodyPatchOrFurOverlay`
5. `neckAccessory`
6. `headAccessory`
7. `frontFx`

Each child is a Phaser Sprite. The container owns position, scale, bobbing, tap bounce, and depth. The body sprite plays the current animation. Accessory sprites do not need one full sheet per body color; instead each accessory has an anchor preset and small per-animation offset table.

Data contract:

```ts
type DeguAnimation = 'idle' | 'walk' | 'tapHappy' | 'sleep';
type OutfitSlot = 'head' | 'neck' | 'back' | 'face';

interface DeguVariant {
  id: string;
  label: string;
  baseAtlasKey: string;
  colorSwatch: string;
  patchOverlayKey?: string;
  unlockSource: 'starter' | 'coin_shop' | 'free_gacha';
}

interface OutfitItem {
  id: string;
  slot: OutfitSlot;
  atlasKey: string;
  defaultFrame: string;
  rarity: 'common' | 'rare' | 'special';
  zLayer: 'behind_body' | 'front_body';
  anchorPreset: string;
  unlockSource: 'coin_shop' | 'free_gacha' | 'event';
}

interface EquippedOutfit {
  head?: string;
  neck?: string;
  back?: string;
  face?: string;
}
```

Color strategy:

- V0: generate one high-quality agouti animation set, then generate 3-4 color reference images. Produce color variants by scripted recolor/multiply masks and manual QA. This follows the same principle as open character creator projects that keep parts as transparent PNG layers and optionally generate color variants from templates.
- V1: if recolor quality is weak, generate full body sheets for each color variant, but keep accessories separate.

This avoids `body colors x outfit items x animation frames` exploding into hundreds of duplicated images.

## Placement Implementation

Use logical anchor cells rather than a full tile editor in V0.

The island owns a `PlacementGrid` with isometric-looking anchors. Players choose a decor item from a React bottom sheet; Phaser shows a semi-transparent ghost sprite under the finger; release/tap confirms if the footprint is valid.

Data contract:

```ts
type PlacementLayer = 'ground' | 'small_decor' | 'large_decor' | 'habitat';

interface DecorItem {
  id: string;
  category: 'nature' | 'care' | 'furniture' | 'celestial' | 'production';
  atlasKey: string;
  footprint: { w: number; h: number };
  placementLayer: PlacementLayer;
  coinBonusPerMinute?: number;
  comfortBonus?: number;
  unlockSource: 'starter' | 'coin_shop' | 'free_gacha';
}

interface PlacedDecor {
  instanceId: string;
  itemId: string;
  cellX: number;
  cellY: number;
  rotation?: 0 | 90 | 180 | 270;
}
```

Rules:

- `ground` tiles can stack below objects.
- `small_decor` and `large_decor` block their footprint.
- Depth is sorted by `cellY`, then category offset.
- Mobile UX is tap-select then tap-place first; drag is optional polish.
- Save only logical placements, not pixels.

## Background Theme Implementation

V0 uses full-screen ImageGen background themes. Each theme is a runtime PNG with provenance and a saved `selectedBackgroundId`.

Data contract:

```ts
interface BackgroundTheme {
  id: string;
  label: string;
  src: string;
  swatch: string;
  mood: 'day' | 'morning' | 'night';
  unlockSource: 'starter' | 'free_gift' | 'event';
}
```

Rules:

- Do not bake placed decor, HUD, gacha UI, or the degu into a background.
- Keep backgrounds UI-free and character-free.
- V1 should split theme composition into `sky`, `islandGround`, `foregroundFrame`, and `ambientFx` parts so the player can mix and match more like room/garden customization apps.
- Save selected theme ids, not image URLs, so future asset migrations can remap them.

## Free Gacha Implementation

No paid currency. The gacha consumes earned coins or earned tickets only.

Implement in local TypeScript, not as a heavy dependency:

- `BannerPool` lists item ids, rarity, weight, duplicate conversion, and optional guaranteed rare interval.
- live pulls use `crypto.getRandomValues()` for browser randomness.
- tests use seeded PRNG so rate simulations are repeatable.
- history logs the last N pulls locally for UX and debugging.

Data contract:

```ts
interface GachaEntry {
  rewardId: string;
  rewardType: 'decor' | 'outfit' | 'degu_variant' | 'currency';
  rarity: 'common' | 'rare' | 'special';
  weight: number;
  duplicateShardValue: number;
}

interface GachaBanner {
  id: string;
  cost: { currency: 'coins' | 'tickets'; amount: number };
  entries: GachaEntry[];
  guaranteedRareEvery?: number;
}
```

For UX, call it a "cloud capsule" or "sky gift" rather than emphasizing gambling. Show earned currency only, clear rarity rates, and duplicate conversion.

## ImageGen Production Plan

Generate concept/mock assets separately from runtime assets. Do not slice runtime sprites from UI mockups.

Current prototype rule: runtime screens should use ImageGen part assets under `public/images/runtime/`; mockups under `public/images/mockups/` are visual references only.

### Current Mock Batch

- 4 mobile screen mockups:
  - home/island/tap coins
  - placement mode
  - wardrobe/dress-up
  - free gacha

### First Runtime Batch

Total: 92 ImageGen source images before local processing.

- Degu body: 22 images
  - idle 6 frames
  - walk 8 frames
  - tapHappy 4 frames
  - sleep 4 frames
- Degu color references: 4 images
  - agouti, blue-gray, sandy, cream/white patch
- Outfit overlays: 16 images
  - head 6, neck 4, back 4, face 2
- Decor items: 24 images
  - hay bed, water bowl, fence, clover patch, flower patch, cloud lamp, angel fountain, windmill, pasture tile object, snack tray, tunnel, small bridge, cloud bench, sign, tiny shrine, seed pot, grass mound, rock, star lantern, wardrobe rack, toy wheel, sand bath, wooden gate, coin totem
- Terrain/island pieces: 12 images
  - grass tile, pasture tile, path tile, cloud edge, cliff edge, flower edge, water edge, stone step, soft dirt, clover ground, celestial tile, empty placement marker
- UI/game icons: 14 images
  - coin, ticket, shard, shop, wardrobe, decor, gacha, settings, confirm, cancel, rotate, storage, color swatch frame, info

### Second Runtime Batch

Add after the playable loop works:

- more degu species/poses: 24-40 images
- seasonal island skins: 20-30 images
- more outfits: 30-50 images
- gacha reveal effects and card frames: 12-20 images

## Source Notes

- Phaser release/download: https://phaser.io/download/release/v4.1.0
- Phaser project templates: https://docs.phaser.io/phaser/getting-started/project-templates
- Phaser React TypeScript template: https://github.com/phaserjs/template-react-ts
- Phaser GitHub releases: https://github.com/phaserjs/phaser/releases
- PixiJS docs: https://pixijs.com/
- Pixi React: https://github.com/pixijs/pixi-react
- hackrew OSS character creator reference: https://github.com/ksadov/hackrew
- Zustand: https://github.com/pmndrs/zustand
- Dexie: https://dexie.org/
- Vite PWA plugin: https://vite-pwa-org.netlify.app/
- Capacitor: https://capacitorjs.com/docs
- MDN `crypto.getRandomValues()`: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
