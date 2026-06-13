import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.ANIMALBOX_QA_URL ?? 'http://127.0.0.1:5173';
const outDir = 'output/playwright/customization-flow-qa';
const storageKey = 'animalbox.prototype.v1';

const newDecorIds = [
  'short-wooden-fence',
  'flower-patch',
  'snack-tray',
  'star-lantern',
  'mossy-log-hideout',
  'seed-crate',
  'grass-tuft-cluster',
  'pebble-stepping-stones',
  'flower-arch',
  'carrot-basket',
  'cloud-cushion-bench',
  'tiny-burrow-mound'
];
const newAnimalIds = ['macaroni-mouse', 'chinchilla', 'gerbil', 'hamster', 'rabbit'];
const newOutfitIds = ['cloud-puff', 'clover-charm', 'acorn-charm', 'seed-pouch-charm'];
const floatingItemIds = [
  'cloud-puff',
  'clover-charm',
  'acorn-charm',
  'seed-pouch-charm',
  'star-lantern-float',
  'moon-bell',
  'sky-ticket-charm',
  'mushroom-friend',
  'sprout-buddy',
  'sleepy-dust-buddy',
  'cotton-flower-puff',
  'crystal-shard-float',
  'bellflower-sprite',
  'feather-charm',
  'bread-basket',
  'water-drop-buddy',
  'sky-moth',
  'cloud-sheep',
  'walnut-charm',
  'comet-seed',
  'spiral-shell',
  'sleepy-seed-spirit',
  'paper-crane',
  'honey-jar',
  'sun-bell',
  'blue-firefly',
  'carrot-bit',
  'teacup-cloud',
  'cloud-starfish',
  'pebble-friend',
  'leaf-boat',
  'lavender-puff'
];
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
  ...newAnimalIds,
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
  'cloud-cap',
  'clover-necklace',
  'picnic-blanket-cape',
  'tiny-cheek-sticker',
  ...floatingItemIds
];

