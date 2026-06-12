import { describe, expect, it } from 'vitest';
import { defaultSave, loadSave, savePrototype } from './storage';

function memoryStorage(seed?: string) {
  let value = seed ?? null;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    }
  };
}

describe('prototype save data', () => {
  it('falls back to defaults for corrupt local data', () => {
    expect(loadSave(memoryStorage('{bad json'))).toEqual(defaultSave);
  });

  it('round-trips the current prototype save shape', () => {
    const storage = memoryStorage();
    const next = {
      ...defaultSave,
      selectedVariantId: 'blue-gray',
      selectedDeguShotId: 'rabbit',
      selectedBackgroundId: 'starlight-night',
      layoutPresets: [
        {
          ...defaultSave.layoutPresets[0],
          selectedBackgroundId: 'starlight-night',
          placedDecor: [
            {
              instanceId: 'slot-clover',
              itemId: 'clover-patch',
              cellX: 0,
              cellY: 3,
              footprint: { w: 1, h: 1 }
            }
          ],
          updatedAt: 1200
        },
        ...defaultSave.layoutPresets.slice(1)
      ],
      progression: {
        ...defaultSave.progression,
        ownedUpgradeIds: ['seed-snack'],
        ticketProgress: 240
      }
    };
    savePrototype(next, storage);
    expect(loadSave(storage).selectedVariantId).toBe('blue-gray');
    expect(loadSave(storage).selectedDeguShotId).toBe('rabbit');
    expect(loadSave(storage).selectedBackgroundId).toBe('starlight-night');
    expect(loadSave(storage).progression.ownedUpgradeIds).toEqual(['seed-snack']);
    expect(loadSave(storage).layoutPresets[0].selectedBackgroundId).toBe('starlight-night');
    expect(loadSave(storage).layoutPresets[0].placedDecor).toHaveLength(1);
  });

  it('falls back to the starter background for unknown theme ids', () => {
    const storage = memoryStorage(JSON.stringify({ ...defaultSave, selectedBackgroundId: 'unknown' }));

    expect(loadSave(storage).selectedBackgroundId).toBe(defaultSave.selectedBackgroundId);
  });

  it('migrates older saves without progression or pixel degu shot fields', () => {
    const { progression, selectedDeguShotId, layoutPresets, customDeguTone, accessoryPlacements, ...legacySave } = defaultSave;
    const storage = memoryStorage(JSON.stringify(legacySave));
    const migrated = loadSave(storage);

    expect(migrated.selectedDeguShotId).toBe(defaultSave.selectedDeguShotId);
    expect(migrated.progression).toEqual(defaultSave.progression);
    expect(migrated.layoutPresets).toEqual(defaultSave.layoutPresets);
    expect(migrated.customDeguTone).toEqual(defaultSave.customDeguTone);
    expect(migrated.accessoryPlacements).toEqual(defaultSave.accessoryPlacements);
  });

  it('sanitizes custom color bars and accessory placement overrides', () => {
    const storage = memoryStorage(
      JSON.stringify({
        ...defaultSave,
        customDeguTone: {
          hue: 90,
          saturation: 200,
          brightness: -4
        },
        accessoryPlacements: {
          'straw-hat': { x: 99, y: -99, scale: 9, rotation: -120 },
          'secret-accessory': { x: 4, y: 4, scale: 1, rotation: 0 }
        }
      })
    );

    const save = loadSave(storage);

    expect(save.customDeguTone).toEqual({ hue: 35, saturation: 135, brightness: 82 });
    expect(save.accessoryPlacements).toEqual({
      'straw-hat': { x: 28, y: -28, scale: 1.7, rotation: -45 }
    });
  });

  it('sanitizes invalid saved decor placements', () => {
    const storage = memoryStorage(
      JSON.stringify({
        ...defaultSave,
        placedDecor: [
          {
            instanceId: 'valid',
            itemId: 'clover-patch',
            cellX: 0,
            cellY: 3,
            footprint: { w: 1, h: 1 }
          },
          {
            instanceId: 'overlap',
            itemId: 'cloud-lamp',
            cellX: 2,
            cellY: 2,
            footprint: { w: 1, h: 1 }
          },
          {
            instanceId: 'outside',
            itemId: 'windmill',
            cellX: 9,
            cellY: 9,
            footprint: { w: 2, h: 2 }
          }
        ]
      })
    );

    expect(loadSave(storage).placedDecor).toEqual([
      {
        instanceId: 'valid',
        itemId: 'clover-patch',
        cellX: 0,
        cellY: 3,
        footprint: { w: 1, h: 1 }
      }
    ]);
  });

  it('drops saved decor that is grid-valid but outside the visual scene-safe band', () => {
    const storage = memoryStorage(
      JSON.stringify({
        ...defaultSave,
        placedDecor: [
          {
            instanceId: 'valid',
            itemId: 'clover-patch',
            cellX: 0,
            cellY: 3,
            footprint: { w: 1, h: 1 }
          },
          {
            instanceId: 'too-high',
            itemId: 'hay-bed',
            cellX: 0,
            cellY: 0,
            footprint: { w: 2, h: 1 }
          },
          {
            instanceId: 'too-low',
            itemId: 'hay-bed',
            cellX: 0,
            cellY: 5,
            footprint: { w: 2, h: 1 }
          }
        ]
      })
    );

    expect(loadSave(storage).placedDecor).toEqual([
      {
        instanceId: 'valid',
        itemId: 'clover-patch',
        cellX: 0,
        cellY: 3,
        footprint: { w: 1, h: 1 }
      }
    ]);
  });

  it('keeps normalized rotation and rotated footprints for saved decor', () => {
    const storage = memoryStorage(
      JSON.stringify({
        ...defaultSave,
        placedDecor: [
          {
            instanceId: 'rotated-lantern',
            itemId: 'star-lantern',
            cellX: 0,
            cellY: 3,
            footprint: { w: 99, h: 99 },
            rotation: 450
          }
        ]
      })
    );

    expect(loadSave(storage).placedDecor).toEqual([
      {
        instanceId: 'rotated-lantern',
        itemId: 'star-lantern',
        cellX: 0,
        cellY: 3,
        footprint: { w: 2, h: 1 },
        rotation: 90
      }
    ]);
  });

  it('sanitizes economy, variant, reward, and history values from local storage', () => {
    const storage = memoryStorage(
      JSON.stringify({
        ...defaultSave,
        economy: {
          coins: Number.NaN,
          tickets: -1,
          shards: 'bad',
          incomePerSecond: Infinity
        },
        selectedVariantId: 'unknown-variant',
        selectedDeguShotId: 'unknown-shot',
        progression: {
          xp: Infinity,
          ticketProgress: -1,
          ownedUpgradeIds: ['cloud-feeder', 'fake-upgrade']
        },
        ownedRewardIds: ['hay-bed', 'secret-token-123'],
        gachaHistory: ['cloud-lamp', 'secret-token-123']
      })
    );

    const save = loadSave(storage);

    expect(save.economy).toEqual(defaultSave.economy);
    expect(save.selectedVariantId).toBe(defaultSave.selectedVariantId);
    expect(save.selectedDeguShotId).toBe(defaultSave.selectedDeguShotId);
    expect(save.progression).toEqual({
      ...defaultSave.progression,
      ownedUpgradeIds: ['cloud-feeder']
    });
    expect(save.ownedRewardIds).toEqual(['hay-bed']);
    expect(save.gachaHistory).toEqual(['cloud-lamp']);
  });

  it('sanitizes layout preset backgrounds, timestamps, and decor placements', () => {
    const storage = memoryStorage(
      JSON.stringify({
        ...defaultSave,
        layoutPresets: [
          {
            slot: 1,
            label: 'Injected label',
            selectedBackgroundId: 'unknown-theme',
            updatedAt: 123.9,
            placedDecor: [
              {
                instanceId: 'slot-valid',
                itemId: 'clover-patch',
                cellX: 0,
                cellY: 3,
                footprint: { w: 1, h: 1 }
              },
              {
                instanceId: 'slot-too-high',
                itemId: 'hay-bed',
                cellX: 0,
                cellY: 0,
                footprint: { w: 2, h: 1 }
              }
            ]
          },
          {
            slot: 2,
            selectedBackgroundId: 'starlight-night',
            updatedAt: -10,
            placedDecor: 'bad'
          }
        ]
      })
    );

    const save = loadSave(storage);

    expect(save.layoutPresets[0]).toEqual({
      ...defaultSave.layoutPresets[0],
      selectedBackgroundId: defaultSave.selectedBackgroundId,
      updatedAt: 123,
      placedDecor: [
        {
          instanceId: 'slot-valid',
          itemId: 'clover-patch',
          cellX: 0,
          cellY: 3,
          footprint: { w: 1, h: 1 }
        }
      ]
    });
    expect(save.layoutPresets[1]).toEqual({
      ...defaultSave.layoutPresets[1],
      selectedBackgroundId: 'starlight-night',
      updatedAt: null,
      placedDecor: []
    });
    expect(save.layoutPresets[2]).toEqual(defaultSave.layoutPresets[2]);
  });
});
