import type { CatalogRarity, DecorItem, FloatingItem, FloatingItemSlot, PixelDeguShot } from './content';
import type { GachaEntry, RewardType } from './gacha';

type DecorSeed = readonly [
  id: string,
  label: string,
  footprintW: number,
  footprintH: number,
  sceneX: number,
  sceneY: number,
  sceneW: number,
  bonusPerSecond: number,
  rarity: CatalogRarity
];

type WearableSeed = readonly [
  id: string,
  label: string,
  slot: FloatingItemSlot,
  rarity: CatalogRarity
];

type FloatingSeed = readonly [
  id: string,
  label: string,
  slot: FloatingItemSlot,
  rarity: CatalogRarity
];

type ShotSeed = readonly [
  id: string,
  label: string,
  rarity: CatalogRarity
];

const decorSourceBase = '/images/runtime/decor';
const floatingSourceBase = '/images/runtime/floating-items';
const wardrobeSourceBase = '/images/runtime/wardrobe';
const animalPoseSourceBase = '/images/runtime/characters/animals/batch-002';
const animalPoseSource = 'assets/source/imagegen/animal-pose-pack-002/animal-pose-pack-002__source.png';

function decor(batch: string, seeds: readonly DecorSeed[]): DecorItem[] {
  return seeds.map(([id, label, footprintW, footprintH, sceneX, sceneY, sceneW, bonusPerSecond, rarity]) => ({
    id,
    label,
    footprint: { w: footprintW, h: footprintH },
    src: `${decorSourceBase}/${batch}/${id}.png`,
    scene: { x: sceneX, y: sceneY, w: sceneW },
    bonusPerSecond,
    rarity,
    unlockSource: 'free_gift'
  }));
}

function floating(pack: string, seeds: readonly FloatingSeed[]): FloatingItem[] {
  return seeds.map(([id, label, slot, rarity]) => ({
    id,
    label,
    slot,
    kind: 'float',
    rarity,
    src: `${floatingSourceBase}/${pack}/${id}.png`
  }));
}

function wearable(batch: string, seeds: readonly WearableSeed[]): FloatingItem[] {
  return seeds.map(([id, label, slot, rarity]) => ({
    id,
    label,
    slot,
    kind: 'wearable',
    rarity,
    src: `${wardrobeSourceBase}/${batch}/${id}.png`
  }));
}

export const expandedDecorItems: DecorItem[] = [
  ...decor('batch-006', [
    ['dewdrop-greenhouse', 'Dewdrop greenhouse', 2, 2, 16, 46, 22, 14, 'rare'],
    ['sunflower-wagon', 'Sunflower wagon', 2, 1, 36, 62, 22, 9, 'common'],
    ['acorn-library', 'Acorn library', 2, 2, 68, 50, 22, 13, 'rare'],
    ['berry-tea-table', 'Berry tea table', 1, 1, 47, 63, 16, 8, 'common'],
    ['fern-reading-nook', 'Fern nook', 2, 1, 22, 58, 23, 11, 'rare'],
    ['honeycomb-shelf', 'Honeycomb shelf', 1, 2, 82, 50, 16, 12, 'rare'],
    ['willow-swing', 'Willow swing', 2, 2, 56, 48, 23, 15, 'special'],
    ['snail-mail-station', 'Snail mail', 1, 1, 72, 63, 15, 7, 'common'],
    ['butterfly-planter', 'Butterfly planter', 2, 1, 12, 57, 20, 9, 'common'],
    ['starry-rug', 'Starry rug', 2, 1, 42, 66, 22, 6, 'common'],
    ['mini-pond', 'Mini pond', 2, 1, 58, 65, 22, 8, 'common'],
    ['seed-mill', 'Seed mill', 2, 2, 74, 56, 21, 14, 'rare'],
    ['leafy-bridge', 'Leafy bridge', 2, 1, 34, 56, 23, 10, 'rare'],
    ['cookie-stump-table', 'Cookie stump', 1, 1, 29, 63, 16, 7, 'common'],
    ['daisy-bell-tower', 'Daisy bell tower', 1, 2, 78, 49, 16, 13, 'rare'],
    ['rainbow-moss-step', 'Rainbow moss step', 2, 1, 50, 61, 22, 10, 'rare']
  ]),
  ...decor('batch-007', [
    ['cloud-telescope', 'Cloud telescope', 1, 2, 22, 50, 16, 13, 'rare'],
    ['moonflower-bed', 'Moonflower bed', 2, 1, 44, 61, 22, 10, 'rare'],
    ['tiny-well', 'Tiny well', 1, 1, 66, 63, 16, 7, 'common'],
    ['garden-loom', 'Garden loom', 2, 1, 28, 59, 22, 9, 'common'],
    ['crystal-windmill', 'Crystal windmill', 2, 2, 72, 55, 22, 15, 'special'],
    ['clover-trellis', 'Clover trellis', 2, 2, 17, 50, 21, 12, 'rare'],
    ['berry-crate-stack', 'Berry crate stack', 1, 1, 54, 63, 15, 7, 'common'],
    ['sleepy-hay-sofa', 'Sleepy hay sofa', 2, 1, 59, 58, 23, 11, 'rare'],
    ['misty-arch-gate', 'Misty arch gate', 2, 2, 35, 47, 22, 14, 'rare'],
    ['sun-dial-stone', 'Sun dial stone', 1, 1, 76, 62, 15, 8, 'common'],
    ['lantern-mushroom', 'Lantern mushroom', 1, 2, 83, 52, 15, 12, 'rare'],
    ['acorn-storage-hutch', 'Acorn hutch', 2, 2, 13, 53, 22, 13, 'rare'],
    ['petal-carpet', 'Petal carpet', 2, 1, 42, 66, 22, 6, 'common'],
    ['leaf-parasol-stand', 'Leaf parasol', 1, 2, 69, 48, 17, 11, 'rare'],
    ['bamboo-water-spout', 'Bamboo spout', 1, 1, 31, 63, 16, 8, 'common'],
    ['glowworm-lamp-post', 'Glow lamp post', 1, 2, 78, 46, 16, 13, 'rare']
  ])
];

