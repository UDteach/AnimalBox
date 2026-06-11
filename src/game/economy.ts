export interface EconomyState {
  coins: number;
  tickets: number;
  shards: number;
  incomePerSecond: number;
}

export const initialEconomy: EconomyState = {
  coins: 12540,
  tickets: 15,
  shards: 0,
  incomePerSecond: 85
};

export function addIdleIncome(state: EconomyState, elapsedMs: number): EconomyState {
  const earned = Math.floor((state.incomePerSecond * elapsedMs) / 1000);
  if (earned <= 0) return state;
  return { ...state, coins: state.coins + earned };
}

export function tapForCoins(state: EconomyState, amount = 25): EconomyState {
  return { ...state, coins: state.coins + amount };
}

export function spendCurrency(
  state: EconomyState,
  currency: 'coins' | 'tickets',
  amount: number
): EconomyState | null {
  if (amount < 0) {
    throw new Error('Currency amount cannot be negative.');
  }

  if (state[currency] < amount) return null;
  return { ...state, [currency]: state[currency] - amount };
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
