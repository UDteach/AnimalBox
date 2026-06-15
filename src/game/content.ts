import {
  apexDecorItems,
  apexFloatingItems,
  apexPixelDeguShots,
  apexWearableItems
} from './catalogApexExpansion';
import {
  expandedDecorItems,
  expandedFloatingItems,
  expandedPixelDeguShots,
  expandedWearableItems
} from './catalogExpansion';
import {
  finaleDecorItems,
  finaleFloatingItems,
  finalePixelDeguShots,
  finaleWearableItems
} from './catalogFinalExpansion';
import {
  expandedBulkDecorItems,
  expandedBulkFloatingItems,
  expandedBulkPixelDeguShots,
  expandedBulkWearableItems
} from './catalogBulkExpansion';
import {
  hyperDecorItems,
  hyperFloatingItems,
  hyperPixelDeguShots,
  hyperWearableItems
} from './catalogHyperExpansion';
import {
  massDecorItems,
  massFloatingItems,
  massPixelDeguShots,
  massWearableItems
} from './catalogMassExpansion';
import {
  lumenDecorItems,
  lumenFloatingItems,
  lumenPixelDeguShots,
  lumenWearableItems
} from './catalogLumenExpansion';
import {
  megaDecorItems,
  megaFloatingItems,
  megaPixelDeguShots,
  megaWearableItems
} from './catalogMegaExpansion';
import {
  primeDecorItems,
  primeFloatingItems,
  primePixelDeguShots,
  primeWearableItems
} from './catalogPrimeExpansion';
import {
  radiantDecorItems,
  radiantFloatingItems,
  radiantPixelDeguShots,
  radiantWearableItems
} from './catalogRadiantExpansion';
import {
  ultraDecorItems,
  ultraFloatingItems,
  ultraPixelDeguShots,
  ultraWearableItems
} from './catalogUltraExpansion';
import {
  zenithDecorItems,
  zenithFloatingItems,
  zenithPixelDeguShots,
  zenithWearableItems
} from './catalogZenithExpansion';

export type ScreenId = 'home' | 'placement' | 'wardrobe' | 'gacha' | 'storage';

export type CatalogKind = 'background' | 'degu_variant' | 'pose' | 'animal' | 'decor' | 'accessory';
export type CatalogRarity = 'common' | 'rare' | 'special';
export type UnlockSource = 'starter' | 'free_gift' | 'event' | 'coin_shop';
export type CatalogOwnershipFilter = 'all' | 'owned' | 'locked';

export interface CatalogFilterState {
  query: string;
  kind: CatalogKind | 'all';
  rarity: CatalogRarity | 'all';
  ownership: CatalogOwnershipFilter;
}

export interface CollectionGroup {
  id: string;
  label: string;
  owned: number;
  total: number;
  nextLabel: string;
}

export interface CatalogItem {
  id: string;
  label: string;
  kind: CatalogKind;
  rarity: CatalogRarity;
  unlockSource: UnlockSource;
  src: string;
  source?: string;
  swatch?: string;
  slot?: FloatingItemSlot;
  bonusPerSecond?: number;
}

export type FloatingItemSlot =
  | 'head'
  | 'neck'
  | 'back'
  | 'face'
  | 'top'
  | 'left-high'
  | 'left-low'
  | 'right-high'
  | 'right-low';

export interface MockupScreen {
  id: ScreenId;
  label: string;
  image: string;
  width: number;
  height: number;
}

export interface BackgroundTheme {
  id: string;
  label: string;
  src: string;
  swatch: string;
  mood: 'day' | 'morning' | 'sunset' | 'rain' | 'night';
  unlockSource: UnlockSource;
}

export interface DeguVariant {
  id: string;
  label: string;
  swatch: string;
  filter: string;
  src?: string;
  source?: string;
  rarity?: CatalogRarity;
  unlockSource?: UnlockSource;
}

export interface PixelDeguShot {
  id: string;
  label: string;
  src: string;
  source: string;
  rarity?: CatalogRarity;
  unlockSource?: UnlockSource;
}

export interface FloatingItem {
  id: string;
  label: string;
  slot: FloatingItemSlot;
  kind?: 'wearable' | 'float';
  rarity: CatalogRarity;
  src: string;
}

export interface DecorItem {
  id: string;
  label: string;
  footprint: { w: number; h: number };
  src: string;
  scene: { x: number; y: number; w: number };
  bonusPerSecond: number;
  rarity?: CatalogRarity;
  unlockSource?: UnlockSource;
}

