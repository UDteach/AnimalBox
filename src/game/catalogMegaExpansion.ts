import type { CatalogRarity, DecorItem, FloatingItem, FloatingItemSlot, PixelDeguShot } from './content';
import type { GachaEntry, RewardType } from './gacha';

type Batch = readonly [batch: string, ids: readonly string[]];
type SlotSeed = readonly [id: string, slot: FloatingItemSlot];

const decorSourceBase = '/images/runtime/decor';
const floatingSourceBase = '/images/runtime/floating-items';
const wardrobeSourceBase = '/images/runtime/wardrobe';
const animalPoseSourceBase = '/images/runtime/characters/animals/batch-005';
const animalPoseSource = 'assets/source/imagegen/animal-pose-pack-005/animal-pose-pack-005__source.png';

const decorBatches: readonly Batch[] = [
  ['batch-017', [
    'button-mushroom-sofa',
    'cork-cloud-dresser',
    'acorn-pantry-door',
    'clover-stitched-blanket',
    'berry-porch-lamp',
    'moonlit-felt-bridge',
    'seedling-dollhouse',
    'honey-biscuit-table',
    'fern-bunting-arch',
    'daisy-nap-basket',
    'pebble-patch-stairs',
    'rain-glass-stool',
    'sunflower-yarn-shelf',
    'tiny-tea-window',
    'mossy-button-fence',
    'star-petal-bed'
  ]],
  ['batch-018', [
    'cloud-cotton-couch',
    'acorn-puppet-cart',
    'berry-wool-cabinet',
    'clover-cookie-oven',
    'moon-dew-cupboard',
    'fern-story-bench',
    'honey-lace-curtain',
    'petal-rocking-chair',
    'seedling-laundry-basket',
    'rain-mushroom-fountain',
    'cork-flower-desk',
    'daisy-bread-box',
    'star-shell-lantern',
    'mossy-thimble-house',
    'sun-thread-loom',
    'tiny-picnic-arch'
  ]],
  ['batch-019', [
    'felt-carrot-bed',
    'cloud-button-gazebo',
    'acorn-honey-shelf',
    'berry-moon-rug',
    'clover-porcelain-table',
    'fern-candle-nook',
    'daisy-seed-stall',
    'rain-petal-well',
    'sun-cork-mirror',
    'pebble-yarn-circle',
    'mushroom-lace-stool',
    'moonlit-cookie-cabinet',
    'honey-leaf-fountain',
    'tiny-star-crib',
    'moss-berry-awning',
    'flower-cork-bridge'
  ]],
  ['batch-020', [
    'cotton-biscuit-bench',
    'seedling-felt-door',
    'acorn-cloud-clock',
    'berry-flower-rail',
    'clover-tea-stand',
    'moon-shell-couch',
    'fern-button-cabinet',
    'honey-stitch-mat',
    'petal-lantern-tree',
    'rain-cork-basin',
    'daisy-yarn-chair',
    'moss-bread-oven',
    'sunflower-moon-gate',
    'tiny-pebble-shelf',
    'cloud-fern-canopy',
    'star-acorn-tunnel'
  ]],
  ['batch-021', [
    'felt-dew-bed',
    'berry-craft-drawer',
    'clover-cloud-sink',
    'acorn-rain-barrel',
    'mushroom-thread-arch',
    'moon-petal-fountain',
    'fern-honey-pot',
    'daisy-wool-tent',
    'sun-seed-bench',
    'cork-lantern-path',
    'rain-star-table',
    'cloud-cookie-cubby',
    'moss-shell-chair',
    'tiny-flower-stage',
    'honey-clover-hammock',
    'pebble-cotton-rug'
  ]]
];

const floatingBatches: readonly Batch[] = [
  ['pack-012', [
    'wool-moon',
    'berry-loop',
    'cloud-bobbin',
    'clover-pearl',
    'acorn-wisp',
    'sun-daisy',
    'rain-thread',
    'felt-seed',
    'honey-bubble',
    'petal-sparklet',
    'mushroom-orb',
    'fern-teardrop',
    'star-button',
    'dew-cookie',
    'tiny-glow',
    'cork-mote'
  ]],
  ['pack-013', [
    'moon-satchel',
    'clover-nut',
    'berry-wisp',
    'paper-seed',
    'cloud-petal',
    'moss-bell',
    'honey-ring',
    'daisy-pearl',
    'rain-biscuit',
    'acorn-cloudlet',
    'fern-buttonlet',
    'sun-mote',
    'crystal-leaf',
    'wool-starlet',
    'tiny-sparkle',
    'moonlit-thread'
  ]],
  ['pack-014', [
    'seed-bobble',
    'clover-moon',
    'berry-belllet',
    'cloud-coin',
    'acorn-petal',
    'fern-cookie',
    'rain-orb',
    'honey-feather',
    'daisy-glint',
    'paper-starlet',
    'moss-kite',
    'sun-button',
    'crystal-cork',
    'moon-pearl',
    'tiny-ribbon',
    'wool-comet'
  ]]
];

