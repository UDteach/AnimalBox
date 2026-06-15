import type { CatalogRarity, DecorItem, FloatingItem, FloatingItemSlot, PixelDeguShot } from './content';
import type { GachaEntry, RewardType } from './gacha';

type Batch = readonly [batch: string, ids: readonly string[]];
type SlotSeed = readonly [id: string, slot: FloatingItemSlot];

const decorSourceBase = '/images/runtime/decor';
const floatingSourceBase = '/images/runtime/floating-items';
const wardrobeSourceBase = '/images/runtime/wardrobe';
const animalPoseSourceBase = '/images/runtime/characters/animals/batch-007';
const animalPoseSource = 'assets/source/imagegen/animal-pose-pack-007/animal-pose-pack-007__source.png';

const decorBatches: readonly Batch[] = [
  ['batch-027', [
    'opal-nest-chaise',
    'lilac-cork-stool',
    'cinnamon-cloud-cabinet',
    'maple-button-well',
    'mint-petal-sofa',
    'pearl-acorn-lamp',
    'velvet-clover-rug',
    'amber-yarn-bridge',
    'biscuit-fern-shelf',
    'dewberry-moon-basin',
    'ivory-thread-gate',
    'rosehip-pebble-table',
    'silk-seed-cradle',
    'willow-honey-arch',
    'plum-felt-dresser',
    'coral-mushroom-bed'
  ]],
  ['batch-028', [
    'opal-tea-bench',
    'lilac-cookie-oven',
    'cinnamon-dew-window',
    'maple-yarn-hammock',
    'mint-acorn-pantry',
    'pearl-clover-lantern',
    'velvet-berry-desk',
    'amber-cork-fountain',
    'biscuit-cloud-tent',
    'dewberry-button-fence',
    'ivory-petal-cabinet',
    'rosehip-thread-stairs',
    'silk-moon-cubby',
    'willow-seed-table',
    'plum-honey-chair',
    'coral-fern-bridge'
  ]],
  ['batch-029', [
    'opal-felt-daybed',
    'lilac-acorn-tower',
    'cinnamon-petal-lamp',
    'maple-cloud-sofa',
    'mint-cookie-cart',
    'pearl-mushroom-shelf',
    'velvet-rain-basin',
    'amber-clover-gazebo',
    'biscuit-seed-rail',
    'dewberry-cork-dresser',
    'ivory-honey-rug',
    'rosehip-yarn-door',
    'silk-fern-fountain',
    'willow-button-bench',
    'plum-moon-window',
    'coral-thread-arch'
  ]],
  ['batch-030', [
    'opal-berry-cupboard',
    'lilac-cloud-cradle',
    'cinnamon-cork-bridge',
    'maple-honey-stool',
    'mint-moon-dresser',
    'pearl-felt-well',
    'velvet-acorn-awning',
    'amber-petal-bed',
    'biscuit-clover-door',
    'dewberry-yarn-chair',
    'ivory-seed-fence',
    'rosehip-cookie-table',
    'silk-mushroom-lamp',
    'willow-rain-sink',
    'plum-thread-hammock',
    'coral-pebble-tower'
  ]],
  ['batch-031', [
    'opal-button-gazebo',
    'lilac-honey-basin',
    'cinnamon-fern-sofa',
    'maple-felt-cabinet',
    'mint-cork-lantern',
    'pearl-cloud-bench',
    'velvet-moon-arch',
    'amber-seed-pantry',
    'biscuit-petal-rug',
    'dewberry-clover-stairs',
    'ivory-yarn-loom',
    'rosehip-acorn-window',
    'silk-cookie-chair',
    'willow-mushroom-cradle',
    'plum-rain-fountain',
    'coral-honey-bed'
  ]]
];

const floatingBatches: readonly Batch[] = [
  ['pack-018', [
    'opal-mote',
    'lilac-pearllet',
    'cinnamon-wisp',
    'maple-glimmer',
    'mint-bubblelet',
    'pearl-threadlet',
    'velvet-spark',
    'amber-cloudlet',
    'biscuit-moonlet',
    'dewberry-orb',
    'ivory-buttonlet',
    'rosehip-teardrop',
    'silk-starlet',
    'willow-corklet',
    'plum-ribbonlet',
    'coral-glowlet'
  ]],
  ['pack-019', [
    'opal-dewdrop',
    'lilac-bobble',
    'cinnamon-ringlet',
    'maple-sparklet',
    'mint-pearl',
    'pearl-seedlet',
    'velvet-loop',
    'amber-featherlet',
    'biscuit-glint',
    'dewberry-comet',
    'ivory-moonseed',
    'rosehip-belllet',
    'silk-cork',
    'willow-button',
    'plum-wisp',
    'coral-threadlet'
  ]],
  ['pack-020', [
    'opal-cookielet',
    'lilac-mote',
    'cinnamon-orb',
    'maple-ribbon',
    'mint-thread',
    'pearl-biscuit',
    'velvet-daisy',
    'amber-bobbin',
    'biscuit-cloud',
    'dewberry-sparklet',
    'ivory-ring',
    'rosehip-seed',
    'silk-glow',
    'willow-pearl',
    'plum-buttonlet',
    'coral-moonlet'
  ]]
];

