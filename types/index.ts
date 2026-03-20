import type {
  User,
  BodyRecord,
  WorkoutSession,
  SessionExercise,
  ExerciseSet,
} from "@prisma/client";

// セット付きの種目
export type SessionExerciseWithSets = SessionExercise & {
  sets: ExerciseSet[];
};

// 種目付きのセッション
export type WorkoutSessionWithExercises = WorkoutSession & {
  exercises: SessionExerciseWithSets[];
};
