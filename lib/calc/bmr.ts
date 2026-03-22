const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// 基礎代謝（改訂版ハリス・ベネディクト式）
export function calcBMR(
  gender: "male" | "female",
  heightCm: number,
  weightKg: number,
  age: number,
): number {
  if (gender === "male") {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  }
}

// TDEE = BMR × 活動係数
export function calcTDEE(bmr: number, activityLevel: string): number {
  const multiplier = activityMultipliers[activityLevel] ?? 1.2;
  return bmr * multiplier;
}

// 1日の摂取カロリー目標（±750kcalでclamp）
export function calcDailyTarget(tdee: number, adjustment: number): number {
  const clamped = Math.max(-750, Math.min(750, adjustment));
  return tdee + clamped;
}
