# FitTrack

## 要件定義書 & システム設計書

**v1.0.0 MVP — 2026年3月改訂版**
技術スタック: Next.js 15 / Neon (PostgreSQL) / Prisma / NextAuth.js v5 / Vercel

---

## 1. プロジェクト概要

FitTrackは体重・食事・筋トレを一元管理する個人向けフィットネスWebアプリ。AIによる目標達成サポートと詳細なトレーニング統計を提供する。スマートフォン優先のレスポンシブ設計で、Next.jsベースのPWA構成を採用。

---

## 2. 技術スタック（確定）

### 2-1. SupabaseとNeonの比較と選定理由

両者ともPostgreSQLベースだが、Next.js + Vercel + Prismaの組み合わせではNeonが最適。

| 観点           | Neon                   | Supabase                       |
| -------------- | ---------------------- | ------------------------------ |
| Next.js親和性  | ◎ Vercelネイティブ統合 | ○ 手動設定が必要               |
| Serverless対応 | ◎ Cold Start高速       | △ 標準接続ではCold Start遅い   |
| Prisma連携     | ◎ 公式サポート         | ○ 動作するが最適化不要         |
| DB Branch機能  | ◎ Git like分岐可能     | × なし                         |
| Auth内蔵       | × なし（NextAuth使用） | ◎ 内蔵（ただし二重管理になる） |
| 画像Storage    | × なし                 | ◎ 内蔵                         |
| 無料枠         | ◎ 3GB・10プロジェクト  | ○ 500MB・2プロジェクト         |
| MVP判定        | ✅ 採用                | — 将来画像機能追加時に検討     |

> ※ 将来プロフィール画像・進捗写真機能を追加する場合はCloudflare R2かSupabase Storageを並列追加する。

### 2-2. 確定スタック一覧

| レイヤー       | 採用技術                    | 備考                          |
| -------------- | --------------------------- | ----------------------------- |
| フレームワーク | Next.js 15 (App Router)     | SSR・Server Actions活用       |
| 言語           | TypeScript 5.x              | strict mode必須               |
| スタイリング   | Tailwind CSS + shadcn/ui    | カスタムテーマ設定            |
| 状態管理       | Zustand + TanStack Query v5 | サーバー/クライアント状態分離 |
| グラフ         | Recharts                    | RadarChart・BarChart等        |
| 認証           | NextAuth.js v5              | Google OAuth + Email/PW       |
| DB             | Neon (PostgreSQL 16)        | Serverless Driver使用         |
| ORM            | Prisma 5.x                  | 型安全・マイグレーション管理  |
| AI機能         | Anthropic Claude API        | claude-sonnet-4-20250514      |
| ホスティング   | Vercel                      | 自動CI/CD・Edge Functions     |
| 通知 (v1.2)    | Web Push API + Vercel Cron  | Service Worker実装            |

---

## 3. 機能要件定義

### 3-1. MVP v1.0.0 必須機能

| #    | 機能             | 詳細                                                    | 備考                   |
| ---- | ---------------- | ------------------------------------------------------- | ---------------------- |
| F-01 | 認証             | メール/パスワード + Googleログイン                      | NextAuth.js v5         |
| F-02 | 体重記録         | 体重・体脂肪率の日次記録CRUD                            | 小数点1桁              |
| F-03 | 体重グラフ       | 折れ線グラフ・目標ライン表示                            | Recharts LineChart     |
| F-04 | 食事記録         | カスタム食品登録・過去食品再利用                        | 手動kcal入力           |
| F-05 | マクロ管理       | P/C/F入力・カロリー収支棒グラフ                         | 週次表示あり           |
| F-06 | 筋トレ記録       | 種目追加・セット/重量/回数記録                          | リアルタイム入力       |
| F-07 | 1RM計算          | O'Connor式: w×(1+r/40)                                  | セットごとリアルタイム |
| F-08 | トレーニング統計 | 累計重量・月次stats・部位/種目ランキング                | RadarChart含む         |
| F-09 | 有酸素記録       | ウォーキング/ランニング/サイクリング                    | METs × 体重 × 時間     |
| F-10 | 目標設定         | 体重目標・期限設定・活動レベル選択                      | ハリスベネディクト計算 |
| F-11 | カロリー自動計算 | TDEE + 目標差分 = 1日摂取目標                           | 安全マージン±750kcal   |
| F-12 | カレンダー       | 記録有無・筋トレ有無を視覚化・日付タップで詳細閲覧+編集 | 前後月ナビ・今日赤枠   |
| F-13 | ダッシュボード   | 今日のサマリー・AI提案バナー                            | 全セクション概観       |

