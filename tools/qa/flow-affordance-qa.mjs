import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.ANIMALBOX_QA_URL ?? 'http://127.0.0.1:5173';
const runId = process.env.ANIMALBOX_QA_LOOP ?? new Date().toISOString().replace(/[:.]/g, '-');
const outDir = `output/playwright/flow-affordance-qa/${runId}`;

const screens = ['home', 'placement', 'wardrobe', 'gacha', 'storage'];
const viewports = [
  { id: 'short-320x568', width: 320, height: 568 },
  { id: 'phone-390x844', width: 390, height: 844 },
  { id: 'large-430x932', width: 430, height: 932 }
];

const primarySelectors = {
  home: ['.degu-button', '.claim-button', '.next-upgrade-button', '.care-button'],
  placement: ['.cell-button[data-valid="true"]', '.action.confirm', '.action.rotate'],
  wardrobe: ['.apply-button', '.shot-button[data-active="true"]', '.shot-row', '.wardrobe-grid'],
  gacha: ['.pull-button.single', '.pull-button.ten', '.pull-button.premium'],
  storage: ['.storage-sheet', '.collection-card', '.market-offer-card']
};

const overlapSelectors = {
  home: ['.game-loop-panel', '.degu-button'],
  placement: ['.placement-sheet', '.placement-ghost'],
  wardrobe: ['.pixel-degu-stage--wardrobe', '.apply-button', '.shot-row', '.accessory-tune-panel'],
  gacha: ['.gacha-machine', '.pull-row', '.reward-strip'],
  storage: ['.storage-sheet']
};

const textSelectors = [
  '.screen-cue strong',
  '.screen-cue span',
  '.screen-cue small',
  '.nav-item span',
  '.action',
  '.apply-button',
  '.pull-button',
  '.claim-button',
  '.guide-task span',
  '.guide-task strong',
  '.guide-task small',
  '.collection-card strong',
  '.collection-card span',
  '.collection-card small',
  '.market-offer-card strong',
  '.market-offer-card span',
  '.next-upgrade-button span',
  '.next-upgrade-button strong'
];

function fail(message, details = {}) {
  return { level: 'fail', message, details };
}

function overlaps(a, b, pad = 0) {
  if (!a || !b) return false;
  return (
    a.left < b.right + pad &&
    a.right > b.left - pad &&
    a.top < b.bottom + pad &&
    a.bottom > b.top - pad
  );
}

function inside(container, rect, pad = 0.5) {
  if (!container || !rect) return false;
  return (
    rect.left >= container.left - pad &&
    rect.top >= container.top - pad &&
    rect.right <= container.right + pad &&
    rect.bottom <= container.bottom + pad
  );
}

