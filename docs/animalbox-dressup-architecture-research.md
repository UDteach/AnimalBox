# AnimalBox Dress-Up Architecture Research

## What Public Cocone Sources Reveal

The exact Pokecolo production architecture is proprietary, but Cocone has published enough engineering notes to infer the relevant design principles.

### Pokecolo Lineage

- Pokecolo has a long-running Cocos2d-x lineage. Cocone described the production codebase as Cocos2d-x v2 based, with custom item/UI file formats and direct OpenGL rendering work that made major engine migration expensive.
- Cocone's client development article shows a custom resource-loading layer around Cocos2d-x/C++11, including resource cache and symbol extraction concepts.
- Pokecolo Twin moved from the older Cocos2d-x base toward Unity and a dedicated `P2 CCP Engine` for Character Coordinating Play.

### Pokecolo Twin Avatar Composition

Public articles describe Pokecolo Twin as Unity + Anima2D with avatar internals organized around bones and meshes:

- The avatar body has a simple lower-body bone setup, while face-related customization has many bones for user-adjustable position/scale and animation control.
- Fashion items include bones with the same names as base avatar bones. When an item is equipped, matching names are attached together.
- Items can also contain item-specific free bones for spring motion and animation.
- Mesh rendering uses color replacement and multi-layering. Hair and eyes can include fixed highlight layers plus recolorable gradient layers.
- Eye parts can use up to four layers, and multi-layering avoids exploding the number of meshes across eyes, patterns, and layers.

### Asset Delivery And Performance

- Cocone notes that dress-up apps may layer 10, 20, or 30 textures, so texture memory is a major concern on mobile.
- Pokecolo Twin fetches master data at startup and downloads/caches images only when needed.
- Their asset bundle notes emphasize corruption checks, redownload paths, and keeping individual files reasonably small.

## Inference For AnimalBox

AnimalBox should not try to clone Cocone's private engine, but the architectural lesson is clear:

1. Dress-up should be data-driven, not hardcoded by CSS classes.
2. Each item needs a slot, conflict rule, anchor, scale, z-layer, and optional per-animation offsets.
3. The base animal should expose stable attachment anchors even before a full bone system exists.
4. Color variants should avoid full combinatorial image generation when possible; use masks/recolor or palette mapping for body colors.
5. V0 can render layered PNGs in React, but V1 should move the animal to a small renderer layer that supports anchors, transforms, masks, and animation frames.

## AnimalBox V0 Contract

Use an `OutfitItem` contract like:

```ts
interface OutfitItem {
  id: string;
  label: string;
  slot: 'head' | 'neck' | 'back' | 'face';
  rarity: 'common' | 'rare' | 'special';
  src: string;
  anchor: {
    x: number;
    y: number;
    w: number;
    z: number;
  };
}
```

Rules:

- One equipped item per slot in V0.
- The item anchor is expressed in percentages inside the companion stage.
- Back items render behind the body; head/face/neck items render in front.
- The final degu design is not locked yet, so anchors are provisional and must be re-QA'd after character selection.
- Any generated outfit should include a clean alpha source, stable padding, and no baked body parts.

## V1 Target

Once the degu design is chosen, replace the simple stage anchors with a real companion rig:

- `body`, `head`, `earL`, `earR`, `face`, `neck`, `back`, `tail` anchors.
- Per-animation offset table: `idle`, `tapHappy`, `sleep`, `walk`.
- Optional masks for items that must go behind ears, behind body, or in front of face.
- Palette/recolor mask for degu colors.
- Contact-sheet QA for every outfit on every body color.

## Stack Options For Natural Dress-Up

## OSS / Source-Available Comparison

| Technology | License / openness | Web fit | Natural dress-up fit | AnimalBox fit |
| --- | --- | --- | --- | --- |
| DragonBones / DragonBonesJS | MIT-style runtime, older OSS ecosystem | High | Medium-high: bones, mesh, FFD, IK, armature slots | Best OSS-first candidate; verify maintenance before adopting |
| Spine runtimes | Source-available under Spine license, not strict OSS | Medium-high | High: skins, slots, attachments, mesh/clipping, proven workflow | Best quality candidate if license is acceptable |
| PixiJS | MIT | High | Low alone; needs a rig/animation layer | Good renderer, not a wardrobe system by itself |
| Phaser | MIT | High | Low alone; needs Spine/DragonBones or custom rig layer | Good game scene/input layer |
| Godot 2D skeleton | MIT | Medium for Web export, low for React embed | Medium-high | Strong OSS-native engine option, but diverges from React/PWA stack |
| Rive runtime | Runtime is open, editor/workflow is product-led | High | Medium for stateful character motion, weaker for large item inventories | Better for UI animation than wardrobe infrastructure |
| Live2D Cubism Web | SDK framework is visible; Core has proprietary terms | Medium | High for expressive single character deformation | Heavy for many outfit items; license/tooling needs review |
| Universal LPC generator | GPL-3.0 plus mixed asset licenses | High | Low-medium: sprite-sheet layers, not rigged wardrobe | Useful reference for layer taxonomy, not final stack |
| hackrew / Picrew-like generators | MIT-style app examples | High | Low-medium: static layers | Useful reference for UI/inventory composition, not natural clothing motion |