### 3-2. トレーニング機能 詳細仕様（v1.0）

#### 筋トレ記録

- 部位分類: 胸 / 背中 / 肩 / 腕 / 脚 / 体幹（6カテゴリー）
- 種目DB: 各部位5種目プリセット + ユーザーカスタム追加
- セッション開始フロー: 開始ボタン → 部位選択画面 → 種目選択画面 → セット記録画面
- セット入力: 重量(kg, 0.5刻み) × 回数 をセットごとに記録
- 1RM表示: O'Connor式でセットごとにリアルタイム計算・最大値を表示
- Volume: セット内volume(重量×回数) + 種目合計 + セッション合計をリアルタイム表示
- 完了フロー: 完了ボタン → 確認シート（種目数・セット数・Volume確認） → 保存 → 「今日」タブに履歴表示
- 複数セッション: 1日に複数セッション連続記録が可能

#### トレーニング統計ダッシュボード（統計タブ）

- 累計総重量（全期間）、今月セット数、今月Volume、今月セッション数
- 週次Volume推移棒グラフ（直近5週）
- 部位バランス レーダーチャート（セット数ベース）
- 部位ランキング TOP3（プログレスバー付き）
- 種目ランキング TOP5（volume順、メダル表示）

#### 有酸素記録

- 種目: ウォーキング(METs 3.5) / ランニング(METs 8.0) / サイクリング(METs 6.8)
- 入力モード: 時間入力 or 距離入力を切り替え可能
- 消費カロリー自動計算: METs × 体重(kg) × 時間(h)
- 将来: カスタム種目追加・METsテーブル拡充

#### カレンダー日付詳細・編集

- 任意の日付タップ → ボトムシートで記録閲覧（体重・カロリー収支・食事・トレーニング）
- 「編集」ボタンで編集モード切り替え
- 体重・体脂肪: NumInputでインライン編集
- 食事: 削除（✕）+ 「＋ 追加」からインラインフォーム入力
- 追加/編集の導線を統一（同一ボタン）

### 3-3. カロリー計算仕様

#### 基礎代謝（BMR）— ハリス・ベネディクト式

```
男性: BMR = 88.362 + (13.397 × 体重kg) + (4.799 × 身長cm) - (5.677 × 年齢)
女性: BMR = 447.593 + (9.247 × 体重kg) + (3.098 × 身長cm) - (4.330 × 年齢)
```

#### TDEE（活動量補正）

| レベル   | 説明               | TDEE係数    |
| -------- | ------------------ | ----------- |
| 座りがち | デスクワーク中心   | BMR × 1.200 |
| 軽い活動 | 週1〜2回運動       | BMR × 1.375 |
| 中程度   | 週3〜5回運動       | BMR × 1.550 |
| 活発     | 週6〜7回運動       | BMR × 1.725 |
| 超活発   | 肉体労働＋毎日運動 | BMR × 1.900 |

#### 1日摂取目標カロリー計算

```
目標kcal = TDEE + (目標体重差kg × 7700 ÷ 残り日数)
```

- 体重差: 目標体重 - 現在体重（マイナス = 減量 → 摂取カロリー減）
- 安全マージン: 上限 TDEE+500kcal / 下限 TDEE-750kcal
- 有酸素消費カロリーは当日分をTDEEに加算して再計算

---

## 4. データベーススキーマ

### 4-1. ER関係

