import { spendCurrency, type EconomyState } from './economy';

export type RewardType = 'decor' | 'outfit' | 'degu_variant' | 'background' | 'currency';
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
    { rewardId: 'cloud-lamp', rewardType: 'decor', rarity: 'common', weight: 24, duplicateShardValue: 2 },
    { rewardId: 'timothy-hay-rack', rewardType: 'decor', rarity: 'common', weight: 20, duplicateShardValue: 2 },
    { rewardId: 'sand-bath-bowl', rewardType: 'decor', rarity: 'common', weight: 18, duplicateShardValue: 2 },
    { rewardId: 'wood-tunnel', rewardType: 'decor', rarity: 'common', weight: 16, duplicateShardValue: 2 },
    { rewardId: 'seed-sprout-pot', rewardType: 'decor', rarity: 'common', weight: 18, duplicateShardValue: 2 },
    { rewardId: 'short-wooden-fence', rewardType: 'decor', rarity: 'common', weight: 18, duplicateShardValue: 2 },
    { rewardId: 'flower-patch', rewardType: 'decor', rarity: 'common', weight: 18, duplicateShardValue: 2 },
    { rewardId: 'snack-tray', rewardType: 'decor', rarity: 'common', weight: 16, duplicateShardValue: 2 },
    { rewardId: 'acorn-beret', rewardType: 'outfit', rarity: 'common', weight: 16, duplicateShardValue: 2 },
    { rewardId: 'mint-scarf', rewardType: 'outfit', rarity: 'common', weight: 16, duplicateShardValue: 2 },
    { rewardId: 'sky-satchel', rewardType: 'outfit', rarity: 'common', weight: 14, duplicateShardValue: 2 },
    { rewardId: 'daisy-ear-clip', rewardType: 'outfit', rarity: 'common', weight: 14, duplicateShardValue: 2 },
    { rewardId: 'clover-necklace', rewardType: 'outfit', rarity: 'common', weight: 14, duplicateShardValue: 2 },
    { rewardId: 'tiny-cheek-sticker', rewardType: 'outfit', rarity: 'common', weight: 12, duplicateShardValue: 2 },
    { rewardId: 'flower-crown', rewardType: 'outfit', rarity: 'rare', weight: 14, duplicateShardValue: 8 },
    { rewardId: 'blue-gray', rewardType: 'degu_variant', rarity: 'rare', weight: 12, duplicateShardValue: 8 },
    { rewardId: 'morning-pasture', rewardType: 'background', rarity: 'rare', weight: 8, duplicateShardValue: 8 },
    { rewardId: 'sunset-clover-isle', rewardType: 'background', rarity: 'rare', weight: 8, duplicateShardValue: 8 },
    { rewardId: 'rainy-glass-garden', rewardType: 'background', rarity: 'rare', weight: 8, duplicateShardValue: 8 },
    { rewardId: 'flower-cloud-terrace', rewardType: 'background', rarity: 'rare', weight: 8, duplicateShardValue: 8 },
    { rewardId: 'ceramic-hideout', rewardType: 'decor', rarity: 'rare', weight: 10, duplicateShardValue: 8 },
    { rewardId: 'cloud-bridge', rewardType: 'decor', rarity: 'rare', weight: 10, duplicateShardValue: 8 },
    { rewardId: 'bellflower-planter', rewardType: 'decor', rarity: 'rare', weight: 10, duplicateShardValue: 8 },
    { rewardId: 'star-lantern', rewardType: 'decor', rarity: 'rare', weight: 10, duplicateShardValue: 8 },
    { rewardId: 'leaf-cape', rewardType: 'outfit', rarity: 'rare', weight: 10, duplicateShardValue: 8 },
    { rewardId: 'star-hairpin', rewardType: 'outfit', rarity: 'rare', weight: 10, duplicateShardValue: 8 },
    { rewardId: 'explorer-goggles', rewardType: 'outfit', rarity: 'rare', weight: 10, duplicateShardValue: 8 },
    { rewardId: 'cloud-cap', rewardType: 'outfit', rarity: 'rare', weight: 10, duplicateShardValue: 8 },
    { rewardId: 'picnic-blanket-cape', rewardType: 'outfit', rarity: 'rare', weight: 8, duplicateShardValue: 8 },
    { rewardId: 'angel-fountain', rewardType: 'decor', rarity: 'special', weight: 5, duplicateShardValue: 20 },
    { rewardId: 'celestial-cape', rewardType: 'outfit', rarity: 'special', weight: 4, duplicateShardValue: 20 },
    { rewardId: 'cozy-poncho', rewardType: 'outfit', rarity: 'special', weight: 4, duplicateShardValue: 20 },
    { rewardId: 'moonlit-hay-field', rewardType: 'background', rarity: 'special', weight: 3, duplicateShardValue: 20 },
    { rewardId: 'hay-bed', rewardType: 'decor', rarity: 'common', weight: 18, duplicateShardValue: 2 }
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
