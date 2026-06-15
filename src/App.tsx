import { useEffect, useMemo, useRef, useState } from 'react';
import {
  backgroundThemes,
  accessoryItems,
  buildCatalogCollectionGroups,
  catalogItems,
  catalogKindOrder,
  decorItems,
  deguVariants,
  getCatalogItem,
  navOrder,
  pixelDeguShots,
  runtimeAssets,
  screens,
  isRewardOwned,
  starterRewardIds,
  type BackgroundTheme,
  type CatalogFilterState,
  type CatalogItem,
  type CatalogKind,
  type CatalogRarity,
  type CollectionGroup,
  type DecorItem,
  type FloatingItem,
  type PixelDeguShot,
  type ScreenId
} from './game/content';
import { addIdleIncome, formatNumber, spendCurrency, tapForCoins, type EconomyState } from './game/economy';
import {
  browserRandom,
  runPulls,
  skyGiftBanner,
  premiumSkyGiftBanner,
  type GachaBanner,
  type PullResult
} from './game/gacha';
import {
  detectInitialLocale,
  localizedName,
  mapDetail,
  mapLabel,
  persistLocale,
  screenLabel,
  text,
  toggleLocale,
  collectionLabels,
  type Locale
} from './game/i18n';
import {
  gardenMapCatalog,
  getGardenMapDefinition,
  isGardenMapUnlocked,
  placementGrid,
  type GardenMapId
} from './game/maps';
import { PixelDeguStage } from './game/pixel/PixelDeguStage';
import { normalizeRotation, type Cell, type PlacedDecor, withRotatedFootprint } from './game/placement';
import { assetStyle, canPlaceDecorInScene, gridCellAnchor, gridMeshLines, gridToScene } from './game/sceneLayout';
import {
  applyIdleProgress,
  applyTapProgress,
  careActions,
  claimTickets,
  deriveGameStats,
  getNextUpgrade,
  performCareAction,
  purchaseUpgrade,
  upgradeCatalog,
  type CareActionId,
  type GameStats,
  type ProgressionState,
  type UpgradeDefinition
} from './game/progression';
import {
  createDefaultLayoutPresets,
  loadSave,
  savePrototype,
  type AccessoryPlacement,
  type DeguTone,
  type GardenMapState,
  type LayoutPreset,
  type PrototypeSave
} from './game/storage';
import { toggleFloatingItemForSlot } from './game/wardrobe';

interface Burst {
  id: number;
  label: string;
  x: number;
  y: number;
}

interface GachaReveal {
  id: number;
  bannerId: string;
  results: PullResult[];
}

interface ScreenCueContent {
  title: string;
  detail: string;
  meta: string;
  action: string;
}

type GuideTaskId = 'tap' | 'care' | 'decor' | 'gift';

interface GuideTask {
  id: GuideTaskId;
  label: string;
  value: string;
  action: string;
  done: boolean;
  ready: boolean;
}

interface MarketOffer {
  id: string;
  label: string;
  detail: string;
  costShards: number;
  rewardTickets: number;
}

const screenSet = new Set<ScreenId>(navOrder);
const grid = placementGrid;
const meshLines = gridMeshLines(grid);
const firstOpenCell: Cell = { x: 0, y: 0 };

function buildMarketOffers(locale: Locale): MarketOffer[] {
  return [
    {
      id: 'ticket-1',
      label: text(locale, 'Sky ticket', '空チケット'),
      detail: text(locale, '12 shards -> ticket', 'かけら12 -> 1枚'),
      costShards: 12,
      rewardTickets: 1
    },
    {
      id: 'ticket-5',
      label: text(locale, 'Gift bundle', 'ギフト束'),
      detail: text(locale, '52 shards -> 5 tix', 'かけら52 -> 5枚'),
      costShards: 52,
      rewardTickets: 5
    }
  ];
}

function deguShotUnlockCost(shotId: string): number {
  const numericIndex = Number.parseInt(shotId, 10);
  const catalogIndex = Number.isFinite(numericIndex)
    ? numericIndex - 1
    : pixelDeguShots.findIndex((shot) => shot.id === shotId);

  return 650 + Math.max(0, catalogIndex) * 260;
}

