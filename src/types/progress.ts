/**
 * Locally stored learning records. No personally identifiable information is
 * stored: records are tied to the device/browser, not to a named student.
 */

export type AttemptKind = "activity" | "quiz";

export interface LessonCompletion {
  readonly lessonId: string;
  /** ISO 8601 timestamp. */
  readonly completedAt: string;
}

export interface AttemptRecord {
  /** Assigned by storage. */
  readonly id?: number;
  readonly kind: AttemptKind;
  /** Activity or quiz identifier. */
  readonly activityId: string;
  readonly completedAt: string;
  readonly correct: number;
  readonly total: number;
  readonly scorePercent: number;
  /** Elapsed time, when measured. */
  readonly durationMs?: number;
}

export interface Achievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

export interface ProgressSummary {
  readonly completedLessonIds: readonly string[];
  readonly completedActivityIds: readonly string[];
  /** Best score per activity or quiz id. */
  readonly bestScores: Readonly<Record<string, number>>;
  readonly attemptCounts: Readonly<Record<string, number>>;
  readonly totalPoints: number;
  readonly achievements: readonly Achievement[];
}