const wearableSeeds: readonly SlotSeed[] = [
  ['opal-beret', 'head'],
  ['lilac-collar', 'neck'],
  ['cinnamon-capelet', 'back'],
  ['maple-monocle', 'face'],
  ['mint-hoodie', 'back'],
  ['pearl-pouch', 'back'],
  ['velvet-bib', 'neck'],
  ['amber-hat', 'head'],
  ['biscuit-scarf', 'neck'],
  ['dewberry-vest', 'back'],
  ['ivory-earwrap', 'head'],
  ['rosehip-kerchief', 'neck'],
  ['silk-backpack', 'back'],
  ['willow-wool-bow', 'head'],
  ['plum-bonnet', 'head'],
  ['coral-poncho', 'back']
];

const animalPoseSeeds = [
  'pose-sugar-roll',
  'pose-little-wave',
  'pose-soft-pounce',
  'pose-snack-guard',
  'pose-moon-nap',
  'pose-button-sit',
  'pose-cuddle-peek',
  'pose-daisy-sniff',
  'opal-dormouse',
  'lilac-gerbil',
  'cinnamon-hamster',
  'pearl-chinchilla',
  'velvet-marmot',
  'amber-mouse',
  'willow-pika',
  'coral-vole'
] as const;

const decorFootprints = [
  [2, 1],
  [1, 1],
  [2, 2],
  [1, 1],
  [2, 1],
  [1, 2],
  [2, 1],
  [2, 1],
  [2, 2],
  [1, 1],
  [2, 2],
  [2, 1],
  [2, 1],
  [2, 2],
  [2, 2],
  [2, 1]
] as const;

const decorScenes = [
  [28, 61, 22],
  [78, 63, 15],
  [18, 50, 22],
  [66, 64, 15],
  [43, 62, 23],
  [23, 48, 16],
  [56, 64, 22],
  [72, 62, 24],
  [12, 49, 22],
  [83, 64, 14],
  [60, 50, 22],
  [20, 64, 22],
  [45, 63, 21],
  [74, 49, 22],
  [31, 48, 22],
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
  if ((index + 11) % 31 === 0 || (index + 4) % 43 === 0) return 'special';
  if ((index + 3) % 5 === 0 || (index + 8) % 19 === 0) return 'rare';
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

export const hyperDecorItems: DecorItem[] = decorBatches.flatMap(([batch, ids], batchIndex) =>
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

export const hyperFloatingItems: FloatingItem[] = floatingBatches.flatMap(([pack, ids], batchIndex) =>
  ids.map((id, index) => ({
    id,
    label: labelFromId(id),
    slot: floatingSlots[index],
    kind: 'float',
    rarity: rarityAt(batchIndex * 16 + index),
    src: `${floatingSourceBase}/${pack}/${id}.png`
  }))
);

export const hyperWearableItems: FloatingItem[] = wearableSeeds.map(([id, slot], index) => ({
  id,
  label: labelFromId(id),
  slot,
  kind: 'wearable',
  rarity: rarityAt(index),
  src: `${wardrobeSourceBase}/batch-009/${id}.png`
}));

export const hyperPixelDeguShots: PixelDeguShot[] = animalPoseSeeds.map((id, index) => ({
  id,
  label: labelFromId(id),
  rarity: rarityAt(index),
  unlockSource: 'free_gift',
  src: `${animalPoseSourceBase}/${id}.png`,
  source: animalPoseSource
}));

export const hyperSkyGiftEntries: GachaEntry[] = [
  ...hyperDecorItems.map((item) => gachaEntry(item.id, 'decor', item.rarity ?? 'common')),
  ...hyperFloatingItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...hyperWearableItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...hyperPixelDeguShots.map((item) => gachaEntry(item.id, 'animal', item.rarity ?? 'common'))
];

export const hyperPremiumSkyGiftEntries: GachaEntry[] = hyperSkyGiftEntries
  .filter((entry) => entry.rarity !== 'common')
  .map((entry) => ({
    ...entry,
    weight: entry.rarity === 'rare' ? 5 : 3,
    duplicateShardValue: entry.rarity === 'rare' ? 10 : 24
  }));
