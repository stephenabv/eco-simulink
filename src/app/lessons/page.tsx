import type { Metadata } from "next";
import Link from "next/link";
import { LESSONS } from "@/data/lessons";
import { PageHeader } from "@/components/shared/page-header";
import { LessonStatus } from "@/components/lessons/lesson-status";

export const metadata: Metadata = { title: "Lessons" };

export default function LessonsPage() {
  return (
    <div>
      <PageHeader title="Lessons" intro="Go in order: each lesson builds on the one before." backHref="/" backLabel="Dashboard" />
      <ol className="space-y-3">
        {LESSONS.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={`/lessons/${lesson.id}/`}
              className="flex items-center gap-4 rounded-3xl border border-forest-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-forest-700 text-xl font-extrabold text-white">
                {lesson.number}
              </span>
              <span className="flex-1">
                <span className="block text-lg font-extrabold text-forest-900">{lesson.title}</span>
                <span className="block text-ink-muted">{lesson.summary}</span>
              </span>
              <LessonStatus lessonId={lesson.id} />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