function deguToneFilter(tone: DeguTone, baseFilter: string): string {
  return `${baseFilter} hue-rotate(${tone.hue}deg) saturate(${tone.saturation / 100}) brightness(${tone.brightness / 100})`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildGuideTasks(save: PrototypeSave, stats: GameStats, locale: Locale): GuideTask[] {
  const availableTickets = save.economy.tickets + stats.claimableTickets;
  const placedByPlayer = Math.max(0, save.placedDecor.length - 1);

  return [
    {
      id: 'tap',
      label: text(locale, 'Tap', 'タップ'),
      value: `+${stats.tapPower}`,
      action: text(locale, 'Earn', '稼ぐ'),
      done: save.progression.xp > 0,
      ready: true
    },
    {
      id: 'care',
      label: text(locale, 'Care', 'お世話'),
      value: text(locale, `Bond ${stats.affectionLevel}`, `なかよし ${stats.affectionLevel}`),
      action: text(locale, 'Brush', 'ブラシ'),
      done: save.progression.careStreak > 0,
      ready: true
    },
    {
      id: 'decor',
      label: text(locale, 'Decor', '配置'),
      value: text(locale, `${placedByPlayer} placed`, `${placedByPlayer}個`),
      action: text(locale, 'Place', '置く'),
      done: placedByPlayer > 0,
      ready: true
    },
    {
      id: 'gift',
      label: text(locale, 'Gift', 'ギフト'),
      value: text(
        locale,
        `${availableTickets} ticket${availableTickets === 1 ? '' : 's'}`,
        `チケット${availableTickets}枚`
      ),
      action: availableTickets > 0 ? text(locale, 'Open', '開ける') : text(locale, 'Charge', 'ためる'),
      done: save.gachaHistory.length > 0,
      ready: availableTickets > 0
    }
  ];
}

function coerceScreen(value: string): ScreenId {
  return screenSet.has(value as ScreenId) ? (value as ScreenId) : 'home';
}

function getInitialScreen(): ScreenId {
  const urlScreen = new URLSearchParams(window.location.search).get('screen');
  return urlScreen ? coerceScreen(urlScreen) : coerceScreen(loadSave().screen);
}

function nextSave(updater: (save: PrototypeSave) => PrototypeSave) {
  return updater;
}

function materializeGardenMaps(save: PrototypeSave): GardenMapState[] {
  return gardenMapCatalog.map((definition) => {
    const existing = save.maps.find((map) => map.id === definition.id);
    return {
      id: definition.id,
      label: definition.label,
      unlockLevel: definition.unlockLevel,
      selectedBackgroundId: existing?.selectedBackgroundId ?? definition.defaultBackgroundId,
      placedDecor: clonePlacedDecor(existing?.placedDecor ?? [])
    };
  });
}

function getGardenMapFromSave(save: PrototypeSave, mapId: GardenMapId = save.activeMapId): GardenMapState {
  const maps = materializeGardenMaps(save);
  return maps.find((map) => map.id === mapId) ?? maps[0];
}

function activateGardenMap(save: PrototypeSave, mapId: GardenMapId): PrototypeSave {
  const maps = materializeGardenMaps(save);
  const target = maps.find((map) => map.id === mapId) ?? maps[0];

  return {
    ...save,
    activeMapId: target.id,
    selectedBackgroundId: target.selectedBackgroundId,
    placedDecor: clonePlacedDecor(target.placedDecor),
    maps
  };
}

function updateActiveGardenMap(
  save: PrototypeSave,
  patch: Partial<Pick<GardenMapState, 'selectedBackgroundId' | 'placedDecor'>>
): PrototypeSave {
  const maps = materializeGardenMaps(save);
  const active = maps.find((map) => map.id === save.activeMapId) ?? maps[0];
  const nextActive: GardenMapState = {
    ...active,
    selectedBackgroundId: patch.selectedBackgroundId ?? active.selectedBackgroundId,
    placedDecor: patch.placedDecor ? clonePlacedDecor(patch.placedDecor) : clonePlacedDecor(active.placedDecor)
  };
  const nextMaps = maps.map((map) => (map.id === nextActive.id ? nextActive : map));

  return {
    ...save,
    activeMapId: nextActive.id,
    selectedBackgroundId: nextActive.selectedBackgroundId,
    placedDecor: clonePlacedDecor(nextActive.placedDecor),
    maps: nextMaps
  };
}

function isBackgroundAvailable(themeId: string, ownedRewardIds: string[], level: number): boolean {
  return (
    isRewardOwned(ownedRewardIds, themeId) ||
    gardenMapCatalog.some(
      (map) => map.defaultBackgroundId === themeId && isGardenMapUnlocked(level, map)
    )
  );
}

export function App() {
  const [save, setSave] = useState<PrototypeSave>(() => loadSave());
  const saveRef = useRef(save);
  const [locale, setLocale] = useState<Locale>(() => detectInitialLocale());
  const [screen, setScreenState] = useState<ScreenId>(() => getInitialScreen());
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [selectedDecorId, setSelectedDecorId] = useState('hay-bed');
  const [selectedAccessoryId, setSelectedAccessoryId] = useState('straw-hat');
  const [selectedCell, setSelectedCell] = useState<Cell>(firstOpenCell);
  const [rotation, setRotation] = useState(0);
  const [status, setStatus] = useState(() => text(detectInitialLocale(), 'Runtime parts prototype', 'プロトタイプ準備中'));
  const [missingAssets, setMissingAssets] = useState<string[]>([]);
  const [gachaReveal, setGachaReveal] = useState<GachaReveal | null>(null);
  const [gachaOpening, setGachaOpening] = useState(false);
  const gachaBusyRef = useRef(false);

  const current = screens[screen];
  const economy = save.economy;
  const gameStats = deriveGameStats(economy.incomePerSecond, save.progression);
  const activeMap = getGardenMapFromSave(save);
  const activeMapDefinition = getGardenMapDefinition(activeMap.id);
  const nextUpgrade = getNextUpgrade(save.progression);
  const guideTasks = useMemo(() => buildGuideTasks(save, gameStats, locale), [gameStats, locale, save]);
  const collectionGroups = useMemo(
    () =>
      buildCatalogCollectionGroups(save.ownedRewardIds, collectionLabels[locale]).map((group) => ({
        ...group,
        nextLabel:
          group.nextLabel === 'Complete'
            ? text(locale, 'Complete', 'コンプリート')
            : localizedName(locale, group.nextLabel, getCatalogItem(group.nextLabel)?.label ?? group.nextLabel)
      })),
    [locale, save.ownedRewardIds]
  );
  const marketOffers = useMemo(() => buildMarketOffers(locale), [locale]);
  const selectedBackgroundId = isBackgroundAvailable(
    activeMap.selectedBackgroundId,
    save.ownedRewardIds,
    gameStats.level
  )
    ? activeMap.selectedBackgroundId
    : activeMapDefinition.defaultBackgroundId;
  const selectedVariantId = isRewardOwned(save.ownedRewardIds, save.selectedVariantId)
    ? save.selectedVariantId
    : 'agouti';
  const selectedOutfitIds = save.selectedOutfitIds.filter((id) => isRewardOwned(save.ownedRewardIds, id));
  const activeVariant = deguVariants.find((item) => item.id === selectedVariantId) ?? deguVariants[0];
  const activeAccessory =
    accessoryItems.find((item) => selectedOutfitIds.includes(item.id) && item.id === selectedAccessoryId) ??
    accessoryItems.find((item) => selectedOutfitIds.includes(item.id));
  const customDeguFilter = deguToneFilter(save.customDeguTone, activeVariant.filter);
  const selectedDecor = decorItems.find((item) => item.id === selectedDecorId) ?? decorItems[0];
  const placementDecor = useMemo(
    () => withRotatedFootprint(selectedDecor, rotation),
    [selectedDecor, rotation]
  );
  const placementCanConfirm = canPlaceDecorInScene(
    grid,
    save.placedDecor,
    selectedCell.x,
    selectedCell.y,
    placementDecor
  );
  const validPlacementCellCount = useMemo(() => {
    let count = 0;

    for (let y = 0; y < grid.height; y += 1) {
      for (let x = 0; x < grid.width; x += 1) {
        if (canPlaceDecorInScene(grid, save.placedDecor, x, y, placementDecor)) count += 1;
      }
    }

    return count;
  }, [placementDecor, save.placedDecor]);
  const activeTheme =
    backgroundThemes.find((theme) => theme.id === selectedBackgroundId) ?? backgroundThemes[0];

  const allAssetPaths = useMemo(
    () => [
      activeTheme.src,
      ...Object.values(screens).map((item) => item.image),
      ...Object.values(runtimeAssets)
    ],
    [activeTheme.src]
  );

  useEffect(() => {
    saveRef.current = save;
    savePrototype(save);
  }, [save]);

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  useEffect(() => {
    if (canPlaceDecorInScene(grid, save.placedDecor, selectedCell.x, selectedCell.y, placementDecor)) {
      return;
    }

    const nextCell = findFirstSceneSafeCell(placementDecor, save.placedDecor);
    if (nextCell) setSelectedCell(nextCell);
  }, [save.placedDecor, selectedCell.x, selectedCell.y, placementDecor]);

  useEffect(() => {
    let cancelled = false;
    const failures: string[] = [];

    allAssetPaths.forEach((src) => {
      const image = new Image();
      image.onload = () => {
        if (!cancelled && failures.length === 0) setMissingAssets([]);
      };
      image.onerror = () => {
        failures.push(src);
        if (!cancelled) setMissingAssets([...failures]);
      };
      image.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, [allAssetPaths]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSave(
        nextSave((currentSave) => {
          const stats = deriveGameStats(
            currentSave.economy.incomePerSecond,
            currentSave.progression
          );
          const economyAfterIdle = addIdleIncome(currentSave.economy, 1000, stats.idleIncomePerSecond);
          const earned = economyAfterIdle.coins - currentSave.economy.coins;

          return {
            ...currentSave,
            economy: economyAfterIdle,
            progression: applyIdleProgress(currentSave.progression, earned, 1000)
          };
        })
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (bursts.length === 0) return;
    const timer = window.setTimeout(() => setBursts((items) => items.slice(1)), 780);
    return () => window.clearTimeout(timer);
  }, [bursts]);

  useEffect(() => {
    if (!gachaOpening) {
      gachaBusyRef.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      setGachaOpening(false);
      gachaBusyRef.current = false;
    }, 1050);
    return () => window.clearTimeout(timer);
  }, [gachaOpening, gachaReveal?.id]);

  function setScreen(next: ScreenId) {
    setScreenState(next);
    setSave(nextSave((currentSave) => ({ ...currentSave, screen: next })));
    setStatus(text(locale, `${screens[next].label} screen`, `${screenLabel(locale, next)}を開きました`));
  }

  function switchLocale() {
    const next = toggleLocale(locale);
    setLocale(next);
    setStatus(text(next, 'Language: English', '日本語表示にしました'));
  }

  function tapDegu() {
    const stats = deriveGameStats(save.economy.incomePerSecond, save.progression);
    setSave(
      nextSave((currentSave) => {
        const currentStats = deriveGameStats(
          currentSave.economy.incomePerSecond,
          currentSave.progression
        );

        return {
          ...currentSave,
          economy: tapForCoins(currentSave.economy, currentStats.tapPower),
          progression: applyTapProgress(currentSave.progression, currentStats)
        };
      })
    );
    setBursts((items) => [
      ...items,
      { id: Date.now(), label: `+${stats.tapPower}`, x: 52 + Math.random() * 4, y: 49 + Math.random() * 4 }
    ]);
    setStatus(text(locale, `Degu tap +${stats.tapPower} coins`, `デグーをタップ +${stats.tapPower}コイン`));
  }

  function buyUpgrade(upgradeId: string) {
    const optimistic = purchaseUpgrade(
      saveRef.current.economy,
      saveRef.current.progression,
      upgradeId
    );
    setSave(
      nextSave((currentSave) => {
        const result = purchaseUpgrade(currentSave.economy, currentSave.progression, upgradeId);
        if (!result) return currentSave;

        return {
          ...currentSave,
          economy: result.economy,
          progression: result.progression
        };
      })
    );
    setStatus(
      optimistic
        ? text(locale, `Upgrade: ${optimistic.upgrade.label}`, `強化: ${optimistic.upgrade.label}`)
        : text(locale, 'Need coins or shards', 'コインかかけらが足りません')
    );
  }

  function claimEarnedTickets() {
    const optimistic = claimTickets(saveRef.current.economy, saveRef.current.progression);
    setSave(
      nextSave((currentSave) => {
        const result = claimTickets(currentSave.economy, currentSave.progression);
        if (result.claimed <= 0) return currentSave;

        return {
          ...currentSave,
          economy: result.economy,
          progression: result.progression
        };
      })
    );
    setStatus(
      optimistic.claimed > 0
        ? text(
            locale,
            `Claimed ${optimistic.claimed} ticket${optimistic.claimed === 1 ? '' : 's'}`,
            `チケット${optimistic.claimed}枚を受け取りました`
          )
        : text(locale, 'Ticket meter charging', 'チケットをためています')
    );
  }

  function careForDegu(actionId: CareActionId) {
    const optimistic = performCareAction(
      saveRef.current.economy,
      saveRef.current.progression,
      actionId
    );
    setSave(
      nextSave((currentSave) => {
        const result = performCareAction(
          currentSave.economy,
          currentSave.progression,
          actionId
        );
        if (!result) return currentSave;

        return {
          ...currentSave,
          economy: result.economy,
          progression: result.progression
        };
      })
    );
    setStatus(
      optimistic
        ? text(
            locale,
            `${optimistic.action.label}: +${optimistic.action.affectionReward} bond`,
            `${optimistic.action.label}: なかよし +${optimistic.action.affectionReward}`
          )
        : text(locale, 'Need coins for care', 'お世話のコインが足りません')
    );
  }

  function selectBackground(themeId: string) {
    const theme = backgroundThemes.find((item) => item.id === themeId);
    if (!theme) return;
    if (!isBackgroundAvailable(theme.id, save.ownedRewardIds, gameStats.level)) {
      setStatus(text(locale, `${theme.label} locked`, `${localizedName(locale, theme.id, theme.label)}は未解放です`));
      return;
    }

    setSave(
      nextSave((currentSave) =>
        updateActiveGardenMap(currentSave, { selectedBackgroundId: theme.id })
      )
    );
    setStatus(text(locale, `Theme: ${theme.label}`, `背景: ${localizedName(locale, theme.id, theme.label)}`));
  }

  function selectMap(mapId: GardenMapId) {
    const definition = getGardenMapDefinition(mapId);
    if (!isGardenMapUnlocked(gameStats.level, definition)) {
      setStatus(
        text(
          locale,
          `${definition.label} unlocks at Lv ${definition.unlockLevel}`,
          `${mapLabel(locale, definition)}はLv${definition.unlockLevel}で解放`
        )
      );
      return;
    }

    setSave(nextSave((currentSave) => activateGardenMap(currentSave, mapId)));
    setStatus(text(locale, `Map: ${definition.label}`, `MAP: ${mapLabel(locale, definition)}`));
  }

  function saveLayoutPreset(slot: number) {
    setSave(
      nextSave((currentSave) => {
        const preset: LayoutPreset = {
          slot,
          label: `Slot ${slot}`,
          selectedBackgroundId: currentSave.selectedBackgroundId,
          placedDecor: clonePlacedDecor(currentSave.placedDecor),
          updatedAt: Date.now()
        };

        return {
          ...currentSave,
          layoutPresets: currentSave.layoutPresets.map((item) =>
            item.slot === slot ? preset : item
          )
        };
      })
    );
    setStatus(text(locale, `Saved layout ${slot}`, `レイアウト${slot}を保存しました`));
  }

  function loadLayoutPreset(slot: number) {
    const preset = saveRef.current.layoutPresets.find((item) => item.slot === slot);
    if (!preset?.updatedAt) {
      setStatus(text(locale, `Layout ${slot} empty`, `レイアウト${slot}は空です`));
      return;
    }

    const hasLockedBackground = !isRewardOwned(
      saveRef.current.ownedRewardIds,
      preset.selectedBackgroundId
    );
    const hasLockedDecor = preset.placedDecor.some(
      (item) => !isRewardOwned(saveRef.current.ownedRewardIds, item.itemId)
    );

    if (hasLockedBackground || hasLockedDecor) {
      setStatus(text(locale, `Layout ${slot} has locked items`, `レイアウト${slot}に未解放アイテムがあります`));
      return;
    }

    setSave(
      nextSave((currentSave) => {
        const currentPreset = currentSave.layoutPresets.find((item) => item.slot === slot);
        if (!currentPreset?.updatedAt) return currentSave;

        return updateActiveGardenMap(currentSave, {
          selectedBackgroundId: currentPreset.selectedBackgroundId,
          placedDecor: currentPreset.placedDecor
        });
      })
    );
    setStatus(text(locale, `Loaded layout ${slot}`, `レイアウト${slot}を読み込みました`));
  }

  function clearLayoutPreset(slot: number) {
    const fallback = createDefaultLayoutPresets().find((item) => item.slot === slot);
    if (!fallback) return;

    setSave(
      nextSave((currentSave) => ({
        ...currentSave,
        layoutPresets: currentSave.layoutPresets.map((item) =>
          item.slot === slot ? fallback : item
        )
      }))
    );
    setStatus(text(locale, `Cleared layout ${slot}`, `レイアウト${slot}を消しました`));
  }

  function selectVariant(variantId: string) {
    const variant = deguVariants.find((item) => item.id === variantId);
    if (!variant) return;
    if (!isRewardOwned(save.ownedRewardIds, variant.id)) {
      setStatus(text(locale, `${variant.label} locked`, `${localizedName(locale, variant.id, variant.label)}は未解放です`));
      return;
    }

    setSave(nextSave((currentSave) => ({ ...currentSave, selectedVariantId: variantId })));
    setStatus(text(locale, `Variant: ${variantId}`, `毛色: ${localizedName(locale, variant.id, variant.label)}`));
  }

  function selectDeguShot(shotId: string) {
    const shot = pixelDeguShots.find((item) => item.id === shotId);
    if (!shot) return;

    if (isRewardOwned(saveRef.current.ownedRewardIds, shotId)) {
      setSave(nextSave((currentSave) => ({ ...currentSave, selectedDeguShotId: shotId })));
      setStatus(text(locale, `Animal: ${shot.label}`, `どうぶつ: ${localizedName(locale, shot.id, shot.label)}`));
      return;
    }

    const cost = deguShotUnlockCost(shotId);
    setSave(
      nextSave((currentSave) => {
        const paid = spendCurrency(currentSave.economy, 'coins', cost);
        if (!paid) return currentSave;
        return {
          ...currentSave,
          economy: paid,
          selectedDeguShotId: shotId,
          ownedRewardIds: Array.from(new Set([...currentSave.ownedRewardIds, shotId]))
        };
      })
    );
    setStatus(
      saveRef.current.economy.coins >= cost
        ? text(locale, `Unlocked ${shot.label}`, `${localizedName(locale, shot.id, shot.label)}を解放しました`)
        : text(locale, `Need ${formatNumber(cost)} coins`, `${formatNumber(cost)}コイン必要です`)
    );
  }

  function selectDecor(decorId: string) {
    const decor = decorItems.find((item) => item.id === decorId);
    if (!decor) return;
    setSelectedDecorId(decorId);

    const nextCell = findFirstSceneSafeCell(withRotatedFootprint(decor, rotation), saveRef.current.placedDecor);
    if (nextCell) setSelectedCell(nextCell);
    setStatus(text(locale, `Decor: ${decor.label}`, `家具: ${localizedName(locale, decor.id, decor.label)}`));
  }

  function movePlacementCell(dx: number, dy: number) {
    const nextCell = findDirectionalSceneSafeCell(
      placementDecor,
      saveRef.current.placedDecor,
      selectedCell,
      dx,
      dy
    );

    if (!nextCell) {
      setStatus(text(locale, 'No open spot in that direction', 'その方向に空きマスがありません'));
      return;
    }

    setSelectedCell(nextCell);
    setStatus(text(locale, `Cell ${nextCell.x + 1}-${nextCell.y + 1}`, `マス ${nextCell.x + 1}-${nextCell.y + 1}`));
  }

  function toggleFloatingItem(itemId: string) {
    const item = accessoryItems.find((candidate) => candidate.id === itemId);
    if (!item) return;
    if (!isRewardOwned(save.ownedRewardIds, item.id)) {
      setStatus(text(locale, `${item.label} locked`, `${localizedName(locale, item.id, item.label)}は未解放です`));
      return;
    }

    setSave(
      nextSave((currentSave) => {
        return {
          ...currentSave,
          selectedOutfitIds: toggleFloatingItemForSlot(currentSave.selectedOutfitIds, itemId)
        };
      })
    );
    setSelectedAccessoryId(itemId);
    setStatus(text(locale, `Accessory: ${item.label}`, `おとも: ${localizedName(locale, item.id, item.label)}`));
  }

  function adjustAccessory(itemId: string, patch: Partial<AccessoryPlacement>) {
    const item = accessoryItems.find((candidate) => candidate.id === itemId);
    if (!item || !saveRef.current.selectedOutfitIds.includes(itemId)) return;

    setSave(
      nextSave((currentSave) => {
        const current = currentSave.accessoryPlacements[itemId] ?? {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0
        };
        return {
          ...currentSave,
          accessoryPlacements: {
            ...currentSave.accessoryPlacements,
            [itemId]: {
              x: clamp(current.x + (patch.x ?? 0), -28, 28),
              y: clamp(current.y + (patch.y ?? 0), -28, 28),
              scale: clamp(current.scale + (patch.scale ?? 0), 0.62, 1.7),
              rotation: clamp(current.rotation + (patch.rotation ?? 0), -45, 45)
            }
          }
        };
      })
    );
    setStatus(text(locale, `Adjusted ${item.label}`, `${localizedName(locale, item.id, item.label)}の位置を調整しました`));
  }

  function resetAccessory(itemId: string) {
    setSave(
      nextSave((currentSave) => {
        const nextPlacements = { ...currentSave.accessoryPlacements };
        delete nextPlacements[itemId];
        return { ...currentSave, accessoryPlacements: nextPlacements };
      })
    );
    setStatus(text(locale, 'Accessory reset', 'おとも位置をリセットしました'));
  }

  function changeDeguTone(nextTone: Partial<DeguTone>) {
    setSave(
      nextSave((currentSave) => ({
        ...currentSave,
        customDeguTone: {
          hue: clamp(nextTone.hue ?? currentSave.customDeguTone.hue, -35, 35),
          saturation: clamp(nextTone.saturation ?? currentSave.customDeguTone.saturation, 70, 135),
          brightness: clamp(nextTone.brightness ?? currentSave.customDeguTone.brightness, 82, 122)
        }
      }))
    );
    setStatus(text(locale, 'Color tuned', '毛色を調整しました'));
  }

  function placeSelectedDecor() {
    if (!isRewardOwned(save.ownedRewardIds, selectedDecor.id)) {
      setStatus(text(locale, `${selectedDecor.label} locked`, `${localizedName(locale, selectedDecor.id, selectedDecor.label)}は未解放です`));
      return;
    }

    const candidate: PlacedDecor = {
      instanceId: `${selectedDecor.id}-${Date.now()}`,
      itemId: selectedDecor.id,
      cellX: selectedCell.x,
      cellY: selectedCell.y,
      footprint: placementDecor.footprint,
      ...(normalizeRotation(rotation) === 0 ? {} : { rotation: normalizeRotation(rotation) })
    };

    if (!canPlaceDecorInScene(grid, save.placedDecor, candidate.cellX, candidate.cellY, placementDecor)) {
      setStatus(text(locale, 'That cell is blocked', 'そのマスには置けません'));
      return;
    }

    setSave(
      nextSave((currentSave) =>
        updateActiveGardenMap(
          {
            ...currentSave,
            economy: {
              ...currentSave.economy,
              incomePerSecond: currentSave.economy.incomePerSecond + selectedDecor.bonusPerSecond
            }
          },
          { placedDecor: [...currentSave.placedDecor, candidate] }
        )
      )
    );
    setStatus(
      text(
        locale,
        `Placed ${selectedDecor.label}${rotation === 0 ? '' : ` ${rotation}deg`}`,
        `${localizedName(locale, selectedDecor.id, selectedDecor.label)}を置きました${rotation === 0 ? '' : ` ${rotation}度`}`
      )
    );
  }

  function rotatePlacement() {
    const nextRotation = (rotation + 90) % 360;
    const orientedDecor = withRotatedFootprint(selectedDecor, nextRotation);
    const nextCell =
      canPlaceDecorInScene(grid, saveRef.current.placedDecor, selectedCell.x, selectedCell.y, orientedDecor)
        ? selectedCell
        : findFirstSceneSafeCell(orientedDecor, saveRef.current.placedDecor);

    setRotation(nextRotation);
    if (nextCell) setSelectedCell(nextCell);
    setStatus(
      text(
        locale,
        `Rotated ${selectedDecor.label} ${nextRotation}deg`,
        `${localizedName(locale, selectedDecor.id, selectedDecor.label)}を${nextRotation}度回転`
      )
    );
  }

  function undoLastPlacedDecor() {
    const lastPlaced = saveRef.current.placedDecor.at(-1);
    if (!lastPlaced) {
      setStatus(text(locale, 'No decor to undo', '戻せる家具がありません'));
      return;
    }

    const optimisticDecor = decorItems.find((item) => item.id === lastPlaced.itemId);
    setSave(
      nextSave((currentSave) => {
        const last = currentSave.placedDecor.at(-1);
        if (!last) return currentSave;
        const decor = decorItems.find((item) => item.id === last.itemId);
        const bonus = decor?.bonusPerSecond ?? 0;

        return updateActiveGardenMap(
          {
            ...currentSave,
            economy: {
              ...currentSave.economy,
              incomePerSecond: Math.max(0, currentSave.economy.incomePerSecond - bonus)
            }
          },
          { placedDecor: currentSave.placedDecor.slice(0, -1) }
        );
      })
    );
    setStatus(
      text(
        locale,
        `Removed ${optimisticDecor?.label ?? 'decor'}`,
        `${optimisticDecor ? localizedName(locale, optimisticDecor.id, optimisticDecor.label) : '家具'}を戻しました`
      )
    );
  }

  function runGacha(count: 1 | 10, banner: GachaBanner = skyGiftBanner) {
    if (gachaBusyRef.current) {
      setStatus(text(locale, 'Gift is opening', 'ギフト演出中です'));
      return;
    }

    const randomValues = Array.from({ length: count }, () => browserRandom());
    const randomFrom = (values: number[]) => {
      let index = 0;
      return () => values[index++] ?? browserRandom();
    };
    const optimistic = runPulls(banner, count, saveRef.current.economy, {
      ownedRewardIds: new Set(saveRef.current.ownedRewardIds),
      pullsSinceRare: saveRef.current.pullsSinceRare,
      random: randomFrom(randomValues)
    });

    setSave(
      nextSave((currentSave) => {
        const result = runPulls(banner, count, currentSave.economy, {
          ownedRewardIds: new Set(currentSave.ownedRewardIds),
          pullsSinceRare: currentSave.pullsSinceRare,
          random: randomFrom(randomValues)
        });

        if (!result) return currentSave;

        const rewardIds = result.results.map((pull) => pull.entry.rewardId);
        return {
          ...currentSave,
          economy: result.economy,
          pullsSinceRare: result.pullsSinceRare,
          ownedRewardIds: Array.from(new Set([...currentSave.ownedRewardIds, ...rewardIds])),
          gachaHistory: [...rewardIds, ...currentSave.gachaHistory].slice(0, 24)
        };
      })
    );
    const label = banner.id.startsWith('premium') ? 'premium gift' : 'sky gift';
    const localizedGiftLabel = banner.id.startsWith('premium') ? 'プレミアムギフト' : '空ギフト';
    setGachaReveal(
      optimistic
        ? {
            id: Date.now(),
            bannerId: banner.id,
            results: optimistic.results
          }
        : null
    );
    if (optimistic) gachaBusyRef.current = true;
    setGachaOpening(Boolean(optimistic));
    setStatus(
      optimistic
        ? text(locale, `${count} ${label}${count === 1 ? '' : 's'} opened`, `${localizedGiftLabel}を${count}回開けました`)
        : text(locale, 'Need earned tickets', 'チケットが足りません')
    );
  }

  function runGuideAction(taskId: GuideTaskId) {
    if (taskId === 'tap') {
      tapDegu();
      return;
    }

    if (taskId === 'care') {
      careForDegu('brush');
      return;
    }

    if (taskId === 'decor') {
      setScreen('placement');
      return;
    }

    const currentStats = deriveGameStats(
      saveRef.current.economy.incomePerSecond,
      saveRef.current.progression
    );
    if (currentStats.claimableTickets > 0) claimEarnedTickets();
    setScreen('gacha');
  }

  function tradeMarketOffer(offerId: string) {
    const offer = marketOffers.find((item) => item.id === offerId);
    if (!offer) return;
    const optimistic = spendCurrency(saveRef.current.economy, 'shards', offer.costShards);

    setSave(
      nextSave((currentSave) => {
        const paid = spendCurrency(currentSave.economy, 'shards', offer.costShards);
        if (!paid) return currentSave;

        return {
          ...currentSave,
          economy: {
            ...paid,
            tickets: paid.tickets + offer.rewardTickets
          }
        };
      })
    );
    setStatus(
      optimistic
        ? text(
            locale,
            `Market trade: +${offer.rewardTickets} ticket${offer.rewardTickets === 1 ? '' : 's'}`,
            `交換: チケット +${offer.rewardTickets}`
          )
        : text(locale, 'Need shards for market', '交換用のかけらが足りません')
    );
  }

  const style = useMemo(
    () =>
      ({
        '--screen-w': current.width,
        '--screen-h': current.height,
        '--theme-swatch': activeTheme.swatch
      }) as React.CSSProperties,
    [activeTheme.swatch, current.height, current.width]
  );

  return (
    <main className="app" data-view={screen} lang={locale}>
      <section className="phone" style={style} aria-label={`AnimalBox ${screenLabel(locale, screen)}`}>
        <img
          className="scene-background"
          src={activeTheme.src}
          alt=""
          draggable={false}
          loading="eager"
          decoding="sync"
          fetchPriority="high"
        />
        <div className="sky-vignette" />

        <Hud
          locale={locale}
          economy={economy}
          stats={gameStats}
          status={status}
          activeTheme={activeTheme}
          missingAssets={missingAssets}
          onToggleLocale={switchLocale}
          onSettings={() => setScreen('storage')}
        />

        <ScreenCue
          locale={locale}
          screen={screen}
          economy={economy}
          stats={gameStats}
          activeTheme={activeTheme}
          selectedDecor={selectedDecor}
          selectedCell={selectedCell}
          selectedAccessory={activeAccessory}
          selectedOutfitCount={selectedOutfitIds.length}
          ownedRewardCount={save.ownedRewardIds.length}
        />

        {(screen === 'home' || screen === 'placement' || screen === 'storage') && (
          <IslandScene
            locale={locale}
            save={save}
            selectedDecor={placementDecor}
            selectedCell={selectedCell}
            placementRotation={rotation}
            placementIsValid={placementCanConfirm}
            screen={screen}
            selectedDeguShotId={save.selectedDeguShotId}
            selectedVariantId={selectedVariantId}
            selectedOutfitIds={selectedOutfitIds}
            accessoryPlacements={save.accessoryPlacements}
            customDeguFilter={customDeguFilter}
            onTapDegu={tapDegu}
            onSelectCell={setSelectedCell}
          />
        )}

        {screen === 'placement' && (
          <PlacementPanel
            locale={locale}
            selectedDecorId={selectedDecorId}
            selectedCell={selectedCell}
            rotation={rotation}
            validCellCount={validPlacementCellCount}
            canConfirm={placementCanConfirm}
            activeMapId={save.activeMapId}
            maps={save.maps}
            level={gameStats.level}
            ownedRewardIds={save.ownedRewardIds}
            onSelectMap={selectMap}
            onSelectDecor={selectDecor}
            onRotate={rotatePlacement}
            onMoveCell={movePlacementCell}
            onConfirm={placeSelectedDecor}
            onCancel={() => setStatus(text(locale, 'Placement cancelled', '配置をキャンセルしました'))}
            onUndo={undoLastPlacedDecor}
            canUndo={save.placedDecor.length > 0}
          />
        )}

        {screen === 'home' && (
          <GameLoopPanel
            locale={locale}
            economy={economy}
            progression={save.progression}
            stats={gameStats}
            nextUpgrade={nextUpgrade}
            guideTasks={guideTasks}
            onBuyUpgrade={buyUpgrade}
            onClaimTickets={claimEarnedTickets}
            onCareAction={careForDegu}
            onGuideAction={runGuideAction}
          />
        )}

        {screen === 'wardrobe' && (
          <WardrobeScreen
            locale={locale}
            selectedVariantId={selectedVariantId}
            selectedDeguShotId={save.selectedDeguShotId}
            selectedOutfitIds={selectedOutfitIds}
            accessoryPlacements={save.accessoryPlacements}
            selectedAccessoryId={selectedAccessoryId}
            customDeguTone={save.customDeguTone}
            ownedRewardIds={save.ownedRewardIds}
            onSelectVariant={selectVariant}
            onSelectDeguShot={selectDeguShot}
            onToggleOutfit={toggleFloatingItem}
            onSelectAccessory={setSelectedAccessoryId}
            onAdjustAccessory={adjustAccessory}
            onResetAccessory={resetAccessory}
            onChangeDeguTone={changeDeguTone}
            onApply={() => {
              setScreen('home');
              setStatus(text(locale, 'Accessories saved', 'おともを保存しました'));
            }}
          />
        )}

        {screen === 'gacha' && (
          <GachaScreen
            locale={locale}
            ownedRewardIds={save.ownedRewardIds}
            history={save.gachaHistory}
            reveal={gachaReveal}
            isOpening={gachaOpening}
            onSingle={() => runGacha(1, skyGiftBanner)}
            onTen={() => runGacha(10, skyGiftBanner)}
            onPremium={() => runGacha(1, premiumSkyGiftBanner)}
          />
        )}

        {screen === 'storage' && (
          <StorageOverlay
            locale={locale}
            save={save}
            activeTheme={activeTheme}
            stats={gameStats}
            ownedRewardIds={save.ownedRewardIds}
            collectionGroups={collectionGroups}
            marketOffers={marketOffers}
            activeMapId={save.activeMapId}
            maps={save.maps}
            selectedBackgroundId={selectedBackgroundId}
            onSelectBackground={selectBackground}
            onSelectMap={selectMap}
            layoutPresets={save.layoutPresets}
            onSaveLayoutPreset={saveLayoutPreset}
            onLoadLayoutPreset={loadLayoutPreset}
            onClearLayoutPreset={clearLayoutPreset}
            onMarketTrade={tradeMarketOffer}
          />
        )}

        {bursts.map((burst) => (
          <span
            key={burst.id}
            className="coin-burst"
            style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
          >
            {burst.label}
          </span>
        ))}

        <NavBar locale={locale} active={screen} onNavigate={(next) => (next === screen && next !== 'home' ? setScreen('home') : setScreen(next))} />
      </section>
    </main>
  );
}

function findFirstSceneSafeCell(decor: DecorItem, placedDecor: PlacedDecor[]): Cell | null {
  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      if (canPlaceDecorInScene(grid, placedDecor, x, y, decor)) {
        return { x, y };
      }
    }
  }

  return null;
}

function findDirectionalSceneSafeCell(
  decor: DecorItem,
  placedDecor: PlacedDecor[],
  from: Cell,
  dx: number,
  dy: number
): Cell | null {
  for (let step = 1; step <= Math.max(grid.width, grid.height); step += 1) {
    const x = from.x + dx * step;
    const y = from.y + dy * step;
    if (x < 0 || y < 0 || x >= grid.width || y >= grid.height) break;
    if (canPlaceDecorInScene(grid, placedDecor, x, y, decor)) return { x, y };
  }

  let best: { cell: Cell; score: number } | null = null;
  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      if (!canPlaceDecorInScene(grid, placedDecor, x, y, decor)) continue;
      const deltaX = x - from.x;
      const deltaY = y - from.y;
      const primary = dx !== 0 ? deltaX * dx : deltaY * dy;
      if (primary <= 0) continue;
      const perpendicular = dx !== 0 ? Math.abs(deltaY) : Math.abs(deltaX);
      const score = perpendicular * 20 + primary;
      if (!best || score < best.score) best = { cell: { x, y }, score };
    }
  }

  return best?.cell ?? null;
}

