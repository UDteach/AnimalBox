# AnimalBox Mobile Polish Loop

## Goal

Polish AnimalBox as a mobile-first 2D garden/idler prototype across visual quality, placement, touch flow, and game-loop guidance.

## Guardrails

- Stop before major character-design decisions.
- Stop before paid monetization.
- Stop before external DB adoption.
- Stop before destructive cleanup.
- GitHub push and Cloudflare Pages deploy are in scope.

## Audit Inventory

- P0: Cloudflare compact screenshots could capture a blank sky before the background image decoded.
- P0: Dense seeded placement could show no valid cells.
- P1: Storage theme buttons reported vertical overflow because image cards used inline image layout.
- P1: Wardrobe preview degu read larger than the island/decor scale.
- P2: Gacha screen needed a stronger reveal-state screenshot and feedback.

## Progress

- completed: Captured local and Cloudflare mobile screenshots with Playwright.
- completed: Built a visual contact sheet at `output/playwright/visual-polish-audit/contact-sheet.png`.
- completed: Added `qa:visual` as a screenshot/audit helper.
- completed: Added background decode wait and eager background image loading.
- completed: Tuned placement safe area and degu keepout to keep valid ground cells visible.
- completed: Removed Storage theme-card overflow by making cards block image containers.
- completed: Reduced Wardrobe degu preview scale.
- completed: Added gacha flash/reveal polish.
- in_progress: Run required QA gates.
- pending: Push to GitHub and deploy Cloudflare Pages.
