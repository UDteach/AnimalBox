# AnimalBox Avatar Garden Requirements

## Product Target

AnimalBox should feel closest to a cozy 2D avatar garden app: a small animal companion, a customizable floating island, dress-up, room/garden decoration, photo sharing, and light social visits. The reference direction is closer to Pokecolo than to a traditional idle clicker, while retaining idle coins and tap rewards as the low-friction game loop.

AnimalBox must not use paid gacha. Any capsule/gift mechanic consumes earned tickets, event points, or coins only.

## Research Sources

Primary and quasi-primary references checked for feature direction:

- Pokecolo official site: https://www.pokecolo.jp/
- Pokecolo App Store: https://apps.apple.com/jp/app/id451684733
- Pokecolo Google Play: https://play.google.com/store/apps/details?id=jp.cocone.pocketcolony
- Pokecolo help center: https://pokecolo.cocone.co.jp/hc/ja
- Pokecolo Twin official site: https://www.pokecolotwin.jp/
- Pokecolo Twin App Store: https://apps.apple.com/jp/app/id1475221397
- Pokecolo Twin Google Play: https://play.google.com/store/apps/details?id=jp.cocone.p2
- Pigg Party official site: https://lp.pigg-party.com/
- Pigg Party App Store: https://apps.apple.com/jp/app/id966099615
- Pigg Party Google Play: https://play.google.com/store/apps/details?id=jp.co.cyberagent.miami
- CyberAgent Pigg Party service news: https://www.cyberagent.co.jp/news/detail/id=33384
- Ameba Pigg official site: https://pigg.ameba.jp/

## Extracted Feature Categories

- Avatar/dress-up: body color, face, hair/accessory-like slots, outfit layers, saved looks.
- Garden/room customization: background, terrain, furniture/decor, placement mode, inventory.
- Companion care: animal affection, care props, idle reactions, tap reactions, simple needs.
- Collection loop: free gifts, login rewards, shop, craft/exchange, event rewards.
- Photo/social loop: screenshot mode, saved coordinates, visitable islands, comments/chat later.
- Safety/moderation: block, report, muted communication, age-aware social gates when online features exist.

## AnimalBox MVP Requirements

- Background themes:
  - Player can switch the island background from an inventory/customize panel.
  - Save data persists the selected background.
  - Background assets are ImageGen runtime PNGs with source provenance.
- Island decoration:
  - Player can choose a decor item and place it on an allowed cell.
  - Placement rejects out-of-bounds, overlap, and invalid footprints.
  - Placed decor appears as separate runtime image parts, not baked into the background.
- Degu/animal companion:
  - Current degu art is a candidate placeholder only.
  - Final degu design selection remains a separate user choice.
  - Tapping the companion gives coins and visual feedback.
- Dress-up:
  - Outfit assets are separate layers.
  - Player can toggle accessories and see them on the companion preview.
  - Slot conflicts should be handled in a later pass; V0 may allow simple stacking.
- Free reward loop:
  - Sky Gift uses earned tickets only.
  - Duplicates convert to shards.
  - No real-money purchase entry points, paid currency, or paid gacha copy.
- Mobile UX:
  - Portrait-first layout.
  - Bottom navigation.
  - One-thumb bottom sheets.
  - Large tap targets and no text overlap on 390px-wide phones.

## Next-Phase Requirements

- Theme composition split: sky, island ground, foreground frame, and ambient effect as separate swappable parts.
- Shop categories: backgrounds, terrain, decor, care items, outfits, color variants.
- Saved layouts: at least 3 island layout presets.
- Photo mode: hide HUD, pose companion, export/share a screenshot.
- Visit mode: view another player's island read-only.
- Social safety: report/block/mute before user-generated messages are enabled.
- Event loop: limited-time earned rewards, no paid capsule dependency.
- Companion behavior: idle walk, sleep, happy tap, care item reactions.

## Non-Goals

- No paid gacha.
- No cloning of existing app assets, item names, character designs, screen layouts, or branded terminology.
- No public chat or user-generated content before moderation requirements are implemented.
- No final degu design lock until the user chooses from candidates.

## Current Prototype Acceptance Criteria

- [ ] Runtime screen uses separate ImageGen background, decor, wardrobe, machine, and UI assets.
- [ ] User can switch between at least three background themes and the choice persists.
- [ ] User can place at least six decor parts on the island grid.
- [ ] User can tap the placeholder degu candidate for coins.
- [ ] User can toggle outfit parts in wardrobe.
- [ ] User can run the free earned-ticket Sky Gift.
- [ ] `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` pass.
- [ ] Mobile rendered QA shows no blank screen, framework overlay, or obvious overlap.
