import { spendCurrency, type EconomyState } from './economy';

export type UpgradeCurrency = 'coins' | 'shards';

export interface ProgressionState {
  xp: number;
  ticketProgress: number;
  ownedUpgradeIds: string[];
}

export interface UpgradeDefinition {
  id: string;
  label: string;
  cost: { currency: UpgradeCurrency; amount: number };
  tapBonus?: number;
  idleBonus?: number;
  ticketBonus?: number;
  xpBonus?: number;
}

export interface GameStats {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  tapPower: number;
  idleIncomePerSecond: number;
  ticketGoal: number;
  claimableTickets: number;
}

export interface UpgradePurchase {
  economy: EconomyState;
  progression: ProgressionState;
  upgrade: UpgradeDefinition;
}

const baseTapPower = 25;
const baseTicketGoal = 260;
const baseXpForLevel = 120;

export const defaultProgression: ProgressionState = {
  xp: 0,
  ticketProgress: 80,
  ownedUpgradeIds: []
};

export const upgradeCatalog: UpgradeDefinition[] = [
  {
    id: 'seed-snack',
    label: 'Seed Snack',
    cost: { currency: 'coins', amount: 450 },
    tapBonus: 10,
    xpBonus: 1
  },
  {
    id: 'soft-brush',
    label: 'Soft Brush',
    cost: { currency: 'coins', amount: 900 },
    tapBonus: 18,
    ticketBonus: 12
  },
  {
    id: 'cloud-feeder',
    label: 'Cloud Feeder',
    cost: { currency: 'coins', amount: 1600 },
    idleBonus: 18,
    ticketBonus: 16
  },
  {
    id: 'pasture-path',
    label: 'Pasture Path',
    cost: { currency: 'coins', amount: 3200 },
    idleBonus: 36,
    xpBonus: 2
  },
  {
    id: 'sky-ticket-kite',
    label: 'Ticket Kite',
    cost: { currency: 'coins', amount: 5200 },
    ticketBonus: 42
  },
  {
    id: 'shiny-nest',
    label: 'Shiny Nest',
    cost: { currency: 'shards', amount: 20 },
    tapBonus: 24,
    idleBonus: 24
  }
];

export function deriveGameStats(baseIncomePerSecond: number, progression: ProgressionState): GameStats {
  const upgrades = getOwnedUpgrades(progression.ownedUpgradeIds);
  const tapPower =
    baseTapPower + upgrades.reduce((sum, upgrade) => sum + (upgrade.tapBonus ?? 0), 0);
  const idleIncomePerSecond =
    baseIncomePerSecond + upgrades.reduce((sum, upgrade) => sum + (upgrade.idleBonus ?? 0), 0);
  const ticketGoal = Math.max(
    120,
    baseTicketGoal - upgrades.reduce((sum, upgrade) => sum + (upgrade.ticketBonus ?? 0), 0)
  );
  const level = levelFromXp(progression.xp);
  const xpStart = xpForLevel(level);
  const xpNext = xpForLevel(level + 1);

  return {
    level,
    xpIntoLevel: Math.max(0, progression.xp - xpStart),
    xpForNextLevel: xpNext - xpStart,
    tapPower,
    idleIncomePerSecond,
    ticketGoal,
    claimableTickets: Math.floor(progression.ticketProgress / ticketGoal)
  };
}

export function applyTapProgress(
  progression: ProgressionState,
  stats: GameStats
): ProgressionState {
  return {
    ...progression,
    xp: progression.xp + 2 + Math.floor(stats.tapPower / 35),
    ticketProgress: progression.ticketProgress + 7
  };
}

export function applyIdleProgress(
  progression: ProgressionState,
  earnedCoins: number,
  elapsedMs: number
): ProgressionState {
  if (earnedCoins <= 0) return progression;
  const elapsedSeconds = Math.max(1, Math.floor(elapsedMs / 1000));

  return {
    ...progression,
    xp: progression.xp + Math.max(1, Math.floor(earnedCoins / 35)),
    ticketProgress: progression.ticketProgress + Math.max(elapsedSeconds, Math.floor(earnedCoins / 15))
  };
}

export function claimTickets(
  economy: EconomyState,
  progression: ProgressionState
): { economy: EconomyState; progression: ProgressionState; claimed: number } {
  const stats = deriveGameStats(economy.incomePerSecond, progression);
  const claimed = stats.claimableTickets;
  if (claimed <= 0) return { economy, progression, claimed: 0 };

  return {
    economy: { ...economy, tickets: economy.tickets + claimed },
    progression: {
      ...progression,
      xp: progression.xp + claimed * 10,
      ticketProgress: progression.ticketProgress - claimed * stats.ticketGoal
    },
    claimed
  };
}

export function purchaseUpgrade(
  economy: EconomyState,
  progression: ProgressionState,
  upgradeId: string
): UpgradePurchase | null {
  if (progression.ownedUpgradeIds.includes(upgradeId)) return null;
  const upgrade = upgradeCatalog.find((item) => item.id === upgradeId);
  if (!upgrade) return null;
  const paid = spendCurrency(economy, upgrade.cost.currency, upgrade.cost.amount);
  if (!paid) return null;

  return {
    economy: paid,
    progression: {
      ...progression,
      xp: progression.xp + 18,
      ownedUpgradeIds: [...progression.ownedUpgradeIds, upgrade.id]
    },
    upgrade
  };
}

export function getOwnedUpgrades(ids: string[]): UpgradeDefinition[] {
  const uniqueIds = new Set(ids);
  return upgradeCatalog.filter((upgrade) => uniqueIds.has(upgrade.id));
}

export function getNextUpgrade(progression: ProgressionState): UpgradeDefinition | null {
  return upgradeCatalog.find((upgrade) => !progression.ownedUpgradeIds.includes(upgrade.id)) ?? null;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) {
    level += 1;
  }
  return level;
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(((level - 1) * level * baseXpForLevel) / 2);
}

export function sanitizeProgression(value: unknown): ProgressionState {
  const raw = value && typeof value === 'object' ? (value as Partial<ProgressionState>) : {};
  const allowedUpgrades = new Set(upgradeCatalog.map((upgrade) => upgrade.id));
  const ownedUpgradeIds = Array.isArray(raw.ownedUpgradeIds)
    ? Array.from(
        new Set(
          raw.ownedUpgradeIds.filter(
            (item): item is string => typeof item === 'string' && allowedUpgrades.has(item)
          )
        )
      )
    : defaultProgression.ownedUpgradeIds;

  return {
    xp: sanitizeNonNegativeNumber(raw.xp, defaultProgression.xp),
    ticketProgress: sanitizeNonNegativeNumber(
      raw.ticketProgress,
      defaultProgression.ticketProgress
    ),
    ownedUpgradeIds
  };
}

function sanitizeNonNegativeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : fallback;
}
