import { accessoryItems } from './content';

export function toggleFloatingItemForSlot(selectedItemIds: string[], itemId: string) {
  const item = accessoryItems.find((candidate) => candidate.id === itemId);
  if (!item) return selectedItemIds;

  if (selectedItemIds.includes(itemId)) {
    return selectedItemIds.filter((id) => id !== itemId);
  }

  const sameSlotIds = new Set(
    accessoryItems.filter((candidate) => candidate.slot === item.slot).map((candidate) => candidate.id)
  );

  return [...selectedItemIds.filter((id) => !sameSlotIds.has(id)), itemId];
}

export const toggleOutfitForSlot = toggleFloatingItemForSlot;
