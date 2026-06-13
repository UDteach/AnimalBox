import type { ScreenId } from './content';
import type { GardenMapDefinition } from './maps';

export type Locale = 'ja' | 'en';

export const localeStorageKey = 'animalbox.locale.v1';

export function detectInitialLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(localeStorageKey);
    if (stored === 'ja' || stored === 'en') return stored;
  } catch {
    // Fall through to the prototype default.
  }

  return 'ja';
}

export function toggleLocale(locale: Locale): Locale {
  return locale === 'ja' ? 'en' : 'ja';
}

export function persistLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(localeStorageKey, locale);
  } catch {
    // Local storage can be unavailable in embedded or private contexts.
  }
}

export function text(locale: Locale, english: string, japanese: string): string {
  return locale === 'ja' ? japanese : english;
}

export function screenLabel(locale: Locale, screenId: ScreenId): string {
  return (
    {
      ja: {
        home: '島',
        placement: '配置',
        wardrobe: 'どうぶつ',
        gacha: 'ギフト',
        storage: '倉庫'
      },
      en: {
        home: 'Island',
        placement: 'Decor',
        wardrobe: 'Animals',
        gacha: 'Gift',
        storage: 'Store'
      }
    } satisfies Record<Locale, Record<ScreenId, string>>
  )[locale][screenId];
}

export function mapLabel(locale: Locale, map: GardenMapDefinition): string {
  return locale === 'ja' ? map.labelJa : map.label;
}

export function mapDetail(locale: Locale, map: GardenMapDefinition): string {
  return locale === 'ja' ? map.detailJa : map.detail;
}

export function localizedName(locale: Locale, id: string, fallback: string): string {
  if (locale !== 'ja') return fallback;
  return japaneseNames[id] ?? fallback;
}

export const collectionLabels: Record<Locale, Record<string, string>> = {
  ja: {
    themes: '背景',
    colors: '毛色',
    poses: 'ポーズ',
    animals: 'どうぶつ',
    decor: '家具',
    items: 'おとも'
  },
  en: {
    themes: 'Themes',
    colors: 'Colors',
    poses: 'Poses',
    animals: 'Animals',
    decor: 'Decor',
    items: 'Items'
  }
};

const japaneseNames: Record<string, string> = {
  'floating-island': '空の牧草島',
  'morning-pasture': '朝の草原',
  'starlight-night': '星夜の島',
  'sunset-clover-isle': '夕焼けクローバー',
  'rainy-glass-garden': '雨のガラス庭',
  'flower-cloud-terrace': '花雲テラス',
  'moonlit-hay-field': '月明かりの干し草原',
  agouti: 'アグーチ',
  'blue-gray': 'ブルーグレー',
  sandy: 'サンディ',
  'cream-patch': 'クリームぶち',
  'hay-bed': '干し草ベッド',
  'angel-fountain': '天使の噴水',
  'water-bowl': '水入れ',
  'clover-patch': 'クローバー',
  windmill: '風車',
  'cloud-lamp': '雲ランプ',
  'timothy-hay-rack': 'チモシーラック',
  'sand-bath-bowl': '砂浴びボウル',
  'wood-tunnel': '木のトンネル',
  'ceramic-hideout': '陶器の隠れ家',
  'seed-sprout-pot': '芽のポット',
  'cloud-bridge': '雲の橋',
  'sky-mailbox': '空のポスト',
  'bellflower-planter': 'ベルフラワー花壇',
  'short-wooden-fence': '木の柵',
  'flower-patch': '花畑',
  'snack-tray': 'おやつ皿',
  'star-lantern': '星ランタン',
  'mossy-log-hideout': 'こけ丸太',
  'seed-crate': '種の箱',
  'grass-tuft-cluster': '草むら',
  'pebble-stepping-stones': '小石の道',
  'flower-arch': '花のアーチ',
  'carrot-basket': 'にんじんかご',
  'cloud-cushion-bench': '雲ベンチ',
  'tiny-burrow-mound': '小さな巣穴',
  'straw-hat': '麦わら帽子',
  'cloud-puff': '雲ぷか',
  'clover-charm': 'クローバー飾り',
  'acorn-charm': 'どんぐり飾り',
  'seed-pouch-charm': '種袋チャーム',
  'sprout-buddy': '芽のおとも',
  'star-lantern-float': '星ランタン',
  'moon-bell': '月ベル',
  'sky-ticket-charm': '空チケット',
  'mushroom-friend': 'きのこフレンド',
  'cotton-flower-puff': '綿花ぷか',
  'crystal-shard-float': '結晶かけら',
  'bellflower-sprite': 'ベルフラワー妖精',
  'water-drop-buddy': '水滴のおとも',
  'sky-moth': '空の蛾',
  'cloud-sheep': '雲ひつじ',
  'walnut-charm': 'くるみ飾り',
  'comet-seed': '流れ星の種',
  'paper-crane': '紙つる',
  'sun-bell': '太陽ベル',
  'teacup-cloud': 'ティーカップ雲',
  'lavender-puff': 'ラベンダーぷか',
  'macaroni-mouse': 'マカロニマウス',
  chinchilla: 'チンチラ',
  gerbil: 'ジャービル',
  hamster: 'ハムスター',
  rabbit: 'うさぎ'
};
