import { describe, expect, it } from "vitest";
import { attemptsToCsv } from "./export";

describe("attemptsToCsv", () => {
  it("writes a header and one row per attempt", () => {
    const csv = attemptsToCsv([
      { kind: "quiz", activityId: "final-assessment", completedAt: "2026-10-27T00:00:00.000Z", correct: 8, total: 10, scorePercent: 80 },
    ]);
    expect(csv).toBe(
      "kind,activityId,completedAt,correct,total,scorePercent,durationMs\nquiz,final-assessment,2026-10-27T00:00:00.000Z,8,10,80,",
    );
  });

  it("escapes quotes and neutralises formula-like cells", () => {
    const csv = attemptsToCsv([
      { kind: "activity", activityId: '=HYPERLINK("x")', completedAt: "2026-10-27T00:00:00.000Z", correct: 0, total: 1, scorePercent: 0 },
    ]);
    expect(csv.split("\n")[1]).toContain(`"'=HYPERLINK(""x"")"`);
  });
});