export const screens: Record<ScreenId, MockupScreen> = {
  home: {
    id: 'home',
    label: 'Island',
    image: '/images/runtime/backgrounds/floating-island.png',
    width: 853,
    height: 1844
  },
  placement: {
    id: 'placement',
    label: 'Decor',
    image: '/images/runtime/backgrounds/floating-island.png',
    width: 853,
    height: 1844
  },
  wardrobe: {
    id: 'wardrobe',
    label: 'Animals',
    image: '/images/runtime/backgrounds/floating-island.png',
    width: 853,
    height: 1844
  },
  gacha: {
    id: 'gacha',
    label: 'Gift',
    image: '/images/runtime/backgrounds/floating-island.png',
    width: 853,
    height: 1844
  },
  storage: {
    id: 'storage',
    label: 'Store',
    image: '/images/runtime/backgrounds/floating-island.png',
    width: 853,
    height: 1844
  }
};

export const navOrder: ScreenId[] = ['home', 'placement', 'wardrobe', 'gacha', 'storage'];

export const backgroundThemes: BackgroundTheme[] = [
  {
    id: 'floating-island',
    label: 'Sky Pasture',
    src: '/images/runtime/backgrounds/floating-island.png',
    swatch: '#8fd6ff',
    mood: 'day',
    unlockSource: 'starter'
  },
  {
    id: 'morning-pasture',
    label: 'Morning Meadow',
    src: '/images/runtime/backgrounds/floating-island-morning-pasture.png',
    swatch: '#bfe86d',
    mood: 'morning',
    unlockSource: 'free_gift'
  },
  {
    id: 'starlight-night',
    label: 'Starlight Isle',
    src: '/images/runtime/backgrounds/floating-island-starlight-night.png',
    swatch: '#4851c8',
    mood: 'night',
    unlockSource: 'event'
  },
  {
    id: 'sunset-clover-isle',
    label: 'Sunset Clover',
    src: '/images/runtime/backgrounds/floating-island-sunset-clover-isle.png',
    swatch: '#f19a67',
    mood: 'sunset',
    unlockSource: 'free_gift'
  },
  {
    id: 'rainy-glass-garden',
    label: 'Rainy Garden',
    src: '/images/runtime/backgrounds/floating-island-rainy-glass-garden.png',
    swatch: '#8edce8',
    mood: 'rain',
    unlockSource: 'free_gift'
  },
  {
    id: 'flower-cloud-terrace',
    label: 'Flower Cloud',
    src: '/images/runtime/backgrounds/floating-island-flower-cloud-terrace.png',
    swatch: '#f4aacd',
    mood: 'day',
    unlockSource: 'free_gift'
  },
  {
    id: 'moonlit-hay-field',
    label: 'Moon Hay Field',
    src: '/images/runtime/backgrounds/floating-island-moonlit-hay-field.png',
    swatch: '#5868c9',
    mood: 'night',
    unlockSource: 'event'
  }
];

export const starterRewardIds = [
  'floating-island',
  'agouti',
  '04',
  'clover-patch',
  'hay-bed',
  'straw-hat',
  'cloud-puff',
  'sprout-buddy'
];

export const deguVariants: DeguVariant[] = [
  {
    id: 'agouti',
    label: 'Agouti',
    swatch: '#8a6139',
    filter: 'brightness(1)',
    src: '/images/runtime/characters/degu-variants/agouti.png',
    source: 'assets/source/imagegen/degu-variants/degu-variant-pack-001__source.png'
  },
  {
    id: 'blue-gray',
    label: 'Blue gray',
    swatch: '#7f8c96',
    filter: 'hue-rotate(185deg) saturate(0.58) brightness(0.93)',
    src: '/images/runtime/characters/degu-variants/blue-gray.png',
    source: 'assets/source/imagegen/degu-variants/degu-variant-pack-001__source.png'
  },
  {
    id: 'sandy',
    label: 'Sandy',
    swatch: '#c99b55',
    filter: 'sepia(0.22) saturate(1.18) brightness(1.08)',
    src: '/images/runtime/characters/degu-variants/sandy.png',
    source: 'assets/source/imagegen/degu-variants/degu-variant-pack-001__source.png'
  },
  {
    id: 'cream-patch',
    label: 'Cream patch',
    swatch: '#f0dbc0',
    filter: 'sepia(0.18) saturate(0.62) brightness(1.18)',
    src: '/images/runtime/characters/degu-variants/cream-patch.png',
    source: 'assets/source/imagegen/degu-variants/degu-variant-pack-001__source.png'
  }
];