- User ─── 1:N ─── BodyRecord
- User ─── 1:N ─── MealLog ─── 1:N ─── MealItem → FoodItem
- User ─── 1:N ─── WorkoutSession ─── 1:N ─── SessionExercise ─── 1:N ─── ExerciseSet
- User ─── 1:N ─── FoodItem（カスタム食品マスタ）
- User ─── 1:N ─── CustomExercise（カスタム種目マスタ）
- User ─── 1:1 ─── UserProfile（身長・性別・活動レベル）
- User ─── 1:1 ─── Goal（目標体重・期限）

### 4-2. 主要テーブル定義

| テーブル名      | 主キー    | 主なカラム                                               |
| --------------- | --------- | -------------------------------------------------------- |
| User            | id (uuid) | email, name, createdAt                                   |
| UserProfile     | userId    | height, gender, birthDate, activityLevel                 |
| Goal            | userId    | targetWeight, deadline, updatedAt                        |
| BodyRecord      | id        | userId, date, weight, bodyFat                            |
| FoodItem        | id        | userId, name, kcalPer100g, protein, carbs, fat, isPublic |
| MealLog         | id        | userId, date, mealType(朝/昼/夜/間食)                    |
| MealItem        | id        | mealLogId, foodItemId, grams, kcal                       |
| WorkoutSession  | id        | userId, date, totalVolume, totalSets, notes              |
| SessionExercise | id        | sessionId, exerciseName, muscleGroup, order              |
| ExerciseSet     | id        | sessionExerciseId, setNum, weight, reps, oneRM           |
| CardioLog       | id        | userId, date, type, durationMin, distanceKm, kcalBurned  |

---

## 5. ディレクトリ構成（Next.js App Router）

> ※ ディレクトリ構成の詳細は別途会話にて確定予定。以下は暫定構成。

```
fitness-tracker/
├── app/
│   ├── (auth)/                # 認証ルート（公開）
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                 # 保護ルート（要認証）
│   │   ├── layout.tsx         # 共通ナビ・認証ガード
│   │   ├── page.tsx           # ダッシュボード
│   │   ├── body/page.tsx      # 体重・体脂肪
│   │   ├── meals/page.tsx     # 食事記録
│   │   ├── workouts/          # トレーニング
│   │   │   ├── page.tsx           # メイン（3タブ: 今日/統計/有酸素）
│   │   │   └── stats/page.tsx     # 統計詳細
│   │   ├── calendar/page.tsx  # カレンダー（日付詳細・編集）
│   │   └── settings/page.tsx  # 目標・プロフィール
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth
│       ├── body/route.ts
│       ├── meals/route.ts
│       ├── workouts/route.ts
│       ├── cardio/route.ts
│       └── ai/suggest/route.ts
├── components/
│   ├── ui/                    # shadcn/ui ベースコンポーネント
│   ├── charts/                # Recharts ラッパー
│   ├── workout/               # トレーニング固有コンポーネント
│   │   ├── GroupSelector.tsx      # 部位選択画面
│   │   ├── ExercisePicker.tsx     # 種目選択画面
│   │   ├── ExerciseCard.tsx       # セット記録カード
│   │   ├── SetRow.tsx
│   │   └── WorkoutStats.tsx
│   ├── calendar/
│   │   └── DayDetailSheet.tsx     # 日付詳細・編集シート
│   ├── meals/
│   └── layout/
├── lib/
│   ├── db/prisma.ts           # Prisma Client シングルトン
│   ├── auth/config.ts         # NextAuth設定
│   ├── calc/
│   │   ├── bmr.ts             # BMR/TDEE計算
│   │   ├── oneRM.ts           # O'Connor 1RM計算
│   │   └── cardio.ts          # METs消費カロリー計算
│   └── ai/claude.ts           # Claude API wrapper
└── prisma/
    ├── schema.prisma
    └── seed.ts                # 初期データ（種目マスタ等）
```

---

## 6. 主要計算ロジック実装仕様

### 6-1. O'Connor式 1RM計算

