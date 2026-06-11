import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseUrl = process.env.ANIMALBOX_QA_URL ?? 'http://127.0.0.1:5173';
const outDir = 'output/playwright/placement-fit-qa';
const storageKey = 'animalbox.prototype.v1';

const allRewardIds = [
  'floating-island',
  'morning-pasture',
  'starlight-night',
  'sunset-clover-isle',
  'rainy-glass-garden',
  'flower-cloud-terrace',
  'moonlit-hay-field',
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
  'daisy-ear-clip'
];

const qaSave = {
  economy: { coins: 12850, tickets: 15, shards: 42, incomePerSecond: 14 },
  screen: 'home',
  selectedBackgroundId: 'sunset-clover-isle',
  selectedVariantId: 'agouti',
  selectedDeguShotId: '04',
  selectedOutfitIds: ['acorn-beret', 'mint-scarf'],
  placedDecor: [
    { instanceId: 'qa-hideout', itemId: 'ceramic-hideout', cellX: 0, cellY: 3, footprint: { w: 2, h: 2 } },
    { instanceId: 'qa-hay', itemId: 'timothy-hay-rack', cellX: 0, cellY: 2, footprint: { w: 2, h: 1 } },
    { instanceId: 'qa-sand', itemId: 'sand-bath-bowl', cellX: 1, cellY: 3, footprint: { w: 1, h: 1 } },
    { instanceId: 'qa-sprout', itemId: 'seed-sprout-pot', cellX: 5, cellY: 2, footprint: { w: 1, h: 1 } },
    { instanceId: 'qa-mail', itemId: 'sky-mailbox', cellX: 5, cellY: 3, footprint: { w: 1, h: 1 } },
    { instanceId: 'qa-bell', itemId: 'bellflower-planter', cellX: 3, cellY: 4, footprint: { w: 2, h: 1 } }
  ],
  ownedRewardIds: allRewardIds,
  gachaHistory: [],
  pullsSinceRare: 0,
  progression: { xp: 260, ticketProgress: 320, ownedUpgradeIds: ['seed-snack', 'soft-brush'] }
};

function rectPercent(rect, container) {
  return {
    x: ((rect.left - container.left) / container.width) * 100,
    y: ((rect.top - container.top) / container.height) * 100,
    w: (rect.width / container.width) * 100,
    h: (rect.height / container.height) * 100,
    right: ((rect.right - container.left) / container.width) * 100,
    bottom: ((rect.bottom - container.top) / container.height) * 100
  };
}

function intersects(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
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
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true
});

const page = await context.newPage();

