import { useEffect, useMemo, useState } from 'react';
import {
  backgroundThemes,
  decorItems,
  deguVariants,
  navOrder,
  outfits,
  runtimeAssets,
  screens,
  type BackgroundTheme,
  type DecorItem,
  type OutfitItem,
  type ScreenId
} from './game/content';
import { addIdleIncome, formatNumber, tapForCoins, type EconomyState } from './game/economy';
import { browserRandom, runPulls, skyGiftBanner } from './game/gacha';
import { canPlaceDecor, type PlacedDecor } from './game/placement';
import { loadSave, savePrototype, type PrototypeSave } from './game/storage';

interface Burst {
  id: number;
  label: string;
  x: number;
  y: number;
}

interface Cell {
  x: number;
  y: number;
}

const screenSet = new Set<ScreenId>(navOrder);
const grid = { width: 6, height: 6 };
const firstOpenCell: Cell = { x: 3, y: 3 };

function coerceScreen(value: string): ScreenId {
  return screenSet.has(value as ScreenId) ? (value as ScreenId) : 'home';
}

function nextSave(updater: (save: PrototypeSave) => PrototypeSave) {
  return (current: PrototypeSave) => {
    const updated = updater(current);
    savePrototype(updated);
    return updated;
  };
}

function assetStyle(x: number, y: number, w: number): React.CSSProperties {
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${w}%`
  };
}

function gridToScene(cell: Cell, decor: DecorItem) {
  return {
    x: 26 + cell.x * 7.2,
    y: 39 + cell.y * 5.4,
    w: Math.max(12, decor.scene.w * 0.72)
  };
}

export function App() {
  const [save, setSave] = useState<PrototypeSave>(() => loadSave());
  const [screen, setScreenState] = useState<ScreenId>(() => coerceScreen(loadSave().screen));
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [selectedDecorId, setSelectedDecorId] = useState('cloud-lamp');
  const [selectedCell, setSelectedCell] = useState<Cell>(firstOpenCell);
  const [rotation, setRotation] = useState(0);
  const [status, setStatus] = useState('Runtime parts prototype');
  const [missingAssets, setMissingAssets] = useState<string[]>([]);

  const current = screens[screen];
  const economy = save.economy;
  const selectedDecor = decorItems.find((item) => item.id === selectedDecorId) ?? decorItems[0];
  const selectedOutfits = outfits.filter((item) => save.selectedOutfitIds.includes(item.id));
  const activeTheme =
    backgroundThemes.find((theme) => theme.id === save.selectedBackgroundId) ?? backgroundThemes[0];

  const allAssetPaths = useMemo(
    () => [
      ...backgroundThemes.map((theme) => theme.src),
      ...Object.values(screens).map((item) => item.image),
      ...decorItems.map((item) => item.src),
      ...outfits.map((item) => item.src),
      ...Object.values(runtimeAssets)
    ],
    []
  );

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
        nextSave((currentSave) => ({
          ...currentSave,
          economy: addIdleIncome(currentSave.economy, 1000)
        }))
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

  function updateEconomy(updater: (economy: EconomyState) => EconomyState) {
    setSave(nextSave((currentSave) => ({ ...currentSave, economy: updater(currentSave.economy) })));
  }

  function tapDegu() {
    updateEconomy((currentEconomy) => tapForCoins(currentEconomy));
    setBursts((items) => [
      ...items,
      { id: Date.now(), label: '+25', x: 52 + Math.random() * 4, y: 49 + Math.random() * 4 }
    ]);
    setStatus('Degu tap +25 coins');
  }

  function selectBackground(themeId: string) {
    const theme = backgroundThemes.find((item) => item.id === themeId);
    if (!theme) return;

    setSave(nextSave((currentSave) => ({ ...currentSave, selectedBackgroundId: theme.id })));
    setStatus(`Theme: ${theme.label}`);
  }

  function selectVariant(variantId: string) {
    setSave(nextSave((currentSave) => ({ ...currentSave, selectedVariantId: variantId })));
    setStatus(`Variant: ${variantId}`);
  }

  function toggleOutfit(outfitId: string) {
    setSave(
      nextSave((currentSave) => {
        const active = currentSave.selectedOutfitIds.includes(outfitId);
        return {
          ...currentSave,
          selectedOutfitIds: active
            ? currentSave.selectedOutfitIds.filter((id) => id !== outfitId)
            : [...currentSave.selectedOutfitIds, outfitId]
        };
      })
    );
    setStatus(`Outfit: ${outfitId}`);
  }

  function placeSelectedDecor() {
    const candidate: PlacedDecor = {
      instanceId: `${selectedDecor.id}-${Date.now()}`,
      itemId: selectedDecor.id,
      cellX: selectedCell.x,
      cellY: selectedCell.y,
      footprint: selectedDecor.footprint
    };

    if (!canPlaceDecor(grid, save.placedDecor, candidate.cellX, candidate.cellY, candidate.footprint)) {
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
    const result = runPulls(skyGiftBanner, count, save.economy, {
      ownedRewardIds: new Set(save.ownedRewardIds),
      pullsSinceRare: save.pullsSinceRare,
      random: browserRandom
    });

    if (!result) {
      setStatus('Need earned tickets');
      return;
    }

    const rewardIds = result.results.map((pull) => pull.entry.rewardId);
    setSave(
      nextSave((currentSave) => ({
        ...currentSave,
        economy: result.economy,
        pullsSinceRare: result.pullsSinceRare,
        ownedRewardIds: Array.from(new Set([...currentSave.ownedRewardIds, ...rewardIds])),
        gachaHistory: [...rewardIds, ...currentSave.gachaHistory].slice(0, 24)
      }))
    );
    setStatus(`${count} sky gift${count === 1 ? '' : 's'} opened`);
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

        <Hud economy={economy} status={status} activeTheme={activeTheme} missingAssets={missingAssets} />

        {(screen === 'home' || screen === 'placement' || screen === 'storage') && (
          <IslandScene
            save={save}
            selectedDecor={selectedDecor}
            selectedCell={selectedCell}
            screen={screen}
            onTapDegu={tapDegu}
            onSelectCell={setSelectedCell}
          />
        )}

        {screen === 'placement' && (
          <PlacementPanel
            selectedDecorId={selectedDecorId}
            selectedCell={selectedCell}
            rotation={rotation}
            onSelectDecor={setSelectedDecorId}
            onRotate={() => {
              setRotation((value) => (value + 90) % 360);
              setStatus('Rotated placement ghost');
            }}
            onConfirm={placeSelectedDecor}
            onCancel={() => setStatus('Placement cancelled')}
          />
        )}

        {screen === 'wardrobe' && (
          <WardrobeScreen
            selectedVariantId={save.selectedVariantId}
            selectedOutfits={selectedOutfits}
            selectedOutfitIds={save.selectedOutfitIds}
            onSelectVariant={selectVariant}
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
            selectedBackgroundId={save.selectedBackgroundId}
            onSelectBackground={selectBackground}
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

function Hud({
  economy,
  status,
  activeTheme,
  missingAssets
}: {
  economy: EconomyState;
  status: string;
  activeTheme: BackgroundTheme;
  missingAssets: string[];
}) {
  return (
    <header className="hud">
      <div className="resource coin-resource">
        <img src={runtimeAssets.coin} alt="" />
        <strong>{formatNumber(economy.coins)}</strong>
        <span>+{economy.incomePerSecond}/s</span>
      </div>
      <div className="resource ticket-resource">
        <img src={runtimeAssets.ticket} alt="" />
        <strong>{formatNumber(economy.tickets)}</strong>
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

function IslandScene({
  save,
  selectedDecor,
  selectedCell,
  screen,
  onTapDegu,
  onSelectCell
}: {
  save: PrototypeSave;
  selectedDecor: DecorItem;
  selectedCell: Cell;
  screen: ScreenId;
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
            src={decor.src}
            alt=""
            draggable={false}
            style={{ ...assetStyle(scene.x, scene.y, scene.w), zIndex: 20 + placed.cellY }}
          />
        );
      })}

      {screen === 'placement' && (
        <div className="placement-grid" aria-label="Placement cells">
          {Array.from({ length: grid.width * grid.height }).map((_, index) => {
            const x = index % grid.width;
            const y = Math.floor(index / grid.width);
            const valid = canPlaceDecor(grid, save.placedDecor, x, y, selectedDecor.footprint);
            return (
              <button
                key={`${x}:${y}`}
                className="cell-button"
                type="button"
                data-selected={x === selectedCell.x && y === selectedCell.y}
                data-valid={valid}
                style={{ left: `${25 + x * 7.2}%`, top: `${39 + y * 5.4}%` }}
                aria-label={`Select cell ${x + 1}, ${y + 1}`}
                onClick={() => onSelectCell({ x, y })}
              />
            );
          })}
          <img
            className="runtime-decor placement-ghost"
            src={selectedDecor.src}
            alt=""
            draggable={false}
            style={assetStyle(ghost.x, ghost.y, ghost.w)}
          />
        </div>
      )}

      <button className="degu-button" type="button" aria-label="Tap degu for coins" onClick={onTapDegu}>
        <img
          className="degu-sprite"
          src={runtimeAssets.deguCandidate}
          alt="Temporary degu candidate A"
          draggable={false}
        />
        <span className="candidate-badge">candidate</span>
      </button>
    </div>
  );
}

function PlacementPanel({
  selectedDecorId,
  selectedCell,
  rotation,
  onSelectDecor,
  onRotate,
  onConfirm,
  onCancel
}: {
  selectedDecorId: string;
  selectedCell: Cell;
  rotation: number;
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
        {decorItems.map((decor) => (
          <button
            key={decor.id}
            className="asset-card"
            type="button"
            data-active={selectedDecorId === decor.id}
            aria-label={`Select ${decor.label}`}
            onClick={() => onSelectDecor(decor.id)}
          >
            <img src={decor.src} alt="" draggable={false} />
            <span>+{decor.bonusPerSecond}/s</span>
          </button>
        ))}
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
  selectedOutfits,
  selectedOutfitIds,
  onSelectVariant,
  onToggleOutfit,
  onApply
}: {
  selectedVariantId: string;
  selectedOutfits: OutfitItem[];
  selectedOutfitIds: string[];
  onSelectVariant: (id: string) => void;
  onToggleOutfit: (id: string) => void;
  onApply: () => void;
}) {
  return (
    <section className="wardrobe-screen" aria-label="Wardrobe">
      <div className="wardrobe-stage">
        <img className="wardrobe-degu" src={runtimeAssets.deguCandidate} alt="Temporary degu candidate A" draggable={false} />
        {selectedOutfits.map((outfit) => (
          <img
            key={outfit.id}
            className={`outfit-preview outfit-${outfit.slot}`}
            src={outfit.src}
            alt=""
            draggable={false}
          />
        ))}
        <span className="candidate-badge wardrobe-candidate">design pending</span>
      </div>
      <div className="variant-row">
        {deguVariants.map((variant) => (
          <button
            key={variant.id}
            className="variant-button"
            type="button"
            style={{ '--swatch': variant.swatch } as React.CSSProperties}
            data-active={variant.id === selectedVariantId}
            onClick={() => onSelectVariant(variant.id)}
            aria-label={`Select ${variant.label}`}
          />
        ))}
      </div>
      <div className="wardrobe-grid">
        {outfits.map((outfit) => (
          <button
            key={outfit.id}
            className="asset-card outfit-card-ui"
            type="button"
            data-active={selectedOutfitIds.includes(outfit.id)}
            onClick={() => onToggleOutfit(outfit.id)}
            aria-label={`Toggle ${outfit.label}`}
          >
            <img src={outfit.src} alt="" draggable={false} />
          </button>
        ))}
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
    outfits.find((item) => item.id === 'flower-crown'),
    decorItems.find((item) => item.id === 'angel-fountain'),
    outfits.find((item) => item.id === 'celestial-cape')
  ].filter(Boolean) as Array<DecorItem | OutfitItem>;

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
  selectedBackgroundId,
  onSelectBackground
}: {
  save: PrototypeSave;
  activeTheme: BackgroundTheme;
  selectedBackgroundId: string;
  onSelectBackground: (themeId: string) => void;
}) {
  return (
    <section className="storage-sheet" aria-label="Storage and customization">
      <div className="storage-head">
        <strong>Storage</strong>
        <span>{save.ownedRewardIds.length} rewards</span>
      </div>
      <div className="storage-stats">
        <span>{save.placedDecor.length} decor</span>
        <span>{save.gachaHistory.length} pulls</span>
      </div>
      <div className="theme-panel">
        <div className="mode-row compact">
          <strong>Theme</strong>
          <span>{activeTheme.label}</span>
        </div>
        <div className="theme-tray">
          {backgroundThemes.map((theme) => (
            <button
              key={theme.id}
              className="theme-card"
              type="button"
              data-active={selectedBackgroundId === theme.id}
              onClick={() => onSelectBackground(theme.id)}
              aria-label={`Switch background to ${theme.label}`}
            >
              <img src={theme.src} alt="" draggable={false} />
              <span style={{ backgroundColor: theme.swatch }} />
            </button>
          ))}
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
