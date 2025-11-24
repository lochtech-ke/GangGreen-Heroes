import { describe, it, expect } from 'vitest';
import { ggCoinService } from './ggCoin.service';

describe('GGCoinService - calculatePurchaseReward', () => {
  it('should calculate correct reward for 200 KES (1.000 GG Coins)', () => {
    const reward = ggCoinService.calculatePurchaseReward(200);
    expect(reward).toBe(1.000);
  });

  it('should calculate correct reward for 100 KES (0.500 GG Coins)', () => {
    const reward = ggCoinService.calculatePurchaseReward(100);
    expect(reward).toBe(0.500);
  });

  it('should calculate correct reward for 50 KES (0.250 GG Coins)', () => {
    const reward = ggCoinService.calculatePurchaseReward(50);
    expect(reward).toBe(0.250);
  });

  it('should calculate correct reward for 10 KES (0.050 GG Coins)', () => {
    const reward = ggCoinService.calculatePurchaseReward(10);
    expect(reward).toBe(0.050);
  });

  it('should calculate correct reward for 1 KES (0.005 GG Coins)', () => {
    const reward = ggCoinService.calculatePurchaseReward(1);
    expect(reward).toBe(0.005);
  });

  it('should calculate correct reward for 1000 KES (5.000 GG Coins)', () => {
    const reward = ggCoinService.calculatePurchaseReward(1000);
    expect(reward).toBe(5.000);
  });

  it('should calculate correct reward for 2500 KES (12.500 GG Coins)', () => {
    const reward = ggCoinService.calculatePurchaseReward(2500);
    expect(reward).toBe(12.500);
  });

  it('should handle 0 KES (0.000 GG Coins)', () => {
    const reward = ggCoinService.calculatePurchaseReward(0);
    expect(reward).toBe(0.000);
  });

  it('should handle negative amounts by returning 0', () => {
    const reward = ggCoinService.calculatePurchaseReward(-100);
    expect(reward).toBe(0);
  });

  it('should round to 3 decimal places', () => {
    // 333 KES / 200 = 1.665
    const reward = ggCoinService.calculatePurchaseReward(333);
    expect(reward).toBe(1.665);
  });

  it('should handle very small amounts correctly', () => {
    // 0.5 KES / 200 = 0.0025, rounds to 0.003
    const reward = ggCoinService.calculatePurchaseReward(0.5);
    expect(reward).toBe(0.003);
  });

  it('should handle large amounts correctly', () => {
    // 100000 KES / 200 = 500.000
    const reward = ggCoinService.calculatePurchaseReward(100000);
    expect(reward).toBe(500.000);
  });

  it('should maintain precision for edge cases', () => {
    // Test rounding edge cases
    const testCases = [
      { kes: 1, expected: 0.005 },
      { kes: 3, expected: 0.015 },
      { kes: 7, expected: 0.035 },
      { kes: 13, expected: 0.065 },
      { kes: 17, expected: 0.085 },
      { kes: 23, expected: 0.115 },
    ];

    testCases.forEach(({ kes, expected }) => {
      const reward = ggCoinService.calculatePurchaseReward(kes);
      expect(reward).toBe(expected);
    });
  });
});
