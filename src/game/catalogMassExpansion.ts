import type { CatalogRarity, DecorItem, FloatingItem, FloatingItemSlot, PixelDeguShot } from './content';
import type { GachaEntry, RewardType } from './gacha';

type Batch = readonly [batch: string, ids: readonly string[]];
type SlotSeed = readonly [id: string, slot: FloatingItemSlot];

const decorSourceBase = '/images/runtime/decor';
const floatingSourceBase = '/images/runtime/floating-items';
const wardrobeSourceBase = '/images/runtime/wardrobe';
const animalPoseSourceBase = '/images/runtime/characters/animals/batch-004';
const animalPoseSource = 'assets/source/imagegen/animal-pose-pack-004/animal-pose-pack-004__source.png';

const decorBatches: readonly Batch[] = [
  ['batch-013', [
    'felt-mushroom-bench',
    'dew-bead-curtain',
    'acorn-stove',
    'clover-patchwork-rug',
    'berry-sundae-table',
    'moon-shell-lamp',
    'seedling-bookcase',
    'cloud-knitting-basket',
    'sun-petal-stool',
    'fern-fabric-tent',
    'honeycomb-footbridge',
    'pebble-fairy-ring',
    'rainbell-window',
    'tiny-bark-cabinet',
    'flower-pillow-stack',
    'star-cotton-canopy'
  ]],
  ['batch-014', [
    'mossy-biscuit-oven',
    'blueberry-market-awning',
    'twig-chandelier',
    'petal-porch-swing',
    'cloud-wool-basket',
    'acorn-train-toy',
    'daisy-cork-board',
    'moonbeam-reading-chair',
    'clover-staircase',
    'berry-porcelain-sink',
    'sunflower-blanket-fort',
    'rain-pebble-fountain',
    'fern-cupboard',
    'honey-jar-stool',
    'starry-quilt-bed',
    'tiny-lantern-rail'
  ]],
  ['batch-015', [
    'cotton-cloud-crib',
    'seed-packet-drawer',
    'mushroom-card-table',
    'dew-glass-cabinet',
    'clover-spool-rack',
    'moon-cookie-plate',
    'flower-teacart',
    'acorn-cuckoo-house',
    'berry-woven-mat',
    'sunlit-bark-desk',
    'misty-candle-arch',
    'pebble-story-circle',
    'fern-bird-bath',
    'rainbow-button-path',
    'honey-moon-shelf',
    'tiny-cushion-tower'
  ]],
  ['batch-016', [
    'leafy-moon-gate',
    'berry-bread-stand',
    'cloud-puddle-bridge',
    'acorn-laundry-line',
    'clover-felt-chair',
    'star-seed-fountain',
    'daisy-lullaby-mobile',
    'mossy-tea-cabinet',
    'rain-shell-planter',
    'sunflower-puppet-stage',
    'fern-cookie-jars',
    'moonlit-yarn-basket',
    'honey-stone-oven',
    'petal-craft-table',
    'tiny-waterwheel-house',
    'cotton-star-hammock'
  ]]
];

const floatingBatches: readonly Batch[] = [
  ['pack-008', [
    'felt-star-puff',
    'acorn-teardrop',
    'clover-sparkle',
    'berry-button',
    'moon-cookie',
    'seedling-bubble',
    'cloud-macaroon',
    'fern-glimmer',
    'sun-thread',
    'honey-pearl',
    'petal-curl',
    'rain-charm',
    'moss-button',
    'tiny-lantern',
    'crystal-seed',
    'daisy-mote'
  ]],
  ['pack-009', [
    'paper-moonlet',
    'cloud-berry',
    'acorn-bell',
    'clover-wisp',
    'star-biscuit',
    'dew-sprout',
    'sunflower-dot',
    'rainbow-thread',
    'mushroom-bead',
    'fern-button',
    'honey-flame',
    'petal-orb',
    'seed-star',
    'cotton-ring',
    'moon-lilac',
    'tiny-kettle'
  ]],
  ['pack-010', [
    'bluebell-drop',
    'acorn-satchel',
    'cloud-needle',
    'berry-starlet',
    'clover-comet',
    'mist-button',
    'sun-pebble',
    'paper-bud',
    'fern-planet',
    'moon-thread',
    'honey-spark',
    'daisy-shell',
    'moss-moonlet',
    'rain-cookie',
    'tiny-planet',
    'crystal-puff'
  ]],
  ['pack-011', [
    'woolly-star',
    'seed-ribbon',
    'cloud-jelly',
    'berry-spark',
    'moon-acorn',
    'clover-ring',
    'petal-lantern',
    'fern-pearl',
    'sun-biscuit',
    'rain-seed',
    'moss-glow',
    'honey-button',
    'tiny-feather',
    'crystal-mote',
    'daisy-comet',
    'paper-cloud'
  ]]
];

const wearableSeeds: readonly SlotSeed[] = [
  ['felt-bonnet', 'head'],
  ['berry-satchel', 'back'],
  ['moon-collar', 'neck'],
  ['clover-spectacles', 'face'],
  ['cloud-hoodlet', 'head'],
  ['acorn-capelet', 'back'],
  ['sunflower-earband', 'head'],
  ['rainbow-neckerchief', 'neck'],
  ['moss-vest', 'back'],
  ['star-paw-mittens', 'top'],
  ['petal-veil', 'head'],
  ['honey-apron', 'back'],
  ['fern-shoulder-wrap', 'back'],
  ['tiny-button-hat', 'head'],
  ['crystal-kerchief', 'neck'],
  ['sky-ribbon-cape', 'back']
];

