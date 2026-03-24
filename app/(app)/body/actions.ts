"use server";

import { revalidateTag } from "next/cache";
import { bodyRecordSchema } from "@/lib/validators/body";
import {
  upsertBodyRecordDB,
  deleteBodyRecordDB,
} from "@/apis/body.server";
import type { Result } from "@/types/result";
import type { BodyRecord } from "@prisma/client";

// 仮のユーザーID（認証実装後に置き換える）
const TEMP_USER_ID = "temp-user-001";

// 体重記録を登録・更新する（同日は上書き）
export async function upsertBodyRecord(
  input: unknown,
): Promise<Result<BodyRecord>> {
  // zod でバリデーション。失敗時はフィールドエラーを返す
  const parsed = bodyRecordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      isSuccess: false,
      errorMessage: Object.values(parsed.error.flatten().fieldErrors)
        .flat()
        .join(" / "),
    };
  }

  const { date, weight, bodyFat } = parsed.data;

  const result = await upsertBodyRecordDB(
    TEMP_USER_ID,
    new Date(date),
    weight,
    bodyFat,
  );

  if (result.isSuccess) {
    // body-records タグのキャッシュを再検証し、グラフを最新化する
    revalidateTag("body-records");
  }

  return result;
}

// 体重記録を削除する
export async function deleteBodyRecord(id: string): Promise<Result<void>> {
  const result = await deleteBodyRecordDB(id);

  if (result.isSuccess) {
    revalidateTag("body-records");
  }

  return result;
}
