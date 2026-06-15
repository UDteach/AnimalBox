import type { CatalogRarity, DecorItem, FloatingItem, FloatingItemSlot, PixelDeguShot } from './content';
import type { GachaEntry, RewardType } from './gacha';

type Batch = readonly [batch: string, ids: readonly string[]];
type SlotSeed = readonly [id: string, slot: FloatingItemSlot];

const decorSourceBase = '/images/runtime/decor';
const floatingSourceBase = '/images/runtime/floating-items';
const wardrobeSourceBase = '/images/runtime/wardrobe';
const animalPoseSourceBase = '/images/runtime/characters/animals/batch-010';
const animalPoseSource = 'assets/source/imagegen/animal-pose-pack-010/animal-pose-pack-010__source.png';

const decorBatches: readonly Batch[] = [
  ['batch-042', [
    'alabaster-cork-chaise',
    'paprika-felt-stool',
    'willowmist-cloud-dresser',
    'spruceglow-button-fountain',
    'buttercup-petal-sofa',
    'periwinkle-acorn-lamp',
    'chestnut-clover-rug',
    'tangerine-yarn-bridge',
    'mossberry-cabinet',
    'pearlroot-basin',
    'rainpetal-thread-gate',
    'cinnamon-pebble-table',
    'bluebell-seed-cradle',
    'brook-honey-arch',
    'skylark-felt-shelf',
    'rosebud-mushroom-bed'
  ]],
  ['batch-043', [
    'alabaster-tea-bench',
    'paprika-cookie-oven',
    'willowmist-dew-window',
    'spruceglow-yarn-hammock',
    'buttercup-acorn-pantry',
    'periwinkle-clover-lantern',
    'chestnut-berry-desk',
    'tangerine-cork-fountain',
    'mossberry-cloud-tent',
    'pearlroot-button-fence',
    'rainpetal-cupboard',
    'cinnamon-thread-stairs',
    'bluebell-moon-cubby',
    'brook-seed-table',
    'skylark-honey-chair',
    'rosebud-fern-bridge'
  ]],
  ['batch-044', [
    'alabaster-felt-daybed',
    'paprika-acorn-tower',
    'willowmist-petal-lamp',
    'spruceglow-cloud-sofa',
    'buttercup-cookie-cart',
    'periwinkle-mushroom-shelf',
    'chestnut-rain-basin',
    'tangerine-clover-gazebo',
    'mossberry-seed-rail',
    'pearlroot-cork-dresser',
    'rainpetal-honey-rug',
    'cinnamon-yarn-door',
    'bluebell-fern-fountain',
    'brook-button-bench',
    'skylark-moon-window',
    'rosebud-thread-arch'
  ]],
  ['batch-045', [
    'alabaster-berry-cupboard',
    'paprika-cloud-cradle',
    'willowmist-cork-bridge',
    'spruceglow-honey-stool',
    'buttercup-moon-dresser',
    'periwinkle-felt-well',
    'chestnut-acorn-awning',
    'tangerine-petal-bed',
    'mossberry-clover-door',
    'pearlroot-yarn-chair',
    'rainpetal-seed-fence',
    'cinnamon-cookie-table',
    'bluebell-mushroom-lamp',
    'brook-rain-sink',
    'skylark-thread-hammock',
    'rosebud-pebble-tower'
  ]],
  ['batch-046', [
    'alabaster-button-gazebo',
    'paprika-honey-basin',
    'willowmist-fern-sofa',
    'spruceglow-felt-cabinet',
    'buttercup-cork-lantern',
    'periwinkle-cloud-bench',
    'chestnut-moon-arch',
    'tangerine-seed-pantry',
    'mossberry-petal-rug',
    'pearlroot-clover-stairs',
    'rainpetal-yarn-loom',
    'cinnamon-acorn-window',
    'bluebell-cookie-chair',
    'brook-mushroom-cradle',
    'skylark-rain-fountain',
    'rosebud-honey-bed'
  ]]
];