const animalPoseSeeds = [
  'pose-pancake',
  'pose-side-eye',
  'pose-tail-tuck',
  'pose-tiny-hop',
  'pose-nose-boop',
  'pose-loaf',
  'pose-hands-up',
  'pose-flop',
  'meadow-vole',
  'fawn-gerbil',
  'winter-hamster',
  'silver-chinchilla',
  'tufted-dormouse',
  'sand-mouse',
  'little-pika',
  'garden-shrew'
] as const;

const decorFootprints = [
  [2, 1],
  [1, 2],
  [1, 1],
  [2, 1],
  [2, 1],
  [1, 2],
  [2, 2],
  [1, 1],
  [1, 1],
  [2, 2],
  [2, 1],
  [2, 1],
  [1, 2],
  [2, 2],
  [2, 1],
  [2, 2]
] as const;

const decorScenes = [
  [30, 61, 22],
  [76, 49, 16],
  [58, 63, 15],
  [42, 66, 22],
  [63, 60, 22],
  [20, 50, 16],
  [14, 52, 22],
  [84, 62, 15],
  [48, 63, 16],
  [34, 48, 22],
  [55, 64, 22],
  [22, 65, 22],
  [70, 50, 16],
  [16, 47, 22],
  [44, 61, 22],
  [68, 48, 22]
] as const;

const floatingSlots: readonly FloatingItemSlot[] = [
  'top',
  'right-high',
  'left-high',
  'right-low',
  'left-low',
  'top',
  'right-high',
  'left-high',
  'right-low',
  'left-low',
  'top',
  'right-high',
  'left-high',
  'right-low',
  'left-low',
  'top'
];

function labelFromId(id: string): string {
  return id
    .split('-')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function rarityAt(index: number): CatalogRarity {
  if ((index + 3) % 19 === 0 || (index + 1) % 31 === 0) return 'special';
  if ((index + 1) % 4 === 0 || (index + 6) % 11 === 0) return 'rare';
  return 'common';
}

function gachaEntry(rewardId: string, rewardType: RewardType, rarity: CatalogRarity): GachaEntry {
  return {
    rewardId,
    rewardType,
    rarity,
    weight: rarity === 'common' ? 10 : rarity === 'rare' ? 6 : 3,
    duplicateShardValue: rarity === 'common' ? 2 : rarity === 'rare' ? 8 : 20
  };
}

export const massDecorItems: DecorItem[] = decorBatches.flatMap(([batch, ids], batchIndex) =>
  ids.map((id, index) => {
    const globalIndex = batchIndex * 16 + index;
    const [footprintW, footprintH] = decorFootprints[index];
    const [sceneX, sceneY, sceneW] = decorScenes[index];
    const rarity = rarityAt(globalIndex);

    return {
      id,
      label: labelFromId(id),
      footprint: { w: footprintW, h: footprintH },
      src: `${decorSourceBase}/${batch}/${id}.png`,
      scene: { x: sceneX, y: sceneY, w: sceneW },
      bonusPerSecond: rarity === 'special' ? 16 : rarity === 'rare' ? 12 : 8,
      rarity,
      unlockSource: 'free_gift'
    };
  })
);

export const massFloatingItems: FloatingItem[] = floatingBatches.flatMap(([pack, ids], batchIndex) =>
  ids.map((id, index) => ({
    id,
    label: labelFromId(id),
    slot: floatingSlots[index],
    kind: 'float',
    rarity: rarityAt(batchIndex * 16 + index),
    src: `${floatingSourceBase}/${pack}/${id}.png`
  }))
);

export const massWearableItems: FloatingItem[] = wearableSeeds.map(([id, slot], index) => ({
  id,
  label: labelFromId(id),
  slot,
  kind: 'wearable',
  rarity: rarityAt(index),
  src: `${wardrobeSourceBase}/batch-006/${id}.png`
}));

export const massPixelDeguShots: PixelDeguShot[] = animalPoseSeeds.map((id, index) => ({
  id,
  label: labelFromId(id),
  rarity: rarityAt(index),
  unlockSource: 'free_gift',
  src: `${animalPoseSourceBase}/${id}.png`,
  source: animalPoseSource
}));

export const massSkyGiftEntries: GachaEntry[] = [
  ...massDecorItems.map((item) => gachaEntry(item.id, 'decor', item.rarity ?? 'common')),
  ...massFloatingItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...massWearableItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...massPixelDeguShots.map((item) => gachaEntry(item.id, 'animal', item.rarity ?? 'common'))
];

export const massPremiumSkyGiftEntries: GachaEntry[] = massSkyGiftEntries
  .filter((entry) => entry.rarity !== 'common')
  .map((entry) => ({
    ...entry,
    weight: entry.rarity === 'rare' ? 5 : 3,
    duplicateShardValue: entry.rarity === 'rare' ? 10 : 24
  }));
