"use client";

// recharts はクライアント専用ライブラリのため "use client" が必要
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { use } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Result } from "@/types/result";
import type { MealLogWithItems } from "@/apis/meal.server";
import type { MealType } from "@prisma/client";

type Props = {
  logsPromise: Promise<Result<MealLogWithItems[]>>;
};

// 積み上げバーチャートの色（食事タイプごと）
const MEAL_COLORS: Record<MealType, string> = {
  BREAKFAST: "#f97316",
  LUNCH: "#22c55e",
  DINNER: "#6366f1",
  SNACK: "#f59e0b",
};

const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: "朝食",
  LUNCH: "昼食",
  DINNER: "夕食",
  SNACK: "間食",
};

// 週次の食事タイプ別カロリーを積み上げバーチャートで表示する
// recharts は CSR 専用のため "use client" コンポーネントで使用する
export default function MacroBarChart({ logsPromise }: Props) {
  const result = use(logsPromise);

  if (!result.isSuccess) {
    return (
      <p className="text-destructive text-sm">{result.errorMessage}</p>
    );
  }

  if (result.data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        週次グラフのデータがありません。
      </p>
    );
  }

  // 日付 → 食事タイプ別 kcal の Map を構築する
  // Map を使うことで日付順を保持しながら O(n) で集計できる
  const dailyMap = new Map<
    string,
    { date: string; BREAKFAST: number; LUNCH: number; DINNER: number; SNACK: number }
  >();

  result.data.forEach((log) => {
    const dateStr = format(new Date(log.date), "M/d", { locale: ja });
    if (!dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, {
        date: dateStr,
        BREAKFAST: 0,
        LUNCH: 0,
        DINNER: 0,
        SNACK: 0,
      });
    }
    const entry = dailyMap.get(dateStr)!;
    const logKcal = log.items.reduce((sum, item) => sum + item.kcal, 0);
    entry[log.mealType] += Math.round(logKcal);
  });

  const data = Array.from(dailyMap.values());

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">週次カロリー推移</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit="kcal" />
          <Tooltip
            formatter={(value, name) => [
              `${value} kcal`,
              MEAL_LABELS[name as MealType],
            ]}
          />
          <Legend
            formatter={(value) => MEAL_LABELS[value as MealType]}
          />
          {/* stackId を統一して積み上げ表示にする */}
          {(Object.keys(MEAL_COLORS) as MealType[]).map((mealType) => (
            <Bar
              key={mealType}
              dataKey={mealType}
              stackId="kcal"
              fill={MEAL_COLORS[mealType]}
              name={mealType}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