const wearableSeeds: readonly SlotSeed[] = [
  ['cork-beret', 'head'],
  ['berry-collar', 'neck'],
  ['cloud-capelet', 'back'],
  ['clover-monocle', 'face'],
  ['acorn-hoodie', 'back'],
  ['daisy-pouch', 'back'],
  ['moon-bib', 'neck'],
  ['fern-hat', 'head'],
  ['honey-scarf', 'neck'],
  ['star-vest', 'back'],
  ['petal-earwrap', 'head'],
  ['rain-kerchief', 'neck'],
  ['moss-backpack', 'back'],
  ['tiny-thread-bow', 'head'],
  ['crystal-bonnet', 'head'],
  ['sunflower-cape', 'back']
];

const animalPoseSeeds = [
  'pose-sploot',
  'pose-tippy-toes',
  'pose-pocket-peek',
  'pose-happy-spin',
  'pose-sleepy-loaf',
  'pose-seed-hold',
  'pose-ear-scratch',
  'pose-snuggle-ball',
  'masked-dormouse',
  'cream-gerbil',
  'meadow-hamster',
  'blue-chinchilla',
  'baby-marmot',
  'desert-mouse',
  'round-pika',
  'little-vole'
] as const;

const decorFootprints = [
  [2, 1],
  [2, 2],
  [1, 2],
  [2, 1],
  [1, 2],
  [2, 1],
  [2, 2],
  [2, 1],
  [2, 2],
  [2, 1],
  [2, 1],
  [1, 1],
  [2, 2],
  [1, 2],
  [2, 1],
  [2, 1]
] as const;

const decorScenes = [
  [28, 60, 22],
  [72, 48, 20],
  [16, 49, 16],
  [45, 64, 23],
  [67, 50, 16],
  [23, 63, 24],
  [13, 51, 22],
  [56, 63, 21],
  [31, 49, 22],
  [76, 61, 19],
  [51, 62, 23],
  [84, 64, 14],
  [39, 50, 21],
  [18, 48, 15],
  [62, 64, 24],
  [69, 61, 22]
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
  if ((index + 5) % 23 === 0 || (index + 2) % 37 === 0) return 'special';
  if ((index + 1) % 5 === 0 || (index + 4) % 13 === 0) return 'rare';
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

export const megaDecorItems: DecorItem[] = decorBatches.flatMap(([batch, ids], batchIndex) =>
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

export const megaFloatingItems: FloatingItem[] = floatingBatches.flatMap(([pack, ids], batchIndex) =>
  ids.map((id, index) => ({
    id,
    label: labelFromId(id),
    slot: floatingSlots[index],
    kind: 'float',
    rarity: rarityAt(batchIndex * 16 + index),
    src: `${floatingSourceBase}/${pack}/${id}.png`
  }))
);

export const megaWearableItems: FloatingItem[] = wearableSeeds.map(([id, slot], index) => ({
  id,
  label: labelFromId(id),
  slot,
  kind: 'wearable',
  rarity: rarityAt(index),
  src: `${wardrobeSourceBase}/batch-007/${id}.png`
}));

export const megaPixelDeguShots: PixelDeguShot[] = animalPoseSeeds.map((id, index) => ({
  id,
  label: labelFromId(id),
  rarity: rarityAt(index),
  unlockSource: 'free_gift',
  src: `${animalPoseSourceBase}/${id}.png`,
  source: animalPoseSource
}));

export const megaSkyGiftEntries: GachaEntry[] = [
  ...megaDecorItems.map((item) => gachaEntry(item.id, 'decor', item.rarity ?? 'common')),
  ...megaFloatingItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...megaWearableItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...megaPixelDeguShots.map((item) => gachaEntry(item.id, 'animal', item.rarity ?? 'common'))
];

export const megaPremiumSkyGiftEntries: GachaEntry[] = megaSkyGiftEntries
  .filter((entry) => entry.rarity !== 'common')
  .map((entry) => ({
    ...entry,
    weight: entry.rarity === 'rare' ? 5 : 3,
    duplicateShardValue: entry.rarity === 'rare' ? 10 : 24
  }));
