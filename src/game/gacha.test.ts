import { describe, expect, it } from 'vitest';
import { initialEconomy } from './economy';
import { runPulls, seededRandom, skyGiftBanner } from './gacha';

describe('free gacha', () => {
  it('spends only earned tickets and records rewards', () => {
    const result = runPulls(skyGiftBanner, 1, initialEconomy, {
      ownedRewardIds: new Set(),
      pullsSinceRare: 0,
      random: seededRandom(3)
    });

    expect(result).not.toBeNull();
    expect(result?.economy.tickets).toBe(initialEconomy.tickets - 1);
    expect(result?.results).toHaveLength(1);
  });

  it('converts duplicates into shards', () => {
    const result = runPulls(skyGiftBanner, 1, initialEconomy, {
      ownedRewardIds: new Set(['hay-bed', 'cloud-lamp', 'flower-crown', 'blue-gray', 'angel-fountain', 'celestial-cape']),
      pullsSinceRare: 0,
      random: () => 0.99
    });

    expect(result?.results[0]?.duplicate).toBe(true);
    expect(result?.economy.shards).toBeGreaterThan(initialEconomy.shards);
  });
});
