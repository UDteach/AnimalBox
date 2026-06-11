import deguRigDragonBones from '../../../public/images/runtime/dragonbones/degu-v2/degu-v2_ske.json';
import deguRigAtlas from '../../../public/images/runtime/dragonbones/degu-v2/degu-v2_tex.json';
import { outfits } from '../content';
import { DEGU_RIG_NAME, dragonBonesOutfitSlots } from './deguRigData';

const armature = deguRigDragonBones.armature[0];
const defaultSkin = armature.skin[0];

function displayCountForSlot(slotName: string) {
  return defaultSkin.slot.find((slot) => slot.name === slotName)?.display.length ?? 0;
}

describe('degu DragonBones rig data', () => {
  it('uses the public rig v2 identity and texture atlas shape', () => {
    expect(deguRigDragonBones.name).toBe(DEGU_RIG_NAME);
    expect(deguRigAtlas.name).toBe(DEGU_RIG_NAME);
    expect(deguRigAtlas.imagePath).toBe('degu-v2_tex.png');

    deguRigAtlas.SubTexture.forEach((texture) => {
      expect(texture.width, texture.name).toBeGreaterThan(0);
      expect(texture.height, texture.name).toBeGreaterThan(0);
      expect(texture.x + texture.width, texture.name).toBeLessThanOrEqual(deguRigAtlas.width);
      expect(texture.y + texture.height, texture.name).toBeLessThanOrEqual(deguRigAtlas.height);
    });
  });

  it('maps every image display path to a texture atlas entry', () => {
    const atlasNames = new Set<string>(deguRigAtlas.SubTexture.map((texture) => texture.name));
    const displayPaths = defaultSkin.slot.flatMap((slot) => slot.display.map((display) => display.path));

    expect(displayPaths.length).toBeGreaterThan(0);
    expect(displayPaths.filter((path) => !atlasNames.has(path))).toEqual([]);
  });

  it('keeps separated base body parts visible in rig v2', () => {
    const atlasNames = new Set<string>(deguRigAtlas.SubTexture.map((texture) => texture.name));
    const slotDisplayIndex = new Map(armature.slot.map((slot) => [slot.name, slot.displayIndex]));

    ['body', 'head', 'left-ear', 'right-ear', 'tail', 'left-paw', 'right-paw', 'left-foot', 'right-foot', 'shadow'].forEach(
      (partName) => {
        expect(atlasNames.has(partName), partName).toBe(true);
        expect(displayCountForSlot(partName), partName).toBeGreaterThan(0);
        expect(slotDisplayIndex.get(partName), partName).toBe(0);
      }
    );
  });

  it('keeps wardrobe-controlled slots in the rig and hidden by default', () => {
    const slotDisplayIndex = new Map(armature.slot.map((slot) => [slot.name, slot.displayIndex]));

    ['headwear', 'cape', 'neck', 'face', 'left-wing', 'right-wing', 'halo'].forEach((slotName) => {
      expect(displayCountForSlot(slotName), slotName).toBeGreaterThan(0);
      expect(slotDisplayIndex.get(slotName), slotName).toBe(-1);
    });
  });

  it('has valid DragonBones renderer coverage for legacy rig wardrobe items', () => {
    const atlasNames = new Set<string>(deguRigAtlas.SubTexture.map((texture) => texture.name));
    const slotNames = new Set<string>(armature.slot.map((slot) => slot.name));
    const outfitIds = new Set(outfits.map((outfit) => outfit.id));

    Object.entries(dragonBonesOutfitSlots).forEach(([outfitId, attachments]) => {
      expect(outfitIds.has(outfitId), outfitId).toBe(true);
      expect(attachments.length, outfitId).toBeGreaterThan(0);

      attachments.forEach((attachment) => {
        expect(slotNames.has(attachment.slotName), outfitId).toBe(true);
        expect(attachment.displayIndex, outfitId).toBeGreaterThanOrEqual(0);
        expect(attachment.displayIndex, outfitId).toBeLessThan(displayCountForSlot(attachment.slotName));
      });
    });

    [
      'straw-hat',
      'flower-crown',
      'pastel-ribbon',
      'round-glasses',
      'celestial-cape',
      'angel-halo',
      'angel-left-wing',
      'angel-right-wing'
    ].forEach((textureName) => {
      expect(atlasNames.has(textureName), textureName).toBe(true);
    });
  });
});
