import type { CatalogRarity, DecorItem, FloatingItem, FloatingItemSlot, PixelDeguShot } from './content';
import type { GachaEntry, RewardType } from './gacha';

type Batch = readonly [batch: string, ids: readonly string[]];
type SlotSeed = readonly [id: string, slot: FloatingItemSlot];

const decorSourceBase = '/images/runtime/decor';
const floatingSourceBase = '/images/runtime/floating-items';
const wardrobeSourceBase = '/images/runtime/wardrobe';
const animalPoseSourceBase = '/images/runtime/characters/animals/batch-011';
const animalPoseSource = 'assets/source/imagegen/animal-pose-pack-011/animal-pose-pack-011__source.png';

const decorBatches: readonly Batch[] = [
  ['batch-047', [
    'porcelain-cork-chaise',
    'mulberry-felt-stool',
    'fernmist-cloud-dresser',
    'solstice-button-fountain',
    'marzipan-petal-sofa',
    'lilypad-acorn-lamp',
    'walnutwood-clover-rug',
    'persimmon-yarn-bridge',
    'mosslight-cabinet',
    'pearldew-basin',
    'drizzleleaf-thread-gate',
    'nutbrown-pebble-table',
    'cornflower-seed-cradle',
    'creek-honey-arch',
    'larkspur-felt-shelf',
    'peony-mushroom-bed'
  ]],
  ['batch-048', [
    'porcelain-tea-bench',
    'mulberry-cookie-oven',
    'fernmist-dew-window',
    'solstice-yarn-hammock',
    'marzipan-acorn-pantry',
    'lilypad-clover-lantern',
    'walnutwood-berry-desk',
    'persimmon-cork-fountain',
    'mosslight-cloud-tent',
    'pearldew-button-fence',
    'drizzleleaf-cupboard',
    'nutbrown-thread-stairs',
    'cornflower-moon-cubby',
    'creek-seed-table',
    'larkspur-honey-chair',
    'peony-fern-bridge'
  ]],
  ['batch-049', [
    'porcelain-felt-daybed',
    'mulberry-acorn-tower',
    'fernmist-petal-lamp',
    'solstice-cloud-sofa',
    'marzipan-cookie-cart',
    'lilypad-mushroom-shelf',
    'walnutwood-rain-basin',
    'persimmon-clover-gazebo',
    'mosslight-seed-rail',
    'pearldew-cork-dresser',
    'drizzleleaf-honey-rug',
    'nutbrown-yarn-door',
    'cornflower-fern-fountain',
    'creek-button-bench',
    'larkspur-moon-window',
    'peony-thread-arch'
  ]],
  ['batch-050', [
    'porcelain-berry-cupboard',
    'mulberry-cloud-cradle',
    'fernmist-cork-bridge',
    'solstice-honey-stool',
    'marzipan-moon-dresser',
    'lilypad-felt-well',
    'walnutwood-acorn-awning',
    'persimmon-petal-bed',
    'mosslight-clover-door',
    'pearldew-yarn-chair',
    'drizzleleaf-seed-fence',
    'nutbrown-cookie-table',
    'cornflower-mushroom-lamp',
    'creek-rain-sink',
    'larkspur-thread-hammock',
    'peony-pebble-tower'
  ]],
  ['batch-051', [
    'porcelain-button-gazebo',
    'mulberry-honey-basin',
    'fernmist-fern-sofa',
    'solstice-felt-cabinet',
    'marzipan-cork-lantern',
    'lilypad-cloud-bench',
    'walnutwood-moon-arch',
    'persimmon-seed-pantry',
    'mosslight-petal-rug',
    'pearldew-clover-stairs',
    'drizzleleaf-yarn-loom',
    'nutbrown-acorn-window',
    'cornflower-cookie-chair',
    'creek-mushroom-cradle',
    'larkspur-rain-fountain',
    'peony-honey-bed'
  ]]
];

