import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.ANIMALBOX_QA_URL ?? 'http://127.0.0.1:5173';
const outDir = 'output/playwright/dense-placement-qa';
const storageKey = 'animalbox.prototype.v1';

const viewports = [
  { id: 'compact-320x700', width: 320, height: 700 },
  { id: 'phone-390x844', width: 390, height: 844 },
  { id: 'large-430x932', width: 430, height: 932 }
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

const animalIds = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'macaroni-mouse', 'chinchilla', 'gerbil', 'hamster', 'rabbit'];
const variantIds = ['agouti', 'blue-gray', 'sandy', 'cream-patch'];
const decorIds = [
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
const accessoryIds = [
  'straw-hat',
  'cloud-puff',
  'clover-charm',
  'acorn-charm',
  'seed-pouch-charm',
  'sprout-buddy',
  'star-lantern-float',
  'moon-bell',
  'sky-ticket-charm',
  'mushroom-friend',
  'cotton-flower-puff',
  'crystal-shard-float',
  'bellflower-sprite',
  'water-drop-buddy',
  'sky-moth',
  'cloud-sheep',
  'walnut-charm',
  'comet-seed',
  'paper-crane',
  'sun-bell',
  'teacup-cloud',
  'lavender-puff'
];

const densePlacedDecor = [
  { instanceId: 'dense-01', itemId: 'grass-tuft-cluster', cellX: 0, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-02', itemId: 'carrot-basket', cellX: 1, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-03', itemId: 'snack-tray', cellX: 2, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-04', itemId: 'cloud-lamp', cellX: 3, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-05', itemId: 'seed-sprout-pot', cellX: 4, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-06', itemId: 'sky-mailbox', cellX: 5, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-07', itemId: 'seed-crate', cellX: 6, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-08', itemId: 'sand-bath-bowl', cellX: 13, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-09', itemId: 'water-bowl', cellX: 14, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-10', itemId: 'clover-patch', cellX: 15, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-11', itemId: 'tiny-burrow-mound', cellX: 16, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-12', itemId: 'grass-tuft-cluster', cellX: 17, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-13', itemId: 'carrot-basket', cellX: 0, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-14', itemId: 'snack-tray', cellX: 1, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-15', itemId: 'cloud-lamp', cellX: 2, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-16', itemId: 'seed-sprout-pot', cellX: 3, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-17', itemId: 'sky-mailbox', cellX: 4, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-18', itemId: 'seed-crate', cellX: 5, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-19', itemId: 'sand-bath-bowl', cellX: 13, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-20', itemId: 'water-bowl', cellX: 14, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-21', itemId: 'clover-patch', cellX: 15, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-22', itemId: 'tiny-burrow-mound', cellX: 16, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-23', itemId: 'grass-tuft-cluster', cellX: 17, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-24', itemId: 'carrot-basket', cellX: 0, cellY: 4, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-25', itemId: 'snack-tray', cellX: 1, cellY: 4, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-26', itemId: 'cloud-lamp', cellX: 2, cellY: 4, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-27', itemId: 'seed-sprout-pot', cellX: 3, cellY: 4, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-28', itemId: 'sky-mailbox', cellX: 4, cellY: 4, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-29', itemId: 'seed-crate', cellX: 5, cellY: 4, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-30', itemId: 'sand-bath-bowl', cellX: 13, cellY: 4, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-31', itemId: 'water-bowl', cellX: 14, cellY: 4, footprint: { w: 1, h: 1 } },
  { instanceId: 'dense-32', itemId: 'clover-patch', cellX: 15, cellY: 4, footprint: { w: 1, h: 1 } }
];

const baseSave = {
  economy: { coins: 42000, tickets: 32, shards: 120, incomePerSecond: 48 },
  screen: 'home',
  selectedBackgroundId: 'floating-island',
  selectedVariantId: 'agouti',
  selectedDeguShotId: 'rabbit',
  customDeguTone: { hue: 0, saturation: 100, brightness: 100 },
  selectedOutfitIds: ['cloud-puff', 'clover-charm', 'sprout-buddy'],
  accessoryPlacements: {},
  placedDecor: densePlacedDecor,
  ownedRewardIds: [...backgroundIds, ...variantIds, ...animalIds, ...decorIds, ...accessoryIds],
  gachaHistory: ['rabbit', 'seed-crate', 'cloud-cushion-bench'],
  pullsSinceRare: 0,
  progression: { xp: 980, ticketProgress: 840, ownedUpgradeIds: ['seed-snack', 'soft-brush'], affection: 92, careStreak: 5 },
  layoutPresets: [1, 2, 3].map((slot) => ({
    slot,
    label: `Slot ${slot}`,
    selectedBackgroundId: slot === 1 ? 'floating-island' : backgroundIds[slot],
    placedDecor: slot === 1 ? densePlacedDecor : [],
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

function rectOverlapRatio(a, b) {
  if (!a || !b) return 0;
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const area = Math.max(1, a.width * a.height);
  return (width * height) / area;
}

async function gotoSeeded(page, backgroundId) {
  const save = { ...baseSave, selectedBackgroundId: backgroundId };
  await page.goto(`${baseUrl}/?screen=home`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.evaluate(({ key, save }) => window.localStorage.setItem(key, JSON.stringify(save)), {
    key: storageKey,
    save
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('.phone', { timeout: 10000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(520);
}

async function collectMetrics(page) {
  return page.evaluate(() => {
    const rect = (node) => {
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return {
        left: box.left,
        top: box.top,
        right: box.right,
        bottom: box.bottom,
        width: box.width,
        height: box.height
      };
    };
    const phone = rect(document.querySelector('.phone'));
    const nav = rect(document.querySelector('.bottom-nav'));
    const panel = rect(document.querySelector('.game-loop-panel'));
    const degu = rect(document.querySelector('.degu-button'));
    const decor = [...document.querySelectorAll('.runtime-decor.placed-decor')].map((node) => ({
      id: node.dataset.decorId,
      cell: `${node.dataset.cellX}:${node.dataset.cellY}`,
      rect: rect(node)
    }));

    return {
      assetWarning: Boolean(document.querySelector('.asset-warning')),
      imageFailures: [...document.images].filter((image) => !image.complete || image.naturalWidth <= 0).length,
      phone,
      nav,
      panel,
      degu,
      decor,
      savedDecorCount: JSON.parse(window.localStorage.getItem('animalbox.prototype.v1') ?? '{}').placedDecor?.length ?? null
    };
  });
}

function verifyMetrics(metrics, scenario) {
  assert(!metrics.assetWarning, 'asset warning visible in dense placement state', scenario);
  assert(metrics.imageFailures === 0, 'one or more images failed to decode', { ...scenario, imageFailures: metrics.imageFailures });
  assert(metrics.decor.length >= densePlacedDecor.length, 'dense save was pruned or decor did not render', {
    ...scenario,
    rendered: metrics.decor.length,
    expected: densePlacedDecor.length,
    savedDecorCount: metrics.savedDecorCount
  });
  assert(metrics.phone && metrics.nav && metrics.panel && metrics.degu, 'required home rectangles missing', scenario);

  for (const item of metrics.decor) {
    assert(item.rect, 'placed decor rectangle missing', { ...scenario, item });
    assert(item.rect.left >= metrics.phone.left - 1 && item.rect.right <= metrics.phone.right + 1, 'dense decor escapes phone horizontally', {
      ...scenario,
      item
    });
    assert(item.rect.bottom <= metrics.panel.top - 3, 'dense decor collides with progression panel', {
      ...scenario,
      item,
      panel: metrics.panel
    });
    assert(item.rect.bottom <= metrics.nav.top - 6, 'dense decor collides with bottom nav', {
      ...scenario,
      item,
      nav: metrics.nav
    });
    assert(rectOverlapRatio(item.rect, metrics.degu) <= 0.5, 'dense decor overlaps the animal too heavily', {
      ...scenario,
      item,
      degu: metrics.degu,
      overlapRatio: rectOverlapRatio(item.rect, metrics.degu)
    });
  }
}

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const scenarios = [];
const failures = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
      isMobile: true
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    try {
      for (const backgroundId of backgroundIds) {
        const scenario = { viewport: viewport.id, backgroundId };
        try {
          await gotoSeeded(page, backgroundId);
          const metrics = await collectMetrics(page);
          verifyMetrics(metrics, scenario);
          assert(consoleErrors.length === 0, 'console errors during dense placement scenario', {
            ...scenario,
            consoleErrors
          });
          const screenshot = `${outDir}/${viewport.id}__${backgroundId}.png`;
          await page.screenshot({ path: screenshot, fullPage: true });
          scenarios.push({ ...scenario, screenshot, metrics });
        } catch (error) {
          const screenshot = `${outDir}/${viewport.id}__${backgroundId}__failure.png`;
          await page.screenshot({ path: screenshot, fullPage: true }).catch(() => undefined);
          failures.push({ ...scenario, message: error.message, details: error.details ?? null, screenshot });
        }
      }
    } finally {
      await context.close();
    }
  }

  const report = { ok: failures.length === 0, baseUrl, outDir, densePlacedDecor, scenarios, failures };
  await fs.writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2));
  if (failures.length > 0) {
    console.error(JSON.stringify({ ok: false, baseUrl, outDir, failures: failures.slice(0, 12) }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ ok: true, baseUrl, outDir, scenarios: scenarios.length, denseDecor: densePlacedDecor.length }, null, 2));
  }
} finally {
  await browser.close();
}
