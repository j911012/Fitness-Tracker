// 動的 API を使用する画面は loading.tsx を必ず配置する
// ページ遷移時のローディング UI として自動的に使われる
export default function Loading() {
  return <p className="text-muted-foreground text-sm">読み込み中...</p>;
}
