import { Suspense } from "react";
import { format, subDays } from "date-fns";
import { fetchMealLogs, fetchMealLogsRange } from "@/apis/meal.server";
import { fetchGoal } from "@/apis/goal.server";
import MacroSummaryBar from "@/components/meals/MacroSummaryBar";
import MealLogCard from "@/components/meals/MealLogCard";
import MacroBarChart from "@/components/charts/MacroBarChart";
import FoodItemSearch from "@/components/meals/FoodItemSearch";

const TEMP_USER_ID = "temp-user-001";

export default function MealsPage() {
  // date-fns の format でローカルタイムゾーンの日付文字列を取得し
  // new Date("YYYY-MM-DD") で UTC midnight に変換する
  // → actions.ts の new Date(dateString) と同じ変換方式で日付が一致する
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const today = new Date(todayStr); // UTC midnight

  const since = new Date(format(subDays(new Date(), 6), "yyyy-MM-dd")); // 6日前 UTC midnight

  // 3つの Promise を並列で発行（await しない — 子で use() により解凍）
  // Promise.all ではなく個別に渡すことで各 Suspense が独立してストリーミングされる
  const todayLogsPromise = fetchMealLogs(TEMP_USER_ID, today);
  const weekLogsPromise = fetchMealLogsRange(TEMP_USER_ID, since, today);
  const goalPromise = fetchGoal(TEMP_USER_ID);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">食事記録</h1>

      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">サマリーを読み込み中...</p>
        }
      >
        <MacroSummaryBar
          logsPromise={todayLogsPromise}
          goalPromise={goalPromise}
          date={today}
        />
      </Suspense>

      <Suspense>
        <FoodItemSearch />
      </Suspense>

      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">食事記録を読み込み中...</p>
        }
      >
        <MealLogCard logsPromise={todayLogsPromise} />
      </Suspense>

      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">グラフを読み込み中...</p>
        }
      >
        <MacroBarChart logsPromise={weekLogsPromise} />
      </Suspense>
    </div>
  );
}
