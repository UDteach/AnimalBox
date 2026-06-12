# AnimalBox Animal Expansion

## Goal

Add more unlockable small animals and stricter QA for dense island placement.

## Scope

- Add macaroni mouse, chinchilla, gerbil, hamster, and rabbit as unlockable animal choices.
- Keep generated source art in `assets/source/imagegen`.
- Promote runtime PNGs under `public/images/runtime`.
- Add more catalog/reward integration where low-risk.
- Add a dense placement QA that fills the island with valid items and checks visual collisions.
- Run existing QA gates plus the new stress QA.

## Guardrails

- Do not decide the final character-design direction globally.
- Do not add paid monetization.
- Do not introduce an external DB.
- Do not delete unrelated untracked source candidates.

## Progress

- completed: Generated an ImageGen animal source sheet.
- completed: Promoted animal sprites into runtime assets.
- completed: Generated and promoted an ImageGen decor source sheet.
- completed: Integrated new animal and decor IDs into content, gacha, storage, and QA seeds.
- completed: Added dense placement QA for 12-item island stress layouts.
- in_progress: Run QA and fix regressions.
