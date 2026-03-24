// body.server.ts — BodyRecord の DB アクセス層（サーバー専用）
// Server Actions から直接 Prisma を呼ばず、この層を経由することで
// データアクセスロジックを一箇所に集約し、テスト・差し替えを容易にする

import { prisma } from "@/lib/db/prisma";
import type { BodyRecord } from "@prisma/client";
import type { Result } from "@/types/result";

// 直近 N 日の体重記録を昇順で取得する
export async function fetchBodyRecords(
  userId: string,
  sinceDays: number,
): Promise<Result<BodyRecord[]>> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - sinceDays);

    const records = await prisma.bodyRecord.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "asc" },
    });

    return { isSuccess: true, data: records };
  } catch {
    return { isSuccess: false, errorMessage: "体重記録の取得に失敗しました" };
  }
}

// 指定日の体重記録を upsert（同日は上書き）する
export async function upsertBodyRecordDB(
  userId: string,
  date: Date,
  weight: number,
  bodyFat?: number,
): Promise<Result<BodyRecord>> {
  try {
    const record = await prisma.bodyRecord.upsert({
      where: { userId_date: { userId, date } },
      update: { weight, bodyFat },
      create: { userId, date, weight, bodyFat },
    });

    return { isSuccess: true, data: record };
  } catch {
    return { isSuccess: false, errorMessage: "体重記録の保存に失敗しました" };
  }
}

// 指定 ID の体重記録を削除する
export async function deleteBodyRecordDB(
  id: string,
): Promise<Result<void>> {
  try {
    await prisma.bodyRecord.delete({ where: { id } });
    return { isSuccess: true, data: undefined };
  } catch {
    return { isSuccess: false, errorMessage: "体重記録の削除に失敗しました" };
  }
}
