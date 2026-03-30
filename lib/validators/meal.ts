import { z } from "zod";

// 食品マスタの入力（ユーザー独自食品の登録）
export const foodItemSchema = z.object({
  name: z.string().min(1, "食品名を入力してください"),
  // 100gあたりの栄養素
  kcalPer100g: z.number().min(0, "0以上で入力してください"),
  // PFC は任意入力。未入力の場合は 0 として保存する
  protein: z.number().min(0).default(0),
  carbs: z.number().min(0).default(0),
  fat: z.number().min(0).default(0),
});

// 食事ログの明細（何を何g食べたか）
export const mealItemSchema = z.object({
  foodItemId: z.string().min(1),
  // 0gは意味がないので1g以上
  grams: z.number().min(1, "1g以上で入力してください"),
});

// 食事ログの入力（朝食・昼食・夕食・間食）
export const mealLogSchema = z.object({
  // 記録日（例: "2024-03-17"）
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD形式で入力してください"),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  items: z.array(mealItemSchema).min(1, "食品を1つ以上追加してください"),
});

export type FoodItemInput = z.infer<typeof foodItemSchema>;
export type MealItemInput = z.infer<typeof mealItemSchema>;
export type MealLogInput = z.infer<typeof mealLogSchema>;
