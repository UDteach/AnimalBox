import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.ANIMALBOX_QA_URL ?? 'http://127.0.0.1:5173';
const runId = process.env.ANIMALBOX_QA_LOOP ?? new Date().toISOString().replace(/[:.]/g, '-');
const outDir = `output/playwright/ui-smoke-audit/${runId}`;
const storageKey = 'animalbox.prototype.v1';

const viewports = [
  { id: 'compact-320x700', width: 320, height: 700 },
  { id: 'phone-390x844', width: 390, height: 844 }
];

const screens = [
  { id: 'home', selector: '.fixed-island-floor' },
  { id: 'placement', selector: '.placement-sheet' },
  { id: 'wardrobe', selector: '.wardrobe-screen' },
  { id: 'gacha', selector: '.gacha-screen' },
  { id: 'storage', selector: '.storage-sheet' }
];

const smokeSave = {
  economy: { coins: 24000, tickets: 28, shards: 120, incomePerSecond: 32 },
  screen: 'home',
  selectedBackgroundId: 'floating-island',
  selectedVariantId: 'agouti',
  selectedDeguShotId: '04',
  customDeguTone: { hue: 0, saturation: 100, brightness: 100 },
  selectedOutfitIds: ['straw-hat', 'cloud-puff', 'sprout-buddy'],
  accessoryPlacements: {},
  placedDecor: [
    { instanceId: 'smoke-hay', itemId: 'hay-bed', cellX: 1, cellY: 3, footprint: { w: 2, h: 1 } },
    { instanceId: 'smoke-lamp', itemId: 'cloud-lamp', cellX: 5, cellY: 2, footprint: { w: 1, h: 1 } }
  ],
  ownedRewardIds: [
    'floating-island',
    'agouti',
    '04',
    'clover-patch',
    'hay-bed',
    'straw-hat',
    'cloud-puff',
    'sprout-buddy',
    'cloud-lamp',
    'moss-arch',
    'moon-birdbath',
    'rainbow-hood',
    'dew-orb-buddy',
    'pose-curled'
  ],
  gachaHistory: ['moss-arch', 'rainbow-hood', 'pose-curled'],
  pullsSinceRare: 3,
  progression: {
    xp: 380,
    ticketProgress: 220,
    ownedUpgradeIds: ['seed-snack', 'soft-brush'],
    affection: 72,
    careStreak: 2
  }
};

function rectIsUsable(rect) {
  return rect.width >= 24 && rect.height >= 24;
}

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const records = [];
const issues = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  for (const screen of screens) {
    const save = { ...smokeSave, screen: screen.id };
    await page.goto(`${baseUrl}/?screen=${screen.id}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.evaluate(
      ({ key, save }) => window.localStorage.setItem(key, JSON.stringify(save)),
      { key: storageKey, save }
    );
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForSelector('.phone', { timeout: 10000 });
    await page.waitForSelector(screen.selector, { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);
    await page.waitForTimeout(180);

    const metrics = await page.evaluate((selector) => {
      const target = document.querySelector(selector);
      const phone = document.querySelector('.phone');
      const body = document.body;
      const rect = target?.getBoundingClientRect();
      const phoneRect = phone?.getBoundingClientRect();
      const visibleImages = [...document.querySelectorAll('img')]
        .filter((img) => {
          const box = img.getBoundingClientRect();
          const style = window.getComputedStyle(img);
          return style.visibility !== 'hidden' && style.display !== 'none' && box.width > 0 && box.height > 0;
        })
        .length;

      return {
        targetRect: rect ? { width: rect.width, height: rect.height } : null,
        phoneRect: phoneRect ? { width: phoneRect.width, height: phoneRect.height } : null,
        viewportWidth: window.innerWidth,
        bodyScrollWidth: body.scrollWidth,
        visibleImages
      };
    }, screen.selector);

    const screenshot = `${outDir}/${viewport.id}-${screen.id}.png`;
    await page.screenshot({ path: screenshot, fullPage: false });

    if (!metrics.targetRect || !rectIsUsable(metrics.targetRect)) {
      issues.push({ viewport: viewport.id, screen: screen.id, issue: 'target selector is too small or missing', metrics });
    }
    if (!metrics.phoneRect || !rectIsUsable(metrics.phoneRect)) {
      issues.push({ viewport: viewport.id, screen: screen.id, issue: 'phone shell is too small or missing', metrics });
    }
    if (metrics.bodyScrollWidth > metrics.viewportWidth + 2) {
      issues.push({ viewport: viewport.id, screen: screen.id, issue: 'horizontal page overflow', metrics });
    }
    if (metrics.visibleImages < 3) {
      issues.push({ viewport: viewport.id, screen: screen.id, issue: 'too few visible images', metrics });
    }

    records.push({ viewport: viewport.id, screen: screen.id, screenshot, metrics });
  }

  if (consoleErrors.length > 0) {
    issues.push({ viewport: viewport.id, screen: 'all', issue: 'console errors', consoleErrors });
  }

  await page.close();
}

await browser.close();
await fs.writeFile(`${outDir}/report.json`, JSON.stringify({ ok: issues.length === 0, baseUrl, records, issues }, null, 2));

if (issues.length > 0) {
  console.error(JSON.stringify({ ok: false, outDir, issues }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, outDir, checked: records.length }, null, 2));
