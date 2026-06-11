import { spendCurrency, type EconomyState } from './economy';

export type RewardType = 'decor' | 'outfit' | 'degu_variant' | 'currency';
export type Rarity = 'common' | 'rare' | 'special';

export interface GachaEntry {
  rewardId: string;
  rewardType: RewardType;
  rarity: Rarity;
  weight: number;
  duplicateShardValue: number;
}

export interface GachaBanner {
  id: string;
  cost: { currency: 'coins' | 'tickets'; amount: number };
  guaranteedRareEvery?: number;
  entries: GachaEntry[];
}

export interface PullContext {
  ownedRewardIds: Set<string>;
  pullsSinceRare: number;
  random: () => number;
}

export interface PullResult {
  entry: GachaEntry;
  duplicate: boolean;
  shardsEarned: number;
}

export const skyGiftBanner: GachaBanner = {
  id: 'sky-gift-01',
  cost: { currency: 'tickets', amount: 1 },
  guaranteedRareEvery: 10,
  entries: [
    { rewardId: 'cloud-lamp', rewardType: 'decor', rarity: 'common', weight: 36, duplicateShardValue: 2 },
    { rewardId: 'flower-crown', rewardType: 'outfit', rarity: 'rare', weight: 14, duplicateShardValue: 8 },
    { rewardId: 'blue-gray', rewardType: 'degu_variant', rarity: 'rare', weight: 12, duplicateShardValue: 8 },
    { rewardId: 'angel-fountain', rewardType: 'decor', rarity: 'special', weight: 5, duplicateShardValue: 20 },
    { rewardId: 'celestial-cape', rewardType: 'outfit', rarity: 'special', weight: 4, duplicateShardValue: 20 },
    { rewardId: 'hay-bed', rewardType: 'decor', rarity: 'common', weight: 29, duplicateShardValue: 2 }
  ]
};

export function runPulls(
  banner: GachaBanner,
  count: number,
  economy: EconomyState,
  context: PullContext
): { economy: EconomyState; results: PullResult[]; pullsSinceRare: number } | null {
  const totalCost = banner.cost.amount * count;
  const paid = spendCurrency(economy, banner.cost.currency, totalCost);
  if (!paid) return null;

  let pullsSinceRare = context.pullsSinceRare;
  let shards = paid.shards;
  const results: PullResult[] = [];

  for (let i = 0; i < count; i += 1) {
    const guaranteedRare =
      Boolean(banner.guaranteedRareEvery) && pullsSinceRare + 1 >= banner.guaranteedRareEvery!;
    const pool = guaranteedRare
      ? banner.entries.filter((entry) => entry.rarity !== 'common')
      : banner.entries;
    const entry = weightedPick(pool, context.random);
    const duplicate = context.ownedRewardIds.has(entry.rewardId);
    const shardsEarned = duplicate ? entry.duplicateShardValue : 0;
    if (!duplicate) {
      context.ownedRewardIds.add(entry.rewardId);
    }

    shards += shardsEarned;
    pullsSinceRare = entry.rarity === 'common' ? pullsSinceRare + 1 : 0;
    results.push({ entry, duplicate, shardsEarned });
  }

  return {
    economy: { ...paid, shards },
    results,
    pullsSinceRare
  };
}

export function weightedPick<T extends { weight: number }>(entries: T[], random: () => number): T {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) {
    throw new Error('Weighted pool must have positive total weight.');
  }

  let cursor = random() * total;
  for (const entry of entries) {
    cursor -= entry.weight;
    if (cursor <= 0) return entry;
  }

  return entries[entries.length - 1];
}

export function browserRandom(): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] / 0xffffffff;
}

export function seededRandom(seed = 1): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}
