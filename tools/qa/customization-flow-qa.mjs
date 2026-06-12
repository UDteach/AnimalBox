import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.ANIMALBOX_QA_URL ?? 'http://127.0.0.1:5173';
const outDir = 'output/playwright/customization-flow-qa';
const storageKey = 'animalbox.prototype.v1';

const newDecorIds = ['short-wooden-fence', 'flower-patch', 'snack-tray', 'star-lantern'];
const newOutfitIds = ['cloud-cap', 'clover-necklace', 'picnic-blanket-cape', 'tiny-cheek-sticker'];
const backgroundIds = [
  'floating-island',
  'morning-pasture',
  'starlight-night',
  'sunset-clover-isle',
  'rainy-glass-garden',
  'flower-cloud-terrace',
  'moonlit-hay-field'
];
const allRewardIds = [
  ...backgroundIds,
  'agouti',
  'blue-gray',
  'sandy',
  'cream-patch',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  'clover-patch',
  'hay-bed',
  'angel-fountain',
  'water-bowl',
  'windmill',
  'cloud-lamp',
  'timothy-hay-rack',
  'sand-bath-bowl',
  'wood-tunnel',
  'ceramic-hideout',
  'seed-sprout-pot',
  'cloud-bridge',
  'sky-mailbox',
  'bellflower-planter',
  ...newDecorIds,
  'straw-hat',
  'celestial-cape',
  'pastel-ribbon',
  'flower-crown',
  'round-glasses',
  'angel-halo-wings',
  'acorn-beret',
  'mint-scarf',
  'leaf-cape',
  'star-hairpin',
  'explorer-goggles',
  'cozy-poncho',
  'sky-satchel',
  'daisy-ear-clip',
  ...newOutfitIds
];

const baseSave = {
  economy: { coins: 8888, tickets: 18, shards: 30, incomePerSecond: 18 },
  screen: 'wardrobe',
  selectedBackgroundId: 'floating-island',
  selectedVariantId: 'agouti',
  selectedDeguShotId: '04',
  selectedOutfitIds: newOutfitIds,
  placedDecor: [
    {
      instanceId: 'qa-fence',
      itemId: 'short-wooden-fence',
      cellX: 0,
      cellY: 2,
      footprint: { w: 2, h: 1 }
    }
  ],
  ownedRewardIds: allRewardIds,
  gachaHistory: [],
  pullsSinceRare: 0,
  progression: {
    xp: 260,
    ticketProgress: 320,
    ownedUpgradeIds: ['seed-snack'],
    affection: 35,
    careStreak: 0
  },
  layoutPresets: [1, 2, 3].map((slot) => ({
    slot,
    label: `Slot ${slot}`,
    selectedBackgroundId: 'floating-island',
    placedDecor: [],
    updatedAt: null
  }))
};

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const failures = [];

