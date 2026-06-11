import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseUrl = process.env.ANIMALBOX_QA_URL ?? 'http://127.0.0.1:5173';
const outDir = 'output/playwright/placement-visual-qa-round2';
const storageKey = 'animalbox.prototype.v1';

const qaSave = {
  economy: { coins: 12850, tickets: 15, shards: 42, incomePerSecond: 14 },
  screen: 'home',
  selectedBackgroundId: 'sunset-clover-isle',
  selectedVariantId: 'agouti',
  selectedDeguShotId: '04',
  selectedOutfitIds: ['acorn-beret', 'mint-scarf', 'explorer-goggles', 'sky-satchel'],
  placedDecor: [
    { instanceId: 'qa-hay', itemId: 'timothy-hay-rack', cellX: 0, cellY: 0, footprint: { w: 2, h: 1 } },
    { instanceId: 'qa-sand', itemId: 'sand-bath-bowl', cellX: 2, cellY: 0, footprint: { w: 1, h: 1 } },
    { instanceId: 'qa-tunnel', itemId: 'wood-tunnel', cellX: 3, cellY: 0, footprint: { w: 2, h: 1 } },
    { instanceId: 'qa-hideout', itemId: 'ceramic-hideout', cellX: 0, cellY: 2, footprint: { w: 2, h: 2 } },
    { instanceId: 'qa-sprout', itemId: 'seed-sprout-pot', cellX: 5, cellY: 1, footprint: { w: 1, h: 1 } },
    { instanceId: 'qa-bridge', itemId: 'cloud-bridge', cellX: 2, cellY: 3, footprint: { w: 2, h: 1 } },
    { instanceId: 'qa-mail', itemId: 'sky-mailbox', cellX: 5, cellY: 3, footprint: { w: 1, h: 1 } },
    { instanceId: 'qa-bell', itemId: 'bellflower-planter', cellX: 3, cellY: 4, footprint: { w: 2, h: 1 } }
  ],
  ownedRewardIds: [
    'floating-island',
    'sunset-clover-isle',
    'agouti',
    '04',
    'clover-patch',
    'hay-bed',
    'straw-hat',
    'timothy-hay-rack',
    'sand-bath-bowl',
    'wood-tunnel',
    'ceramic-hideout',
    'seed-sprout-pot',
    'cloud-bridge',
    'sky-mailbox',
    'bellflower-planter',
    'acorn-beret',
    'mint-scarf',
    'explorer-goggles',
    'sky-satchel'
  ],
  gachaHistory: [],
  pullsSinceRare: 0,
  progression: { xp: 260, ticketProgress: 320, ownedUpgradeIds: ['seed-snack', 'soft-brush'] }
};

const grid = {
  originX: 25,
  originY: 39,
  stepX: 7.2,
  stepY: 5.4,
  cellW: 6.7,
  cellH: 5.1,
  cols: 6,
  rows: 6
};

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true
});
await context.addInitScript(
  ({ key, save }) => {
    window.localStorage.setItem(key, JSON.stringify(save));
  },
  { key: storageKey, save: qaSave }
);
const page = await context.newPage();

