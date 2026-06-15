import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

import { catalogApexPresets } from './catalog-apex-presets.mjs';
import { catalogBloomPresets } from './catalog-bloom-presets.mjs';
import { catalogBulkPresets } from './catalog-bulk-presets.mjs';
import { catalogHyperPresets } from './catalog-hyper-presets.mjs';
import { catalogLumenPresets } from './catalog-lumen-presets.mjs';
import { catalogMegaPresets } from './catalog-mega-presets.mjs';
import { catalogMassPresets } from './catalog-mass-presets.mjs';
import { catalogOrbitPresets } from './catalog-orbit-presets.mjs';
import { catalogPrimePresets } from './catalog-prime-presets.mjs';
import { catalogRadiantPresets } from './catalog-radiant-presets.mjs';
import { catalogUltraPresets } from './catalog-ultra-presets.mjs';
import { catalogZenithPresets } from './catalog-zenith-presets.mjs';

const basePresets = {
  'decor-batch-005': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'decor-batch-005'),
    sourceName: 'decor-batch-005__source.png',
    runtimeDir: path.join('public', 'images', 'runtime', 'decor', 'batch-005'),
    items: [
      'moss-arch',
      'cloud-fountain',
      'clover-rug',
      'tiny-seed-shop-sign',
      'moon-birdbath',
      'star-wind-chime-stand',
      'hay-hammock',
      'mushroom-stool',
      'crystal-planter',
      'rain-jar',
      'picnic-basket',
      'carrot-mailbox',
      'flower-pergola',
      'wooden-toy-wheel',
      'pebble-path-curve',
      'floating-lantern-stand'
    ]
  },
  'decor-batch-006': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'decor-batch-006'),
    sourceName: 'decor-batch-006__source.png',
    runtimeDir: path.join('public', 'images', 'runtime', 'decor', 'batch-006'),
    items: [
      'dewdrop-greenhouse',
      'sunflower-wagon',
      'acorn-library',
      'berry-tea-table',
      'fern-reading-nook',
      'honeycomb-shelf',
      'willow-swing',
      'snail-mail-station',
      'butterfly-planter',
      'starry-rug',
      'mini-pond',
      'seed-mill',
      'leafy-bridge',
      'cookie-stump-table',
      'daisy-bell-tower',
      'rainbow-moss-step'
    ]
  },
  'decor-batch-007': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'decor-batch-007'),
    sourceName: 'decor-batch-007__source.png',
    runtimeDir: path.join('public', 'images', 'runtime', 'decor', 'batch-007'),
    items: [
      'cloud-telescope',
      'moonflower-bed',
      'tiny-well',
      'garden-loom',
      'crystal-windmill',
      'clover-trellis',
      'berry-crate-stack',
      'sleepy-hay-sofa',
      'misty-arch-gate',
      'sun-dial-stone',
      'lantern-mushroom',
      'acorn-storage-hutch',
      'petal-carpet',
      'leaf-parasol-stand',
      'bamboo-water-spout',
      'glowworm-lamp-post'
    ]
  },
  'floating-items-pack-003': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'floating-items'),
    sourceName: 'floating-items-pack-003__source.png',
    runtimeDir: path.join('public', 'images', 'runtime', 'floating-items', 'pack-003'),
    items: [
      'dew-orb-buddy',
      'mini-cloud-goose',
      'clover-kite',
      'berry-bell',
      'acorn-balloon',
      'moon-moth',
      'star-seedling',
      'rain-drop-friend',
      'tiny-teacup',
      'daisy-spark',
      'leaf-fan-charm',
      'honey-bee-puff',
      'crystal-moon',
      'paper-star',
      'carrot-satellite',
      'mist-sprite'
    ]
  },
  'floating-items-pack-004': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'floating-items'),
    sourceName: 'floating-items-pack-004__source.png',
    runtimeDir: path.join('public', 'images', 'runtime', 'floating-items', 'pack-004'),
    items: [
      'sleepy-cloudlet',
      'moss-ball-charm',
      'sunflower-petal',
      'shell-lantern',
      'cotton-sprout',
      'ribbon-bird',
      'blueberry-orb',
      'tiny-umbrella',
      'seed-rocket',
      'bell-acorn',
      'plum-crystal',
      'feather-moon',
      'clover-drone',
      'lantern-fish',
      'rose-puff',
      'maple-pinwheel'
    ]
  },
  'wardrobe-batch-004': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'wardrobe-batch-004'),
    sourceName: 'wardrobe-batch-004__source.png',
    runtimeDir: path.join('public', 'images', 'runtime', 'wardrobe', 'batch-004'),
    items: [
      'rainbow-hood',
      'acorn-backpack',
      'moon-scarf',
      'clover-visor',
      'sunflower-hat',
      'crystal-goggles',
      'mossy-cape',
      'picnic-bowtie',
      'starry-poncho',
      'berry-ear-clip',
      'cloud-mittens',
      'leaf-crown',
      'tiny-collar-bell',
      'garden-apron',
      'dewdrop-glasses',
      'petal-cape'
    ]
  },
  'animal-pose-pack-002': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'animal-pose-pack-002'),
    sourceName: 'animal-pose-pack-002__source.png',
    runtimeDir: path.join('public', 'images', 'runtime', 'characters', 'animals', 'batch-002'),
    items: [
      'pose-curled',
      'pose-sniff',
      'pose-sit-up',
      'pose-hop',
      'pose-nibble',
      'pose-groom',
      'pose-stretch',
      'pose-snooze',
      'white-mouse',
      'dormouse',
      'chipmunk',
      'fancy-rat',
      'guinea-pig',
      'pika',
      'jerboa',
      'hedgehog'
    ]
  }
};

