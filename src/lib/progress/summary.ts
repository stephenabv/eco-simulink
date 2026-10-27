import type { Achievement, AttemptRecord, LessonCompletion, ProgressSummary } from "@/types/progress";

/**
 * Points and achievement rules. Draft values pending researcher approval;
 * kept here as data so they can change without touching the UI.
 */
export const SCORING_RULES = Object.freeze({
  pointsPerLesson: 10,
  /** An activity is worth up to this many points, based on its best score, so repeating it cannot farm points. */
  maxPointsPerActivity: 10,
  quizPassPercent: 75,
  persistenceAttempts: 3,
});

export interface ProgressCatalog {
  readonly lessonIds: readonly string[];
  readonly quizIds: readonly string[];
}

interface AchievementRule extends Achievement {
  readonly isEarned: (context: AchievementContext) => boolean;
}

interface AchievementContext {
  readonly catalog: ProgressCatalog;
  readonly completedLessons: ReadonlySet<string>;
  readonly bestScores: Readonly<Record<string, number>>;
  readonly attemptCounts: Readonly<Record<string, number>>;
}

export const ACHIEVEMENT_RULES: readonly AchievementRule[] = [
  {
    id: "first-lesson",
    title: "First Steps",
    description: "Finish your first lesson.",
    isEarned: ({ completedLessons }) => completedLessons.size > 0,
  },
  {
    id: "all-lessons",
    title: "Ecosystem Explorer",
    description: "Finish every lesson.",
    isEarned: ({ catalog, completedLessons }) =>
      catalog.lessonIds.length > 0 && catalog.lessonIds.every((id) => completedLessons.has(id)),
  },
  {
    id: "perfect-score",
    title: "Perfect Chain",
    description: "Get every answer right in an activity or quiz.",
    isEarned: ({ bestScores }) => Object.values(bestScores).some((score) => score === 100),
  },
  {
    id: "quiz-pass",
    title: "Energy Expert",
    description: `Score at least ${SCORING_RULES.quizPassPercent}% on a quiz.`,
    isEarned: ({ catalog, bestScores }) =>
      catalog.quizIds.some((id) => (bestScores[id] ?? 0) >= SCORING_RULES.quizPassPercent),
  },
  {
    id: "persistence",
    title: "Never Give Up",
    description: `Try the same activity ${SCORING_RULES.persistenceAttempts} times.`,
    isEarned: ({ attemptCounts }) => Object.values(attemptCounts).some((count) => count >= SCORING_RULES.persistenceAttempts),
  },
];

export function summarizeProgress(
  lessons: readonly LessonCompletion[],
  attempts: readonly AttemptRecord[],
  catalog: ProgressCatalog,
): ProgressSummary {
  const completedLessons = new Set(lessons.map((lesson) => lesson.lessonId));
  const bestScores: Record<string, number> = {};
  const attemptCounts: Record<string, number> = {};
  for (const attempt of attempts) {
    bestScores[attempt.activityId] = Math.max(bestScores[attempt.activityId] ?? 0, attempt.scorePercent);
    attemptCounts[attempt.activityId] = (attemptCounts[attempt.activityId] ?? 0) + 1;
  }

  const activityPoints = Object.values(bestScores).reduce(
    (sum, score) => sum + Math.round((score / 100) * SCORING_RULES.maxPointsPerActivity),
    0,
  );
  const context: AchievementContext = { catalog, completedLessons, bestScores, attemptCounts };

  return {
    completedLessonIds: [...completedLessons].sort(),
    completedActivityIds: Object.keys(attemptCounts).sort(),
    bestScores,
    attemptCounts,
    totalPoints: completedLessons.size * SCORING_RULES.pointsPerLesson + activityPoints,
    achievements: ACHIEVEMENT_RULES.filter((rule) => rule.isEarned(context)).map(({ id, title, description }) => ({
      id,
      title,
      description,
    })),
  };
}
