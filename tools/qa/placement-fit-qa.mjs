import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseUrl = process.env.ANIMALBOX_QA_URL ?? 'http://127.0.0.1:5173';
const outDir = 'output/playwright/placement-fit-qa';
const storageKey = 'animalbox.prototype.v1';

const viewports = [
  { id: 'compact-320x700', width: 320, height: 700 },
  { id: 'phone-390x844', width: 390, height: 844 },
  { id: 'large-430x932', width: 430, height: 932 }
];

const backgroundThemes = [
  'floating-island',
  'morning-pasture',
  'starlight-night',
  'sunset-clover-isle',
  'rainy-glass-garden',
  'flower-cloud-terrace',
  'moonlit-hay-field'
];

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
const newOutfitIds = ['cloud-cap', 'clover-necklace', 'picnic-blanket-cape', 'tiny-cheek-sticker'];
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

const allRewardIds = [
  ...backgroundThemes,
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
  ...newOutfitIds,
  ...floatingItemIds
];

const baseSave = {
  economy: { coins: 12850, tickets: 15, shards: 42, incomePerSecond: 14 },
  screen: 'home',
  selectedBackgroundId: 'floating-island',
  selectedVariantId: 'agouti',
  selectedDeguShotId: 'rabbit',
  customDeguTone: { hue: 0, saturation: 100, brightness: 100 },
  selectedOutfitIds: ['acorn-beret', 'mint-scarf'],
  accessoryPlacements: {},
  placedDecor: [],
  ownedRewardIds: allRewardIds,
  gachaHistory: [],
  pullsSinceRare: 0,
  progression: { xp: 260, ticketProgress: 320, ownedUpgradeIds: ['seed-snack', 'soft-brush'], affection: 64, careStreak: 2 }
};

const homePlacedDecor = [
  { instanceId: 'qa-hideout', itemId: 'ceramic-hideout', cellX: 0, cellY: 2, footprint: { w: 2, h: 2 } },
  { instanceId: 'qa-hay', itemId: 'timothy-hay-rack', cellX: 0, cellY: 2, footprint: { w: 2, h: 1 } },
  { instanceId: 'qa-sand', itemId: 'sand-bath-bowl', cellX: 1, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'qa-sprout', itemId: 'seed-sprout-pot', cellX: 5, cellY: 2, footprint: { w: 1, h: 1 } },
  { instanceId: 'qa-mail', itemId: 'sky-mailbox', cellX: 5, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'qa-bell', itemId: 'bellflower-planter', cellX: 3, cellY: 3, footprint: { w: 2, h: 1 } }
];

function scenarioName(viewport, backgroundId, screen) {
  return `${viewport.id}__${backgroundId}__${screen}`;
}

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const failures = [];
const scenarios = [];

async function createPage(viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
    isMobile: true
  });
  await context.addInitScript(
    ({ key }) => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const save = params.get('qaSave');
      if (save) window.localStorage.setItem(key, save);
    },
    { key: storageKey }
  );
  const page = await context.newPage();
  return { context, page };
}

