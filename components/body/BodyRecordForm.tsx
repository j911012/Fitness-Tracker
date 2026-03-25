"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { bodyRecordSchema, type BodyRecordInput } from "@/lib/validators/body";
import { upsertBodyRecord } from "@/app/(app)/body/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 体重・体脂肪率を入力して保存するフォーム
// react-hook-form + zod でバリデーション、shadcn/ui Form コンポーネントで UI を構成する
export default function BodyRecordForm() {
  // Server Action の汎用エラーメッセージを保持する
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<BodyRecordInput>({
    resolver: zodResolver(bodyRecordSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      weight: undefined,
      bodyFat: undefined,
    },
  });

  async function onSubmit(values: BodyRecordInput) {
    setServerError(null);
    const result = await upsertBodyRecord(values);

    if (!result.isSuccess) {
      // サーバーエラーをフォーム下部に表示する
      setServerError(result.errorMessage);
      return;
    }

    // 保存成功後は今日の日付でフォームをリセット
    form.reset({
      date: new Date().toISOString().split("T")[0],
      weight: undefined,
      bodyFat: undefined,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-sm"
      >
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>日付</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>体重 (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="70.0"
                  {...field}
                  // undefined のままだと uncontrolled になるため空文字にフォールバック
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bodyFat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>体脂肪率 (%) 任意</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="20.0"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : e.target.valueAsNumber,
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* サーバーエラーをフォーム下部に表示 */}
        {serverError && (
          <p className="text-destructive text-sm">{serverError}</p>
        )}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "保存中..." : "保存"}
        </Button>
      </form>
    </Form>
  );
}
