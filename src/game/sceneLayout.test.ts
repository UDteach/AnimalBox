import { describe, expect, it } from 'vitest';

import { decorItems } from './content';
import { canPlaceDecorInScene, decorSceneBounds, gridToScene, sceneLayout } from './sceneLayout';

const grid = { width: 6, height: 6 };

describe('scene layout contracts', () => {
  it('keeps at least one scene-safe placement for every decor item', () => {
    for (const decor of decorItems) {
      let validCells = 0;
      for (let y = 0; y <= 6 - decor.footprint.h; y += 1) {
        for (let x = 0; x <= 6 - decor.footprint.w; x += 1) {
          if (canPlaceDecorInScene(grid, [], x, y, decor)) validCells += 1;
        }
      }

      expect(validCells, decor.id).toBeGreaterThan(0);
    }
  });

  it('keeps every accepted decor placement inside the playable island scene band', () => {
    for (const decor of decorItems) {
      for (let y = 0; y <= 6 - decor.footprint.h; y += 1) {
        for (let x = 0; x <= 6 - decor.footprint.w; x += 1) {
          if (!canPlaceDecorInScene(grid, [], x, y, decor)) continue;
          const bounds = decorSceneBounds({ x, y }, decor);
          expect(bounds.x, `${decor.id} x ${x}:${y}`).toBeGreaterThanOrEqual(sceneLayout.decorSafe.minX);
          expect(bounds.y, `${decor.id} y ${x}:${y}`).toBeGreaterThanOrEqual(sceneLayout.decorSafe.minY);
          expect(bounds.right, `${decor.id} right ${x}:${y}`).toBeLessThanOrEqual(sceneLayout.decorSafe.maxX);
          expect(bounds.bottom, `${decor.id} bottom ${x}:${y}`).toBeLessThanOrEqual(sceneLayout.decorSafe.maxY);
        }
      }
    }
  });

  it('rejects bottom row decor that would visually collide with the lower UI band', () => {
    const hayBed = decorItems.find((item) => item.id === 'hay-bed');
    expect(hayBed).toBeDefined();
    expect(canPlaceDecorInScene(grid, [], 0, 5, hayBed!)).toBe(false);
  });

  it('rejects decor that would sit under the degu keepout area', () => {
    const clover = decorItems.find((item) => item.id === 'clover-patch');
    expect(clover).toBeDefined();
    expect(canPlaceDecorInScene(grid, [], 2, 3, clover!)).toBe(false);
  });

  it('uses bottom-center anchors for multi-cell decor footprints', () => {
    const hayBed = decorItems.find((item) => item.id === 'hay-bed');
    expect(hayBed).toBeDefined();

    const scene = gridToScene({ x: 2, y: 3 }, hayBed!);
    expect(scene.x).toBeCloseTo(sceneLayout.gridOriginX + 2.5 * sceneLayout.gridStepX);
    expect(scene.y).toBeCloseTo(sceneLayout.gridOriginY + 3 * sceneLayout.gridStepY);
  });
});
