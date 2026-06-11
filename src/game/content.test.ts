import { describe, expect, it } from 'vitest';
import { isRewardOwned, starterRewardIds } from './content';

describe('content ownership helpers', () => {
  it('treats starter rewards as owned', () => {
    for (const rewardId of starterRewardIds) {
      expect(isRewardOwned([], rewardId)).toBe(true);
    }
  });

  it('treats earned rewards as owned and unknown rewards as locked', () => {
    expect(isRewardOwned(['flower-crown'], 'flower-crown')).toBe(true);
    expect(isRewardOwned(['flower-crown'], 'celestial-cape')).toBe(false);
  });
});