export const pixelDeguShots: PixelDeguShot[] = [
  ...Array.from({ length: 10 }, (_, index) => {
    const number = String(index + 1).padStart(2, '0');

    return {
      id: number,
      label: `Shot ${number}`,
      src: `/images/runtime/characters/pixel-degu/v5/rounded-side-pixel-degu-${number}.png`,
      source: `assets/source/imagegen/pixel-degu-designs/v5-rounded-side-style/rounded-side-pixel-degu-shot-${number}.png`
    };
  }),
  {
    id: 'macaroni-mouse',
    label: 'Macaroni mouse',
    src: '/images/runtime/characters/animals/macaroni-mouse.png',
    source: 'assets/source/imagegen/animal-unlocks/animal-unlocks-pack-001__source.png'
  },
  {
    id: 'chinchilla',
    label: 'Chinchilla',
    src: '/images/runtime/characters/animals/chinchilla.png',
    source: 'assets/source/imagegen/animal-unlocks/animal-unlocks-pack-001__source.png'
  },
  {
    id: 'gerbil',
    label: 'Gerbil',
    src: '/images/runtime/characters/animals/gerbil.png',
    source: 'assets/source/imagegen/animal-unlocks/animal-unlocks-pack-001__source.png'
  },
  {
    id: 'hamster',
    label: 'Hamster',
    src: '/images/runtime/characters/animals/hamster.png',
    source: 'assets/source/imagegen/animal-unlocks/animal-unlocks-pack-001__source.png'
  },
  {
    id: 'rabbit',
    label: 'Rabbit',
    src: '/images/runtime/characters/animals/rabbit.png',
    source: 'assets/source/imagegen/animal-unlocks/animal-unlocks-pack-001__source.png'
  },
  ...expandedPixelDeguShots,
  ...expandedBulkPixelDeguShots,
  ...massPixelDeguShots,
  ...megaPixelDeguShots,
  ...ultraPixelDeguShots,
  ...hyperPixelDeguShots,
  ...primePixelDeguShots,
  ...apexPixelDeguShots,
  ...zenithPixelDeguShots,
  ...lumenPixelDeguShots,
  ...radiantPixelDeguShots,
  ...finalePixelDeguShots
];

export const wearableItems: FloatingItem[] = [
  { id: 'straw-hat', label: 'Straw hat', slot: 'head', kind: 'wearable', rarity: 'common', src: '/images/runtime/wardrobe/straw-hat.png' },
  { id: 'celestial-cape', label: 'Celestial cape', slot: 'back', kind: 'wearable', rarity: 'rare', src: '/images/runtime/wardrobe/celestial-cape.png' },
  { id: 'pastel-ribbon', label: 'Pastel ribbon', slot: 'neck', kind: 'wearable', rarity: 'common', src: '/images/runtime/wardrobe/pastel-ribbon.png' },
  { id: 'flower-crown', label: 'Flower crown', slot: 'head', kind: 'wearable', rarity: 'rare', src: '/images/runtime/wardrobe/flower-crown.png' },
  { id: 'round-glasses', label: 'Round glasses', slot: 'face', kind: 'wearable', rarity: 'special', src: '/images/runtime/wardrobe/round-glasses.png' },
  { id: 'angel-halo-wings', label: 'Halo wings', slot: 'top', kind: 'wearable', rarity: 'special', src: '/images/runtime/wardrobe/angel-halo-wings.png' },
  { id: 'acorn-beret', label: 'Acorn beret', slot: 'head', kind: 'wearable', rarity: 'common', src: '/images/runtime/wardrobe/acorn-beret.png' },
  { id: 'mint-scarf', label: 'Mint scarf', slot: 'neck', kind: 'wearable', rarity: 'common', src: '/images/runtime/wardrobe/mint-scarf.png' },
  { id: 'leaf-cape', label: 'Leaf cape', slot: 'back', kind: 'wearable', rarity: 'rare', src: '/images/runtime/wardrobe/leaf-cape.png' },
  { id: 'star-hairpin', label: 'Star hairpin', slot: 'head', kind: 'wearable', rarity: 'rare', src: '/images/runtime/wardrobe/star-hairpin.png' },
  { id: 'explorer-goggles', label: 'Explorer goggles', slot: 'face', kind: 'wearable', rarity: 'rare', src: '/images/runtime/wardrobe/explorer-goggles.png' },
  { id: 'cozy-poncho', label: 'Cozy poncho', slot: 'back', kind: 'wearable', rarity: 'special', src: '/images/runtime/wardrobe/cozy-poncho.png' },
  { id: 'sky-satchel', label: 'Sky satchel', slot: 'back', kind: 'wearable', rarity: 'common', src: '/images/runtime/wardrobe/sky-satchel.png' },
  { id: 'daisy-ear-clip', label: 'Daisy ear clip', slot: 'head', kind: 'wearable', rarity: 'common', src: '/images/runtime/wardrobe/daisy-ear-clip.png' },
  { id: 'cloud-cap', label: 'Cloud cap', slot: 'head', kind: 'wearable', rarity: 'rare', src: '/images/runtime/wardrobe/cloud-cap.png' },
  { id: 'clover-necklace', label: 'Clover necklace', slot: 'neck', kind: 'wearable', rarity: 'common', src: '/images/runtime/wardrobe/clover-necklace.png' },
  { id: 'picnic-blanket-cape', label: 'Picnic cape', slot: 'back', kind: 'wearable', rarity: 'rare', src: '/images/runtime/wardrobe/picnic-blanket-cape.png' },
  { id: 'tiny-cheek-sticker', label: 'Cheek sticker', slot: 'face', kind: 'wearable', rarity: 'common', src: '/images/runtime/wardrobe/tiny-cheek-sticker.png' },
  ...expandedWearableItems,
  ...expandedBulkWearableItems,
  ...massWearableItems,
  ...megaWearableItems,
  ...ultraWearableItems,
  ...hyperWearableItems,
  ...primeWearableItems,
  ...apexWearableItems,
  ...zenithWearableItems,
  ...lumenWearableItems,
  ...radiantWearableItems,
  ...finaleWearableItems
];

