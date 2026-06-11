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
      selectedDeguShotId: '08',
      selectedBackgroundId: 'starlight-night',
      progression: {
        ...defaultSave.progression,
        ownedUpgradeIds: ['seed-snack'],
        ticketProgress: 240
      }
    };
    savePrototype(next, storage);
    expect(loadSave(storage).selectedVariantId).toBe('blue-gray');
    expect(loadSave(storage).selectedDeguShotId).toBe('08');
    expect(loadSave(storage).selectedBackgroundId).toBe('starlight-night');
    expect(loadSave(storage).progression.ownedUpgradeIds).toEqual(['seed-snack']);
  });

  it('falls back to the starter background for unknown theme ids', () => {
    const storage = memoryStorage(JSON.stringify({ ...defaultSave, selectedBackgroundId: 'unknown' }));

    expect(loadSave(storage).selectedBackgroundId).toBe(defaultSave.selectedBackgroundId);
  });

  it('migrates older saves without progression or pixel degu shot fields', () => {
    const { progression, selectedDeguShotId, ...legacySave } = defaultSave;
    const storage = memoryStorage(JSON.stringify(legacySave));
    const migrated = loadSave(storage);

    expect(migrated.selectedDeguShotId).toBe(defaultSave.selectedDeguShotId);
    expect(migrated.progression).toEqual(defaultSave.progression);
  });

  it('sanitizes invalid saved decor placements', () => {
    const storage = memoryStorage(
      JSON.stringify({
        ...defaultSave,
        placedDecor: [
          {
            instanceId: 'valid',
            itemId: 'clover-patch',
            cellX: 2,
            cellY: 2,
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
        cellX: 2,
        cellY: 2,
        footprint: { w: 1, h: 1 }
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
});
