"use client";

import { useEffect, useState } from "react";
import { PROGRESS_CATALOG } from "@/data/modules";
import { progressService } from "@/lib/progress/progress-service";
import { summarizeProgress } from "@/lib/progress/summary";
import type { AttemptRecord, ProgressSummary } from "@/types/progress";

export type ProgressState =
  | { readonly status: "loading" }
  | {
      readonly status: "ready";
      readonly summary: ProgressSummary;
      readonly attempts: readonly AttemptRecord[];
      readonly isPersistent: boolean;
    }
  | { readonly status: "error" };

/** Live progress summary; refreshes whenever progress is recorded on this page. */
export function useProgressSummary(): ProgressState {
  const [state, setState] = useState<ProgressState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const repository = await progressService.repository();
        const [lessons, attempts] = await Promise.all([repository.listLessonCompletions(), repository.listAttempts()]);
        if (!cancelled) {
          setState({
            status: "ready",
            summary: summarizeProgress(lessons, attempts, PROGRESS_CATALOG),
            attempts,
            isPersistent: repository.isPersistent,
          });
        }
      } catch (error) {
        console.error("Could not load progress.", error);
        if (!cancelled) setState({ status: "error" });
      }
    };
    void load();
    const unsubscribe = progressService.subscribe(() => void load());
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return state;
}