export const expandedFloatingItems: FloatingItem[] = [
  ...floating('pack-003', [
    ['dew-orb-buddy', 'Dew orb', 'top', 'common'],
    ['mini-cloud-goose', 'Cloud goose', 'right-high', 'special'],
    ['clover-kite', 'Clover kite', 'left-high', 'common'],
    ['berry-bell', 'Berry bell', 'right-low', 'common'],
    ['acorn-balloon', 'Acorn balloon', 'top', 'rare'],
    ['moon-moth', 'Moon moth', 'left-high', 'rare'],
    ['star-seedling', 'Star seedling', 'left-low', 'rare'],
    ['rain-drop-friend', 'Rain drop', 'right-high', 'common'],
    ['tiny-teacup', 'Tiny teacup', 'right-low', 'common'],
    ['daisy-spark', 'Daisy spark', 'left-high', 'common'],
    ['leaf-fan-charm', 'Leaf fan', 'left-low', 'common'],
    ['honey-bee-puff', 'Honey puff', 'right-high', 'rare'],
    ['crystal-moon', 'Crystal moon', 'top', 'special'],
    ['paper-star', 'Paper star', 'top', 'common'],
    ['carrot-satellite', 'Carrot satellite', 'right-high', 'rare'],
    ['mist-sprite', 'Mist sprite', 'left-low', 'special']
  ]),
  ...floating('pack-004', [
    ['sleepy-cloudlet', 'Sleepy cloudlet', 'top', 'common'],
    ['moss-ball-charm', 'Moss ball', 'right-low', 'common'],
    ['sunflower-petal', 'Sunflower petal', 'left-high', 'common'],
    ['shell-lantern', 'Shell lantern', 'right-high', 'rare'],
    ['cotton-sprout', 'Cotton sprout', 'left-low', 'common'],
    ['ribbon-bird', 'Ribbon bird', 'top', 'rare'],
    ['blueberry-orb', 'Blueberry orb', 'right-low', 'common'],
    ['tiny-umbrella', 'Tiny umbrella', 'right-high', 'rare'],
    ['seed-rocket', 'Seed rocket', 'top', 'special'],
    ['bell-acorn', 'Bell acorn', 'left-high', 'common'],
    ['plum-crystal', 'Plum crystal', 'right-high', 'rare'],
    ['feather-moon', 'Feather moon', 'left-low', 'rare'],
    ['clover-drone', 'Clover drone', 'top', 'rare'],
    ['lantern-fish', 'Lantern fish', 'right-high', 'special'],
    ['rose-puff', 'Rose puff', 'left-high', 'common'],
    ['maple-pinwheel', 'Maple pinwheel', 'top', 'common']
  ])
];

