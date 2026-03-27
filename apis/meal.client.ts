// meal.client.ts — 食事関連のクライアント用APIクライアント
// Route Handlerを経由してデータを取得する（Prismaをクライアントに公開しない）
// エラーはthrowしてTanStack Queryのerrorに委任する

import type { FoodItem } from "@prisma/client";

// 食品マスタを名前で検索する（FoodItemSearch コンポーネントの useQuery で使用）
export async function searchFoodItems(query: string): Promise<FoodItem[]> {
  const res = await fetch(`/api/food-items?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("食品の検索に失敗しました");
  return await res.json();
}