export const floatingItems: FloatingItem[] = [
  { id: 'cloud-puff', label: 'Cloud puff', slot: 'top', rarity: 'common', src: '/images/runtime/floating-items/cloud-puff.png' },
  { id: 'clover-charm', label: 'Clover charm', slot: 'left-high', rarity: 'common', src: '/images/runtime/floating-items/clover-charm.png' },
  { id: 'acorn-charm', label: 'Acorn charm', slot: 'right-low', rarity: 'common', src: '/images/runtime/floating-items/acorn-charm.png' },
  { id: 'seed-pouch-charm', label: 'Seed pouch charm', slot: 'left-low', rarity: 'common', src: '/images/runtime/floating-items/seed-pouch-charm.png' },
  { id: 'star-lantern-float', label: 'Star lantern', slot: 'top', rarity: 'rare', src: '/images/runtime/floating-items/star-lantern-float.png' },
  { id: 'moon-bell', label: 'Moon bell', slot: 'right-high', rarity: 'rare', src: '/images/runtime/floating-items/moon-bell.png' },
  { id: 'sky-ticket-charm', label: 'Sky ticket charm', slot: 'left-high', rarity: 'common', src: '/images/runtime/floating-items/sky-ticket-charm.png' },
  { id: 'mushroom-friend', label: 'Mushroom friend', slot: 'right-low', rarity: 'common', src: '/images/runtime/floating-items/mushroom-friend.png' },
  { id: 'sprout-buddy', label: 'Sprout buddy', slot: 'left-low', rarity: 'common', src: '/images/runtime/floating-items/sprout-buddy.png' },
  { id: 'sleepy-dust-buddy', label: 'Sleepy dust buddy', slot: 'right-low', rarity: 'special', src: '/images/runtime/floating-items/sleepy-dust-buddy.png' },
  { id: 'cotton-flower-puff', label: 'Cotton puff', slot: 'left-high', rarity: 'rare', src: '/images/runtime/floating-items/cotton-flower-puff.png' },
  { id: 'crystal-shard-float', label: 'Crystal shard', slot: 'right-high', rarity: 'rare', src: '/images/runtime/floating-items/crystal-shard-float.png' },
  { id: 'bellflower-sprite', label: 'Bellflower sprite', slot: 'left-low', rarity: 'special', src: '/images/runtime/floating-items/bellflower-sprite.png' },
  { id: 'feather-charm', label: 'Feather charm', slot: 'right-high', rarity: 'common', src: '/images/runtime/floating-items/feather-charm.png' },
  { id: 'bread-basket', label: 'Bread basket', slot: 'right-low', rarity: 'rare', src: '/images/runtime/floating-items/bread-basket.png' },
  { id: 'water-drop-buddy', label: 'Water drop buddy', slot: 'right-high', rarity: 'special', src: '/images/runtime/floating-items/water-drop-buddy.png' },
  { id: 'sky-moth', label: 'Sky moth', slot: 'left-high', rarity: 'rare', src: '/images/runtime/floating-items/sky-moth.png' },
  { id: 'cloud-sheep', label: 'Cloud sheep', slot: 'right-high', rarity: 'special', src: '/images/runtime/floating-items/cloud-sheep.png' },
  { id: 'walnut-charm', label: 'Walnut charm', slot: 'right-low', rarity: 'common', src: '/images/runtime/floating-items/walnut-charm.png' },
  { id: 'comet-seed', label: 'Comet seed', slot: 'top', rarity: 'rare', src: '/images/runtime/floating-items/comet-seed.png' },
  { id: 'spiral-shell', label: 'Spiral shell', slot: 'left-low', rarity: 'common', src: '/images/runtime/floating-items/spiral-shell.png' },
  { id: 'sleepy-seed-spirit', label: 'Sleepy seed', slot: 'left-low', rarity: 'rare', src: '/images/runtime/floating-items/sleepy-seed-spirit.png' },
  { id: 'paper-crane', label: 'Paper crane', slot: 'top', rarity: 'rare', src: '/images/runtime/floating-items/paper-crane.png' },
  { id: 'honey-jar', label: 'Honey jar', slot: 'right-low', rarity: 'rare', src: '/images/runtime/floating-items/honey-jar.png' },
  { id: 'sun-bell', label: 'Sun bell', slot: 'top', rarity: 'special', src: '/images/runtime/floating-items/sun-bell.png' },
  { id: 'blue-firefly', label: 'Blue firefly', slot: 'right-high', rarity: 'rare', src: '/images/runtime/floating-items/blue-firefly.png' },
  { id: 'carrot-bit', label: 'Carrot bit', slot: 'left-high', rarity: 'common', src: '/images/runtime/floating-items/carrot-bit.png' },
  { id: 'teacup-cloud', label: 'Teacup cloud', slot: 'right-high', rarity: 'special', src: '/images/runtime/floating-items/teacup-cloud.png' },
  { id: 'cloud-starfish', label: 'Cloud starfish', slot: 'top', rarity: 'rare', src: '/images/runtime/floating-items/cloud-starfish.png' },
  { id: 'pebble-friend', label: 'Pebble friend', slot: 'right-low', rarity: 'common', src: '/images/runtime/floating-items/pebble-friend.png' },
  { id: 'leaf-boat', label: 'Leaf boat', slot: 'left-low', rarity: 'rare', src: '/images/runtime/floating-items/leaf-boat.png' },
  { id: 'lavender-puff', label: 'Lavender puff', slot: 'left-high', rarity: 'special', src: '/images/runtime/floating-items/lavender-puff.png' },
  ...expandedFloatingItems,
  ...expandedBulkFloatingItems,
  ...massFloatingItems,
  ...megaFloatingItems,
  ...ultraFloatingItems,
  ...hyperFloatingItems,
  ...primeFloatingItems,
  ...apexFloatingItems,
  ...zenithFloatingItems,
  ...lumenFloatingItems,
  ...radiantFloatingItems,
  ...finaleFloatingItems
];

