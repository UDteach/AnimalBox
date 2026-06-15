import { describe, expect, it } from 'vitest';
import { accessoryItems, backgroundThemes, decorItems, deguVariants, pixelDeguShots } from './content';
import { initialEconomy } from './economy';
import { premiumSkyGiftBanner, runPulls, seededRandom, skyGiftBanner } from './gacha';

const banners = [skyGiftBanner, premiumSkyGiftBanner];

describe('free gacha', () => {
  it('spends only earned tickets and records rewards', () => {
    for (const banner of banners) {
      const result = runPulls(banner, 1, initialEconomy, {
        ownedRewardIds: new Set(),
        pullsSinceRare: 0,
        random: seededRandom(3)
      });

      expect(result).not.toBeNull();
      expect(banner.cost.currency).toBe('tickets');
      expect(result?.economy.coins).toBe(initialEconomy.coins);
      expect(result?.economy.tickets).toBe(initialEconomy.tickets - banner.cost.amount);
      expect(result?.results).toHaveLength(1);
    }
  });

  it('blocks premium gifts when earned tickets are short', () => {
    expect(
      runPulls(premiumSkyGiftBanner, 1, { ...initialEconomy, tickets: 4 }, {
        ownedRewardIds: new Set(),
        pullsSinceRare: 0,
        random: seededRandom(1)
      })
    ).toBeNull();
  });

  it('converts duplicates into shards', () => {
    const result = runPulls(skyGiftBanner, 1, initialEconomy, {
      ownedRewardIds: new Set(['hay-bed', 'cloud-lamp', 'moon-bell', 'blue-gray', 'angel-fountain', 'cloud-sheep']),
      pullsSinceRare: 0,
      random: () => 0
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

  it('only references reward ids that exist in customization content', () => {
    const rewardIds = new Set([
      ...decorItems.map((item) => item.id),
      ...accessoryItems.map((item) => item.id),
      ...deguVariants.map((item) => item.id),
      ...pixelDeguShots.map((item) => item.id),
      ...backgroundThemes.map((item) => item.id)
    ]);

    for (const banner of banners) {
      expect(banner.entries.filter((entry) => !rewardIds.has(entry.rewardId))).toEqual([]);
    }
  });
});
