import type { CatalogRarity, DecorItem, FloatingItem, FloatingItemSlot, PixelDeguShot } from './content';
import type { GachaEntry, RewardType } from './gacha';

type Batch = readonly [batch: string, ids: readonly string[]];
type SlotSeed = readonly [id: string, slot: FloatingItemSlot];

const decorSourceBase = '/images/runtime/decor';
const floatingSourceBase = '/images/runtime/floating-items';
const wardrobeSourceBase = '/images/runtime/wardrobe';
const animalPoseSourceBase = '/images/runtime/characters/animals/batch-012';
const animalPoseSource = 'assets/source/imagegen/animal-pose-pack-012/animal-pose-pack-012__source.png';

const decorBatches: readonly Batch[] = [
  ['batch-052', [
    'opaline-cork-chaise',
    'cranberry-felt-stool',
    'sagebloom-cloud-dresser',
    'sunmoss-button-fountain',
    'vanilla-petal-sofa',
    'wisteria-acorn-lamp',
    'oakleaf-clover-rug',
    'pumpkin-yarn-bridge',
    'mossvale-cabinet',
    'pearlshell-basin',
    'rainwillow-thread-gate',
    'coppernut-pebble-table',
    'irisblue-seed-cradle',
    'brooklet-honey-arch',
    'larksong-felt-shelf',
    'camellia-mushroom-bed'
  ]],
  ['batch-053', [
    'opaline-tea-bench',
    'cranberry-cookie-oven',
    'sagebloom-dew-window',
    'sunmoss-yarn-hammock',
    'vanilla-acorn-pantry',
    'wisteria-clover-lantern',
    'oakleaf-berry-desk',
    'pumpkin-cork-fountain',
    'mossvale-cloud-tent',
    'pearlshell-button-fence',
    'rainwillow-cupboard',
    'coppernut-thread-stairs',
    'irisblue-moon-cubby',
    'brooklet-seed-table',
    'larksong-honey-chair',
    'camellia-fern-bridge'
  ]],
  ['batch-054', [
    'opaline-felt-daybed',
    'cranberry-acorn-tower',
    'sagebloom-petal-lamp',
    'sunmoss-cloud-sofa',
    'vanilla-cookie-cart',
    'wisteria-mushroom-shelf',
    'oakleaf-rain-basin',
    'pumpkin-clover-gazebo',
    'mossvale-seed-rail',
    'pearlshell-cork-dresser',
    'rainwillow-honey-rug',
    'coppernut-yarn-door',
    'irisblue-fern-fountain',
    'brooklet-button-bench',
    'larksong-moon-window',
    'camellia-thread-arch'
  ]],
  ['batch-055', [
    'opaline-berry-cupboard',
    'cranberry-cloud-cradle',
    'sagebloom-cork-bridge',
    'sunmoss-honey-stool',
    'vanilla-moon-dresser',
    'wisteria-felt-well',
    'oakleaf-acorn-awning',
    'pumpkin-petal-bed',
    'mossvale-clover-door',
    'pearlshell-yarn-chair',
    'rainwillow-seed-fence',
    'coppernut-cookie-table',
    'irisblue-mushroom-lamp',
    'brooklet-rain-sink',
    'larksong-thread-hammock',
    'camellia-pebble-tower'
  ]],
  ['batch-056', [
    'opaline-button-gazebo',
    'cranberry-honey-basin',
    'sagebloom-fern-sofa',
    'sunmoss-felt-cabinet',
    'vanilla-cork-lantern',
    'wisteria-cloud-bench',
    'oakleaf-moon-arch',
    'pumpkin-seed-pantry',
    'mossvale-petal-rug',
    'pearlshell-clover-stairs',
    'rainwillow-yarn-loom',
    'coppernut-acorn-window',
    'irisblue-cookie-chair',
    'brooklet-mushroom-cradle',
    'larksong-rain-fountain',
    'camellia-honey-bed'
  ]]
];