const presets = {
  ...basePresets,
  ...catalogApexPresets,
  ...catalogBloomPresets,
  ...catalogBulkPresets,
  ...catalogHyperPresets,
  ...catalogLumenPresets,
  ...catalogMegaPresets,
  ...catalogMassPresets,
  ...catalogOrbitPresets,
  ...catalogPrimePresets,
  ...catalogRadiantPresets,
  ...catalogUltraPresets,
  ...catalogZenithPresets
};

const canvasSize = 320;
const subjectMaxSize = 258;
const root = process.cwd();
const manifestPath = path.join(root, 'assets', 'manifests', 'imagegen-runtime-assets.json');
const args = new Map();

for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i], process.argv[i + 1]);
}

const presetId = args.get('--preset');
const sourceArg = args.get('--source');
const preset = presetId ? presets[presetId] : null;

if (!presetId || !sourceArg || !preset) {
  console.error(`Usage: node tools/assets/promote-catalog-sheet.mjs --preset <${Object.keys(presets).join('|')}> --source <imagegen-sheet.png>`);
  process.exit(1);
}

function offset(width, x, y) {
  return (y * width + x) * 4;
}

function isKeyPixel(r, g, b, a) {
  if (a < 12) return true;
  return r > 185 && g < 115 && b > 165 && Math.abs(r - b) < 115;
}

function transparentPng(width, height) {
  return new PNG({ width, height, colorType: 6 });
}

function cellBounds(source, index) {
  const col = index % 4;
  const row = Math.floor(index / 4);
  return {
    x0: Math.round((source.width * col) / 4),
    x1: Math.round((source.width * (col + 1)) / 4),
    y0: Math.round((source.height * row) / 4),
    y1: Math.round((source.height * (row + 1)) / 4)
  };
}

function crop(source, bounds) {
  const width = bounds.x1 - bounds.x0;
  const height = bounds.y1 - bounds.y0;
  const output = transparentPng(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const src = offset(source.width, bounds.x0 + x, bounds.y0 + y);
      const dst = offset(width, x, y);
      output.data[dst] = source.data[src];
      output.data[dst + 1] = source.data[src + 1];
      output.data[dst + 2] = source.data[src + 2];
      output.data[dst + 3] = source.data[src + 3];
    }
  }

  return output;
}

