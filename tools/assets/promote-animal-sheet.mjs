import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const presets = {
  'animal-unlocks': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'animal-unlocks'),
    runtimeDir: path.join('public', 'images', 'runtime', 'characters', 'animals'),
    sourceName: 'animal-unlocks-pack-001__source.png',
    items: [
      { id: 'macaroni-mouse', label: 'Macaroni mouse' },
      { id: 'chinchilla', label: 'Chinchilla' },
      { id: 'gerbil', label: 'Gerbil' },
      { id: 'hamster', label: 'Hamster' },
      { id: 'rabbit', label: 'Rabbit' }
    ]
  },
  'decor-batch-004': {
    sourceDir: path.join('assets', 'source', 'imagegen', 'decor-batch-004'),
    runtimeDir: path.join('public', 'images', 'runtime', 'decor'),
    sourceName: 'decor-batch-004__source.png',
    items: [
      { id: 'mossy-log-hideout', label: 'Mossy log' },
      { id: 'seed-crate', label: 'Seed crate' },
      { id: 'grass-tuft-cluster', label: 'Grass tuft' },
      { id: 'pebble-stepping-stones', label: 'Pebble stones' },
      { id: 'flower-arch', label: 'Flower arch' },
      { id: 'carrot-basket', label: 'Carrot basket' },
      { id: 'cloud-cushion-bench', label: 'Cloud bench' },
      { id: 'tiny-burrow-mound', label: 'Tiny burrow' }
    ]
  }
};

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i], process.argv[i + 1]);
}

const sourceArg = args.get('--source');
const presetId = args.get('--preset') ?? 'animal-unlocks';
const preset = presets[presetId];
if (!sourceArg) {
  console.error('Usage: node tools/assets/promote-animal-sheet.mjs --preset <preset> --source <imagegen-sheet.png>');
  process.exit(1);
}
if (!preset) {
  console.error(`Unknown preset ${presetId}. Known presets: ${Object.keys(presets).join(', ')}`);
  process.exit(1);
}

const root = process.cwd();
const sourcePath = path.resolve(root, sourceArg);
const sourceDir = path.join(root, preset.sourceDir);
const runtimeDir = path.join(root, preset.runtimeDir);
const copiedSourcePath = path.join(sourceDir, preset.sourceName);
const items = preset.items;

function offset(width, x, y) {
  return (y * width + x) * 4;
}

function isKeyPixel(png, x, y) {
  const i = offset(png.width, x, y);
  const r = png.data[i];
  const g = png.data[i + 1];
  const b = png.data[i + 2];
  const a = png.data[i + 3];
  if (a < 20) return true;
  return r > 160 && g < 115 && b > 150 && Math.abs(r - b) < 95;
}

function isSubjectPixel(png, x, y) {
  return !isKeyPixel(png, x, y);
}

function detectRuns(png) {
  const counts = Array.from({ length: png.width }, () => 0);
  for (let x = 0; x < png.width; x += 1) {
    for (let y = 0; y < png.height; y += 1) {
      if (isSubjectPixel(png, x, y)) counts[x] += 1;
    }
  }

  const rawRuns = [];
  let start = null;
  for (let x = 0; x < counts.length; x += 1) {
    if (counts[x] > 4 && start === null) start = x;
    if ((counts[x] <= 4 || x === counts.length - 1) && start !== null) {
      rawRuns.push({ start, end: x });
      start = null;
    }
  }

  const runs = [];
  for (const run of rawRuns.filter((item) => item.end - item.start > 12)) {
    const prev = runs.at(-1);
    if (prev && run.start - prev.end < 28) {
      prev.end = run.end;
    } else {
      runs.push({ ...run });
    }
  }

  if (runs.length === items.length) return runs;
  if (runs.length > items.length) {
    const sorted = [...runs].sort((a, b) => b.end - b.start - (a.end - a.start)).slice(0, items.length);
    return sorted.sort((a, b) => a.start - b.start);
  }

  const cellWidth = Math.floor(png.width / items.length);
  return items.map((_, index) => ({
    start: index * cellWidth,
    end: index === items.length - 1 ? png.width - 1 : (index + 1) * cellWidth - 1
  }));
}

function boundsForRun(png, run) {
  let minX = png.width;
  let minY = png.height;
  let maxX = 0;
  let maxY = 0;
  let count = 0;
  for (let x = run.start; x <= run.end; x += 1) {
    for (let y = 0; y < png.height; y += 1) {
      if (!isSubjectPixel(png, x, y)) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      count += 1;
    }
  }
  if (count === 0) throw new Error(`No subject pixels detected for run ${run.start}-${run.end}`);
  return { minX, minY, maxX, maxY, count, runStart: run.start, runEnd: run.end };
}

function readPixel(source, x, y) {
  const i = offset(source.width, x, y);
  return [
    source.data[i],
    source.data[i + 1],
    source.data[i + 2],
    source.data[i + 3]
  ];
}

