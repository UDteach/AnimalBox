import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.ANIMALBOX_QA_URL ?? 'http://127.0.0.1:5173';
const outDir = 'output/playwright/interaction-motion-qa';
const storageKey = 'animalbox.prototype.v1';

const viewports = [
  { id: 'short-320x568', width: 320, height: 568 },
  { id: 'phone-390x844', width: 390, height: 844 }
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
  'tiny-cheek-sticker'
];

const baseSave = {
  economy: { coins: 18000, tickets: 24, shards: 42, incomePerSecond: 20 },
  screen: 'home',
  selectedBackgroundId: 'floating-island',
  selectedVariantId: 'agouti',
  selectedDeguShotId: '04',
  selectedOutfitIds: ['cloud-cap', 'clover-necklace', 'picnic-blanket-cape', 'tiny-cheek-sticker'],
  placedDecor: [
    { instanceId: 'qa-hay', itemId: 'timothy-hay-rack', cellX: 0, cellY: 2, footprint: { w: 2, h: 1 } }
  ],
  ownedRewardIds: allRewardIds,
  gachaHistory: ['cloud-cap', 'flower-patch', 'morning-pasture'],
  pullsSinceRare: 0,
  progression: {
    xp: 260,
    ticketProgress: 320,
    ownedUpgradeIds: ['seed-snack', 'soft-brush'],
    affection: 64,
    careStreak: 2
  },
  layoutPresets: [1, 2, 3].map((slot) => ({
    slot,
    label: `Slot ${slot}`,
    selectedBackgroundId: 'floating-island',
    placedDecor: [],
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

function overlap(a, b, pad = 0) {
  if (!a || !b) return false;
  return a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;
}

function area(rect) {
  return Math.max(0, rect.width) * Math.max(0, rect.height);
}

function overlapRatio(a, b) {
  if (!a || !b) return 0;
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return area(a) > 0 ? (width * height) / area(a) : 0;
}

async function gotoSeeded(page, screen, backgroundId = 'floating-island', overrides = {}) {
  const save = {
    ...baseSave,
    ...overrides,
    screen,
    selectedBackgroundId: backgroundId
  };

  await page.goto(`${baseUrl}/?screen=${screen}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.evaluate(
    ({ key, save }) => window.localStorage.setItem(key, JSON.stringify(save)),
    { key: storageKey, save }
  );
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('.phone', { timeout: 10000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(260);
}

async function metrics(page) {
  return page.evaluate(() => {
    const rect = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0) return null;
      return {
        selector,
        left: box.left,
        top: box.top,
        right: box.right,
        bottom: box.bottom,
        width: box.width,
        height: box.height
      };
    };
    const transform = (selector) => {
      const node = document.querySelector(selector);
      return node ? window.getComputedStyle(node).transform : null;
    };
    const animation = (selector) => {
      const node = document.querySelector(selector);
      return node ? window.getComputedStyle(node).animationName : null;
    };
    return {
      phone: rect('.phone'),
      hud: rect('.hud'),
      nav: rect('.bottom-nav'),
      degu: rect('.degu-button'),
      homePanel: rect('.game-loop-panel'),
      placementSheet: rect('.placement-sheet'),
      placementGhost: rect('.placement-ghost'),
      placedDecor: rect('.placed-decor'),
      wardrobeStage: rect('.pixel-degu-stage--wardrobe'),
      shotRow: rect('.shot-row'),
      wardrobeGrid: rect('.wardrobe-grid'),
      gachaMachine: rect('.gacha-machine'),
      pullRow: rect('.pull-row'),
      rewardStrip: rect('.reward-strip'),
      historyChip: rect('.history-chip'),
      storageSheet: rect('.storage-sheet'),
      deguTransform: transform('.pixel-degu-image'),
      deguAnimation: animation('.pixel-degu-image'),
      gachaTransform: transform('.gacha-machine'),
      gachaAnimation: animation('.gacha-machine'),
      placedDecorAnimation: animation('.placed-decor'),
      placedDecorRotation: document.querySelector('.placed-decor')
        ? window.getComputedStyle(document.querySelector('.placed-decor')).getPropertyValue('--decor-rotation').trim()
        : null,
      ghostRotation: document.querySelector('.placement-ghost')
        ? window.getComputedStyle(document.querySelector('.placement-ghost')).getPropertyValue('--decor-rotation').trim()
        : null,
      coinBursts: [...document.querySelectorAll('.coin-burst')].map((node) => {
        const box = node.getBoundingClientRect();
        return {
          left: box.left,
          top: box.top,
          right: box.right,
          bottom: box.bottom,
          width: box.width,
          height: box.height,
          text: node.textContent
        };
      })
    };
  });
}

function assertInsidePhone(rect, phone, label, details) {
  assert(rect && phone, `${label} rect missing`, details);
  assert(rect.left >= phone.left - 1, `${label} escapes phone left`, { ...details, rect, phone });
  assert(rect.right <= phone.right + 1, `${label} escapes phone right`, { ...details, rect, phone });
  assert(rect.top >= phone.top - 1, `${label} escapes phone top`, { ...details, rect, phone });
  assert(rect.bottom <= phone.bottom + 1, `${label} escapes phone bottom`, { ...details, rect, phone });
}

function assertCommonNoOverlap(state, scenario) {
  assert(!overlap(state.hud, state.nav, 2), 'hud overlaps bottom nav', scenario);
  for (const [key, rect] of Object.entries(state)) {
    if (
      key === 'phone' ||
      key === 'coinBursts' ||
      key.endsWith('Transform') ||
      key.endsWith('Animation') ||
      key.endsWith('Rotation')
    ) {
      continue;
    }
    if (rect) assertInsidePhone(rect, state.phone, key, scenario);
  }
}

async function runHome(page, scenario) {
  await gotoSeeded(page, 'home', scenario.backgroundId);
  const first = await metrics(page);
  await page.waitForTimeout(1320);
  const second = await metrics(page);

  assert(first.deguAnimation === 'idle-bob', 'home degu idle animation missing', scenario);
  assert(first.deguTransform !== second.deguTransform, 'home degu idle animation is not moving', {
    ...scenario,
    first: first.deguTransform,
    second: second.deguTransform
  });
  assert(first.homePanel.top - first.degu.bottom >= 4, 'home degu overlaps progression panel before taps', {
    ...scenario,
    degu: first.degu,
    homePanel: first.homePanel
  });

  for (let i = 0; i < 4; i += 1) {
    await page.getByRole('button', { name: 'Tap degu for coins' }).click();
  }
  await page.waitForTimeout(120);
  const burstState = await metrics(page);
  assert(burstState.coinBursts.length >= 1, 'coin burst did not appear after taps', scenario);
  for (const burst of burstState.coinBursts) {
    assertInsidePhone(burst, burstState.phone, 'coin burst', scenario);
    assert(!overlap(burst, burstState.nav, 2), 'coin burst overlaps bottom nav', { ...scenario, burst });
    assert(!overlap(burst, burstState.hud, 2), 'coin burst overlaps hud', { ...scenario, burst });
  }
  assertCommonNoOverlap(burstState, scenario);
}

async function runPlacement(page, scenario) {
  await gotoSeeded(page, 'placement', scenario.backgroundId, { placedDecor: [] });
  await page.getByRole('button', { name: 'Rotate placement' }).click();
  await page.waitForTimeout(80);
  const rotated = await metrics(page);
  assert(rotated.ghostRotation === '90deg', 'placement ghost rotation not reflected', {
    ...scenario,
    rotation: rotated.ghostRotation
  });

  const selectedCell = await page.evaluate(() => {
    const cell = document.querySelector('.cell-button[data-valid="true"]');
    if (!(cell instanceof HTMLButtonElement)) return null;
    cell.click();
    return {
      x: cell.dataset.cellX,
      y: cell.dataset.cellY
    };
  });
  assert(selectedCell, 'placement has no valid cell after rotation', scenario);
  await page.waitForTimeout(80);
  await page.getByRole('button', { name: 'Confirm placement' }).click();
  await page.waitForTimeout(90);
  const duringPop = await metrics(page);
  assert(duringPop.placedDecor, 'placed decor missing after confirm', scenario);
  assert(duringPop.placedDecorAnimation === 'place-pop', 'placed decor pop animation missing', {
    ...scenario,
    animation: duringPop.placedDecorAnimation
  });
  assert(duringPop.placedDecorRotation === '90deg', 'placed decor rotation did not persist to runtime node', {
    ...scenario,
    rotation: duringPop.placedDecorRotation
  });

  for (const delay of [0, 180, 360]) {
    if (delay > 0) await page.waitForTimeout(delay);
    const state = await metrics(page);
    assertCommonNoOverlap(state, scenario);
    assert(state.placementSheet.top - state.placedDecor.bottom >= 6, 'placed decor touches placement sheet during animation', {
      ...scenario,
      delay,
      decor: state.placedDecor,
      sheet: state.placementSheet
    });
    assert(state.nav.top - state.placedDecor.bottom >= 6, 'placed decor touches bottom nav during animation', {
      ...scenario,
      delay,
      decor: state.placedDecor,
      nav: state.nav
    });
    assert(overlapRatio(state.placedDecor, state.degu) <= 0.45, 'placed decor excessively overlaps degu during animation', {
      ...scenario,
      delay,
      ratio: overlapRatio(state.placedDecor, state.degu),
      decor: state.placedDecor,
      degu: state.degu
    });
  }
}

async function runWardrobe(page, scenario) {
  await gotoSeeded(page, 'wardrobe', scenario.backgroundId);
  const first = await metrics(page);
  await page.waitForTimeout(1320);
  const second = await metrics(page);
  assert(first.deguAnimation === 'idle-bob', 'wardrobe degu idle animation missing', scenario);
  assert(first.deguTransform !== second.deguTransform, 'wardrobe degu idle animation is not moving', scenario);
  assert(first.shotRow.top - first.wardrobeStage.bottom >= 2, 'wardrobe preview touches shot row', {
    ...scenario,
    stage: first.wardrobeStage,
    shotRow: first.shotRow
  });
  assert(first.wardrobeGrid.top - first.shotRow.bottom >= 8, 'wardrobe shot row touches outfit grid', {
    ...scenario,
    shotRow: first.shotRow,
    grid: first.wardrobeGrid
  });
  await page.locator('.wardrobe-grid').evaluate((node) => {
    node.scrollLeft = node.scrollWidth;
  });
  await page.waitForTimeout(80);
  const scrolled = await page.locator('.wardrobe-grid').evaluate((node) => node.scrollLeft);
  assert(scrolled > 10, 'wardrobe inventory strip is not horizontally scrollable', { ...scenario, scrolled });
  assertCommonNoOverlap(await metrics(page), scenario);
}

async function runGacha(page, scenario) {
  await gotoSeeded(page, 'gacha', scenario.backgroundId);
  const first = await metrics(page);
  await page.waitForTimeout(1620);
  const second = await metrics(page);
  assert(first.gachaAnimation === 'gacha-float', 'gacha machine animation missing', scenario);
  assert(first.gachaTransform !== second.gachaTransform, 'gacha machine animation is not moving', scenario);
  assert(first.rewardStrip.top - first.pullRow.bottom >= 8, 'gacha pull row touches reward strip before pull', {
    ...scenario,
    pullRow: first.pullRow,
    rewardStrip: first.rewardStrip
  });

  await page.getByRole('button', { name: 'Open ten sky gifts' }).click();
  await page.waitForTimeout(220);
  const text = await page.locator('.history-chip').textContent();
  assert(/^Last: /.test(text ?? ''), 'gacha history did not update after pull', { ...scenario, text });
  assert(!/[a-z]+-[a-z]+/.test(text ?? ''), 'gacha history exposes raw reward ids after pull', { ...scenario, text });
  const state = await metrics(page);
  assert(state.historyChip.top - state.rewardStrip.bottom >= 8, 'gacha history overlaps reward strip after pull', {
    ...scenario,
    rewardStrip: state.rewardStrip,
    historyChip: state.historyChip
  });
  assert(state.nav.top - state.historyChip.bottom >= 8, 'gacha history overlaps bottom nav after pull', {
    ...scenario,
    nav: state.nav,
    historyChip: state.historyChip
  });
  assertCommonNoOverlap(state, scenario);
}

async function runStorage(page, scenario) {
  await gotoSeeded(page, 'storage', scenario.backgroundId);
  await page.locator('.storage-sheet').evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await page.waitForTimeout(100);
  const state = await metrics(page);
  assert(state.nav.top - state.storageSheet.bottom >= 8, 'storage sheet overlaps bottom nav after scroll', {
    ...scenario,
    nav: state.nav,
    storageSheet: state.storageSheet
  });
  await page.getByRole('button', { name: 'Save layout preset 1' }).click();
  await page.getByRole('button', { name: 'Clear layout preset 1' }).click();
  await page.waitForTimeout(100);
  assert(await page.getByRole('button', { name: 'Load layout preset 1' }).isDisabled(), 'storage clear did not disable load', scenario);
  assertCommonNoOverlap(await metrics(page), scenario);
}

async function runScenario(browser, viewport, backgroundId) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
    isMobile: true
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  const scenario = { viewport: viewport.id, backgroundId };
  try {
    await runHome(page, { ...scenario, screen: 'home' });
    await page.screenshot({ path: `${outDir}/${viewport.id}__${backgroundId}__home-motion.png`, fullPage: true });
    await runPlacement(page, { ...scenario, screen: 'placement' });
    await page.screenshot({ path: `${outDir}/${viewport.id}__${backgroundId}__placement-motion.png`, fullPage: true });
    await runWardrobe(page, { ...scenario, screen: 'wardrobe' });
    await page.screenshot({ path: `${outDir}/${viewport.id}__${backgroundId}__wardrobe-motion.png`, fullPage: true });
    await runGacha(page, { ...scenario, screen: 'gacha' });
    await page.screenshot({ path: `${outDir}/${viewport.id}__${backgroundId}__gacha-motion.png`, fullPage: true });
    await runStorage(page, { ...scenario, screen: 'storage' });
    await page.screenshot({ path: `${outDir}/${viewport.id}__${backgroundId}__storage-motion.png`, fullPage: true });
    assert(errors.length === 0, 'console or page errors occurred', { ...scenario, errors });
    return { ...scenario, ok: true };
  } finally {
    await context.close();
  }
}

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const failures = [];

try {
  for (const viewport of viewports) {
    for (const backgroundId of backgroundIds) {
      try {
        results.push(await runScenario(browser, viewport, backgroundId));
      } catch (error) {
        failures.push({
          viewport: viewport.id,
          backgroundId,
          message: error.message,
          details: error.details ?? null
        });
      }
    }
  }

  const report = { ok: failures.length === 0, baseUrl, outDir, scenarios: results.length + failures.length, results, failures };
  await fs.writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2));
  if (failures.length > 0) {
    console.error(JSON.stringify({ ok: false, baseUrl, outDir, failures: failures.slice(0, 12) }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ ok: true, baseUrl, outDir, scenarios: results.length }, null, 2));
  }
} finally {
  await browser.close();
}