function clonePlacedDecor(items: PlacedDecor[]): PlacedDecor[] {
  return items.map((item) => ({
    ...item,
    footprint: { ...item.footprint }
  }));
}

function rewardLabel(locale: Locale, rewardId: string): string {
  const fallback = getCatalogItem(rewardId)?.label ?? rewardId;

  return localizedName(locale, rewardId, fallback);
}

function rewardImage(rewardId: string): string {
  return getCatalogItem(rewardId)?.src ?? runtimeAssets.ticket;
}

function animalChoiceBadge(locale: Locale, shot: PixelDeguShot, owned: boolean): string {
  if (!owned) return compactUnlockCost(deguShotUnlockCost(shot.id));
  if (/^\d+$/.test(shot.id)) return shot.id;
  return localizedName(locale, shot.id, shot.label)
    .split(/\s+/)
    .map((part) => part.slice(0, locale === 'ja' ? 4 : 3))
    .join('.');
}

function compactUnlockCost(cost: number): string {
  if (cost < 1000) return formatNumber(cost);
  return `${(cost / 1000).toFixed(1).replace(/\.0$/, '')}k`;
}

function catalogKindLabel(locale: Locale, kind: CatalogKind): string {
  const keyByKind: Record<CatalogKind, keyof typeof collectionLabels.en> = {
    background: 'themes',
    degu_variant: 'colors',
    pose: 'poses',
    animal: 'animals',
    decor: 'decor',
    accessory: 'items'
  };
  return collectionLabels[locale][keyByKind[kind]];
}

