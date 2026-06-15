import type { CatalogRarity, DecorItem, FloatingItem, FloatingItemSlot, PixelDeguShot } from './content';
import type { GachaEntry, RewardType } from './gacha';

type Batch = readonly [batch: string, ids: readonly string[]];
type SlotSeed = readonly [id: string, slot: FloatingItemSlot];

const decorSourceBase = '/images/runtime/decor';
const floatingSourceBase = '/images/runtime/floating-items';
const wardrobeSourceBase = '/images/runtime/wardrobe';
const animalPoseSourceBase = '/images/runtime/characters/animals/batch-009';
const animalPoseSource = 'assets/source/imagegen/animal-pose-pack-009/animal-pose-pack-009__source.png';

const decorBatches: readonly Batch[] = [
  ['batch-037', [
    'glacier-cork-chaise',
    'ember-felt-stool',
    'meadow-cloud-dresser',
    'twilight-button-fountain',
    'honeydew-petal-sofa',
    'lavender-acorn-lamp',
    'cedar-clover-rug',
    'apricot-yarn-bridge',
    'pebblefern-cabinet',
    'moonpeach-basin',
    'mist-thread-gate',
    'nutmeg-pebble-table',
    'saffron-seed-cradle',
    'river-honey-arch',
    'meadowlark-felt-shelf',
    'blossom-mushroom-bed'
  ]],
  ['batch-038', [
    'glacier-tea-bench',
    'ember-cookie-oven',
    'meadow-dew-window',
    'twilight-yarn-hammock',
    'honeydew-acorn-pantry',
    'lavender-clover-lantern',
    'cedar-berry-desk',
    'apricot-cork-fountain',
    'pebblefern-cloud-tent',
    'moonpeach-button-fence',
    'mist-petal-cupboard',
    'nutmeg-thread-stairs',
    'saffron-moon-cubby',
    'river-seed-table',
    'meadowlark-honey-chair',
    'blossom-fern-bridge'
  ]],
  ['batch-039', [
    'glacier-felt-daybed',
    'ember-acorn-tower',
    'meadow-petal-lamp',
    'twilight-cloud-sofa',
    'honeydew-cookie-cart',
    'lavender-mushroom-shelf',
    'cedar-rain-basin',
    'apricot-clover-gazebo',
    'pebblefern-seed-rail',
    'moonpeach-cork-dresser',
    'mist-honey-rug',
    'nutmeg-yarn-door',
    'saffron-fern-fountain',
    'river-button-bench',
    'meadowlark-moon-window',
    'blossom-thread-arch'
  ]],
  ['batch-040', [
    'glacier-berry-cupboard',
    'ember-cloud-cradle',
    'meadow-cork-bridge',
    'twilight-honey-stool',
    'honeydew-moon-dresser',
    'lavender-felt-well',
    'cedar-acorn-awning',
    'apricot-petal-bed',
    'pebblefern-clover-door',
    'moonpeach-yarn-chair',
    'mist-seed-fence',
    'nutmeg-cookie-table',
    'saffron-mushroom-lamp',
    'river-rain-sink',
    'meadowlark-thread-hammock',
    'blossom-pebble-tower'
  ]],
  ['batch-041', [
    'glacier-button-gazebo',
    'ember-honey-basin',
    'meadow-fern-sofa',
    'twilight-felt-cabinet',
    'honeydew-cork-lantern',
    'lavender-cloud-bench',
    'cedar-moon-arch',
    'apricot-seed-pantry',
    'pebblefern-petal-rug',
    'moonpeach-clover-stairs',
    'mist-yarn-loom',
    'nutmeg-acorn-window',
    'saffron-cookie-chair',
    'river-mushroom-cradle',
    'meadowlark-rain-fountain',
    'blossom-honey-bed'
  ]]
];

