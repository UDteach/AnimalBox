import type { CSSProperties } from 'react';

import { deguVariants, outfits, pixelDeguShots } from '../content';

interface PixelDeguStageProps {
  selectedShotId: string;
  selectedVariantId: string;
  selectedOutfitIds: string[];
  mode: 'island' | 'wardrobe';
}

export function PixelDeguStage({
  selectedShotId,
  selectedVariantId,
  selectedOutfitIds,
  mode
}: PixelDeguStageProps) {
  const shot = pixelDeguShots.find((item) => item.id === selectedShotId) ?? pixelDeguShots[3];
  const variant = deguVariants.find((item) => item.id === selectedVariantId) ?? deguVariants[0];
  const activeOutfits = selectedOutfitIds
    .map((id) => outfits.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const backOutfits = activeOutfits.filter(
    (item) => item.slot === 'back' || item.id === 'angel-halo-wings'
  );
  const frontOutfits = activeOutfits.filter(
    (item) => item.slot !== 'back' && item.id !== 'angel-halo-wings'
  );

  return (
    <section
      className={`pixel-degu-stage pixel-degu-stage--${mode}`}
      style={{ '--degu-filter': variant.filter } as CSSProperties}
      aria-label={`Pixel degu ${shot.label}`}
    >
      <div className="pixel-degu-aura" />
      {backOutfits.map((outfit) => (
        <img
          key={outfit.id}
          className={`pixel-degu-outfit pixel-degu-outfit--${outfit.id}`}
          src={outfit.src}
          alt=""
          draggable={false}
        />
      ))}
      <img className="pixel-degu-image" src={shot.src} alt="" draggable={false} />
      {frontOutfits.map((outfit) => (
        <img
          key={outfit.id}
          className={`pixel-degu-outfit pixel-degu-outfit--${outfit.id}`}
          src={outfit.src}
          alt=""
          draggable={false}
        />
      ))}
      <span className="pixel-shot-chip">{shot.id}</span>
    </section>
  );
}