function rarityLabel(locale: Locale, rarity: CatalogRarity | 'all'): string {
  if (rarity === 'all') return text(locale, 'All', 'すべて');
  if (rarity === 'special') return text(locale, 'Special', '特別');
  if (rarity === 'rare') return text(locale, 'Rare', 'レア');
  return text(locale, 'Common', '通常');
}

function ownershipLabel(locale: Locale, ownership: CatalogFilterState['ownership']): string {
  if (ownership === 'owned') return text(locale, 'Owned', '所持');
  if (ownership === 'locked') return text(locale, 'Locked', '未所持');
  return text(locale, 'All', 'すべて');
}

function unlockSourceLabel(locale: Locale, item: CatalogItem): string {
  if (item.unlockSource === 'starter') return text(locale, 'Starter', '最初から');
  if (item.unlockSource === 'event') return text(locale, 'Event', 'イベント');
  if (item.unlockSource === 'coin_shop') return text(locale, 'Coin shop', 'コイン交換');
  return text(locale, 'Sky gift', '空ギフト');
}

function catalogDisplayName(locale: Locale, item: CatalogItem): string {
  return localizedName(locale, item.id, item.label);
}

function filterCatalogForUi(
  items: CatalogItem[],
  filter: CatalogFilterState,
  ownedRewardIds: string[],
  locale: Locale
): CatalogItem[] {
  const query = filter.query.trim().toLowerCase();

  return items.filter((item) => {
    if (filter.kind !== 'all' && item.kind !== filter.kind) return false;
    if (filter.rarity !== 'all' && item.rarity !== filter.rarity) return false;
    const owned = isRewardOwned(ownedRewardIds, item.id);
    if (filter.ownership === 'owned' && !owned) return false;
    if (filter.ownership === 'locked' && owned) return false;
    if (!query) return true;

    return `${item.id} ${item.label} ${catalogDisplayName(locale, item)}`.toLowerCase().includes(query);
  });
}

function getScreenCue({
  locale,
  screen,
  economy,
  stats,
  activeTheme,
  selectedDecor,
  selectedCell,
  selectedAccessory,
  selectedOutfitCount,
  ownedRewardCount
}: {
  locale: Locale;
  screen: ScreenId;
  economy: EconomyState;
  stats: GameStats;
  activeTheme: BackgroundTheme;
  selectedDecor: DecorItem;
  selectedCell: Cell;
  selectedAccessory?: FloatingItem;
  selectedOutfitCount: number;
  ownedRewardCount: number;
}): ScreenCueContent {
  if (screen === 'placement') {
    return {
      title: screenLabel(locale, 'placement'),
      detail: text(locale, `Place ${selectedDecor.label}`, `${localizedName(locale, selectedDecor.id, selectedDecor.label)}を配置`),
      meta: text(locale, `Cell ${selectedCell.x + 1}-${selectedCell.y + 1}`, `マス ${selectedCell.x + 1}-${selectedCell.y + 1}`),
      action: 'place-decor'
    };
  }

  if (screen === 'wardrobe') {
    return {
      title: screenLabel(locale, 'wardrobe'),
      detail: selectedAccessory ? text(locale, 'Tune item', '位置を調整') : text(locale, 'Pick animal', 'どうぶつを選ぶ'),
      meta: text(locale, `${selectedOutfitCount} active`, `${selectedOutfitCount}個つけてる`),
      action: 'style-animal'
    };
  }

  if (screen === 'gacha') {
    return {
      title: screenLabel(locale, 'gacha'),
      detail: text(locale, 'Use earned tickets', 'チケットで開ける'),
      meta: text(locale, `${formatHudNumber(economy.tickets)} tickets`, `${formatHudNumber(economy.tickets)}枚`),
      action: 'open-gift'
    };
  }

  if (screen === 'storage') {
    return {
      title: screenLabel(locale, 'storage'),
      detail: localizedName(locale, activeTheme.id, activeTheme.label),
      meta: text(locale, `${ownedRewardCount} rewards`, `${ownedRewardCount}個所持`),
      action: 'save-layout'
    };
  }

  return {
    title: screenLabel(locale, 'home'),
    detail: text(locale, 'Tap, feed, claim', 'タップ・お世話・受け取り'),
    meta: `Lv ${stats.level} +${formatHudNumber(stats.idleIncomePerSecond)}/s`,
    action: 'care-loop'
  };
}

