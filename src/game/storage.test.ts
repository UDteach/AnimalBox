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
    const next = { ...defaultSave, selectedVariantId: 'blue-gray' };
    savePrototype(next, storage);
    expect(loadSave(storage).selectedVariantId).toBe('blue-gray');
  });
});
