import type { GridSize } from './placement';

export const placementGrid: GridSize = { width: 12, height: 8 };

export type GardenMapId = 'sky-pasture' | 'clover-terrace' | 'moon-garden';

export interface GardenMapDefinition {
  id: GardenMapId;
  label: string;
  detail: string;
  unlockLevel: number;
  defaultBackgroundId: string;
}

export const gardenMapCatalog: GardenMapDefinition[] = [
  {
    id: 'sky-pasture',
    label: 'Sky Pasture',
    detail: 'Starter island',
    unlockLevel: 1,
    defaultBackgroundId: 'floating-island'
  },
  {
    id: 'clover-terrace',
    label: 'Clover Terrace',
    detail: 'More room at Lv 3',
    unlockLevel: 3,
    defaultBackgroundId: 'morning-pasture'
  },
  {
    id: 'moon-garden',
    label: 'Moon Garden',
    detail: 'Night map at Lv 6',
    unlockLevel: 6,
    defaultBackgroundId: 'starlight-night'
  }
];

export function getGardenMapDefinition(mapId: string): GardenMapDefinition {
  return gardenMapCatalog.find((map) => map.id === mapId) ?? gardenMapCatalog[0];
}

export function isGardenMapUnlocked(level: number, map: GardenMapDefinition): boolean {
  return level >= map.unlockLevel;
}
