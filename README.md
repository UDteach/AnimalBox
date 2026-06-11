# AnimalBox

Smartphone-first idle boxed-garden prototype starring degus.

This first prototype prioritizes visual fidelity to the ImageGen mobile mockups. The app uses the mockups as screen art, with React-managed hotspots and state layered on top. It intentionally has no paid gacha; the gacha uses only earned in-game tickets.

## Stack

- React + Vite + TypeScript
- Vitest for economy, gacha, storage, and placement logic
- ImageGen-generated mobile mockups and icon assets
- Cloudflare Pages static deployment

## Commands

```powershell
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
```

## Prototype Screens

- Home / tap coins: `public/images/mockups/home-island-tap-coins.png`
- Placement: `public/images/mockups/placement-mode.png`
- Wardrobe: `public/images/mockups/wardrobe-dressup.png`
- Free gacha: `public/images/mockups/free-gacha.png`

## Deployment

Build output is `dist`.

```powershell
npm run build
npx wrangler pages deploy dist --project-name animalbox --branch main
```
