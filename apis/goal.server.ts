// goal.server.ts — Goal（目標）のDBアクセス層
// 設定画面で入力した目標カロリーをサマリーバーの進捗表示に使用する

import { prisma } from "@/lib/db/prisma";
import type { Goal } from "@prisma/client";
import type { Result } from "@/types/result";

// ユーザーの目標を取得する（未設定の場合は null）
export async function fetchGoal(userId: string): Promise<Result<Goal | null>> {
  try {
    const goal = await prisma.goal.findUnique({ where: { userId } });
    return { isSuccess: true, data: goal };
  } catch {
    return { isSuccess: false, errorMessage: "目標の取得に失敗しました" };
  }
}
