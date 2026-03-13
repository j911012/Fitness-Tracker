# FitTrack TODO

## Phase 1 — 基盤構築（Week 1-2）

### 環境・ツール
- [ ] create-next-app 実行（TypeScript / Tailwind / ESLint / App Router）
- [ ] shadcn/ui 初期化（New York style, CSS variables）
- [ ] shadcn コンポーネント追加（button, input, card, dialog, sheet, form, tabs, calendar 等）
- [ ] ランタイム依存インストール（prisma, next-auth, zustand, tanstack-query, recharts, anthropic 等）
- [ ] 開発依存インストール（vitest, playwright 等）
- [ ] `.env.local` 設定（DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, GOOGLE_*, ANTHROPIC_API_KEY）
- [ ] `vitest.config.ts` 作成
- [ ] `playwright.config.ts` 作成
- [ ] `package.json` に `postinstall: prisma generate` 追加

### データベース
- [ ] `prisma/schema.prisma` — 11モデル定義
  - [ ] User, UserProfile, Goal（`@@unique([userId])`）
  - [ ] BodyRecord（`@@unique([userId, date])`）
  - [ ] FoodItem, MealLog（mealType enum: BREAKFAST/LUNCH/DINNER/SNACK）, MealItem
  - [ ] WorkoutSession, SessionExercise, ExerciseSet（oneRmKg 書き込み時計算・保存）
  - [ ] CardioLog, CustomExercise
- [ ] `npx prisma generate && npx prisma migrate dev --name init`
- [ ] `lib/db/prisma.ts` — グローバルシングルトン
- [ ] `prisma/seed.ts` — 食品マスタ（~30件）+ プリセット種目（6部位 × 5種目）
- [ ] `npx prisma db seed` 実行確認

### 認証（F-01）
- [ ] `lib/auth/config.ts` — NextAuth v5設定（Google OAuth + Credentials）
- [ ] `app/api/auth/[...nextauth]/route.ts`
- [ ] `app/(auth)/register/page.tsx` + Server Action（bcryptjs パスワードハッシュ）
- [ ] `app/(auth)/login/page.tsx`
- [ ] `app/(app)/layout.tsx` — `auth()` でセッションガード → 未認証は `/login` リダイレクト

### レイアウト
- [ ] `app/layout.tsx` — QueryClientProvider + SessionProvider
- [ ] `components/layout/Sidebar.tsx`
- [ ] `components/layout/TopBar.tsx`
- [ ] `components/layout/MobileNav.tsx`
- [ ] `types/index.ts` — 共通型定義

---

## Phase 2 — コア機能実装（Week 3-4）

### 計算ロジック（TDD — テスト先行）
- [ ] `lib/calc/oneRM.ts` — `calcOneRM(weight, reps)`: O'Connor式 `weight * (1 + reps/40)`
- [ ] `lib/calc/oneRM.test.ts` — 100%カバレッジ
- [ ] `lib/calc/cardio.ts` — `calcCardioKcal(mets, weightKg, durationMin)`: `Math.round(mets * weightKg * (durationMin/60))`
- [ ] `lib/calc/cardio.test.ts` — 100%カバレッジ
- [ ] `lib/calc/bmr.ts` — `calcBMR`（ハリス・ベネディクト）/ `calcTDEE`（活動係数補正）/ `calcDailyTarget`（安全マージン±750kcal clamp）
- [ ] `lib/calc/bmr.test.ts` — 100%カバレッジ

### Zodバリデータ
- [ ] `lib/validators/body.ts` — date, weight, bodyFat
- [ ] `lib/validators/meal.ts` — FoodItem, MealItem, MealLog
- [ ] `lib/validators/workout.ts` — ExerciseSet, SessionExercise, WorkoutSession

### 体重管理（F-02, F-03）
- [ ] `app/(app)/body/actions.ts` — `upsertBodyRecord`, `deleteBodyRecord`
- [ ] `app/(app)/body/page.tsx` — Server Component（直近90日取得）
- [ ] `hooks/useBodyRecords.ts` — TanStack Query
- [ ] `components/charts/WeightLineChart.tsx` — `"use client"` / LineChart（実測 + 目標ライン）

