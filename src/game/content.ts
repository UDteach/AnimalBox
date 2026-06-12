export type ScreenId = 'home' | 'placement' | 'wardrobe' | 'gacha' | 'storage';

export type OutfitSlot = 'head' | 'neck' | 'back' | 'face';

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
  unlockSource: 'starter' | 'free_gift' | 'event';
}

export interface DeguVariant {
  id: string;
  label: string;
  swatch: string;
  filter: string;
}

export interface PixelDeguShot {
  id: string;
  label: string;
  src: string;
  source: string;
}

export interface OutfitItem {
  id: string;
  label: string;
  slot: OutfitSlot;
  rarity: 'common' | 'rare' | 'special';
  src: string;
}

export interface DecorItem {
  id: string;
  label: string;
  footprint: { w: number; h: number };
  src: string;
  scene: { x: number; y: number; w: number };
  bonusPerSecond: number;
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
    label: 'Wardrobe',
    image: '/images/runtime/backgrounds/floating-island.png',
    width: 853,
    height: 1844
  },
  gacha: {
    id: 'gacha',
    label: 'Sky Gift',
    image: '/images/runtime/backgrounds/floating-island.png',
    width: 853,
    height: 1844
  },
  storage: {
    id: 'storage',
    label: 'Storage',
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
  'straw-hat'
];

export const deguVariants: DeguVariant[] = [
  { id: 'agouti', label: 'Agouti', swatch: '#8a6139', filter: 'brightness(1)' },
  {
    id: 'blue-gray',
    label: 'Blue gray',
    swatch: '#7f8c96',
    filter: 'hue-rotate(185deg) saturate(0.58) brightness(0.93)'
  },
  {
    id: 'sandy',
    label: 'Sandy',
    swatch: '#c99b55',
    filter: 'sepia(0.22) saturate(1.18) brightness(1.08)'
  },
  {
    id: 'cream-patch',
    label: 'Cream patch',
    swatch: '#f0dbc0',
    filter: 'sepia(0.18) saturate(0.62) brightness(1.18)'
  }
];

export const pixelDeguShots: PixelDeguShot[] = Array.from({ length: 10 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');

  return {
    id: number,
    label: `Shot ${number}`,
    src: `/images/runtime/characters/pixel-degu/v5/rounded-side-pixel-degu-${number}.png`,
    source: `assets/source/imagegen/pixel-degu-designs/v5-rounded-side-style/rounded-side-pixel-degu-shot-${number}.png`
  };
});

export const outfits: OutfitItem[] = [
  { id: 'straw-hat', label: 'Straw hat', slot: 'head', rarity: 'common', src: '/images/runtime/wardrobe/straw-hat.png' },
  { id: 'celestial-cape', label: 'Celestial cape', slot: 'back', rarity: 'rare', src: '/images/runtime/wardrobe/celestial-cape.png' },
  { id: 'pastel-ribbon', label: 'Pastel ribbon', slot: 'neck', rarity: 'common', src: '/images/runtime/wardrobe/pastel-ribbon.png' },
  { id: 'flower-crown', label: 'Flower crown', slot: 'head', rarity: 'rare', src: '/images/runtime/wardrobe/flower-crown.png' },
  { id: 'round-glasses', label: 'Round glasses', slot: 'face', rarity: 'special', src: '/images/runtime/wardrobe/round-glasses.png' },
  { id: 'angel-halo-wings', label: 'Halo wings', slot: 'head', rarity: 'special', src: '/images/runtime/wardrobe/angel-halo-wings.png' },
  { id: 'acorn-beret', label: 'Acorn beret', slot: 'head', rarity: 'common', src: '/images/runtime/wardrobe/acorn-beret.png' },
  { id: 'mint-scarf', label: 'Mint scarf', slot: 'neck', rarity: 'common', src: '/images/runtime/wardrobe/mint-scarf.png' },
  { id: 'leaf-cape', label: 'Leaf cape', slot: 'back', rarity: 'rare', src: '/images/runtime/wardrobe/leaf-cape.png' },
  { id: 'star-hairpin', label: 'Star hairpin', slot: 'head', rarity: 'rare', src: '/images/runtime/wardrobe/star-hairpin.png' },
  { id: 'explorer-goggles', label: 'Explorer goggles', slot: 'face', rarity: 'rare', src: '/images/runtime/wardrobe/explorer-goggles.png' },
  { id: 'cozy-poncho', label: 'Cozy poncho', slot: 'back', rarity: 'special', src: '/images/runtime/wardrobe/cozy-poncho.png' },
  { id: 'sky-satchel', label: 'Sky satchel', slot: 'back', rarity: 'common', src: '/images/runtime/wardrobe/sky-satchel.png' },
  { id: 'daisy-ear-clip', label: 'Daisy ear clip', slot: 'head', rarity: 'common', src: '/images/runtime/wardrobe/daisy-ear-clip.png' },
  { id: 'cloud-cap', label: 'Cloud cap', slot: 'head', rarity: 'rare', src: '/images/runtime/wardrobe/cloud-cap.png' },
  { id: 'clover-necklace', label: 'Clover necklace', slot: 'neck', rarity: 'common', src: '/images/runtime/wardrobe/clover-necklace.png' },
  { id: 'picnic-blanket-cape', label: 'Picnic cape', slot: 'back', rarity: 'rare', src: '/images/runtime/wardrobe/picnic-blanket-cape.png' },
  { id: 'tiny-cheek-sticker', label: 'Cheek sticker', slot: 'face', rarity: 'common', src: '/images/runtime/wardrobe/tiny-cheek-sticker.png' }
];

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
  }
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

export function isRewardOwned(ownedRewardIds: string[], rewardId: string): boolean {
  return starterRewardIds.includes(rewardId) || ownedRewardIds.includes(rewardId);
}
