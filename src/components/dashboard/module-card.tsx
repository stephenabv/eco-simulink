import Link from "next/link";
import { BarChart3, BookOpen, FlaskConical, ListChecks, Puzzle, Triangle, type LucideIcon } from "lucide-react";
import type { LearningModule, ModuleIcon } from "@/data/modules";

const ICONS: Record<ModuleIcon, LucideIcon> = {
  book: BookOpen,
  puzzle: Puzzle,
  flask: FlaskConical,
  pyramid: Triangle,
  quiz: ListChecks,
  chart: BarChart3,
};

export function ModuleCard({ module }: { module: LearningModule }) {
  const Icon = ICONS[module.icon];
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="grid size-12 place-items-center rounded-2xl bg-forest-50 text-forest-700">
          <Icon aria-hidden className="size-6" />
        </span>
        <span className="rounded-full bg-earth-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-earth-700">
          {module.stage}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-extrabold text-forest-900">{module.title}</h3>
      <p className="mt-1 text-ink-muted">{module.summary}</p>
      {module.href === null && <p className="mt-3 text-sm font-semibold text-earth-700">Coming soon</p>}
    </>
  );

  const base = "block h-full rounded-3xl border border-forest-100 bg-white p-5 shadow-sm";
  if (module.href === null) {
    return <article className={`${base} opacity-80`}>{body}</article>;
  }
  return (
    <Link href={module.href} className={`${base} transition hover:-translate-y-0.5 hover:shadow-md`}>
      {body}
    </Link>
  );
}
