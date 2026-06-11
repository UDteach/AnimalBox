import { describe, expect, it } from 'vitest';
import { canPlaceDecor, type PlacedDecor } from './placement';

describe('placement validation', () => {
  const placed: PlacedDecor[] = [
    {
      instanceId: 'a',
      itemId: 'hay-bed',
      cellX: 2,
      cellY: 2,
      footprint: { w: 2, h: 1 }
    }
  ];

  it('rejects overlapping decor footprints', () => {
    expect(canPlaceDecor({ width: 6, height: 6 }, placed, 3, 2, { w: 1, h: 1 })).toBe(false);
  });

  it('rejects off-grid placement', () => {
    expect(canPlaceDecor({ width: 6, height: 6 }, placed, 5, 5, { w: 2, h: 2 })).toBe(false);
  });

  it('accepts empty valid cells', () => {
    expect(canPlaceDecor({ width: 6, height: 6 }, placed, 0, 0, { w: 1, h: 1 })).toBe(true);
  });

  it('rejects non-positive footprints', () => {
    expect(canPlaceDecor({ width: 6, height: 6 }, placed, 0, 0, { w: 0, h: 1 })).toBe(false);
    expect(canPlaceDecor({ width: 6, height: 6 }, placed, 0, 0, { w: -1, h: 2 })).toBe(false);
    expect(canPlaceDecor({ width: 6, height: 6 }, placed, 0, 0, { w: 1, h: -1 })).toBe(false);
  });
});