const floatingBatches: readonly Batch[] = [
  ['pack-033', [
    'opaline-mote',
    'cranberry-pearllet',
    'sagebloom-wisp',
    'sunmoss-glimmer',
    'vanilla-bubblelet',
    'wisteria-threadlet',
    'oakleaf-spark',
    'pumpkin-cloudlet',
    'mossvale-moonlet',
    'pearlshell-orb',
    'rainwillow-buttonlet',
    'coppernut-teardrop',
    'irisblue-starlet',
    'brooklet-corklet',
    'larksong-ribbonlet',
    'camellia-glowlet'
  ]],
  ['pack-034', [
    'opaline-dewdrop',
    'cranberry-bobble',
    'sagebloom-ringlet',
    'sunmoss-sparklet',
    'vanilla-pearl',
    'wisteria-seedlet',
    'oakleaf-loop',
    'pumpkin-featherlet',
    'mossvale-glint',
    'pearlshell-comet',
    'rainwillow-moonseed',
    'coppernut-belllet',
    'irisblue-cork',
    'brooklet-button',
    'larksong-wisp',
    'camellia-threadlet'
  ]],
  ['pack-035', [
    'opaline-cookielet',
    'cranberry-mote',
    'sagebloom-orb',
    'sunmoss-ribbon',
    'vanilla-thread',
    'wisteria-biscuit',
    'oakleaf-daisy',
    'pumpkin-bobbin',
    'mossvale-cloud',
    'pearlshell-sparklet',
    'rainwillow-ring',
    'coppernut-seed',
    'irisblue-glow',
    'brooklet-pearl',
    'larksong-buttonlet',
    'camellia-moonlet'
  ]]
];

const wearableSeeds: readonly SlotSeed[] = [
  ['opaline-beret', 'head'],
  ['cranberry-collar', 'neck'],
  ['sagebloom-capelet', 'back'],
  ['sunmoss-monocle', 'face'],
  ['vanilla-hoodie', 'back'],
  ['wisteria-pouch', 'back'],
  ['oakleaf-bib', 'neck'],
  ['pumpkin-hat', 'head'],
  ['mossvale-scarf', 'neck'],
  ['pearlshell-vest', 'back'],
  ['rainwillow-earwrap', 'head'],
  ['coppernut-kerchief', 'neck'],
  ['irisblue-backpack', 'back'],
  ['brooklet-wool-bow', 'head'],
  ['larksong-bonnet', 'head'],
  ['camellia-poncho', 'back']
];

const animalPoseSeeds = [
  'pose-opaline-curl',
  'pose-cranberry-wave',
  'pose-sagebloom-pounce',
  'pose-sunmoss-guard',
  'pose-vanilla-nap',
  'pose-wisteria-sit',
  'pose-oakleaf-peek',
  'pose-pumpkin-sniff',
  'opaline-dormouse',
  'cranberry-gerbil',
  'sagebloom-dwarf-hamster',
  'sunmoss-chinchilla',
  'oakleaf-marmot',
  'pearlshell-mouse',
  'brooklet-pika',
  'camellia-vole'
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
  if ((index + 29) % 37 === 0 || (index + 14) % 47 === 0) return 'special';
  if ((index + 4) % 5 === 0 || (index + 19) % 23 === 0) return 'rare';
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

export const radiantDecorItems: DecorItem[] = decorBatches.flatMap(([batch, ids], batchIndex) =>
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

export const radiantFloatingItems: FloatingItem[] = floatingBatches.flatMap(([pack, ids], batchIndex) =>
  ids.map((id, index) => ({
    id,
    label: labelFromId(id),
    slot: floatingSlots[index],
    kind: 'float',
    rarity: rarityAt(batchIndex * 16 + index),
    src: `${floatingSourceBase}/${pack}/${id}.png`
  }))
);

export const radiantWearableItems: FloatingItem[] = wearableSeeds.map(([id, slot], index) => ({
  id,
  label: labelFromId(id),
  slot,
  kind: 'wearable',
  rarity: rarityAt(index),
  src: `${wardrobeSourceBase}/batch-014/${id}.png`
}));

export const radiantPixelDeguShots: PixelDeguShot[] = animalPoseSeeds.map((id, index) => ({
  id,
  label: labelFromId(id),
  rarity: rarityAt(index),
  unlockSource: 'free_gift',
  src: `${animalPoseSourceBase}/${id}.png`,
  source: animalPoseSource
}));

export const radiantSkyGiftEntries: GachaEntry[] = [
  ...radiantDecorItems.map((item) => gachaEntry(item.id, 'decor', item.rarity ?? 'common')),
  ...radiantFloatingItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...radiantWearableItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...radiantPixelDeguShots.map((item) => gachaEntry(item.id, 'animal', item.rarity ?? 'common'))
];

export const radiantPremiumSkyGiftEntries: GachaEntry[] = radiantSkyGiftEntries
  .filter((entry) => entry.rarity !== 'common')
  .map((entry) => ({
    ...entry,
    weight: entry.rarity === 'rare' ? 5 : 3,
    duplicateShardValue: entry.rarity === 'rare' ? 10 : 24
  }));
