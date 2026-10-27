"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useProgressSummary } from "@/hooks/use-progress";
import { progressService } from "@/lib/progress/progress-service";
import { Button } from "@/components/shared/button";

export function CompleteLessonButton({ lessonId }: { lessonId: string }) {
  const progress = useProgressSummary();
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const done = progress.status === "ready" && progress.summary.completedLessonIds.includes(lessonId);

  if (done) {
    return (
      <p className="inline-flex items-center gap-2 font-bold text-forest-700" role="status">
        <CheckCircle2 aria-hidden className="size-5" /> Lesson finished
      </p>
    );
  }

  return (
    <div>
      <Button
        disabled={saving || progress.status === "loading"}
        onClick={async () => {
          setSaving(true);
          try {
            await progressService.completeLesson(lessonId);
            setError(false);
          } catch (cause) {
            console.error("Could not save lesson completion.", cause);
            setError(true);
          } finally {
            setSaving(false);
          }
        }}
      >
        <CheckCircle2 aria-hidden className="size-4" /> I finished this lesson
      </Button>
      {error && <p className="mt-2 text-sm text-danger-600">This could not be saved on this device. Please try again.</p>}
    </div>
  );
}
