import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { AttemptRecord, LessonCompletion } from "@/types/progress";

/** Persistence port for learning progress; the rest of the app depends only on this interface. */
export interface ProgressRepository {
  /** False when data lives only in memory and will be lost on reload. */
  readonly isPersistent: boolean;
  saveLessonCompletion(completion: LessonCompletion): Promise<void>;
  listLessonCompletions(): Promise<LessonCompletion[]>;
  addAttempt(attempt: AttemptRecord): Promise<AttemptRecord>;
  listAttempts(): Promise<AttemptRecord[]>;
  clear(): Promise<void>;
}

export class ProgressStorageError extends Error {
  override readonly name = "ProgressStorageError";
}

export function validateAttempt(attempt: AttemptRecord): void {
  const { correct, total, scorePercent, activityId, completedAt } = attempt;
  if (activityId.trim() === "") throw new ProgressStorageError("activityId is required");
  if (!Number.isInteger(total) || total < 0) throw new ProgressStorageError("total must be a non-negative integer");
  if (!Number.isInteger(correct) || correct < 0 || correct > total) {
    throw new ProgressStorageError("correct must be an integer between 0 and total");
  }
  if (!(scorePercent >= 0 && scorePercent <= 100)) throw new ProgressStorageError("scorePercent must be 0–100");
  if (Number.isNaN(Date.parse(completedAt))) throw new ProgressStorageError("completedAt must be an ISO date");
}

function validateCompletion(completion: LessonCompletion): void {
  if (completion.lessonId.trim() === "") throw new ProgressStorageError("lessonId is required");
  if (Number.isNaN(Date.parse(completion.completedAt))) throw new ProgressStorageError("completedAt must be an ISO date");
}

export const DATABASE_NAME = "eco-simulink";
/**
 * Bump only with an additive `upgrade` step. Never delete stores in an
 * upgrade: app updates must not erase student progress.
 */
export const DATABASE_VERSION = 1;

interface ProgressSchema extends DBSchema {
  lessonCompletions: { key: string; value: LessonCompletion };
  attempts: { key: number; value: AttemptRecord; indexes: { byActivity: string } };
}

export class IndexedDbProgressRepository implements ProgressRepository {
  readonly isPersistent = true;

  private constructor(private readonly db: IDBPDatabase<ProgressSchema>) {}

  static async open(): Promise<IndexedDbProgressRepository> {
    try {
      const db = await openDB<ProgressSchema>(DATABASE_NAME, DATABASE_VERSION, {
        upgrade(database, oldVersion) {
          if (oldVersion < 1) {
            database.createObjectStore("lessonCompletions", { keyPath: "lessonId" });
            const attempts = database.createObjectStore("attempts", { keyPath: "id", autoIncrement: true });
            attempts.createIndex("byActivity", "activityId");
          }
        },
        // A newer version of the app opened in another tab; close so its upgrade is not blocked.
        blocking(_current, _next, event) {
          (event.target as IDBDatabase).close();
        },
      });
      return new IndexedDbProgressRepository(db);
    } catch (error) {
      throw new ProgressStorageError(`Could not open progress database: ${String(error)}`);
    }
  }

  async saveLessonCompletion(completion: LessonCompletion): Promise<void> {
    validateCompletion(completion);
    const tx = this.db.transaction("lessonCompletions", "readwrite");
    // Keep the first completion time so re-reading a lesson does not overwrite history.
    if (!(await tx.store.get(completion.lessonId))) await tx.store.put(completion);
    await tx.done;
  }

  listLessonCompletions(): Promise<LessonCompletion[]> {
    return this.db.getAll("lessonCompletions");
  }

  async addAttempt(attempt: AttemptRecord): Promise<AttemptRecord> {
    validateAttempt(attempt);
    const { id: _ignored, ...record } = attempt;
    const id = await this.db.add("attempts", record as AttemptRecord);
    return { ...record, id };
  }

  listAttempts(): Promise<AttemptRecord[]> {
    return this.db.getAll("attempts");
  }

  async clear(): Promise<void> {
    const tx = this.db.transaction(["lessonCompletions", "attempts"], "readwrite");
    await Promise.all([tx.objectStore("lessonCompletions").clear(), tx.objectStore("attempts").clear(), tx.done]);
  }
}

/** Fallback when IndexedDB is unavailable (some private-browsing modes); also used in tests. */
export class InMemoryProgressRepository implements ProgressRepository {
  readonly isPersistent = false;
  private readonly lessons = new Map<string, LessonCompletion>();
  private readonly attempts: AttemptRecord[] = [];
  private nextId = 1;

  async saveLessonCompletion(completion: LessonCompletion): Promise<void> {
    validateCompletion(completion);
    if (!this.lessons.has(completion.lessonId)) this.lessons.set(completion.lessonId, { ...completion });
  }

  async listLessonCompletions(): Promise<LessonCompletion[]> {
    return [...this.lessons.values()];
  }

  async addAttempt(attempt: AttemptRecord): Promise<AttemptRecord> {
    validateAttempt(attempt);
    const stored = { ...attempt, id: this.nextId++ };
    this.attempts.push(stored);
    return stored;
  }

  async listAttempts(): Promise<AttemptRecord[]> {
    return this.attempts.map((attempt) => ({ ...attempt }));
  }

  async clear(): Promise<void> {
    this.lessons.clear();
    this.attempts.length = 0;
  }
}

/**
 * Opens the best available repository. Also asks the browser to keep the data
 * through storage pressure, which matters on low-storage phones.
 */
export async function openProgressRepository(): Promise<ProgressRepository> {
  if (typeof indexedDB === "undefined") return new InMemoryProgressRepository();
  try {
    const repository = await IndexedDbProgressRepository.open();
    void navigator.storage?.persist?.().catch(() => undefined);
    return repository;
  } catch (error) {
    console.warn("Progress will not be saved on this device.", error);
    return new InMemoryProgressRepository();
  }
}
