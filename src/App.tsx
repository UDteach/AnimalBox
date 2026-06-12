import { useEffect, useMemo, useRef, useState } from 'react';
import {
  backgroundThemes,
  decorItems,
  deguVariants,
  navOrder,
  outfits,
  pixelDeguShots,
  runtimeAssets,
  screens,
  isRewardOwned,
  type BackgroundTheme,
  type DecorItem,
  type OutfitItem,
  type ScreenId
} from './game/content';
import { addIdleIncome, formatNumber, tapForCoins, type EconomyState } from './game/economy';
import { browserRandom, runPulls, skyGiftBanner } from './game/gacha';
import { PixelDeguStage } from './game/pixel/PixelDeguStage';
import { type Cell, type PlacedDecor } from './game/placement';
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
import { loadSave, savePrototype, type LayoutPreset, type PrototypeSave } from './game/storage';
import { toggleOutfitForSlot } from './game/wardrobe';

interface Burst {
  id: number;
  label: string;
  x: number;
  y: number;
}

const screenSet = new Set<ScreenId>(navOrder);
const grid = { width: 6, height: 6 };
const firstOpenCell: Cell = { x: 0, y: 2 };

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
  const [selectedCell, setSelectedCell] = useState<Cell>(firstOpenCell);
  const [rotation, setRotation] = useState(0);
  const [status, setStatus] = useState('Runtime parts prototype');
  const [missingAssets, setMissingAssets] = useState<string[]>([]);

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
  const selectedOutfitIds = save.selectedOutfitIds.filter((id) =>
    isRewardOwned(save.ownedRewardIds, id)
  );
  const selectedDecor = decorItems.find((item) => item.id === selectedDecorId) ?? decorItems[0];
  const activeTheme =
    backgroundThemes.find((theme) => theme.id === selectedBackgroundId) ?? backgroundThemes[0];

  const allAssetPaths = useMemo(
    () => [
      ...backgroundThemes.map((theme) => theme.src),
      ...Object.values(screens).map((item) => item.image),
      ...decorItems.map((item) => item.src),
      ...outfits.map((item) => item.src),
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
    if (canPlaceDecorInScene(grid, save.placedDecor, selectedCell.x, selectedCell.y, selectedDecor)) {
      return;
    }

    const nextCell = findFirstSceneSafeCell(selectedDecor, save.placedDecor);
    if (nextCell) setSelectedCell(nextCell);
  }, [save.placedDecor, selectedCell.x, selectedCell.y, selectedDecor]);

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
    setSave(nextSave((currentSave) => ({ ...currentSave, selectedDeguShotId: shotId })));
    setStatus(`Degu shot: ${shotId}`);
  }

  function selectDecor(decorId: string) {
    const decor = decorItems.find((item) => item.id === decorId);
    if (!decor) return;
    setSelectedDecorId(decorId);

    const nextCell = findFirstSceneSafeCell(decor, saveRef.current.placedDecor);
    if (nextCell) setSelectedCell(nextCell);
    setStatus(`Decor: ${decor.label}`);
  }

  function toggleOutfit(outfitId: string) {
    const outfit = outfits.find((item) => item.id === outfitId);
    if (!outfit) return;
    if (!isRewardOwned(save.ownedRewardIds, outfit.id)) {
      setStatus(`${outfit.label} locked`);
      return;
    }

    setSave(
      nextSave((currentSave) => {
        return {
          ...currentSave,
          selectedOutfitIds: toggleOutfitForSlot(currentSave.selectedOutfitIds, outfitId)
        };
      })
    );
    setStatus(`Outfit: ${outfitId}`);
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
      footprint: selectedDecor.footprint
    };

    if (!canPlaceDecorInScene(grid, save.placedDecor, candidate.cellX, candidate.cellY, selectedDecor)) {
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
    setStatus(`Placed ${selectedDecor.label}`);
  }

  function runGacha(count: 1 | 10) {
    const optimistic = runPulls(skyGiftBanner, count, saveRef.current.economy, {
      ownedRewardIds: new Set(saveRef.current.ownedRewardIds),
      pullsSinceRare: saveRef.current.pullsSinceRare,
      random: browserRandom
    });

    setSave(
      nextSave((currentSave) => {
        const result = runPulls(skyGiftBanner, count, currentSave.economy, {
          ownedRewardIds: new Set(currentSave.ownedRewardIds),
          pullsSinceRare: currentSave.pullsSinceRare,
          random: browserRandom
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
    setStatus(optimistic ? `${count} sky gift${count === 1 ? '' : 's'} opened` : 'Need earned tickets');
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
        />

        {(screen === 'home' || screen === 'placement' || screen === 'storage') && (
          <IslandScene
            save={save}
            selectedDecor={selectedDecor}
            selectedCell={selectedCell}
            screen={screen}
            selectedDeguShotId={save.selectedDeguShotId}
            selectedVariantId={selectedVariantId}
            selectedOutfitIds={selectedOutfitIds}
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
            onRotate={() => {
              setRotation((value) => (value + 90) % 360);
              setStatus('Rotated placement ghost');
            }}
            onConfirm={placeSelectedDecor}
            onCancel={() => setStatus('Placement cancelled')}
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
            ownedRewardIds={save.ownedRewardIds}
            onSelectVariant={selectVariant}
            onSelectDeguShot={selectDeguShot}
            onToggleOutfit={toggleOutfit}
            onApply={() => setStatus('Wardrobe applied')}
          />
        )}

        {screen === 'gacha' && (
          <GachaScreen
            ownedRewardIds={save.ownedRewardIds}
            history={save.gachaHistory}
            onSingle={() => runGacha(1)}
            onTen={() => runGacha(10)}
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

        <NavBar active={screen} onNavigate={setScreen} />
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

function Hud({
  economy,
  stats,
  status,
  activeTheme,
  missingAssets
}: {
  economy: EconomyState;
  stats: GameStats;
  status: string;
  activeTheme: BackgroundTheme;
  missingAssets: string[];
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
      <button className="round-button" type="button" aria-label="Settings">
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
  screen,
  selectedDeguShotId,
  selectedVariantId,
  selectedOutfitIds,
  onTapDegu,
  onSelectCell
}: {
  save: PrototypeSave;
  selectedDecor: DecorItem;
  selectedCell: Cell;
  screen: ScreenId;
  selectedDeguShotId: string;
  selectedVariantId: string;
  selectedOutfitIds: string[];
  onTapDegu: () => void;
  onSelectCell: (cell: Cell) => void;
}) {
  const ghost = gridToScene(selectedCell, selectedDecor);

  return (
    <div className="island-layer">
      {save.placedDecor.map((placed) => {
        const decor = decorItems.find((item) => item.id === placed.itemId);
        if (!decor) return null;
        const scene = gridToScene({ x: placed.cellX, y: placed.cellY }, decor);
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
            style={{ ...assetStyle(scene.x, scene.y, scene.w), zIndex: 20 + placed.cellY + decor.footprint.h }}
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
                style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
                aria-label={`Select cell ${x + 1}, ${y + 1}`}
                onClick={() => onSelectCell({ x, y })}
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
            style={assetStyle(ghost.x, ghost.y, ghost.w)}
          />
        </div>
      )}

      <button className="degu-button" type="button" aria-label="Tap degu for coins" onClick={onTapDegu}>
        <PixelDeguStage
          mode="island"
          selectedShotId={selectedDeguShotId}
          selectedVariantId={selectedVariantId}
          selectedOutfitIds={selectedOutfitIds}
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
  onCancel
}: {
  selectedDecorId: string;
  selectedCell: Cell;
  rotation: number;
  ownedRewardIds: string[];
  onSelectDecor: (id: string) => void;
  onRotate: () => void;
  onConfirm: () => void;
  onCancel: () => void;
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
  ownedRewardIds,
  onSelectVariant,
  onSelectDeguShot,
  onToggleOutfit,
  onApply
}: {
  selectedVariantId: string;
  selectedDeguShotId: string;
  selectedOutfitIds: string[];
  ownedRewardIds: string[];
  onSelectVariant: (id: string) => void;
  onSelectDeguShot: (id: string) => void;
  onToggleOutfit: (id: string) => void;
  onApply: () => void;
}) {
  return (
    <section className="wardrobe-screen" aria-label="Wardrobe">
      <PixelDeguStage
        mode="wardrobe"
        selectedShotId={selectedDeguShotId}
        selectedVariantId={selectedVariantId}
        selectedOutfitIds={selectedOutfitIds}
      />
      <div className="shot-row" aria-label="Degu shot choices">
        {pixelDeguShots.map((shot) => (
          <button
            key={shot.id}
            className="shot-button"
            type="button"
            data-active={shot.id === selectedDeguShotId}
            onClick={() => onSelectDeguShot(shot.id)}
            aria-label={`Select degu shot ${shot.id}`}
          >
            <img src={shot.src} alt="" draggable={false} />
            <span>{shot.id}</span>
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
      <div className="wardrobe-grid">
        {outfits.map((outfit) => {
          const owned = isRewardOwned(ownedRewardIds, outfit.id);
          return (
            <button
              key={outfit.id}
              className="asset-card outfit-card-ui"
              type="button"
              data-active={selectedOutfitIds.includes(outfit.id)}
              data-locked={!owned}
              onClick={() => onToggleOutfit(outfit.id)}
              aria-label={`${owned ? 'Toggle' : 'Locked'} ${outfit.label}`}
            >
              <img src={outfit.src} alt="" draggable={false} />
              {!owned && <span>Locked</span>}
            </button>
          );
        })}
      </div>
      <button className="apply-button" type="button" onClick={onApply} aria-label="Apply wardrobe">
        Apply
      </button>
    </section>
  );
}

function GachaScreen({
  ownedRewardIds,
  history,
  onSingle,
  onTen
}: {
  ownedRewardIds: string[];
  history: string[];
  onSingle: () => void;
  onTen: () => void;
}) {
  const rewards = [
    decorItems.find((item) => item.id === 'cloud-lamp'),
    backgroundThemes.find((item) => item.id === 'morning-pasture'),
    backgroundThemes.find((item) => item.id === 'sunset-clover-isle'),
    backgroundThemes.find((item) => item.id === 'flower-cloud-terrace'),
    outfits.find((item) => item.id === 'flower-crown'),
    outfits.find((item) => item.id === 'acorn-beret'),
    outfits.find((item) => item.id === 'mint-scarf'),
    outfits.find((item) => item.id === 'explorer-goggles'),
    decorItems.find((item) => item.id === 'timothy-hay-rack'),
    decorItems.find((item) => item.id === 'sand-bath-bowl'),
    decorItems.find((item) => item.id === 'wood-tunnel'),
    decorItems.find((item) => item.id === 'ceramic-hideout'),
    decorItems.find((item) => item.id === 'short-wooden-fence'),
    decorItems.find((item) => item.id === 'flower-patch'),
    decorItems.find((item) => item.id === 'snack-tray'),
    decorItems.find((item) => item.id === 'star-lantern'),
    decorItems.find((item) => item.id === 'angel-fountain'),
    outfits.find((item) => item.id === 'cloud-cap'),
    outfits.find((item) => item.id === 'clover-necklace'),
    outfits.find((item) => item.id === 'picnic-blanket-cape'),
    outfits.find((item) => item.id === 'tiny-cheek-sticker'),
    outfits.find((item) => item.id === 'celestial-cape')
  ].filter(Boolean) as Array<DecorItem | OutfitItem | BackgroundTheme>;

  return (
    <section className="gacha-screen" aria-label="Free sky gift">
      <img className="gacha-machine" src={runtimeAssets.skyGiftMachine} alt="" draggable={false} />
      <p className="free-label">Earned tickets only</p>
      <div className="pull-row">
        <button className="pull-button single" type="button" onClick={onSingle} aria-label="Open one sky gift">
          <img src={runtimeAssets.ticket} alt="" />1
        </button>
        <button className="pull-button ten" type="button" onClick={onTen} aria-label="Open ten sky gifts">
          <img src={runtimeAssets.ticket} alt="" />10
        </button>
      </div>
      <div className="reward-strip">
        {rewards.map((reward) => (
          <div key={reward.id} className="reward-card" data-owned={ownedRewardIds.includes(reward.id)}>
            <img src={reward.src} alt="" draggable={false} />
          </div>
        ))}
      </div>
      <div className="history-chip">{history.length > 0 ? `Last: ${history.slice(0, 3).join(', ')}` : 'No gifts opened yet'}</div>
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
  onLoadLayoutPreset
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
        </button>
      ))}
    </nav>
  );
}
