import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.ANIMALBOX_QA_URL ?? 'http://127.0.0.1:5173';
const runId = process.env.ANIMALBOX_QA_LOOP ?? new Date().toISOString().replace(/[:.]/g, '-');
const outDir = `output/playwright/ui-layout-audit/${runId}`;
const storageKey = 'animalbox.prototype.v1';

const viewports = [
  { id: 'short-320x568', width: 320, height: 568 },
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

const animalIds = ['macaroni-mouse', 'chinchilla', 'gerbil', 'hamster', 'rabbit'];

const outfitIds = [
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

async function collectSourceRewardIds() {
  const gameFiles = await fs.readdir('src/game');
  const sourceFiles = [
    'src/game/content.ts',
    ...gameFiles
      .filter((file) => /^catalog.*Expansion\.ts$/.test(file))
      .map((file) => `src/game/${file}`)
  ];
  const ignored = new Set([
    'all',
    'background',
    'degu-variant',
    'pose',
    'animal',
    'decor',
    'accessory',
    'common',
    'rare',
    'special',
    'starter',
    'event',
    'head',
    'neck',
    'back',
    'face',
    'top'
  ]);
  const ids = new Set();

  for (const file of sourceFiles) {
    const source = await fs.readFile(file, 'utf8');
    for (const match of source.matchAll(/'([a-z0-9][a-z0-9-]*)'/g)) {
      const id = match[1];
      if (!ignored.has(id)) ids.add(id);
    }
  }

  return [...ids];
}

const sourceRewardIds = await collectSourceRewardIds();

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
  ...animalIds,
  ...decorIds,
  ...outfitIds,
  ...sourceRewardIds
];

const baseSave = {
  economy: { coins: 12850, tickets: 18, shards: 42, incomePerSecond: 18 },
  screen: 'home',
  selectedBackgroundId: 'floating-island',
  selectedVariantId: 'agouti',
  selectedDeguShotId: 'rabbit',
  customDeguTone: { hue: 0, saturation: 100, brightness: 100 },
  selectedOutfitIds: ['straw-hat', 'cloud-puff', 'clover-charm', 'acorn-charm', 'seed-pouch-charm'],
  accessoryPlacements: {},
  placedDecor: [],
  ownedRewardIds: allRewardIds,
  gachaHistory: ['cloud-cap', 'flower-patch', 'morning-pasture'],
  pullsSinceRare: 4,
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
    selectedBackgroundId: slot === 2 ? 'flower-cloud-terrace' : 'floating-island',
    placedDecor:
      slot === 1
        ? [
            { instanceId: 'preset-fence', itemId: 'short-wooden-fence', cellX: 0, cellY: 2, footprint: { w: 2, h: 1 } },
            { instanceId: 'preset-snack', itemId: 'snack-tray', cellX: 5, cellY: 3, footprint: { w: 1, h: 1 } }
          ]
        : [],
    updatedAt: slot === 3 ? null : 1781200000000 + slot
  }))
};

const homePlacedDecor = [
  { instanceId: 'qa-hay', itemId: 'timothy-hay-rack', cellX: 0, cellY: 2, footprint: { w: 2, h: 1 } },
  { instanceId: 'qa-hideout', itemId: 'ceramic-hideout', cellX: 0, cellY: 2, footprint: { w: 2, h: 2 } },
  { instanceId: 'qa-mail', itemId: 'sky-mailbox', cellX: 5, cellY: 3, footprint: { w: 1, h: 1 } },
  { instanceId: 'qa-flower', itemId: 'flower-patch', cellX: 3, cellY: 3, footprint: { w: 2, h: 1 } }
];

const screenOrder = ['home', 'placement', 'wardrobe', 'gacha', 'storage'];

function fail(message, details = {}) {
  return { level: 'fail', message, details };
}

function warn(message, details = {}) {
  return { level: 'warn', message, details };
}

function rectGap(a, b) {
  return {
    horizontal: Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right)),
    vertical: Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom))
  };
}

function overlaps(a, b, pad = 0) {
  return (
    a.left < b.right + pad &&
    a.right > b.left - pad &&
    a.top < b.bottom + pad &&
    a.bottom > b.top - pad
  );
}

function verticalClearance(upper, lower) {
  return lower.top - upper.bottom;
}

