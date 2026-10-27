import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Lightbulb } from "lucide-react";
import { LESSONS, getLesson } from "@/data/lessons";
import { ButtonLink } from "@/components/shared/button";
import { PageHeader } from "@/components/shared/page-header";
import { CompleteLessonButton } from "@/components/lessons/complete-lesson-button";
import { LessonVisualView } from "@/components/lessons/lesson-visuals";

export const dynamicParams = false;

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ lessonId: lesson.id }));
}

export async function generateMetadata({ params }: PageProps<"/lessons/[lessonId]">): Promise<Metadata> {
  const { lessonId } = await params;
  return { title: getLesson(lessonId)?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: PageProps<"/lessons/[lessonId]">) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  const next = LESSONS.find((candidate) => candidate.number === lesson.number + 1);

  return (
    <article>
      <PageHeader
        eyebrow={`Lesson ${lesson.number} of ${LESSONS.length}`}
        title={lesson.title}
        intro={lesson.summary}
        backHref="/lessons/"
        backLabel="All lessons"
      />
      <div className="space-y-6">
        {lesson.sections.map((section) => (
          <section key={section.heading} className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-extrabold text-forest-900">{section.heading}</h2>
            <div className="mt-2 max-w-3xl space-y-2 text-lg">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {section.visual && (
              <div className="mt-4">
                <LessonVisualView visual={section.visual} />
              </div>
            )}
          </section>
        ))}

        <section aria-labelledby="key-points" className="rounded-3xl bg-sun-400/20 p-5 sm:p-6">
          <h2 id="key-points" className="flex items-center gap-2 text-2xl font-extrabold text-forest-900">
            <Lightbulb aria-hidden className="size-6" /> Remember
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-lg">
            {lesson.keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <CompleteLessonButton lessonId={lesson.id} />
          {lesson.practice && (
            <ButtonLink href={lesson.practice.href} variant="secondary">
              {lesson.practice.label}
            </ButtonLink>
          )}
          {next && (
            <ButtonLink href={`/lessons/${next.id}/`} variant="ghost">
              Next: {next.title} <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          )}
        </div>
      </div>
    </article>
  );
}
