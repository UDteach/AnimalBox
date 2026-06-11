import { toggleOutfitForSlot } from './wardrobe';

describe('wardrobe slot selection', () => {
  it('keeps one active outfit per slot', () => {
    const selected = toggleOutfitForSlot(['straw-hat', 'celestial-cape'], 'flower-crown');

    expect(selected).toEqual(['celestial-cape', 'flower-crown']);
  });

  it('allows independent slots to stay active together', () => {
    const selected = toggleOutfitForSlot(['straw-hat'], 'pastel-ribbon');
    const withFace = toggleOutfitForSlot(selected, 'round-glasses');

    expect(withFace).toEqual(['straw-hat', 'pastel-ribbon', 'round-glasses']);
  });

  it('toggles the active outfit off', () => {
    expect(toggleOutfitForSlot(['straw-hat', 'pastel-ribbon'], 'straw-hat')).toEqual(['pastel-ribbon']);
  });
});
