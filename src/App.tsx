import { useEffect, useMemo, useState } from 'react';
import { decorItems, deguVariants, navOrder, outfits, screens, type ScreenId } from './game/content';
import { addIdleIncome, formatNumber, tapForCoins, type EconomyState } from './game/economy';
import { browserRandom, runPulls, skyGiftBanner } from './game/gacha';
import { canPlaceDecor, type PlacedDecor } from './game/placement';
import { defaultSave, loadSave, savePrototype, type PrototypeSave } from './game/storage';

interface Burst {
  id: number;
  label: string;
  x: number;
  y: number;
}

const screenSet = new Set<ScreenId>(navOrder);
const grid = { width: 6, height: 6 };

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

export function App() {
  const [save, setSave] = useState<PrototypeSave>(() => loadSave());
  const [screen, setScreenState] = useState<ScreenId>(() => coerceScreen(loadSave().screen));
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [selectedDecorId, setSelectedDecorId] = useState('clover-patch');
  const [rotation, setRotation] = useState(0);
  const [status, setStatus] = useState('ImageGen mock fidelity prototype');

  const current = screens[screen];
  const economy = save.economy;
  const selectedDecor = decorItems.find((item) => item.id === selectedDecorId) ?? decorItems[0];
  const selectedVariant = deguVariants.find((variant) => variant.id === save.selectedVariantId) ?? deguVariants[0];

  useEffect(() => {
    Object.values(screens).forEach((screenInfo) => {
      const image = new Image();
      image.src = screenInfo.image;
    });
  }, []);

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
      { id: Date.now(), label: '+25', x: 49 + Math.random() * 7, y: 49 + Math.random() * 5 }
    ]);
    setStatus('Degu tap +25 coins');
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
      cellX: 3,
      cellY: 3,
      footprint: selectedDecor.footprint
    };

    if (!canPlaceDecor(grid, save.placedDecor, candidate.cellX, candidate.cellY, candidate.footprint)) {
      setStatus('That cell is blocked');
      return;
    }

    setSave(
      nextSave((currentSave) => ({
        ...currentSave,
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
        '--screen-h': current.height
      }) as React.CSSProperties,
    [current.height, current.width]
  );

  return (
    <main className="app" data-view={screen}>
      <section className="phone" style={style} aria-label={`AnimalBox ${current.label}`}>
        <img className="mockup" src={current.image} alt="" draggable={false} />
        <div className="live-counter sr-only" aria-live="polite">
          <span>{formatNumber(economy.coins)}</span>
          <small>+{economy.incomePerSecond}/s</small>
        </div>

        <div className="status-chip sr-only" role="status">
          <span>{status}</span>
          <small>
            {formatNumber(economy.tickets)} tickets · {formatNumber(economy.shards)} shards
          </small>
        </div>

        {screen === 'home' ? <HomeHotspots onTap={tapDegu} /> : null}
        {screen === 'placement' ? (
          <PlacementHotspots
            selectedDecorId={selectedDecorId}
            rotation={rotation}
            onSelectDecor={setSelectedDecorId}
            onRotate={() => {
              setRotation((value) => (value + 90) % 360);
              setStatus('Rotated placement ghost');
            }}
            onConfirm={placeSelectedDecor}
            onCancel={() => setStatus('Placement cancelled')}
          />
        ) : null}
        {screen === 'wardrobe' ? (
          <WardrobeHotspots
            selectedVariantId={selectedVariant.id}
            selectedOutfitIds={save.selectedOutfitIds}
            onSelectVariant={selectVariant}
            onToggleOutfit={toggleOutfit}
            onApply={() => setStatus('Wardrobe applied')}
          />
        ) : null}
        {screen === 'gacha' ? (
          <GachaHotspots onSingle={() => runGacha(1)} onTen={() => runGacha(10)} />
        ) : null}
        {screen === 'storage' ? <StorageOverlay save={save} /> : null}

        {bursts.map((burst) => (
          <span
            key={burst.id}
            className="coin-burst"
            style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
          >
            {burst.label}
          </span>
        ))}

        <NavHotspots active={screen} onNavigate={setScreen} />
      </section>
    </main>
  );
}

