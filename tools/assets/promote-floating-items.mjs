import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const canvasSize = 320;
const subjectMaxSize = 248;
const outputDir = 'public/images/runtime/floating-items';

const packs = [
  {
    source: 'assets/source/imagegen/floating-items/floating-items-pack-001__source.png',
    names: [
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
      'water-drop-buddy'
    ]
  },
  {
    source: 'assets/source/imagegen/floating-items/floating-items-pack-002__source.png',
    names: [
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
    ]
  }
];

function offset(width, x, y) {
  return (y * width + x) * 4;
}

function isKeyPixel(r, g, b) {
  return r > 185 && g < 105 && b > 165 && Math.abs(r - b) < 105;
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
      const srcOffset = offset(source.width, bounds.x0 + x, bounds.y0 + y);
      const outOffset = offset(width, x, y);
      const r = source.data[srcOffset];
      const g = source.data[srcOffset + 1];
      const b = source.data[srcOffset + 2];
      const a = source.data[srcOffset + 3];
      if (a < 10 || isKeyPixel(r, g, b)) {
        cell.data[outOffset + 3] = 0;
        continue;
      }

      cell.data[outOffset] = r;
      cell.data[outOffset + 1] = g;
      cell.data[outOffset + 2] = b;
      cell.data[outOffset + 3] = a;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < 0 || maxY < 0) {
    throw new Error(`No subject pixels found in cell ${JSON.stringify(bounds)}`);
  }

  const pad = 8;
  return crop(cell, {
    x0: Math.max(0, minX - pad),
    y0: Math.max(0, minY - pad),
    x1: Math.min(width, maxX + pad + 1),
    y1: Math.min(height, maxY + pad + 1)
  });
}

function crop(source, bounds) {
  const width = bounds.x1 - bounds.x0;
  const height = bounds.y1 - bounds.y0;
  const output = transparentPng(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const srcOffset = offset(source.width, bounds.x0 + x, bounds.y0 + y);
      const outOffset = offset(width, x, y);
      output.data[outOffset] = source.data[srcOffset];
      output.data[outOffset + 1] = source.data[srcOffset + 1];
      output.data[outOffset + 2] = source.data[srcOffset + 2];
      output.data[outOffset + 3] = source.data[srcOffset + 3];
    }
  }
  return output;
}

function sampleBilinear(source, x, y) {
  const x0 = Math.max(0, Math.min(source.width - 1, Math.floor(x)));
  const y0 = Math.max(0, Math.min(source.height - 1, Math.floor(y)));
  const x1 = Math.max(0, Math.min(source.width - 1, x0 + 1));
  const y1 = Math.max(0, Math.min(source.height - 1, y0 + 1));
  const tx = x - x0;
  const ty = y - y0;
  const weights = [
    [(1 - tx) * (1 - ty), x0, y0],
    [tx * (1 - ty), x1, y0],
    [(1 - tx) * ty, x0, y1],
    [tx * ty, x1, y1]
  ];

  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  for (const [weight, px, py] of weights) {
    const sourceOffset = offset(source.width, px, py);
    const alpha = source.data[sourceOffset + 3] / 255;
    r += source.data[sourceOffset] * alpha * weight;
    g += source.data[sourceOffset + 1] * alpha * weight;
    b += source.data[sourceOffset + 2] * alpha * weight;
    a += alpha * weight;
  }

  if (a <= 0.0001) return [0, 0, 0, 0];
  return [
    Math.round(r / a),
    Math.round(g / a),
    Math.round(b / a),
    Math.round(a * 255)
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
      const [r, g, b, a] = sampleBilinear(source, sourceX, sourceY);
      const outOffset = offset(output.width, startX + x, startY + y);
      output.data[outOffset] = r;
      output.data[outOffset + 1] = g;
      output.data[outOffset + 2] = b;
      output.data[outOffset + 3] = a;
    }
  }
  return { output, drawWidth, drawHeight };
}

fs.mkdirSync(outputDir, { recursive: true });

const promoted = [];
for (const pack of packs) {
  const source = PNG.sync.read(fs.readFileSync(pack.source));
  pack.names.forEach((name, index) => {
    const cell = extractCell(source, cellBounds(source, index));
    const { output, drawWidth, drawHeight } = fitToCanvas(cell);
    const target = path.join(outputDir, `${name}.png`);
    fs.writeFileSync(target, PNG.sync.write(output));
    promoted.push({
      name,
      source: pack.source,
      sourceCell: `${cell.width}x${cell.height}`,
      runtime: `${output.width}x${output.height}`,
      subject: `${drawWidth}x${drawHeight}`
    });
  });
}

console.log(JSON.stringify({ ok: true, outputDir, promoted }, null, 2));
