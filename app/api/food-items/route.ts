// Route Handler — 食品マスタの検索エンドポイント
// クライアントからの検索リクエストを受け取り、サーバー側でDBを叩く
// クライアントに直接Prismaを公開しないためのBFF層

import { NextRequest, NextResponse } from "next/server";
import { searchFoodItemsDB } from "@/apis/meal.server";

// 仮のユーザーID（認証実装後にセッションから取得する）
const TEMP_USER_ID = "temp-user-001";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  // 空クエリは検索しない（不要なDB負荷を避ける）
  if (q.length < 1) {
    return NextResponse.json([]);
  }

  const result = await searchFoodItemsDB(q, TEMP_USER_ID);

  if (!result.isSuccess) {
    return NextResponse.json({ error: result.errorMessage }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
