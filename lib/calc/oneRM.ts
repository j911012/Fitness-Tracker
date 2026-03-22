export function calcOneRM(weight: number, reps: number): number {
  return weight * (1 + reps / 40);
}
