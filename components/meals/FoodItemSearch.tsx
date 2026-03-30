"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { searchFoodItems } from "@/apis/meal.client";
import { createMealLog, createCustomFoodItem } from "@/app/(app)/meals/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FoodItem, MealType } from "@prisma/client";

type SelectedItem = {
  foodItem: FoodItem;
  grams: number;
};

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "朝食",
  LUNCH: "昼食",
  DINNER: "夕食",
  SNACK: "間食",
};

// 新規食品登録フォームの入力値
type NewFoodForm = {
  name: string;
  kcalPer100g: string;
  protein: string;
  carbs: string;
  fat: string;
};

export default function FoodItemSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [mealType, setMealType] = useState<MealType>("BREAKFAST");
  // format(new Date(), "yyyy-MM-dd") でローカルタイムゾーンの日付を取得
  // page.tsx と同じ変換方式を使うことで DB の date と一致する
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 新規登録フォームの表示状態
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFood, setNewFood] = useState<NewFoodForm>({
    name: "",
    kcalPer100g: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [newFoodError, setNewFoodError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // 300ms デバウンス
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["food-items", debouncedQuery],
    queryFn: () => searchFoodItems(debouncedQuery),
    enabled: debouncedQuery.length >= 1,
    staleTime: 60 * 1000,
  });

  function handleSelect(foodItem: FoodItem) {
    if (selectedItems.some((i) => i.foodItem.id === foodItem.id)) return;
    setSelectedItems((prev) => [...prev, { foodItem, grams: 100 }]);
    setQuery("");
    setDebouncedQuery("");
    setShowNewForm(false);
  }

  function handleGramsChange(id: string, grams: number) {
    setSelectedItems((prev) =>
      prev.map((i) => (i.foodItem.id === id ? { ...i, grams } : i)),
    );
  }

  function handleRemove(id: string) {
    setSelectedItems((prev) => prev.filter((i) => i.foodItem.id !== id));
  }

  // 新規食品登録フォームを開く（食品名を検索クエリで初期化）
  function handleOpenNewForm() {
    setNewFood({ name: query, kcalPer100g: "", protein: "", carbs: "", fat: "" });
    setNewFoodError(null);
    setShowNewForm(true);
  }

  // 新規食品を登録して selectedItems に追加する
  async function handleCreateFood() {
    const kcal = parseFloat(newFood.kcalPer100g);
    if (!newFood.name.trim()) {
      setNewFoodError("食品名を入力してください");
      return;
    }
    if (isNaN(kcal) || kcal < 0) {
      setNewFoodError("カロリー（100gあたり）を正しく入力してください");
      return;
    }

    setNewFoodError(null);
    setIsCreating(true);

    const result = await createCustomFoodItem({
      name: newFood.name.trim(),
      kcalPer100g: kcal,
      // PFC は未入力なら 0 として登録（validator の default(0) が適用される）
      protein: parseFloat(newFood.protein) || 0,
      carbs: parseFloat(newFood.carbs) || 0,
      fat: parseFloat(newFood.fat) || 0,
    });

    setIsCreating(false);

    if (!result.isSuccess) {
      setNewFoodError(result.errorMessage);
      return;
    }

    // 登録成功 → selectedItems に追加してフォームを閉じる
    handleSelect(result.data);
    setShowNewForm(false);
  }

  async function handleSubmit() {
    if (selectedItems.length === 0) return;
    setServerError(null);
    setIsSubmitting(true);

    const result = await createMealLog({
      date,
      mealType,
      items: selectedItems.map((i) => ({
        foodItemId: i.foodItem.id,
        grams: i.grams,
      })),
    });

    setIsSubmitting(false);

    if (!result.isSuccess) {
      setServerError(result.errorMessage);
      return;
    }

    setSelectedItems([]);
    setQuery("");
    // Server Action 後にページを明示的に再レンダリングする
    // Next.js は Router Cache を自動 invalidate するが、
    // router.refresh() で確実に Server Component を再フェッチさせる
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">食事を追加</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 日付・食事タイプ */}
        <div className="flex gap-3">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1"
          />
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="bg-background rounded-md border px-3 py-2 text-sm"
          >
            {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => (
              <option key={type} value={type}>
                {MEAL_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        {/* 食品名検索 */}
        <div className="relative">
          <Input
            placeholder="食品名を検索（例: 鶏胸肉）"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowNewForm(false);
            }}
          />
          {debouncedQuery.length >= 1 && (
            <div className="bg-background absolute z-10 mt-1 w-full max-h-52 overflow-y-auto rounded-md border shadow-md">
              {isLoading ? (
                <p className="text-muted-foreground p-3 text-sm">検索中...</p>
              ) : searchResults.length === 0 ? (
                // 見つからない場合は新規登録を促す
                <div className="p-3 space-y-2">
                  <p className="text-muted-foreground text-sm">
                    「{debouncedQuery}」は見つかりませんでした
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenNewForm}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    + この食品を新規登録する
                  </button>
                </div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="hover:bg-muted flex w-full justify-between px-3 py-2 text-left text-sm"
                  >
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.kcalPer100g} kcal/100g
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* 新規食品登録フォーム（インライン） */}
        {showNewForm && (
          <div className="rounded-md border p-3 space-y-3 bg-muted/30">
            <p className="text-sm font-medium">新規食品を登録</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground">
                  食品名 <span className="text-destructive">*</span>
                </label>
                <Input
                  value={newFood.name}
                  onChange={(e) =>
                    setNewFood((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="例: バナナ"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  カロリー/100g <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  value={newFood.kcalPer100g}
                  onChange={(e) =>
                    setNewFood((p) => ({ ...p, kcalPer100g: e.target.value }))
                  }
                  placeholder="86"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  タンパク質/100g（任意）
                </label>
                <Input
                  type="number"
                  min={0}
                  value={newFood.protein}
                  onChange={(e) =>
                    setNewFood((p) => ({ ...p, protein: e.target.value }))
                  }
                  placeholder="1.1"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  炭水化物/100g（任意）
                </label>
                <Input
                  type="number"
                  min={0}
                  value={newFood.carbs}
                  onChange={(e) =>
                    setNewFood((p) => ({ ...p, carbs: e.target.value }))
                  }
                  placeholder="22.5"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  脂質/100g（任意）
                </label>
                <Input
                  type="number"
                  min={0}
                  value={newFood.fat}
                  onChange={(e) =>
                    setNewFood((p) => ({ ...p, fat: e.target.value }))
                  }
                  placeholder="0.2"
                />
              </div>
            </div>
            {newFoodError && (
              <p className="text-destructive text-xs">{newFoodError}</p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreateFood}
                disabled={isCreating}
              >
                {isCreating ? "登録中..." : "登録して追加"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNewForm(false)}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}

        {/* 選択済み食品リスト */}
        {selectedItems.length > 0 && (
          <div className="space-y-2">
            {selectedItems.map(({ foodItem, grams }) => {
              const kcal = Math.round((foodItem.kcalPer100g * grams) / 100);
              return (
                <div
                  key={foodItem.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="flex-1 truncate">{foodItem.name}</span>
                  <Input
                    type="number"
                    min={1}
                    value={grams}
                    onChange={(e) =>
                      handleGramsChange(foodItem.id, Number(e.target.value))
                    }
                    className="w-20"
                  />
                  <span className="text-muted-foreground w-16 text-right">
                    {kcal} kcal
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(foodItem.id)}
                    className="text-destructive text-xs hover:opacity-70"
                  >
                    削除
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {serverError && (
          <p className="text-destructive text-sm">{serverError}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={selectedItems.length === 0 || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "保存中..." : "保存"}
        </Button>
      </CardContent>
    </Card>
  );
}
