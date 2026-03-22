import { describe, it, expect } from "vitest";
import { calcBMR, calcTDEE, calcDailyTarget } from "./bmr";

describe("calcBMR", () => {
  it("男性 175cm 75kg 30歳 → 1762.65kcal", () => {
    expect(calcBMR("male", 175, 75, 30)).toBeCloseTo(1762.65, 0);
  });

  it("女性 160cm 55kg 25歳 → 1343.61kcal", () => {
    expect(calcBMR("female", 160, 55, 25)).toBeCloseTo(1343.61, 0);
  });
});

describe("calcTDEE", () => {
  it("BMR=1800, moderate(1.55) → 2790", () => {
    expect(calcTDEE(1800, "moderate")).toBeCloseTo(2790);
  });
});

describe("calcDailyTarget", () => {
  it("TDEE=2500, 減量(-500) → 2000", () => {
    expect(calcDailyTarget(2500, -500)).toBe(2000);
  });

  it("上限: TDEE=2500, +800 → 3250（+750でclamp）", () => {
    expect(calcDailyTarget(2500, 800)).toBe(3250);
  });

  it("下限: TDEE=2500, -800 → 1750（-750でclamp）", () => {
    expect(calcDailyTarget(2500, -800)).toBe(1750);
  });
});