const floatingBatches: readonly Batch[] = [
  ['pack-024', [
    'glacier-mote',
    'ember-pearllet',
    'meadow-wisp',
    'twilight-glimmer',
    'honeydew-bubblelet',
    'lavender-threadlet',
    'cedar-spark',
    'apricot-cloudlet',
    'pebblefern-moonlet',
    'moonpeach-orb',
    'mist-buttonlet',
    'nutmeg-teardrop',
    'saffron-starlet',
    'river-corklet',
    'meadowlark-ribbonlet',
    'blossom-glowlet'
  ]],
  ['pack-025', [
    'glacier-dewdrop',
    'ember-bobble',
    'meadow-ringlet',
    'twilight-sparklet',
    'honeydew-pearl',
    'lavender-seedlet',
    'cedar-loop',
    'apricot-featherlet',
    'pebblefern-glint',
    'moonpeach-comet',
    'mist-moonseed',
    'nutmeg-belllet',
    'saffron-cork',
    'river-button',
    'meadowlark-wisp',
    'blossom-threadlet'
  ]],
  ['pack-026', [
    'glacier-cookielet',
    'ember-mote',
    'meadow-orb',
    'twilight-ribbon',
    'honeydew-thread',
    'lavender-biscuit',
    'cedar-daisy',
    'apricot-bobbin',
    'pebblefern-cloud',
    'moonpeach-sparklet',
    'mist-ring',
    'nutmeg-seed',
    'saffron-glow',
    'river-pearl',
    'meadowlark-buttonlet',
    'blossom-moonlet'
  ]]
];

const wearableSeeds: readonly SlotSeed[] = [
  ['glacier-beret', 'head'],
  ['ember-collar', 'neck'],
  ['meadow-capelet', 'back'],
  ['twilight-monocle', 'face'],
  ['honeydew-hoodie', 'back'],
  ['lavender-pouch', 'back'],
  ['cedar-bib', 'neck'],
  ['apricot-hat', 'head'],
  ['pebblefern-scarf', 'neck'],
  ['moonpeach-vest', 'back'],
  ['mist-earwrap', 'head'],
  ['nutmeg-kerchief', 'neck'],
  ['saffron-backpack', 'back'],
  ['river-wool-bow', 'head'],
  ['meadowlark-bonnet', 'head'],
  ['blossom-poncho', 'back']
];

const animalPoseSeeds = [
  'pose-glacier-curl',
  'pose-ember-wave',
  'pose-meadow-pounce',
  'pose-twilight-guard',
  'pose-honeydew-nap',
  'pose-lavender-sit',
  'pose-cedar-peek',
  'pose-apricot-sniff',
  'glacier-dormouse',
  'ember-gerbil',
  'meadow-dwarf-hamster',
  'twilight-chinchilla',
  'cedar-marmot',
  'moonpeach-mouse',
  'river-pika',
  'blossom-vole'
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
  if ((index + 17) % 37 === 0 || (index + 8) % 47 === 0) return 'special';
  if ((index + 2) % 5 === 0 || (index + 11) % 23 === 0) return 'rare';
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

export const apexDecorItems: DecorItem[] = decorBatches.flatMap(([batch, ids], batchIndex) =>
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

export const apexFloatingItems: FloatingItem[] = floatingBatches.flatMap(([pack, ids], batchIndex) =>
  ids.map((id, index) => ({
    id,
    label: labelFromId(id),
    slot: floatingSlots[index],
    kind: 'float',
    rarity: rarityAt(batchIndex * 16 + index),
    src: `${floatingSourceBase}/${pack}/${id}.png`
  }))
);

export const apexWearableItems: FloatingItem[] = wearableSeeds.map(([id, slot], index) => ({
  id,
  label: labelFromId(id),
  slot,
  kind: 'wearable',
  rarity: rarityAt(index),
  src: `${wardrobeSourceBase}/batch-011/${id}.png`
}));

export const apexPixelDeguShots: PixelDeguShot[] = animalPoseSeeds.map((id, index) => ({
  id,
  label: labelFromId(id),
  rarity: rarityAt(index),
  unlockSource: 'free_gift',
  src: `${animalPoseSourceBase}/${id}.png`,
  source: animalPoseSource
}));

export const apexSkyGiftEntries: GachaEntry[] = [
  ...apexDecorItems.map((item) => gachaEntry(item.id, 'decor', item.rarity ?? 'common')),
  ...apexFloatingItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...apexWearableItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...apexPixelDeguShots.map((item) => gachaEntry(item.id, 'animal', item.rarity ?? 'common'))
];

export const apexPremiumSkyGiftEntries: GachaEntry[] = apexSkyGiftEntries
  .filter((entry) => entry.rarity !== 'common')
  .map((entry) => ({
    ...entry,
    weight: entry.rarity === 'rare' ? 5 : 3,
    duplicateShardValue: entry.rarity === 'rare' ? 10 : 24
  }));
