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
  mood: 'day' | 'morning' | 'night';
  unlockSource: 'starter' | 'free_gift' | 'event';
}

export interface DeguVariant {
  id: string;
  label: string;
  swatch: string;
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
  }
];

export const deguVariants: DeguVariant[] = [
  { id: 'agouti', label: 'Agouti', swatch: '#8a6139' },
  { id: 'blue-gray', label: 'Blue gray', swatch: '#7f8c96' },
  { id: 'sandy', label: 'Sandy', swatch: '#c99b55' },
  { id: 'cream-patch', label: 'Cream patch', swatch: '#f0dbc0' }
];

export const outfits: OutfitItem[] = [
  { id: 'straw-hat', label: 'Straw hat', slot: 'head', rarity: 'common', src: '/images/runtime/wardrobe/straw-hat.png' },
  { id: 'celestial-cape', label: 'Celestial cape', slot: 'back', rarity: 'rare', src: '/images/runtime/wardrobe/celestial-cape.png' },
  { id: 'pastel-ribbon', label: 'Pastel ribbon', slot: 'neck', rarity: 'common', src: '/images/runtime/wardrobe/pastel-ribbon.png' },
  { id: 'flower-crown', label: 'Flower crown', slot: 'head', rarity: 'rare', src: '/images/runtime/wardrobe/flower-crown.png' },
  { id: 'round-glasses', label: 'Round glasses', slot: 'face', rarity: 'special', src: '/images/runtime/wardrobe/round-glasses.png' },
  { id: 'angel-halo-wings', label: 'Halo wings', slot: 'head', rarity: 'special', src: '/images/runtime/wardrobe/angel-halo-wings.png' }
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
  }
];

export const runtimeAssets = {
  coin: '/images/runtime/ui/coin.png',
  ticket: '/images/runtime/ui/sky-ticket.png',
  deguCandidate: '/images/runtime/ui/degu-candidate-a.png',
  skyGiftMachine: '/images/runtime/machines/sky-gift-machine.png'
};