### 食事記録（F-04, F-05）
- [ ] `app/(app)/meals/actions.ts` — `createMealLog`, `addMealItem`, `createCustomFoodItem`
- [ ] `app/(app)/meals/page.tsx` — Server Component
- [ ] `hooks/useMealLogs.ts` — TanStack Query
- [ ] `components/meals/FoodItemSearch.tsx` — デバウンス検索
- [ ] `components/meals/MealLogCard.tsx`
- [ ] `components/meals/MacroSummaryBar.tsx`
- [ ] `components/charts/MacroBarChart.tsx` — `"use client"` / 積み上げ棒グラフ（週次対応）

### 筋トレ記録（F-06, F-07, F-08）
- [ ] `stores/workoutDraftStore.ts` — Zustand persist（sessionStorage）
- [ ] `app/(app)/workouts/actions.ts` — `saveWorkoutSession`（Prismaトランザクション）
- [ ] `app/(app)/workouts/page.tsx` — タブ: 今日 / 統計 / 有酸素
- [ ] `hooks/useWorkoutSessions.ts` — TanStack Query
- [ ] `components/workout/WorkoutSessionForm.tsx` — 部位選択 → 種目選択 → セット入力（3ステップ）
- [ ] `components/workout/ExerciseSetRow.tsx` — リアルタイム1RM表示
- [ ] `components/workout/OneRMBadge.tsx` — PR検出（過去最大値と比較）
- [ ] `components/workout/WorkoutStats.tsx` — 累計重量・月次stats・ランキング
- [ ] `components/charts/WorkoutRadarChart.tsx` — `"use client"` / 部位バランスレーダーチャート

### 有酸素記録（F-09）
- [ ] `app/(app)/cardio/actions.ts` — `createCardioLog`（最新体重からkcal自動計算）
- [ ] `app/(app)/cardio/page.tsx`

---

## Phase 3 — 仕上げ・デプロイ（Week 5-6）

### 目標設定（F-10, F-11）
- [ ] `app/(app)/settings/actions.ts` — `upsertGoal`（TDEE計算・保存）, `updateUserProfile`
- [ ] `app/(app)/settings/page.tsx` — プロフィール（身長・性別・生年月日・活動レベル）+ 目標（体重・期限）フォーム

### カレンダー（F-12）
- [ ] `stores/calendarStore.ts` — selectedDate, viewMonth（Zustand）
- [ ] `app/(app)/calendar/page.tsx` — 月別サマリー取得（Server Component）
- [ ] `hooks/useCalendarData.ts` — TanStack Query
- [ ] `components/calendar/CalendarGrid.tsx` — 記録有無をカラードット表示・今日赤枠
- [ ] `components/calendar/DayDetailSheet.tsx` — shadcn Sheet + タブ（体重/食事/筋トレ/有酸素）+ 編集モード

### ダッシュボード（F-13）
- [ ] `app/(app)/page.tsx` — `Promise.all` で並列取得（体重/食事/筋トレ/有酸素/目標）
- [ ] `components/shared/GoalProgressCard.tsx`
- [ ] `components/shared/AISuggestionBanner.tsx` — `"use client"` / ReadableStream ストリーミング
- [ ] `app/api/ai/suggest/route.ts` — 直近7日データ要約 → Claude API（`claude-sonnet-4-20250514`）ストリーム返却
- [ ] `lib/ai/suggest.ts` — Claude API wrapper

### デプロイ（Vercel）
- [ ] `schema.prisma` に `directUrl = env("DIRECT_URL")` 確認
- [ ] Vercel Build Command: `npx prisma migrate deploy && next build`
- [ ] Vercel 環境変数を全て設定
- [ ] 本番スモークテスト（認証・データ保存・グラフ表示）

---

## テスト

### ユニットテスト（Vitest）
- [ ] `npm run test:unit` — calc 全関数パス確認

### E2Eテスト（Playwright）
- [ ] E1: 認証フロー — メール/PW ログイン → ダッシュボード遷移
- [ ] E2: 体重記録 — 入力 → 保存 → グラフ反映
- [ ] E3: 筋トレ記録 — 開始 → 胸 → ベンチプレス → 3セット → 完了 → 今日タブ表示
- [ ] E4: 食事記録 — 食品追加 → 保存 → カロリー収支反映
- [ ] E5: カレンダー — 日付タップ → 詳細シート → 編集 → 保存
