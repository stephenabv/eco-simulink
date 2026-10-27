"use client";

import { useEffect, useState } from "react";
import { PROGRESS_CATALOG } from "@/data/modules";
import { openProgressRepository } from "@/lib/storage/progress-repository";
import { summarizeProgress } from "@/lib/progress/summary";
import type { ProgressSummary } from "@/types/progress";

export type ProgressState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly summary: ProgressSummary; readonly isPersistent: boolean }
  | { readonly status: "error" };

export function useProgressSummary(): ProgressState {
  const [state, setState] = useState<ProgressState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const repository = await openProgressRepository();
        const [lessons, attempts] = await Promise.all([repository.listLessonCompletions(), repository.listAttempts()]);
        if (!cancelled) {
          setState({
            status: "ready",
            summary: summarizeProgress(lessons, attempts, PROGRESS_CATALOG),
            isPersistent: repository.isPersistent,
          });
        }
      } catch (error) {
        console.error("Could not load progress.", error);
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
