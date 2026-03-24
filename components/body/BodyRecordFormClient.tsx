"use client";

import dynamic from "next/dynamic";

const BodyRecordForm = dynamic(
  () => import("./BodyRecordForm").then((m) => m.BodyRecordForm),
  { ssr: false },
);

export function BodyRecordFormClient() {
  return <BodyRecordForm />;
}
