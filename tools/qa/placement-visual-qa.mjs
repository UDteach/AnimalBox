import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseUrl = process.env.ANIMALBOX_QA_URL ?? 'http://127.0.0.1:5173';
const outDir = 'output/playwright/placement-visual-qa';
const storageKey = 'animalbox.prototype.v1';

const ownedRewardIds = [
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
  '04',
  'hay-bed',
  'clover-patch',
  'water-bowl',
  'cloud-lamp',
  'angel-fountain',
  'windmill',
  'timothy-hay-rack',
  'sand-bath-bowl',
  'wood-tunnel',
  'ceramic-hideout',
  'seed-sprout-pot',
  'cloud-bridge',
  'sky-mailbox',
  'bellflower-planter',
  'straw-hat',
  'flower-crown',
  'pastel-ribbon',
  'round-glasses',
  'angel-halo-wings',
  'celestial-cape',
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
  ownedRewardIds,
  gachaHistory: ['moonlit-hay-field', 'cozy-poncho', 'bellflower-planter', 'timothy-hay-rack'],
  pullsSinceRare: 2,
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

async function addBaseQaStyle() {
  await page.addStyleTag({
    content: `
      .qa-overlay {
        position: absolute;
        inset: 0;
        z-index: 120;
        pointer-events: none;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }
      .qa-cell {
        position: absolute;
        border: 1px solid rgba(36, 97, 255, 0.7);
        background: rgba(36, 97, 255, 0.08);
        color: #12245c;
        font-size: 9px;
        font-weight: 900;
        line-height: 1;
      }
      .qa-band {
        position: absolute;
        left: 22%;
        right: 18%;
        border-top: 1px solid rgba(255, 255, 255, 0.65);
        border-bottom: 1px solid rgba(54, 29, 16, 0.25);
        color: #33220f;
        font-size: 10px;
        font-weight: 900;
      }
      .qa-box {
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        border: 2px solid #00e5ff;
        background: rgba(0, 229, 255, 0.06);
        color: #001b22;
        font-size: 10px;
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
      .qa-label {
        position: absolute;
        left: 2px;
        top: 2px;
        padding: 1px 3px;
        border-radius: 2px;
        background: rgba(255,255,255,0.82);
      }
    `
  });
}

async function addGridOverlay() {
  await page.evaluate(({ grid }) => {
    const phone = document.querySelector('.phone');
    const overlay = document.createElement('div');
    overlay.className = 'qa-overlay';
    overlay.setAttribute('data-qa', 'grid');
    for (let y = 0; y < grid.rows; y += 1) {
      for (let x = 0; x < grid.cols; x += 1) {
        const cell = document.createElement('div');
        cell.className = 'qa-cell';
        cell.style.left = `${grid.originX + x * grid.stepX}%`;
        cell.style.top = `${grid.originY + y * grid.stepY}%`;
        cell.style.width = `${grid.cellW}%`;
        cell.style.height = `${grid.cellH}%`;
        cell.textContent = `${x + 1}-${y + 1}`;
        overlay.appendChild(cell);
      }
    }
    phone?.appendChild(overlay);
  }, { grid });
}

async function addLayerBands() {
  await page.evaluate(({ grid }) => {
    const phone = document.querySelector('.phone');
    const overlay = document.createElement('div');
    overlay.className = 'qa-overlay';
    overlay.setAttribute('data-qa', 'layers');
    const colors = [
      'rgba(81, 196, 128, 0.18)',
      'rgba(81, 196, 128, 0.14)',
      'rgba(245, 202, 77, 0.18)',
      'rgba(245, 202, 77, 0.14)',
      'rgba(255, 129, 80, 0.18)',
      'rgba(255, 68, 68, 0.18)'
    ];
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

async function addBoundsOverlay() {
  await page.evaluate(() => {
    const targets = [
      ...document.querySelectorAll('.runtime-decor'),
      ...document.querySelectorAll('.pixel-degu-stage'),
      ...document.querySelectorAll('.pixel-degu-outfit')
    ];
    for (const target of targets) {
      const rect = target.getBoundingClientRect();
      const box = document.createElement('div');
      box.className = 'qa-box';
      box.style.left = `${rect.left}px`;
      box.style.top = `${rect.top}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
      box.textContent = target.className.toString().split(' ').slice(-1)[0].replace('pixel-degu-outfit--', '');
      document.body.appendChild(box);
      const center = document.createElement('div');
      center.className = 'qa-center';
      center.style.left = `${rect.left + rect.width / 2}px`;
      center.style.top = `${rect.top + rect.height / 2}px`;
      document.body.appendChild(center);
    }
  });
}

async function addTwoToneMap() {
  await page.addStyleTag({
    content: `
      .scene-background {
        opacity: 0 !important;
      }
      .phone::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        background:
          linear-gradient(180deg,
            #a9def8 0 31%,
            #d9f4ff 31% 38%,
            #8fe083 38% 73%,
            #f7e5b1 73% 100%);
      }
      .phone::after {
        content: "TOP HUD SAFE / PLAYABLE ISLAND / BOTTOM UI";
        position: absolute;
        left: 7%;
        right: 7%;
        top: 34%;
        z-index: 119;
        padding: 4px 6px;
        border: 2px solid rgba(28, 87, 45, 0.55);
        color: #244617;
        background: rgba(255,255,255,0.62);
        font: 900 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        text-align: center;
        pointer-events: none;
      }
    `
  });
}

await reset();
await screenshot('01-plain');

await reset();
await addBaseQaStyle();
await addGridOverlay();
await screenshot('02-cell-grid');

await reset();
await addBaseQaStyle();
await addLayerBands();
await screenshot('03-depth-layers');

await reset();
await addBaseQaStyle();
await addBoundsOverlay();
await screenshot('04-rendered-bounds');

await reset();
await addBaseQaStyle();
await addTwoToneMap();
await addGridOverlay();
await screenshot('05-two-tone-safe-map');

await browser.close();

console.log(
  JSON.stringify(
    {
      outDir,
      files: [
        '01-plain.png',
        '02-cell-grid.png',
        '03-depth-layers.png',
        '04-rendered-bounds.png',
        '05-two-tone-safe-map.png'
      ]
    },
    null,
    2
  )
);
