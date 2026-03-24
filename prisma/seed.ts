import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const presetExercises = [
  // 胸
  { name: "ベンチプレス", muscleGroup: "胸" },
  { name: "インクラインベンチプレス", muscleGroup: "胸" },
  { name: "ダンベルフライ", muscleGroup: "胸" },
  { name: "ディップス", muscleGroup: "胸" },
  { name: "ケーブルクロスオーバー", muscleGroup: "胸" },
  // 背中
  { name: "デッドリフト", muscleGroup: "背中" },
  { name: "懸垂", muscleGroup: "背中" },
  { name: "ベントオーバーロウ", muscleGroup: "背中" },
  { name: "ラットプルダウン", muscleGroup: "背中" },
  { name: "シーテッドロウ", muscleGroup: "背中" },
  // 脚
  { name: "スクワット", muscleGroup: "脚" },
  { name: "レッグプレス", muscleGroup: "脚" },
  { name: "ルーマニアンデッドリフト", muscleGroup: "脚" },
  { name: "レッグカール", muscleGroup: "脚" },
  { name: "カーフレイズ", muscleGroup: "脚" },
  // 肩
  { name: "ショルダープレス", muscleGroup: "肩" },
  { name: "サイドレイズ", muscleGroup: "肩" },
  { name: "フロントレイズ", muscleGroup: "肩" },
  { name: "フェイスプル", muscleGroup: "肩" },
  { name: "アーノルドプレス", muscleGroup: "肩" },
  // 腕
  { name: "バーベルカール", muscleGroup: "腕" },
  { name: "ハンマーカール", muscleGroup: "腕" },
  { name: "トライセプスプレスダウン", muscleGroup: "腕" },
  { name: "スカルクラッシャー", muscleGroup: "腕" },
  { name: "コンセントレーションカール", muscleGroup: "腕" },
  // 腹
  { name: "クランチ", muscleGroup: "腹" },
  { name: "レッグレイズ", muscleGroup: "腹" },
  { name: "プランク", muscleGroup: "腹" },
  { name: "ロシアンツイスト", muscleGroup: "腹" },
  { name: "アブローラー", muscleGroup: "腹" },
];

async function main() {
  // テスト用ユーザー（認証実装前の仮ユーザー）
  await prisma.user.upsert({
    where: { id: "temp-user-001" },
    update: {},
    create: {
      id: "temp-user-001",
      email: "temp@example.com",
      name: "テストユーザー",
    },
  });
  console.log("Temp user seeded.");

  console.log("Seeding preset exercises...");

  for (const exercise of presetExercises) {
    const id = `preset-${exercise.muscleGroup}-${exercise.name}`;
    await prisma.customExercise.upsert({
      where: { id },
      update: {},
      create: {
        id,
        userId: null,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
      },
    });
  }

  console.log("Done! 30 preset exercises seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
