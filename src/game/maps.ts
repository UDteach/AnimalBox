import type { GridSize } from './placement';

export const placementGrid: GridSize = { width: 18, height: 10 };

export type GardenMapId = 'sky-pasture' | 'clover-terrace' | 'moon-garden';

export interface GardenMapDefinition {
  id: GardenMapId;
  label: string;
  labelJa: string;
  detail: string;
  detailJa: string;
  unlockLevel: number;
  defaultBackgroundId: string;
}

export const gardenMapCatalog: GardenMapDefinition[] = [
  {
    id: 'sky-pasture',
    label: 'Sky Pasture',
    labelJa: '空の牧草島',
    detail: 'Starter island',
    detailJa: '最初の島',
    unlockLevel: 1,
    defaultBackgroundId: 'floating-island'
  },
  {
    id: 'clover-terrace',
    label: 'Clover Terrace',
    labelJa: 'クローバーテラス',
    detail: 'More room at Lv 3',
    detailJa: 'Lv3で解放',
    unlockLevel: 3,
    defaultBackgroundId: 'morning-pasture'
  },
  {
    id: 'moon-garden',
    label: 'Moon Garden',
    labelJa: '月夜の庭',
    detail: 'Night map at Lv 6',
    detailJa: 'Lv6で解放',
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
