import type { CatalogRarity, DecorItem, FloatingItem, FloatingItemSlot, PixelDeguShot } from './content';
import type { GachaEntry, RewardType } from './gacha';

type Batch = readonly [batch: string, ids: readonly string[]];
type SlotSeed = readonly [id: string, slot: FloatingItemSlot];

const decorSourceBase = '/images/runtime/decor';
const floatingSourceBase = '/images/runtime/floating-items';
const wardrobeSourceBase = '/images/runtime/wardrobe';
const animalPoseSourceBase = '/images/runtime/characters/animals/batch-006';
const animalPoseSource = 'assets/source/imagegen/animal-pose-pack-006/animal-pose-pack-006__source.png';

const decorBatches: readonly Batch[] = [
  ['batch-022', [
    'dewdrop-nest-sofa',
    'acorn-window-seat',
    'clover-milk-crate',
    'berry-button-lamp',
    'moss-cushion-stairs',
    'moon-yarn-bridge',
    'daisy-cookie-table',
    'cloud-felt-wardrobe',
    'fern-thimble-tower',
    'honey-petal-basin',
    'cork-sun-awning',
    'rain-jar-planter',
    'pebble-lace-bench',
    'tiny-seed-desk',
    'star-blanket-fort',
    'sunflower-cotton-bed'
  ]],
  ['batch-023', [
    'felt-berry-couch',
    'clover-biscuit-clock',
    'acorn-thread-shelf',
    'cloud-tea-cabinet',
    'mossy-moon-fountain',
    'daisy-cork-door',
    'honey-wool-rug',
    'fern-petal-arch',
    'rain-button-well',
    'sun-cookie-stool',
    'tiny-flower-cubby',
    'moonlit-pebble-path',
    'berry-lace-curtain',
    'seedling-shell-chair',
    'star-hammock-post',
    'cork-mushroom-table'
  ]],
  ['batch-024', [
    'cotton-clover-daybed',
    'acorn-dew-lantern',
    'berry-seed-pantry',
    'cloud-yarn-hammock',
    'moss-button-stairs',
    'daisy-honey-dresser',
    'fern-biscuit-bench',
    'rain-cork-fountain',
    'sun-petal-gazebo',
    'tiny-moon-shelf',
    'star-thread-loom',
    'flower-pebble-well',
    'clover-glass-stool',
    'moon-cookie-window',
    'honey-felt-bridge',
    'seedling-wool-tent'
  ]],
  ['batch-025', [
    'cork-berry-sofa',
    'clover-rain-sink',
    'acorn-petal-cart',
    'cloud-daisy-rug',
    'moss-honey-oven',
    'moon-button-cupboard',
    'fern-cotton-chair',
    'sunflower-lace-arch',
    'tiny-biscuit-cradle',
    'star-dew-fountain',
    'berry-thread-rail',
    'pebble-cookie-stairs',
    'rain-flower-lamp',
    'daisy-cork-cabinet',
    'honey-mushroom-nook',
    'felt-cloud-canopy'
  ]],
  ['batch-026', [
    'wool-star-bed',
    'berry-acorn-locker',
    'clover-moon-table',
    'cloud-honey-basin',
    'fern-dew-window',
    'moss-cookie-bench',
    'daisy-button-fence',
    'rain-seed-shelf',
    'cork-petal-fountain',
    'tiny-sun-dresser',
    'moonlit-lace-gate',
    'flower-yarn-chair',
    'acorn-glass-lamp',
    'honey-cotton-hammock',
    'pebble-thimble-house',
    'star-mushroom-bridge'
  ]]
];

const floatingBatches: readonly Batch[] = [
  ['pack-015', [
    'wool-dew',
    'berry-buttonlet',
    'cloud-cork',
    'clover-teardrop',
    'acorn-pearl',
    'sun-threadlet',
    'rain-glimmer',
    'felt-bubble',
    'honey-starlet',
    'petal-moonlet',
    'mushroom-spark',
    'fern-mote',
    'star-cookie-charm',
    'dew-bobbin',
    'tiny-comet',
    'cork-glow'
  ]],
  ['pack-016', [
    'moon-button',
    'clover-wool',
    'berry-pearl',
    'paper-moonseed',
    'cloud-ribbon',
    'moss-orb',
    'honey-belllet',
    'daisy-wisp',
    'rain-loop',
    'acorn-thread',
    'fern-sparklet',
    'sun-biscuit-charm',
    'crystal-petal',
    'wool-cloudlet',
    'tiny-glint',
    'moonlit-bobble'
  ]],
  ['pack-017', [
    'seed-pearl',
    'clover-cookie',
    'berry-mote-charm',
    'cloud-starlet',
    'acorn-ribbon',
    'fern-moon',
    'rain-buttonlet',
    'honey-orb',
    'daisy-thread',
    'paper-bell',
    'moss-glimmer',
    'sun-teardrop',
    'crystal-daisy',
    'moon-cork',
    'tiny-bobbin',
    'wool-spark'
  ]]
];