export const accessoryItems: FloatingItem[] = [...wearableItems, ...floatingItems];

export const outfits = accessoryItems;

export const decorItems: DecorItem[] = [
  {
    id: 'hay-bed',
    label: 'Hay bed',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/hay-bed.png',
    scene: { x: 17, y: 55, w: 22 },
    bonusPerSecond: 2
  },
  {
    id: 'angel-fountain',
    label: 'Angel fountain',
    footprint: { w: 2, h: 2 },
    src: '/images/runtime/decor/angel-fountain.png',
    scene: { x: 63, y: 40, w: 23 },
    bonusPerSecond: 8
  },
  {
    id: 'water-bowl',
    label: 'Water bowl',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/water-bowl.png',
    scene: { x: 13, y: 63, w: 15 },
    bonusPerSecond: 3
  },
  {
    id: 'clover-patch',
    label: 'Clover patch',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/clover-patch.png',
    scene: { x: 50, y: 55, w: 18 },
    bonusPerSecond: 4
  },
  {
    id: 'windmill',
    label: 'Windmill',
    footprint: { w: 2, h: 2 },
    src: '/images/runtime/decor/windmill.png',
    scene: { x: 73, y: 61, w: 23 },
    bonusPerSecond: 10
  },
  {
    id: 'cloud-lamp',
    label: 'Cloud lamp',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/cloud-lamp.png',
    scene: { x: 41, y: 37, w: 16 },
    bonusPerSecond: 5
  },
  {
    id: 'timothy-hay-rack',
    label: 'Hay rack',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/timothy-hay-rack.png',
    scene: { x: 68, y: 54, w: 22 },
    bonusPerSecond: 7
  },
  {
    id: 'sand-bath-bowl',
    label: 'Sand bath',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/sand-bath-bowl.png',
    scene: { x: 32, y: 62, w: 16 },
    bonusPerSecond: 6
  },
  {
    id: 'wood-tunnel',
    label: 'Wood tunnel',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/wood-tunnel.png',
    scene: { x: 58, y: 64, w: 24 },
    bonusPerSecond: 9
  },
  {
    id: 'ceramic-hideout',
    label: 'Hideout',
    footprint: { w: 2, h: 2 },
    src: '/images/runtime/decor/ceramic-hideout.png',
    scene: { x: 21, y: 45, w: 24 },
    bonusPerSecond: 12
  },
  {
    id: 'seed-sprout-pot',
    label: 'Sprout pot',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/seed-sprout-pot.png',
    scene: { x: 78, y: 48, w: 15 },
    bonusPerSecond: 8
  },
  {
    id: 'cloud-bridge',
    label: 'Cloud bridge',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/cloud-bridge.png',
    scene: { x: 35, y: 41, w: 26 },
    bonusPerSecond: 11
  },
  {
    id: 'sky-mailbox',
    label: 'Sky mailbox',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/sky-mailbox.png',
    scene: { x: 83, y: 64, w: 13 },
    bonusPerSecond: 7
  },
  {
    id: 'bellflower-planter',
    label: 'Bellflower bed',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/bellflower-planter.png',
    scene: { x: 10, y: 50, w: 22 },
    bonusPerSecond: 10
  },
  {
    id: 'short-wooden-fence',
    label: 'Wood fence',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/short-wooden-fence.png',
    scene: { x: 24, y: 58, w: 24 },
    bonusPerSecond: 7
  },
  {
    id: 'flower-patch',
    label: 'Flower patch',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/flower-patch.png',
    scene: { x: 48, y: 61, w: 21 },
    bonusPerSecond: 6
  },
  {
    id: 'snack-tray',
    label: 'Snack tray',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/snack-tray.png',
    scene: { x: 43, y: 62, w: 16 },
    bonusPerSecond: 5
  },
  {
    id: 'star-lantern',
    label: 'Star lantern',
    footprint: { w: 1, h: 2 },
    src: '/images/runtime/decor/star-lantern.png',
    scene: { x: 72, y: 46, w: 17 },
    bonusPerSecond: 8
  },
  {
    id: 'mossy-log-hideout',
    label: 'Mossy log',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/mossy-log-hideout.png',
    scene: { x: 17, y: 57, w: 20 },
    bonusPerSecond: 10
  },
  {
    id: 'seed-crate',
    label: 'Seed crate',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/seed-crate.png',
    scene: { x: 30, y: 61, w: 15 },
    bonusPerSecond: 6
  },
  {
    id: 'grass-tuft-cluster',
    label: 'Grass tuft',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/grass-tuft-cluster.png',
    scene: { x: 52, y: 58, w: 14 },
    bonusPerSecond: 5
  },
  {
    id: 'pebble-stepping-stones',
    label: 'Pebble stones',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/pebble-stepping-stones.png',
    scene: { x: 43, y: 64, w: 18 },
    bonusPerSecond: 4
  },
  {
    id: 'flower-arch',
    label: 'Flower arch',
    footprint: { w: 2, h: 2 },
    src: '/images/runtime/decor/flower-arch.png',
    scene: { x: 70, y: 50, w: 18 },
    bonusPerSecond: 12
  },
  {
    id: 'carrot-basket',
    label: 'Carrot basket',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/carrot-basket.png',
    scene: { x: 62, y: 63, w: 15 },
    bonusPerSecond: 7
  },
  {
    id: 'cloud-cushion-bench',
    label: 'Cloud bench',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/cloud-cushion-bench.png',
    scene: { x: 55, y: 56, w: 19 },
    bonusPerSecond: 9
  },
  {
    id: 'tiny-burrow-mound',
    label: 'Tiny burrow',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/tiny-burrow-mound.png',
    scene: { x: 77, y: 61, w: 15 },
    bonusPerSecond: 8
  },
  {
    id: 'moss-arch',
    label: 'Moss arch',
    footprint: { w: 2, h: 2 },
    src: '/images/runtime/decor/batch-005/moss-arch.png',
    scene: { x: 17, y: 48, w: 22 },
    bonusPerSecond: 12,
    rarity: 'rare',
    unlockSource: 'free_gift'
  },
  {
    id: 'cloud-fountain',
    label: 'Cloud fountain',
    footprint: { w: 2, h: 2 },
    src: '/images/runtime/decor/batch-005/cloud-fountain.png',
    scene: { x: 58, y: 42, w: 23 },
    bonusPerSecond: 14,
    rarity: 'rare',
    unlockSource: 'free_gift'
  },
  {
    id: 'clover-rug',
    label: 'Clover rug',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/batch-005/clover-rug.png',
    scene: { x: 39, y: 65, w: 23 },
    bonusPerSecond: 7,
    rarity: 'common',
    unlockSource: 'free_gift'
  },
  {
    id: 'tiny-seed-shop-sign',
    label: 'Seed shop sign',
    footprint: { w: 1, h: 2 },
    src: '/images/runtime/decor/batch-005/tiny-seed-shop-sign.png',
    scene: { x: 80, y: 51, w: 17 },
    bonusPerSecond: 10,
    rarity: 'rare',
    unlockSource: 'free_gift'
  },
  {
    id: 'moon-birdbath',
    label: 'Moon birdbath',
    footprint: { w: 2, h: 2 },
    src: '/images/runtime/decor/batch-005/moon-birdbath.png',
    scene: { x: 27, y: 45, w: 21 },
    bonusPerSecond: 15,
    rarity: 'special',
    unlockSource: 'free_gift'
  },
  {
    id: 'star-wind-chime-stand',
    label: 'Star chime',
    footprint: { w: 1, h: 2 },
    src: '/images/runtime/decor/batch-005/star-wind-chime-stand.png',
    scene: { x: 72, y: 46, w: 16 },
    bonusPerSecond: 11,
    rarity: 'rare',
    unlockSource: 'free_gift'
  },
  {
    id: 'hay-hammock',
    label: 'Hay hammock',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/batch-005/hay-hammock.png',
    scene: { x: 56, y: 59, w: 22 },
    bonusPerSecond: 9,
    rarity: 'common',
    unlockSource: 'free_gift'
  },
  {
    id: 'mushroom-stool',
    label: 'Mushroom stool',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/batch-005/mushroom-stool.png',
    scene: { x: 32, y: 62, w: 16 },
    bonusPerSecond: 6,
    rarity: 'common',
    unlockSource: 'free_gift'
  },
  {
    id: 'crystal-planter',
    label: 'Crystal planter',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/batch-005/crystal-planter.png',
    scene: { x: 12, y: 56, w: 21 },
    bonusPerSecond: 13,
    rarity: 'rare',
    unlockSource: 'free_gift'
  },
  {
    id: 'rain-jar',
    label: 'Rain jar',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/batch-005/rain-jar.png',
    scene: { x: 47, y: 58, w: 15 },
    bonusPerSecond: 8,
    rarity: 'common',
    unlockSource: 'free_gift'
  },
  {
    id: 'picnic-basket',
    label: 'Picnic basket',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/batch-005/picnic-basket.png',
    scene: { x: 64, y: 63, w: 17 },
    bonusPerSecond: 7,
    rarity: 'common',
    unlockSource: 'free_gift'
  },
  {
    id: 'carrot-mailbox',
    label: 'Carrot mailbox',
    footprint: { w: 1, h: 1 },
    src: '/images/runtime/decor/batch-005/carrot-mailbox.png',
    scene: { x: 84, y: 61, w: 14 },
    bonusPerSecond: 8,
    rarity: 'common',
    unlockSource: 'free_gift'
  },
  {
    id: 'flower-pergola',
    label: 'Flower pergola',
    footprint: { w: 2, h: 2 },
    src: '/images/runtime/decor/batch-005/flower-pergola.png',
    scene: { x: 20, y: 51, w: 24 },
    bonusPerSecond: 15,
    rarity: 'special',
    unlockSource: 'free_gift'
  },
  {
    id: 'wooden-toy-wheel',
    label: 'Toy wheel',
    footprint: { w: 2, h: 2 },
    src: '/images/runtime/decor/batch-005/wooden-toy-wheel.png',
    scene: { x: 68, y: 55, w: 22 },
    bonusPerSecond: 13,
    rarity: 'rare',
    unlockSource: 'free_gift'
  },
  {
    id: 'pebble-path-curve',
    label: 'Pebble curve',
    footprint: { w: 2, h: 1 },
    src: '/images/runtime/decor/batch-005/pebble-path-curve.png',
    scene: { x: 42, y: 66, w: 22 },
    bonusPerSecond: 6,
    rarity: 'common',
    unlockSource: 'free_gift'
  },
  {
    id: 'floating-lantern-stand',
    label: 'Lantern stand',
    footprint: { w: 1, h: 2 },
    src: '/images/runtime/decor/batch-005/floating-lantern-stand.png',
    scene: { x: 76, y: 49, w: 16 },
    bonusPerSecond: 12,
    rarity: 'rare',
    unlockSource: 'free_gift'
  },
  ...expandedDecorItems,
  ...expandedBulkDecorItems,
  ...massDecorItems,
  ...megaDecorItems,
  ...ultraDecorItems,
  ...hyperDecorItems,
  ...primeDecorItems,
  ...apexDecorItems,
  ...zenithDecorItems,
  ...lumenDecorItems,
  ...radiantDecorItems,
  ...finaleDecorItems
];

