import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'assets', 'manifests', 'imagegen-runtime-assets.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const failures = [];
const seenIds = new Set();

function repoPath(relativePath) {
  return path.join(root, ...relativePath.split('/'));
}

function publicPath(src) {
  if (!src.startsWith('/')) return null;
  return path.join(root, 'public', ...src.slice(1).split('/'));
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readPngInfo(filePath) {
  const data = await fs.readFile(filePath);
  const signature = data.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') {
    throw new Error('not a png');
  }

  const chunkType = data.subarray(12, 16).toString('ascii');
  if (chunkType !== 'IHDR') {
    throw new Error('missing IHDR');
  }

  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    bitDepth: data.readUInt8(24),
    colorType: data.readUInt8(25)
  };
}

function requiresAlpha(asset) {
  return (
    asset.src.includes('/decor/') ||
    asset.src.includes('/characters/animals/') ||
    asset.src.includes('/wardrobe/') ||
    asset.src.includes('/floating-items/') ||
    asset.src.includes('/ui/') ||
    asset.src.includes('/machines/')
  );
}

for (const asset of manifest.assets) {
  if (!asset.id || typeof asset.id !== 'string') {
    failures.push({ id: asset.id, issue: 'missing id' });
    continue;
  }

  if (seenIds.has(asset.id)) {
    failures.push({ id: asset.id, issue: 'duplicate id' });
  }
  seenIds.add(asset.id);

  const runtimePath = publicPath(asset.src);
  if (!runtimePath || !(await exists(runtimePath))) {
    failures.push({ id: asset.id, issue: 'missing runtime file', src: asset.src });
    continue;
  }

  try {
    const info = await readPngInfo(runtimePath);
    if (asset.size?.[0] !== info.width || asset.size?.[1] !== info.height) {
      failures.push({ id: asset.id, issue: 'manifest size mismatch', expected: asset.size, actual: [info.width, info.height] });
    }
    if (requiresAlpha(asset) && ![4, 6].includes(info.colorType)) {
      failures.push({ id: asset.id, issue: 'runtime asset should have alpha', colorType: info.colorType });
    }
  } catch (error) {
    failures.push({ id: asset.id, issue: 'invalid png', message: error.message });
  }

  if (asset.source && !(await exists(repoPath(asset.source)))) {
    failures.push({ id: asset.id, issue: 'missing source file', source: asset.source });
  }

  for (const source of asset.additionalSources ?? []) {
    if (!(await exists(repoPath(source)))) {
      failures.push({ id: asset.id, issue: 'missing additional source file', source });
    }
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      manifest: path.relative(root, manifestPath),
      assets: manifest.assets.length,
      alphaChecked: manifest.assets.filter(requiresAlpha).length
    },
    null,
    2
  )
);
