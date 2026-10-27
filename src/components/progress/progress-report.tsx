"use client";

import { Award, CheckCircle2, Circle, Download, Lock, Trash2 } from "lucide-react";
import { useState } from "react";
import { ACTIVITIES } from "@/data/activities";
import { LESSONS } from "@/data/lessons";
import { QUIZ_IDS } from "@/data/modules";
import { useProgressSummary } from "@/hooks/use-progress";
import { attemptsToCsv } from "@/lib/progress/export";
import { progressService } from "@/lib/progress/progress-service";
import { ACHIEVEMENT_RULES } from "@/lib/progress/summary";
import { Button } from "@/components/shared/button";
import { ProgressOverview } from "@/components/dashboard/progress-overview";

const SCORED_ITEMS = [
  ...ACTIVITIES.map((activity) => ({ id: activity.id, title: activity.title })),
  { id: QUIZ_IDS[0], title: "Quiz" },
];

export function ProgressReport() {
  const progress = useProgressSummary();
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (progress.status !== "ready") return <ProgressOverview />;
  const { summary, attempts } = progress;
  const earned = new Set(summary.achievements.map((achievement) => achievement.id));

  const download = () => {
    const blob = new Blob([attemptsToCsv(attempts)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eco-simulink-results-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <ProgressOverview />

      <section aria-labelledby="lessons-progress" className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 id="lessons-progress" className="text-xl font-extrabold text-forest-900">Lessons</h2>
        <ul className="mt-3 space-y-2">
          {LESSONS.map((lesson) => {
            const done = summary.completedLessonIds.includes(lesson.id);
            return (
              <li key={lesson.id} className="flex items-center gap-2">
                {done ? <CheckCircle2 aria-hidden className="size-5 text-forest-700" /> : <Circle aria-hidden className="size-5 text-ink-muted" />}
                <span>Lesson {lesson.number}: {lesson.title}</span>
                <span className="sr-only">{done ? "finished" : "not finished"}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="scores-progress" className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 id="scores-progress" className="text-xl font-extrabold text-forest-900">Activities and quiz</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-forest-100 text-sm text-ink-muted">
                <th scope="col" className="py-2 pr-2">Activity</th>
                <th scope="col" className="py-2 pr-2">Best score</th>
                <th scope="col" className="py-2">Attempts</th>
              </tr>
            </thead>
            <tbody>
              {SCORED_ITEMS.map((item) => (
                <tr key={item.id} className="border-b border-forest-50">
                  <th scope="row" className="py-2 pr-2 font-semibold">{item.title}</th>
                  <td className="py-2 pr-2 tabular-nums">{summary.bestScores[item.id] === undefined ? "Not tried yet" : `${summary.bestScores[item.id]}%`}</td>
                  <td className="py-2 tabular-nums">{summary.attemptCounts[item.id] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="badges-progress" className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 id="badges-progress" className="text-xl font-extrabold text-forest-900">Badges</h2>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENT_RULES.map((rule) => {
            const has = earned.has(rule.id);
            return (
              <li key={rule.id} className={`flex gap-3 rounded-2xl p-3 ${has ? "bg-sun-400/25" : "bg-sand-50"}`}>
                {has ? <Award aria-hidden className="size-7 shrink-0 text-earth-700" /> : <Lock aria-hidden className="size-7 shrink-0 text-ink-muted" />}
                <div>
                  <p className="font-extrabold">{rule.title} <span className="sr-only">{has ? "(earned)" : "(not earned yet)"}</span></p>
                  <p className="text-sm text-ink-muted">{rule.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="data-progress" className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 id="data-progress" className="text-xl font-extrabold text-forest-900">Your saved data</h2>
        <p className="mt-1 text-ink-muted">Everything is saved only on this device. No names are stored.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={download} disabled={attempts.length === 0}>
            <Download aria-hidden className="size-4" /> Download my results (CSV)
          </Button>
          {!confirmingReset ? (
            <Button variant="ghost" onClick={() => setConfirmingReset(true)}>
              <Trash2 aria-hidden className="size-4" /> Erase my progress
            </Button>
          ) : (
            <span className="flex flex-wrap items-center gap-2 rounded-2xl bg-red-50 p-2">
              <span className="font-bold text-danger-600">Erase all progress on this device?</span>
              <Button
                onClick={async () => {
                  await progressService.reset();
                  setConfirmingReset(false);
                }}
                className="bg-danger-600 hover:bg-danger-600/90"
              >
                Yes, erase
              </Button>
              <Button variant="secondary" onClick={() => setConfirmingReset(false)}>
                Cancel
              </Button>
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
