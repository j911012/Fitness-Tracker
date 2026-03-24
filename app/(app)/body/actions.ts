"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { bodyRecordSchema } from "@/lib/validators/body";

// 仮のユーザーID（認証実装後に置き換える）
const TEMP_USER_ID = "temp-user-001";

export async function upsertBodyRecord(input: unknown) {
  const parsed = bodyRecordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { date, weight, bodyFat } = parsed.data;

  const record = await prisma.bodyRecord.upsert({
    where: {
      userId_date: {
        userId: TEMP_USER_ID,
        date: new Date(date),
      },
    },
    update: { weight, bodyFat },
    create: {
      userId: TEMP_USER_ID,
      date: new Date(date),
      weight,
      bodyFat,
    },
  });

  revalidatePath("/body");
  return { data: record };
}

export async function deleteBodyRecord(id: string) {
  await prisma.bodyRecord.delete({ where: { id } });
  revalidatePath("/body");
  return { success: true };
}