export const expandedWearableItems: FloatingItem[] = wearable('batch-004', [
  ['rainbow-hood', 'Rainbow hood', 'head', 'rare'],
  ['acorn-backpack', 'Acorn backpack', 'back', 'common'],
  ['moon-scarf', 'Moon scarf', 'neck', 'rare'],
  ['clover-visor', 'Clover visor', 'face', 'common'],
  ['sunflower-hat', 'Sunflower hat', 'head', 'rare'],
  ['crystal-goggles', 'Crystal goggles', 'face', 'rare'],
  ['mossy-cape', 'Mossy cape', 'back', 'common'],
  ['picnic-bowtie', 'Picnic bowtie', 'neck', 'common'],
  ['starry-poncho', 'Starry poncho', 'back', 'special'],
  ['berry-ear-clip', 'Berry ear clip', 'head', 'common'],
  ['cloud-mittens', 'Cloud mittens', 'top', 'common'],
  ['leaf-crown', 'Leaf crown', 'head', 'rare'],
  ['tiny-collar-bell', 'Collar bell', 'neck', 'common'],
  ['garden-apron', 'Garden apron', 'back', 'rare'],
  ['dewdrop-glasses', 'Dewdrop glasses', 'face', 'rare'],
  ['petal-cape', 'Petal cape', 'back', 'rare']
]);

const expandedShotSeeds: readonly ShotSeed[] = [
  ['pose-curled', 'Curled pose', 'common'],
  ['pose-sniff', 'Sniffing pose', 'common'],
  ['pose-sit-up', 'Sit-up pose', 'common'],
  ['pose-hop', 'Hopping pose', 'common'],
  ['pose-nibble', 'Nibbling pose', 'common'],
  ['pose-groom', 'Grooming pose', 'rare'],
  ['pose-stretch', 'Stretching pose', 'rare'],
  ['pose-snooze', 'Snoozing pose', 'rare'],
  ['white-mouse', 'White mouse', 'common'],
  ['dormouse', 'Dormouse', 'common'],
  ['chipmunk', 'Chipmunk', 'rare'],
  ['fancy-rat', 'Fancy rat', 'rare'],
  ['guinea-pig', 'Guinea pig', 'rare'],
  ['pika', 'Pika', 'special'],
  ['jerboa', 'Jerboa', 'rare'],
  ['hedgehog', 'Hedgehog', 'special']
];

export const expandedPixelDeguShots: PixelDeguShot[] = expandedShotSeeds.map(([id, label, rarity]) => ({
  id,
  label,
  rarity,
  unlockSource: 'free_gift',
  src: `${animalPoseSourceBase}/${id}.png`,
  source: animalPoseSource
}));

const decorBatch005Rarities: Record<string, CatalogRarity> = {
  'moss-arch': 'rare',
  'cloud-fountain': 'rare',
  'clover-rug': 'common',
  'tiny-seed-shop-sign': 'rare',
  'moon-birdbath': 'special',
  'star-wind-chime-stand': 'rare',
  'hay-hammock': 'common',
  'mushroom-stool': 'common',
  'crystal-planter': 'rare',
  'rain-jar': 'common',
  'picnic-basket': 'common',
  'carrot-mailbox': 'common',
  'flower-pergola': 'special',
  'wooden-toy-wheel': 'rare',
  'pebble-path-curve': 'common',
  'floating-lantern-stand': 'rare'
};

function gachaEntry(rewardId: string, rewardType: RewardType, rarity: CatalogRarity): GachaEntry {
  return {
    rewardId,
    rewardType,
    rarity,
    weight: rarity === 'common' ? 10 : rarity === 'rare' ? 6 : 3,
    duplicateShardValue: rarity === 'common' ? 2 : rarity === 'rare' ? 8 : 20
  };
}

export const expandedSkyGiftEntries: GachaEntry[] = [
  ...Object.entries(decorBatch005Rarities).map(([id, rarity]) => gachaEntry(id, 'decor', rarity)),
  ...expandedDecorItems.map((item) => gachaEntry(item.id, 'decor', item.rarity ?? 'common')),
  ...expandedFloatingItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...expandedWearableItems.map((item) => gachaEntry(item.id, 'outfit', item.rarity)),
  ...expandedPixelDeguShots.map((item) => gachaEntry(item.id, 'animal', item.rarity ?? 'common'))
];

export const expandedPremiumSkyGiftEntries: GachaEntry[] = expandedSkyGiftEntries
  .filter((entry) => entry.rarity !== 'common')
  .map((entry) => ({
    ...entry,
    weight: entry.rarity === 'rare' ? 5 : 3,
    duplicateShardValue: entry.rarity === 'rare' ? 10 : 24
  }));