export const runtimeAssets = {
  coin: '/images/runtime/ui/coin.png',
  ticket: '/images/runtime/ui/sky-ticket.png',
  shard: '/images/runtime/ui/dream-shard.png',
  xpStar: '/images/runtime/ui/xp-star.png',
  careBrush: '/images/runtime/ui/care-brush.png',
  seedPouch: '/images/runtime/ui/seed-pouch.png',
  deguCandidate: '/images/runtime/ui/degu-candidate-a.png',
  pixelDeguReview: '/images/runtime/characters/pixel-degu/v5/rounded-side-pixel-degu-cutouts-review.png',
  skyGiftMachine: '/images/runtime/machines/sky-gift-machine.png'
};

export const catalogKindOrder: CatalogKind[] = [
  'background',
  'degu_variant',
  'pose',
  'animal',
  'decor',
  'accessory'
];

export type CatalogGroupLabels = Record<string, string>;

const catalogKindLabelKey: Record<CatalogKind, keyof CatalogGroupLabels> = {
  background: 'themes',
  degu_variant: 'colors',
  pose: 'poses',
  animal: 'animals',
  decor: 'decor',
  accessory: 'items'
};

function defaultUnlockSource(id: string, fallback: UnlockSource = 'free_gift'): UnlockSource {
  return starterRewardIds.includes(id) ? 'starter' : fallback;
}

