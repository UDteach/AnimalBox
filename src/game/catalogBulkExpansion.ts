import type { CatalogRarity, DecorItem, FloatingItem, FloatingItemSlot, PixelDeguShot } from './content';
import type { GachaEntry, RewardType } from './gacha';

type BulkBatch = readonly [batch: string, ids: readonly string[]];
type SlotSeed = readonly [id: string, slot: FloatingItemSlot];

const decorSourceBase = '/images/runtime/decor';
const floatingSourceBase = '/images/runtime/floating-items';
const wardrobeSourceBase = '/images/runtime/wardrobe';
const animalPoseSourceBase = '/images/runtime/characters/animals/batch-003';
const animalPoseSource = 'assets/source/imagegen/animal-pose-pack-003/animal-pose-pack-003__source.png';

const decorBatches: readonly BulkBatch[] = [
  ['batch-008', [
    'dew-lantern-bridge',
    'mint-leaf-sofa',
    'acorn-clock',
    'clover-book-nook',
    'sky-waterwheel',
    'berry-jam-stand',
    'moon-moss-bed',
    'tiny-candle-stump',
    'rainbow-seed-arch',
    'flower-cookie-table',
    'fern-mailbox',
    'cloud-pottery-shelf',
    'star-pebble-circle',
    'honey-tea-kettle',
    'daisy-window-frame',
    'leafy-burrow-door'
  ]],
  ['batch-009', [
    'crystal-puddle',
    'sunflower-bell-post',
    'mushroom-lamp-row',
    'misty-moss-cushion',
    'garden-map-stand',
    'carrot-clock-tower',
    'sleepy-cloud-bench',
    'buttercup-fence',
    'acorn-picnic-table',
    'rain-boot-planter',
    'tiny-twig-bridge',
    'moon-rock-garden',
    'berry-basket-shelf',
    'clover-hammock-post',
    'starry-water-bowl',
    'petal-pinwheel-stand'
  ]],
  ['batch-010', [
    'glass-terrarium',
    'hay-cottage-door',
    'seedling-steps',
    'cloudy-birdhouse',
    'moss-teapot',
    'woodland-music-box',
    'flower-ladder',
    'pebble-mosaic',
    'leafy-market-cart',
    'moonlit-signpost',
    'crystal-bell-trellis',
    'snack-pantry',
    'sun-mirror-stone',
    'bluebell-bench',
    'cotton-grass-pillow',
    'mini-gazebo'
  ]],
  ['batch-011', [
    'bamboo-nap-mat',
    'cloud-harvest-crate',
    'daisy-drinking-fountain',
    'mist-bubble-planter',
    'acorn-toy-chest',
    'clover-music-stand',
    'twig-reading-lamp',
    'moon-cushion',
    'berry-pie-table',
    'leaf-umbrella-seat',
    'crystal-doorway',
    'starry-nest-bowl',
    'fern-canopy',
    'seed-biscuit-jar',
    'flower-rail-fence',
    'tiny-garden-altar'
  ]],
  ['batch-012', [
    'shell-sand-bath',
    'moss-crescent-arch',
    'sky-berry-fountain',
    'mini-waterfall-rock',
    'wood-cookie-path',
    'teacup-planter',
    'sunflower-stage',
    'clover-garden-bed',
    'moon-hay-rack',
    'rainbow-lantern-line',
    'acorn-tunnel-door',
    'petal-storage-box',
    'cloud-puff-chair',
    'butterfly-well',
    'star-map-table',
    'seedling-totem'
  ]]
];

const floatingBatches: readonly BulkBatch[] = [
  ['pack-005', [
    'mint-orb',
    'cloud-biscuit',
    'acorn-spark',
    'moon-drop',
    'clover-bubble',
    'berry-mote',
    'star-cookie',
    'dew-feather',
    'tiny-kite',
    'sun-dot',
    'moss-sprite',
    'honey-glow',
    'rain-pearl',
    'leaf-curl',
    'flower-wisp',
    'crystal-bud'
  ]],
  ['pack-006', [
    'sleepy-button',
    'teapot-puff',
    'shell-spark',
    'seed-comet',
    'butterfly-glimmer',
    'daisy-badge',
    'maple-coin',
    'bluebell-chime',
    'cotton-mote',
    'sky-cork',
    'fern-star',
    'plum-puff',
    'cloud-button',
    'moonberry-orb',
    'twig-charm',
    'rainbow-flit'
  ]],
  ['pack-007', [
    'lantern-bead',
    'clover-planet',
    'acorn-moonlet',
    'mist-drop',
    'petal-boat',
    'sunseed-buddy',
    'berry-ribbon',
    'crystal-bell',
    'paper-leaf',
    'mushroom-dot',
    'dew-crown',
    'star-nut',
    'cloud-shell',
    'honey-moon',
    'fern-wisp',
    'tiny-pinwheel'
  ]]
];

