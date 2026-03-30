"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Result } from "@/types/result";
import type { MealLogWithItems } from "@/apis/meal.server";
import type { MealType } from "@prisma/client";

type Props = {
  logsPromise: Promise<Result<MealLogWithItems[]>>;
};

// 食事タイプの日本語ラベル
const MEAL_TYPE_LABEL: Record<MealType, string> = {
  BREAKFAST: "朝食",
  LUNCH: "昼食",
  DINNER: "夕食",
  SNACK: "間食",
};

// 表示順（朝→昼→夜→間食）
const MEAL_TYPE_ORDER: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

// 今日の食事ログをタイプ別にグループ化して表示する
// MacroSummaryBar と同じ Promise を受け取るが、
// React が同一 Promise をメモ化するため実際の fetch は1回だけ（Request Memoization）
export default function MealLogCard({ logsPromise }: Props) {
  const result = use(logsPromise);

  if (!result.isSuccess) {
    return (
      <p className="text-destructive text-sm">{result.errorMessage}</p>
    );
  }

  if (result.data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        まだ食事記録がありません。上のフォームから追加してください。
      </p>
    );
  }

  // 食事タイプ別にグループ化する
  const grouped = result.data.reduce<
    Partial<Record<MealType, MealLogWithItems[]>>
  >((acc, log) => {
    if (!acc[log.mealType]) acc[log.mealType] = [];
    acc[log.mealType]!.push(log);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {MEAL_TYPE_ORDER.filter((type) => grouped[type]).map((mealType) => {
        const logs = grouped[mealType]!;
        // 食事タイプ合計カロリー
        const totalKcal = logs.reduce(
          (sum, log) => sum + log.items.reduce((s, item) => s + item.kcal, 0),
          0,
        );

        return (
          <Card key={mealType}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{MEAL_TYPE_LABEL[mealType]}</span>
                <span className="text-muted-foreground text-sm font-normal">
                  {Math.round(totalKcal)} kcal
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {/* 同タイプに複数の MealLog がある場合も全 items を展開する */}
                {logs.flatMap((log) =>
                  log.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>{item.foodItem.name}</span>
                      <span className="text-muted-foreground">
                        {item.grams}g /{" "}
                        {Math.round(item.kcal)} kcal
                      </span>
                    </li>
                  )),
                )}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