function HomeHotspots({ onTap }: { onTap: () => void }) {
  return (
    <button className="hotspot degu-tap" type="button" aria-label="Tap degu for coins" onClick={onTap} />
  );
}

function PlacementHotspots({
  selectedDecorId,
  rotation,
  onSelectDecor,
  onRotate,
  onConfirm,
  onCancel
}: {
  selectedDecorId: string;
  rotation: number;
  onSelectDecor: (id: string) => void;
  onRotate: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="placement-pill sr-only">
        {selectedDecorId} · {rotation}°
      </div>
      {decorItems.slice(0, 6).map((decor, index) => (
        <button
          key={decor.id}
          className="hotspot decor-card"
          style={{ left: `${6 + index * 14.5}%` }}
          type="button"
          aria-label={`Select ${decor.label}`}
          onClick={() => onSelectDecor(decor.id)}
          data-active={decor.id === selectedDecorId}
        />
      ))}
      <button className="hotspot placement-cancel" type="button" aria-label="Cancel placement" onClick={onCancel} />
      <button className="hotspot placement-rotate" type="button" aria-label="Rotate placement" onClick={onRotate} />
      <button className="hotspot placement-confirm" type="button" aria-label="Confirm placement" onClick={onConfirm} />
    </>
  );
}

function WardrobeHotspots({
  selectedVariantId,
  selectedOutfitIds,
  onSelectVariant,
  onToggleOutfit,
  onApply
}: {
  selectedVariantId: string;
  selectedOutfitIds: string[];
  onSelectVariant: (id: string) => void;
  onToggleOutfit: (id: string) => void;
  onApply: () => void;
}) {
  return (
    <>
      <div className="wardrobe-pill sr-only">Body: {selectedVariantId}</div>
      {deguVariants.map((variant, index) => (
        <button
          key={variant.id}
          className="hotspot variant-swatch"
          style={{ left: `${27 + index * 14.2}%`, backgroundColor: variant.swatch }}
          type="button"
          aria-label={`Select ${variant.label}`}
          data-active={variant.id === selectedVariantId}
          onClick={() => onSelectVariant(variant.id)}
        />
      ))}
      {outfits.map((outfit, index) => (
        <button
          key={outfit.id}
          className="hotspot outfit-card"
          style={{
            left: `${8 + (index % 4) * 22.4}%`,
            top: `${64.5 + Math.floor(index / 4) * 12.4}%`
          }}
          type="button"
          aria-label={`Toggle ${outfit.label}`}
          data-active={selectedOutfitIds.includes(outfit.id)}
          onClick={() => onToggleOutfit(outfit.id)}
        />
      ))}
      <button className="hotspot wardrobe-apply" type="button" aria-label="Apply wardrobe" onClick={onApply} />
    </>
  );
}

function GachaHotspots({ onSingle, onTen }: { onSingle: () => void; onTen: () => void }) {
  return (
    <>
      <div className="gacha-pill sr-only">Earned tickets only</div>
      <button className="hotspot gacha-single" type="button" aria-label="Open one sky gift" onClick={onSingle} />
      <button className="hotspot gacha-ten" type="button" aria-label="Open ten sky gifts" onClick={onTen} />
    </>
  );
}

function StorageOverlay({ save }: { save: PrototypeSave }) {
  return (
    <div className="storage-sheet">
      <strong>Storage</strong>
      <span>{save.ownedRewardIds.length} rewards</span>
      <span>{save.placedDecor.length} placed decor</span>
    </div>
  );
}

function NavHotspots({
  active,
  onNavigate
}: {
  active: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}) {
  return (
    <nav className="nav-hotspots" aria-label="AnimalBox screens">
      {navOrder.map((screenId, index) => (
        <button
          key={screenId}
          className="hotspot nav-button"
          style={{ left: `${4 + index * 19.2}%` }}
          type="button"
          aria-label={`Open ${screens[screenId].label}`}
          data-active={active === screenId}
          onClick={() => onNavigate(screenId)}
        />
      ))}
    </nav>
  );
}
