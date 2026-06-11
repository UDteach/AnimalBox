import { initialEconomy, type EconomyState } from './economy';
import type { PlacedDecor } from './placement';

const STORAGE_KEY = 'animalbox.prototype.v1';

export interface PrototypeSave {
  economy: EconomyState;
  screen: string;
  selectedVariantId: string;
  selectedOutfitIds: string[];
  placedDecor: PlacedDecor[];
  ownedRewardIds: string[];
  gachaHistory: string[];
  pullsSinceRare: number;
}

export const defaultSave: PrototypeSave = {
  economy: initialEconomy,
  screen: 'home',
  selectedVariantId: 'agouti',
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
  ownedRewardIds: ['hay-bed', 'straw-hat'],
  gachaHistory: [],
  pullsSinceRare: 0
};

export function loadSave(storage: Pick<Storage, 'getItem'> = localStorage): PrototypeSave {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return defaultSave;

  try {
    const parsed = JSON.parse(raw) as Partial<PrototypeSave>;
    return {
      ...defaultSave,
      ...parsed,
      economy: { ...defaultSave.economy, ...parsed.economy },
      selectedOutfitIds: Array.isArray(parsed.selectedOutfitIds)
        ? parsed.selectedOutfitIds
        : defaultSave.selectedOutfitIds,
      placedDecor: Array.isArray(parsed.placedDecor) ? parsed.placedDecor : defaultSave.placedDecor,
      ownedRewardIds: Array.isArray(parsed.ownedRewardIds)
        ? parsed.ownedRewardIds
        : defaultSave.ownedRewardIds,
      gachaHistory: Array.isArray(parsed.gachaHistory) ? parsed.gachaHistory : defaultSave.gachaHistory
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
