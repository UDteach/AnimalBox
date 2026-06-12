import type { CSSProperties } from 'react';

export interface OutfitAnchor {
  top: number;
  left: number;
  width: number;
  rotate: number;
  zIndex?: number;
}

export const outfitAnchors: Record<string, OutfitAnchor> = {
  'straw-hat': { top: 21, left: 18, width: 31, rotate: -15 },
  'flower-crown': { top: 30, left: 21, width: 31, rotate: -9 },
  'round-glasses': { top: 38, left: 23, width: 25, rotate: -5 },
  'pastel-ribbon': { top: 52, left: 27, width: 24, rotate: -5 },
  'celestial-cape': { top: 45, left: 38, width: 39, rotate: 7, zIndex: 1 },
  'angel-halo-wings': { top: 22, left: 34, width: 49, rotate: 4, zIndex: 1 },
  'acorn-beret': { top: 21, left: 18, width: 31, rotate: -14 },
  'mint-scarf': { top: 52, left: 27, width: 26, rotate: -5 },
  'leaf-cape': { top: 43, left: 38, width: 40, rotate: 7, zIndex: 1 },
  'star-hairpin': { top: 28, left: 22, width: 19, rotate: -10 },
  'explorer-goggles': { top: 38, left: 22, width: 27, rotate: -5 },
  'cozy-poncho': { top: 43, left: 34, width: 44, rotate: 6, zIndex: 1 },
  'sky-satchel': { top: 51, left: 50, width: 23, rotate: 5, zIndex: 4 },
  'daisy-ear-clip': { top: 30, left: 16, width: 18, rotate: -12 },
  'cloud-cap': { top: 22, left: 17, width: 33, rotate: -10 },
  'clover-necklace': { top: 52, left: 26, width: 27, rotate: -4 },
  'picnic-blanket-cape': { top: 44, left: 35, width: 43, rotate: 6, zIndex: 1 },
  'tiny-cheek-sticker': { top: 40, left: 24, width: 22, rotate: -5 }
};

export function outfitAnchorStyle(outfitId: string): CSSProperties {
  const anchor = outfitAnchors[outfitId];
  if (!anchor) return {};

  return {
    top: `${anchor.top}%`,
    left: `${anchor.left}%`,
    width: `${anchor.width}%`,
    transform: `rotate(${anchor.rotate}deg)`,
    zIndex: anchor.zIndex
  };
}
