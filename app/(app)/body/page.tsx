import { prisma } from "@/lib/db/prisma";
import { BodyRecordFormClient } from "@/components/body/BodyRecordFormClient";
import { WeightLineChart } from "@/components/charts/WeightLineChart";

// 仮のユーザーID（認証実装後に置き換える）
const TEMP_USER_ID = "temp-user-001";

export default async function BodyPage() {
  // 直近90日のデータを取得
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const records = await prisma.bodyRecord.findMany({
    where: {
      userId: TEMP_USER_ID,
      date: { gte: since },
    },
    orderBy: { date: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">体重記録</h1>
      <BodyRecordFormClient />
      <WeightLineChart records={records} />
    </div>
  );
}
