import { describe, it, expect } from "vitest";
import { calcOneRM } from "./oneRM";

describe("calcOneRM", () => {
  it("80kg × 10回 → 100kg", () => {
    expect(calcOneRM(80, 10)).toBeCloseTo(100);
  });

  it("100kg × 1回 → 102.5kg", () => {
    expect(calcOneRM(100, 1)).toBeCloseTo(102.5);
  });

  it("60kg × 5回 → 67.5kg", () => {
    expect(calcOneRM(60, 5)).toBeCloseTo(67.5);
  });

  it("0回のときは weight をそのまま返す", () => {
    expect(calcOneRM(80, 0)).toBe(80);
  });
});
