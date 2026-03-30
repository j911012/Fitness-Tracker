"use server";

import { revalidateTag } from "next/cache";
import { mealLogSchema, foodItemSchema } from "@/lib/validators/meal";
import {
  createMealLogDB,
  createCustomFoodItemDB,
} from "@/apis/meal.server";
import type { Result } from "@/types/result";
import type { FoodItem, MealLog } from "@prisma/client";

// 仮のユーザーID（認証実装後に置き換える）
const TEMP_USER_ID = "temp-user-001";

// 食事ログを作成する
// items の kcal は「kcalPer100g × grams / 100」で計算して保存する
// （食品マスタが後から変更されても履歴が壊れないよう、記録時点の値を持つ）
export async function createMealLog(
  input: unknown,
): Promise<Result<MealLog>> {
  const parsed = mealLogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      isSuccess: false,
      errorMessage: Object.values(parsed.error.flatten().fieldErrors)
        .flat()
        .join(" / "),
    };
  }

  const { date, mealType, items } = parsed.data;

  // foodItemId → FoodItem のマップを一括取得してN+1を避ける
  const { prisma } = await import("@/lib/db/prisma");
  const foodIds = items.map((i) => i.foodItemId);
  const foodItems = await prisma.foodItem.findMany({
    where: { id: { in: foodIds } },
  });
  const foodMap = new Map(foodItems.map((f) => [f.id, f]));

  // 各明細に kcal を付与する
  const itemsWithKcal = items.map((item) => {
    const food = foodMap.get(item.foodItemId);
    if (!food) throw new Error(`食品が見つかりません: ${item.foodItemId}`);
    const kcal = Math.round((food.kcalPer100g * item.grams) / 100);
    return { foodItemId: item.foodItemId, grams: item.grams, kcal };
  });

  const result = await createMealLogDB(
    TEMP_USER_ID,
    new Date(date),
    mealType,
    itemsWithKcal,
  );

  if (result.isSuccess) {
    // meal-logs タグのキャッシュを再検証してページを最新化する
    // Next.js 16 から revalidateTag の第2引数 profile が必須になった
    revalidateTag("meal-logs", {});
  }

  return result;
}

// ユーザー独自の食品マスタを登録する
export async function createCustomFoodItem(
  input: unknown,
): Promise<Result<FoodItem>> {
  const parsed = foodItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      isSuccess: false,
      errorMessage: Object.values(parsed.error.flatten().fieldErrors)
        .flat()
        .join(" / "),
    };
  }

  const result = await createCustomFoodItemDB(TEMP_USER_ID, parsed.data);

  return result;
}