const floatingBatches: readonly Batch[] = [
  ['pack-027', [
    'alabaster-mote',
    'paprika-pearllet',
    'willowmist-wisp',
    'spruceglow-glimmer',
    'buttercup-bubblelet',
    'periwinkle-threadlet',
    'chestnut-spark',
    'tangerine-cloudlet',
    'mossberry-moonlet',
    'pearlroot-orb',
    'rainpetal-buttonlet',
    'cinnamon-teardrop',
    'bluebell-starlet',
    'brook-corklet',
    'skylark-ribbonlet',
    'rosebud-glowlet'
  ]],
  ['pack-028', [
    'alabaster-dewdrop',
    'paprika-bobble',
    'willowmist-ringlet',
    'spruceglow-sparklet',
    'buttercup-pearl',
    'periwinkle-seedlet',
    'chestnut-loop',
    'tangerine-featherlet',
    'mossberry-glint',
    'pearlroot-comet',
    'rainpetal-moonseed',
    'cinnamon-belllet',
    'bluebell-cork',
    'brook-button',
    'skylark-wisp',
    'rosebud-threadlet'
  ]],
  ['pack-029', [
    'alabaster-cookielet',
    'paprika-mote',
    'willowmist-orb',
    'spruceglow-ribbon',
    'buttercup-thread',
    'periwinkle-biscuit',
    'chestnut-daisy',
    'tangerine-bobbin',
    'mossberry-cloud',
    'pearlroot-sparklet',
    'rainpetal-ring',
    'cinnamon-seed',
    'bluebell-glow',
    'brook-pearl',
    'skylark-buttonlet',
    'rosebud-moonlet'
  ]]
];

const wearableSeeds: readonly SlotSeed[] = [
  ['alabaster-beret', 'head'],
  ['paprika-collar', 'neck'],
  ['willowmist-capelet', 'back'],
  ['spruceglow-monocle', 'face'],
  ['buttercup-hoodie', 'back'],
  ['periwinkle-pouch', 'back'],
  ['chestnut-bib', 'neck'],
  ['tangerine-hat', 'head'],
  ['mossberry-scarf', 'neck'],
  ['pearlroot-vest', 'back'],
  ['rainpetal-earwrap', 'head'],
  ['cinnamon-kerchief', 'neck'],
  ['bluebell-backpack', 'back'],
  ['brook-wool-bow', 'head'],
  ['skylark-bonnet', 'head'],
  ['rosebud-poncho', 'back']
];

const animalPoseSeeds = [
  'pose-alabaster-curl',
  'pose-paprika-wave',
  'pose-willowmist-pounce',
  'pose-spruceglow-guard',
  'pose-buttercup-nap',
  'pose-periwinkle-sit',
  'pose-chestnut-peek',
  'pose-tangerine-sniff',
  'alabaster-dormouse',
  'paprika-gerbil',
  'willowmist-dwarf-hamster',
  'spruceglow-chinchilla',
  'chestnut-marmot',
  'pearlroot-mouse',
  'brook-pika',
  'rosebud-vole'
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
  if ((index + 19) % 37 === 0 || (index + 10) % 47 === 0) return 'special';
  if ((index + 3) % 5 === 0 || (index + 13) % 23 === 0) return 'rare';
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

export const zenithDecorItems: DecorItem[] = decorBatches.flatMap(([batch, ids], batchIndex) =>
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

export const zenithFloatingItems: FloatingItem[] = floatingBatches.flatMap(([pack, ids], batchIndex) =>
  ids.map((id, index) => ({
    id,
    label: labelFromId(id),
    slot: floatingSlots[index],
    kind: 'float',
    rarity: rarityAt(batchIndex * 16 + index),
    src: `${floatingSourceBase}/${pack}/${id}.png`
  }))
);

export const zenithWearableItems: FloatingItem[] = wearableSeeds.map(([id, slot], index) => ({
  id,
  label: labelFromId(id),
  slot,
  kind: 'wearable',
  rarity: rarityAt(index),
  src: `${wardrobeSourceBase}/batch-012/${id}.png`
}));

export const zenithPixelDeguShots: PixelDeguShot[] = animalPoseSeeds.map((id, index) => ({
  id,
  label: labelFromId(id),
  rarity: rarityAt(index),
  unlockSource: 'free_gift',
  src: `${animalPoseSourceBase}/${id}.png`,
  source: animalPoseSource
}));

export const zenithSkyGiftEntries: GachaEntry[] = [
  ...zenithDecorItems.map((item) => gachaEntry(item.id, 'decor', item.rarity ?? 'common')),
  ...zenithFloatingItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...zenithWearableItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...zenithPixelDeguShots.map((item) => gachaEntry(item.id, 'animal', item.rarity ?? 'common'))
];

export const zenithPremiumSkyGiftEntries: GachaEntry[] = zenithSkyGiftEntries
  .filter((entry) => entry.rarity !== 'common')
  .map((entry) => ({
    ...entry,
    weight: entry.rarity === 'rare' ? 5 : 3,
    duplicateShardValue: entry.rarity === 'rare' ? 10 : 24
  }));