async function gotoSeeded(page, screen) {
  await page.goto(`${baseUrl}/?screen=${screen}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.evaluate(
    ({ key, save, screen }) => {
      window.localStorage.setItem(key, JSON.stringify({ ...save, screen }));
    },
    { key: storageKey, save: baseSave, screen }
  );
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('.phone', { timeout: 10000 });
  await page.waitForTimeout(300);
}

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true
  });
  const page = await context.newPage();

  for (const screen of ['home', 'wardrobe', 'placement', 'gacha', 'storage']) {
    try {
      await gotoSeeded(page, screen);
      if (screen === 'home') {
        await page.getByRole('button', { name: 'Brush degu' }).click();
        await page.waitForTimeout(120);
        await page.getByRole('button', { name: 'Seeds degu' }).click();
        await page.waitForTimeout(120);
      }
      if (screen === 'placement') {
        await page.getByRole('button', { name: 'Undo last decor' }).click();
        await page.waitForTimeout(120);
      }
      const metrics = await page.evaluate(
        ({ screen, newDecorIds, newOutfitIds }) => {
          const save = JSON.parse(window.localStorage.getItem('animalbox.prototype.v1') ?? '{}');
          const phone = document.querySelector('.phone')?.getBoundingClientRect();
          const nav = document.querySelector('.bottom-nav')?.getBoundingClientRect();
          const gamePanel = document.querySelector('.game-loop-panel')?.getBoundingClientRect();
          const grid = document.querySelector('.wardrobe-grid');
          const gridRect = grid?.getBoundingClientRect();
          const shotRow = document.querySelector('.shot-row')?.getBoundingClientRect();
          const apply = document.querySelector('.apply-button')?.getBoundingClientRect();
          const cardImages = [...document.querySelectorAll('img')].map((image) => image.getAttribute('src') ?? '');
          return {
            screen,
            hasAssetWarning: Boolean(document.querySelector('.asset-warning')),
            activeOutfits: [...document.querySelectorAll('.pixel-degu-outfit')].map(
              (node) => node.getAttribute('src') ?? ''
            ),
            newDecorCards: newDecorIds.filter((id) => cardImages.some((src) => src.endsWith(`${id}.png`))).length,
            newOutfitCards: newOutfitIds.filter((id) => cardImages.some((src) => src.endsWith(`${id}.png`))).length,
            careButtons: [...document.querySelectorAll('.care-button')].map((node) => ({
              text: node.textContent ?? '',
              fits: node.scrollWidth <= node.clientWidth + 1
            })),
            incomePerSecond: save.economy?.incomePerSecond ?? null,
            placedDecorCount: save.placedDecor?.length ?? null,
            affection: save.progression?.affection ?? null,
            careStreak: save.progression?.careStreak ?? null,
            gamePanelBottomToNav: gamePanel && nav ? nav.top - gamePanel.bottom : null,
            wardrobeGridBottomToNav: gridRect && nav ? nav.top - gridRect.bottom : null,
            shotRowBottomToGrid: shotRow && gridRect ? gridRect.top - shotRow.bottom : null,
            applyBottomToGrid: apply && gridRect ? gridRect.top - apply.bottom : null,
            gridScrollable: grid ? grid.scrollWidth > grid.clientWidth + 1 : null,
            phone: phone ? { width: phone.width, height: phone.height } : null
          };
        },
        { screen, newDecorIds, newOutfitIds }
      );

      if (screen === 'wardrobe') {
        await page.screenshot({ path: `${outDir}/wardrobe-batch003.png`, fullPage: true });
      }
      results.push(metrics);
    } catch (error) {
      failures.push({ screen, message: error.message, details: error.details ?? null });
    }
  }

  await context.close();

  const home = results.find((item) => item.screen === 'home');
  assert(home, 'home metrics missing');
  assert(!home.hasAssetWarning, 'home asset warning', home);
  assert(home.careButtons.length === 2, 'home care buttons missing', home);
  assert(home.careButtons.every((button) => button.fits), 'home care button text overflow', home);
  assert(home.affection > baseSave.progression.affection, 'home care did not increase affection', home);
  assert(home.careStreak >= 2, 'home care streak did not persist', home);
  assert(home.gamePanelBottomToNav >= 4, 'home game panel collides with bottom nav', home);

  const wardrobe = results.find((item) => item.screen === 'wardrobe');
  assert(wardrobe, 'wardrobe metrics missing');
  assert(!wardrobe.hasAssetWarning, 'wardrobe asset warning', wardrobe);
  assert(wardrobe.activeOutfits.length === newOutfitIds.length, 'new outfits are not rendered', wardrobe);
  assert(wardrobe.newOutfitCards === newOutfitIds.length, 'new outfit cards are missing', wardrobe);
  assert(wardrobe.wardrobeGridBottomToNav >= 4, 'wardrobe grid collides with bottom nav', wardrobe);
  assert(wardrobe.shotRowBottomToGrid >= 4, 'wardrobe grid collides with shot row', wardrobe);
  assert(wardrobe.applyBottomToGrid >= 4, 'wardrobe grid collides with apply button', wardrobe);
  assert(wardrobe.gridScrollable, 'wardrobe grid should scroll horizontally for expanded inventory', wardrobe);

  const placement = results.find((item) => item.screen === 'placement');
  assert(placement?.newDecorCards === newDecorIds.length, 'new decor cards are missing', placement);
  assert(!placement.hasAssetWarning, 'placement asset warning', placement);
  assert(placement.placedDecorCount === 0, 'placement undo did not remove the last decor', placement);
  assert(placement.incomePerSecond < baseSave.economy.incomePerSecond, 'placement undo did not reduce decor income', placement);

  const gacha = results.find((item) => item.screen === 'gacha');
  assert(gacha?.newDecorCards === newDecorIds.length, 'new decor rewards missing from gacha preview', gacha);
  assert(gacha?.newOutfitCards === newOutfitIds.length, 'new outfit rewards missing from gacha preview', gacha);
  assert(!gacha.hasAssetWarning, 'gacha asset warning', gacha);

  const storage = results.find((item) => item.screen === 'storage');
  assert(!storage?.hasAssetWarning, 'storage asset warning', storage);

  console.log(JSON.stringify({ ok: true, baseUrl, outDir, results }, null, 2));
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        message: error.message,
        details: error.details ?? null,
        failures,
        results,
        outDir
      },
      null,
      2
    )
  );
  process.exitCode = 1;
} finally {
  await browser.close();
}
