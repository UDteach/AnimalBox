import { describe, expect, it } from 'vitest';

import { accessoryItems } from '../content';
import { floatingItemAnchors } from './floatingItemAnchors';

describe('pixel floating item anchors', () => {
  it('defines a visual anchor for every floating item', () => {
    expect(Object.keys(floatingItemAnchors).sort()).toEqual(accessoryItems.map((item) => item.id).sort());
  });

  it('keeps floating items outside the central body area', () => {
    Object.entries(floatingItemAnchors).forEach(([itemId, anchor]) => {
      const item = accessoryItems.find((candidate) => candidate.id === itemId);
      expect(anchor.top, `${itemId} top`).toBeGreaterThanOrEqual(10);
      expect(anchor.top, `${itemId} top`).toBeLessThanOrEqual(68);
      expect(anchor.left, `${itemId} left`).toBeGreaterThanOrEqual(8);
      expect(anchor.left, `${itemId} left`).toBeLessThanOrEqual(90);
      expect(anchor.width, `${itemId} width`).toBeGreaterThanOrEqual(16);
      expect(anchor.width, `${itemId} width`).toBeLessThanOrEqual(item?.kind === 'wearable' ? 50 : 22);
      expect(Math.abs(anchor.rotate), `${itemId} rotate`).toBeLessThanOrEqual(item?.kind === 'wearable' ? 18 : 14);

      const horizontalCenterOverlap = anchor.left > 30 && anchor.left < 70;
      const verticalBodyOverlap = anchor.top > 28 && anchor.top < 74;
      if ((item?.kind ?? 'float') === 'float') {
        expect(horizontalCenterOverlap && verticalBodyOverlap, `${itemId} body overlap zone`).toBe(false);
      }
    });
  });
});