```ts
// lib/calc/oneRM.ts
export const calcOneRM = (weight: number, reps: number): number =>
  +(weight * (1 + reps / 40)).toFixed(1);
```

例: 80kg × 8回 → 80 × (1 + 8/40) = 80 × 1.2 = **96.0kg**

### 6-2. METs消費カロリー計算

```ts
// lib/calc/cardio.ts
export const calcCardioKcal = (
  mets: number,
  weightKg: number,
  durationMin: number,
): number => Math.round(mets * weightKg * (durationMin / 60));
```

### 6-3. 1日目標カロリー計算

```ts
// lib/calc/bmr.ts
// TDEE = BMR × activityFactor
// dailyTarget = TDEE + (weightDiff * 7700 / daysLeft)
// clamp(dailyTarget, TDEE - 750, TDEE + 500)
```

---

## 7. 開発ロードマップ

| フェーズ   | 期間目安   | 主要デリバリー                                                                |
| ---------- | ---------- | ----------------------------------------------------------------------------- |
| v1.0.0 MVP | Week 1-6   | 認証・体重・食事・筋トレ統計・有酸素・目標・カレンダー（閲覧+編集）・DB全機能 |
| v1.1.0     | Week 7-9   | AIメニュー提案(Claude API)・有酸素自動カロリーTDEE反映                        |
| v1.2.0     | Week 10-12 | Web Push通知・食品DB API連携（日本食品標準成分表）                            |
| v2.0.0     | Week 13-16 | PWA/オフライン対応・進捗写真・シェア機能・友達比較                            |

### Week別タスク詳細（v1.0.0）

| 期間     | フォーカス | タスク                                                                                                           |
| -------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| Week 1-2 | 基盤構築   | Next.js+TS+Tailwindセットアップ / Neon+Prismaスキーマ / NextAuth実装 / 共通レイアウト                            |
| Week 3-4 | コア機能   | 体重/体脂肪CRUD+グラフ / 食事記録+カロリー収支 / 筋トレセッション（3ステップフロー）+1RM計算                     |
| Week 5-6 | 仕上げ     | 統計ダッシュボード / カレンダー（詳細・編集） / 目標設定+自動カロリー計算 / 有酸素 / レスポンシブ最適化+デプロイ |

---

## 8. テスト戦略（Vitest + Playwright）

v1.0開発中からテストを段階的に導入する。ユニットテストはVitest、E2EテストはPlaywrightを採用。コンポーネントスナップショットはメンテコストが高いため最小限に抑え、ロジックとユーザーフローに集中する。

### 8-1. ツール選定と役割分担

| ツール                | 対象                     | 採用理由                                        |
| --------------------- | ------------------------ | ----------------------------------------------- |
| Vitest                | ユニット・ロジックテスト | Next.js/TS親和性高・Jestと互換・設定最小        |
| React Testing Library | コンポーネントテスト     | Vitest上で動作・DOMベースでUI変更に強い         |
| Playwright            | E2Eテスト                | クロスブラウザ対応・Vercel CI連携が公式サポート |
| GitHub Actions        | CI/CD                    | PR時に全テスト自動実行                          |

### 8-2. Vitest — ユニットテスト

#### 対象：計算ロジック（純粋関数）

計算系は副作用がなく純粋関数として実装するため、テストが最も書きやすく費用対効果が高い。

```ts
// lib/calc/oneRM.test.ts
import { calcOneRM } from "./oneRM";

test("O'Connor: 80kg × 8rep → 96.0kg", () => {
  expect(calcOneRM(80, 8)).toBe(96.0);
});
test("自重（0kg）× 8rep → 0kg", () => {
  expect(calcOneRM(0, 8)).toBe(0);
});
```

```ts
// lib/calc/bmr.test.ts
test("TDEE: BMR × 活動係数（中程度: 1.55）", () => {
  expect(calcTDEE(1800, "moderate")).toBe(2790);
});
test("目標kcal: TDEE ± 安全マージン内に収まること", () => {
  const result = calcDailyTarget(2500, 75, 70, 49);
  expect(result).toBeGreaterThanOrEqual(2500 - 750);
  expect(result).toBeLessThanOrEqual(2500 + 500);
});
```