async function goto(screen, save = qaSave) {
  await page.goto(`${baseUrl}/?screen=${screen}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.evaluate(
    ({ key, save }) => {
      window.localStorage.setItem(key, JSON.stringify(save));
    },
    { key: storageKey, save: { ...save, screen } }
  );
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('.phone', { timeout: 10000 });
  await page.waitForTimeout(900);
}

async function detectBackgroundMask() {
  return page.evaluate(async () => {
    const image = document.querySelector('.scene-background');
    const phone = document.querySelector('.phone');
    if (!(image instanceof HTMLImageElement) || !phone) return null;
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
        const isGrass = g > 85 && g > b * 1.08 && g > r * 0.68 && y > canvas.height * 0.39;
        const isEarth = r > 75 && g > 50 && b < 130 && r > b * 1.1 && y > canvas.height * 0.45;
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

async function annotateHome(mask) {
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
    if (mask) {
      addBox({ x: mask.x, y: mask.y, w: mask.right - mask.x, h: mask.bottom - mask.y }, 'mask', 'BG MASK');
    }
    if (degu) {
      addBox(percent(degu), 'degu', 'DEGU');
    }
    if (bottom) {
      addBox(percent(bottom), 'bottom', 'BOTTOM UI');
    }
  }, mask);
}

async function measureHome() {
  const mask = await detectBackgroundMask();
  await annotateHome(mask);
  await page.screenshot({ path: `${outDir}/home-scale-fit.png`, fullPage: true });

  const metrics = await page.evaluate(() => {
    const phone = document.querySelector('.phone')?.getBoundingClientRect();
    const degu = document.querySelector('.degu-button')?.getBoundingClientRect();
    const bottom = document.querySelector('.game-loop-panel')?.getBoundingClientRect();
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
        rect: {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        },
        percent: phone ? {
          x: ((rect.left - phone.left) / phone.width) * 100,
          y: ((rect.top - phone.top) / phone.height) * 100,
          w: (rect.width / phone.width) * 100,
          h: (rect.height / phone.height) * 100,
          bottom: ((rect.bottom - phone.top) / phone.height) * 100
        } : null
      };
    });
    return {
      phone: phone ? { width: phone.width, height: phone.height } : null,
      degu: degu && phone ? percent(degu, phone) : null,
      bottom: bottom && phone ? percent(bottom, phone) : null,
      decor
    };
  });

  assert(metrics.phone, 'phone rect missing');
  assert(metrics.degu, 'degu rect missing');
  assert(metrics.bottom, 'bottom panel rect missing');
  assert(metrics.degu.w <= 30, 'degu is too large relative to the phone scene', metrics.degu);
  assert(metrics.degu.w >= 21, 'degu became too small to read as the main character', metrics.degu);

  for (const item of metrics.decor) {
    assert(item.percent.w <= 22, `decor ${item.id} is too large for the island scale`, item);
    assert(item.percent.bottom < metrics.bottom.y - 1.2, `decor ${item.id} collides with bottom UI`, {
      decor: item,
      bottom: metrics.bottom
    });
  }

  assert(mask && mask.coverage > 0.02, 'background island mask detection failed', mask ?? {});
  return { mask, metrics };
}

async function verifyPlacementCandidates() {
  await goto('placement', { ...qaSave, placedDecor: [] });
  await page.screenshot({ path: `${outDir}/placement-valid-cells.png`, fullPage: true });

  const failures = [];
  const decorButtons = await page.locator('.asset-card[data-locked="false"]').count();
  for (let decorIndex = 0; decorIndex < decorButtons; decorIndex += 1) {
    const decorButton = page.locator('.asset-card[data-locked="false"]').nth(decorIndex);
    await decorButton.scrollIntoViewIfNeeded();
    await decorButton.click();
    await page.waitForTimeout(40);

    const label = await decorButton.getAttribute('aria-label');
    const validCount = await page.locator('.cell-button[data-valid="true"]').count();
    assert(validCount > 0, `no valid cells for ${label}`);

    const sampleCount = Math.min(validCount, 8);
    for (let i = 0; i < sampleCount; i += 1) {
      const cell = page.locator('.cell-button[data-valid="true"]').nth(Math.floor((i * validCount) / sampleCount));
      await cell.click();
      await page.waitForTimeout(30);
      const state = await page.evaluate(() => {
        const ghost = document.querySelector('.placement-ghost')?.getBoundingClientRect();
        const bottom = document.querySelector('.placement-sheet')?.getBoundingClientRect();
        const degu = document.querySelector('.degu-button')?.getBoundingClientRect();
        const selected = document.querySelector('.cell-button[data-selected="true"]');
        if (!ghost || !bottom || !degu || !selected) return null;
        const ghostArea = ghost.width * ghost.height;
        const ix = Math.max(0, Math.min(ghost.right, degu.right) - Math.max(ghost.left, degu.left));
        const iy = Math.max(0, Math.min(ghost.bottom, degu.bottom) - Math.max(ghost.top, degu.top));
        return {
          decorId: document.querySelector('.placement-ghost')?.dataset.decorId,
          cell: `${selected.dataset.cellX}:${selected.dataset.cellY}`,
          collidesBottom: ghost.bottom > bottom.top - 8,
          deguOverlapRatio: ghostArea > 0 ? (ix * iy) / ghostArea : 0,
          ghost: { left: ghost.left, top: ghost.top, right: ghost.right, bottom: ghost.bottom, width: ghost.width, height: ghost.height },
          bottom: { top: bottom.top },
          degu: { left: degu.left, top: degu.top, right: degu.right, bottom: degu.bottom }
        };
      });

      if (!state) {
        failures.push({ label, issue: 'missing placement measurement' });
        continue;
      }
      if (state.collidesBottom) {
        failures.push({ label, issue: 'bottom collision', state });
      }
      if (state.deguOverlapRatio > 0.38) {
        failures.push({ label, issue: 'excessive degu overlap', state });
      }
    }
  }

  assert(failures.length === 0, 'placement candidate visual fit failures', failures.slice(0, 12));
  return { checkedDecor: decorButtons };
}

try {
  await goto('home');
  const home = await measureHome();
  const placement = await verifyPlacementCandidates();
  const result = { outDir, home, placement };
  await fs.writeFile(`${outDir}/metrics.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ ok: true, outDir, checkedDecor: placement.checkedDecor }, null, 2));
} catch (error) {
  await page.screenshot({ path: `${outDir}/failure.png`, fullPage: true }).catch(() => undefined);
  console.error(JSON.stringify({
    ok: false,
    message: error.message,
    details: error.details ?? null,
    outDir
  }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
