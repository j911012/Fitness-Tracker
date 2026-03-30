"use client";

import { use } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Result } from "@/types/result";
import type { MealLogWithItems } from "@/apis/meal.server";
import type { Goal } from "@prisma/client";

type Props = {
  logsPromise: Promise<Result<MealLogWithItems[]>>;
  goalPromise: Promise<Result<Goal | null>>;
  date: Date;
};

// 進捗率に応じたプログレスバーの色
// 0〜79%: 緑、80〜99%: 黄、100%+: 赤
function barColorClass(actual: number, target: number): string {
  if (target <= 0) return "bg-green-500";
  const ratio = actual / target;
  if (ratio < 0.8) return "bg-green-500";
  if (ratio < 1.0) return "bg-yellow-400";
  return "bg-red-500";
}

type ProgressBarProps = { actual: number; target: number };

function ProgressBar({ actual, target }: ProgressBarProps) {
  // target 超過時は 100% 表示に止める（バーが溢れないよう clamp）
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-all ${barColorClass(actual, target)}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function MacroSummaryBar({ logsPromise, goalPromise, date }: Props) {
  const logsResult = use(logsPromise);
  const goalResult = use(goalPromise);

  if (!logsResult.isSuccess) {
    return <p className="text-destructive text-sm">{logsResult.errorMessage}</p>;
  }

  // 今日の実績を集計する
  const totals = logsResult.data.reduce(
    (acc, log) => {
      log.items.forEach((item) => {
        acc.kcal += item.kcal;
        // PFC は食品マスタの 100g あたり値 × 実際のグラム数で算出
        acc.protein += (item.foodItem.protein * item.grams) / 100;
        acc.carbs += (item.foodItem.carbs * item.grams) / 100;
        acc.fat += (item.foodItem.fat * item.grams) / 100;
      });
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  // 目標値: Goal.dailyTarget（kcal）から PFC を標準比率で算出する
  // 設定画面（F-10）未実装のため、目標未設定の場合は進捗なしで表示する
  const goal = goalResult.isSuccess ? goalResult.data : null;
  const dailyTarget = goal?.dailyTarget ?? null;
  const targets = dailyTarget
    ? {
        kcal: Math.round(dailyTarget),
        // タンパク質: カロリーの 25% → g 換算（1g = 4kcal）
        protein: Math.round((dailyTarget * 0.25) / 4),
        // 炭水化物: カロリーの 50% → g 換算（1g = 4kcal）
        carbs: Math.round((dailyTarget * 0.5) / 4),
        // 脂質: カロリーの 25% → g 換算（1g = 9kcal）
        fat: Math.round((dailyTarget * 0.25) / 9),
      }
    : null;

  const dateStr = format(date, "M月d日 (E)", { locale: ja });

  const macros = [
    {
      label: "タンパク質",
      actual: totals.protein,
      target: targets?.protein,
      unit: "g",
      color: "text-blue-500",
    },
    {
      label: "炭水化物",
      actual: totals.carbs,
      target: targets?.carbs,
      unit: "g",
      color: "text-yellow-500",
    },
    {
      label: "脂質",
      actual: totals.fat,
      target: targets?.fat,
      unit: "g",
      color: "text-red-500",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm font-medium">
        今日の記録 — {dateStr}
      </p>

      {/* カロリー メインカード */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium">カロリー</span>
          <div className="text-right">
            <span className="text-3xl font-bold text-orange-500">
              {Math.round(totals.kcal).toLocaleString()}
            </span>
            {targets ? (
              <span className="text-muted-foreground text-sm ml-1">
                / {targets.kcal.toLocaleString()} kcal
              </span>
            ) : (
              <span className="text-muted-foreground text-sm ml-1">kcal</span>
            )}
          </div>
        </div>
        {targets && (
          <>
            <ProgressBar actual={totals.kcal} target={targets.kcal} />
            <p className="text-muted-foreground text-right text-xs">
              {Math.round((totals.kcal / targets.kcal) * 100)}%
            </p>
          </>
        )}
        {!targets && (
          <p className="text-muted-foreground text-xs">
            目標未設定 — 設定画面からカロリー目標を入力すると進捗が表示されます
          </p>
        )}
      </div>

      {/* PFC サブカード */}
      <div className="grid grid-cols-3 gap-3">
        {macros.map(({ label, actual, target, unit, color }) => (
          <div key={label} className="rounded-lg border p-3 space-y-2">
            <p className="text-muted-foreground text-xs">{label}</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${color}`}>
                {Math.round(actual)}
              </span>
              {target ? (
                <span className="text-muted-foreground text-xs">
                  / {target}{unit}
                </span>
              ) : (
                <span className="text-muted-foreground text-xs">{unit}</span>
              )}
            </div>
            {target && <ProgressBar actual={actual} target={target} />}
          </div>
        ))}
      </div>
    </div>
  );
}
