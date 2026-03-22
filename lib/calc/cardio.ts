export function calcCardioKcal(
  mets: number,
  weightKg: number,
  durationMin: number,
): number {
  return Math.round(mets * weightKg * (durationMin / 60));
}
