import { z } from "zod";

export const bodyRecordSchema = z.object({
  // 記録日（例: "2024-03-17"）
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD形式で入力してください"),
  // ユーザー自身の体重（kg）
  weight: z
    .number()
    .min(20, "20kg以上で入力してください")
    .max(300, "300kg以下で入力してください"),
  // 体脂肪率（%）任意入力
  bodyFat: z.number().min(1).max(70).optional(),
});

// z.infer でスキーマから TypeScript 型を自動生成
export type BodyRecordInput = z.infer<typeof bodyRecordSchema>;
