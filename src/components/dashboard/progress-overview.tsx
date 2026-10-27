"use client";

import { Award, BookCheck, Star } from "lucide-react";
import { LESSON_IDS } from "@/data/modules";
import { useProgressSummary } from "@/hooks/use-progress";

export function ProgressOverview() {
  const progress = useProgressSummary();

  if (progress.status === "loading") {
    return <p className="text-ink-muted">Loading your progress…</p>;
  }
  if (progress.status === "error") {
    return <p className="text-danger-600">Your progress could not be loaded. Try refreshing the page.</p>;
  }

  const { summary, isPersistent } = progress;
  const stats = [
    { label: "Lessons finished", value: `${summary.completedLessonIds.length} of ${LESSON_IDS.length}`, Icon: BookCheck },
    { label: "Points", value: String(summary.totalPoints), Icon: Star },
    { label: "Badges", value: String(summary.achievements.length), Icon: Award },
  ];

  return (
    <div>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <Icon aria-hidden className="size-6 shrink-0 text-forest-500" />
            <div>
              <dt className="text-sm text-ink-muted">{label}</dt>
              <dd className="text-xl font-extrabold text-forest-900">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
      {!isPersistent && (
        <p className="mt-3 rounded-2xl bg-earth-100 p-3 text-sm text-earth-700">
          This browser is not letting the app save progress (private browsing may be on). Your work will be lost when you
          close the page.
        </p>
      )}
    </div>
  );
}
