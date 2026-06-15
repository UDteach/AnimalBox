import type { CatalogRarity, DecorItem, FloatingItem, FloatingItemSlot, PixelDeguShot } from './content';
import type { GachaEntry, RewardType } from './gacha';

type Batch = readonly [batch: string, ids: readonly string[]];
type SlotSeed = readonly [id: string, slot: FloatingItemSlot];

const decorSourceBase = '/images/runtime/decor';
const floatingSourceBase = '/images/runtime/floating-items';
const wardrobeSourceBase = '/images/runtime/wardrobe';
const animalPoseSourceBase = '/images/runtime/characters/animals/batch-008';
const animalPoseSource = 'assets/source/imagegen/animal-pose-pack-008/animal-pose-pack-008__source.png';

const decorBatches: readonly Batch[] = [
  ['batch-032', [
    'nova-cork-chaise',
    'topaz-felt-stool',
    'orchid-cloud-dresser',
    'cedar-button-fountain',
    'silverleaf-petal-sofa',
    'cherry-acorn-lamp',
    'linen-clover-rug',
    'azure-yarn-bridge',
    'olive-fern-cabinet',
    'peach-moon-basin',
    'frost-thread-gate',
    'cocoa-pebble-table',
    'marigold-seed-cradle',
    'quartz-honey-arch',
    'hazel-felt-shelf',
    'morning-mushroom-bed'
  ]],
  ['batch-033', [
    'nova-tea-bench',
    'topaz-cookie-oven',
    'orchid-dew-window',
    'cedar-yarn-hammock',
    'silverleaf-acorn-pantry',
    'cherry-clover-lantern',
    'linen-berry-desk',
    'azure-cork-fountain',
    'olive-cloud-tent',
    'peach-button-fence',
    'frost-petal-cupboard',
    'cocoa-thread-stairs',
    'marigold-moon-cubby',
    'quartz-seed-table',
    'hazel-honey-chair',
    'morning-fern-bridge'
  ]],
  ['batch-034', [
    'nova-felt-daybed',
    'topaz-acorn-tower',
    'orchid-petal-lamp',
    'cedar-cloud-sofa',
    'silverleaf-cookie-cart',
    'cherry-mushroom-shelf',
    'linen-rain-basin',
    'azure-clover-gazebo',
    'olive-seed-rail',
    'peach-cork-dresser',
    'frost-honey-rug',
    'cocoa-yarn-door',
    'marigold-fern-fountain',
    'quartz-button-bench',
    'hazel-moon-window',
    'morning-thread-arch'
  ]],
  ['batch-035', [
    'nova-berry-cupboard',
    'topaz-cloud-cradle',
    'orchid-cork-bridge',
    'cedar-honey-stool',
    'silverleaf-moon-dresser',
    'cherry-felt-well',
    'linen-acorn-awning',
    'azure-petal-bed',
    'olive-clover-door',
    'peach-yarn-chair',
    'frost-seed-fence',
    'cocoa-cookie-table',
    'marigold-mushroom-lamp',
    'quartz-rain-sink',
    'hazel-thread-hammock',
    'morning-pebble-tower'
  ]],
  ['batch-036', [
    'nova-button-gazebo',
    'topaz-honey-basin',
    'orchid-fern-sofa',
    'cedar-felt-cabinet',
    'silverleaf-cork-lantern',
    'cherry-cloud-bench',
    'linen-moon-arch',
    'azure-seed-pantry',
    'olive-petal-rug',
    'peach-clover-stairs',
    'frost-yarn-loom',
    'cocoa-acorn-window',
    'marigold-cookie-chair',
    'quartz-mushroom-cradle',
    'hazel-rain-fountain',
    'morning-honey-bed'
  ]]
];

