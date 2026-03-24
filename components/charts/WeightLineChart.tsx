"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { BodyRecord } from "@prisma/client";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type Props = {
  records: BodyRecord[];
};

export function WeightLineChart({ records }: Props) {
  if (records.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        まだ記録がありません。体重を入力してください。
      </p>
    );
  }

  const data = records.map((r) => ({
    date: format(new Date(r.date), "M/d", { locale: ja }),
    weight: r.weight,
    bodyFat: r.bodyFat,
  }));

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">体重推移（直近90日）</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} unit="kg" />
          <Tooltip formatter={(value) => [`${value}kg`]} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="体重"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
