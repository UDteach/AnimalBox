import type { CatalogRarity, DecorItem, FloatingItem, FloatingItemSlot, PixelDeguShot } from './content';
import type { GachaEntry, RewardType } from './gacha';

type SlotSeed = readonly [suffix: string, slot: FloatingItemSlot];

interface ThemeConfig {
  prefixes: readonly string[];
  decorStart: number;
  decorSuffixBatches: readonly (readonly string[])[];
  floatingStart: number;
  floatingSuffixBatches: readonly (readonly string[])[];
  wardrobeBatch: string;
  animalBatch: string;
  animalPoseItems: readonly string[];
  raritySeed: number;
}

const decorSourceBase = '/images/runtime/decor';
const floatingSourceBase = '/images/runtime/floating-items';
const wardrobeSourceBase = '/images/runtime/wardrobe';

const baseDecorSuffixBatches = [
  [
    'cork-loveseat',
    'felt-drum',
    'cloud-wardrobe',
    'button-spring',
    'petal-lounger',
    'acorn-sconce',
    'clover-mat',
    'yarn-viaduct',
    'moss-cabinet',
    'shell-washbowl',
    'thread-portico',
    'pebble-bistro',
    'seed-bassinet',
    'honey-trellis',
    'felt-cubby',
    'mushroom-nest'
  ],
  [
    'tea-settee',
    'cookie-hearth',
    'dew-porthole',
    'yarn-swing',
    'acorn-cupboard',
    'clover-beacon',
    'berry-writing-desk',
    'cork-spout',
    'cloud-hideout',
    'button-picket',
    'linen-hutch',
    'thread-ladder',
    'moon-den',
    'seed-counter',
    'honey-perch',
    'fern-walkway'
  ],
  [
    'felt-cot',
    'acorn-lookout',
    'petal-glow-lamp',
    'cloud-divan',
    'cookie-trolley',
    'mushroom-bookcase',
    'rain-bowl',
    'clover-pavilion',
    'seed-banister',
    'cork-armoire',
    'honey-mat',
    'yarn-garden-door',
    'fern-spring',
    'button-seat',
    'moon-porthole',
    'thread-gatehouse'
  ],
  [
    'berry-sideboard',
    'cloud-bassinet',
    'cork-overpass',
    'honey-ottoman',
    'moon-vanity',
    'felt-pump',
    'acorn-canopy',
    'petal-cot',
    'clover-entry',
    'yarn-rocker',
    'seed-palisade',
    'cookie-bistro',
    'mushroom-sconce',
    'rain-washstand',
    'thread-sling',
    'pebble-lookout'
  ],
  [
    'button-pavilion',
    'honey-washbowl',
    'fern-loveseat',
    'felt-locker',
    'cork-nightlight',
    'cloud-settee',
    'moon-gateway',
    'seed-cabinet',
    'petal-runner',
    'clover-steps',
    'yarn-spooler',
    'acorn-porthole',
    'cookie-armchair',
    'mushroom-bassinet',
    'rain-spring',
    'honey-daybed'
  ]
] as const;

const bloomExtraDecorSuffixBatch = [
  'cork-tea-cart',
  'felt-garden-seat',
  'cloud-vanity',
  'button-birdbath',
  'petal-reading-nook',
  'acorn-music-box',
  'clover-patch-rug',
  'yarn-covered-bridge',
  'moss-toy-chest',
  'shell-lily-basin',
  'thread-secret-door',
  'pebble-porch-table',
  'seed-lullaby-cradle',
  'honey-flower-arch',
  'felt-display-shelf',
  'mushroom-canopy-bed'
] as const;