function ScreenCue({
  locale,
  screen,
  economy,
  stats,
  activeTheme,
  selectedDecor,
  selectedCell,
  selectedAccessory,
  selectedOutfitCount,
  ownedRewardCount
}: {
  locale: Locale;
  screen: ScreenId;
  economy: EconomyState;
  stats: GameStats;
  activeTheme: BackgroundTheme;
  selectedDecor: DecorItem;
  selectedCell: Cell;
  selectedAccessory?: FloatingItem;
  selectedOutfitCount: number;
  ownedRewardCount: number;
}) {
  const cue = getScreenCue({
    locale,
    screen,
    economy,
    stats,
    activeTheme,
    selectedDecor,
    selectedCell,
    selectedAccessory,
    selectedOutfitCount,
    ownedRewardCount
  });

  return (
    <aside
      className="screen-cue"
      data-screen={screen}
      data-next-action={cue.action}
      aria-label={`${cue.title}: ${cue.detail}`}
    >
      <div>
        <strong data-cue-title>{cue.title}</strong>
        <span data-cue-detail>{cue.detail}</span>
      </div>
      <small>{cue.meta}</small>
    </aside>
  );
}

function Hud({
  locale,
  economy,
  stats,
  status,
  activeTheme,
  missingAssets,
  onToggleLocale,
  onSettings
}: {
  locale: Locale;
  economy: EconomyState;
  stats: GameStats;
  status: string;
  activeTheme: BackgroundTheme;
  missingAssets: string[];
  onToggleLocale: () => void;
  onSettings: () => void;
}) {
  return (
    <header className="hud">
      <div className="resource coin-resource">
        <img src={runtimeAssets.coin} alt="" />
        <strong>{formatHudNumber(economy.coins)}</strong>
        <span>+{stats.idleIncomePerSecond}/s</span>
      </div>
      <div className="resource ticket-resource">
        <img src={runtimeAssets.ticket} alt="" />
        <strong>{formatHudNumber(economy.tickets)}</strong>
      </div>
      <div className="resource shard-resource">
        <img src={runtimeAssets.shard} alt="" />
        <strong>{formatHudNumber(economy.shards)}</strong>
      </div>
      <div className="theme-chip" aria-label={text(locale, `Current theme ${activeTheme.label}`, `現在の背景 ${localizedName(locale, activeTheme.id, activeTheme.label)}`)}>
        <span style={{ backgroundColor: activeTheme.swatch }} />
      </div>
      <button
        className="round-button locale-button"
        type="button"
        aria-label={text(locale, 'Switch language', '言語を切り替え')}
        onClick={onToggleLocale}
      >
        {locale === 'ja' ? 'JP' : 'EN'}
      </button>
      <button className="round-button" type="button" aria-label={text(locale, 'Settings', '設定')} onClick={onSettings}>
        ...
      </button>
      <div className="sr-only" role="status">
        {status}. {missingAssets.length > 0 ? text(locale, `${missingAssets.length} assets failed to load.`, `${missingAssets.length}個の素材が読み込めません。`) : text(locale, 'All runtime assets loaded.', 'すべての素材を読み込みました。')}
      </div>
    </header>
  );
}

function formatHudNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}k`;
  return formatNumber(value);
}

function GameLoopPanel({
  locale,
  economy,
  progression,
  stats,
  nextUpgrade,
  guideTasks,
  onBuyUpgrade,
  onClaimTickets,
  onCareAction,
  onGuideAction
}: {
  locale: Locale;
  economy: EconomyState;
  progression: ProgressionState;
  stats: GameStats;
  nextUpgrade: UpgradeDefinition | null;
  guideTasks: GuideTask[];
  onBuyUpgrade: (id: string) => void;
  onClaimTickets: () => void;
  onCareAction: (id: CareActionId) => void;
  onGuideAction: (id: GuideTaskId) => void;
}) {
  const xpPct = Math.min(100, Math.round((stats.xpIntoLevel / stats.xpForNextLevel) * 100));
  const ticketPct = Math.min(
    100,
    Math.round(((progression.ticketProgress % stats.ticketGoal) / stats.ticketGoal) * 100)
  );
  const affectionPct = Math.min(
    100,
    Math.round((stats.affectionIntoLevel / stats.affectionForNextLevel) * 100)
  );
  const claimLabel = stats.claimableTickets > 0
    ? text(locale, `Claim x${stats.claimableTickets}`, `受取 x${stats.claimableTickets}`)
    : text(locale, 'Charging', 'ため中');
  const careIcons: Record<CareActionId, string> = {
    brush: runtimeAssets.careBrush,
    snack: runtimeAssets.seedPouch
  };
  const currentGuideId = guideTasks.find((task) => !task.done)?.id ?? guideTasks[0]?.id;

  return (
    <section className="game-loop-panel" aria-label={text(locale, 'Progression', '進行')}>
      <div className="dock-summary">
        <div className="loop-head">
          <div>
            <strong>Lv {stats.level}</strong>
            <span>{stats.xpIntoLevel}/{stats.xpForNextLevel}</span>
          </div>
          <div>
            <strong>{text(locale, `Tap +${stats.tapPower}`, `タップ +${stats.tapPower}`)}</strong>
            <span>{text(locale, `${upgradeCatalog.length - progression.ownedUpgradeIds.length} upgrades`, `強化あと${upgradeCatalog.length - progression.ownedUpgradeIds.length}`)}</span>
          </div>
        </div>
        <div className="meter-row">
          <span className="meter-track" aria-label={text(locale, 'XP progress', '経験値')}>
            <span style={{ width: `${xpPct}%` }} />
          </span>
          <span className="meter-track ticket-meter" aria-label={text(locale, 'Ticket progress', 'チケット進行')}>
            <span style={{ width: `${ticketPct}%` }} />
          </span>
        </div>
      </div>
      <div className="guide-rail" aria-label={text(locale, 'Next action guide', '次の行動')}>
        {guideTasks.map((task) => (
          <button
            key={task.id}
            className="guide-task"
            type="button"
            data-current={task.id === currentGuideId}
            data-done={task.done}
            data-ready={task.ready}
            onClick={() => onGuideAction(task.id)}
            aria-label={`${task.label}: ${task.action}`}
          >
            <span>{task.label}</span>
            <strong>{task.value}</strong>
            <small>{task.done ? text(locale, 'Done', '完了') : task.action}</small>
          </button>
        ))}
      </div>
      <div className="dock-action-grid">
        <div className="care-row" aria-label={text(locale, 'Care actions', 'お世話')}>
          <div className="care-meter">
            <span>{text(locale, `Bond ${stats.affectionLevel}`, `なかよし ${stats.affectionLevel}`)}</span>
            <span className="meter-track affection-meter" aria-label={text(locale, 'Bond progress', 'なかよし進行')}>
              <span style={{ width: `${affectionPct}%` }} />
            </span>
          </div>
          {careActions.map((action) => (
            <button
              key={action.id}
              className="care-button"
              type="button"
              onClick={() => onCareAction(action.id)}
              aria-label={text(locale, `${action.label} degu`, `デグーに${action.label}`)}
            >
              <img src={careIcons[action.id]} alt="" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
        <div className="loop-actions">
          <button
            className="claim-button"
            type="button"
            data-ready={stats.claimableTickets > 0}
            disabled={stats.claimableTickets <= 0}
            onClick={onClaimTickets}
            aria-label={text(locale, 'Claim earned tickets', 'チケットを受け取る')}
          >
            <img src={runtimeAssets.ticket} alt="" />
            {claimLabel}
          </button>
          {nextUpgrade ? (
            <button
              className="next-upgrade-button"
              type="button"
              data-affordable={economy[nextUpgrade.cost.currency] >= nextUpgrade.cost.amount}
              onClick={() => onBuyUpgrade(nextUpgrade.id)}
              aria-label={text(locale, `Buy ${nextUpgrade.label}`, `${nextUpgrade.label}を買う`)}
            >
              <span>{nextUpgrade.label}</span>
              <strong>
                {text(locale, nextUpgrade.cost.currency === 'shards' ? 'Shards' : 'Coins', nextUpgrade.cost.currency === 'shards' ? 'かけら' : 'コイン')} {formatNumber(nextUpgrade.cost.amount)}
              </strong>
            </button>
          ) : (
            <button className="next-upgrade-button" type="button" disabled>
              <span>{text(locale, 'Upgrades', '強化')}</span>
              <strong>{text(locale, 'Complete', '完了')}</strong>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function IslandScene({
  locale,
  save,
  selectedDecor,
  selectedCell,
  placementRotation,
  placementIsValid,
  screen,
  selectedDeguShotId,
  selectedVariantId,
  selectedOutfitIds,
  accessoryPlacements,
  customDeguFilter,
  onTapDegu,
  onSelectCell
}: {
  locale: Locale;
  save: PrototypeSave;
  selectedDecor: DecorItem;
  selectedCell: Cell;
  placementRotation: number;
  placementIsValid: boolean;
  screen: ScreenId;
  selectedDeguShotId: string;
  selectedVariantId: string;
  selectedOutfitIds: string[];
  accessoryPlacements: Record<string, AccessoryPlacement>;
  customDeguFilter: string;
  onTapDegu: () => void;
  onSelectCell: (cell: Cell) => void;
}) {
  const ghost = gridToScene(selectedCell, selectedDecor);

  return (
    <div className="island-layer" data-screen={screen}>
      <div className="fixed-island-floor" aria-hidden="true" />
      {save.placedDecor.map((placed) => {
        const decor = decorItems.find((item) => item.id === placed.itemId);
        if (!decor) return null;
        const placedRotation = normalizeRotation(placed.rotation);
        const orientedDecor = withRotatedFootprint(decor, placedRotation);
        const scene = gridToScene({ x: placed.cellX, y: placed.cellY }, orientedDecor);
        return (
          <img
            key={placed.instanceId}
            className="runtime-decor placed-decor"
            data-decor-id={decor.id}
            data-cell-x={placed.cellX}
            data-cell-y={placed.cellY}
            src={decor.src}
            alt=""
            draggable={false}
            style={
              {
                ...assetStyle(scene.x, scene.y, scene.w),
                '--decor-rotation': `${placedRotation}deg`,
                zIndex: 20 + placed.cellY + orientedDecor.footprint.h
              } as React.CSSProperties
            }
          />
        );
      })}

      {screen === 'placement' && (
        <div className="placement-grid" aria-label={text(locale, 'Placement cells', '配置マス')}>
          <div className="placement-grid-mesh" aria-hidden="true">
            {meshLines.map((line) => (
              <span
                key={line.id}
                className="grid-mesh-line"
                data-kind={line.kind}
                style={
                  {
                    left: `${line.x1}%`,
                    top: `${line.y1}%`,
                    width: `${line.length}%`,
                    '--mesh-angle': `${line.angle}deg`
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
          {Array.from({ length: grid.width * grid.height }).map((_, index) => {
            const x = index % grid.width;
            const y = Math.floor(index / grid.width);
            const anchor = gridCellAnchor({ x, y });
            const valid = canPlaceDecorInScene(grid, save.placedDecor, x, y, selectedDecor);
            if (!valid) return null;

            return (
              <button
                key={`${x}:${y}`}
                className="cell-button"
                type="button"
                data-selected={x === selectedCell.x && y === selectedCell.y}
                data-valid="true"
                data-cell-x={x}
                data-cell-y={y}
                style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
                aria-label={text(locale, `Select cell ${x + 1}, ${y + 1}`, `マス ${x + 1}, ${y + 1}`)}
                onClick={() => {
                  onSelectCell({ x, y });
                }}
              />
            );
          })}
          {Array.from({ length: selectedDecor.footprint.w * selectedDecor.footprint.h }).map((_, index) => {
            const x = selectedCell.x + (index % selectedDecor.footprint.w);
            const y = selectedCell.y + Math.floor(index / selectedDecor.footprint.w);
            if (x >= grid.width || y >= grid.height) return null;

            const anchor = gridCellAnchor({ x, y });
            return (
              <span
                key={`footprint-${x}:${y}`}
                className="footprint-cell"
                data-valid={placementIsValid}
                style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
              />
            );
          })}
          <img
            className="runtime-decor placement-ghost"
            data-decor-id={selectedDecor.id}
            data-cell-x={selectedCell.x}
            data-cell-y={selectedCell.y}
            data-valid={placementIsValid}
            src={selectedDecor.src}
            alt=""
            draggable={false}
            style={
              {
                ...assetStyle(ghost.x, ghost.y, ghost.w),
                '--decor-rotation': `${normalizeRotation(placementRotation)}deg`
              } as React.CSSProperties
            }
          />
        </div>
      )}

      <button className="degu-button" type="button" aria-label={text(locale, 'Tap degu for coins', 'デグーをタップしてコイン')} onClick={onTapDegu}>
        <PixelDeguStage
          mode="island"
          selectedShotId={selectedDeguShotId}
          selectedVariantId={selectedVariantId}
          selectedOutfitIds={selectedOutfitIds}
          accessoryPlacements={accessoryPlacements}
          customFilter={customDeguFilter}
        />
      </button>
    </div>
  );
}

function PlacementNudge({
  locale,
  selectedCell,
  onMoveCell
}: {
  locale: Locale;
  selectedCell: Cell;
  onMoveCell: (dx: number, dy: number) => void;
}) {
  return (
    <div className="placement-nudge" aria-label={text(locale, 'Move selected cell', '選択マスを移動')}>
      <button type="button" className="nudge-button up" onClick={() => onMoveCell(0, -1)} aria-label={text(locale, 'Move up', '上へ移動')}>
        ↑
      </button>
      <button type="button" className="nudge-button left" onClick={() => onMoveCell(-1, 0)} aria-label={text(locale, 'Move left', '左へ移動')}>
        ←
      </button>
      <span className="nudge-readout" aria-hidden="true">
        {selectedCell.x + 1}-{selectedCell.y + 1}
      </span>
      <button type="button" className="nudge-button right" onClick={() => onMoveCell(1, 0)} aria-label={text(locale, 'Move right', '右へ移動')}>
        →
      </button>
      <button type="button" className="nudge-button down" onClick={() => onMoveCell(0, 1)} aria-label={text(locale, 'Move down', '下へ移動')}>
        ↓
      </button>
    </div>
  );
}

function MapSwitcher({
  locale,
  activeMapId,
  maps,
  level,
  onSelectMap
}: {
  locale: Locale;
  activeMapId: GardenMapId;
  maps: GardenMapState[];
  level: number;
  onSelectMap: (id: GardenMapId) => void;
}) {
  return (
    <div className="map-switcher" aria-label={text(locale, 'Garden maps', '庭MAP')}>
      {gardenMapCatalog.map((definition) => {
        const map = maps.find((item) => item.id === definition.id);
        const unlocked = isGardenMapUnlocked(level, definition);
        const decorCount = map?.placedDecor.length ?? 0;

        return (
          <button
            key={definition.id}
            className="map-chip"
            type="button"
            data-active={activeMapId === definition.id}
            data-locked={!unlocked}
            disabled={!unlocked}
            onClick={() => onSelectMap(definition.id)}
            aria-label={
              unlocked
                ? text(locale, `Switch to ${definition.label}`, `${mapLabel(locale, definition)}へ切替`)
                : text(locale, `${definition.label} unlocks at level ${definition.unlockLevel}`, `${mapLabel(locale, definition)}はLv${definition.unlockLevel}で解放`)
            }
          >
            <strong>{mapLabel(locale, definition)}</strong>
            <span>{unlocked ? text(locale, `${decorCount} decor`, `${decorCount}個`) : `Lv ${definition.unlockLevel}`}</span>
            <small>{mapDetail(locale, definition)}</small>
          </button>
        );
      })}
    </div>
  );
}

function PlacementPanel({
  locale,
  selectedDecorId,
  selectedCell,
  rotation,
  validCellCount,
  canConfirm,
  canUndo,
  activeMapId,
  maps,
  level,
  ownedRewardIds,
  onSelectMap,
  onSelectDecor,
  onRotate,
  onMoveCell,
  onConfirm,
  onCancel,
  onUndo
}: {
  locale: Locale;
  selectedDecorId: string;
  selectedCell: Cell;
  rotation: number;
  validCellCount: number;
  canConfirm: boolean;
  canUndo: boolean;
  activeMapId: GardenMapId;
  maps: GardenMapState[];
  level: number;
  ownedRewardIds: string[];
  onSelectMap: (id: GardenMapId) => void;
  onSelectDecor: (id: string) => void;
  onRotate: () => void;
  onMoveCell: (dx: number, dy: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onUndo: () => void;
}) {
  const selectedDecor = decorItems.find((decor) => decor.id === selectedDecorId) ?? decorItems[0];
  const selectedMapDefinition = gardenMapCatalog.find((map) => map.id === activeMapId) ?? gardenMapCatalog[0];
  const ownedDecorCount = decorItems.filter((decor) => isRewardOwned(ownedRewardIds, decor.id)).length;

  return (
    <section className="placement-edit-layer" aria-label={text(locale, 'Decor placement', '家具配置')}>
      <div className="placement-selected-card placement-floating-status">
        <div className="placement-selected-art" aria-hidden="true">
          <img src={selectedDecor.src} alt="" draggable={false} />
        </div>
        <div className="placement-selected-copy">
          <span className="placement-eyebrow">{text(locale, 'Now placing', '配置中')}</span>
          <div className="mode-row">
            <strong>{localizedName(locale, selectedDecor.id, selectedDecor.label)}</strong>
            <span>{text(locale, `${selectedDecor.footprint.w}x${selectedDecor.footprint.h}`, `${selectedDecor.footprint.w}x${selectedDecor.footprint.h}`)}</span>
          </div>
          <div className="placement-meta-row">
            <span>{mapLabel(locale, selectedMapDefinition)}</span>
            <span>{text(locale, `Cell ${selectedCell.x + 1}-${selectedCell.y + 1}`, `マス ${selectedCell.x + 1}-${selectedCell.y + 1}`)}</span>
            <span>{text(locale, `${validCellCount} spots`, `空き${validCellCount}`)}</span>
          </div>
        </div>
      </div>

      <div className="placement-command-stack">
        <PlacementNudge locale={locale} selectedCell={selectedCell} onMoveCell={onMoveCell} />
      </div>

      <section className="bottom-sheet placement-sheet" aria-label={text(locale, 'Placement tools', '配置ツール')}>
        <div className="sheet-handle" />
        <div className="placement-control-row">
          <div className="placement-map-strip">
            <div className="placement-section-label">
              <strong>{text(locale, 'Map', 'マップ')}</strong>
              <span>{mapDetail(locale, selectedMapDefinition)}</span>
            </div>
            <MapSwitcher
              locale={locale}
              activeMapId={activeMapId}
              maps={maps}
              level={level}
              onSelectMap={onSelectMap}
            />
          </div>
          <div className="placement-action-stack">
            <button
              className="action confirm placement-primary-action"
              type="button"
              disabled={!canConfirm}
              onClick={onConfirm}
              aria-label={canConfirm ? text(locale, 'Confirm placement', '配置を確定') : text(locale, 'No valid placement spot', '置ける場所がありません')}
            >
              <span>{canConfirm ? text(locale, 'Place', '置く') : text(locale, 'No spot', '空きなし')}</span>
              <small>{text(locale, `Cell ${selectedCell.x + 1}-${selectedCell.y + 1}`, `マス ${selectedCell.x + 1}-${selectedCell.y + 1}`)}</small>
            </button>
            <div className="action-row placement-secondary-actions">
              <button className="action danger" type="button" onClick={onCancel} aria-label={text(locale, 'Cancel placement', '配置をやめる')}>
                {text(locale, 'Cancel', '閉じる')}
              </button>
              <button
                className="action undo"
                type="button"
                disabled={!canUndo}
                onClick={onUndo}
                aria-label={canUndo ? text(locale, 'Undo last decor', '最後の家具を戻す') : text(locale, 'No decor to undo', '戻せる家具がありません')}
              >
                {text(locale, 'Undo', '戻す')}
              </button>
              <button className="action rotate" type="button" onClick={onRotate} aria-label={text(locale, 'Rotate placement', '家具を回転')}>
                {text(locale, 'Turn', '回転')}
              </button>
            </div>
          </div>
        </div>
        <div className="placement-decor-row">
          <div className="placement-section-label">
            <strong>{text(locale, 'Decor', '家具')}</strong>
            <span>{text(locale, `${ownedDecorCount}/${decorItems.length} owned`, `${ownedDecorCount}/${decorItems.length}個`)}</span>
          </div>
          <div className="decor-tray">
            {decorItems.map((decor) => {
              const owned = isRewardOwned(ownedRewardIds, decor.id);
              return (
                <button
                  key={decor.id}
                  className="asset-card"
                  type="button"
                  data-active={selectedDecorId === decor.id}
                  data-locked={!owned}
                  aria-label={text(locale, `${owned ? 'Select' : 'Locked'} ${decor.label}`, `${owned ? '選択' : '未解放'} ${localizedName(locale, decor.id, decor.label)}`)}
                  onClick={() => onSelectDecor(decor.id)}
                >
                  <img src={decor.src} alt="" draggable={false} />
                  <strong>{localizedName(locale, decor.id, decor.label)}</strong>
                  <span>{owned ? `+${decor.bonusPerSecond}/s` : text(locale, 'Locked', '未解放')}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </section>
  );
}

function WardrobeScreen({
  locale,
  selectedVariantId,
  selectedDeguShotId,
  selectedOutfitIds,
  accessoryPlacements,
  selectedAccessoryId,
  customDeguTone,
  ownedRewardIds,
  onSelectVariant,
  onSelectDeguShot,
  onToggleOutfit,
  onSelectAccessory,
  onAdjustAccessory,
  onResetAccessory,
  onChangeDeguTone,
  onApply
}: {
  locale: Locale;
  selectedVariantId: string;
  selectedDeguShotId: string;
  selectedOutfitIds: string[];
  accessoryPlacements: Record<string, AccessoryPlacement>;
  selectedAccessoryId: string;
  customDeguTone: DeguTone;
  ownedRewardIds: string[];
  onSelectVariant: (id: string) => void;
  onSelectDeguShot: (id: string) => void;
  onToggleOutfit: (id: string) => void;
  onSelectAccessory: (id: string) => void;
  onAdjustAccessory: (id: string, patch: Partial<AccessoryPlacement>) => void;
  onResetAccessory: (id: string) => void;
  onChangeDeguTone: (tone: Partial<DeguTone>) => void;
  onApply: () => void;
}) {
  const [wardrobeQuery, setWardrobeQuery] = useState('');
  const [wardrobeRarity, setWardrobeRarity] = useState<CatalogRarity | 'all'>('all');
  const [wardrobeOwnership, setWardrobeOwnership] = useState<CatalogFilterState['ownership']>('all');
  const selectedAccessory =
    accessoryItems.find((item) => selectedOutfitIds.includes(item.id) && item.id === selectedAccessoryId) ??
    accessoryItems.find((item) => selectedOutfitIds.includes(item.id));
  const customFilter = deguToneFilter(
    customDeguTone,
    deguVariants.find((item) => item.id === selectedVariantId)?.filter ?? deguVariants[0].filter
  );
  const visibleWardrobeItems = useMemo(
    () =>
      filterCatalogForUi(
        catalogItems,
        { query: wardrobeQuery, kind: 'accessory', rarity: wardrobeRarity, ownership: wardrobeOwnership },
        ownedRewardIds,
        locale
      ),
    [locale, ownedRewardIds, wardrobeOwnership, wardrobeQuery, wardrobeRarity]
  );

  return (
    <section className="wardrobe-screen" aria-label={text(locale, 'Floating companions', 'どうぶつとおとも')}>
      <PixelDeguStage
        mode="wardrobe"
        selectedShotId={selectedDeguShotId}
        selectedVariantId={selectedVariantId}
        selectedOutfitIds={selectedOutfitIds}
        accessoryPlacements={accessoryPlacements}
        customFilter={customFilter}
      />
      <div className="shot-row" aria-label={text(locale, 'Animal choices', 'どうぶつ選択')}>
        {pixelDeguShots.map((shot) => {
          const owned = isRewardOwned(ownedRewardIds, shot.id);
          return (
            <button
              key={shot.id}
              className="shot-button"
              type="button"
              data-active={shot.id === selectedDeguShotId}
              data-locked={!owned}
              onClick={() => onSelectDeguShot(shot.id)}
              aria-label={text(locale, `${owned ? 'Select' : 'Unlock'} animal ${shot.label}`, `${owned ? '選択' : '解放'} ${localizedName(locale, shot.id, shot.label)}`)}
            >
              <img src={shot.src} alt="" draggable={false} />
              <span>{animalChoiceBadge(locale, shot, owned)}</span>
            </button>
          );
        })}
      </div>
      <div className="variant-row">
        {deguVariants.map((variant) => {
          const owned = isRewardOwned(ownedRewardIds, variant.id);
          return (
            <button
              key={variant.id}
              className="variant-button"
              type="button"
              style={{ '--swatch': variant.swatch } as React.CSSProperties}
              data-active={variant.id === selectedVariantId}
              data-locked={!owned}
              onClick={() => onSelectVariant(variant.id)}
              aria-label={text(locale, `${owned ? 'Select' : 'Locked'} ${variant.label}`, `${owned ? '選択' : '未解放'} ${localizedName(locale, variant.id, variant.label)}`)}
            />
          );
        })}
      </div>
      <div className="tone-panel" aria-label={text(locale, 'Degu color tuning', '毛色調整')}>
        <label>
          H
          <input
            type="range"
            min="-35"
            max="35"
            value={customDeguTone.hue}
            onChange={(event) => onChangeDeguTone({ hue: Number(event.currentTarget.value) })}
          />
        </label>
        <label>
          S
          <input
            type="range"
            min="70"
            max="135"
            value={customDeguTone.saturation}
            onChange={(event) => onChangeDeguTone({ saturation: Number(event.currentTarget.value) })}
          />
        </label>
        <label>
          B
          <input
            type="range"
            min="82"
            max="122"
            value={customDeguTone.brightness}
            onChange={(event) => onChangeDeguTone({ brightness: Number(event.currentTarget.value) })}
          />
        </label>
      </div>
      <div className="accessory-tune-panel" aria-label={text(locale, 'Accessory position tools', 'おとも位置調整')} data-empty={!selectedAccessory}>
        <strong>{selectedAccessory ? localizedName(locale, selectedAccessory.id, selectedAccessory.label) : text(locale, 'Select item', 'おともを選択')}</strong>
        <div className="accessory-tool-grid">
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { y: -2 })} aria-label={text(locale, 'Move accessory up', 'おともを上へ')}>↑</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { y: 2 })} aria-label={text(locale, 'Move accessory down', 'おともを下へ')}>↓</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { x: -2 })} aria-label={text(locale, 'Move accessory left', 'おともを左へ')}>←</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { x: 2 })} aria-label={text(locale, 'Move accessory right', 'おともを右へ')}>→</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { scale: 0.08 })} aria-label={text(locale, 'Scale accessory up', 'おともを大きく')}>+</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { scale: -0.08 })} aria-label={text(locale, 'Scale accessory down', 'おともを小さく')}>-</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { rotation: -5 })} aria-label={text(locale, 'Rotate accessory left', 'おともを左回転')}>↺</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { rotation: 5 })} aria-label={text(locale, 'Rotate accessory right', 'おともを右回転')}>↻</button>
        </div>
        <button className="accessory-reset" type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onResetAccessory(selectedAccessory.id)} aria-label={text(locale, 'Reset accessory position', 'おとも位置をリセット')}>
          {text(locale, 'reset', 'リセット')}
        </button>
      </div>
      <div className="wardrobe-filter-panel" aria-label={text(locale, 'Wardrobe filters', 'おとも検索')}>
        <input
          type="search"
          value={wardrobeQuery}
          onChange={(event) => setWardrobeQuery(event.currentTarget.value)}
          placeholder={text(locale, 'Search', '検索')}
          aria-label={text(locale, 'Search wardrobe items', 'おとも検索')}
        />
        <div className="wardrobe-chip-row">
          {(['all', 'rare', 'special'] as Array<CatalogRarity | 'all'>).map((rarity) => (
            <button
              key={rarity}
              type="button"
              data-active={wardrobeRarity === rarity}
              onClick={() => setWardrobeRarity(rarity)}
            >
              {rarityLabel(locale, rarity)}
            </button>
          ))}
          {(['all', 'owned', 'locked'] as CatalogFilterState['ownership'][]).map((ownership) => (
            <button
              key={ownership}
              type="button"
              data-active={wardrobeOwnership === ownership}
              onClick={() => setWardrobeOwnership(ownership)}
            >
              {ownershipLabel(locale, ownership)}
            </button>
          ))}
        </div>
      </div>
      <div className="wardrobe-grid">
        {visibleWardrobeItems.map((item) => {
          const owned = isRewardOwned(ownedRewardIds, item.id);
          return (
            <button
              key={item.id}
              className="asset-card outfit-card-ui"
              type="button"
              data-active={selectedOutfitIds.includes(item.id)}
              data-selected={selectedAccessoryId === item.id}
              data-locked={!owned}
              onClick={() => {
                onSelectAccessory(item.id);
                onToggleOutfit(item.id);
              }}
              aria-label={text(locale, `${owned ? 'Toggle' : 'Locked'} ${item.label}`, `${owned ? '切替' : '未解放'} ${localizedName(locale, item.id, item.label)}`)}
            >
              <img src={item.src} alt="" draggable={false} loading="lazy" />
              <small>{rarityLabel(locale, item.rarity)}</small>
              {!owned && <span>{text(locale, 'Locked', '未解放')}</span>}
            </button>
          );
        })}
        {visibleWardrobeItems.length === 0 && <span className="wardrobe-empty">{text(locale, 'No matches', '一致なし')}</span>}
      </div>
      <button className="apply-button" type="button" onClick={onApply} aria-label={text(locale, 'Apply accessories', 'おともを反映')}>
        {text(locale, 'Apply', '決定')}
      </button>
    </section>
  );
}

function GachaScreen({
  locale,
  ownedRewardIds,
  history,
  reveal,
  isOpening,
  onSingle,
  onTen,
  onPremium
}: {
  locale: Locale;
  ownedRewardIds: string[];
  history: string[];
  reveal: GachaReveal | null;
  isOpening: boolean;
  onSingle: () => void;
  onTen: () => void;
  onPremium: () => void;
}) {
  const rewards = Array.from(
    new Set([
      ...starterRewardIds,
      ...skyGiftBanner.entries.map((entry) => entry.rewardId),
      ...premiumSkyGiftBanner.entries.map((entry) => entry.rewardId)
    ])
  )
    .map((id) => getCatalogItem(id))
    .filter((item): item is CatalogItem => Boolean(item));
  const rewardPreview = (['special', 'rare', 'common'] as CatalogRarity[]).flatMap((rarity) =>
    rewards.filter((reward) => reward.rarity === rarity).slice(0, 18)
  );
  const hiddenRewardCount = Math.max(0, rewards.length - rewardPreview.length);
  const historySummary = history.slice(0, 3).map((id) => rewardLabel(locale, id)).join(', ');

  return (
    <section className="gacha-screen" aria-label={text(locale, 'Free sky gift', '無料の空ギフト')} data-opening={isOpening} data-has-reveal={Boolean(reveal)}>
      <img className="gacha-machine" src={runtimeAssets.skyGiftMachine} alt="" draggable={false} />
      <p className="free-label" aria-live="polite">
        {isOpening ? text(locale, 'Opening sky gift...', 'ギフトを開けています...') : text(locale, 'Earned tickets only', 'チケットだけで開ける')}
      </p>
      <div className="pull-row">
        <button
          className="pull-button single"
          type="button"
          disabled={isOpening}
          onClick={onSingle}
          aria-label={text(locale, 'Open one sky gift', '空ギフトを1回開ける')}
        >
          <img src={runtimeAssets.ticket} alt="" />
          <span>1</span>
        </button>
        <button
          className="pull-button ten"
          type="button"
          disabled={isOpening}
          onClick={onTen}
          aria-label={text(locale, 'Open ten sky gifts', '空ギフトを10回開ける')}
        >
          <img src={runtimeAssets.ticket} alt="" />
          <span>10</span>
        </button>
        <button
          className="pull-button premium"
          type="button"
          disabled={isOpening}
          onClick={onPremium}
          aria-label={text(locale, 'Open premium sky gift', 'プレミアム空ギフトを開ける')}
        >
          <img src={runtimeAssets.ticket} alt="" />
          <span>5</span>
          <small>{text(locale, 'rare+', 'レア+')}</small>
        </button>
      </div>
      {reveal && (
        <div key={reveal.id} className="gacha-reveal" data-banner={reveal.bannerId} aria-label={text(locale, 'Sky gift results', '空ギフト結果')}>
          {reveal.results.slice(0, 4).map((pull, index) => (
            <div
              key={`${pull.entry.rewardId}-${index}`}
              className="gacha-result-card"
              data-rarity={pull.entry.rarity}
              data-duplicate={pull.duplicate}
            >
              <img src={rewardImage(pull.entry.rewardId)} alt="" draggable={false} />
              <span>{rewardLabel(locale, pull.entry.rewardId)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="reward-strip">
        {rewardPreview.map((reward) => {
          const owned = isRewardOwned(ownedRewardIds, reward.id);

          return (
            <div
              key={reward.id}
              className="reward-card"
              role="img"
              data-owned={owned}
              data-rarity={reward.rarity}
              aria-label={text(locale, `${owned ? 'Owned' : 'Locked'} ${reward.label}`, `${owned ? '所持' : '未所持'} ${catalogDisplayName(locale, reward)}`)}
            >
              <img src={reward.src} alt="" draggable={false} loading="lazy" />
              <span>{rarityLabel(locale, reward.rarity)}</span>
            </div>
          );
        })}
        {hiddenRewardCount > 0 && (
          <div className="reward-more-card" aria-label={text(locale, `${hiddenRewardCount} more rewards`, `ほか${hiddenRewardCount}件`)}>
            <strong>+{hiddenRewardCount}</strong>
            <span>{text(locale, 'more', 'ほか')}</span>
          </div>
        )}
      </div>
      <div className="history-chip">{history.length > 0 ? text(locale, `Last: ${historySummary}`, `最近: ${historySummary}`) : text(locale, 'No gifts opened yet', 'まだ開けていません')}</div>
    </section>
  );
}

function StorageOverlay({
  locale,
  save,
  activeTheme,
  stats,
  ownedRewardIds,
  collectionGroups,
  marketOffers,
  activeMapId,
  maps,
  selectedBackgroundId,
  onSelectBackground,
  onSelectMap,
  layoutPresets,
  onSaveLayoutPreset,
  onLoadLayoutPreset,
  onClearLayoutPreset,
  onMarketTrade
}: {
  locale: Locale;
  save: PrototypeSave;
  activeTheme: BackgroundTheme;
  stats: GameStats;
  ownedRewardIds: string[];
  collectionGroups: CollectionGroup[];
  marketOffers: MarketOffer[];
  activeMapId: GardenMapId;
  maps: GardenMapState[];
  selectedBackgroundId: string;
  onSelectBackground: (themeId: string) => void;
  onSelectMap: (id: GardenMapId) => void;
  layoutPresets: LayoutPreset[];
  onSaveLayoutPreset: (slot: number) => void;
  onLoadLayoutPreset: (slot: number) => void;
  onClearLayoutPreset: (slot: number) => void;
  onMarketTrade: (offerId: string) => void;
}) {
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilterState>({
    query: '',
    kind: 'decor',
    rarity: 'all',
    ownership: 'all'
  });
  const [selectedCatalogId, setSelectedCatalogId] = useState('hay-bed');
  const visibleCatalogItems = useMemo(
    () => filterCatalogForUi(catalogItems, catalogFilter, ownedRewardIds, locale),
    [catalogFilter, locale, ownedRewardIds]
  );
  const selectedCatalogItem =
    visibleCatalogItems.find((item) => item.id === selectedCatalogId) ??
    getCatalogItem(selectedCatalogId) ??
    visibleCatalogItems[0] ??
    catalogItems[0];
  const selectedCatalogOwned = isRewardOwned(ownedRewardIds, selectedCatalogItem.id);
  const totalOwned = catalogItems.filter((item) => isRewardOwned(ownedRewardIds, item.id)).length;

  return (
    <section className="storage-sheet" aria-label={text(locale, 'Storage and customization', '倉庫とカスタム')}>
      <div className="storage-head">
        <strong>{screenLabel(locale, 'storage')}</strong>
        <span>{text(locale, `${save.ownedRewardIds.length} rewards`, `${save.ownedRewardIds.length}個所持`)}</span>
      </div>
      <div className="storage-stats">
        <span>Lv {stats.level}</span>
        <span>+{stats.idleIncomePerSecond}/s</span>
        <span>{text(locale, `${save.placedDecor.length} decor`, `配置${save.placedDecor.length}`)}</span>
        <span>{text(locale, `${save.gachaHistory.length} pulls`, `ギフト${save.gachaHistory.length}`)}</span>
      </div>
      <div className="map-panel" aria-label={text(locale, 'Map unlocks', 'MAP解放')}>
        <div className="mode-row compact">
          <strong>MAP</strong>
          <span>{text(locale, `${gardenMapCatalog.filter((map) => isGardenMapUnlocked(stats.level, map)).length}/3 open`, `${gardenMapCatalog.filter((map) => isGardenMapUnlocked(stats.level, map)).length}/3 解放`)}</span>
        </div>
        <MapSwitcher locale={locale} activeMapId={activeMapId} maps={maps} level={stats.level} onSelectMap={onSelectMap} />
      </div>
      <div className="market-panel" aria-label={text(locale, 'Market exchange', 'マーケット交換')}>
        <div className="mode-row compact">
          <strong>{text(locale, 'Market', '交換')}</strong>
          <span>{text(locale, `${save.economy.shards} shards`, `かけら${save.economy.shards}`)}</span>
        </div>
        <div className="market-offer-list">
          {marketOffers.map((offer) => {
            const affordable = save.economy.shards >= offer.costShards;
            return (
              <button
                key={offer.id}
                className="market-offer-card"
                type="button"
                disabled={!affordable}
                data-affordable={affordable}
                onClick={() => onMarketTrade(offer.id)}
                aria-label={text(locale, `Trade shards for ${offer.rewardTickets} sky ticket${offer.rewardTickets === 1 ? '' : 's'}`, `かけらをチケット${offer.rewardTickets}枚に交換`)}
              >
                <strong>{offer.label}</strong>
                <span>{offer.detail}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="collection-panel" aria-label={text(locale, 'Unlock progress', '解放進行')}>
        <div className="mode-row compact">
          <strong>{text(locale, 'Collection', 'コレクション')}</strong>
          <span>{text(locale, `${ownedRewardIds.length} owned`, `${ownedRewardIds.length}所持`)}</span>
        </div>
        <div className="collection-grid">
          {collectionGroups.map((group) => {
            const pct = Math.round((group.owned / Math.max(1, group.total)) * 100);
            return (
              <div key={group.id} className="collection-card" data-complete={group.owned === group.total}>
                <div>
                  <strong>{group.label}</strong>
                  <span>
                    {group.owned}/{group.total}
                  </span>
                </div>
                <span className="collection-meter" aria-label={text(locale, `${group.label} unlock progress`, `${group.label}解放進行`)}>
                  <span style={{ width: `${pct}%` }} />
                </span>
                <small>{group.nextLabel}</small>
              </div>
            );
          })}
        </div>
      </div>
      <div className="catalog-panel" aria-label={text(locale, 'Catalog browser', 'カタログ')}>
        <div className="catalog-preview" data-owned={selectedCatalogOwned} data-rarity={selectedCatalogItem.rarity}>
          <img src={selectedCatalogItem.src} alt="" draggable={false} loading="lazy" />
          <div>
            <strong>{catalogDisplayName(locale, selectedCatalogItem)}</strong>
            <span>
              {catalogKindLabel(locale, selectedCatalogItem.kind)} / {rarityLabel(locale, selectedCatalogItem.rarity)}
            </span>
            <small>
              {totalOwned}/{catalogItems.length} / {unlockSourceLabel(locale, selectedCatalogItem)}
            </small>
          </div>
        </div>
        <div className="catalog-toolbar">
          <input
            type="search"
            value={catalogFilter.query}
            onChange={(event) => setCatalogFilter((current) => ({ ...current, query: event.currentTarget.value }))}
            placeholder={text(locale, 'Search', '検索')}
            aria-label={text(locale, 'Search catalog', 'カタログ検索')}
          />
          <div className="catalog-tab-row" role="tablist" aria-label={text(locale, 'Catalog category', 'カタログカテゴリ')}>
            {catalogKindOrder.map((kind) => (
              <button
                key={kind}
                type="button"
                role="tab"
                data-active={catalogFilter.kind === kind}
                aria-selected={catalogFilter.kind === kind}
                onClick={() => setCatalogFilter((current) => ({ ...current, kind }))}
              >
                {catalogKindLabel(locale, kind)}
                <span>{catalogItems.filter((item) => item.kind === kind).length}</span>
              </button>
            ))}
          </div>
          <div className="catalog-chip-row">
            {(['all', 'common', 'rare', 'special'] as Array<CatalogRarity | 'all'>).map((rarity) => (
              <button
                key={rarity}
                type="button"
                data-active={catalogFilter.rarity === rarity}
                onClick={() => setCatalogFilter((current) => ({ ...current, rarity }))}
              >
                {rarityLabel(locale, rarity)}
              </button>
            ))}
          </div>
          <div className="catalog-chip-row">
            {(['all', 'owned', 'locked'] as CatalogFilterState['ownership'][]).map((ownership) => (
              <button
                key={ownership}
                type="button"
                data-active={catalogFilter.ownership === ownership}
                onClick={() => setCatalogFilter((current) => ({ ...current, ownership }))}
              >
                {ownershipLabel(locale, ownership)}
              </button>
            ))}
          </div>
        </div>
        <div className="catalog-grid" data-empty={visibleCatalogItems.length === 0}>
          {visibleCatalogItems.map((item) => {
            const owned = isRewardOwned(ownedRewardIds, item.id);

            return (
              <button
                key={item.id}
                className="catalog-item-card"
                type="button"
                data-active={selectedCatalogItem.id === item.id}
                data-owned={owned}
                data-rarity={item.rarity}
                onClick={() => setSelectedCatalogId(item.id)}
                aria-label={text(locale, `${owned ? 'Open' : 'Locked'} ${item.label}`, `${owned ? '表示' : '未所持'} ${catalogDisplayName(locale, item)}`)}
              >
                <img src={item.src} alt="" draggable={false} loading="lazy" />
                <span>{catalogDisplayName(locale, item)}</span>
                <small>{rarityLabel(locale, item.rarity)}</small>
              </button>
            );
          })}
          {visibleCatalogItems.length === 0 && <span className="catalog-empty">{text(locale, 'No matches', '一致なし')}</span>}
        </div>
      </div>
      <div className="layout-preset-panel">
        <div className="mode-row compact">
          <strong>{text(locale, 'Layout', 'レイアウト')}</strong>
          <span>{localizedName(locale, activeTheme.id, activeTheme.label)}</span>
        </div>
        <div className="layout-preset-list">
          {layoutPresets.map((preset) => {
            const theme =
              backgroundThemes.find((item) => item.id === preset.selectedBackgroundId) ??
              backgroundThemes[0];
            const hasSave = Boolean(preset.updatedAt);

            return (
              <div key={preset.slot} className="layout-preset-card" data-empty={!hasSave}>
                <button
                  className="preset-clear-button"
                  type="button"
                  disabled={!hasSave}
                  onClick={() => onClearLayoutPreset(preset.slot)}
                  aria-label={text(locale, `Clear layout preset ${preset.slot}`, `レイアウト${preset.slot}を消す`)}
                >
                  x
                </button>
                <strong>{text(locale, preset.label, `スロット${preset.slot}`)}</strong>
                <span>{hasSave ? localizedName(locale, theme.id, theme.label) : text(locale, 'Empty', '空')}</span>
                <div className="preset-actions">
                  <button
                    className="preset-button save"
                    type="button"
                    onClick={() => onSaveLayoutPreset(preset.slot)}
                    aria-label={text(locale, `Save layout preset ${preset.slot}`, `レイアウト${preset.slot}を保存`)}
                  >
                  {text(locale, 'Save', '保存')}
                  </button>
                  <button
                    className="preset-button load"
                    type="button"
                    disabled={!hasSave}
                    onClick={() => onLoadLayoutPreset(preset.slot)}
                    aria-label={text(locale, `Load layout preset ${preset.slot}`, `レイアウト${preset.slot}を読込`)}
                  >
                  {text(locale, 'Load', '読込')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="theme-panel">
        <div className="mode-row compact">
          <strong>{text(locale, 'Theme', '背景')}</strong>
          <span>{localizedName(locale, activeTheme.id, activeTheme.label)}</span>
        </div>
        <div className="theme-tray">
          {backgroundThemes.map((theme) => {
            const owned = isBackgroundAvailable(theme.id, ownedRewardIds, stats.level);
            return (
              <button
                key={theme.id}
                className="theme-card"
                type="button"
                data-active={selectedBackgroundId === theme.id}
                data-locked={!owned}
                onClick={() => onSelectBackground(theme.id)}
                aria-label={text(locale, `${owned ? 'Switch background to' : 'Locked'} ${theme.label}`, `${owned ? '背景を切替' : '未解放'} ${localizedName(locale, theme.id, theme.label)}`)}
              >
                <img src={theme.src} alt="" draggable={false} />
                <span style={{ backgroundColor: theme.swatch }} />
                {!owned && <strong>{text(locale, 'Locked', '未解放')}</strong>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NavBar({
  locale,
  active,
  onNavigate
}: {
  locale: Locale;
  active: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}) {
  const icons: Record<ScreenId, string> = {
    home: '/images/runtime/decor/clover-patch.png',
    placement: '/images/runtime/decor/cloud-lamp.png',
    wardrobe: '/images/runtime/wardrobe/straw-hat.png',
    gacha: runtimeAssets.skyGiftMachine,
    storage: '/images/runtime/decor/hay-bed.png'
  };

  return (
    <nav className="bottom-nav" aria-label={text(locale, 'AnimalBox screens', 'AnimalBox画面')}>
      {navOrder.map((screenId) => {
        const isActive = active === screenId;
        const label = screenLabel(locale, screenId);

        return (
          <button
            key={screenId}
            type="button"
            className="nav-item"
            data-active={isActive}
            aria-current={isActive ? 'page' : undefined}
            aria-label={isActive && screenId !== 'home' ? text(locale, `Close ${label}`, `${label}を閉じる`) : text(locale, `Open ${label}`, `${label}を開く`)}
            onClick={() => onNavigate(screenId)}
          >
            <img src={icons[screenId]} alt="" draggable={false} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
