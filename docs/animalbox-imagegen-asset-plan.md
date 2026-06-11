# AnimalBox ImageGen Asset Plan

## Current Mockups

Already generated and saved:

| Purpose | File |
| --- | --- |
| Home / island / tap coins | `assets/mockups/mobile/home-island-tap-coins.png` |
| Placement mode | `assets/mockups/mobile/placement-mode.png` |
| Wardrobe / dress-up | `assets/mockups/mobile/wardrobe-dressup.png` |
| Free gacha | `assets/mockups/mobile/free-gacha.png` |

These are UI direction mockups only. Runtime sprites, tiles, and icons must be generated separately.

## Runtime Batch 1 Summary

Current prototype runtime assets are a smaller Batch 0.5, already promoted under `public/images/runtime/` with provenance in `assets/manifests/imagegen-runtime-assets.json`:

- 3 full-screen background themes: starter sky pasture, morning meadow, starlight night.
- 6 decor parts: hay bed, water bowl, clover patch, cloud lamp, angel fountain, windmill.
- 6 wardrobe parts: straw hat, flower crown, pastel ribbon, celestial cape, halo wings, round glasses.
- 1 Sky Gift machine.
- 2 UI currency icons: coin and sky ticket.
- 1 degu candidate placeholder, explicitly not final.

Batch 1 target: 92 ImageGen source images.

| Asset group | Count | Runtime target |
| --- | ---: | --- |
| Degu body animation frames | 22 | `512x512` source, processed to `192x192` or `256x256` atlas frames |
| Degu color references | 4 | reference sheets for recolor masks and QA |
| Outfit overlays | 16 | transparent overlay PNGs, slot-based |
| Decor items | 24 | transparent decor sprites, mostly `192x192` or `256x256` |
| Terrain/island pieces | 12 | `128x128`/`256x256` tiles and edge pieces |
| UI/game icons | 14 | `128x128` icon sources, downscaled to `64x64` and `96x96` |

## Degu Body Frames

Generate one isolated degu per image on a flat chroma-key background. Do not generate a sprite sheet directly.

| Animation | Frames | Notes |
| --- | ---: | --- |
| `idle` | 6 | breathing, ear twitch, tail micro movement |
| `walk` | 8 | short loop for wandering on the island |
| `tapHappy` | 4 | bounce/sparkle reaction after touch |
| `sleep` | 4 | curled or seated sleepy loop |

Initial color variant implementation should use recolor/mask processing from one master body set. If recolor QA fails, generate 22 additional body frames per color variant.

## Outfit Overlays

Accessories stay separate from body frames to avoid combinatorial explosion.

| Slot | Count | Examples |
| --- | ---: | --- |
| `head` | 6 | straw hat, flower crown, angel halo, cloud cap, leaf cap, star tiara |
| `neck` | 4 | pastel ribbon, star charm, tiny scarf, clover necklace |
| `back` | 4 | celestial cape, small wings, picnic blanket cape, leaf cape |
| `face` | 2 | round glasses, tiny cheek sticker |

Each item needs metadata:

- `slot`
- `zLayer`
- `defaultAnchor`
- optional `frameOffsets` for idle/walk/tap/sleep
- `rarity`
- `unlockSource`

## Decor Items

Generate 24 first-playable decor sprites:

1. hay bed
2. water bowl
3. short wooden fence
4. clover patch
5. flower patch
6. cloud lamp
7. angel fountain
8. small windmill
9. pasture grass bundle
10. snack tray
11. wooden tunnel
12. tiny bridge
13. cloud bench
14. wooden sign
15. tiny sky shrine
16. seed pot
17. grass mound
18. small rock
19. star lantern
20. wardrobe rack
21. toy wheel
22. sand bath
23. wooden gate
24. coin totem

Decor rules:

- source prompt asks for one object only
- flat chroma-key background
- no text, labels, shadows, floor plane, or neighbors
- final sprite includes transparent padding
- placement footprint is assigned in data, not inferred from pixels

## Terrain / Island Pieces

Generate 12 first-playable island pieces:

1. grass tile
2. pasture tile
3. dirt path tile
4. clover ground tile
5. flower edge tile
6. cloud edge tile
7. cliff edge tile
8. water edge tile
9. stone step
10. celestial floor tile
11. empty placement marker
12. soft shadow blob

For v0, terrain pieces can be decorative overlays rather than a full map editor. The playable placement system uses logical cells.

## Background Themes

Backgrounds are full-screen runtime PNGs in V0 and must remain UI-free, character-free, and decor-free except for fixed environmental framing.

Current themes:

1. `floating-island`: starter sky pasture.
2. `morning-pasture`: bright morning meadow.
3. `starlight-night`: night island with stars and lanterns.

V1 should split each theme into swappable `sky`, `islandGround`, `foregroundFrame`, and `ambientFx` layers. That will allow Pokecolo-like mix-and-match customization without regenerating one complete background for every combination.

## UI Icons

Generate 14 icon sources:

1. coin
2. ticket
3. shard
4. shop
5. wardrobe
6. decor placement
7. free gacha
8. settings
9. confirm
10. cancel
11. rotate
12. storage
13. color swatch frame
14. info

Icons should be generated large, then downscaled. Do not rely on ImageGen for readable text.

## Processing Contract

Every runtime asset should move through:

1. copy original ImageGen source to `assets/source/imagegen/...`
2. remove chroma-key into transparent PNG
3. crop/pad to target canvas
4. downscale with consistent filter
5. add to atlas or spritesheet
6. record prompt and processing metadata
7. inspect in a rendered mobile scene before accepting

## Naming Pattern

```text
assets/source/imagegen/<group>/<asset-id>__source.png
assets/runtime/<group>/<asset-id>.png
assets/runtime/atlases/<atlas-name>.png
assets/runtime/atlases/<atlas-name>.json
assets/manifests/imagegen-assets.json
```

Examples:

```text
assets/source/imagegen/degu/agouti_idle_00__source.png
assets/runtime/degu/agouti_idle_00.png
assets/runtime/outfits/head_straw_hat.png
assets/runtime/decor/cloud_lamp.png
```