const floatingSuffixBatches = [
  [
    'mote',
    'pearllet',
    'wisp',
    'glimmer',
    'bubblelet',
    'threadlet',
    'spark',
    'cloudlet',
    'moonlet',
    'orb',
    'buttonlet',
    'teardrop',
    'starlet',
    'corklet',
    'ribbonlet',
    'glowlet'
  ],
  [
    'dewdrop',
    'bobble',
    'ringlet',
    'sparklet',
    'pearl',
    'seedlet',
    'loop',
    'featherlet',
    'glint',
    'comet',
    'moonseed',
    'belllet',
    'cork',
    'button',
    'wisp',
    'threadlet'
  ],
  [
    'cookielet',
    'mote',
    'orb',
    'ribbon',
    'thread',
    'biscuit',
    'daisy',
    'bobbin',
    'cloud',
    'sparklet',
    'ring',
    'seed',
    'glow',
    'pearl',
    'buttonlet',
    'moonlet'
  ]
] as const;

const wardrobeSeeds: readonly SlotSeed[] = [
  ['beret', 'head'],
  ['collar', 'neck'],
  ['capelet', 'back'],
  ['monocle', 'face'],
  ['hoodie', 'back'],
  ['pouch', 'back'],
  ['bib', 'neck'],
  ['hat', 'head'],
  ['scarf', 'neck'],
  ['vest', 'back'],
  ['earwrap', 'head'],
  ['kerchief', 'neck'],
  ['backpack', 'back'],
  ['wool-bow', 'head'],
  ['bonnet', 'head'],
  ['poncho', 'back']
];

const orbitTheme: ThemeConfig = {
  prefixes: [
    'gleam',
    'maple',
    'meadowbright',
    'snowcap',
    'blueberry',
    'amber',
    'mintleaf',
    'rosehip',
    'silverdew',
    'duskglow',
    'cedar',
    'apricot',
    'lotus',
    'pebblebrook',
    'honeyfern',
    'violet'
  ],
  decorStart: 57,
  decorSuffixBatches: baseDecorSuffixBatches,
  floatingStart: 36,
  floatingSuffixBatches,
  wardrobeBatch: '015',
  animalBatch: '013',
  animalPoseItems: [
    'pose-gleam-curl',
    'pose-maple-wave',
    'pose-meadowbright-pounce',
    'pose-snowcap-guard',
    'pose-blueberry-nap',
    'pose-amber-sit',
    'pose-mintleaf-peek',
    'pose-rosehip-sniff',
    'gleam-dormouse',
    'maple-gerbil',
    'meadowbright-harvest-mouse',
    'snowcap-chinchilla',
    'amber-marmot',
    'silverdew-mouse',
    'pebblebrook-pika',
    'violet-vole'
  ],
  raritySeed: 31
};

const bloomTheme: ThemeConfig = {
  prefixes: [
    'aurora',
    'brickberry',
    'clovermist',
    'daffodil',
    'elderleaf',
    'frostmint',
    'gingerroot',
    'hazelwood',
    'ivorybell',
    'juniper',
    'kiwibud',
    'lavenderbud',
    'mariglow',
    'nightbloom',
    'oliveleaf',
    'poppyseed'
  ],
  decorStart: 62,
  decorSuffixBatches: [...baseDecorSuffixBatches, bloomExtraDecorSuffixBatch],
  floatingStart: 39,
  floatingSuffixBatches,
  wardrobeBatch: '016',
  animalBatch: '014',
  animalPoseItems: [
    'pose-aurora-curl',
    'pose-brickberry-wave',
    'pose-clovermist-pounce',
    'pose-daffodil-guard',
    'pose-elderleaf-nap',
    'pose-frostmint-sit',
    'pose-gingerroot-peek',
    'pose-hazelwood-sniff',
    'aurora-dormouse',
    'brickberry-gerbil',
    'clovermist-harvest-mouse',
    'daffodil-chinchilla',
    'elderleaf-marmot',
    'frostmint-mouse',
    'gingerroot-pika',
    'hazelwood-vole'
  ],
  raritySeed: 43
};

const themes = [orbitTheme, bloomTheme] as const;

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

function paddedBatch(value: number): string {
  return String(value).padStart(3, '0');
}

function idFromPrefix(prefixes: readonly string[], suffix: string, index: number): string {
  return `${prefixes[index]}-${suffix}`;
}