const wearableSeeds: readonly SlotSeed[] = [
  ['dew-beret', 'head'],
  ['acorn-collar', 'neck'],
  ['berry-capelet', 'back'],
  ['cloud-monocle', 'face'],
  ['clover-hoodie', 'back'],
  ['moon-pouch', 'back'],
  ['fern-bib', 'neck'],
  ['daisy-hat', 'head'],
  ['cork-scarf', 'neck'],
  ['honey-vest', 'back'],
  ['star-earwrap', 'head'],
  ['petal-kerchief', 'neck'],
  ['rain-backpack', 'back'],
  ['tiny-wool-bow', 'head'],
  ['moss-bonnet', 'head'],
  ['sunflower-poncho', 'back']
];

const animalPoseSeeds = [
  'pose-belly-slide',
  'pose-cheek-puff',
  'pose-tail-wave',
  'pose-curious-lean',
  'pose-dream-curl',
  'pose-treat-reach',
  'pose-paw-tuck',
  'pose-cozy-sit',
  'golden-dormouse',
  'pearl-gerbil',
  'field-hamster',
  'lavender-chinchilla',
  'snow-marmot',
  'dune-mouse',
  'meadow-pika',
  'velvet-vole'
] as const;

const decorFootprints = [
  [2, 1],
  [2, 1],
  [1, 1],
  [1, 2],
  [2, 1],
  [2, 1],
  [2, 1],
  [2, 2],
  [1, 2],
  [1, 1],
  [2, 2],
  [1, 1],
  [2, 1],
  [1, 1],
  [2, 2],
  [2, 1]
] as const;

const decorScenes = [
  [28, 61, 22],
  [72, 56, 21],
  [18, 64, 15],
  [66, 48, 16],
  [43, 64, 23],
  [23, 63, 24],
  [56, 64, 21],
  [12, 50, 22],
  [36, 48, 17],
  [83, 64, 14],
  [61, 50, 22],
  [20, 65, 15],
  [45, 63, 22],
  [76, 64, 14],
  [31, 49, 22],
  [63, 61, 23]
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
  if ((index + 7) % 29 === 0 || (index + 3) % 41 === 0) return 'special';
  if ((index + 2) % 5 === 0 || (index + 5) % 17 === 0) return 'rare';
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

export const ultraDecorItems: DecorItem[] = decorBatches.flatMap(([batch, ids], batchIndex) =>
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

export const ultraFloatingItems: FloatingItem[] = floatingBatches.flatMap(([pack, ids], batchIndex) =>
  ids.map((id, index) => ({
    id,
    label: labelFromId(id),
    slot: floatingSlots[index],
    kind: 'float',
    rarity: rarityAt(batchIndex * 16 + index),
    src: `${floatingSourceBase}/${pack}/${id}.png`
  }))
);

export const ultraWearableItems: FloatingItem[] = wearableSeeds.map(([id, slot], index) => ({
  id,
  label: labelFromId(id),
  slot,
  kind: 'wearable',
  rarity: rarityAt(index),
  src: `${wardrobeSourceBase}/batch-008/${id}.png`
}));

export const ultraPixelDeguShots: PixelDeguShot[] = animalPoseSeeds.map((id, index) => ({
  id,
  label: labelFromId(id),
  rarity: rarityAt(index),
  unlockSource: 'free_gift',
  src: `${animalPoseSourceBase}/${id}.png`,
  source: animalPoseSource
}));

export const ultraSkyGiftEntries: GachaEntry[] = [
  ...ultraDecorItems.map((item) => gachaEntry(item.id, 'decor', item.rarity ?? 'common')),
  ...ultraFloatingItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...ultraWearableItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...ultraPixelDeguShots.map((item) => gachaEntry(item.id, 'animal', item.rarity ?? 'common'))
];

export const ultraPremiumSkyGiftEntries: GachaEntry[] = ultraSkyGiftEntries
  .filter((entry) => entry.rarity !== 'common')
  .map((entry) => ({
    ...entry,
    weight: entry.rarity === 'rare' ? 5 : 3,
    duplicateShardValue: entry.rarity === 'rare' ? 10 : 24
  }));
