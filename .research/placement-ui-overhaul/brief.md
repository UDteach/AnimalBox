# Placement UI Overhaul Research Brief

## Question

How should AnimalBox's mobile placement editor be reorganized so it feels closer to polished decorating games while staying usable on iPhone-sized Safari?

## Bottom Line

Use a dedicated edit workbench instead of stacking equal-weight panels. Keep the island visible, make the selected item and primary "Place" action obvious, keep movement controls always reachable, and treat map/item selection as supporting shelves.

## Findings

- Pocket Camp Complete positions decorating and furniture collection as a core product promise: collect furniture, design a campsite/cabin/camper, and enjoy seasonal/event content.
- Hay Day's official messaging around edit mode emphasizes layout editing, active layouts, and a tighter relationship between edit mode and the decoration shop.
- The Sims FreePlay's official description emphasizes building homes and choosing furniture/decorations/layouts as the creation loop.
- Township and similar town builders market a broad build/decorate surface, but their useful lesson for AnimalBox is a clear separation between canvas and item catalog.

## Implications For This Task

- The canvas should read first. Grid/cell affordances should support placement without becoming the dominant visual texture.
- The selected decor needs an inspector-like card with image, size, map/cell, and availability.
- The D-pad should be part of the edit tool cluster, not a large floating object competing with the island.
- "Place" should be the dominant action. Cancel, undo, and rotate are secondary.
- Map chips and item inventory should be compact, horizontally scannable shelves.

## Risks / Unknowns

- iOS Safari chrome and Google account overlays can cover the app after login prompts; app UI cannot fully control those browser overlays.
- The repo currently contains many pre-existing uncommitted generated asset/catalog changes, so the final commit scope needs care.

## Self-Check

The current screenshot fails mostly from information hierarchy, not missing controls: everything is visible, but too many controls have equal weight. The redesign should make the next action obvious at a glance and reduce canvas occlusion.

## Sources

- Animal Crossing: Pocket Camp Complete official site: https://ac-pocketcamp.com/en-US
- Animal Crossing: Pocket Camp Complete Google Play listing: https://play.google.com/store/apps/details?id=com.nintendo.zasa&hl=en_US
- Hay Day official edit mode support: https://support.supercell.com/hay-day/en/articles/edit-mode.html
- Hay Day App Store listing: https://apps.apple.com/us/app/hay-day/id506627515
- The Sims FreePlay official page: https://www.ea.com/games/the-sims/the-sims-freeplay
- Township App Store listing: https://apps.apple.com/us/app/township/id638689075
