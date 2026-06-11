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
    expect(skyGiftBanner.cost.currency).toBe('tickets');
    expect(result?.economy.coins).toBe(initialEconomy.coins);
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

  it('converts duplicates inside a ten pull after the first owned result', () => {
    const result = runPulls(skyGiftBanner, 10, initialEconomy, {
      ownedRewardIds: new Set(),
      pullsSinceRare: 0,
      random: () => 0
    });

    expect(result).not.toBeNull();
    expect(result?.economy.tickets).toBe(initialEconomy.tickets - 10);
    expect(result?.results.filter((pull) => pull.duplicate).length).toBeGreaterThan(0);
    expect(result?.economy.shards).toBeGreaterThan(initialEconomy.shards);
  });
});