```ts
// lib/calc/cardio.test.ts
test("METs: ランニング 8.0 × 75kg × 30min → 300kcal", () => {
  expect(calcCardioKcal(8.0, 75, 30)).toBe(300);
});
```

#### 対象：コンポーネント（インタラクション）

スナップショットは採用しない。ユーザー操作（クリック・入力）の振る舞いをテストする。

```ts
// components/workout/NumInput.test.tsx
test('+ボタンで値が step 分増加する', async () => {
  render(<NumInput value={60} step={2.5} onChange={mockFn} />)
  await userEvent.click(screen.getByRole('button', { name: '+' }))
  expect(mockFn).toHaveBeenCalledWith(62.5)
})
```

### 8-3. Playwright — E2Eテスト

#### 対象：主要ユーザーフロー（必須5本）

| #   | フロー名             | シナリオ概要                                                                           |
| --- | -------------------- | -------------------------------------------------------------------------------------- |
| E1  | 認証                 | メール/PWでログイン → ダッシュボードへ遷移                                             |
| E2  | 体重記録             | 記録ボタン → 数値入力 → 保存 → グラフに反映                                            |
| E3  | 筋トレ記録           | 開始 → 部位選択（胸） → 種目選択（ベンチプレス） → 3セット入力 → 完了 → 今日タブに表示 |
| E4  | 食事記録             | 追加 → 食品名・kcal入力 → 保存 → カロリー収支に反映                                    |
| E5  | カレンダー閲覧・編集 | カレンダー → 日付タップ → 詳細シート表示 → 編集 → 保存                                 |

```ts
// e2e/workout.spec.ts
test("筋トレ記録 E2Eフロー", async ({ page }) => {
  await page.goto("/workouts");
  await page.click("text=開始"); // 開始ボタン
  await page.click("text=胸"); // 部位選択
  await page.click("text=ベンチプレス"); // 種目選択
  // セット入力...
  await page.click("text=完了");
  await page.click("text=完了して保存");
  await expect(page.locator("text=今日 完了")).toBeVisible();
});
```

### 8-4. 導入スケジュール

| フェーズ | タイミング                  | 内容                                                                             |
| -------- | --------------------------- | -------------------------------------------------------------------------------- |
| Phase 1  | v1.0開発中（Week 1〜）      | Vitestセットアップ / 計算ロジックのユニットテスト（TDD気味に先行実装）           |
| Phase 2  | v1.0リリース前（Week 5〜6） | Playwrightセットアップ / E2E必須5本実装                                          |
| Phase 3  | v1.1以降                    | GitHub Actions CI/CD組み込み / PRマージ前に全テスト自動実行 / カバレッジレポート |

### 8-5. カバレッジ目標

| 対象                     | 目標カバレッジ     | 備考                                         |
| ------------------------ | ------------------ | -------------------------------------------- |
| lib/calc/\* 計算ロジック | 100%               | BMR / TDEE / 1RM / METs 全関数               |
| lib/auth/\* 認証ロジック | 80%以上            | セッション検証・リダイレクト                 |
| components/workout/\*    | 60%以上            | NumInput・ExerciseCard等の主要コンポーネント |
| E2Eフロー                | 必須5本            | 認証/体重/筋トレ/食事/カレンダー             |
| API routes               | 主要エンドポイント | CRUD操作・バリデーション                     |

### 8-6. CI/CD設定例（GitHub Actions）

```yaml
# .github/workflows/test.yml
on: [pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run test:unit
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## 9. 未解決・後日確定事項

- ディレクトリ構成の詳細（別途会話にて確定予定）
- エラートラッキング（Sentry等）の要否
- i18n対応（日本語のみでよいか）
- ダークモード固定 or ライトモード切り替え対応
- テストDBの分離方法（Neon branch機能を利用するか）

---

_最終更新: 2026年3月12日 | FitTrack 開発計画書 v3.0_
