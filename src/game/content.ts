export type ScreenId = 'home' | 'placement' | 'wardrobe' | 'gacha' | 'storage';

export type OutfitSlot = 'head' | 'neck' | 'back' | 'face';

export interface MockupScreen {
  id: ScreenId;
  label: string;
  image: string;
  width: number;
  height: number;
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
}

export interface DecorItem {
  id: string;
  label: string;
  footprint: { w: number; h: number };
}

export const screens: Record<ScreenId, MockupScreen> = {
  home: {
    id: 'home',
    label: 'Island',
    image: '/images/mockups/home-island-tap-coins.png',
    width: 853,
    height: 1844
  },
  placement: {
    id: 'placement',
    label: 'Decor',
    image: '/images/mockups/placement-mode.png',
    width: 853,
    height: 1844
  },
  wardrobe: {
    id: 'wardrobe',
    label: 'Wardrobe',
    image: '/images/mockups/wardrobe-dressup.png',
    width: 864,
    height: 1821
  },
  gacha: {
    id: 'gacha',
    label: 'Sky Gift',
    image: '/images/mockups/free-gacha.png',
    width: 864,
    height: 1821
  },
  storage: {
    id: 'storage',
    label: 'Storage',
    image: '/images/mockups/home-island-tap-coins.png',
    width: 853,
    height: 1844
  }
};

export const navOrder: ScreenId[] = ['home', 'placement', 'wardrobe', 'gacha', 'storage'];

export const deguVariants: DeguVariant[] = [
  { id: 'agouti', label: 'Agouti', swatch: '#8a6139' },
  { id: 'blue-gray', label: 'Blue gray', swatch: '#7f8c96' },
  { id: 'sandy', label: 'Sandy', swatch: '#c99b55' },
  { id: 'cream-patch', label: 'Cream patch', swatch: '#f0dbc0' }
];

export const outfits: OutfitItem[] = [
  { id: 'straw-hat', label: 'Straw hat', slot: 'head', rarity: 'common' },
  { id: 'celestial-cape', label: 'Celestial cape', slot: 'back', rarity: 'rare' },
  { id: 'pastel-ribbon', label: 'Pastel ribbon', slot: 'neck', rarity: 'common' },
  { id: 'flower-crown', label: 'Flower crown', slot: 'head', rarity: 'rare' },
  { id: 'round-glasses', label: 'Round glasses', slot: 'face', rarity: 'special' }
];

export const decorItems: DecorItem[] = [
  { id: 'hay-bed', label: 'Hay bed', footprint: { w: 2, h: 1 } },
  { id: 'angel-fountain', label: 'Angel fountain', footprint: { w: 2, h: 2 } },
  { id: 'wooden-fence', label: 'Wooden fence', footprint: { w: 2, h: 1 } },
  { id: 'clover-patch', label: 'Clover patch', footprint: { w: 1, h: 1 } },
  { id: 'windmill', label: 'Windmill', footprint: { w: 2, h: 2 } },
  { id: 'cloud-lamp', label: 'Cloud lamp', footprint: { w: 1, h: 1 } }
];