async function gotoScreen(page, screen) {
  await page.goto(`${baseUrl}/?screen=${screen}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.evaluate(() => {
    window.localStorage.removeItem('animalbox.prototype.v1');
  });
  await page.goto(`${baseUrl}/?screen=${screen}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('.phone', { timeout: 10000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(180);
}

async function collect(page, screen) {
  return page.evaluate(
    ({ screen, primarySelectors, overlapSelectors, textSelectors }) => {
      const isVisible = (node) => {
        if (!node) return false;
        const style = window.getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };
      const rectOfNode = (node, index = 0) => {
        const rect = node.getBoundingClientRect();
        return {
          index,
          selector: node.getAttribute('data-qa-selector') ?? '',
          text: (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
          ariaLabel: node.getAttribute('aria-label') ?? '',
          ariaCurrent: node.getAttribute('aria-current') ?? '',
          dataActive: node.getAttribute('data-active') ?? '',
          dataCurrent: node.getAttribute('data-current') ?? '',
          dataDone: node.getAttribute('data-done') ?? '',
          dataReady: node.getAttribute('data-ready') ?? '',
          dataScreen: node.getAttribute('data-screen') ?? '',
          dataNextAction: node.getAttribute('data-next-action') ?? '',
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
      };
      const one = (selector) => {
        const node = document.querySelector(selector);
        return isVisible(node) ? { ...rectOfNode(node), selector } : null;
      };
      const many = (selector) =>
        [...document.querySelectorAll(selector)]
          .filter(isVisible)
          .map((node, index) => ({ ...rectOfNode(node, index), selector }));
      const textNodes = textSelectors.flatMap((selector) => many(selector));

      return {
        screen,
        phone: one('.phone'),
        hud: one('.hud'),
        nav: one('.bottom-nav'),
        cue: one('.screen-cue'),
        navItems: many('.nav-item'),
        activeNavItems: many('.nav-item[data-active="true"]'),
        guideTasks: many('.guide-task'),
        placementUndo: one('.action.undo'),
        placementTitle: one('.placement-sheet .mode-row strong'),
        collectionCards: many('.collection-card'),
        marketOffers: many('.market-offer-card'),
        footprintCells: many('.footprint-cell'),
        primary: primarySelectors[screen].flatMap((selector) => many(selector)),
        overlapTargets: overlapSelectors[screen].map((selector) => ({ selector, rect: one(selector) })),
        textOverflow: textNodes.filter(
          (node) => node.scrollWidth > node.clientWidth + 2 || node.scrollHeight > node.clientHeight + 2
        )
      };
    },
    { screen, primarySelectors, overlapSelectors, textSelectors }
  );
}

function audit(metrics, scenario) {
  const issues = [];
  const { phone, hud, nav, cue } = metrics;

  if (!phone) return [fail('phone frame missing', scenario)];
  if (!nav) issues.push(fail('bottom nav missing', scenario));
  if (!cue) issues.push(fail('screen cue missing', scenario));

  if (cue) {
    if (cue.dataScreen !== metrics.screen) {
      issues.push(fail('screen cue does not match current screen', { ...scenario, cue }));
    }
    if (!cue.dataNextAction) {
      issues.push(fail('screen cue missing next-action marker', { ...scenario, cue }));
    }
    if (!inside(phone, cue)) {
      issues.push(fail('screen cue escapes phone frame', { ...scenario, cue, phone }));
    }
    if (hud && overlaps(cue, hud, 4)) {
      issues.push(fail('screen cue overlaps HUD', { ...scenario, cue, hud }));
    }
    if (nav && overlaps(cue, nav, 4)) {
      issues.push(fail('screen cue overlaps bottom nav', { ...scenario, cue, nav }));
    }
    for (const target of metrics.overlapTargets) {
      if (target.rect && overlaps(cue, target.rect, 4)) {
        issues.push(fail('screen cue overlaps primary screen surface', { ...scenario, target: target.selector, cue, rect: target.rect }));
      }
    }
  }

  if (metrics.navItems.length !== 5) {
    issues.push(fail('bottom nav should expose five destinations', { ...scenario, count: metrics.navItems.length }));
  }
  if (metrics.activeNavItems.length !== 1) {
    issues.push(fail('bottom nav should have one active destination', { ...scenario, count: metrics.activeNavItems.length }));
  } else {
    const active = metrics.activeNavItems[0];
    if (active.ariaCurrent !== 'page') {
      issues.push(fail('active bottom nav item missing aria-current page', { ...scenario, active }));
    }
  }

  for (const navItem of metrics.navItems) {
    if (navItem.width < 40 || navItem.height < 40) {
      issues.push(fail('bottom nav target too small', { ...scenario, navItem }));
    }
  }

  if (metrics.primary.length === 0) {
    issues.push(fail('screen has no visible primary action', scenario));
  }
  if (metrics.screen === 'placement' && metrics.footprintCells.length === 0) {
    issues.push(fail('placement missing footprint preview', scenario));
  }
  if (metrics.screen === 'placement') {
    if (!metrics.placementTitle?.text) {
      issues.push(fail('placement selected decor title is missing', { ...scenario, title: metrics.placementTitle }));
    }
    if (!metrics.placementUndo) {
      issues.push(fail('placement undo control is missing', scenario));
    }
  }
  if (metrics.screen === 'home') {
    if (metrics.guideTasks.length !== 4) {
      issues.push(fail('home guide should expose four next-action tasks', { ...scenario, count: metrics.guideTasks.length }));
    }
    const currentTasks = metrics.guideTasks.filter((task) => task.dataCurrent === 'true');
    if (currentTasks.length !== 1) {
      issues.push(fail('home guide should have one current task', { ...scenario, count: currentTasks.length }));
    }
    for (const guideTask of metrics.guideTasks) {
      if (!inside(phone, guideTask)) {
        issues.push(fail('home guide task escapes phone frame', { ...scenario, guideTask }));
      }
      if (guideTask.width < 34 || guideTask.height < 34) {
        issues.push(fail('home guide task target too small', { ...scenario, guideTask }));
      }
    }
  }
  if (metrics.screen === 'storage') {
    if (metrics.collectionCards.length !== 6) {
      issues.push(fail('storage collection progress cards missing', { ...scenario, count: metrics.collectionCards.length }));
    }
    if (metrics.marketOffers.length !== 2) {
      issues.push(fail('storage market offers missing', { ...scenario, count: metrics.marketOffers.length }));
    }
  }
  for (const target of metrics.primary) {
    if (!inside(phone, target)) {
      issues.push(fail('primary action escapes phone frame', { ...scenario, target }));
    }
    if (target.width < 34 || target.height < 34) {
      issues.push(fail('primary action target too small', { ...scenario, target }));
    }
  }

  for (const node of metrics.textOverflow) {
    issues.push(fail('flow text overflows container', { ...scenario, node }));
  }

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
      for (const screen of screens) {
        const scenario = { viewport: viewport.id, screen };
        try {
          await gotoScreen(page, screen);
          const metrics = await collect(page, screen);
          const scenarioIssues = audit(metrics, scenario);
          const screenshot = `${outDir}/${viewport.id}__${screen}.png`;
          await page.screenshot({ path: screenshot, fullPage: true });
          scenarios.push({ ...scenario, screenshot, metrics, issues: scenarioIssues });
          issues.push(...scenarioIssues);
        } catch (error) {
          const screenshot = `${outDir}/${viewport.id}__${screen}__error.png`;
          await page.screenshot({ path: screenshot, fullPage: true }).catch(() => undefined);
          const issue = fail('scenario crashed', { ...scenario, message: error.message, screenshot });
          scenarios.push({ ...scenario, screenshot, metrics: null, issues: [issue] });
          issues.push(issue);
        }
      }
    } finally {
      await context.close();
    }
  }

  const failures = issues.filter((issue) => issue.level === 'fail');
  const report = { ok: failures.length === 0, baseUrl, outDir, viewports, screens, failures, scenarios };
  await fs.writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2));

  if (failures.length > 0) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          baseUrl,
          outDir,
          scenarios: scenarios.length,
          failures: failures.length,
          topFailures: failures.slice(0, 20).map((issue) => ({
            message: issue.message,
            scenario: issue.details,
            target: issue.details?.target
          }))
        },
        null,
        2
      )
    );
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ ok: true, baseUrl, outDir, scenarios: scenarios.length }, null, 2));
  }
} finally {
  await browser.close();
}
