import {
  backgroundThemes,
  accessoryItems,
  decorItems,
  deguVariants,
  navOrder,
  pixelDeguShots,
  starterRewardIds
} from './content';
import { initialEconomy, type EconomyState } from './economy';
import { gardenMapCatalog, placementGrid, type GardenMapId } from './maps';
import { normalizeRotation, type PlacedDecor, withRotatedFootprint } from './placement';
import { defaultProgression, levelFromXp, sanitizeProgression, type ProgressionState } from './progression';
import { canPlaceDecorInScene } from './sceneLayout';

const STORAGE_KEY = 'animalbox.prototype.v1';
const grid = placementGrid;
const starterBackgroundId = 'floating-island';
const starterPlacedDecor: PlacedDecor[] = [
  {
    instanceId: 'starter-clover-1',
    itemId: 'clover-patch',
    cellX: 0,
    cellY: 3,
    footprint: { w: 1, h: 1 }
  }
];
const rewardIds = [
  ...backgroundThemes.map((item) => item.id),
  ...decorItems.map((item) => item.id),
  ...accessoryItems.map((item) => item.id),
  ...deguVariants.map((item) => item.id),
  ...pixelDeguShots.map((item) => item.id),
  ...starterRewardIds
];

export const layoutPresetCount = 3;

export interface LayoutPreset {
  slot: number;
  label: string;
  selectedBackgroundId: string;
  placedDecor: PlacedDecor[];
  updatedAt: number | null;
}

export interface GardenMapState {
  id: GardenMapId;
  label: string;
  unlockLevel: number;
  selectedBackgroundId: string;
  placedDecor: PlacedDecor[];
}

export interface PrototypeSave {
  economy: EconomyState;
  screen: string;
  selectedBackgroundId: string;
  selectedVariantId: string;
  selectedDeguShotId: string;
  customDeguTone: DeguTone;
  selectedOutfitIds: string[];
  accessoryPlacements: Record<string, AccessoryPlacement>;
  placedDecor: PlacedDecor[];
  ownedRewardIds: string[];
  gachaHistory: string[];
  pullsSinceRare: number;
  progression: ProgressionState;
  layoutPresets: LayoutPreset[];
  activeMapId: GardenMapId;
  maps: GardenMapState[];
}

