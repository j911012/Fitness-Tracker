import { describe, it, expect } from "vitest";
import { calcCardioKcal } from "./cardio";

describe("calcCardioKcal", () => {
  it("MET=8, 70kg, 30分 → 280kcal", () => {
    expect(calcCardioKcal(8, 70, 30)).toBe(280);
  });

  it("MET=3.5, 60kg, 60分 → 210kcal", () => {
    expect(calcCardioKcal(3.5, 60, 60)).toBe(210);
  });

  it("MET=6, 80kg, 45分 → 360kcal", () => {
    expect(calcCardioKcal(6, 80, 45)).toBe(360);
  });
});
