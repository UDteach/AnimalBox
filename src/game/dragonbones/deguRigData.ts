export const DEGU_RIG_NAME = 'animalbox-degu-rig-v2';
export const DEGU_RIG_ARMATURE = 'degu-rig';
export const DEGU_RIG_BASE_PATH = '/images/runtime/dragonbones/degu-v2';
export const DEGU_RIG_TEXTURE = `${DEGU_RIG_BASE_PATH}/degu-v2_tex.png`;
export const DEGU_RIG_ATLAS = `${DEGU_RIG_BASE_PATH}/degu-v2_tex.json`;
export const DEGU_RIG_SKELETON = `${DEGU_RIG_BASE_PATH}/degu-v2_ske.json`;

export const dragonBonesOutfitSlots = {
  'straw-hat': [{ slotName: 'headwear', displayIndex: 0 }],
  'flower-crown': [{ slotName: 'headwear', displayIndex: 1 }],
  'angel-halo-wings': [
    { slotName: 'left-wing', displayIndex: 0 },
    { slotName: 'right-wing', displayIndex: 0 },
    { slotName: 'halo', displayIndex: 0 }
  ],
  'celestial-cape': [{ slotName: 'cape', displayIndex: 0 }],
  'pastel-ribbon': [{ slotName: 'neck', displayIndex: 0 }],
  'round-glasses': [{ slotName: 'face', displayIndex: 0 }]
} as const;

export type DragonBonesOutfitId = keyof typeof dragonBonesOutfitSlots;

export const dragonBonesSupportedOutfitIds = Object.keys(
  dragonBonesOutfitSlots
) as DragonBonesOutfitId[];
