export interface GridSize {
  width: number;
  height: number;
}

export interface Footprint {
  w: number;
  h: number;
}

export interface PlacedDecor {
  instanceId: string;
  itemId: string;
  cellX: number;
  cellY: number;
  footprint: Footprint;
}

export function canPlaceDecor(
  grid: GridSize,
  placed: PlacedDecor[],
  cellX: number,
  cellY: number,
  footprint: Footprint
): boolean {
  if (cellX < 0 || cellY < 0) return false;
  if (cellX + footprint.w > grid.width) return false;
  if (cellY + footprint.h > grid.height) return false;

  const candidate = cellsFor(cellX, cellY, footprint);
  const occupied = new Set(
    placed.flatMap((item) => cellsFor(item.cellX, item.cellY, item.footprint))
  );

  return candidate.every((cell) => !occupied.has(cell));
}

function cellsFor(cellX: number, cellY: number, footprint: Footprint): string[] {
  const cells: string[] = [];
  for (let y = cellY; y < cellY + footprint.h; y += 1) {
    for (let x = cellX; x < cellX + footprint.w; x += 1) {
      cells.push(`${x}:${y}`);
    }
  }
  return cells;
}