function backgroundRarity(theme: BackgroundTheme): CatalogRarity {
  if (theme.unlockSource === 'starter') return 'common';
  return theme.unlockSource === 'event' ? 'special' : 'rare';
}

function decorRarity(item: DecorItem): CatalogRarity {
  if (item.rarity) return item.rarity;
  if (starterRewardIds.includes(item.id)) return 'common';
  if (item.id === 'angel-fountain') return 'special';
  return item.bonusPerSecond >= 10 ? 'rare' : 'common';
}

function deguVariantRarity(variant: DeguVariant): CatalogRarity {
  if (variant.rarity) return variant.rarity;
  return starterRewardIds.includes(variant.id) ? 'common' : 'rare';
}

function pixelShotKind(shot: PixelDeguShot): CatalogKind {
  return /^\d+$/.test(shot.id) || shot.id.startsWith('pose-') ? 'pose' : 'animal';
}

function pixelShotRarity(shot: PixelDeguShot): CatalogRarity {
  if (shot.rarity) return shot.rarity;
  if (starterRewardIds.includes(shot.id) || ['macaroni-mouse', 'gerbil', 'hamster'].includes(shot.id)) return 'common';
  return 'rare';
}

export const catalogItems: CatalogItem[] = [
  ...backgroundThemes.map((theme) => ({
    id: theme.id,
    label: theme.label,
    kind: 'background' as const,
    rarity: backgroundRarity(theme),
    unlockSource: theme.unlockSource,
    src: theme.src,
    swatch: theme.swatch
  })),
  ...deguVariants.map((variant) => ({
    id: variant.id,
    label: variant.label,
    kind: 'degu_variant' as const,
    rarity: deguVariantRarity(variant),
    unlockSource: variant.unlockSource ?? defaultUnlockSource(variant.id),
    src: variant.src ?? pixelDeguShots[3]?.src ?? runtimeAssets.pixelDeguReview,
    source: variant.source,
    swatch: variant.swatch
  })),
  ...pixelDeguShots.map((shot) => ({
    id: shot.id,
    label: shot.label,
    kind: pixelShotKind(shot),
    rarity: pixelShotRarity(shot),
    unlockSource: shot.unlockSource ?? defaultUnlockSource(shot.id),
    src: shot.src,
    source: shot.source
  })),
  ...decorItems.map((item) => ({
    id: item.id,
    label: item.label,
    kind: 'decor' as const,
    rarity: decorRarity(item),
    unlockSource: item.unlockSource ?? defaultUnlockSource(item.id),
    src: item.src,
    bonusPerSecond: item.bonusPerSecond
  })),
  ...accessoryItems.map((item) => ({
    id: item.id,
    label: item.label,
    kind: 'accessory' as const,
    rarity: item.rarity,
    unlockSource: defaultUnlockSource(item.id),
    src: item.src,
    slot: item.slot
  }))
];

const catalogItemById = new Map(catalogItems.map((item) => [item.id, item]));

export function getCatalogItem(id: string): CatalogItem | undefined {
  return catalogItemById.get(id);
}

export function buildCatalogCollectionGroups(
  ownedRewardIds: string[],
  labels: CatalogGroupLabels
): CollectionGroup[] {
  return catalogKindOrder.map((kind) => {
    const items = catalogItems.filter((item) => item.kind === kind);
    const owned = items.filter((item) => isRewardOwned(ownedRewardIds, item.id)).length;
    const nextLocked = items.find((item) => !isRewardOwned(ownedRewardIds, item.id));

    return {
      id: kind,
      label: labels[catalogKindLabelKey[kind]],
      owned,
      total: items.length,
      nextLabel: nextLocked?.id ?? 'Complete'
    };
  });
}

export function isRewardOwned(ownedRewardIds: string[], rewardId: string): boolean {
  return starterRewardIds.includes(rewardId) || ownedRewardIds.includes(rewardId);
}