const wearableSeeds: readonly SlotSeed[] = [
  ['mint-hood', 'head'],
  ['berry-backpack', 'back'],
  ['cloud-scarf', 'neck'],
  ['moon-visor', 'face'],
  ['clover-hat', 'head'],
  ['star-goggles', 'face'],
  ['leafy-cape', 'back'],
  ['sun-bowtie', 'neck'],
  ['rain-poncho', 'back'],
  ['acorn-ear-clip', 'head'],
  ['moss-mittens', 'top'],
  ['flower-crownlet', 'head'],
  ['tiny-seed-bell', 'neck'],
  ['crystal-apron', 'back'],
  ['petal-glasses', 'face'],
  ['sky-cape', 'back']
];

const animalPoseSeeds: readonly string[] = [
  'pose-peek',
  'pose-roll',
  'pose-wave',
  'pose-beg',
  'pose-scratch',
  'pose-balance',
  'pose-yawn',
  'pose-cuddle',
  'field-mouse',
  'bank-vole',
  'harvest-mouse',
  'golden-hamster',
  'long-tailed-chinchilla',
  'round-gerbil',
  'small-marmot',
  'desert-hedgehog'
];

const decorFootprints = [
  [2, 2],
  [2, 1],
  [1, 1],
  [2, 1],
  [2, 2],
  [1, 1],
  [2, 1],
  [1, 1],
  [2, 2],
  [1, 1],
  [1, 1],
  [2, 2],
  [2, 1],
  [1, 1],
  [1, 2],
  [2, 2]
] as const;

const decorScenes = [
  [16, 46, 22],
  [36, 61, 22],
  [68, 63, 16],
  [47, 62, 20],
  [72, 52, 22],
  [29, 63, 15],
  [58, 59, 22],
  [76, 63, 15],
  [20, 50, 22],
  [42, 64, 16],
  [83, 61, 15],
  [13, 52, 22],
  [50, 65, 22],
  [64, 63, 16],
  [78, 49, 16],
  [34, 48, 22]
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
  'left-low',
  'right-low',
  'top',
  'right-high',
  'left-high',
  'left-low',
  'right-low',
  'top'
];

function labelFromId(id: string): string {
  return id
    .split('-')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function rarityAt(globalIndex: number): CatalogRarity {
  if ((globalIndex + 1) % 16 === 0 || (globalIndex + 5) % 37 === 0) return 'special';
  if ((globalIndex + 2) % 4 === 0 || (globalIndex + 1) % 7 === 0) return 'rare';
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

export const expandedBulkDecorItems: DecorItem[] = decorBatches.flatMap(([batch, ids], batchIndex) =>
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

export const expandedBulkFloatingItems: FloatingItem[] = floatingBatches.flatMap(([pack, ids], batchIndex) =>
  ids.map((id, index) => {
    const globalIndex = batchIndex * 16 + index;

    return {
      id,
      label: labelFromId(id),
      slot: floatingSlots[index],
      kind: 'float',
      rarity: rarityAt(globalIndex),
      src: `${floatingSourceBase}/${pack}/${id}.png`
    };
  })
);

export const expandedBulkWearableItems: FloatingItem[] = wearableSeeds.map(([id, slot], index) => ({
  id,
  label: labelFromId(id),
  slot,
  kind: 'wearable',
  rarity: rarityAt(index),
  src: `${wardrobeSourceBase}/batch-005/${id}.png`
}));

export const expandedBulkPixelDeguShots: PixelDeguShot[] = animalPoseSeeds.map((id, index) => ({
  id,
  label: labelFromId(id),
  rarity: rarityAt(index),
  unlockSource: 'free_gift',
  src: `${animalPoseSourceBase}/${id}.png`,
  source: animalPoseSource
}));

export const expandedBulkSkyGiftEntries: GachaEntry[] = [
  ...expandedBulkDecorItems.map((item) => gachaEntry(item.id, 'decor', item.rarity ?? 'common')),
  ...expandedBulkFloatingItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...expandedBulkWearableItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...expandedBulkPixelDeguShots.map((item) => gachaEntry(item.id, 'animal', item.rarity ?? 'common'))
];

export const expandedBulkPremiumSkyGiftEntries: GachaEntry[] = expandedBulkSkyGiftEntries
  .filter((entry) => entry.rarity !== 'common')
  .map((entry) => ({
    ...entry,
    weight: entry.rarity === 'rare' ? 5 : 3,
    duplicateShardValue: entry.rarity === 'rare' ? 10 : 24
  }));
