import type { CSSProperties } from 'react';

import { accessoryItems } from '../content';
import type { AccessoryPlacement } from '../storage';

export interface FloatingItemAnchor {
  top: number;
  left: number;
  width: number;
  rotate: number;
  zIndex?: number;
  delay?: number;
}

const slotAnchors: Record<string, FloatingItemAnchor> = {
  head: { top: 22, left: 18, width: 31, rotate: -12, zIndex: 4 },
  neck: { top: 52, left: 27, width: 26, rotate: -5, zIndex: 4 },
  back: { top: 44, left: 38, width: 41, rotate: 6, zIndex: 1 },
  face: { top: 38, left: 23, width: 26, rotate: -5, zIndex: 4 },
  top: { top: 14, left: 50, width: 19, rotate: 0, zIndex: 4 },
  'left-high': { top: 33, left: 11, width: 18, rotate: -6, zIndex: 4 },
  'left-low': { top: 61, left: 16, width: 18, rotate: 5, zIndex: 4 },
  'right-high': { top: 34, left: 87, width: 18, rotate: 5, zIndex: 4 },
  'right-low': { top: 63, left: 83, width: 18, rotate: -5, zIndex: 4 }
};

const specificFloatingItemAnchors: Record<string, FloatingItemAnchor> = {
  'straw-hat': { top: 21, left: 18, width: 31, rotate: -15, delay: 0 },
  'flower-crown': { top: 30, left: 21, width: 31, rotate: -9, delay: 0 },
  'round-glasses': { top: 38, left: 23, width: 25, rotate: -5, delay: 0 },
  'pastel-ribbon': { top: 52, left: 27, width: 24, rotate: -5, delay: 0 },
  'celestial-cape': { top: 45, left: 38, width: 39, rotate: 7, zIndex: 1, delay: 0 },
  'angel-halo-wings': { top: 22, left: 34, width: 49, rotate: 4, zIndex: 1, delay: 0 },
  'acorn-beret': { top: 21, left: 18, width: 31, rotate: -14, delay: 0 },
  'mint-scarf': { top: 52, left: 27, width: 26, rotate: -5, delay: 0 },
  'leaf-cape': { top: 43, left: 38, width: 40, rotate: 7, zIndex: 1, delay: 0 },
  'star-hairpin': { top: 28, left: 22, width: 19, rotate: -10, delay: 0 },
  'explorer-goggles': { top: 38, left: 22, width: 27, rotate: -5, delay: 0 },
  'cozy-poncho': { top: 43, left: 34, width: 44, rotate: 6, zIndex: 1, delay: 0 },
  'sky-satchel': { top: 51, left: 50, width: 23, rotate: 5, zIndex: 4, delay: 0 },
  'daisy-ear-clip': { top: 30, left: 16, width: 18, rotate: -12, delay: 0 },
  'cloud-cap': { top: 22, left: 17, width: 33, rotate: -10, delay: 0 },
  'clover-necklace': { top: 52, left: 26, width: 27, rotate: -4, delay: 0 },
  'picnic-blanket-cape': { top: 44, left: 35, width: 43, rotate: 6, zIndex: 1, delay: 0 },
  'tiny-cheek-sticker': { top: 40, left: 24, width: 22, rotate: -5, delay: 0 },
  'cloud-puff': { ...slotAnchors.top, rotate: -3, delay: 0 },
  'clover-charm': { ...slotAnchors['left-high'], rotate: -9, delay: 0.2 },
  'acorn-charm': { ...slotAnchors['right-low'], rotate: 7, delay: 0.1 },
  'seed-pouch-charm': { ...slotAnchors['left-low'], rotate: -4, delay: 0.4 },
  'star-lantern-float': { ...slotAnchors.top, rotate: 6, delay: 0.3 },
  'moon-bell': { ...slotAnchors['right-high'], rotate: 8, delay: 0.5 },
  'sky-ticket-charm': { ...slotAnchors['left-high'], rotate: -7, delay: 0.1 },
  'mushroom-friend': { ...slotAnchors['right-low'], rotate: 2, delay: 0.4 },
  'sprout-buddy': { ...slotAnchors['left-low'], rotate: -3, delay: 0.7 },
  'sleepy-dust-buddy': { ...slotAnchors['right-low'], width: 20, rotate: 0, delay: 0.2 },
  'cotton-flower-puff': { ...slotAnchors['left-high'], rotate: 4, delay: 0.6 },
  'crystal-shard-float': { ...slotAnchors['right-high'], rotate: 10, delay: 0.1 },
  'bellflower-sprite': { ...slotAnchors['left-low'], rotate: -6, delay: 0.3 },
  'feather-charm': { ...slotAnchors['right-high'], rotate: -11, delay: 0.7 },
  'bread-basket': { ...slotAnchors['right-low'], rotate: -2, delay: 0.6 },
  'water-drop-buddy': { ...slotAnchors['right-high'], rotate: 4, delay: 0.8 },
  'sky-moth': { ...slotAnchors['left-high'], rotate: 7, delay: 0.4 },
  'cloud-sheep': { ...slotAnchors['right-high'], width: 20, rotate: 2, delay: 0.5 },
  'walnut-charm': { ...slotAnchors['right-low'], rotate: -7, delay: 0.2 },
  'comet-seed': { ...slotAnchors.top, width: 20, rotate: -12, delay: 0.1 },
  'spiral-shell': { ...slotAnchors['left-low'], rotate: 7, delay: 0.6 },
  'sleepy-seed-spirit': { ...slotAnchors['left-low'], rotate: -5, delay: 0.2 },
  'paper-crane': { ...slotAnchors.top, rotate: 8, delay: 0.4 },
  'honey-jar': { ...slotAnchors['right-low'], rotate: 4, delay: 0.5 },
  'sun-bell': { ...slotAnchors.top, rotate: 0, delay: 0.7 },
  'blue-firefly': { ...slotAnchors['right-high'], rotate: 8, delay: 0.3 },
  'carrot-bit': { ...slotAnchors['left-high'], rotate: -8, delay: 0.8 },
  'teacup-cloud': { ...slotAnchors['right-high'], width: 20, rotate: -2, delay: 0.6 },
  'cloud-starfish': { ...slotAnchors.top, rotate: 5, delay: 0.5 },
  'pebble-friend': { ...slotAnchors['right-low'], rotate: -3, delay: 0.3 },
  'leaf-boat': { ...slotAnchors['left-low'], rotate: 8, delay: 0.5 },
  'lavender-puff': { ...slotAnchors['left-high'], rotate: 4, delay: 0.2 }
};

export const floatingItemAnchors: Record<string, FloatingItemAnchor> = Object.fromEntries(
  accessoryItems.map((item, index) => [
    item.id,
    specificFloatingItemAnchors[item.id] ?? {
      ...(slotAnchors[item.slot] ?? slotAnchors.top),
      delay: (index % 7) * 0.12
    }
  ])
);

export function floatingItemAnchorStyle(itemId: string, placement?: AccessoryPlacement): CSSProperties {
  const anchor = floatingItemAnchors[itemId];
  if (!anchor) return {};
  const x = placement?.x ?? 0;
  const y = placement?.y ?? 0;
  const scale = placement?.scale ?? 1;
  const rotation = placement?.rotation ?? 0;

  return {
    '--float-rotate': `${anchor.rotate + rotation}deg`,
    '--float-delay': `${anchor.delay ?? 0}s`,
    '--float-scale': scale,
    top: `${anchor.top + y}%`,
    left: `${anchor.left + x}%`,
    width: `${anchor.width * scale}%`,
    zIndex: anchor.zIndex
  } as CSSProperties;
}
