"use client";

import { CheckCircle2 } from "lucide-react";
import { useProgressSummary } from "@/hooks/use-progress";

export function LessonStatus({ lessonId }: { lessonId: string }) {
  const progress = useProgressSummary();
  if (progress.status !== "ready" || !progress.summary.completedLessonIds.includes(lessonId)) return null;
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-forest-700">
      <CheckCircle2 aria-hidden className="size-4" /> Finished
    </span>
  );
}