async function goto(page, screen, save) {
  const encodedSave = encodeURIComponent(JSON.stringify({ ...save, screen }));
  await page.goto(`${baseUrl}/?screen=${screen}#qaSave=${encodedSave}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('.phone', { timeout: 10000 });
  await page.waitForTimeout(500);
}

async function detectBackgroundMask(page) {
  return page.evaluate(async () => {
    const image = document.querySelector('.scene-background');
    if (!(image instanceof HTMLImageElement)) return null;
    await image.decode().catch(() => undefined);

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;
    let count = 0;

    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const offset = (y * canvas.width + x) * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const a = data[offset + 3];
        const isTransparent = a < 20;
        const isUpperSky = y < canvas.height * 0.34;
        const isSkyBlue = b > 135 && g > 110 && b > r + 18;
        const isUiCream = r > 210 && g > 185 && b < 170 && y > canvas.height * 0.68;
        const isGrass = g > 72 && g > b * 0.92 && g > r * 0.55 && y > canvas.height * 0.38;
        const isEarth = r > 68 && g > 42 && b < 145 && r > b * 0.88 && y > canvas.height * 0.43;
        const isIslandPixel = !isTransparent && !isUpperSky && !isSkyBlue && !isUiCream && (isGrass || isEarth);
        if (!isIslandPixel) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        count += 1;
      }
    }

    if (count === 0) return null;
    return {
      x: (minX / canvas.width) * 100,
      y: (minY / canvas.height) * 100,
      right: (maxX / canvas.width) * 100,
      bottom: (maxY / canvas.height) * 100,
      coverage: count / ((canvas.width * canvas.height) / 4)
    };
  });
}

async function annotateHome(page, mask) {
  await page.addStyleTag({
    content: `
      .qa-fit-box {
        position: absolute;
        z-index: 160;
        pointer-events: none;
        border: 2px solid #00e5ff;
        background: rgba(0, 229, 255, 0.05);
      }
      .qa-fit-box[data-kind="degu"] { border-color: #ff1744; }
      .qa-fit-box[data-kind="bottom"] { border-color: #ff9100; background: rgba(255, 145, 0, 0.08); }
      .qa-fit-box[data-kind="mask"] { border-color: #00c853; background: rgba(0, 200, 83, 0.08); }
      .qa-fit-label {
        position: absolute;
        left: 2px;
        top: 2px;
        color: #142029;
        background: rgba(255, 255, 255, 0.9);
        font: 900 9px/1 ui-monospace, Menlo, Consolas, monospace;
      }
    `
  });

  await page.evaluate((mask) => {
    const phone = document.querySelector('.phone');
    if (!phone) return;
    const phoneRect = phone.getBoundingClientRect();
    const percent = (rect) => ({
      x: ((rect.left - phoneRect.left) / phoneRect.width) * 100,
      y: ((rect.top - phoneRect.top) / phoneRect.height) * 100,
      w: (rect.width / phoneRect.width) * 100,
      h: (rect.height / phoneRect.height) * 100
    });
    const addBox = (rect, kind, label) => {
      const box = document.createElement('div');
      box.className = 'qa-fit-box';
      box.dataset.kind = kind;
      box.style.left = `${rect.x}%`;
      box.style.top = `${rect.y}%`;
      box.style.width = `${rect.w}%`;
      box.style.height = `${rect.h}%`;
      const text = document.createElement('span');
      text.className = 'qa-fit-label';
      text.textContent = label;
      box.appendChild(text);
      phone.appendChild(box);
    };

    const degu = document.querySelector('.degu-button')?.getBoundingClientRect();
    const bottom = document.querySelector('.game-loop-panel')?.getBoundingClientRect();
    if (mask) addBox({ x: mask.x, y: mask.y, w: mask.right - mask.x, h: mask.bottom - mask.y }, 'mask', 'BG MASK');
    if (degu) addBox(percent(degu), 'degu', 'DEGU');
    if (bottom) addBox(percent(bottom), 'bottom', 'BOTTOM UI');
  }, mask);
}

async function collectHomeMetrics(page) {
  return page.evaluate(() => {
    const phone = document.querySelector('.phone')?.getBoundingClientRect();
    const degu = document.querySelector('.degu-button')?.getBoundingClientRect();
    const bottom = document.querySelector('.game-loop-panel')?.getBoundingClientRect();
    const nav = document.querySelector('.bottom-nav')?.getBoundingClientRect();
    const percent = (rect, container) => ({
      x: ((rect.left - container.left) / container.width) * 100,
      y: ((rect.top - container.top) / container.height) * 100,
      w: (rect.width / container.width) * 100,
      h: (rect.height / container.height) * 100,
      right: ((rect.right - container.left) / container.width) * 100,
      bottom: ((rect.bottom - container.top) / container.height) * 100
    });
    const decor = [...document.querySelectorAll('.runtime-decor.placed-decor')].map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        id: node.dataset.decorId,
        cell: `${node.dataset.cellX}:${node.dataset.cellY}`,
        percent: phone ? percent(rect, phone) : null
      };
    });
    return {
      phone: phone ? { width: phone.width, height: phone.height } : null,
      degu: degu && phone ? percent(degu, phone) : null,
      bottom: bottom && phone ? percent(bottom, phone) : null,
      nav: nav && phone ? percent(nav, phone) : null,
      decor
    };
  });
}

function verifyHomeMetrics(metrics, mask, scenario) {
  assert(metrics.phone, 'phone rect missing', scenario);
  assert(metrics.degu, 'degu rect missing', scenario);
  assert(metrics.bottom, 'bottom panel rect missing', scenario);
  assert(metrics.nav, 'bottom nav rect missing', scenario);
  assert(metrics.degu.w <= 30, 'degu is too large relative to the phone scene', { scenario, degu: metrics.degu });
  assert(metrics.degu.w >= 15, 'degu became too small to read as the main character', { scenario, degu: metrics.degu });
  assert(mask && mask.coverage > 0.015, 'background island mask detection failed', { scenario, mask });
  assert(mask.y <= metrics.degu.bottom + 8, 'degu is not visually inside detected island/ground band', {
    scenario,
    mask,
    degu: metrics.degu
  });

  for (const item of metrics.decor) {
    assert(item.percent, `decor ${item.id} rect missing`, { scenario, item });
    assert(item.percent.w <= 24, `decor ${item.id} is too large for the island scale`, { scenario, item });
    assert(item.percent.bottom < metrics.bottom.y - 1.2, `decor ${item.id} collides with bottom panel`, {
      scenario,
      item,
      bottom: metrics.bottom
    });
    assert(item.percent.bottom < metrics.nav.y - 1.2, `decor ${item.id} collides with bottom nav`, {
      scenario,
      item,
      nav: metrics.nav
    });
  }
}

async function measureHomeScenario(page, viewport, backgroundId) {
  const save = {
    ...baseSave,
    selectedBackgroundId: backgroundId,
    placedDecor: homePlacedDecor
  };
  await goto(page, 'home', save);
  const mask = await detectBackgroundMask(page);
  await annotateHome(page, mask);
  const metrics = await collectHomeMetrics(page);
  const name = scenarioName(viewport, backgroundId, 'home');
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  verifyHomeMetrics(metrics, mask, { viewport: viewport.id, backgroundId, screen: 'home' });
  return { mask, metrics };
}

async function verifyPlacementScenario(page, viewport, backgroundId) {
  await goto(page, 'placement', {
    ...baseSave,
    selectedBackgroundId: backgroundId,
    placedDecor: []
  });
  const name = scenarioName(viewport, backgroundId, 'placement');
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });

  const failures = [];
  const decorSelector = '.placement-sheet .asset-card[data-locked="false"]';
  const decorButtons = await page.locator(decorSelector).count();
  for (let decorIndex = 0; decorIndex < decorButtons; decorIndex += 1) {
    const label = await page.locator(decorSelector).nth(decorIndex).getAttribute('aria-label');
    await page.evaluate(
      ({ selector, index }) => {
        const button = document.querySelectorAll(selector).item(index);
        if (button instanceof HTMLButtonElement) button.click();
      },
      { selector: decorSelector, index: decorIndex }
    );
    await page.waitForFunction(
      () => document.querySelectorAll('.cell-button[data-valid="true"]').length > 0,
      null,
      { timeout: 1000 }
    ).catch(() => undefined);

    const validCount = await page.locator('.cell-button[data-valid="true"]').count();
    if (validCount <= 0) {
      failures.push({ label, issue: 'no valid cells' });
      continue;
    }

    const sampleCount = Math.min(validCount, 5);
    for (let i = 0; i < sampleCount; i += 1) {
      const index = Math.floor((i * validCount) / sampleCount);
      const didSelect = await page.evaluate((index) => {
        const cell = document.querySelectorAll('.cell-button[data-valid="true"]').item(index);
        if (!(cell instanceof HTMLButtonElement)) return false;
        cell.click();
        return true;
      }, index);
      if (!didSelect) {
        failures.push({ label, issue: 'valid cell not selectable', sampleIndex: index });
        continue;
      }
      await page.waitForTimeout(20);
      const state = await page.evaluate(() => {
        const phone = document.querySelector('.phone')?.getBoundingClientRect();
        const floor = document.querySelector('.fixed-island-floor')?.getBoundingClientRect();
        const ghost = document.querySelector('.placement-ghost')?.getBoundingClientRect();
        const sheet = document.querySelector('.placement-sheet')?.getBoundingClientRect();
        const nav = document.querySelector('.bottom-nav')?.getBoundingClientRect();
        const degu = document.querySelector('.degu-button')?.getBoundingClientRect();
        const nudge = document.querySelector('.placement-nudge')?.getBoundingClientRect();
        const selected = document.querySelector('.cell-button[data-selected="true"]');
        if (!phone || !floor || !ghost || !sheet || !nav || !degu || !nudge || !selected) return null;
        const ghostArea = ghost.width * ghost.height;
        const ix = Math.max(0, Math.min(ghost.right, degu.right) - Math.max(ghost.left, degu.left));
        const iy = Math.max(0, Math.min(ghost.bottom, degu.bottom) - Math.max(ghost.top, degu.top));
        const nx = Math.max(0, Math.min(nudge.right, degu.right) - Math.max(nudge.left, degu.left));
        const ny = Math.max(0, Math.min(nudge.bottom, degu.bottom) - Math.max(nudge.top, degu.top));
        const floorVisiblePx = Math.max(0, Math.min(floor.bottom, sheet.top) - floor.top);
        return {
          decorId: document.querySelector('.placement-ghost')?.dataset.decorId,
          cell: `${selected.dataset.cellX}:${selected.dataset.cellY}`,
          sheetClearance: sheet.top - ghost.bottom,
          sheetTopRatio: (sheet.top - phone.top) / phone.height,
          floorVisibleRatio: floorVisiblePx / floor.height,
          navClearance: nav.top - ghost.bottom,
          deguOverlapRatio: ghostArea > 0 ? (ix * iy) / ghostArea : 0,
          nudgeDeguOverlapRatio: nudge.width * nudge.height > 0 ? (nx * ny) / (nudge.width * nudge.height) : 0,
          ghost: { left: ghost.left, top: ghost.top, right: ghost.right, bottom: ghost.bottom, width: ghost.width, height: ghost.height }
        };
      });
      if (!state) {
        failures.push({ label, issue: 'missing placement measurement' });
        continue;
      }
      if (state.sheetClearance < 8) failures.push({ label, issue: 'sheet collision', state });
      if (state.sheetTopRatio < 0.68 && state.floorVisibleRatio < 0.98) failures.push({ label, issue: 'placement sheet hides too much of the island', state });
      if (state.floorVisibleRatio < 0.88) failures.push({ label, issue: 'island floor is obscured during placement', state });
      if (state.navClearance < 8) failures.push({ label, issue: 'nav collision', state });
      if (state.deguOverlapRatio > 0.38) failures.push({ label, issue: 'excessive degu overlap', state });
      if (state.nudgeDeguOverlapRatio > 0.02) failures.push({ label, issue: 'nudge controls overlap degu', state });
    }
  }

  assert(failures.length === 0, 'placement candidate visual fit failures', {
    viewport: viewport.id,
    backgroundId,
    failures: failures.slice(0, 12)
  });
  return { checkedDecor: decorButtons };
}

try {
  for (const viewport of viewports) {
    const { context, page } = await createPage(viewport);
    try {
      for (const backgroundId of backgroundThemes) {
        const scenario = { viewport: viewport.id, backgroundId };
        try {
          const home = await measureHomeScenario(page, viewport, backgroundId);
          const placement = await verifyPlacementScenario(page, viewport, backgroundId);
          scenarios.push({ ...scenario, home, placement });
        } catch (error) {
          await page.screenshot({
            path: `${outDir}/${scenarioName(viewport, backgroundId, 'failure')}.png`,
            fullPage: true
          }).catch(() => undefined);
          failures.push({
            ...scenario,
            message: error.message,
            details: error.details ?? null
          });
        }
      }
    } finally {
      await context.close();
    }
  }

  const result = { baseUrl, outDir, viewports, backgroundThemes, scenarios, failures };
  await fs.writeFile(`${outDir}/metrics.json`, JSON.stringify(result, null, 2));
  assert(failures.length === 0, 'placement fit matrix failed', failures.slice(0, 12));
  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        outDir,
        scenarios: scenarios.length,
        backgrounds: backgroundThemes.length,
        viewports: viewports.length
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        message: error.message,
        details: error.details ?? null,
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
