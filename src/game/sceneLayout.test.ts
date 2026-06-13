import { describe, expect, it } from 'vitest';

import { decorItems } from './content';
import { placementGrid } from './maps';
import { withRotatedFootprint } from './placement';
import { canPlaceDecorInScene, decorSceneBounds, gridToScene, sceneLayout } from './sceneLayout';

const grid = placementGrid;

describe('scene layout contracts', () => {
  it('keeps at least one scene-safe placement for every decor item', () => {
    for (const decor of decorItems) {
      let validCells = 0;
      for (let y = 0; y <= grid.height - decor.footprint.h; y += 1) {
        for (let x = 0; x <= grid.width - decor.footprint.w; x += 1) {
          if (canPlaceDecorInScene(grid, [], x, y, decor)) validCells += 1;
        }
      }

      expect(validCells, decor.id).toBeGreaterThan(0);
    }
  });

  it('keeps at least one scene-safe placement for every rotated decor footprint', () => {
    for (const decor of decorItems) {
      for (const rotation of [0, 90, 180, 270]) {
        const oriented = withRotatedFootprint(decor, rotation);
        let validCells = 0;
        for (let y = 0; y <= grid.height - oriented.footprint.h; y += 1) {
          for (let x = 0; x <= grid.width - oriented.footprint.w; x += 1) {
            if (canPlaceDecorInScene(grid, [], x, y, oriented)) validCells += 1;
          }
        }

        expect(validCells, `${decor.id} ${rotation}deg`).toBeGreaterThan(0);
      }
    }
  });

  it('keeps every accepted decor placement inside the playable island scene band', () => {
    for (const decor of decorItems) {
      for (let y = 0; y <= grid.height - decor.footprint.h; y += 1) {
        for (let x = 0; x <= grid.width - decor.footprint.w; x += 1) {
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

  it('rejects decor below the dense playable grid', () => {
    const windmill = decorItems.find((item) => item.id === 'windmill');
    expect(windmill).toBeDefined();
    expect(canPlaceDecorInScene(grid, [], 0, grid.height - 1, windmill!)).toBe(false);
    expect(canPlaceDecorInScene(grid, [], 0, grid.height, windmill!)).toBe(false);
  });

  it('rejects decor that would sit under the degu keepout area', () => {
    const clover = decorItems.find((item) => item.id === 'clover-patch');
    expect(clover).toBeDefined();
    expect(canPlaceDecorInScene(grid, [], 5, 2, clover!)).toBe(false);
  });

  it('uses bottom-center anchors for multi-cell decor footprints', () => {
    const hayBed = decorItems.find((item) => item.id === 'hay-bed');
    expect(hayBed).toBeDefined();

    const scene = gridToScene({ x: 2, y: 3 }, hayBed!);
    expect(scene.x).toBeCloseTo(sceneLayout.gridOriginX + 2.5 * sceneLayout.gridStepX);
    expect(scene.y).toBeCloseTo(sceneLayout.gridOriginY + 3 * sceneLayout.gridStepY);
  });
});