export interface AccessoryPlacement {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface DeguTone {
  hue: number;
  saturation: number;
  brightness: number;
}

export function createDefaultLayoutPresets(): LayoutPreset[] {
  return Array.from({ length: layoutPresetCount }, (_, index) => ({
    slot: index + 1,
    label: `Slot ${index + 1}`,
    selectedBackgroundId: starterBackgroundId,
    placedDecor: [],
    updatedAt: null
  }));
}

export function createDefaultGardenMaps(
  firstMapDecor: PlacedDecor[] = starterPlacedDecor,
  firstBackgroundId = starterBackgroundId
): GardenMapState[] {
  return gardenMapCatalog.map((map, index) => ({
    id: map.id,
    label: map.label,
    unlockLevel: map.unlockLevel,
    selectedBackgroundId: index === 0 ? firstBackgroundId : map.defaultBackgroundId,
    placedDecor: index === 0 ? clonePlacedDecorList(firstMapDecor) : []
  }));
}

export const defaultSave: PrototypeSave = {
  economy: initialEconomy,
  screen: 'home',
  selectedBackgroundId: starterBackgroundId,
  selectedVariantId: 'agouti',
  selectedDeguShotId: '04',
  customDeguTone: { hue: 0, saturation: 100, brightness: 100 },
  selectedOutfitIds: ['straw-hat', 'cloud-puff', 'sprout-buddy'],
  accessoryPlacements: {},
  placedDecor: clonePlacedDecorList(starterPlacedDecor),
  ownedRewardIds: starterRewardIds,
  gachaHistory: [],
  pullsSinceRare: 0,
  progression: defaultProgression,
  layoutPresets: createDefaultLayoutPresets(),
  activeMapId: gardenMapCatalog[0].id,
  maps: createDefaultGardenMaps()
};

export function loadSave(storage: Pick<Storage, 'getItem'> = localStorage): PrototypeSave {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return defaultSave;

  try {
    const parsed = JSON.parse(raw) as Partial<PrototypeSave>;
    const merged = { ...defaultSave, ...parsed };
    const economy = sanitizeEconomy(parsed.economy);
    const progression = sanitizeProgression(parsed.progression);
    const backgroundIds = backgroundThemes.map((theme) => theme.id);
    const fallbackBackgroundId = sanitizeId(
      parsed.selectedBackgroundId,
      backgroundIds,
      defaultSave.selectedBackgroundId
    );
    const fallbackPlacedDecor = sanitizePlacedDecor(
      parsed.placedDecor,
      clonePlacedDecorList(starterPlacedDecor)
    );
    let maps = sanitizeGardenMaps(parsed.maps, fallbackBackgroundId, fallbackPlacedDecor);
    const candidateActiveMapId = sanitizeGardenMapId(parsed.activeMapId);
    maps = maps.map((map) =>
      map.id === candidateActiveMapId
        ? {
            ...map,
            selectedBackgroundId: fallbackBackgroundId,
            placedDecor: clonePlacedDecorList(fallbackPlacedDecor)
          }
        : map
    );
    const candidateDefinition =
      gardenMapCatalog.find((map) => map.id === candidateActiveMapId) ?? gardenMapCatalog[0];
    const activeMapId =
      candidateDefinition.unlockLevel <= levelFromXp(progression.xp)
        ? candidateActiveMapId
        : gardenMapCatalog[0].id;
    const activeMap = maps.find((map) => map.id === activeMapId) ?? maps[0];

    return {
      ...merged,
      economy,
      screen: sanitizeId(parsed.screen, navOrder, defaultSave.screen),
      selectedBackgroundId: activeMap.selectedBackgroundId,
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
      customDeguTone: sanitizeDeguTone(parsed.customDeguTone),
      selectedOutfitIds: sanitizeIdList(
        parsed.selectedOutfitIds,
        accessoryItems.map((item) => item.id),
        defaultSave.selectedOutfitIds
      ),
      accessoryPlacements: sanitizeAccessoryPlacements(parsed.accessoryPlacements),
      placedDecor: clonePlacedDecorList(activeMap.placedDecor),
      ownedRewardIds: sanitizeIdList(parsed.ownedRewardIds, rewardIds, defaultSave.ownedRewardIds),
      gachaHistory: sanitizeIdList(parsed.gachaHistory, rewardIds, defaultSave.gachaHistory),
      pullsSinceRare:
        typeof parsed.pullsSinceRare === 'number' && parsed.pullsSinceRare >= 0
          ? Math.floor(parsed.pullsSinceRare)
          : defaultSave.pullsSinceRare,
      progression,
      layoutPresets: sanitizeLayoutPresets(parsed.layoutPresets),
      activeMapId,
      maps
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

function sanitizeAccessoryPlacements(value: unknown): Record<string, AccessoryPlacement> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaultSave.accessoryPlacements;

  const allowed = new Set(accessoryItems.map((item) => item.id));
  const clean: Record<string, AccessoryPlacement> = {};
  for (const [id, placement] of Object.entries(value as Record<string, unknown>)) {
    if (!allowed.has(id) || !placement || typeof placement !== 'object' || Array.isArray(placement)) continue;
    const item = placement as Partial<AccessoryPlacement>;
    clean[id] = {
      x: clampNumber(item.x, -28, 28, 0),
      y: clampNumber(item.y, -28, 28, 0),
      scale: clampNumber(item.scale, 0.62, 1.7, 1),
      rotation: clampNumber(item.rotation, -45, 45, 0)
    };
  }
  return clean;
}

function sanitizeDeguTone(value: unknown): DeguTone {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaultSave.customDeguTone;
  const tone = value as Partial<DeguTone>;
  return {
    hue: clampNumber(tone.hue, -35, 35, defaultSave.customDeguTone.hue),
    saturation: clampNumber(tone.saturation, 70, 135, defaultSave.customDeguTone.saturation),
    brightness: clampNumber(tone.brightness, 82, 122, defaultSave.customDeguTone.brightness)
  };
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function sanitizePlacedDecor(value: unknown, fallback: PlacedDecor[] = defaultSave.placedDecor): PlacedDecor[] {
  if (!Array.isArray(value)) return fallback;

  const allowedDecor = new Map(decorItems.map((item) => [item.id, item]));
  const clean: PlacedDecor[] = [];

  for (const item of value) {
    if (!isPlacedDecorLike(item)) continue;
    const decor = allowedDecor.get(item.itemId);
    if (!decor) continue;
    const rotation = normalizeRotation(item.rotation);
    const orientedDecor = withRotatedFootprint(decor, rotation);

    const candidate: PlacedDecor = {
      instanceId: item.instanceId,
      itemId: item.itemId,
      cellX: Math.floor(item.cellX),
      cellY: Math.floor(item.cellY),
      footprint: orientedDecor.footprint,
      ...(rotation === 0 ? {} : { rotation })
    };

    if (canPlaceDecorInScene(grid, clean, candidate.cellX, candidate.cellY, orientedDecor)) {
      clean.push(candidate);
    }
  }

  return clean;
}

function sanitizeLayoutPresets(value: unknown): LayoutPreset[] {
  const defaults = createDefaultLayoutPresets();
  if (!Array.isArray(value)) return defaults;

  const backgroundIds = backgroundThemes.map((theme) => theme.id);

  return defaults.map((fallback, index) => {
    const bySlot = value.find((item) => {
      if (!item || typeof item !== 'object') return false;
      return (item as Partial<LayoutPreset>).slot === fallback.slot;
    });
    const source = bySlot ?? value[index];

    if (!source || typeof source !== 'object') return fallback;
    const preset = source as Partial<LayoutPreset>;

    return {
      ...fallback,
      selectedBackgroundId: sanitizeId(
        preset.selectedBackgroundId,
        backgroundIds,
        fallback.selectedBackgroundId
      ),
      placedDecor: sanitizePlacedDecor(preset.placedDecor, []),
      updatedAt: sanitizeNullableTimestamp(preset.updatedAt)
    };
  });
}

function sanitizeGardenMapId(value: unknown): GardenMapId {
  if (typeof value === 'string' && gardenMapCatalog.some((map) => map.id === value)) {
    return value as GardenMapId;
  }

  return gardenMapCatalog[0].id;
}

function sanitizeGardenMaps(
  value: unknown,
  firstBackgroundId: string,
  firstMapDecor: PlacedDecor[]
): GardenMapState[] {
  const backgroundIds = backgroundThemes.map((theme) => theme.id);
  const defaults = createDefaultGardenMaps(firstMapDecor, firstBackgroundId);
  const sources = Array.isArray(value) ? value : [];

  return gardenMapCatalog.map((definition, index) => {
    const fallback = defaults[index];
    const source =
      sources.find(
        (item) =>
          item &&
          typeof item === 'object' &&
          (item as Partial<GardenMapState>).id === definition.id
      ) ?? null;

    if (!source || typeof source !== 'object') return fallback;
    const map = source as Partial<GardenMapState>;

    return {
      id: definition.id,
      label: definition.label,
      unlockLevel: definition.unlockLevel,
      selectedBackgroundId: sanitizeId(
        map.selectedBackgroundId,
        backgroundIds,
        fallback.selectedBackgroundId
      ),
      placedDecor: sanitizePlacedDecor(map.placedDecor, fallback.placedDecor)
    };
  });
}

function clonePlacedDecorList(items: PlacedDecor[]): PlacedDecor[] {
  return items.map((item) => ({
    ...item,
    footprint: { ...item.footprint }
  }));
}

function sanitizeNullableTimestamp(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : null;
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
