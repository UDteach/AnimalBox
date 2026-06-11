import { describe, expect, it } from 'vitest';
import { initialEconomy } from './economy';
import {
  applyIdleProgress,
  applyTapProgress,
  claimTickets,
  defaultProgression,
  deriveGameStats,
  purchaseUpgrade,
  sanitizeProgression
} from './progression';

describe('progression loop', () => {
  it('derives tap, idle, level, and ticket stats from owned upgrades', () => {
    const stats = deriveGameStats(85, {
      ...defaultProgression,
      xp: 260,
      ownedUpgradeIds: ['seed-snack', 'cloud-feeder']
    });

    expect(stats.level).toBe(2);
    expect(stats.tapPower).toBe(35);
    expect(stats.idleIncomePerSecond).toBe(103);
    expect(stats.ticketGoal).toBeLessThan(260);
  });

  it('spends currency once when buying an upgrade', () => {
    const first = purchaseUpgrade(initialEconomy, defaultProgression, 'seed-snack');
    expect(first?.economy.coins).toBe(initialEconomy.coins - 450);
    expect(first?.progression.ownedUpgradeIds).toContain('seed-snack');

    const second = purchaseUpgrade(first!.economy, first!.progression, 'seed-snack');
    expect(second).toBeNull();
  });

  it('claims earned free tickets from ticket progress', () => {
    const result = claimTickets(initialEconomy, {
      ...defaultProgression,
      ticketProgress: 620
    });

    expect(result.claimed).toBe(2);
    expect(result.economy.tickets).toBe(initialEconomy.tickets + 2);
    expect(result.progression.ticketProgress).toBeLessThan(260);
  });

  it('adds XP and ticket meter progress from taps', () => {
    const stats = deriveGameStats(85, {
      ...defaultProgression,
      ownedUpgradeIds: ['seed-snack']
    });
    const next = applyTapProgress(defaultProgression, stats);

    expect(next.xp).toBeGreaterThan(defaultProgression.xp);
    expect(next.ticketProgress).toBeGreaterThan(defaultProgression.ticketProgress);
  });

  it('adds idle XP and ticket meter progress from earned coins', () => {
    const next = applyIdleProgress(defaultProgression, 85, 1000);

    expect(next.xp).toBeGreaterThan(defaultProgression.xp);
    expect(next.ticketProgress).toBeGreaterThan(defaultProgression.ticketProgress);
  });

  it('sanitizes progression loaded from storage', () => {
    expect(
      sanitizeProgression({
        xp: Number.NaN,
        ticketProgress: -3,
        ownedUpgradeIds: ['seed-snack', 'unknown']
      })
    ).toEqual({
      ...defaultProgression,
      ownedUpgradeIds: ['seed-snack']
    });
  });
});
