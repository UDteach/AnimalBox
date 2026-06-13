import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const storageKey = 'animalbox.prototype.v1';
const outDir = 'output/playwright/visual-polish-audit';

const targets = [
  { id: 'local', url: process.env.ANIMALBOX_LOCAL_URL ?? 'http://127.0.0.1:5173' },
  { id: 'production', url: process.env.ANIMALBOX_PRODUCTION_URL ?? 'https://animalbox.pages.dev' }
];

const viewports = [
  { id: 'phone-390x844', width: 390, height: 844 },
  { id: 'compact-320x700', width: 320, height: 700 }
];

const screens = ['home', 'placement', 'wardrobe', 'gacha', 'storage'];
const backgroundIds = [
  'floating-island',
  'morning-pasture',
  'starlight-night',
  'sunset-clover-isle',
  'rainy-glass-garden',
  'flower-cloud-terrace',
  'moonlit-hay-field'
];
const deguIds = [
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
  'macaroni-mouse',
  'chinchilla',
  'gerbil',
  'hamster',
  'rabbit'
];
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

const baseSave = {
  economy: { coins: 12850, tickets: 15, shards: 42, incomePerSecond: 14 },
  screen: 'home',
  selectedBackgroundId: 'sunset-clover-isle',
  selectedVariantId: 'agouti',
  selectedDeguShotId: 'rabbit',
  customDeguTone: { hue: 0, saturation: 100, brightness: 100 },
  selectedOutfitIds: ['straw-hat', 'cloud-puff', 'clover-charm', 'acorn-charm', 'seed-pouch-charm'],
  accessoryPlacements: {},
  placedDecor: [
    { instanceId: 'audit-hay', itemId: 'hay-bed', cellX: 0, cellY: 2, footprint: { w: 2, h: 1 }, rotation: 0 },
    { instanceId: 'audit-bowl', itemId: 'water-bowl', cellX: 1, cellY: 3, footprint: { w: 1, h: 1 }, rotation: 0 },
    { instanceId: 'audit-fence', itemId: 'short-wooden-fence', cellX: 4, cellY: 2, footprint: { w: 2, h: 1 }, rotation: 0 }
  ],
  ownedRewardIds: [...backgroundIds, ...deguIds, ...decorIds, ...accessoryIds],
  gachaHistory: ['cloud-puff', 'hay-bed', 'flower-crown'],
  pullsSinceRare: 1,
  progression: { xp: 360, ticketProgress: 520, ownedUpgradeIds: ['seed-snack', 'soft-brush'], affection: 80, careStreak: 3 },
  layoutPresets: [1, 2, 3].map((slot) => ({
    slot,
    label: `Slot ${slot}`,
    selectedBackgroundId: slot === 1 ? 'flower-cloud-terrace' : 'floating-island',
    placedDecor: slot === 1 ? [{ instanceId: 'slot-fence', itemId: 'short-wooden-fence', cellX: 0, cellY: 2, footprint: { w: 2, h: 1 }, rotation: 0 }] : [],
    updatedAt: slot === 1 ? 1781200000000 : null
  }))
};

function encodedSave(screen) {
  return encodeURIComponent(JSON.stringify({ ...baseSave, screen }));
}

function pngOffset(width, x, y) {
  return (y * width + x) * 4;
}

function downscaleNearest(source, width) {
  const scale = width / source.width;
  const height = Math.round(source.height * scale);
  const output = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sx = Math.min(source.width - 1, Math.floor(x / scale));
      const sy = Math.min(source.height - 1, Math.floor(y / scale));
      const src = pngOffset(source.width, sx, sy);
      const dst = pngOffset(output.width, x, y);
      output.data[dst] = source.data[src];
      output.data[dst + 1] = source.data[src + 1];
      output.data[dst + 2] = source.data[src + 2];
      output.data[dst + 3] = source.data[src + 3];
    }
  }
  return output;
}

function paste(target, source, x0, y0) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const src = pngOffset(source.width, x, y);
      const dst = pngOffset(target.width, x0 + x, y0 + y);
      target.data[dst] = source.data[src];
      target.data[dst + 1] = source.data[src + 1];
      target.data[dst + 2] = source.data[src + 2];
      target.data[dst + 3] = source.data[src + 3];
    }
  }
}

async function makeContactSheet(items) {
  const thumbWidth = 180;
  const gap = 8;
  const thumbs = items.map((item) => ({ ...item, png: downscaleNearest(PNG.sync.read(item.bytes), thumbWidth) }));
  const rows = targets.length * viewports.length;
  const cols = screens.length;
  const rowHeight = Math.max(...thumbs.map((item) => item.png.height)) + gap;
  const sheet = new PNG({ width: cols * thumbWidth + (cols + 1) * gap, height: rows * rowHeight + gap });
  sheet.data.fill(245);

  for (const item of thumbs) {
    const targetIndex = targets.findIndex((target) => target.id === item.target);
    const viewportIndex = viewports.findIndex((viewport) => viewport.id === item.viewport);
    const screenIndex = screens.indexOf(item.screen);
    const row = targetIndex * viewports.length + viewportIndex;
    paste(sheet, item.png, gap + screenIndex * (thumbWidth + gap), gap + row * rowHeight);
  }

  const output = `${outDir}/contact-sheet.png`;
  await fs.writeFile(output, PNG.sync.write(sheet));
  return output;
}

