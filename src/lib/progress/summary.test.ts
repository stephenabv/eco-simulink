import { describe, expect, it } from "vitest";
import type { AttemptRecord } from "@/types/progress";
import { summarizeProgress } from "./summary";

const catalog = { lessonIds: ["l1", "l2"], quizIds: ["final-quiz"] };
const at = "2026-10-27T00:00:00.000Z";

function attempt(activityId: string, scorePercent: number): AttemptRecord {
  return { kind: activityId.includes("quiz") ? "quiz" : "activity", activityId, completedAt: at, correct: 0, total: 0, scorePercent };
}

describe("summarizeProgress", () => {
  it("is empty for a new student", () => {
    expect(summarizeProgress([], [], catalog)).toMatchObject({ totalPoints: 0, achievements: [], completedLessonIds: [] });
  });

  it("awards points from lessons and best activity scores only", () => {
    const summary = summarizeProgress(
      [{ lessonId: "l1", completedAt: at }],
      [attempt("chain", 40), attempt("chain", 80), attempt("chain", 60)],
      catalog,
    );
    expect(summary.totalPoints).toBe(10 + 8);
    expect(summary.bestScores).toEqual({ chain: 80 });
    expect(summary.attemptCounts).toEqual({ chain: 3 });
    expect(summary.achievements.map((a) => a.id)).toEqual(["first-lesson", "persistence"]);
  });

  it("awards completion, perfect-score and quiz achievements", () => {
    const summary = summarizeProgress(
      [
        { lessonId: "l1", completedAt: at },
        { lessonId: "l2", completedAt: at },
      ],
      [attempt("final-quiz", 100)],
      catalog,
    );
    expect(summary.achievements.map((a) => a.id)).toEqual(["first-lesson", "all-lessons", "perfect-score", "quiz-pass"]);
  });
});