const floatingBatches: readonly Batch[] = [
  ['pack-021', [
    'nova-mote',
    'topaz-pearllet',
    'orchid-wisp',
    'cedar-glimmer',
    'silverleaf-bubblelet',
    'cherry-threadlet',
    'linen-spark',
    'azure-cloudlet',
    'olive-moonlet',
    'peach-orb',
    'frost-buttonlet',
    'cocoa-teardrop',
    'marigold-starlet',
    'quartz-corklet',
    'hazel-ribbonlet',
    'morning-glowlet'
  ]],
  ['pack-022', [
    'nova-dewdrop',
    'topaz-bobble',
    'orchid-ringlet',
    'cedar-sparklet',
    'silverleaf-pearl',
    'cherry-seedlet',
    'linen-loop',
    'azure-featherlet',
    'olive-glint',
    'peach-comet',
    'frost-moonseed',
    'cocoa-belllet',
    'marigold-cork',
    'quartz-button',
    'hazel-wisp',
    'morning-threadlet'
  ]],
  ['pack-023', [
    'nova-cookielet',
    'topaz-mote',
    'orchid-orb',
    'cedar-ribbon',
    'silverleaf-thread',
    'cherry-biscuit',
    'linen-daisy',
    'azure-bobbin',
    'olive-cloud',
    'peach-sparklet',
    'frost-ring',
    'cocoa-seed',
    'marigold-glow',
    'quartz-pearl',
    'hazel-buttonlet',
    'morning-moonlet'
  ]]
];

const wearableSeeds: readonly SlotSeed[] = [
  ['nova-beret', 'head'],
  ['topaz-collar', 'neck'],
  ['orchid-capelet', 'back'],
  ['cedar-monocle', 'face'],
  ['silverleaf-hoodie', 'back'],
  ['cherry-pouch', 'back'],
  ['linen-bib', 'neck'],
  ['azure-hat', 'head'],
  ['olive-scarf', 'neck'],
  ['peach-vest', 'back'],
  ['frost-earwrap', 'head'],
  ['cocoa-kerchief', 'neck'],
  ['marigold-backpack', 'back'],
  ['quartz-wool-bow', 'head'],
  ['hazel-bonnet', 'head'],
  ['morning-poncho', 'back']
];

const animalPoseSeeds = [
  'pose-nova-curl',
  'pose-topaz-wave',
  'pose-orchid-pounce',
  'pose-cedar-guard',
  'pose-silverleaf-nap',
  'pose-cherry-sit',
  'pose-linen-peek',
  'pose-azure-sniff',
  'nova-dormouse',
  'topaz-gerbil',
  'orchid-hamster',
  'cedar-chinchilla',
  'linen-marmot',
  'peach-mouse',
  'quartz-pika',
  'morning-vole'
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
  if ((index + 13) % 37 === 0 || (index + 6) % 47 === 0) return 'special';
  if ((index + 4) % 5 === 0 || (index + 9) % 23 === 0) return 'rare';
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

export const primeDecorItems: DecorItem[] = decorBatches.flatMap(([batch, ids], batchIndex) =>
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

export const primeFloatingItems: FloatingItem[] = floatingBatches.flatMap(([pack, ids], batchIndex) =>
  ids.map((id, index) => ({
    id,
    label: labelFromId(id),
    slot: floatingSlots[index],
    kind: 'float',
    rarity: rarityAt(batchIndex * 16 + index),
    src: `${floatingSourceBase}/${pack}/${id}.png`
  }))
);

export const primeWearableItems: FloatingItem[] = wearableSeeds.map(([id, slot], index) => ({
  id,
  label: labelFromId(id),
  slot,
  kind: 'wearable',
  rarity: rarityAt(index),
  src: `${wardrobeSourceBase}/batch-010/${id}.png`
}));

export const primePixelDeguShots: PixelDeguShot[] = animalPoseSeeds.map((id, index) => ({
  id,
  label: labelFromId(id),
  rarity: rarityAt(index),
  unlockSource: 'free_gift',
  src: `${animalPoseSourceBase}/${id}.png`,
  source: animalPoseSource
}));

export const primeSkyGiftEntries: GachaEntry[] = [
  ...primeDecorItems.map((item) => gachaEntry(item.id, 'decor', item.rarity ?? 'common')),
  ...primeFloatingItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...primeWearableItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...primePixelDeguShots.map((item) => gachaEntry(item.id, 'animal', item.rarity ?? 'common'))
];

export const primePremiumSkyGiftEntries: GachaEntry[] = primeSkyGiftEntries
  .filter((entry) => entry.rarity !== 'common')
  .map((entry) => ({
    ...entry,
    weight: entry.rarity === 'rare' ? 5 : 3,
    duplicateShardValue: entry.rarity === 'rare' ? 10 : 24
  }));
