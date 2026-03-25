"use client";

// Server Component では ssr: false が使えないため、この Client Component でラップする
// BodyRecordForm は useId を内部で使用するため SSR すると hydration mismatch が発生する
import dynamic from "next/dynamic";

const BodyRecordForm = dynamic(
  () => import("./BodyRecordForm"),
  { ssr: false },
);

export function BodyRecordFormClient() {
  return <BodyRecordForm />;
}
