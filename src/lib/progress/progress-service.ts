import { openProgressRepository, type ProgressRepository } from "@/lib/storage/progress-repository";
import type { AttemptKind, AttemptRecord } from "@/types/progress";

type Listener = () => void;

/**
 * Application-facing progress API. Opens storage once per page, records
 * results with consistent timestamps, and notifies subscribers (e.g. the
 * dashboard) so they refresh after a change.
 */
export class ProgressService {
  private repositoryPromise: Promise<ProgressRepository> | null = null;
  private readonly listeners = new Set<Listener>();

  constructor(private readonly open: () => Promise<ProgressRepository> = openProgressRepository) {}

  repository(): Promise<ProgressRepository> {
    this.repositoryPromise ??= this.open();
    return this.repositoryPromise;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async completeLesson(lessonId: string): Promise<void> {
    const repository = await this.repository();
    await repository.saveLessonCompletion({ lessonId, completedAt: new Date().toISOString() });
    this.notify();
  }

  async recordAttempt(
    kind: AttemptKind,
    activityId: string,
    result: { correct: number; total: number; durationMs?: number },
  ): Promise<AttemptRecord> {
    const repository = await this.repository();
    const scorePercent = result.total === 0 ? 0 : Math.round((result.correct / result.total) * 100);
    const stored = await repository.addAttempt({
      kind,
      activityId,
      completedAt: new Date().toISOString(),
      correct: result.correct,
      total: result.total,
      scorePercent,
      ...(result.durationMs === undefined ? {} : { durationMs: Math.round(result.durationMs) }),
    });
    this.notify();
    return stored;
  }

  async reset(): Promise<void> {
    const repository = await this.repository();
    await repository.clear();
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const progressService = new ProgressService();
