import { z } from "zod";

// 1セットの入力（例: 80kg × 10回）
export const exerciseSetSchema = z.object({
  setNum: z.number().int().min(1),
  // 自重トレーニングは0kgも許容
  weight: z.number().min(0, "0kg以上で入力してください"),
  // 0回のセットは保存時に自動除外（バリデーションでは許容）
  reps: z.number().int().min(0),
});

// 1種目の入力（例: ベンチプレス 3セット）
export const sessionExerciseSchema = z.object({
  exerciseName: z.string().min(1, "種目名を入力してください"),
  muscleGroup: z.string().min(1, "部位を選択してください"),
  order: z.number().int().min(1),
  sets: z.array(exerciseSetSchema).min(1, "セットを1つ以上追加してください"),
});

// 1セッション全体の入力
export const workoutSessionSchema = z.object({
  // 記録日（例: "2024-03-17"）
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD形式で入力してください"),
  notes: z.string().max(500).optional(),
  exercises: z
    .array(sessionExerciseSchema)
    .min(1, "種目を1つ以上追加してください"),
});

export type ExerciseSetInput = z.infer<typeof exerciseSetSchema>;
export type SessionExerciseInput = z.infer<typeof sessionExerciseSchema>;
export type WorkoutSessionInput = z.infer<typeof workoutSessionSchema>;
