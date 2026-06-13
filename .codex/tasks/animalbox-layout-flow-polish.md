# AnimalBox Layout Flow Polish

## Goal

Research and improve AnimalBox mobile layout, navigation clarity, and core UI flow.

## Sources To Apply

- Apple handheld game UI guidance: flexible edge-anchored components, safe areas, legibility, larger touch controls, and scroll views instead of shrinking controls.
- Material navigation guidance: bottom navigation should expose 3-5 persistent top-level destinations with short labels and clear active state.
- WCAG target-size guidance: interactive targets need minimum target size/spacing and should avoid adjacent accidental taps.

## Scope

- Improve screen-level guidance so players understand the current task and next action.
- Improve bottom menu/nav clarity and active state.
- Improve home, placement, wardrobe, gacha, and storage screen entry cues without adding tutorial text walls.
- Add QA that checks route affordance, active nav labels, next-action copy, tap target size, and screen guidance.

## Guardrails

- Do not change monetization, external DB, or final character-design direction.
- Do not touch unrelated untracked prior candidates.
- Keep the existing pixel/box-garden visual style.

## Progress

- completed: Audit current UI and identify flow gaps.
- completed: Implement low-risk layout and guidance improvements for screen cues, bottom nav active state, and primary action labels.
- completed: Add placement understandability improvements: visible footprint preview, Pick/Spot/Place state chips, valid spot count, and disabled no-spot confirm state.
- in_progress: Run browser QA, typecheck, tests, build, and deploy if the final diff is good.
