import { describe, expect, it } from 'vitest';

import { outfits } from '../content';
import { outfitAnchors } from './outfitAnchors';

describe('pixel outfit anchors', () => {
  it('defines a visual anchor for every wardrobe item', () => {
    expect(Object.keys(outfitAnchors).sort()).toEqual(outfits.map((outfit) => outfit.id).sort());
  });

  it('keeps outfit overlays within the degu stage-safe area', () => {
    Object.entries(outfitAnchors).forEach(([outfitId, anchor]) => {
      expect(anchor.top, `${outfitId} top`).toBeGreaterThanOrEqual(12);
      expect(anchor.top, `${outfitId} top`).toBeLessThanOrEqual(58);
      expect(anchor.left, `${outfitId} left`).toBeGreaterThanOrEqual(8);
      expect(anchor.left, `${outfitId} left`).toBeLessThanOrEqual(62);
      expect(anchor.width, `${outfitId} width`).toBeGreaterThanOrEqual(14);
      expect(anchor.width, `${outfitId} width`).toBeLessThanOrEqual(52);
      expect(anchor.left + anchor.width, `${outfitId} right`).toBeLessThanOrEqual(92);
      expect(Math.abs(anchor.rotate), `${outfitId} rotate`).toBeLessThanOrEqual(18);
    });
  });
});