function writePixel(target, x, y, rgba) {
  const i = offset(target.width, x, y);
  target.data[i] = rgba[0];
  target.data[i + 1] = rgba[1];
  target.data[i + 2] = rgba[2];
  target.data[i + 3] = rgba[3];
}

function cropToCanvas(source, bounds, canvasSize = 320) {
  const padding = 28;
  const runStart = Math.max(0, bounds.runStart ?? 0);
  const runEnd = Math.min(source.width - 1, bounds.runEnd ?? source.width - 1);
  const srcX0 = Math.max(runStart, bounds.minX - padding);
  const srcY0 = Math.max(0, bounds.minY - padding);
  const srcX1 = Math.min(runEnd, bounds.maxX + padding);
  const srcY1 = Math.min(source.height - 1, bounds.maxY + padding);
  const cropW = srcX1 - srcX0 + 1;
  const cropH = srcY1 - srcY0 + 1;
  const maxDraw = 252;
  const scale = Math.min(maxDraw / cropW, maxDraw / cropH);
  const drawW = Math.max(1, Math.round(cropW * scale));
  const drawH = Math.max(1, Math.round(cropH * scale));
  const dx = Math.round((canvasSize - drawW) / 2);
  const dy = Math.round((canvasSize - drawH) / 2);
  const out = new PNG({ width: canvasSize, height: canvasSize });
  out.data.fill(0);

  for (let y = 0; y < drawH; y += 1) {
    for (let x = 0; x < drawW; x += 1) {
      const sx = Math.min(srcX1, srcX0 + Math.floor(x / scale));
      const sy = Math.min(srcY1, srcY0 + Math.floor(y / scale));
      const rgba = readPixel(source, sx, sy);
      const alpha = isKeyPixel(source, sx, sy) ? 0 : rgba[3];
      writePixel(out, dx + x, dy + y, alpha === 0 ? [0, 0, 0, 0] : [rgba[0], rgba[1], rgba[2], alpha]);
    }
  }

  return { png: out, draw: { x: dx, y: dy, w: drawW, h: drawH } };
}

function removeEdgeFragments(png) {
  const seen = new Uint8Array(png.width * png.height);
  const components = [];

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const index = y * png.width + x;
      if (seen[index] || png.data[offset(png.width, x, y) + 3] < 20) continue;

      const pixels = [[x, y]];
      seen[index] = 1;
      const component = { count: 0, minX: x, minY: y, maxX: x, maxY: y, pixels };

      for (let cursor = 0; cursor < pixels.length; cursor += 1) {
        const [cx, cy] = pixels[cursor];
        component.count += 1;
        component.minX = Math.min(component.minX, cx);
        component.minY = Math.min(component.minY, cy);
        component.maxX = Math.max(component.maxX, cx);
        component.maxY = Math.max(component.maxY, cy);

        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1]
        ]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= png.width || ny >= png.height) continue;
          const nextIndex = ny * png.width + nx;
          if (seen[nextIndex] || png.data[offset(png.width, nx, ny) + 3] < 20) continue;
          seen[nextIndex] = 1;
          pixels.push([nx, ny]);
        }
      }

      components.push(component);
    }
  }

  if (components.length <= 1) return png;

  const largest = Math.max(...components.map((component) => component.count));
  const edgeInset = Math.round(png.width * 0.12);
  for (const component of components) {
    const touchesCropEdge =
      component.minX <= edgeInset ||
      component.maxX >= png.width - edgeInset ||
      component.minY <= edgeInset ||
      component.maxY >= png.height - edgeInset;
    if (!touchesCropEdge || component.count >= largest * 0.2) continue;

    for (const [x, y] of component.pixels) {
      writePixel(png, x, y, [0, 0, 0, 0]);
    }
  }

  return png;
}

await fs.mkdir(sourceDir, { recursive: true });
await fs.mkdir(runtimeDir, { recursive: true });
await fs.copyFile(sourcePath, copiedSourcePath);

const source = PNG.sync.read(await fs.readFile(sourcePath));
const runs = detectRuns(source);
const outputs = [];

for (const [index, item] of items.entries()) {
  const bounds = boundsForRun(source, runs[index]);
  const { png, draw } = cropToCanvas(source, bounds);
  removeEdgeFragments(png);
  const runtimePath = path.join(runtimeDir, `${item.id}.png`);
  await fs.writeFile(runtimePath, PNG.sync.write(png));
  outputs.push({
    ...item,
    source: path.relative(root, copiedSourcePath).replaceAll(path.sep, '/'),
    runtime: path.relative(root, runtimePath).replaceAll(path.sep, '/'),
    bounds,
    draw
  });
}

console.log(JSON.stringify({ ok: true, preset: presetId, source: path.relative(root, copiedSourcePath), outputs }, null, 2));