function inside(container, rect, pad = 0.5) {
  return (
    rect.left >= container.left - pad &&
    rect.top >= container.top - pad &&
    rect.right <= container.right + pad &&
    rect.bottom <= container.bottom + pad
  );
}

async function gotoSeeded(page, screen, backgroundId) {
  const placedDecor = screen === 'home' ? homePlacedDecor : [];
  const save = { ...baseSave, screen, selectedBackgroundId: backgroundId, placedDecor };

  await page.goto(`${baseUrl}/?screen=${screen}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.evaluate(
    ({ key, save }) => {
      window.localStorage.setItem(key, JSON.stringify(save));
    },
    { key: storageKey, save }
  );
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('.phone', { timeout: 10000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(250);
}

async function collectMetrics(page, screen) {
  return page.evaluate((screen) => {
    const visible = (node) => {
      if (!node) return false;
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const rectOf = (selector) => {
      const node = document.querySelector(selector);
      if (!visible(node)) return null;
      const rect = node.getBoundingClientRect();
      return {
        selector,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      };
    };
    const allRects = (selector) =>
      [...document.querySelectorAll(selector)].filter(visible).map((node, index) => {
        const rect = node.getBoundingClientRect();
        return {
          selector,
          index,
          text: (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
          aria: node.getAttribute('aria-label'),
          className: node.className?.toString?.() ?? '',
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          clientWidth: node.clientWidth,
          scrollWidth: node.scrollWidth,
          clientHeight: node.clientHeight,
          scrollHeight: node.scrollHeight
        };
      });
    const phone = rectOf('.phone');
    const degu = rectOf('.degu-button');
    const stage = rectOf('.pixel-degu-stage--wardrobe');
    const nav = rectOf('.bottom-nav');
    const assetWarning = Boolean(document.querySelector('.asset-warning'));
    const validCells = document.querySelectorAll('.cell-button[data-valid="true"]').length;
    const lockedDecor = document.querySelectorAll('.placement-sheet .asset-card[data-locked="true"]').length;
    const buttons = allRects('button');
    const textOverflowButtons = buttons.filter((button) => {
      const text = button.text;
      if (
        !text ||
        button.className.includes('nav-item') ||
        button.className.includes('variant-button') ||
        button.className.includes('shot-button')
      ) {
        return false;
      }
      return button.scrollWidth > button.clientWidth + 3 || button.scrollHeight > button.clientHeight + 3;
    });
    const smallTargets = buttons.filter((button) => button.width > 0 && button.height > 0 && (button.width < 34 || button.height < 34));
    const images = allRects('img');
    return {
      screen,
      url: window.location.href,
      phone,
      nav,
      degu,
      stage,
      assetWarning,
      validCells,
      lockedDecor,
      buttons,
      textOverflowButtons,
      smallTargets,
      images,
      homePanel: rectOf('.game-loop-panel'),
      placementSheet: rectOf('.placement-sheet'),
      placementNudge: rectOf('.placement-nudge'),
      placementGhost: rectOf('.placement-ghost'),
      placementFloor: rectOf('.fixed-island-floor'),
      actionRow: rectOf('.placement-sheet .action-row'),
      wardrobeGrid: rectOf('.wardrobe-grid'),
      shotRow: rectOf('.shot-row'),
      variantRow: rectOf('.variant-row'),
      tonePanel: rectOf('.tone-panel'),
      accessoryTunePanel: rectOf('.accessory-tune-panel'),
      applyButton: rectOf('.apply-button'),
      gachaMachine: rectOf('.gacha-machine'),
      freeLabel: rectOf('.free-label'),
      pullRow: rectOf('.pull-row'),
      rewardStrip: rectOf('.reward-strip'),
      historyChip: rectOf('.history-chip'),
      storageSheet: rectOf('.storage-sheet'),
      mapChips: allRects('.map-chip'),
      presetCards: allRects('.layout-preset-card'),
      themeCards: allRects('.theme-card'),
      collectionCards: allRects('.collection-card'),
      marketOfferCards: allRects('.market-offer-card')
    };
  }, screen);
}

function auditCommon(metrics, scenario) {
  const issues = [];
  if (!metrics.phone) return [fail('phone frame missing', scenario)];
  if (!metrics.nav) issues.push(fail('bottom nav missing', scenario));
  if (metrics.assetWarning) issues.push(fail('asset warning visible', scenario));

  for (const key of [
    'nav',
    'homePanel',
    'placementSheet',
    'placementNudge',
    'placementGhost',
    'placementFloor',
    'wardrobeGrid',
    'shotRow',
    'variantRow',
    'tonePanel',
    'accessoryTunePanel',
    'applyButton',
    'gachaMachine',
    'freeLabel',
    'pullRow',
    'rewardStrip',
    'historyChip',
    'storageSheet'
  ]) {
    const rect = metrics[key];
    if (rect && !inside(metrics.phone, rect)) {
      issues.push(fail(`${key} escapes phone frame`, { ...scenario, rect }));
    }
  }

  for (const button of metrics.textOverflowButtons) {
    issues.push(fail('button text overflow', { ...scenario, button }));
  }
  for (const button of metrics.smallTargets) {
    issues.push(warn('tap target below 34px', { ...scenario, button }));
  }
  return issues;
}

function auditHome(metrics, scenario) {
  const issues = [];
  if (!metrics.degu) issues.push(fail('home degu missing', scenario));
  if (!metrics.homePanel) issues.push(fail('home progression panel missing', scenario));
  if (!metrics.nav) return issues;
  if (metrics.degu && metrics.phone) {
    const ratio = metrics.degu.width / metrics.phone.width;
    if (ratio < 0.14 || ratio > 0.31) {
      issues.push(fail('home degu/background size ratio out of range', { ...scenario, ratio, degu: metrics.degu, phone: metrics.phone }));
    }
  }
  if (metrics.homePanel) {
    const gap = verticalClearance(metrics.homePanel, metrics.nav);
    if (gap < 10) issues.push(fail('home panel too close to bottom nav', { ...scenario, gap }));
    if (metrics.degu && overlaps(metrics.degu, metrics.homePanel, 4)) {
      issues.push(warn('home degu touches progression panel', { ...scenario, degu: metrics.degu, homePanel: metrics.homePanel }));
    }
  }
  return issues;
}

function auditPlacement(metrics, scenario) {
  const issues = [];
  if (!metrics.placementSheet) issues.push(fail('placement sheet missing', scenario));
  if (!metrics.placementNudge) issues.push(fail('placement nudge controls missing', scenario));
  if (!metrics.placementGhost) issues.push(fail('placement ghost missing', scenario));
  if (!metrics.placementFloor) issues.push(fail('placement island floor missing', scenario));
  if (metrics.validCells <= 0) issues.push(fail('placement has no valid cells', scenario));
  if (metrics.lockedDecor > 0) issues.push(warn('placement inventory includes locked goal decor', { ...scenario, lockedDecor: metrics.lockedDecor }));
  if (metrics.mapChips.length !== 3) issues.push(fail('placement map chips missing', { ...scenario, count: metrics.mapChips.length }));
  if (metrics.placementSheet && metrics.nav) {
    const gap = verticalClearance(metrics.placementSheet, metrics.nav);
    if (gap < 10) issues.push(fail('placement sheet too close to bottom nav', { ...scenario, gap }));
  }
  if (metrics.placementNudge && metrics.placementSheet) {
    const insideSheet = inside(metrics.placementSheet, metrics.placementNudge, 2);
    const gap = verticalClearance(metrics.placementNudge, metrics.placementSheet);
    if (!insideSheet && gap < 6) {
      issues.push(fail('placement nudge controls should be inside or above the edit sheet', { ...scenario, gap, nudge: metrics.placementNudge, sheet: metrics.placementSheet }));
    }
  }
  if (metrics.placementNudge && metrics.nav && overlaps(metrics.placementNudge, metrics.nav, 0)) {
    issues.push(fail('placement nudge controls overlap bottom nav', { ...scenario, nudge: metrics.placementNudge, nav: metrics.nav }));
  }
  if (metrics.placementGhost && metrics.placementSheet) {
    const gap = verticalClearance(metrics.placementGhost, metrics.placementSheet);
    if (gap < 8) issues.push(fail('placement ghost collides with placement sheet', { ...scenario, gap, ghost: metrics.placementGhost, sheet: metrics.placementSheet }));
  }
  if (metrics.phone && metrics.placementSheet && metrics.placementFloor) {
    const sheetTopRatio = (metrics.placementSheet.top - metrics.phone.top) / metrics.phone.height;
    const floorVisibleRatio =
      Math.max(0, Math.min(metrics.placementFloor.bottom, metrics.placementSheet.top) - metrics.placementFloor.top) /
      metrics.placementFloor.height;
    const minSheetTopRatio = metrics.phone.height < 620 ? 0.63 : 0.68;
    if (sheetTopRatio < minSheetTopRatio && floorVisibleRatio < 0.98) {
      issues.push(fail('placement sheet hides too much of the island', { ...scenario, sheetTopRatio, minSheetTopRatio, sheet: metrics.placementSheet }));
    }
    if (floorVisibleRatio < 0.88) {
      issues.push(fail('placement island floor is obscured', { ...scenario, floorVisibleRatio, floor: metrics.placementFloor, sheet: metrics.placementSheet }));
    }
  }
  return issues;
}

function auditWardrobe(metrics, scenario) {
  const issues = [];
  for (const key of ['stage', 'shotRow', 'variantRow', 'tonePanel', 'accessoryTunePanel', 'applyButton', 'wardrobeGrid']) {
    if (!metrics[key]) issues.push(fail(`wardrobe ${key} missing`, scenario));
  }
  if (metrics.nav && metrics.wardrobeGrid) {
    const gap = verticalClearance(metrics.wardrobeGrid, metrics.nav);
    if (gap < 10) issues.push(fail('wardrobe grid too close to bottom nav', { ...scenario, gap }));
  }
  if (metrics.stage && metrics.shotRow) {
    const gap = verticalClearance(metrics.stage, metrics.shotRow);
    if (gap < 2) issues.push(fail('wardrobe degu preview collides with shot row', { ...scenario, gap }));
  }
  if (metrics.shotRow && metrics.variantRow) {
    if (overlaps(metrics.shotRow, metrics.variantRow, 2)) {
      issues.push(fail('wardrobe shot row overlaps color row', { ...scenario, shotRow: metrics.shotRow, variantRow: metrics.variantRow }));
    }
  }
  if (metrics.variantRow && metrics.applyButton && overlaps(metrics.variantRow, metrics.applyButton, 2)) {
    issues.push(fail('wardrobe color row overlaps apply button', { ...scenario, gap: rectGap(metrics.variantRow, metrics.applyButton), variantRow: metrics.variantRow, applyButton: metrics.applyButton }));
  }
  if (metrics.tonePanel && metrics.accessoryTunePanel) {
    const gap = verticalClearance(metrics.tonePanel, metrics.accessoryTunePanel);
    if (gap < 4) issues.push(fail('wardrobe tone panel too close to accessory tools', { ...scenario, gap }));
  }
  if (metrics.accessoryTunePanel && metrics.shotRow && overlaps(metrics.accessoryTunePanel, metrics.shotRow, 2)) {
    issues.push(fail('wardrobe accessory tools overlap shot row', { ...scenario, accessoryTunePanel: metrics.accessoryTunePanel, shotRow: metrics.shotRow }));
  }
  if (metrics.variantRow && metrics.wardrobeGrid) {
    const gap = verticalClearance(metrics.variantRow, metrics.wardrobeGrid);
    if (gap < 12) issues.push(fail('wardrobe color row too close to outfit grid', { ...scenario, gap }));
  }
  if (metrics.applyButton && metrics.wardrobeGrid) {
    const gap = verticalClearance(metrics.applyButton, metrics.wardrobeGrid);
    if (gap < 12) issues.push(fail('wardrobe apply button too close to outfit grid', { ...scenario, gap }));
  }
  return issues;
}

function auditGacha(metrics, scenario) {
  const issues = [];
  for (const key of ['gachaMachine', 'freeLabel', 'pullRow', 'rewardStrip', 'historyChip']) {
    if (!metrics[key]) issues.push(fail(`gacha ${key} missing`, scenario));
  }
  if (metrics.pullRow && metrics.rewardStrip) {
    const gap = verticalClearance(metrics.pullRow, metrics.rewardStrip);
    if (gap < 8) issues.push(fail('gacha pull buttons too close to reward strip', { ...scenario, gap }));
  }
  if (metrics.rewardStrip && metrics.historyChip) {
    const gap = verticalClearance(metrics.rewardStrip, metrics.historyChip);
    if (gap < 8) issues.push(fail('gacha reward strip too close to history chip', { ...scenario, gap }));
  }
  if (metrics.historyChip && metrics.nav) {
    const gap = verticalClearance(metrics.historyChip, metrics.nav);
    if (gap < 8) issues.push(fail('gacha history chip too close to bottom nav', { ...scenario, gap }));
  }
  return issues;
}

function auditStorage(metrics, scenario) {
  const issues = [];
  if (!metrics.storageSheet) issues.push(fail('storage sheet missing', scenario));
  if (metrics.mapChips.length !== 3) issues.push(fail('storage map chips missing', { ...scenario, count: metrics.mapChips.length }));
  if (metrics.collectionCards.length !== 6) issues.push(fail('storage collection cards missing', { ...scenario, count: metrics.collectionCards.length }));
  if (metrics.marketOfferCards.length !== 2) issues.push(fail('storage market offers missing', { ...scenario, count: metrics.marketOfferCards.length }));
  if (metrics.presetCards.length !== 3) issues.push(fail('storage preset cards missing', { ...scenario, count: metrics.presetCards.length }));
  if (metrics.themeCards.length !== backgroundIds.length) issues.push(fail('storage theme cards missing', { ...scenario, count: metrics.themeCards.length }));
  if (metrics.storageSheet && metrics.nav) {
    const gap = verticalClearance(metrics.storageSheet, metrics.nav);
    if (gap < 10) issues.push(fail('storage sheet too close to bottom nav', { ...scenario, gap }));
  }
  return issues;
}

function auditMetrics(metrics, scenario) {
  const issues = auditCommon(metrics, scenario);
  if (metrics.screen === 'home') issues.push(...auditHome(metrics, scenario));
  if (metrics.screen === 'placement') issues.push(...auditPlacement(metrics, scenario));
  if (metrics.screen === 'wardrobe') issues.push(...auditWardrobe(metrics, scenario));
  if (metrics.screen === 'gacha') issues.push(...auditGacha(metrics, scenario));
  if (metrics.screen === 'storage') issues.push(...auditStorage(metrics, scenario));
  return issues;
}

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const scenarios = [];
const issues = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
      isMobile: true
    });
    const page = await context.newPage();

    try {
      for (const backgroundId of backgroundIds) {
        for (const screen of screenOrder) {
          const scenario = { viewport: viewport.id, backgroundId, screen };
          try {
            await gotoSeeded(page, screen, backgroundId);
            const metrics = await collectMetrics(page, screen);
            const scenarioIssues = auditMetrics(metrics, scenario);
            const screenshot = `${outDir}/${viewport.id}__${backgroundId}__${screen}.png`;
            await page.screenshot({ path: screenshot, fullPage: true });
            scenarios.push({ ...scenario, screenshot, metrics, issues: scenarioIssues });
            issues.push(...scenarioIssues);
          } catch (error) {
            const screenshot = `${outDir}/${viewport.id}__${backgroundId}__${screen}__error.png`;
            await page.screenshot({ path: screenshot, fullPage: true }).catch(() => undefined);
            const issue = fail('scenario crashed', { ...scenario, message: error.message, screenshot });
            scenarios.push({ ...scenario, screenshot, metrics: null, issues: [issue] });
            issues.push(issue);
          }
        }
      }
    } finally {
      await context.close();
    }
  }

  const failures = issues.filter((issue) => issue.level === 'fail');
  const warnings = issues.filter((issue) => issue.level === 'warn');
  const report = { ok: failures.length === 0, baseUrl, outDir, viewports, backgroundIds, screenOrder, failures, warnings, scenarios };
  await fs.writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2));

  const topFailures = failures.slice(0, 20).map((issue) => ({
    message: issue.message,
    scenario: {
      viewport: issue.details?.viewport,
      backgroundId: issue.details?.backgroundId,
      screen: issue.details?.screen
    },
    gap: issue.details?.gap,
    ratio: issue.details?.ratio
  }));

  if (failures.length > 0) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          baseUrl,
          outDir,
          scenarios: scenarios.length,
          failures: failures.length,
          warnings: warnings.length,
          topFailures
        },
        null,
        2
      )
    );
    process.exitCode = 1;
  } else {
    console.log(
      JSON.stringify(
        {
          ok: true,
          baseUrl,
          outDir,
          scenarios: scenarios.length,
          warnings: warnings.length
        },
        null,
        2
      )
    );
  }
} finally {
  await browser.close();
}
