// loading.tsx — Next.js の規約ファイル
// (private)/layout.tsx で cookies() などの動的 API を使用するため
// このルートは動的レンダリングになる。その際のページ全体ローディングを担う。
// Suspense のフォールバックよりも先に表示される（初回ナビゲーション時）
export default function Loading() {
  return (
    <p className="text-muted-foreground text-sm">食事記録を読み込み中...</p>
  );
}
