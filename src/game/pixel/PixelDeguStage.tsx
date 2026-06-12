import type { CSSProperties } from 'react';

import { accessoryItems, deguVariants, pixelDeguShots } from '../content';
import { floatingItemAnchorStyle } from './floatingItemAnchors';
import type { AccessoryPlacement } from '../storage';

interface PixelDeguStageProps {
  selectedShotId: string;
  selectedVariantId: string;
  selectedOutfitIds: string[];
  accessoryPlacements?: Record<string, AccessoryPlacement>;
  customFilter?: string;
  mode: 'island' | 'wardrobe';
}

export function PixelDeguStage({
  selectedShotId,
  selectedVariantId,
  selectedOutfitIds,
  accessoryPlacements = {},
  customFilter,
  mode
}: PixelDeguStageProps) {
  const shot = pixelDeguShots.find((item) => item.id === selectedShotId) ?? pixelDeguShots[3];
  const variant = deguVariants.find((item) => item.id === selectedVariantId) ?? deguVariants[0];
  const activeItems = selectedOutfitIds
    .map((id) => accessoryItems.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <section
      className={`pixel-degu-stage pixel-degu-stage--${mode}`}
      style={{ '--degu-filter': customFilter ?? variant.filter } as CSSProperties}
      aria-label={`Pixel degu ${shot.label}`}
    >
      <div className="pixel-degu-aura" />
      <img className="pixel-degu-image" src={shot.src} alt="" draggable={false} />
      {activeItems.map((item) => (
        <img
          key={item.id}
          className={`pixel-degu-float-item pixel-degu-float-item--${item.id}`}
          data-slot={item.slot}
          data-kind={item.kind ?? 'float'}
          style={floatingItemAnchorStyle(item.id, accessoryPlacements[item.id])}
          src={item.src}
          alt=""
          draggable={false}
        />
      ))}
      <span className="pixel-shot-chip">{shot.id}</span>
    </section>
  );
}
