import { useEffect, useMemo, useRef, useState } from 'react';
import {
  backgroundThemes,
  accessoryItems,
  decorItems,
  deguVariants,
  navOrder,
  pixelDeguShots,
  runtimeAssets,
  screens,
  isRewardOwned,
  type BackgroundTheme,
  type DecorItem,
  type FloatingItem,
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
import { PixelDeguStage } from './game/pixel/PixelDeguStage';
import { normalizeRotation, type Cell, type PlacedDecor, withRotatedFootprint } from './game/placement';
import { assetStyle, canPlaceDecorInScene, gridCellAnchor, gridToScene } from './game/sceneLayout';
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

const screenSet = new Set<ScreenId>(navOrder);
const grid = { width: 6, height: 6 };
const firstOpenCell: Cell = { x: 0, y: 2 };

function deguShotUnlockCost(shotId: string): number {
  return 650 + Math.max(0, Number.parseInt(shotId, 10) - 1) * 260;
}

function deguToneFilter(tone: DeguTone, baseFilter: string): string {
  return `${baseFilter} hue-rotate(${tone.hue}deg) saturate(${tone.saturation / 100}) brightness(${tone.brightness / 100})`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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

export function App() {
  const [save, setSave] = useState<PrototypeSave>(() => loadSave());
  const saveRef = useRef(save);
  const [screen, setScreenState] = useState<ScreenId>(() => getInitialScreen());
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [selectedDecorId, setSelectedDecorId] = useState('hay-bed');
  const [selectedAccessoryId, setSelectedAccessoryId] = useState('straw-hat');
  const [selectedCell, setSelectedCell] = useState<Cell>(firstOpenCell);
  const [rotation, setRotation] = useState(0);
  const [status, setStatus] = useState('Runtime parts prototype');
  const [missingAssets, setMissingAssets] = useState<string[]>([]);
  const [gachaReveal, setGachaReveal] = useState<GachaReveal | null>(null);
  const [gachaOpening, setGachaOpening] = useState(false);

  const current = screens[screen];
  const economy = save.economy;
  const gameStats = deriveGameStats(economy.incomePerSecond, save.progression);
  const nextUpgrade = getNextUpgrade(save.progression);
  const selectedBackgroundId = isRewardOwned(save.ownedRewardIds, save.selectedBackgroundId)
    ? save.selectedBackgroundId
    : 'floating-island';
  const selectedVariantId = isRewardOwned(save.ownedRewardIds, save.selectedVariantId)
    ? save.selectedVariantId
    : 'agouti';
  const selectedOutfitIds = save.selectedOutfitIds.filter((id) => isRewardOwned(save.ownedRewardIds, id));
  const activeVariant = deguVariants.find((item) => item.id === selectedVariantId) ?? deguVariants[0];
  const customDeguFilter = deguToneFilter(save.customDeguTone, activeVariant.filter);
  const selectedDecor = decorItems.find((item) => item.id === selectedDecorId) ?? decorItems[0];
  const placementDecor = useMemo(
    () => withRotatedFootprint(selectedDecor, rotation),
    [selectedDecor, rotation]
  );
  const activeTheme =
    backgroundThemes.find((theme) => theme.id === selectedBackgroundId) ?? backgroundThemes[0];

  const allAssetPaths = useMemo(
    () => [
      ...backgroundThemes.map((theme) => theme.src),
      ...Object.values(screens).map((item) => item.image),
      ...decorItems.map((item) => item.src),
      ...accessoryItems.map((item) => item.src),
      ...pixelDeguShots.map((item) => item.src),
      ...Object.values(runtimeAssets)
    ],
    []
  );

  useEffect(() => {
    saveRef.current = save;
    savePrototype(save);
  }, [save]);

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
    if (!gachaOpening) return;
    const timer = window.setTimeout(() => setGachaOpening(false), 1050);
    return () => window.clearTimeout(timer);
  }, [gachaOpening, gachaReveal?.id]);

  function setScreen(next: ScreenId) {
    setScreenState(next);
    setSave(nextSave((currentSave) => ({ ...currentSave, screen: next })));
    setStatus(`${screens[next].label} screen`);
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
    setStatus(`Degu tap +${stats.tapPower} coins`);
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
    setStatus(optimistic ? `Upgrade: ${optimistic.upgrade.label}` : 'Need coins or shards');
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
        ? `Claimed ${optimistic.claimed} ticket${optimistic.claimed === 1 ? '' : 's'}`
        : 'Ticket meter charging'
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
        ? `${optimistic.action.label}: +${optimistic.action.affectionReward} bond`
        : 'Need coins for care'
    );
  }

  function selectBackground(themeId: string) {
    const theme = backgroundThemes.find((item) => item.id === themeId);
    if (!theme) return;
    if (!isRewardOwned(save.ownedRewardIds, theme.id)) {
      setStatus(`${theme.label} locked`);
      return;
    }

    setSave(nextSave((currentSave) => ({ ...currentSave, selectedBackgroundId: theme.id })));
    setStatus(`Theme: ${theme.label}`);
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
    setStatus(`Saved layout ${slot}`);
  }

  function loadLayoutPreset(slot: number) {
    const preset = saveRef.current.layoutPresets.find((item) => item.slot === slot);
    if (!preset?.updatedAt) {
      setStatus(`Layout ${slot} empty`);
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
      setStatus(`Layout ${slot} has locked items`);
      return;
    }

    setSave(
      nextSave((currentSave) => {
        const currentPreset = currentSave.layoutPresets.find((item) => item.slot === slot);
        if (!currentPreset?.updatedAt) return currentSave;

        return {
          ...currentSave,
          selectedBackgroundId: currentPreset.selectedBackgroundId,
          placedDecor: clonePlacedDecor(currentPreset.placedDecor)
        };
      })
    );
    setStatus(`Loaded layout ${slot}`);
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
    setStatus(`Cleared layout ${slot}`);
  }

  function selectVariant(variantId: string) {
    const variant = deguVariants.find((item) => item.id === variantId);
    if (!variant) return;
    if (!isRewardOwned(save.ownedRewardIds, variant.id)) {
      setStatus(`${variant.label} locked`);
      return;
    }

    setSave(nextSave((currentSave) => ({ ...currentSave, selectedVariantId: variantId })));
    setStatus(`Variant: ${variantId}`);
  }

  function selectDeguShot(shotId: string) {
    const shot = pixelDeguShots.find((item) => item.id === shotId);
    if (!shot) return;

    if (isRewardOwned(saveRef.current.ownedRewardIds, shotId)) {
      setSave(nextSave((currentSave) => ({ ...currentSave, selectedDeguShotId: shotId })));
      setStatus(`Pose: ${shotId}`);
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
    setStatus(saveRef.current.economy.coins >= cost ? `Unlocked pose ${shotId}` : `Need ${formatNumber(cost)} coins`);
  }

  function selectDecor(decorId: string) {
    const decor = decorItems.find((item) => item.id === decorId);
    if (!decor) return;
    setSelectedDecorId(decorId);

    const nextCell = findFirstSceneSafeCell(withRotatedFootprint(decor, rotation), saveRef.current.placedDecor);
    if (nextCell) setSelectedCell(nextCell);
    setStatus(`Decor: ${decor.label}`);
  }

  function toggleFloatingItem(itemId: string) {
    const item = accessoryItems.find((candidate) => candidate.id === itemId);
    if (!item) return;
    if (!isRewardOwned(save.ownedRewardIds, item.id)) {
      setStatus(`${item.label} locked`);
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
    setStatus(`Accessory: ${item.label}`);
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
    setStatus(`Adjusted ${item.label}`);
  }

  function resetAccessory(itemId: string) {
    setSave(
      nextSave((currentSave) => {
        const nextPlacements = { ...currentSave.accessoryPlacements };
        delete nextPlacements[itemId];
        return { ...currentSave, accessoryPlacements: nextPlacements };
      })
    );
    setStatus('Accessory reset');
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
    setStatus('Color tuned');
  }

  function placeSelectedDecor() {
    if (!isRewardOwned(save.ownedRewardIds, selectedDecor.id)) {
      setStatus(`${selectedDecor.label} locked`);
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
      setStatus('That cell is blocked');
      return;
    }

    setSave(
      nextSave((currentSave) => ({
        ...currentSave,
        economy: {
          ...currentSave.economy,
          incomePerSecond: currentSave.economy.incomePerSecond + selectedDecor.bonusPerSecond
        },
        placedDecor: [...currentSave.placedDecor, candidate]
      }))
    );
    setStatus(`Placed ${selectedDecor.label}${rotation === 0 ? '' : ` ${rotation}deg`}`);
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
    setStatus(`Rotated ${selectedDecor.label} ${nextRotation}deg`);
  }

  function undoLastPlacedDecor() {
    const lastPlaced = saveRef.current.placedDecor.at(-1);
    if (!lastPlaced) {
      setStatus('No decor to undo');
      return;
    }

    const optimisticDecor = decorItems.find((item) => item.id === lastPlaced.itemId);
    setSave(
      nextSave((currentSave) => {
        const last = currentSave.placedDecor.at(-1);
        if (!last) return currentSave;
        const decor = decorItems.find((item) => item.id === last.itemId);
        const bonus = decor?.bonusPerSecond ?? 0;

        return {
          ...currentSave,
          economy: {
            ...currentSave.economy,
            incomePerSecond: Math.max(0, currentSave.economy.incomePerSecond - bonus)
          },
          placedDecor: currentSave.placedDecor.slice(0, -1)
        };
      })
    );
    setStatus(`Removed ${optimisticDecor?.label ?? 'decor'}`);
  }

  function runGacha(count: 1 | 10, banner: GachaBanner = skyGiftBanner) {
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
    setGachaReveal(
      optimistic
        ? {
            id: Date.now(),
            bannerId: banner.id,
            results: optimistic.results
          }
        : null
    );
    setGachaOpening(Boolean(optimistic));
    setStatus(optimistic ? `${count} ${label}${count === 1 ? '' : 's'} opened` : 'Need earned tickets');
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
    <main className="app" data-view={screen}>
      <section className="phone" style={style} aria-label={`AnimalBox ${current.label}`}>
        <img className="scene-background" src={activeTheme.src} alt="" draggable={false} />
        <div className="sky-vignette" />

        <Hud
          economy={economy}
          stats={gameStats}
          status={status}
          activeTheme={activeTheme}
          missingAssets={missingAssets}
          onSettings={() => setScreen('storage')}
        />

        {(screen === 'home' || screen === 'placement' || screen === 'storage') && (
          <IslandScene
            save={save}
            selectedDecor={placementDecor}
            selectedCell={selectedCell}
            placementRotation={rotation}
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
            selectedDecorId={selectedDecorId}
            selectedCell={selectedCell}
            rotation={rotation}
            ownedRewardIds={save.ownedRewardIds}
            onSelectDecor={selectDecor}
            onRotate={rotatePlacement}
            onConfirm={placeSelectedDecor}
            onCancel={() => setStatus('Placement cancelled')}
            onUndo={undoLastPlacedDecor}
          />
        )}

        {screen === 'home' && (
          <GameLoopPanel
            economy={economy}
            progression={save.progression}
            stats={gameStats}
            nextUpgrade={nextUpgrade}
            onBuyUpgrade={buyUpgrade}
            onClaimTickets={claimEarnedTickets}
            onCareAction={careForDegu}
          />
        )}

        {screen === 'wardrobe' && (
          <WardrobeScreen
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
              setStatus('Accessories saved');
            }}
          />
        )}

        {screen === 'gacha' && (
          <GachaScreen
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
            save={save}
            activeTheme={activeTheme}
            stats={gameStats}
            ownedRewardIds={save.ownedRewardIds}
            selectedBackgroundId={selectedBackgroundId}
            onSelectBackground={selectBackground}
            layoutPresets={save.layoutPresets}
            onSaveLayoutPreset={saveLayoutPreset}
            onLoadLayoutPreset={loadLayoutPreset}
            onClearLayoutPreset={clearLayoutPreset}
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

        <NavBar active={screen} onNavigate={(next) => (next === screen && next !== 'home' ? setScreen('home') : setScreen(next))} />
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

function clonePlacedDecor(items: PlacedDecor[]): PlacedDecor[] {
  return items.map((item) => ({
    ...item,
    footprint: { ...item.footprint }
  }));
}

function rewardLabel(rewardId: string): string {
  return (
    backgroundThemes.find((item) => item.id === rewardId)?.label ??
    decorItems.find((item) => item.id === rewardId)?.label ??
    accessoryItems.find((item) => item.id === rewardId)?.label ??
    deguVariants.find((item) => item.id === rewardId)?.label ??
    pixelDeguShots.find((item) => item.id === rewardId)?.label ??
    rewardId
  );
}

function rewardImage(rewardId: string): string {
  return (
    backgroundThemes.find((item) => item.id === rewardId)?.src ??
    decorItems.find((item) => item.id === rewardId)?.src ??
    accessoryItems.find((item) => item.id === rewardId)?.src ??
    pixelDeguShots.find((item) => item.id === rewardId)?.src ??
    runtimeAssets.ticket
  );
}

function Hud({
  economy,
  stats,
  status,
  activeTheme,
  missingAssets,
  onSettings
}: {
  economy: EconomyState;
  stats: GameStats;
  status: string;
  activeTheme: BackgroundTheme;
  missingAssets: string[];
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
      <div className="theme-chip" aria-label={`Current theme ${activeTheme.label}`}>
        <span style={{ backgroundColor: activeTheme.swatch }} />
      </div>
      <button className="round-button" type="button" aria-label="Settings" onClick={onSettings}>
        ...
      </button>
      <div className="sr-only" role="status">
        {status}. {missingAssets.length > 0 ? `${missingAssets.length} assets failed to load.` : 'All runtime assets loaded.'}
      </div>
      {missingAssets.length > 0 && <div className="asset-warning">Asset load issue</div>}
    </header>
  );
}

function formatHudNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}k`;
  return formatNumber(value);
}

function GameLoopPanel({
  economy,
  progression,
  stats,
  nextUpgrade,
  onBuyUpgrade,
  onClaimTickets,
  onCareAction
}: {
  economy: EconomyState;
  progression: ProgressionState;
  stats: GameStats;
  nextUpgrade: UpgradeDefinition | null;
  onBuyUpgrade: (id: string) => void;
  onClaimTickets: () => void;
  onCareAction: (id: CareActionId) => void;
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
  const claimLabel = stats.claimableTickets > 0 ? `Claim x${stats.claimableTickets}` : 'Charging';
  const careIcons: Record<CareActionId, string> = {
    brush: runtimeAssets.careBrush,
    snack: runtimeAssets.seedPouch
  };

  return (
    <section className="game-loop-panel" aria-label="Progression">
      <div className="loop-head">
        <div>
          <strong>Lv {stats.level}</strong>
          <span>{stats.xpIntoLevel}/{stats.xpForNextLevel}</span>
        </div>
        <div>
          <strong>Tap +{stats.tapPower}</strong>
          <span>{upgradeCatalog.length - progression.ownedUpgradeIds.length} upgrades</span>
        </div>
      </div>
      <div className="meter-row">
        <span className="meter-track" aria-label="XP progress">
          <span style={{ width: `${xpPct}%` }} />
        </span>
        <span className="meter-track ticket-meter" aria-label="Ticket progress">
          <span style={{ width: `${ticketPct}%` }} />
        </span>
      </div>
      <div className="care-row" aria-label="Care actions">
        <div className="care-meter">
          <span>Bond {stats.affectionLevel}</span>
          <span className="meter-track affection-meter" aria-label="Bond progress">
            <span style={{ width: `${affectionPct}%` }} />
          </span>
        </div>
        {careActions.map((action) => (
          <button
            key={action.id}
            className="care-button"
            type="button"
            onClick={() => onCareAction(action.id)}
            aria-label={`${action.label} degu`}
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
          aria-label="Claim earned tickets"
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
            aria-label={`Buy ${nextUpgrade.label}`}
          >
            <span>{nextUpgrade.label}</span>
            <strong>
              {nextUpgrade.cost.currency === 'shards' ? 'Shards' : 'Coins'} {formatNumber(nextUpgrade.cost.amount)}
            </strong>
          </button>
        ) : (
          <button className="next-upgrade-button" type="button" disabled>
            <span>Upgrades</span>
            <strong>Complete</strong>
          </button>
        )}
      </div>
      <div className="upgrade-strip" aria-label="Upgrade list">
        {upgradeCatalog.map((upgrade) => {
          const owned = progression.ownedUpgradeIds.includes(upgrade.id);
          const affordable = economy[upgrade.cost.currency] >= upgrade.cost.amount;
          return (
            <button
              key={upgrade.id}
              className="upgrade-chip"
              type="button"
              data-owned={owned}
              data-affordable={affordable}
              disabled={owned}
              onClick={() => onBuyUpgrade(upgrade.id)}
              aria-label={`${owned ? 'Owned' : 'Buy'} ${upgrade.label}`}
            >
              <span>{upgrade.label}</span>
              <strong>{owned ? 'Owned' : formatNumber(upgrade.cost.amount)}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function IslandScene({
  save,
  selectedDecor,
  selectedCell,
  placementRotation,
  screen,
  selectedDeguShotId,
  selectedVariantId,
  selectedOutfitIds,
  accessoryPlacements,
  customDeguFilter,
  onTapDegu,
  onSelectCell
}: {
  save: PrototypeSave;
  selectedDecor: DecorItem;
  selectedCell: Cell;
  placementRotation: number;
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
    <div className="island-layer">
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
        <div className="placement-grid" aria-label="Placement cells">
          {Array.from({ length: grid.width * grid.height }).map((_, index) => {
            const x = index % grid.width;
            const y = Math.floor(index / grid.width);
            const anchor = gridCellAnchor({ x, y });
            const valid = canPlaceDecorInScene(grid, save.placedDecor, x, y, selectedDecor);
            return (
              <button
                key={`${x}:${y}`}
                className="cell-button"
                type="button"
                data-selected={x === selectedCell.x && y === selectedCell.y}
                data-valid={valid}
                data-cell-x={x}
                data-cell-y={y}
                disabled={!valid}
                style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
                aria-label={`Select cell ${x + 1}, ${y + 1}`}
                onClick={() => {
                  if (valid) onSelectCell({ x, y });
                }}
              />
            );
          })}
          <img
            className="runtime-decor placement-ghost"
            data-decor-id={selectedDecor.id}
            data-cell-x={selectedCell.x}
            data-cell-y={selectedCell.y}
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

      <button className="degu-button" type="button" aria-label="Tap degu for coins" onClick={onTapDegu}>
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

function PlacementPanel({
  selectedDecorId,
  selectedCell,
  rotation,
  ownedRewardIds,
  onSelectDecor,
  onRotate,
  onConfirm,
  onCancel,
  onUndo
}: {
  selectedDecorId: string;
  selectedCell: Cell;
  rotation: number;
  ownedRewardIds: string[];
  onSelectDecor: (id: string) => void;
  onRotate: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onUndo: () => void;
}) {
  return (
    <section className="bottom-sheet placement-sheet" aria-label="Decor placement">
      <div className="sheet-handle" />
      <div className="mode-row">
        <strong>Decor</strong>
        <span>
          cell {selectedCell.x + 1}-{selectedCell.y + 1} / {rotation} deg
        </span>
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
              aria-label={`${owned ? 'Select' : 'Locked'} ${decor.label}`}
              onClick={() => onSelectDecor(decor.id)}
            >
              <img src={decor.src} alt="" draggable={false} />
              <span>{owned ? `+${decor.bonusPerSecond}/s` : 'Locked'}</span>
            </button>
          );
        })}
      </div>
      <div className="action-row">
        <button className="action danger" type="button" onClick={onCancel} aria-label="Cancel placement">
          x
        </button>
        <button className="action undo" type="button" onClick={onUndo} aria-label="Undo last decor">
          undo
        </button>
        <button className="action rotate" type="button" onClick={onRotate} aria-label="Rotate placement">
          r
        </button>
        <button className="action confirm" type="button" onClick={onConfirm} aria-label="Confirm placement">
          ok
        </button>
      </div>
    </section>
  );
}

function WardrobeScreen({
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
  const selectedAccessory =
    accessoryItems.find((item) => selectedOutfitIds.includes(item.id) && item.id === selectedAccessoryId) ??
    accessoryItems.find((item) => selectedOutfitIds.includes(item.id));
  const customFilter = deguToneFilter(
    customDeguTone,
    deguVariants.find((item) => item.id === selectedVariantId)?.filter ?? deguVariants[0].filter
  );

  return (
    <section className="wardrobe-screen" aria-label="Floating companions">
      <PixelDeguStage
        mode="wardrobe"
        selectedShotId={selectedDeguShotId}
        selectedVariantId={selectedVariantId}
        selectedOutfitIds={selectedOutfitIds}
        accessoryPlacements={accessoryPlacements}
        customFilter={customFilter}
      />
      <div className="shot-row" aria-label="Degu shot choices">
        {pixelDeguShots.map((shot) => (
          <button
            key={shot.id}
            className="shot-button"
            type="button"
            data-active={shot.id === selectedDeguShotId}
            data-locked={!isRewardOwned(ownedRewardIds, shot.id)}
            onClick={() => onSelectDeguShot(shot.id)}
            aria-label={`${isRewardOwned(ownedRewardIds, shot.id) ? 'Select' : 'Unlock'} degu pose ${shot.id}`}
          >
            <img src={shot.src} alt="" draggable={false} />
            <span>{isRewardOwned(ownedRewardIds, shot.id) ? shot.id : formatNumber(deguShotUnlockCost(shot.id))}</span>
          </button>
        ))}
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
              aria-label={`${owned ? 'Select' : 'Locked'} ${variant.label}`}
            />
          );
        })}
      </div>
      <div className="tone-panel" aria-label="Degu color tuning">
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
      <div className="accessory-tune-panel" aria-label="Accessory position tools" data-empty={!selectedAccessory}>
        <strong>{selectedAccessory?.label ?? 'Select item'}</strong>
        <div className="accessory-tool-grid">
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { y: -2 })} aria-label="Move accessory up">↑</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { y: 2 })} aria-label="Move accessory down">↓</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { x: -2 })} aria-label="Move accessory left">←</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { x: 2 })} aria-label="Move accessory right">→</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { scale: 0.08 })} aria-label="Scale accessory up">＋</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { scale: -0.08 })} aria-label="Scale accessory down">－</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { rotation: -5 })} aria-label="Rotate accessory left">↺</button>
          <button type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onAdjustAccessory(selectedAccessory.id, { rotation: 5 })} aria-label="Rotate accessory right">↻</button>
        </div>
        <button className="accessory-reset" type="button" disabled={!selectedAccessory} onClick={() => selectedAccessory && onResetAccessory(selectedAccessory.id)} aria-label="Reset accessory position">
          reset
        </button>
      </div>
      <div className="wardrobe-grid">
        {accessoryItems.map((item) => {
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
              aria-label={`${owned ? 'Toggle' : 'Locked'} ${item.label}`}
            >
              <img src={item.src} alt="" draggable={false} />
              {!owned && <span>Locked</span>}
            </button>
          );
        })}
      </div>
      <button className="apply-button" type="button" onClick={onApply} aria-label="Apply accessories">
        Apply
      </button>
    </section>
  );
}

function GachaScreen({
  ownedRewardIds,
  history,
  reveal,
  isOpening,
  onSingle,
  onTen,
  onPremium
}: {
  ownedRewardIds: string[];
  history: string[];
  reveal: GachaReveal | null;
  isOpening: boolean;
  onSingle: () => void;
  onTen: () => void;
  onPremium: () => void;
}) {
  const rewards = [
    decorItems.find((item) => item.id === 'cloud-lamp'),
    backgroundThemes.find((item) => item.id === 'morning-pasture'),
    backgroundThemes.find((item) => item.id === 'sunset-clover-isle'),
    backgroundThemes.find((item) => item.id === 'flower-cloud-terrace'),
    accessoryItems.find((item) => item.id === 'straw-hat'),
    accessoryItems.find((item) => item.id === 'flower-crown'),
    accessoryItems.find((item) => item.id === 'cloud-puff'),
    accessoryItems.find((item) => item.id === 'clover-charm'),
    accessoryItems.find((item) => item.id === 'acorn-charm'),
    accessoryItems.find((item) => item.id === 'seed-pouch-charm'),
    accessoryItems.find((item) => item.id === 'star-lantern-float'),
    accessoryItems.find((item) => item.id === 'moon-bell'),
    accessoryItems.find((item) => item.id === 'mushroom-friend'),
    accessoryItems.find((item) => item.id === 'sprout-buddy'),
    decorItems.find((item) => item.id === 'timothy-hay-rack'),
    decorItems.find((item) => item.id === 'sand-bath-bowl'),
    decorItems.find((item) => item.id === 'wood-tunnel'),
    decorItems.find((item) => item.id === 'ceramic-hideout'),
    decorItems.find((item) => item.id === 'short-wooden-fence'),
    decorItems.find((item) => item.id === 'flower-patch'),
    decorItems.find((item) => item.id === 'snack-tray'),
    decorItems.find((item) => item.id === 'star-lantern'),
    decorItems.find((item) => item.id === 'angel-fountain'),
    accessoryItems.find((item) => item.id === 'cloud-sheep'),
    accessoryItems.find((item) => item.id === 'sun-bell'),
    accessoryItems.find((item) => item.id === 'water-drop-buddy'),
    accessoryItems.find((item) => item.id === 'teacup-cloud'),
    accessoryItems.find((item) => item.id === 'lavender-puff')
  ].filter(Boolean) as Array<DecorItem | FloatingItem | BackgroundTheme>;
  const historySummary = history.slice(0, 3).map(rewardLabel).join(', ');

  return (
    <section className="gacha-screen" aria-label="Free sky gift" data-opening={isOpening} data-has-reveal={Boolean(reveal)}>
      <img className="gacha-machine" src={runtimeAssets.skyGiftMachine} alt="" draggable={false} />
      <p className="free-label">Earned tickets only</p>
      <div className="pull-row">
        <button className="pull-button single" type="button" onClick={onSingle} aria-label="Open one sky gift">
          <img src={runtimeAssets.ticket} alt="" />1
        </button>
        <button className="pull-button ten" type="button" onClick={onTen} aria-label="Open ten sky gifts">
          <img src={runtimeAssets.ticket} alt="" />10
        </button>
        <button className="pull-button premium" type="button" onClick={onPremium} aria-label="Open premium sky gift">
          <img src={runtimeAssets.ticket} alt="" />5
        </button>
      </div>
      {reveal && (
        <div key={reveal.id} className="gacha-reveal" data-banner={reveal.bannerId} aria-label="Sky gift results">
          {reveal.results.slice(0, 4).map((pull, index) => (
            <div
              key={`${pull.entry.rewardId}-${index}`}
              className="gacha-result-card"
              data-rarity={pull.entry.rarity}
              data-duplicate={pull.duplicate}
            >
              <img src={rewardImage(pull.entry.rewardId)} alt="" draggable={false} />
              <span>{rewardLabel(pull.entry.rewardId)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="reward-strip">
        {rewards.map((reward) => (
          <div key={reward.id} className="reward-card" data-owned={ownedRewardIds.includes(reward.id)}>
            <img src={reward.src} alt="" draggable={false} />
          </div>
        ))}
      </div>
      <div className="history-chip">{history.length > 0 ? `Last: ${historySummary}` : 'No gifts opened yet'}</div>
    </section>
  );
}

function StorageOverlay({
  save,
  activeTheme,
  stats,
  ownedRewardIds,
  selectedBackgroundId,
  onSelectBackground,
  layoutPresets,
  onSaveLayoutPreset,
  onLoadLayoutPreset,
  onClearLayoutPreset
}: {
  save: PrototypeSave;
  activeTheme: BackgroundTheme;
  stats: GameStats;
  ownedRewardIds: string[];
  selectedBackgroundId: string;
  onSelectBackground: (themeId: string) => void;
  layoutPresets: LayoutPreset[];
  onSaveLayoutPreset: (slot: number) => void;
  onLoadLayoutPreset: (slot: number) => void;
  onClearLayoutPreset: (slot: number) => void;
}) {
  return (
    <section className="storage-sheet" aria-label="Storage and customization">
      <div className="storage-head">
        <strong>Storage</strong>
        <span>{save.ownedRewardIds.length} rewards</span>
      </div>
      <div className="storage-stats">
        <span>Lv {stats.level}</span>
        <span>+{stats.idleIncomePerSecond}/s</span>
        <span>{save.placedDecor.length} decor</span>
        <span>{save.gachaHistory.length} pulls</span>
      </div>
      <div className="layout-preset-panel">
        <div className="mode-row compact">
          <strong>Layout</strong>
          <span>{activeTheme.label}</span>
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
                  aria-label={`Clear layout preset ${preset.slot}`}
                >
                  x
                </button>
                <strong>{preset.label}</strong>
                <span>{hasSave ? theme.label : 'Empty'}</span>
                <div className="preset-actions">
                  <button
                    className="preset-button save"
                    type="button"
                    onClick={() => onSaveLayoutPreset(preset.slot)}
                    aria-label={`Save layout preset ${preset.slot}`}
                  >
                    Save
                  </button>
                  <button
                    className="preset-button load"
                    type="button"
                    disabled={!hasSave}
                    onClick={() => onLoadLayoutPreset(preset.slot)}
                    aria-label={`Load layout preset ${preset.slot}`}
                  >
                    Load
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="theme-panel">
        <div className="mode-row compact">
          <strong>Theme</strong>
          <span>{activeTheme.label}</span>
        </div>
        <div className="theme-tray">
          {backgroundThemes.map((theme) => {
            const owned = isRewardOwned(ownedRewardIds, theme.id);
            return (
              <button
                key={theme.id}
                className="theme-card"
                type="button"
                data-active={selectedBackgroundId === theme.id}
                data-locked={!owned}
                onClick={() => onSelectBackground(theme.id)}
                aria-label={`${owned ? 'Switch background to' : 'Locked'} ${theme.label}`}
              >
                <img src={theme.src} alt="" draggable={false} />
                <span style={{ backgroundColor: theme.swatch }} />
                {!owned && <strong>Locked</strong>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NavBar({
  active,
  onNavigate
}: {
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
    <nav className="bottom-nav" aria-label="AnimalBox screens">
      {navOrder.map((screenId) => (
        <button
          key={screenId}
          type="button"
          className="nav-item"
          data-active={active === screenId}
          aria-label={`Open ${screens[screenId].label}`}
          onClick={() => onNavigate(screenId)}
        >
          <img src={icons[screenId]} alt="" draggable={false} />
          <span>{screens[screenId].label}</span>
        </button>
      ))}
    </nav>
  );
}
