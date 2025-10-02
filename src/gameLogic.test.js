import { describe, it, expect } from 'vitest';
import { increaseScore, spawnMole, decreaseTime } from './gameLogic';

describe("Game Logic Tests", () => {
  it("should increase score by 1", () => {
    expect(increaseScore(0)).toBe(1);
    expect(increaseScore(5)).toBe(6);
  });

  it("should spawn mole within valid grid range", () => {
    for (let i = 0; i < 100; i++) {
      const index = spawnMole(9); // 3x3 grid
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(9);
    }
  });

  it("should decrease time correctly", () => {
    expect(decreaseTime(10)).toBe(9);
    expect(decreaseTime(1)).toBe(0);
    expect(decreaseTime(0)).toBe(0); // time should not go negative
  });
});
