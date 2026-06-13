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

export interface GridMeshLine {
  id: string;
  kind: 'row' | 'column';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
  angle: number;
}

export const sceneLayout = {
  gridOriginX: 9.2,
  gridOriginY: 42.4,
  gridStepX: 4.18,
  gridStepY: 1.35,
  gridDepthX: 1.16,
  minDecorWidth: 6.15,
  decorScale: 0.42,
  decorHeightRatioMin: 0.72,
  decorHeightRatioMax: 1.1,
  decorSafe: {
    minX: 7,
    maxX: 94,
    minY: 35,
    maxY: 55
  },
  deguKeepout: {
    minX: 40,
    maxX: 62,
    minY: 43,
    maxY: 53
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
    x: sceneLayout.gridOriginX + anchorX * sceneLayout.gridStepX + anchorY * sceneLayout.gridDepthX,
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
    x: sceneLayout.gridOriginX + cell.x * sceneLayout.gridStepX + cell.y * sceneLayout.gridDepthX,
    y: sceneLayout.gridOriginY + cell.y * sceneLayout.gridStepY
  };
}

export function gridMeshLines(grid: GridSize): GridMeshLine[] {
  const lines: GridMeshLine[] = [];

  for (let y = 0; y < grid.height; y += 1) {
    lines.push(createGridMeshLine('row', `row-${y}`, { x: 0, y }, { x: grid.width - 1, y }));
  }

  for (let x = 0; x < grid.width; x += 1) {
    lines.push(createGridMeshLine('column', `column-${x}`, { x, y: 0 }, { x, y: grid.height - 1 }));
  }

  return lines;
}

function createGridMeshLine(kind: GridMeshLine['kind'], id: string, start: Cell, end: Cell): GridMeshLine {
  const from = gridCellAnchor(start);
  const to = gridCellAnchor(end);
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  return {
    id,
    kind,
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    length: Math.hypot(dx, dy),
    angle: Math.atan2(dy, dx) * (180 / Math.PI)
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
