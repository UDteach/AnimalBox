import { outfits } from './content';

export function toggleOutfitForSlot(selectedOutfitIds: string[], outfitId: string) {
  const outfit = outfits.find((item) => item.id === outfitId);
  if (!outfit) return selectedOutfitIds;

  if (selectedOutfitIds.includes(outfitId)) {
    return selectedOutfitIds.filter((id) => id !== outfitId);
  }

  const sameSlotIds = new Set(outfits.filter((item) => item.slot === outfit.slot).map((item) => item.id));

  return [...selectedOutfitIds.filter((id) => !sameSlotIds.has(id)), outfitId];
}
