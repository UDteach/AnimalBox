import {
  backgroundThemes,
  decorItems,
  deguVariants,
  navOrder,
  outfits,
  pixelDeguShots,
  starterRewardIds
} from './content';
import { initialEconomy, type EconomyState } from './economy';
import { canPlaceDecor, type PlacedDecor } from './placement';
import { defaultProgression, sanitizeProgression, type ProgressionState } from './progression';

const STORAGE_KEY = 'animalbox.prototype.v1';
const grid = { width: 6, height: 6 };
const rewardIds = [
  ...backgroundThemes.map((item) => item.id),
  ...decorItems.map((item) => item.id),
  ...outfits.map((item) => item.id),
  ...deguVariants.map((item) => item.id),
  ...pixelDeguShots.map((item) => item.id),
  ...starterRewardIds
];

export interface PrototypeSave {
  economy: EconomyState;
  screen: string;
  selectedBackgroundId: string;
  selectedVariantId: string;
  selectedDeguShotId: string;
  selectedOutfitIds: string[];
  placedDecor: PlacedDecor[];
  ownedRewardIds: string[];
  gachaHistory: string[];
  pullsSinceRare: number;
  progression: ProgressionState;
}

export const defaultSave: PrototypeSave = {
  economy: initialEconomy,
  screen: 'home',
  selectedBackgroundId: 'floating-island',
  selectedVariantId: 'agouti',
  selectedDeguShotId: '04',
  selectedOutfitIds: ['straw-hat'],
  placedDecor: [
    {
      instanceId: 'starter-clover-1',
      itemId: 'clover-patch',
      cellX: 2,
      cellY: 3,
      footprint: { w: 1, h: 1 }
    }
  ],
  ownedRewardIds: starterRewardIds,
  gachaHistory: [],
  pullsSinceRare: 0,
  progression: defaultProgression
};

export function loadSave(storage: Pick<Storage, 'getItem'> = localStorage): PrototypeSave {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return defaultSave;

  try {
    const parsed = JSON.parse(raw) as Partial<PrototypeSave>;
    const merged = { ...defaultSave, ...parsed };

    return {
      ...merged,
      economy: sanitizeEconomy(parsed.economy),
      screen: sanitizeId(parsed.screen, navOrder, defaultSave.screen),
      selectedBackgroundId: sanitizeId(
        parsed.selectedBackgroundId,
        backgroundThemes.map((theme) => theme.id),
        defaultSave.selectedBackgroundId
      ),
      selectedVariantId: sanitizeId(
        parsed.selectedVariantId,
        deguVariants.map((variant) => variant.id),
        defaultSave.selectedVariantId
      ),
      selectedDeguShotId: sanitizeId(
        parsed.selectedDeguShotId,
        pixelDeguShots.map((shot) => shot.id),
        defaultSave.selectedDeguShotId
      ),
      selectedOutfitIds: sanitizeIdList(
        parsed.selectedOutfitIds,
        outfits.map((item) => item.id),
        defaultSave.selectedOutfitIds
      ),
      placedDecor: sanitizePlacedDecor(parsed.placedDecor),
      ownedRewardIds: sanitizeIdList(parsed.ownedRewardIds, rewardIds, defaultSave.ownedRewardIds),
      gachaHistory: sanitizeIdList(parsed.gachaHistory, rewardIds, defaultSave.gachaHistory),
      pullsSinceRare:
        typeof parsed.pullsSinceRare === 'number' && parsed.pullsSinceRare >= 0
          ? Math.floor(parsed.pullsSinceRare)
          : defaultSave.pullsSinceRare,
      progression: sanitizeProgression(parsed.progression)
    };
  } catch {
    return defaultSave;
  }
}

export function savePrototype(
  save: PrototypeSave,
  storage: Pick<Storage, 'setItem'> = localStorage
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(save));
}

function sanitizeId(value: unknown, allowed: string[], fallback: string): string {
  return typeof value === 'string' && allowed.includes(value) ? value : fallback;
}

function sanitizeEconomy(value: unknown): EconomyState {
  const economy = value && typeof value === 'object' ? (value as Partial<EconomyState>) : {};
  return {
    coins: sanitizeNonNegativeNumber(economy.coins, defaultSave.economy.coins),
    tickets: sanitizeNonNegativeNumber(economy.tickets, defaultSave.economy.tickets),
    shards: sanitizeNonNegativeNumber(economy.shards, defaultSave.economy.shards),
    incomePerSecond: sanitizeNonNegativeNumber(
      economy.incomePerSecond,
      defaultSave.economy.incomePerSecond
    )
  };
}

function sanitizeNonNegativeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : fallback;
}

function sanitizeStringList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return Array.from(new Set(value.filter((item): item is string => typeof item === 'string')));
}

function sanitizeIdList(value: unknown, allowed: string[], fallback: string[]): string[] {
  const ids = sanitizeStringList(value, fallback);
  const filtered = ids.filter((id) => allowed.includes(id));
  return filtered;
}

function sanitizePlacedDecor(value: unknown): PlacedDecor[] {
  if (!Array.isArray(value)) return defaultSave.placedDecor;

  const allowedDecor = new Map(decorItems.map((item) => [item.id, item]));
  const clean: PlacedDecor[] = [];

  for (const item of value) {
    if (!isPlacedDecorLike(item)) continue;
    const decor = allowedDecor.get(item.itemId);
    if (!decor) continue;

    const candidate: PlacedDecor = {
      instanceId: item.instanceId,
      itemId: item.itemId,
      cellX: Math.floor(item.cellX),
      cellY: Math.floor(item.cellY),
      footprint: decor.footprint
    };

    if (canPlaceDecor(grid, clean, candidate.cellX, candidate.cellY, candidate.footprint)) {
      clean.push(candidate);
    }
  }

  return clean;
}

function isPlacedDecorLike(value: unknown): value is PlacedDecor {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<PlacedDecor>;
  return (
    typeof item.instanceId === 'string' &&
    typeof item.itemId === 'string' &&
    typeof item.cellX === 'number' &&
    typeof item.cellY === 'number'
  );
}