const baseSave = {
  economy: { coins: 8888, tickets: 18, shards: 30, incomePerSecond: 18 },
  screen: 'wardrobe',
  selectedBackgroundId: 'floating-island',
  selectedVariantId: 'agouti',
  selectedDeguShotId: 'rabbit',
  customDeguTone: { hue: 0, saturation: 100, brightness: 100 },
  selectedOutfitIds: ['straw-hat', ...newOutfitIds],
  accessoryPlacements: {},
  placedDecor: [
    {
      instanceId: 'qa-fence',
      itemId: 'short-wooden-fence',
      cellX: 0,
      cellY: 3,
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
    selectedBackgroundId: slot === 1 ? 'flower-cloud-terrace' : 'floating-island',
    placedDecor:
      slot === 1
        ? [
            {
              instanceId: 'slot-fence',
              itemId: 'short-wooden-fence',
              cellX: 0,
              cellY: 3,
              footprint: { w: 2, h: 1 }
            }
          ]
        : [],
    updatedAt: slot === 1 ? 1781200000000 : null
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
        await page.locator('.care-button').nth(0).click();
        await page.waitForTimeout(120);
        await page.locator('.care-button').nth(1).click();
        await page.waitForTimeout(120);
      }
      if (screen === 'placement') {
        await page.locator('.action.rotate').click();
        await page.waitForTimeout(120);
        const beforeNudge = await page.locator('.cell-button[data-selected="true"]').evaluate((node) => ({
          x: node.getAttribute('data-cell-x'),
          y: node.getAttribute('data-cell-y')
        }));
        await page.locator('.nudge-button.right').click();
        await page.waitForTimeout(120);
        const afterNudge = await page.locator('.cell-button[data-selected="true"]').evaluate((node) => ({
          x: node.getAttribute('data-cell-x'),
          y: node.getAttribute('data-cell-y')
        }));
        await page.locator('.action.undo').click();
        await page.waitForTimeout(120);
        page.__animalboxNudgeMoved = beforeNudge.x !== afterNudge.x || beforeNudge.y !== afterNudge.y;
      }
      if (screen === 'wardrobe') {
        await page.locator('.accessory-tool-grid button').nth(3).click();
        await page.locator('.accessory-tool-grid button').nth(4).click();
        await page.waitForTimeout(140);
      }
      const metrics = await page.evaluate(
        ({ screen, newDecorIds, newOutfitIds, newAnimalIds }) => {
          const save = JSON.parse(window.localStorage.getItem('animalbox.prototype.v1') ?? '{}');
          const phone = document.querySelector('.phone')?.getBoundingClientRect();
          const nav = document.querySelector('.bottom-nav')?.getBoundingClientRect();
          const gamePanel = document.querySelector('.game-loop-panel')?.getBoundingClientRect();
          const grid = document.querySelector('.wardrobe-grid');
          const gridRect = grid?.getBoundingClientRect();
          const shotRow = document.querySelector('.shot-row')?.getBoundingClientRect();
          const apply = document.querySelector('.apply-button')?.getBoundingClientRect();
          const ghost = document.querySelector('.placement-ghost');
          const cardImages = [...document.querySelectorAll('img')].map((image) => image.getAttribute('src') ?? '');
          return {
            screen,
            hasAssetWarning: Boolean(document.querySelector('.asset-warning')),
            activeAccessories: [...document.querySelectorAll('.pixel-degu-float-item')].map(
              (node) => node.getAttribute('src') ?? ''
            ),
            strawHatPlacement: save.accessoryPlacements?.['straw-hat'] ?? null,
            newDecorCards: newDecorIds.filter((id) => cardImages.some((src) => src.endsWith(`${id}.png`))).length,
            newOutfitCards: newOutfitIds.filter((id) => cardImages.some((src) => src.endsWith(`${id}.png`))).length,
            newAnimalCards: newAnimalIds.filter((id) => cardImages.some((src) => src.endsWith(`${id}.png`))).length,
            careButtons: [...document.querySelectorAll('.care-button')].map((node) => ({
              text: node.textContent ?? '',
              fits: node.scrollWidth <= node.clientWidth + 1
            })),
            incomePerSecond: save.economy?.incomePerSecond ?? null,
            placedDecorCount: save.placedDecor?.length ?? null,
            affection: save.progression?.affection ?? null,
            careStreak: save.progression?.careStreak ?? null,
            placementGhostRotation: ghost ? window.getComputedStyle(ghost).getPropertyValue('--decor-rotation').trim() : null,
            mapChips: document.querySelectorAll('.map-chip').length,
            nudgeButtons: document.querySelectorAll('.nudge-button').length,
            lockedMapChips: document.querySelectorAll('.map-chip[data-locked="true"]').length,
            collectionCards: document.querySelectorAll('.collection-card').length,
            marketOfferButtons: document.querySelectorAll('.market-offer-card').length,
            affordableMarketOffers: document.querySelectorAll('.market-offer-card[data-affordable="true"]').length,
            gamePanelBottomToNav: gamePanel && nav ? nav.top - gamePanel.bottom : null,
            wardrobeGridBottomToNav: gridRect && nav ? nav.top - gridRect.bottom : null,
            shotRowBottomToGrid: shotRow && gridRect ? gridRect.top - shotRow.bottom : null,
            applyBottomToGrid: apply && gridRect ? gridRect.top - apply.bottom : null,
            gridScrollable: grid ? grid.scrollWidth > grid.clientWidth + 1 : null,
            phone: phone ? { width: phone.width, height: phone.height } : null
          };
        },
        { screen, newDecorIds, newOutfitIds, newAnimalIds }
      );
      if (screen === 'placement') metrics.nudgeMoved = Boolean(page.__animalboxNudgeMoved);

      if (screen === 'wardrobe') {
        await page.screenshot({ path: `${outDir}/wardrobe-batch003.png`, fullPage: true });
      }

      if (screen === 'home') {
        await page.locator('.hud .round-button:not(.locale-button)').click();
        await page.waitForSelector('.storage-sheet', { timeout: 5000 });
        metrics.settingsOpensStorage = true;
      }
      if (screen === 'wardrobe') {
        await page.locator('.apply-button').click();
        await page.waitForSelector('.game-loop-panel', { timeout: 5000 });
        metrics.applyReturnsHome = true;
      }
      if (screen === 'gacha') {
        await page.locator('.pull-button.single').click();
        await page.waitForSelector('.gacha-reveal', { timeout: 5000 });
        await page.waitForTimeout(160);
        metrics.gachaRevealCards = await page.locator('.gacha-result-card').count();
        metrics.gachaOpeningState = await page.locator('.gacha-screen').getAttribute('data-opening');
        metrics.gachaHistoryText = await page.locator('.history-chip').textContent();
        await page.locator('.pull-button.premium').click();
        await page.waitForSelector('.gacha-reveal[data-banner="premium-sky-gift-01"]', { timeout: 5000 });
        metrics.premiumRevealCards = await page.locator('.gacha-reveal[data-banner="premium-sky-gift-01"] .gacha-result-card').count();
      }
      if (screen === 'storage') {
        const beforeTrade = await page.evaluate(() => JSON.parse(window.localStorage.getItem('animalbox.prototype.v1') ?? '{}'));
        await page.locator('.market-offer-card').nth(0).click();
        await page.waitForTimeout(120);
        const afterTrade = await page.evaluate(() => JSON.parse(window.localStorage.getItem('animalbox.prototype.v1') ?? '{}'));
        metrics.marketTrade = {
          beforeTickets: beforeTrade.economy?.tickets ?? null,
          afterTickets: afterTrade.economy?.tickets ?? null,
          beforeShards: beforeTrade.economy?.shards ?? null,
          afterShards: afterTrade.economy?.shards ?? null
        };
        await page.locator('.preset-clear-button').nth(0).click();
        await page.waitForTimeout(120);
        metrics.clearPresetDisablesLoad = await page.locator('.preset-button.load').nth(0).isDisabled();
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
  assert(home.settingsOpensStorage, 'settings button did not open storage', home);
  assert(home.gamePanelBottomToNav >= 4, 'home game panel collides with bottom nav', home);

  const wardrobe = results.find((item) => item.screen === 'wardrobe');
  assert(wardrobe, 'wardrobe metrics missing');
  assert(!wardrobe.hasAssetWarning, 'wardrobe asset warning', wardrobe);
  assert(wardrobe.activeAccessories.length >= newOutfitIds.length, 'new accessories are not rendered', wardrobe);
  assert(wardrobe.strawHatPlacement?.x === 2, 'accessory move control did not persist x offset', wardrobe);
  assert(wardrobe.strawHatPlacement?.scale > 1, 'accessory scale control did not persist scale', wardrobe);
  assert(wardrobe.newOutfitCards === newOutfitIds.length, 'new outfit cards are missing', wardrobe);
  assert(wardrobe.newAnimalCards === newAnimalIds.length, 'new animal choices are missing', wardrobe);
  assert(wardrobe.wardrobeGridBottomToNav >= 4, 'wardrobe grid collides with bottom nav', wardrobe);
  assert(wardrobe.shotRowBottomToGrid >= 4, 'wardrobe grid collides with shot row', wardrobe);
  assert(wardrobe.applyBottomToGrid >= 4, 'wardrobe grid collides with apply button', wardrobe);
  assert(wardrobe.gridScrollable, 'wardrobe grid should scroll horizontally for expanded inventory', wardrobe);
  assert(wardrobe.applyReturnsHome, 'wardrobe apply did not return to home', wardrobe);

  const placement = results.find((item) => item.screen === 'placement');
  assert(placement?.newDecorCards === newDecorIds.length, 'new decor cards are missing', placement);
  assert(!placement.hasAssetWarning, 'placement asset warning', placement);
  assert(placement.placementGhostRotation === '90deg', 'placement rotate did not update ghost rotation', placement);
  assert(placement.mapChips === 3, 'placement map chips missing', placement);
  assert(placement.nudgeButtons === 4, 'placement nudge controls missing', placement);
  assert(placement.nudgeMoved, 'placement nudge control did not move the selected cell', placement);
  assert(placement.placedDecorCount === 0, 'placement undo did not remove the last decor', placement);
  assert(placement.incomePerSecond < baseSave.economy.incomePerSecond, 'placement undo did not reduce decor income', placement);

  const gacha = results.find((item) => item.screen === 'gacha');
  assert(gacha?.newDecorCards === newDecorIds.length, 'new decor rewards missing from gacha preview', gacha);
  assert(gacha?.newOutfitCards === newOutfitIds.length, 'new outfit rewards missing from gacha preview', gacha);
  assert(gacha?.newAnimalCards === newAnimalIds.length, 'new animal rewards missing from gacha preview', gacha);
  assert(!gacha.hasAssetWarning, 'gacha asset warning', gacha);
  assert(/^(Last:|最近:)/.test(gacha.gachaHistoryText ?? ''), 'gacha did not show pull history', gacha);
  assert(gacha.gachaRevealCards >= 1, 'gacha reveal cards did not render', gacha);
  assert(gacha.premiumRevealCards >= 1, 'premium earned-ticket reveal cards did not render', gacha);
  assert(!/[a-z]+-[a-z]+/.test(gacha.gachaHistoryText ?? ''), 'gacha history still shows raw reward ids', gacha);

  const storage = results.find((item) => item.screen === 'storage');
  assert(!storage?.hasAssetWarning, 'storage asset warning', storage);
  assert(storage?.collectionCards === 6, 'storage collection progress cards missing', storage);
  assert(storage?.mapChips === 3, 'storage map chips missing', storage);
  assert(storage?.lockedMapChips >= 1, 'storage should show locked map progression at this level', storage);
  assert(storage?.marketOfferButtons === 2, 'storage market offers missing', storage);
  assert(storage?.affordableMarketOffers >= 1, 'storage has no affordable market offer', storage);
  assert(storage?.marketTrade?.afterTickets === storage.marketTrade.beforeTickets + 1, 'market trade did not add a ticket', storage);
  assert(storage?.marketTrade?.afterShards === storage.marketTrade.beforeShards - 12, 'market trade did not spend shards', storage);
  assert(storage?.clearPresetDisablesLoad, 'storage clear preset did not disable load', storage);

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