function extractCell(source, bounds) {
  const width = bounds.x1 - bounds.x0;
  const height = bounds.y1 - bounds.y0;
  const cell = transparentPng(width, height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const src = offset(source.width, bounds.x0 + x, bounds.y0 + y);
      const dst = offset(width, x, y);
      const r = source.data[src];
      const g = source.data[src + 1];
      const b = source.data[src + 2];
      const a = source.data[src + 3];

      if (isKeyPixel(r, g, b, a)) {
        cell.data[dst + 3] = 0;
        continue;
      }

      cell.data[dst] = r;
      cell.data[dst + 1] = g;
      cell.data[dst + 2] = b;
      cell.data[dst + 3] = a;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < 0 || maxY < 0) {
    throw new Error(`No subject pixels found in bounds ${JSON.stringify(bounds)}`);
  }

  const pad = 10;
  return crop(cell, {
    x0: Math.max(0, minX - pad),
    y0: Math.max(0, minY - pad),
    x1: Math.min(width, maxX + pad + 1),
    y1: Math.min(height, maxY + pad + 1)
  });
}

function sampleNearest(source, x, y) {
  const sx = Math.max(0, Math.min(source.width - 1, Math.round(x)));
  const sy = Math.max(0, Math.min(source.height - 1, Math.round(y)));
  const src = offset(source.width, sx, sy);
  return [
    source.data[src],
    source.data[src + 1],
    source.data[src + 2],
    source.data[src + 3]
  ];
}

function fitToCanvas(source) {
  const output = transparentPng(canvasSize, canvasSize);
  const scale = Math.min(subjectMaxSize / source.width, subjectMaxSize / source.height, 1);
  const drawWidth = Math.max(1, Math.round(source.width * scale));
  const drawHeight = Math.max(1, Math.round(source.height * scale));
  const startX = Math.round((canvasSize - drawWidth) / 2);
  const startY = Math.round((canvasSize - drawHeight) / 2);

  for (let y = 0; y < drawHeight; y += 1) {
    for (let x = 0; x < drawWidth; x += 1) {
      const sourceX = (x + 0.5) / scale - 0.5;
      const sourceY = (y + 0.5) / scale - 0.5;
      const rgba = sampleNearest(source, sourceX, sourceY);
      const dst = offset(output.width, startX + x, startY + y);
      output.data[dst] = rgba[0];
      output.data[dst + 1] = rgba[1];
      output.data[dst + 2] = rgba[2];
      output.data[dst + 3] = rgba[3];
    }
  }

  return { output, drawWidth, drawHeight };
}

async function updateManifest(entries) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const entryIds = new Set(entries.map((entry) => entry.id));
  manifest.generatedAt = new Date().toISOString().slice(0, 10);
  manifest.assets = [
    ...manifest.assets.filter((entry) => !entryIds.has(entry.id)),
    ...entries
  ];
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

const sourcePath = path.resolve(root, sourceArg);
const sourceDir = path.join(root, preset.sourceDir);
const runtimeDir = path.join(root, preset.runtimeDir);
const copiedSourcePath = path.join(sourceDir, preset.sourceName);
await fs.mkdir(sourceDir, { recursive: true });
await fs.mkdir(runtimeDir, { recursive: true });
await fs.copyFile(sourcePath, copiedSourcePath);

const source = PNG.sync.read(await fs.readFile(sourcePath));
if (preset.items.length !== 16) {
  throw new Error('Catalog sheet presets must contain exactly 16 items.');
}

const promoted = [];
for (const [index, id] of preset.items.entries()) {
  const cell = extractCell(source, cellBounds(source, index));
  const { output, drawWidth, drawHeight } = fitToCanvas(cell);
  const runtimePath = path.join(runtimeDir, `${id}.png`);
  await fs.writeFile(runtimePath, PNG.sync.write(output));
  promoted.push({
    id,
    src: `/${path.relative(path.join(root, 'public'), runtimePath).replaceAll(path.sep, '/')}`,
    size: [output.width, output.height],
    source: path.relative(root, copiedSourcePath).replaceAll(path.sep, '/'),
    status: 'imagegen-catalog-expansion-v1',
    subject: [drawWidth, drawHeight]
  });
}

await updateManifest(promoted.map(({ subject, ...entry }) => entry));

console.log(
  JSON.stringify(
    {
      ok: true,
      preset: presetId,
      source: path.relative(root, copiedSourcePath).replaceAll(path.sep, '/'),
      runtimeDir: path.relative(root, runtimeDir).replaceAll(path.sep, '/'),
      promoted
    },
    null,
    2
  )
);
