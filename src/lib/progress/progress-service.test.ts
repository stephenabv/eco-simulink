import { describe, expect, it, vi } from "vitest";
import { InMemoryProgressRepository } from "@/lib/storage/progress-repository";
import { ProgressService } from "./progress-service";

describe("ProgressService", () => {
  it("opens storage once and computes the score", async () => {
    const open = vi.fn(async () => new InMemoryProgressRepository());
    const service = new ProgressService(open);
    const stored = await service.recordAttempt("activity", "food-chain", { correct: 3, total: 4 });
    await service.completeLesson("energy-flow");
    expect(open).toHaveBeenCalledTimes(1);
    expect(stored.scorePercent).toBe(75);
  });

  it("notifies subscribers after changes and stops after unsubscribe", async () => {
    const service = new ProgressService(async () => new InMemoryProgressRepository());
    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);
    await service.completeLesson("food-chains-and-webs");
    unsubscribe();
    await service.reset();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
