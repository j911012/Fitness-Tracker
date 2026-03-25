import { Suspense } from "react";
import { fetchBodyRecords } from "@/apis/body.server";
import { BodyRecordFormClient } from "@/components/body/BodyRecordFormClient";
import WeightLineChart from "@/components/charts/WeightLineChart";

// 仮のユーザーID（認証実装後に置き換える）
const TEMP_USER_ID = "temp-user-001";

// page.tsx は同期 Server Component にする
// await せず Promise のまま子コンポーネントに渡すことで
// Suspense によるストリーミングが有効になる
export default function BodyPage() {
  // await しない — WeightLineChart 内で use() により解凍する
  const recordsPromise = fetchBodyRecords(TEMP_USER_ID, 90);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">体重記録</h1>
      {/* dynamic import のため Suspense でラップ */}
      <Suspense>
        <BodyRecordFormClient />
      </Suspense>
      {/* Promise を渡し、内部で use() して Suspense とストリーミングを活用 */}
      <Suspense fallback={<p className="text-muted-foreground text-sm">グラフを読み込み中...</p>}>
        <WeightLineChart recordsPromise={recordsPromise} />
      </Suspense>
    </div>
  );
}
