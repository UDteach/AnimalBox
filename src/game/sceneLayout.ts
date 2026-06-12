import type { CSSProperties } from 'react';

import type { DecorItem } from './content';
import { canPlaceDecor, type Cell, type GridSize, type PlacedDecor } from './placement';

export interface SceneRect {
  x: number;
  y: number;
  w: number;
}

export interface SceneBounds {
  x: number;
  y: number;
  w: number;
  h: number;
  right: number;
  bottom: number;
}

export const sceneLayout = {
  gridOriginX: 25,
  gridOriginY: 39,
  gridStepX: 7.2,
  gridStepY: 5.4,
  minDecorWidth: 10.5,
  decorScale: 0.66,
  decorHeightRatioMin: 0.72,
  decorHeightRatioMax: 1.1,
  decorSafe: {
    minX: 11,
    maxX: 89,
    minY: 36,
    maxY: 60
  },
  deguKeepout: {
    minX: 38,
    maxX: 62,
    minY: 37,
    maxY: 55
  }
};

export function assetStyle(x: number, y: number, w: number): CSSProperties {
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${w}%`
  };
}

export function gridToScene(cell: Cell, decor: DecorItem): SceneRect {
  const anchorX = cell.x + (decor.footprint.w - 1) / 2;
  const anchorY = cell.y + decor.footprint.h - 1;

  return {
    x: sceneLayout.gridOriginX + anchorX * sceneLayout.gridStepX,
    y: sceneLayout.gridOriginY + anchorY * sceneLayout.gridStepY,
    w: Math.max(sceneLayout.minDecorWidth, decor.scene.w * sceneLayout.decorScale)
  };
}

export function decorSceneBounds(cell: Cell, decor: DecorItem): SceneBounds {
  const rect = gridToScene(cell, decor);
  const heightRatio = Math.min(
    sceneLayout.decorHeightRatioMax,
    Math.max(
      sceneLayout.decorHeightRatioMin,
      decor.footprint.h / Math.max(1, decor.footprint.w)
    )
  );
  const height = rect.w * heightRatio;
  const x = rect.x - rect.w / 2;
  const y = rect.y - height;

  return {
    x,
    y,
    w: rect.w,
    h: height,
    right: x + rect.w,
    bottom: rect.y
  };
}

export function gridCellAnchor(cell: Cell): Pick<SceneRect, 'x' | 'y'> {
  return {
    x: sceneLayout.gridOriginX + cell.x * sceneLayout.gridStepX,
    y: sceneLayout.gridOriginY + cell.y * sceneLayout.gridStepY
  };
}

export function isDecorInsideSceneSafe(cell: Cell, decor: DecorItem): boolean {
  const bounds = decorSceneBounds(cell, decor);
  const safe = sceneLayout.decorSafe;

  return (
    bounds.x >= safe.minX &&
    bounds.y >= safe.minY &&
    bounds.right <= safe.maxX &&
    bounds.bottom <= safe.maxY &&
    !intersectsSceneKeepout(bounds, sceneLayout.deguKeepout)
  );
}

function intersectsSceneKeepout(
  bounds: SceneBounds,
  keepout: { minX: number; maxX: number; minY: number; maxY: number }
): boolean {
  return (
    bounds.x < keepout.maxX &&
    bounds.right > keepout.minX &&
    bounds.y < keepout.maxY &&
    bounds.bottom > keepout.minY
  );
}

export function canPlaceDecorInScene(
  grid: GridSize,
  placed: PlacedDecor[],
  cellX: number,
  cellY: number,
  decor: DecorItem
): boolean {
  return (
    canPlaceDecor(grid, placed, cellX, cellY, decor.footprint) &&
    isDecorInsideSceneSafe({ x: cellX, y: cellY }, decor)
  );
}