async function reset() {
  await page.goto(`${baseUrl}/?screen=home`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('.phone', { timeout: 10000 });
  await page.waitForTimeout(900);
}

async function screenshot(name) {
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
}

async function addCommonStyle() {
  await page.addStyleTag({
    content: `
      .scene-background { opacity: 0 !important; }
      .phone::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        background:
          linear-gradient(180deg,
            #a9def8 0 31%,
            #d9f4ff 31% 38%,
            #8fe083 38% 72%,
            #f7e5b1 72% 100%);
      }
      .qa-overlay {
        position: absolute;
        inset: 0;
        z-index: 120;
        pointer-events: none;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }
      .qa-cell {
        position: absolute;
        border: 1px solid rgba(21, 93, 255, 0.7);
        background: rgba(21, 93, 255, 0.08);
        color: #12245c;
        font-size: 9px;
        font-weight: 900;
        line-height: 1;
      }
      .qa-cell[data-occupied="true"] {
        border-color: rgba(255, 119, 0, 0.95);
        background: rgba(255, 196, 72, 0.25);
      }
      .qa-band {
        position: absolute;
        left: 22%;
        right: 18%;
        border-top: 1px solid rgba(255, 255, 255, 0.75);
        border-bottom: 1px solid rgba(54, 29, 16, 0.24);
        color: #33220f;
        font-size: 10px;
        font-weight: 900;
      }
      .qa-zone {
        position: absolute;
        left: 6%;
        right: 6%;
        border: 2px dashed rgba(57, 93, 55, 0.72);
        color: #23451b;
        background: rgba(255,255,255,0.48);
        font-size: 10px;
        font-weight: 900;
        text-align: center;
      }
      .qa-forbid {
        position: absolute;
        z-index: 121;
        border: 2px solid rgba(255, 23, 68, 0.85);
        background: rgba(255, 23, 68, 0.13);
        color: #7b0019;
        font-size: 10px;
        font-weight: 900;
      }
      .qa-box {
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        border: 2px solid #00e5ff;
        background: rgba(0, 229, 255, 0.05);
      }
      .qa-box[data-kind="outfit"] { border-color: #ffea00; background: rgba(255, 234, 0, 0.09); }
      .qa-box[data-kind="degu"] { border-color: #ff1744; background: rgba(255, 23, 68, 0.05); }
      .qa-label {
        position: absolute;
        left: 2px;
        top: 2px;
        padding: 1px 3px;
        border-radius: 2px;
        color: #142029;
        background: rgba(255, 255, 255, 0.86);
        font-size: 9px;
        font-weight: 900;
      }
      .qa-center {
        position: fixed;
        z-index: 10000;
        width: 7px;
        height: 7px;
        margin: -3px 0 0 -3px;
        border-radius: 50%;
        background: #ff1744;
        box-shadow: 0 0 0 2px #fff;
        pointer-events: none;
      }
    `
  });
}

async function addGrid({ occupied = false } = {}) {
  await page.evaluate(
    ({ grid, placed, occupied }) => {
      const phone = document.querySelector('.phone');
      const overlay = document.createElement('div');
      overlay.className = 'qa-overlay';
      const occupiedCells = new Set();
      if (occupied) {
        for (const item of placed) {
          for (let y = item.cellY; y < item.cellY + item.footprint.h; y += 1) {
            for (let x = item.cellX; x < item.cellX + item.footprint.w; x += 1) {
              occupiedCells.add(`${x}:${y}`);
            }
          }
        }
      }
      for (let y = 0; y < grid.rows; y += 1) {
        for (let x = 0; x < grid.cols; x += 1) {
          const cell = document.createElement('div');
          cell.className = 'qa-cell';
          cell.dataset.occupied = occupiedCells.has(`${x}:${y}`) ? 'true' : 'false';
          cell.style.left = `${grid.originX + x * grid.stepX}%`;
          cell.style.top = `${grid.originY + y * grid.stepY}%`;
          cell.style.width = `${grid.cellW}%`;
          cell.style.height = `${grid.cellH}%`;
          cell.textContent = `${x + 1}-${y + 1}`;
          overlay.appendChild(cell);
        }
      }
      phone?.appendChild(overlay);
    },
    { grid, placed: qaSave.placedDecor, occupied }
  );
}

async function addPlayableZone() {
  await page.evaluate(() => {
    const phone = document.querySelector('.phone');
    const overlay = document.createElement('div');
    overlay.className = 'qa-overlay';
    const zone = document.createElement('div');
    zone.className = 'qa-zone';
    zone.style.top = '37.5%';
    zone.style.height = '34.5%';
    zone.textContent = 'PLAYABLE SAFE ZONE';
    overlay.appendChild(zone);
    phone?.appendChild(overlay);
  });
}

async function addDepthBands() {
  await page.evaluate(({ grid }) => {
    const phone = document.querySelector('.phone');
    const overlay = document.createElement('div');
    overlay.className = 'qa-overlay';
    const colors = ['#76d68b44', '#76d68b36', '#f4d35e42', '#f4d35e34', '#ff9b5444', '#ff4f4f36'];
    for (let y = 0; y < grid.rows; y += 1) {
      const band = document.createElement('div');
      band.className = 'qa-band';
      band.style.top = `${grid.originY + y * grid.stepY}%`;
      band.style.height = `${grid.cellH}%`;
      band.style.background = colors[y];
      band.textContent = `row ${y + 1} / z ${20 + y}`;
      overlay.appendChild(band);
    }
    phone?.appendChild(overlay);
  }, { grid });
}

async function addForbiddenZones() {
  await page.evaluate(() => {
    const phone = document.querySelector('.phone');
    const overlay = document.createElement('div');
    overlay.className = 'qa-overlay';
    const degu = document.querySelector('.pixel-degu-stage')?.getBoundingClientRect();
    const phoneRect = phone?.getBoundingClientRect();
    if (degu && phoneRect) {
      const box = document.createElement('div');
      box.className = 'qa-forbid';
      box.style.left = `${((degu.left - phoneRect.left) / phoneRect.width) * 100 - 3}%`;
      box.style.top = `${((degu.top - phoneRect.top) / phoneRect.height) * 100 - 2}%`;
      box.style.width = `${(degu.width / phoneRect.width) * 100 + 6}%`;
      box.style.height = `${(degu.height / phoneRect.height) * 100 + 4}%`;
      box.textContent = 'DEGU NO-OVERLAP';
      overlay.appendChild(box);
    }
    const panel = document.querySelector('.game-loop-panel')?.getBoundingClientRect();
    if (panel && phoneRect) {
      const box = document.createElement('div');
      box.className = 'qa-forbid';
      box.style.left = `${((panel.left - phoneRect.left) / phoneRect.width) * 100}%`;
      box.style.top = `${((panel.top - phoneRect.top) / phoneRect.height) * 100}%`;
      box.style.width = `${(panel.width / phoneRect.width) * 100}%`;
      box.style.height = `${(panel.height / phoneRect.height) * 100}%`;
      box.textContent = 'BOTTOM UI';
      overlay.appendChild(box);
    }
    phone?.appendChild(overlay);
  });
}

async function addBounds({ compact = true } = {}) {
  await page.evaluate(({ compact }) => {
    const targets = [
      ...document.querySelectorAll('.runtime-decor'),
      ...document.querySelectorAll('.pixel-degu-stage'),
      ...document.querySelectorAll('.pixel-degu-outfit')
    ];
    for (const target of targets) {
      const rect = target.getBoundingClientRect();
      const box = document.createElement('div');
      const classes = target.className.toString();
      box.className = 'qa-box';
      box.dataset.kind = classes.includes('pixel-degu-stage')
        ? 'degu'
        : classes.includes('pixel-degu-outfit')
          ? 'outfit'
          : 'decor';
      box.style.left = `${rect.left}px`;
      box.style.top = `${rect.top}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
      if (!compact) {
        const label = document.createElement('span');
        label.className = 'qa-label';
        label.textContent = classes.split(' ').slice(-1)[0].replace('pixel-degu-outfit--', '');
        box.appendChild(label);
      }
      document.body.appendChild(box);
      const center = document.createElement('div');
      center.className = 'qa-center';
      center.style.left = `${rect.left + rect.width / 2}px`;
      center.style.top = `${rect.top + rect.height / 2}px`;
      document.body.appendChild(center);
    }
  }, { compact });
}

async function capture(name, steps) {
  await reset();
  await addCommonStyle();
  for (const step of steps) await step();
  await screenshot(name);
}

await capture('A-safe-map-grid', [addPlayableZone, () => addGrid()]);
await capture('B-safe-map-grid-bounds', [addPlayableZone, () => addGrid(), () => addBounds({ compact: true })]);
await capture('C-safe-map-depth-grid', [addPlayableZone, addDepthBands, () => addGrid()]);
await capture('D-safe-map-forbidden-bounds', [addPlayableZone, addForbiddenZones, () => addBounds({ compact: true })]);
await capture('E-safe-map-footprint-grid', [addPlayableZone, () => addGrid({ occupied: true }), () => addBounds({ compact: true })]);

await browser.close();

console.log(
  JSON.stringify(
    {
      outDir,
      selectedParent: '05-two-tone-safe-map',
      files: [
        'A-safe-map-grid.png',
        'B-safe-map-grid-bounds.png',
        'C-safe-map-depth-grid.png',
        'D-safe-map-forbidden-bounds.png',
        'E-safe-map-footprint-grid.png'
      ]
    },
    null,
    2
  )
);
