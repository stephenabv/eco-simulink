import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import type { AttemptRecord } from "@/types/progress";
import {
  InMemoryProgressRepository,
  IndexedDbProgressRepository,
  ProgressStorageError,
  type ProgressRepository,
} from "./progress-repository";

const attempt: AttemptRecord = {
  kind: "activity",
  activityId: "build-food-chain",
  completedAt: "2026-10-27T08:00:00.000Z",
  correct: 4,
  total: 5,
  scorePercent: 80,
};

const implementations: [string, () => Promise<ProgressRepository>][] = [
  ["IndexedDB", () => IndexedDbProgressRepository.open()],
  ["in-memory", async () => new InMemoryProgressRepository()],
];

describe.each(implementations)("%s repository", (_name, open) => {
  let repository: ProgressRepository;

  beforeEach(async () => {
    repository = await open();
    await repository.clear();
  });

  it("stores attempts with generated ids", async () => {
    const first = await repository.addAttempt(attempt);
    const second = await repository.addAttempt({ ...attempt, correct: 5, scorePercent: 100 });
    expect(first.id).toBeDefined();
    expect(second.id).not.toBe(first.id);
    expect(await repository.listAttempts()).toHaveLength(2);
  });

  it("keeps the first lesson completion time", async () => {
    await repository.saveLessonCompletion({ lessonId: "ecosystems", completedAt: "2026-10-01T00:00:00.000Z" });
    await repository.saveLessonCompletion({ lessonId: "ecosystems", completedAt: "2026-10-20T00:00:00.000Z" });
    expect(await repository.listLessonCompletions()).toEqual([
      { lessonId: "ecosystems", completedAt: "2026-10-01T00:00:00.000Z" },
    ]);
  });

  it("rejects invalid records", async () => {
    await expect(repository.addAttempt({ ...attempt, correct: 9 })).rejects.toThrow(ProgressStorageError);
    await expect(repository.addAttempt({ ...attempt, scorePercent: 150 })).rejects.toThrow(ProgressStorageError);
    await expect(repository.addAttempt({ ...attempt, completedAt: "yesterday" })).rejects.toThrow(ProgressStorageError);
    await expect(repository.saveLessonCompletion({ lessonId: " ", completedAt: attempt.completedAt })).rejects.toThrow(
      ProgressStorageError,
    );
  });

  it("clears all data", async () => {
    await repository.addAttempt(attempt);
    await repository.saveLessonCompletion({ lessonId: "energy", completedAt: attempt.completedAt });
    await repository.clear();
    expect(await repository.listAttempts()).toEqual([]);
    expect(await repository.listLessonCompletions()).toEqual([]);
  });
});

describe("IndexedDB persistence", () => {
  it("survives reopening the database (simulates a page reload)", async () => {
    const first = await IndexedDbProgressRepository.open();
    await first.clear();
    await first.addAttempt(attempt);
    const reopened = await IndexedDbProgressRepository.open();
    expect(await reopened.listAttempts()).toHaveLength(1);
  });
});
