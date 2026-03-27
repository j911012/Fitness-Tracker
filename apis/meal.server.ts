// meal.server.ts — MealLog/FoodItemのDBアクセス層（サーバー専用）
// Server Actions・Route Handlerから直接Prismaを呼ばず、この層を経由する

import { prisma } from "@/lib/db/prisma";
import type { FoodItem, MealLog, MealItem, MealType } from "@prisma/client";
import type { Result } from "@/types/result";

// MealItem に foodItem を結合した型（PFC 計算・表示で使用）
type MealItemWithFood = MealItem & { foodItem: FoodItem };
export type MealLogWithItems = MealLog & { items: MealItemWithFood[] };

// 指定日の食事ログ（items + foodItem 込み）を昇順で取得する
export async function fetchMealLogs(
  userId: string,
  date: Date,
): Promise<Result<MealLogWithItems[]>> {
  try {
    const logs = await prisma.mealLog.findMany({
      where: { userId, date },
      include: {
        items: {
          include: { foodItem: true }, // PFC 表示に必要
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return { isSuccess: true, data: logs };
  } catch {
    return { isSuccess: false, errorMessage: "食事記録の取得に失敗しました" };
  }
}

// 指定期間の食事ログを取得する（週次グラフ用）
export async function fetchMealLogsRange(
  userId: string,
  since: Date,
  until: Date,
): Promise<Result<MealLogWithItems[]>> {
  try {
    const logs = await prisma.mealLog.findMany({
      where: { userId, date: { gte: since, lte: until } },
      include: {
        items: {
          include: { foodItem: true },
        },
      },
      orderBy: { date: "asc" },
    });
    return { isSuccess: true, data: logs };
  } catch {
    return { isSuccess: false, errorMessage: "食事記録の取得に失敗しました" };
  }
}

// 食品マスタを名前で部分一致検索する（共通食品 + ユーザー独自食品）
export async function searchFoodItemsDB(
  query: string,
  userId: string,
): Promise<Result<FoodItem[]>> {
  try {
    const items = await prisma.foodItem.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
        // 共通食品（isPublic=true）またはユーザー自身の食品を返す
        OR: [{ isPublic: true }, { userId }],
      },
      take: 20, // 最大20件に絞り表示パフォーマンスを確保
    });
    return { isSuccess: true, data: items };
  } catch {
    return { isSuccess: false, errorMessage: "食品の検索に失敗しました" };
  }
}

// 食事ログと明細を一括作成する（MealLog + MealItem をトランザクションで保存）
export async function createMealLogDB(
  userId: string,
  date: Date,
  mealType: MealType,
  items: { foodItemId: string; grams: number; kcal: number }[],
): Promise<Result<MealLog>> {
  try {
    const log = await prisma.mealLog.create({
      data: {
        userId,
        date,
        mealType,
        items: { create: items }, // Prisma のネスト create でトランザクション保存
      },
    });
    return { isSuccess: true, data: log };
  } catch {
    return { isSuccess: false, errorMessage: "食事記録の保存に失敗しました" };
  }
}

// ユーザー独自の食品マスタを登録する
export async function createCustomFoodItemDB(
  userId: string,
  data: {
    name: string;
    kcalPer100g: number;
    protein: number;
    carbs: number;
    fat: number;
  },
): Promise<Result<FoodItem>> {
  try {
    const item = await prisma.foodItem.create({
      data: { ...data, userId, isPublic: false },
    });
    return { isSuccess: true, data: item };
  } catch {
    return { isSuccess: false, errorMessage: "食品の登録に失敗しました" };
  }
}