function rectSnapshot(rect) {
  if (!rect) return null;
  return {
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
}

function auditMetrics(metrics) {
  const issues = [];
  if (metrics.assetWarning) issues.push({ priority: 'P0', issue: 'asset warning visible' });
  if (!metrics.backgroundImageLoaded) issues.push({ priority: 'P0', issue: 'background image did not decode before screenshot' });
  if (metrics.consoleErrors > 0) issues.push({ priority: 'P0', issue: 'console errors', count: metrics.consoleErrors });
  if (metrics.nav && metrics.phone && metrics.nav.bottom > metrics.phone.bottom + 2) issues.push({ priority: 'P0', issue: 'bottom nav escapes phone' });
  if (metrics.screen === 'placement' && metrics.invalidPlacementCells > 0) issues.push({ priority: 'P0', issue: 'invalid placement cells are visible', count: metrics.invalidPlacementCells });
  if (metrics.screen === 'placement' && metrics.validPlacementCells < 1) issues.push({ priority: 'P0', issue: 'no valid placement cells visible' });
  if (metrics.degu && metrics.phone && metrics.screen !== 'wardrobe') {
    const ratio = metrics.degu.width / metrics.phone.width;
    if (ratio > 0.3) issues.push({ priority: 'P0', issue: 'degu too large against background', ratio });
    if (ratio < 0.13) issues.push({ priority: 'P1', issue: 'degu too small to read', ratio });
  }
  if (metrics.smallTargets > 0) issues.push({ priority: 'P1', issue: 'small tap targets', count: metrics.smallTargets });
  if (metrics.textOverflow > 0) issues.push({ priority: 'P1', issue: 'button text overflow', count: metrics.textOverflow });
  if (metrics.screen === 'gacha' && metrics.revealCards < 1) issues.push({ priority: 'P2', issue: 'gacha reveal feedback missing' });
  return issues;
}

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const shots = [];
const records = [];

try {
  for (const target of targets) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 2,
        isMobile: true
      });
      const consoleMessages = [];
      await context.addInitScript(
        ({ key }) => {
          const params = new URLSearchParams(window.location.hash.slice(1));
          const save = params.get('qaSave');
          if (save) window.localStorage.setItem(key, save);
        },
        { key: storageKey }
      );
      const page = await context.newPage();
      page.on('console', (message) => {
        if (message.type() === 'error') consoleMessages.push(message.text());
      });

      for (const screen of screens) {
        const url = `${target.url}/?screen=${screen}#qaSave=${encodedSave(screen)}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('.phone', { timeout: 15000 });
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
        await page
          .waitForFunction(() => {
            const image = document.querySelector('.scene-background');
            return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
          }, { timeout: 15000 })
          .catch(() => undefined);
        if (screen === 'gacha') {
          await page.locator('.pull-button.single').click();
          await page.waitForSelector('.gacha-reveal', { timeout: 5000 });
        }
        await page.waitForTimeout(screen === 'gacha' ? 900 : 500);
        const metrics = await page.evaluate((screen) => {
          const rect = (selector) => {
            const node = document.querySelector(selector);
            return node ? node.getBoundingClientRect() : null;
          };
          const visible = (node) => {
            const style = window.getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          };
          const buttons = [...document.querySelectorAll('button')].filter(visible).map((button) => {
            const r = button.getBoundingClientRect();
            return {
              width: r.width,
              height: r.height,
              scrollWidth: button.scrollWidth,
              clientWidth: button.clientWidth,
              scrollHeight: button.scrollHeight,
              clientHeight: button.clientHeight
            };
          });
          const storageSheet = document.querySelector('.storage-sheet');
          return {
            screen,
            phone: rect('.phone'),
            nav: rect('.bottom-nav'),
            degu: rect('.degu-button, .pixel-degu-stage--wardrobe'),
            backgroundImageLoaded: (() => {
              const image = document.querySelector('.scene-background');
              return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
            })(),
            assetWarning: Boolean(document.querySelector('.asset-warning')),
            validPlacementCells: document.querySelectorAll('.cell-button[data-valid="true"]').length,
            invalidPlacementCells: document.querySelectorAll('.cell-button[data-valid="false"]').length,
            revealCards: document.querySelectorAll('.gacha-result-card').length,
            storageScrollable: storageSheet ? storageSheet.scrollHeight > storageSheet.clientHeight : null,
            smallTargets: buttons.filter((button) => button.width < 34 || button.height < 34).length,
            textOverflow: buttons.filter((button) => button.scrollWidth > button.clientWidth + 3 || button.scrollHeight > button.clientHeight + 3).length
          };
        }, screen);
        const file = `${outDir}/${target.id}__${viewport.id}__${screen}.png`;
        const bytes = await page.screenshot({ path: file, fullPage: true });
        const normalizedMetrics = {
          ...metrics,
          target: target.id,
          viewport: viewport.id,
          phone: rectSnapshot(metrics.phone),
          nav: rectSnapshot(metrics.nav),
          degu: rectSnapshot(metrics.degu),
          consoleErrors: consoleMessages.length,
          screenshot: file
        };
        records.push({ ...normalizedMetrics, issues: auditMetrics(normalizedMetrics) });
        shots.push({ target: target.id, viewport: viewport.id, screen, bytes });
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const contactSheet = await makeContactSheet(shots);
await fs.writeFile(`${outDir}/report.json`, JSON.stringify({ ok: true, outDir, contactSheet, records }, null, 2));
const issueCount = records.reduce((count, record) => count + record.issues.length, 0);
console.log(JSON.stringify({ ok: true, outDir, contactSheet, screenshots: shots.length, issueCount }, null, 2));