function labelFromId(id: string): string {
  return id
    .split('-')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function rarityAt(index: number, seed: number): CatalogRarity {
  if ((index + seed) % 37 === 0 || (index + seed + 13) % 47 === 0) return 'special';
  if ((index + seed + 4) % 5 === 0 || (index + seed + 19) % 23 === 0) return 'rare';
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

function buildDecorItems(theme: ThemeConfig): DecorItem[] {
  return theme.decorSuffixBatches.flatMap((suffixes, batchIndex) => {
    const batchNumber = paddedBatch(theme.decorStart + batchIndex);

    return suffixes.map((suffix, index) => {
      const globalIndex = batchIndex * 16 + index;
      const id = idFromPrefix(theme.prefixes, suffix, index);
      const [footprintW, footprintH] = decorFootprints[index];
      const [sceneX, sceneY, sceneW] = decorScenes[index];
      const rarity = rarityAt(globalIndex, theme.raritySeed);

      return {
        id,
        label: labelFromId(id),
        footprint: { w: footprintW, h: footprintH },
        src: `${decorSourceBase}/batch-${batchNumber}/${id}.png`,
        scene: { x: sceneX, y: sceneY, w: sceneW },
        bonusPerSecond: rarity === 'special' ? 16 : rarity === 'rare' ? 12 : 8,
        rarity,
        unlockSource: 'free_gift'
      };
    });
  });
}

function buildFloatingItems(theme: ThemeConfig): FloatingItem[] {
  return theme.floatingSuffixBatches.flatMap((suffixes, batchIndex) => {
    const packNumber = paddedBatch(theme.floatingStart + batchIndex);

    return suffixes.map((suffix, index) => {
      const id = idFromPrefix(theme.prefixes, suffix, index);

      return {
        id,
        label: labelFromId(id),
        slot: floatingSlots[index],
        kind: 'float',
        rarity: rarityAt(batchIndex * 16 + index, theme.raritySeed),
        src: `${floatingSourceBase}/pack-${packNumber}/${id}.png`
      };
    });
  });
}

function buildWearableItems(theme: ThemeConfig): FloatingItem[] {
  return wardrobeSeeds.map(([suffix, slot], index) => {
    const id = idFromPrefix(theme.prefixes, suffix, index);

    return {
      id,
      label: labelFromId(id),
      slot,
      kind: 'wearable',
      rarity: rarityAt(index, theme.raritySeed),
      src: `${wardrobeSourceBase}/batch-${theme.wardrobeBatch}/${id}.png`
    };
  });
}

function buildPixelDeguShots(theme: ThemeConfig): PixelDeguShot[] {
  const source = `assets/source/imagegen/animal-pose-pack-${theme.animalBatch}/animal-pose-pack-${theme.animalBatch}__source.png`;
  const base = `/images/runtime/characters/animals/batch-${theme.animalBatch}`;

  return theme.animalPoseItems.map((id, index) => ({
    id,
    label: labelFromId(id),
    rarity: rarityAt(index, theme.raritySeed),
    unlockSource: 'free_gift',
    src: `${base}/${id}.png`,
    source
  }));
}

export const finaleDecorItems: DecorItem[] = themes.flatMap(buildDecorItems);
export const finaleFloatingItems: FloatingItem[] = themes.flatMap(buildFloatingItems);
export const finaleWearableItems: FloatingItem[] = themes.flatMap(buildWearableItems);
export const finalePixelDeguShots: PixelDeguShot[] = themes.flatMap(buildPixelDeguShots);

export const finaleSkyGiftEntries: GachaEntry[] = [
  ...finaleDecorItems.map((item) => gachaEntry(item.id, 'decor', item.rarity ?? 'common')),
  ...finaleFloatingItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...finaleWearableItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...finalePixelDeguShots.map((item) => gachaEntry(item.id, 'animal', item.rarity ?? 'common'))
];

export const finalePremiumSkyGiftEntries: GachaEntry[] = finaleSkyGiftEntries
  .filter((entry) => entry.rarity !== 'common')
  .map((entry) => ({
    ...entry,
    weight: entry.rarity === 'rare' ? 5 : 3,
    duplicateShardValue: entry.rarity === 'rare' ? 10 : 24
  }));