### Best Fit For AnimalBox Web/PWA

Use Spine as the character rig format, rendered by either:

- `spine-phaser` if AnimalBox keeps Phaser as the game scene renderer.
- `@esotericsoftware/spine-pixi-v8` if AnimalBox uses PixiJS for the avatar/island renderer.

Reasoning:

- Spine has first-class concepts for bones, slots, attachments, mesh attachments, clipping, skins, and mix-and-match skins.
- This maps directly to the public Pokecolo Twin architecture: a base rig, item-specific bones, same-name attachments, and multi-layered colored meshes.
- Phaser/Spine keeps the existing React + Vite + TypeScript direction while allowing a real 2D rig inside the game scene.

Recommended AnimalBox stack if quality is prioritized and the Spine license is acceptable:

```text
React + Vite + TypeScript
Phaser scene for island/game input
spine-phaser for degu rig, animations, slots, and skins
Zustand or plain TS store for equipped items and save bridge
ImageGen source PNGs -> cleaned transparent parts -> Spine attachments/skins
```

Recommended AnimalBox stack if strict OSS is prioritized:

```text
React + Vite + TypeScript
PixiJS or Phaser for the island/game renderer
DragonBonesJS for degu armature, bones, slots, and item attachments
Plain TS save/equip data
ImageGen source PNGs -> cleaned transparent parts -> DragonBones slots/skins
```

### Native-App Alternative

Unity 2D Animation is the closest public analogue to Pokecolo Twin's Unity/Anima2D direction. Unity's current 2D Animation package supports rigging, Sprite Skin deformation, bone transforms, Sprite Library, and Sprite Resolver for runtime sprite swaps. This is a strong option if AnimalBox moves to a native Unity app, but it is heavier for the current Cloudflare-hosted web/PWA prototype.

### Not First Choice

- Live2D: excellent for expressive single-character face/body deformation, but less convenient for large mix-and-match item inventories unless every item is authored into the model workflow.
- Rive: good for UI/state-machine motion, weaker for raster-heavy avatar wardrobe inventories.
- DragonBones: historically relevant and MIT, but less attractive than Spine for current web runtimes and tooling polish.

## Why "Just Layers" Looks Wrong

A believable outfit needs the item to participate in the character rig:

- The hat follows head rotation and bobbing.
- Glasses follow face scale/position.
- A cape is behind the body but can have its own spring bones.
- Sleeves or clothing can partially hide body parts through clipping/masks.
- Hair/body/eyes can share color gradients through shader or palette replacement.
- Outfit items use slot conflict rules, not arbitrary stacking.

For the current degu candidate, the next practical step is to define provisional anchors and slot rules. After the user chooses the final degu design, produce a real rig with at least:

```text
root
body
head
ear_l / ear_r
face
neck
back
tail_base / tail_tip
front_paw_l / front_paw_r
```

Legs/feet only need separate bones if AnimalBox wants walk/sit animation where clothing or paws visibly move independently. For a cozy idle garden prototype, body + head + ears + tail + paws gives enough life without overbuilding.

## Sources

- Cocone Engineering, Pokecolo Twin CCP Engine: https://engineering.cocone.io/2020/08/06/ccpengine/
- Cocone Engineering, Pokecolo Twin avatar internals: https://engineering.cocone.io/2021/03/10/pokecolotwins_avatar/
- Cocone Engineering, Pokecolo client development: https://engineering.cocone.io/2021/05/13/pokecolo_client_development/
- Cocone Engineering, Pokecolo Cocos2d-x refactoring: https://engineering.cocone.io/2021/04/12/techtalk_vol1-2/
- Cocone Engineering, 2D mobile texture compression: https://engineering.cocone.io/2021/10/28/techtalk_vol4_2/
- Cocone Engineering, Pokecolo Twin asset corruption checks: https://engineering.cocone.io/2023/05/16/countermeasures-against-asset-damage-in-p2/
- Spine skins: https://en.esotericsoftware.com/spine-skins
- Spine attachments: https://en.esotericsoftware.com/spine-attachments
- Spine Phaser runtime: https://esotericsoftware.com/spine-phaser
- Spine PixiJS runtime: https://en.esotericsoftware.com/spine-pixi
- Unity 2D Animation Sprite Skin: https://docs.unity3d.com/Packages/com.unity.2d.animation%4010.1/manual/SpriteSkin.html
- Unity 2D Animation Sprite Swap: https://docs.unity3d.com/Packages/com.unity.2d.animation%4010.1/manual/SpriteSwapIntro.html