const floatingBatches: readonly Batch[] = [
  ['pack-030', [
    'porcelain-mote',
    'mulberry-pearllet',
    'fernmist-wisp',
    'solstice-glimmer',
    'marzipan-bubblelet',
    'lilypad-threadlet',
    'walnutwood-spark',
    'persimmon-cloudlet',
    'mosslight-moonlet',
    'pearldew-orb',
    'drizzleleaf-buttonlet',
    'nutbrown-teardrop',
    'cornflower-starlet',
    'creek-corklet',
    'larkspur-ribbonlet',
    'peony-glowlet'
  ]],
  ['pack-031', [
    'porcelain-dewdrop',
    'mulberry-bobble',
    'fernmist-ringlet',
    'solstice-sparklet',
    'marzipan-pearl',
    'lilypad-seedlet',
    'walnutwood-loop',
    'persimmon-featherlet',
    'mosslight-glint',
    'pearldew-comet',
    'drizzleleaf-moonseed',
    'nutbrown-belllet',
    'cornflower-cork',
    'creek-button',
    'larkspur-wisp',
    'peony-threadlet'
  ]],
  ['pack-032', [
    'porcelain-cookielet',
    'mulberry-mote',
    'fernmist-orb',
    'solstice-ribbon',
    'marzipan-thread',
    'lilypad-biscuit',
    'walnutwood-daisy',
    'persimmon-bobbin',
    'mosslight-cloud',
    'pearldew-sparklet',
    'drizzleleaf-ring',
    'nutbrown-seed',
    'cornflower-glow',
    'creek-pearl',
    'larkspur-buttonlet',
    'peony-moonlet'
  ]]
];

const wearableSeeds: readonly SlotSeed[] = [
  ['porcelain-beret', 'head'],
  ['mulberry-collar', 'neck'],
  ['fernmist-capelet', 'back'],
  ['solstice-monocle', 'face'],
  ['marzipan-hoodie', 'back'],
  ['lilypad-pouch', 'back'],
  ['walnutwood-bib', 'neck'],
  ['persimmon-hat', 'head'],
  ['mosslight-scarf', 'neck'],
  ['pearldew-vest', 'back'],
  ['drizzleleaf-earwrap', 'head'],
  ['nutbrown-kerchief', 'neck'],
  ['cornflower-backpack', 'back'],
  ['creek-wool-bow', 'head'],
  ['larkspur-bonnet', 'head'],
  ['peony-poncho', 'back']
];

const animalPoseSeeds = [
  'pose-porcelain-curl',
  'pose-mulberry-wave',
  'pose-fernmist-pounce',
  'pose-solstice-guard',
  'pose-marzipan-nap',
  'pose-lilypad-sit',
  'pose-walnutwood-peek',
  'pose-persimmon-sniff',
  'porcelain-dormouse',
  'mulberry-gerbil',
  'fernmist-dwarf-hamster',
  'solstice-chinchilla',
  'walnutwood-marmot',
  'pearldew-mouse',
  'creek-pika',
  'peony-vole'
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
  if ((index + 23) % 37 === 0 || (index + 12) % 47 === 0) return 'special';
  if ((index + 1) % 5 === 0 || (index + 17) % 23 === 0) return 'rare';
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

export const lumenDecorItems: DecorItem[] = decorBatches.flatMap(([batch, ids], batchIndex) =>
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

export const lumenFloatingItems: FloatingItem[] = floatingBatches.flatMap(([pack, ids], batchIndex) =>
  ids.map((id, index) => ({
    id,
    label: labelFromId(id),
    slot: floatingSlots[index],
    kind: 'float',
    rarity: rarityAt(batchIndex * 16 + index),
    src: `${floatingSourceBase}/${pack}/${id}.png`
  }))
);

export const lumenWearableItems: FloatingItem[] = wearableSeeds.map(([id, slot], index) => ({
  id,
  label: labelFromId(id),
  slot,
  kind: 'wearable',
  rarity: rarityAt(index),
  src: `${wardrobeSourceBase}/batch-013/${id}.png`
}));

export const lumenPixelDeguShots: PixelDeguShot[] = animalPoseSeeds.map((id, index) => ({
  id,
  label: labelFromId(id),
  rarity: rarityAt(index),
  unlockSource: 'free_gift',
  src: `${animalPoseSourceBase}/${id}.png`,
  source: animalPoseSource
}));

export const lumenSkyGiftEntries: GachaEntry[] = [
  ...lumenDecorItems.map((item) => gachaEntry(item.id, 'decor', item.rarity ?? 'common')),
  ...lumenFloatingItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...lumenWearableItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...lumenPixelDeguShots.map((item) => gachaEntry(item.id, 'animal', item.rarity ?? 'common'))
];

export const lumenPremiumSkyGiftEntries: GachaEntry[] = lumenSkyGiftEntries
  .filter((entry) => entry.rarity !== 'common')
  .map((entry) => ({
    ...entry,
    weight: entry.rarity === 'rare' ? 5 : 3,
    duplicateShardValue: entry.rarity === 'rare' ? 10 : 24
  }));
